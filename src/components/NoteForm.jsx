import React, { useState, useEffect } from 'react'
import { X, Save, Plus, FileText, Trash2, Calendar, User } from 'lucide-react'

function NoteForm({ note, onSave, onClose, companyName }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    category: '',
    attachments: []
  })
  const [newAttachment, setNewAttachment] = useState({
    title: '',
    description: '',
    filePath: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        priority: note.priority || 'normal',
        category: note.category || '',
        attachments: note.attachments || []
      })
    }
    // Form açıldığında yeni ek alanlarını sıfırla
    setNewAttachment({
      title: '',
      description: '',
      filePath: ''
    })
  }, [note])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectFile = async () => {
    try {
      if (!window.electronAPI) {
        console.error('Electron API bulunamadı')
        return
      }
      const filePath = await window.electronAPI.selectFile()
      if (filePath) {
        const fileName = filePath.split(/[\\/]/).pop()
        setNewAttachment(prev => ({
          ...prev,
          filePath: filePath,
          title: prev.title || fileName.split('.')[0] // Başlık boşsa dosya adını kullan
        }))
      }
    } catch (error) {
      console.error('Dosya seçilirken hata:', error)
    }
  }

  const handleAddAttachment = () => {
    if (!newAttachment.filePath) {
      alert('Lütfen önce bir dosya seçin')
      return
    }

    // Başlık boşsa dosya adını kullan
    const title = newAttachment.title.trim() || newAttachment.filePath.split(/[\\/]/).pop().split('.')[0]

    const fileName = newAttachment.filePath.split(/[\\/]/).pop()
    const fileExtension = fileName.split('.').pop().toLowerCase()
    
    // Dosya tipini belirle
    let attachmentType = 'Diğer'
    if (['pdf'].includes(fileExtension)) {
      attachmentType = 'PDF'
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      attachmentType = 'Resim'
    } else if (['doc', 'docx'].includes(fileExtension)) {
      attachmentType = 'Word'
    } else if (['xls', 'xlsx'].includes(fileExtension)) {
      attachmentType = 'Excel'
    }

    const attachmentToAdd = {
      title: title,
      description: newAttachment.description,
      fileName: fileName,
      type: attachmentType,
      filePath: newAttachment.filePath,
      addedAt: new Date().toISOString()
    }

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, attachmentToAdd]
    }))

    // Yeni ek alanlarını sıfırla
    setNewAttachment({
      title: '',
      description: '',
      filePath: ''
    })
  }

  const handleRemoveAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Basit validasyon
    if (!formData.title.trim()) {
      alert('Not başlığı gereklidir')
      return
    }

    if (!formData.content.trim()) {
      alert('Not içeriği gereklidir')
      return
    }

    setLoading(true)
    try {
      await onSave(formData)
    } finally {
      setLoading(false)
    }
  }

  const getFileIcon = (type) => {
    switch (type) {
      case 'PDF':
        return '📄'
      case 'Resim':
        return '🖼️'
      case 'Word':
        return '📝'
      case 'Excel':
        return '📊'
      default:
        return '📁'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high':
        return 'Yüksek'
      case 'medium':
        return 'Orta'
      case 'low':
        return 'Düşük'
      default:
        return 'Normal'
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal max-w-2xl">
        <div className="modal-header">
          <h2 className="text-lg font-semibold text-gray-900">
            {note ? 'Notu Düzenle' : 'Yeni Not Ekle'}
            {companyName && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                - {companyName}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 btn-close"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="space-y-6">
              {/* Not Bilgileri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Not Başlığı *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Not başlığını girin"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    placeholder="Kategori (opsiyonel)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Öncelik</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="low">Düşük</option>
                  <option value="normal">Normal</option>
                  <option value="medium">Orta</option>
                  <option value="high">Yüksek</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Not İçeriği *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Not içeriğini girin"
                  rows="4"
                  required
                />
              </div>

              {/* Ekler */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Ekler</label>
                
                {/* Yeni Ek Ekleme Alanı */}
                <div className="border border-gray-200 rounded-xl p-4 mb-4 bg-gray-50/50">
                  <h4 className="text-sm font-semibold text-gray-800 mb-4">Yeni Ek Ekle</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Ek Başlığı</label>
                      <input
                        type="text"
                        value={newAttachment.title}
                        onChange={(e) => setNewAttachment(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ek başlığını girin (opsiyonel)"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Açıklama</label>
                      <textarea
                        value={newAttachment.description}
                        onChange={(e) => setNewAttachment(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Ek açıklamasını girin (opsiyonel)"
                        rows="2"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleSelectFile}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Dosya Seç
                      </button>
                      
                      {newAttachment.filePath && (
                        <span className="text-sm text-gray-600 truncate flex-1">
                          {newAttachment.filePath.split(/[\\/]/).pop()}
                        </span>
                      )}
                      
                      <button
                        type="button"
                        onClick={handleAddAttachment}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        disabled={!newAttachment.filePath}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Ekle
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mevcut Ekler */}
                <div className="space-y-2">
                  {formData.attachments.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm">Henüz ek dosya eklenmemiş</p>
                    </div>
                  ) : (
                    formData.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                            <span className="text-lg">{getFileIcon(attachment.type)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 text-sm truncate">{attachment.title}</p>
                            {attachment.description && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-1">{attachment.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{attachment.type}</span>
                              <span className="text-xs text-gray-400 truncate">{attachment.fileName}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(index)}
                          className="btn-icon"
                          title="Eki kaldır"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  {note ? 'Güncelle' : 'Kaydet'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NoteForm
