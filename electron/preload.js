const { contextBridge, ipcRenderer } = require('electron')

// Güvenli API'yi expose et
try {
  console.log('Preload script yükleniyor...')
  contextBridge.exposeInMainWorld('electronAPI', {
    // Firma işlemleri
    getCompanies: () => ipcRenderer.invoke('get-companies'),
    saveCompanies: (companies) => ipcRenderer.invoke('save-companies', companies),

    // Dosya işlemleri
    selectFile: () => ipcRenderer.invoke('select-file'),
    openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),

    // Export/Import işlemleri
    exportCompaniesJson: (companyId) => ipcRenderer.invoke('export-companies-json', companyId),
    exportCompaniesZip: (companyId) => ipcRenderer.invoke('export-companies-zip', companyId),
    exportAllCompaniesWithAttachments: () => ipcRenderer.invoke('exportAllCompaniesWithAttachments'),
    importCompanies: () => ipcRenderer.invoke('import-companies'),

    // Platform bilgisi
    platform: process.platform
  })
  
  console.log('Electron API başarıyla yüklendi')
} catch (error) {
  console.error('Electron API yüklenirken hata:', error)
}
