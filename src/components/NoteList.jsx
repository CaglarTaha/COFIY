import React, { useState, useMemo } from 'react'
import { Edit, Trash2, FileText, Calendar, User, AlertCircle, Clock, CheckCircle, Paperclip, ChevronDown, ChevronRight, Search, X } from 'lucide-react'

function NoteList({ notes, onEditNote, onDeleteNote, onOpenAttachment }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <Clock className="w-4 h-4 text-blue-500" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-l-green-500 bg-green-50'
      default:
        return 'border-l-blue-500 bg-blue-50'
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

  // Filtrelenmiş notları hesapla
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes

    const query = searchQuery.toLowerCase().trim()
    return notes.filter(note =>
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      (note.category && note.category.toLowerCase().includes(query))
    )
  }, [notes, searchQuery])

  const handleSearchToggle = () => {
    setShowSearch(!showSearch)
    if (showSearch) {
      setSearchQuery('')
    }
  }


  return (
    <div className="space-y-4">
      {/* Search Input */}
      {notes.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 relative">
            {!showSearch ? (
              <button
                onClick={handleSearchToggle}
                className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-500 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all duration-200"
              >
                <Search className="w-4 h-4" />
                <span className="text-sm">Notlarda ara...</span>
              </button>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Başlık, içerik veya kategori ara..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  autoFocus
                />
              </div>
            )}
          </div>
          {showSearch && (
            <button
              onClick={handleSearchToggle}
              className="btn btn-outline btn-sm"
            >
              İptal
            </button>
          )}
        </div>
      )}

      {/* Notes Count */}
      {notes.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span>
            {searchQuery ? `${filteredNotes.length} / ${notes.length} not` : `${notes.length} not`}
          </span>
          {searchQuery && filteredNotes.length === 0 && (
            <span className="text-gray-400">Sonuç bulunamadı</span>
          )}
        </div>
      )}

      {notes.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
          <h5 className="text-sm font-medium text-gray-600 mb-1">
            Henüz not eklenmemiş
          </h5>
          <p className="text-xs text-gray-500">
            İlk notunuzu eklemek için "Yeni Not" butonuna tıklayın
          </p>
        </div>
      ) : (
        filteredNotes.map((note, index) => (
          <div
            key={note.id}
            className={`border border-gray-100 rounded-lg bg-white hover:border-gray-200 hover:shadow-sm transition-all duration-200 group hover-lift stagger-item`}
            style={{ animationDelay: `${index * 0.03}s` }}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    <h3 className="text-sm font-medium text-gray-800 truncate">
                      {note.title}
                    </h3>
                    {note.category && (
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                        {note.category}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-gray-600 text-xs leading-relaxed mb-3 line-clamp-2">
                    {note.content}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(note.createdAt)}</span>
                  </div>
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEditNote(note)}
                    className="btn-icon"
                    title="Düzenle"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="btn-icon"
                    title="Sil"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              {/* Ekler Toggle */}
              <AttachmentsToggle attachments={note.attachments || []} onOpenAttachment={onOpenAttachment} />
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default NoteList

// Inline minimal toggle component for attachments under each note
function AttachmentsToggle({ attachments, onOpenAttachment }) {
  const [open, setOpen] = useState(false)
  if (!attachments || attachments.length === 0) return null
  return (
    <div className="border-t border-gray-50 pt-2">
      <button
        className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-800"
        onClick={() => setOpen(!open)}
      >
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        <Paperclip className="w-3 h-3" />
        Belgeler ({attachments.length})
      </button>
      {open && (
        <div className="mt-2 space-y-1">
          {attachments.map((attachment, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-100 rounded">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base">{getFileIconInline(attachment.type)}</span>
                <span className="text-xs text-gray-800 truncate">{attachment.title || attachment.fileName}</span>
              </div>
              <button
                onClick={() => onOpenAttachment(attachment)}
                className="btn btn-outline btn-xs"
              >
                Aç
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function getFileIconInline(type) {
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
