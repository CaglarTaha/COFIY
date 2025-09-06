import React from 'react'
import { Building2, Edit, Trash2, FileText, StickyNote, Calendar, Eye, MoreVertical, Package } from 'lucide-react'

function CompanyList({ companies, selectedCompany, onSelectCompany, onEditCompany, onDeleteCompany, onExportJson, onExportZip }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div>
      {companies.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Henüz firma eklenmemiş
          </h3>
          <p className="text-gray-500 text-sm">
            İlk firmanızı eklemek için "Yeni Firma" butonuna tıklayın
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {companies.map((company, index) => (
            <div
              key={company.id}
              className={`bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 cursor-pointer group hover-lift stagger-item`}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => onSelectCompany(company)}
            >
              {/* Card Header */}
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-md flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 text-base truncate group-hover:text-gray-900 transition-colors">
                        {company.name}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditCompany(company)
                      }}
                      className="btn-icon"
                      title="Düzenle"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onExportJson(company)
                      }}
                      className="btn-icon"
                      title="Eksiz Dışa Aktar"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onExportZip(company)
                      }}
                      disabled={!company.notes?.some(note => note.attachments?.length > 0)}
                      className={`btn-icon ${
                        !company.notes?.some(note => note.attachments?.length > 0)
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                      title={!company.notes?.some(note => note.attachments?.length > 0)
                        ? "Bu firmada hiç ek bulunmuyor"
                        : "Ek ile Dışa Aktar"
                      }
                    >
                      <Package className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteCompany(company.id)
                      }}
                      className="btn-icon"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Card Content */}
              <div className="px-5 pb-4">
                <div className="space-y-2">
                  {/* İstatistikler */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500" title="Belge sayısı (not ekleri)">
                      <FileText className="w-3 h-3" />
                      <span>{(company.notes || []).reduce((sum, n) => sum + ((n.attachments || []).length), 0)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <StickyNote className="w-3 h-3" />
                      <span>{company.notes ? company.notes.length : 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(company.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CompanyList
