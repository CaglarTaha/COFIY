import React, { useState, useEffect } from 'react'
import { X, Save, Plus, FileText, Trash2, StickyNote, Edit } from 'lucide-react'
import NoteForm from './NoteForm'

function CompanyForm({ company, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    notes: []
  })
  // Belgeler firma seviyesinden kaldırıldı; belgeler notların içinde yönetiliyor
  const [loading, setLoading] = useState(false)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        notes: company.notes || []
      })
    }
    // Firma seviyesinde belge alanı yok
  }, [company])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Firma seviyesinde belge seçimi kaldırıldı

  // Firma seviyesinde belge ekleme kaldırıldı

  // Firma seviyesinde belge kaldırma kaldırıldı

  const handleAddNote = () => {
    setSelectedNote(null)
    setShowNoteForm(true)
  }

  const handleEditNote = (note) => {
    setSelectedNote(note)
    setShowNoteForm(true)
  }

  const handleDeleteNote = (noteId) => {
    if (window.confirm('Bu notu silmek istediğinizden emin misiniz?')) {
      setFormData(prev => ({
        ...prev,
        notes: prev.notes.filter(n => n.id !== noteId)
      }))
    }
  }

  const handleSaveNote = (noteData) => {
    let updatedNotes
    if (selectedNote) {
      // Güncelleme
      updatedNotes = formData.notes.map(n => 
        n.id === selectedNote.id ? { ...noteData, id: selectedNote.id, updatedAt: new Date().toISOString() } : n
      )
    } else {
      // Yeni ekleme
      const newNote = {
        ...noteData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      }
      updatedNotes = [...formData.notes, newNote]
    }

    setFormData(prev => ({
      ...prev,
      notes: updatedNotes
    }))

    setShowNoteForm(false)
    setSelectedNote(null)
  }

  const handleCloseNoteForm = () => {
    setShowNoteForm(false)
    setSelectedNote(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Basit validasyon
    if (!formData.name.trim()) {
      alert('Firma adı gereklidir')
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

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="text-xl font-bold text-gray-800">
            {company ? 'Firmayı Düzenle' : 'Yeni Firma Ekle'}
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
            <div className="space-y-4">
              {/* Firma Bilgileri */}
              <div className="form-group">
                <label className="form-label">Firma Adı *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Firma adını girin"
                  required
                />
              </div>

              {/* Belgeler firma formundan kaldırıldı. Belgeler artık notların içinde yönetilir. */}

              {/* Notlar */}
              <div className="form-group">
                <div className="flex items-center justify-between mb-4">
                  <label className="form-label">Notlar</label>
                  <button
                    type="button"
                    onClick={handleAddNote}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700"
                  >
                    <StickyNote className="w-3.5 h-3.5" />
                    Yeni Not
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.notes.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 text-sm">
                      Henüz not eklenmemiş
                    </p>
                  ) : (
                    formData.notes.map((note) => (
                      <div key={note.id} className="flex items-start justify-between p-4 bg-white border border-gray-200 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-semibold text-gray-800 text-sm">{note.title}</h5>
                            {note.category && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {note.category}
                              </span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded ${
                              note.priority === 'high' ? 'bg-red-100 text-red-600' :
                              note.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                              note.priority === 'low' ? 'bg-green-100 text-green-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {note.priority === 'high' ? 'Yüksek' :
                               note.priority === 'medium' ? 'Orta' :
                               note.priority === 'low' ? 'Düşük' : 'Normal'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{note.content}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{new Date(note.createdAt).toLocaleDateString('tr-TR')}</span>
                            {note.attachments && note.attachments.length > 0 && (
                              <span>{note.attachments.length} ek</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 ml-3">
                          <button
                            type="button"
                            onClick={() => handleEditNote(note)}
                            className="btn-icon"
                            title="Düzenle"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id)}
                            className="btn-icon"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline btn-sm"
              disabled={loading}
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  {company ? 'Güncelle' : 'Kaydet'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Not Form Modal */}
      {showNoteForm && (
        <NoteForm
          note={selectedNote}
          onSave={handleSaveNote}
          onClose={handleCloseNoteForm}
          companyName={formData.name}
        />
      )}
    </div>
  )
}

export default CompanyForm
