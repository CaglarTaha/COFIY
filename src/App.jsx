import React, { useState, useEffect } from 'react'
import CompanyList from './components/CompanyList'
import CompanyForm from './components/CompanyForm'
import NoteList from './components/NoteList'
import NoteForm from './components/NoteForm'
import Header from './components/Header'
import { Plus, Building2, StickyNote, FileText, ArrowLeft, Settings, Upload, Filter, Grid, List, X, Package, Search } from 'lucide-react'

function App() {
  const [companies, setCompanies] = useState([])
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  // Uygulama başladığında firmaları yükle
  useEffect(() => {
    // Electron API'nin yüklenmesini bekle
    const checkElectronAPI = () => {
      if (window.electronAPI) {
        loadCompanies()
      } else {
        setTimeout(checkElectronAPI, 500)
      }
    }

    checkElectronAPI()
  }, [])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      if (!window.electronAPI) {
        console.error('Electron API bulunamadı')
        return
      }
      const data = await window.electronAPI.getCompanies()
      setCompanies(data.companies || [])
    } catch (error) {
      console.error('Firmalar yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveCompanies = async (updatedCompanies) => {
    try {
      if (!window.electronAPI) {
        console.error('Electron API bulunamadı')
        return false
      }
      const result = await window.electronAPI.saveCompanies(updatedCompanies)
      if (result.success) {
        setCompanies(updatedCompanies)
        return true
      } else {
        console.error('Firmalar kaydedilirken hata:', result.error)
        return false
      }
    } catch (error) {
      console.error('Firmalar kaydedilirken hata:', error)
      return false
    }
  }

  const handleAddCompany = () => {
    setSelectedCompany(null)
    setShowForm(true)
  }

  const handleEditCompany = (company) => {
    setSelectedCompany(company)
    setShowForm(true)
  }

  const handleDeleteCompany = async (companyId) => {
    if (window.confirm('Bu firmayı silmek istediğinizden emin misiniz?')) {
      const updatedCompanies = companies.filter(c => c.id !== companyId)
      const success = await saveCompanies(updatedCompanies)
      if (success) {
        setSelectedCompany(null)
      }
    }
  }

  const handleSaveCompany = async (companyData) => {
    let updatedCompanies
    if (selectedCompany) {
      // Güncelleme
      updatedCompanies = companies.map(c => 
        c.id === selectedCompany.id ? { ...companyData, id: selectedCompany.id } : c
      )
    } else {
      // Yeni ekleme
      const newCompany = {
        ...companyData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      }
      updatedCompanies = [...companies, newCompany]
    }

    const success = await saveCompanies(updatedCompanies)
    if (success) {
      setShowForm(false)
      setSelectedCompany(null)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setSelectedCompany(null)
  }

  const handleAddNote = () => {
    setSelectedNote(null)
    setShowNoteForm(true)
  }

  const handleEditNote = (note) => {
    setSelectedNote(note)
    setShowNoteForm(true)
  }

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Bu notu silmek istediğinizden emin misiniz?')) {
      const updatedCompanies = companies.map(company => {
        if (company.id === selectedCompany.id) {
          return {
            ...company,
            notes: company.notes.filter(note => note.id !== noteId)
          }
        }
        return company
      })
      
      const success = await saveCompanies(updatedCompanies)
      if (success) {
        setSelectedCompany(updatedCompanies.find(c => c.id === selectedCompany.id))
      }
    }
  }

  const handleSaveNote = async (noteData) => {
    let updatedNotes
    if (selectedNote) {
      // Güncelleme
      updatedNotes = selectedCompany.notes.map(n => 
        n.id === selectedNote.id ? { ...noteData, id: selectedNote.id, updatedAt: new Date().toISOString() } : n
      )
    } else {
      // Yeni ekleme
      const newNote = {
        ...noteData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      }
      updatedNotes = [...(selectedCompany.notes || []), newNote]
    }

    const updatedCompanies = companies.map(company => {
      if (company.id === selectedCompany.id) {
        return {
          ...company,
          notes: updatedNotes
        }
      }
      return company
    })

    const success = await saveCompanies(updatedCompanies)
    if (success) {
      setSelectedCompany(updatedCompanies.find(c => c.id === selectedCompany.id))
      setShowNoteForm(false)
      setSelectedNote(null)
    }
  }

  const handleCloseNoteForm = () => {
    setShowNoteForm(false)
    setSelectedNote(null)
  }

  const handleOpenAttachment = (attachment) => {
    if (window.electronAPI) {
      window.electronAPI.openFile(attachment.filePath)
    } else {
      console.error('Electron API bulunamadı')
    }
  }

  const handleSearch = (query) => {
    if (!query.trim()) return

    setIsSearching(true)
    const results = []

    // Firma adlarında ara
    companies.forEach(company => {
      if (company.name.toLowerCase().includes(query.toLowerCase())) {
        results.push({
          type: 'company',
          id: company.id,
          title: company.name,
          content: `Firma: ${company.name}`,
          company: company
        })
      }

      // Firma notlarında ara
      if (company.notes) {
        company.notes.forEach(note => {
          if (note.title.toLowerCase().includes(query.toLowerCase()) || 
              note.content.toLowerCase().includes(query.toLowerCase())) {
            results.push({
              type: 'note',
              id: note.id,
              title: note.title,
              content: note.content,
              company: company,
              note: note
            })
          }
        })
      }
    })

    setSearchResults(results)
    setIsSearching(false)
  }

  const handleSearchResultClick = (result) => {
    if (result.type === 'company') {
      setSelectedCompany(result.company)
    } else if (result.type === 'note') {
      setSelectedCompany(result.company)
      // Notu seçmek için biraz bekle
      setTimeout(() => {
        handleEditNote(result.note)
      }, 100)
    }
    setSearchResults([])
  }

  const handleExportJson = async (company = null) => {
    if (!window.electronAPI) {
      alert('Electron API bulunamadı')
      return
    }

    try {
      // Belirtilen firma varsa onu, yoksa seçili firmayı veya tümünü export et
      const companyIdToExport = company ? company.id : (selectedCompany ? selectedCompany.id : null)

      console.log('DEBUG - company:', company)
      console.log('DEBUG - selectedCompany:', selectedCompany)
      console.log('DEBUG - companyIdToExport:', companyIdToExport)

      if (!companyIdToExport) {
        alert('Hata: Firma seçili değil!')
        return
      }

      const result = await window.electronAPI.exportCompaniesJson(companyIdToExport)
      if (result.success) {
        const companyText = company ? 'Firma' : (selectedCompany ? 'Firma' : 'Firmalar')
        alert(`${companyText} başarıyla JSON olarak kaydedildi:\n${result.filePath}`)
      } else {
        alert(`Export başarısız: ${result.message || result.error}`)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Export sırasında hata oluştu')
    }
  }

  const handleExportZip = async (company = null) => {
    if (!window.electronAPI) {
      alert('Electron API bulunamadı')
      return
    }

    try {
      // Belirtilen firma varsa onu, yoksa seçili firmayı veya tümünü export et
      const companyIdToExport = company ? company.id : (selectedCompany ? selectedCompany.id : null)

      console.log('DEBUG - company:', company)
      console.log('DEBUG - selectedCompany:', selectedCompany)
      console.log('DEBUG - companyIdToExport:', companyIdToExport)

      if (!companyIdToExport) {
        alert('Hata: Firma seçili değil!')
        return
      }

      const result = await window.electronAPI.exportCompaniesZip(companyIdToExport)
      if (result.success) {
        const companyText = company ? 'Firma' : (selectedCompany ? 'Firma' : 'Firmalar')
        alert(`${companyText} ve ekler başarıyla ZIP olarak kaydedildi:\n${result.filePath}`)
      } else {
        alert(`Export başarısız: ${result.message || result.error}`)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Export sırasında hata oluştu')
    }
  }


  const handleImportCompanies = async () => {
    if (!window.electronAPI) {
      alert('Electron API bulunamadı')
      return
    }

    try {
      const result = await window.electronAPI.importCompanies()
      if (result.success) {
        if (result.type === 'json') {
          // JSON import - mevcut firmalara ekle, aynı ID varsa hata ver
          const importedCompanies = result.data.companies || []
          const existingIds = companies.map(c => c.id)
          const duplicateCompanies = []
          const newCompanies = []

          // Kontrol et ve ayır
          importedCompanies.forEach(company => {
            if (existingIds.includes(company.id)) {
              duplicateCompanies.push(company)
            } else {
              newCompanies.push(company)
            }
          })

          // Eğer hepsi duplicate ise hata ver
          if (newCompanies.length === 0) {
            let message = 'İçe aktarılan tüm firmalar zaten mevcut:\n'
            duplicateCompanies.forEach(company => {
              message += `\n- ${company.name} (ID: ${company.id})`
            })
            alert(message)
            return
          }

          // Yeni firmaları mevcut olanlara ekle
          const updatedCompanies = [...companies, ...newCompanies]
          const success = await saveCompanies(updatedCompanies)

          if (success) {
            let message = `${newCompanies.length} firma başarıyla içe aktarıldı`
            if (duplicateCompanies.length > 0) {
              message += `\n\n${duplicateCompanies.length} firma atlandı (zaten mevcut):`
              duplicateCompanies.forEach(company => {
                message += `\n- ${company.name}`
              })
            }
            alert(message)
          } else {
            alert('Firmalar kaydedilirken hata oluştu')
          }
        } else if (result.type === 'zip') {
          // ZIP import - sadece 1 firma import et, aynı ID varsa hata ver
          if (result.data.companies.length !== 1) {
            alert('ZIP dosyasında 1 firma olmalı! Şu anda ' + result.data.companies.length + ' firma var.')
            return
          }

          const importCompany = result.data.companies[0]
          const existingCompany = companies.find(c => c.id === importCompany.id)

          if (existingCompany) {
            alert(`Bu firma zaten mevcut: ${existingCompany.name} (ID: ${existingCompany.id})`)
            return
          }

          const updatedCompanies = [...companies, importCompany]
          const success = await saveCompanies(updatedCompanies)

          if (success) {
            const attachmentCount = result.attachments?.length || 0
            let message = `Firma "${importCompany.name}" başarıyla içe aktarıldı`
            if (attachmentCount > 0) {
              message += `\nEk sayısı: ${attachmentCount}`
              message += `\n\n📁 Ekler ZIP dosyasının bulunduğu klasörde saklandı`
            }
            alert(message)
          } else {
            alert('Firma kaydedilirken hata oluştu')
          }
        }
      } else {
        alert(`İçe aktarma başarısız: ${result.message || result.error}`)
      }
    } catch (error) {
      console.error('Import error:', error)
      alert('İçe aktarma sırasında hata oluştu')
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center animate-scale-in">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3 hover-scale">
            <Building2 className="w-6 h-6 text-gray-500 animate-pulse-subtle" />
          </div>
          <p className="text-gray-500 font-medium text-sm">Firmalar yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
<Header onSearch={handleSearch} hideSearch={!!selectedCompany} />

      <div className="flex-1 overflow-hidden">
        {selectedCompany ? (
          /* Firma Detayları Görünümü */
          <div className="h-full flex flex-col animate-page-in">
            {/* Üst Bar - Geri Dön Butonu */}
            <div className="bg-white border-b border-gray-100 px-8 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="btn btn-outline btn-sm"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Firmalara Dön
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditCompany(selectedCompany)}
                    className="btn btn-outline btn-sm hover-lift btn-press"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDeleteCompany(selectedCompany.id)}
                    className="btn btn-danger btn-sm hover-lift btn-press"
                  >
                    Sil

                  </button>
                  <button
                    onClick={() => handleExportJson(selectedCompany)}
                    className="btn btn-outline btn-sm hover-lift btn-press"
                    title="Eksiz Dışa Aktar"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    JSON Dışa Aktar
                  </button>
                  <button
                    onClick={() => handleExportZip(selectedCompany)}
                    disabled={!selectedCompany.notes?.some(note => note.attachments?.length > 0)}
                    className={`btn btn-outline btn-sm hover-lift btn-press ${
                      !selectedCompany.notes?.some(note => note.attachments?.length > 0)
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                    title={!selectedCompany.notes?.some(note => note.attachments?.length > 0)
                      ? "Bu firmada hiç ek bulunmuyor"
                      : "Ek ile Dışa Aktar"
                    }
                  >
                    <Package className="w-3.5 h-3.5" />
                    ZIP Dışa Aktar
                  </button>
                </div>
              </div>
            </div>
            
            {/* Firma İçeriği */}
            <div className="flex-1 p-8 overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                <div className="card">
                  <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedCompany.name}
                    </h3>
                  </div>
                  
                  <div className="card-body">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Firma Bilgileri
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs font-medium text-gray-500">Firma Adı</label>
                          <p className="text-gray-800 text-sm font-medium">{selectedCompany.name}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Belgeler bölümünü firma detayından kaldırdık. Belgeler notların altında yönetilir. */}

                    {/* Notlar Bölümü */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">
                          Notlar
                        </h4>
                        <button
                          onClick={handleAddNote}
                          className="btn btn-primary btn-sm hover-lift btn-press"
                        >
                          <StickyNote className="w-3.5 h-3.5 icon-spin" />
                          Yeni Not
                        </button>
                      </div>
                      
                      <NoteList
                        notes={selectedCompany.notes || []}
                        onEditNote={handleEditNote}
                        onDeleteNote={handleDeleteNote}
                        onOpenAttachment={handleOpenAttachment}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Firma Grid Görünümü */
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              {/* Başlık ve Aksiyonlar */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleImportCompanies}
                      className="btn btn-outline btn-sm hover-lift btn-press"
                      title="Firmaları içe aktar"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      İçe Aktar
                    </button>

                  </div>
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>
                  <button
                    onClick={handleAddCompany}
                    className="btn btn-primary btn-sm hover-lift btn-press"
                  >
                    <Plus className="w-3.5 h-3.5 icon-spin" />
                    Yeni Firma
                  </button>
                </div>
              </div>
              
              {/* Firma Grid */}
              <CompanyList
                companies={companies}
                selectedCompany={selectedCompany}
                onSelectCompany={setSelectedCompany}
                onEditCompany={handleEditCompany}
                onDeleteCompany={handleDeleteCompany}
                onExportJson={handleExportJson}
                onExportZip={handleExportZip}
              />
            </div>
          </div>
        )}
      </div>

      {/* Firma Form Modal */}
      {showForm && (
        <CompanyForm
          company={selectedCompany}
          onSave={handleSaveCompany}
          onClose={handleCloseForm}
        />
      )}

      {/* Not Form Modal */}
      {showNoteForm && (
        <NoteForm
          note={selectedNote}
          onSave={handleSaveNote}
          onClose={handleCloseNoteForm}
          companyName={selectedCompany?.name}
        />
      )}

      {/* Search Results Modal */}
      {(searchResults.length > 0 || isSearching) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50 modal-overlay-enter">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[500px] overflow-hidden modal-enter border border-gray-100">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Search className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Arama Sonuçları
                    </h3>
                    {searchResults.length > 0 && (
                      <p className="text-xs text-gray-600 mt-0.5">
                        {searchResults.length} sonuç bulundu
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSearchResults([])}
                  className="btn-close hover:bg-gray-100"
                  title="Kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {searchResults.length === 0 && !isSearching ? (
                <div className="flex flex-col items-center justify-center py-12 px-6">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Sonuç Bulunamadı
                  </h4>
                  <p className="text-sm text-gray-600 text-center max-w-sm">
                    Aradığınız kriterlere uygun sonuç bulunamadı. Farklı anahtar kelimeler ile tekrar deneyebilirsiniz.
                  </p>
                </div>
              ) : (
                searchResults.map((result, index) => (
                  <div
                    key={`${result.type}-${result.id}-${index}`}
                    onClick={() => handleSearchResultClick(result)}
                    className="p-4 border-b border-gray-50 hover:bg-blue-50/30 cursor-pointer transition-all duration-200 hover:shadow-sm group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        result.type === 'company'
                          ? 'bg-blue-100 group-hover:bg-blue-200'
                          : 'bg-green-100 group-hover:bg-green-200'
                      }`}>
                        {result.type === 'company' ? (
                          <Building2 className="w-5 h-5 text-blue-600" />
                        ) : (
                          <StickyNote className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate mb-1 group-hover:text-blue-700 transition-colors">
                          {result.title}
                        </h4>
                        <p className="text-sm text-gray-700 mb-3 line-clamp-2 leading-relaxed">
                          {result.content}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            result.type === 'company'
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-green-100 text-green-700 border border-green-200'
                          }`}>
                            {result.type === 'company' ? '🏢 Firma' : '📝 Not'}
                          </span>
                          {result.type === 'note' && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {result.company.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
