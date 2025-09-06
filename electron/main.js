import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { fileURLToPath } from 'node:url'
import { dirname, join, basename } from 'node:path'
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import JSZip from 'jszip'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const readFileAsync = fsPromises.readFile
const writeFileAsync = fsPromises.writeFile

const DATA_FILE = join(process.cwd(), 'data', 'companies.json')

// Veri dosyasını oluştur
const ensureDataFile = async () => {
  const dataDir = join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    await fsPromises.mkdir(dataDir, { recursive: true })
  }

  if (!fs.existsSync(DATA_FILE)) {
    await writeFileAsync(DATA_FILE, JSON.stringify({ companies: [] }, null, 2))
  }
}

let mainWindow

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
      enableRemoteModule: false
    },
    icon: join(__dirname, '..', 'assets', 'icon.png'),
    titleBarStyle: 'default',
    show: false
  })

  // Geliştirme modunda Vite dev server'ı kullan
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

  if (isDev) {
    // Vite dev server'ı kullan
    const startUrl = 'http://localhost:5173'
    console.log('Vite dev server kullanılıyor:', startUrl)

    mainWindow.loadURL(startUrl)
    mainWindow.webContents.openDevTools()

    // DOM hazır olduğunda kontrol et
    mainWindow.webContents.once('dom-ready', () => {
      console.log('DOM hazır, React uygulaması yükleniyor...')
    })
  } else {
    mainWindow.loadFile(join(__dirname, '..', 'dist', 'index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(async () => {
  await ensureDataFile()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC Handlers
ipcMain.handle('get-companies', async () => {
  try {
    const data = await readFileAsync(DATA_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading companies:', error)
    return { companies: [] }
  }
})

ipcMain.handle('save-companies', async (event, companies) => {
  try {
    await writeFileAsync(DATA_FILE, JSON.stringify({ companies }, null, 2))
    return { success: true }
  } catch (error) {
    console.error('Error saving companies:', error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle('select-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Tüm Dosyalar', extensions: ['*'] },
      { name: 'PDF', extensions: ['pdf'] },
      { name: 'Resimler', extensions: ['jpg', 'jpeg', 'png', 'gif'] },
      { name: 'Word', extensions: ['doc', 'docx'] },
      { name: 'Excel', extensions: ['xls', 'xlsx'] }
    ]
  })

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

ipcMain.handle('open-file', async (event, filePath) => {
  const { shell } = await import('electron')
  try {
    await shell.openPath(filePath)
    return { success: true }
  } catch (error) {
    console.error('Error opening file:', error)
    return { success: false, error: error.message }
  }
})

// Export Companies as JSON
ipcMain.handle('export-companies-json', async (event, selectedCompanyId) => {
  try {
    const data = await readFileAsync(DATA_FILE, 'utf8')
    const companiesData = JSON.parse(data)

    let exportData;
    let selectedCompany = null;
    if (selectedCompanyId) {
      // Sadece seçili firmayı export et
      selectedCompany = companiesData.companies.find(c => c.id === selectedCompanyId)
      if (!selectedCompany) {
        return { success: false, error: 'Firma bulunamadı' }
      }
      exportData = { companies: [selectedCompany] }
    } else {
      // Tüm firmaları export et
      exportData = companiesData
    }

    const defaultFileName = selectedCompany ? `${selectedCompany.name.replace(/[^a-zA-Z0-9-_]/g, '_')}.json` : 'companies_export.json'
    const result = await dialog.showSaveDialog(mainWindow, {
      title: selectedCompanyId ? 'COFIY - Firmayı JSON olarak kaydet' : 'COFIY - Firmaları JSON olarak kaydet',
      defaultPath: defaultFileName,
      filters: [
        { name: 'JSON Dosyaları', extensions: ['json'] },
        { name: 'Tüm Dosyalar', extensions: ['*'] }
      ]
    })

    if (!result.canceled && result.filePath) {
      await writeFileAsync(result.filePath, JSON.stringify(exportData, null, 2))
      return { success: true, filePath: result.filePath }
    }
    return { success: false, message: 'Kaydetme iptal edildi' }
  } catch (error) {
    console.error('Error exporting companies JSON:', error)
    return { success: false, error: error.message }
  }
})

// Export Companies as ZIP (with attachments)
ipcMain.handle('export-companies-zip', async (event, selectedCompanyId) => {
  try {
    console.log('Export ZIP called with companyId:', selectedCompanyId)
    const data = await readFileAsync(DATA_FILE, 'utf8')
    const companiesData = JSON.parse(data)

    let companiesToExport;
    if (selectedCompanyId) {
      console.log('Exporting single company with ID:', selectedCompanyId)
      // Sadece seçili firmayı export et
      const selectedCompany = companiesData.companies.find(c => c.id === selectedCompanyId)
      if (!selectedCompany) {
        console.log('Company not found with ID:', selectedCompanyId)
        return { success: false, error: 'Firma bulunamadı' }
      }
      companiesToExport = [selectedCompany]
      console.log('Found company:', selectedCompany.name)
    } else {
      console.log('Exporting all companies')
      // Tüm firmaları export et
      companiesToExport = companiesData.companies
    }

    console.log('Companies to export count:', companiesToExport.length)

    // Deep clone companies to avoid modifying original data
    const exportData = {
      companies: JSON.parse(JSON.stringify(companiesToExport))
    }
    const defaultFileName = selectedCompanyId && companiesToExport.length === 1
      ? `${companiesToExport[0].name.replace(/[^a-zA-Z0-9-_]/g, '_')}.zip`
      : 'companies_export.zip'

    const result = await dialog.showSaveDialog(mainWindow, {
      title: selectedCompanyId ? 'COFIY - Firmayı ZIP olarak kaydet' : 'COFIY - Firmaları ZIP olarak kaydet',
      defaultPath: defaultFileName,
      filters: [
        { name: 'ZIP Dosyaları', extensions: ['zip'] },
        { name: 'Tüm Dosyalar', extensions: ['*'] }
      ]
    })

    if (result.canceled || !result.filePath) {
      return { success: false, message: 'Kaydetme iptal edildi' }
    }

    const zip = new JSZip()

    // Add attachments first to update paths
    const attachmentsFolder = zip.folder('attachments')

    for (const company of exportData.companies) {
      if (company.notes) {
        for (const note of company.notes) {
          if (note.attachments) {
            for (const attachment of note.attachments) {
              try {
                let attachmentPath = attachment.filePath
                let fileFound = false

                // Önce mevcut filePath'i dene
                if (fs.existsSync(attachmentPath)) {
                  fileFound = true
                } else if (attachment.originalPath && fs.existsSync(attachment.originalPath)) {
                  // Orijinal path'i dene
                  attachmentPath = attachment.originalPath
                  fileFound = true
                }

                if (fileFound) {
                  const fileData = await readFileAsync(attachmentPath)
                  const fileName = `${company.id}_${note.id}_${basename(attachmentPath)}`
                  attachmentsFolder.file(fileName, fileData)

                  // Update attachment path in the exported data - use relative path for portability
                  attachment.originalPath = attachmentPath
                  attachment.filePath = `attachments/${fileName}` // Relative path inside ZIP
                  attachment.exportedFileName = fileName
                  console.log(`Attachment added: ${fileName}`)
                } else {
                  console.warn(`Attachment file not found: ${attachment.filePath} or ${attachment.originalPath || 'no original path'}`)
                }
              } catch (error) {
                console.warn(`Could not read attachment ${attachment.filePath}:`, error)
              }
            }
          }
        }
      }
    }

    // Add companies data with updated paths
    zip.file('companies.json', JSON.stringify(exportData, null, 2))

    // Generate ZIP file
    const zipContent = await zip.generateAsync({ type: 'nodebuffer' })
    await writeFileAsync(result.filePath, zipContent)

    return { success: true, filePath: result.filePath }
  } catch (error) {
    console.error('Error exporting companies ZIP:', error)
    return { success: false, error: error.message }
  }
})

// Import Companies
ipcMain.handle('import-companies', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'COFIY - Firma verilerini içe aktar',
      properties: ['openFile'],
      filters: [
        { name: 'JSON Dosyaları', extensions: ['json'] },
        { name: 'ZIP Dosyaları', extensions: ['zip'] },
        { name: 'Tüm Dosyalar', extensions: ['*'] }
      ]
    })

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, message: 'İçe aktarma iptal edildi' }
    }

    const importFilePath = result.filePaths[0]
    const importDir = path.dirname(importFilePath) // ZIP dosyasının bulunduğu klasör

    console.log('=== IMPORT DEBUG ===')
    console.log('Import file path:', importFilePath)
    console.log('Import directory:', importDir)
    const fileExtension = importFilePath.split('.').pop().toLowerCase()

    if (fileExtension === 'json') {
      // Import JSON file
      const data = await readFileAsync(importFilePath, 'utf8')
      const importedData = JSON.parse(data)

      // Validate data structure
      if (!importedData.companies || !Array.isArray(importedData.companies)) {
        return { success: false, error: 'Geçersiz dosya formatı' }
      }

      // JSON import için attachment path'lerini güncelle
      console.log('=== JSON IMPORT ATTACHMENT PATH UPDATE ===')
      const attachmentsDir = path.join(importDir, 'attachments')

      for (const company of importedData.companies) {
        if (company.notes) {
          for (const note of company.notes) {
            if (note.attachments) {
              for (const attachment of note.attachments) {
                const oldPath = attachment.filePath
                const fileName = path.basename(oldPath)
                const newPath = path.join(attachmentsDir, fileName)

                console.log(`Attachment path update: ${oldPath} -> ${newPath}`)

                // Eski path'ten yeni path'e kopyala
                try {
                  if (fs.existsSync(oldPath)) {
                    // Dosyayı yeni konuma kopyala
                    fs.copyFileSync(oldPath, newPath)
                    console.log(`File copied: ${oldPath} -> ${newPath}`)
                  } else {
                    console.warn(`Source file not found: ${oldPath}`)
                  }
                } catch (error) {
                  console.warn(`Could not copy attachment ${oldPath}:`, error)
                }

                // Path'i güncelle
                attachment.filePath = newPath
                if (!attachment.originalPath) {
                  attachment.originalPath = oldPath
                }
              }
            }
          }
        }
      }

      return { success: true, data: importedData, type: 'json' }
    } else if (fileExtension === 'zip') {
      // Import ZIP file
      const zipData = await readFileAsync(importFilePath)
      const zip = await JSZip.loadAsync(zipData)

      // Check if companies.json exists
      const companiesJson = zip.file('companies.json')
      if (!companiesJson) {
        return { success: false, error: 'ZIP dosyasında companies.json bulunamadı' }
      }

      const companiesData = await companiesJson.async('text')
      const importedData = JSON.parse(companiesData)

      // Extract attachments if they exist
      const attachments = []

      // Import klasöründeki attachments klasörünü kullan
      const attachmentsBaseDir = path.join(importDir, 'attachments')
      if (!fs.existsSync(attachmentsBaseDir)) {
        fs.mkdirSync(attachmentsBaseDir, { recursive: true })
      }

      // Extract attachments from ZIP
      zip.forEach((relativePath, file) => {
        if (relativePath.startsWith('attachments/') && !file.dir) {
          console.log(`Found attachment in ZIP: ${relativePath}`)
          attachments.push({
            relativePath,
            file: file
          })
        }
      })

   
   console.log(`Total attachments found in ZIP: ${attachments.length}`)
      // Save attachments to company-specific directories
      for (const attachment of attachments) {
        try {
          const fileData = await attachment.file.async('nodebuffer')
          const fileName = path.basename(attachment.relativePath)

          // Dosyayı doğrudan attachments klasörüne çıkar
          const finalFilePath = path.join(attachmentsBaseDir, fileName)
          await writeFileAsync(finalFilePath, fileData)

          // Find and update the corresponding attachment in imported data
          for (const company of importedData.companies) {
            if (company.notes) {
              for (const note of company.notes) {
                if (note.attachments) {
                  for (const noteAttachment of note.attachments) {
                    if (noteAttachment.exportedFileName === fileName) {
                      console.log(`BEFORE: filePath = ${noteAttachment.filePath}`)
                      // Orijinal path'i sakla (tekrar export için)
                      if (!noteAttachment.originalPath) {
                        noteAttachment.originalPath = noteAttachment.filePath
                      }
                      noteAttachment.filePath = finalFilePath
                      noteAttachment.importedFromZip = true
                      console.log(`AFTER: filePath = ${noteAttachment.filePath}`)
                      console.log(`Attachment imported: ${fileName} -> ${path.relative(process.cwd(), finalFilePath)}`)
                    }
                  }
                }
              }
            }
          }
        } catch (error) {
          console.warn(`Could not extract attachment ${attachment.relativePath}:`, error)
        }
      }

      // Debug: Import sonrası attachment path'lerini kontrol et
      console.log('=== IMPORT SONRASI VERİ KONTROLÜ ===')
      importedData.companies.forEach(company => {
        if (company.notes) {
          company.notes.forEach(note => {
            if (note.attachments) {
              note.attachments.forEach(att => {
                console.log(`Company: ${company.name}, Note: ${note.title}, Attachment filePath: ${att.filePath}`)
              })
            }
          })
        }
      })

      return {
        success: true,
        data: importedData,
        type: 'zip',
        attachments: attachments,
        attachmentsDir: attachmentsBaseDir
      }
    } else {
      return { success: false, error: 'Desteklenmeyen dosya formatı' }
    }
  } catch (error) {
    console.error('Error importing companies:', error)
    return { success: false, error: error.message }
  }
})

// Export all companies with attachments as a single ZIP
ipcMain.handle('exportAllCompaniesWithAttachments', async (event) => {
  console.log('Export function called!')
  try {
    const companiesFilePath = DATA_FILE
    console.log('Companies file path:', companiesFilePath)
    console.log('Current working directory:', process.cwd())
    console.log('File exists:', fs.existsSync(companiesFilePath))

    if (!fs.existsSync(companiesFilePath)) {
      console.log('Data directory contents:', fs.readdirSync(join(process.cwd(), 'data')))
      return { success: false, error: 'Firma verisi bulunamadı' }
    }

    const companiesData = JSON.parse(await readFileAsync(companiesFilePath, 'utf8'))
    const companies = companiesData.companies || []

    if (companies.length === 0) {
      return { success: false, error: 'Dışa aktarılacak firma bulunamadı' }
    }

    // Ana ZIP dosyası oluştur
    const mainZip = new JSZip()

    // Her firma için ayrı ZIP oluştur ve ana ZIP'e ekle
    for (const company of companies) {
      const companyZip = new JSZip()

      // Firma verilerini JSON olarak ekle
      const companyData = {
        name: company.name,
        notes: company.notes || [],
        createdAt: company.createdAt,
        updatedAt: company.updatedAt
      }
      companyZip.file('company.json', JSON.stringify(companyData, null, 2))

      // Firma notlarındaki ekleri işle
      if (company.notes) {
        for (const note of company.notes) {
          if (note.attachments) {
            for (const attachment of note.attachments) {
              try {
                const attachmentPath = attachment.filePath
                if (fs.existsSync(attachmentPath)) {
                  const attachmentData = await readFileAsync(attachmentPath)
                  companyZip.file(`attachments/${attachment.fileName}`, attachmentData)
                }
              } catch (error) {
                console.warn(`Ek atlanıyor: ${attachment.fileName}`, error.message)
              }
            }
          }
        }
      }

      // Firma ZIP'ini ana ZIP'e ekle (firma adı ile)
      const companyZipData = await companyZip.generateAsync({ type: 'uint8array' })
      const safeFileName = company.name.replace(/[^a-zA-Z0-9-_]/g, '_')
      mainZip.file(`${safeFileName}.zip`, companyZipData)
    }

    // Ana ZIP'i oluştur
    const zipData = await mainZip.generateAsync({ type: 'uint8array' })

    // Dosya kaydetme dialog'u
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'COFIY - Tüm Firmaları ZIP olarak kaydet',
      defaultPath: 'all_companies_export.zip',
      filters: [
        { name: 'ZIP Dosyaları', extensions: ['zip'] },
        { name: 'Tüm Dosyalar', extensions: ['*'] }
      ]
    })

    if (result.canceled || !result.filePath) {
      return { success: false, error: 'Kaydetme iptal edildi' }
    }

    // ZIP dosyasını kaydet
    await writeFileAsync(result.filePath, zipData)

    return {
      success: true,
      filePath: result.filePath,
      message: `${companies.length} firma başarıyla dışa aktarıldı`
    }

  } catch (error) {
    console.error('Error exporting all companies:', error)
    return { success: false, error: error.message }
  }
})