import React, { useState } from 'react'
import { Building2, Search, X } from 'lucide-react'

function Header({ onSearch, hideSearch = false }) {
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim())
      setShowSearch(false)
      setSearchQuery('')
    }
  }

  const handleSearchClick = () => {
    setShowSearch(!showSearch)
    if (showSearch) {
      setSearchQuery('')
    }
  }

  const handleSearchClose = () => {
    setShowSearch(false)
    setSearchQuery('')
  }

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Sol taraf - Logo ve başlık */}
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <h1 className="text-base font-medium text-gray-900">
              COFIY
            </h1>
          </div>
        </div>

        {/* Sağ taraf - Aksiyonlar */}
        {!hideSearch && (
          <div className="flex items-center gap-2">
            {/* Search Section */}
            <div className="relative flex items-center">
              {!showSearch ? (
                <button
                  onClick={handleSearchClick}
                  className="btn-icon"
                  title="Arama"
                >
                  <Search className="w-5 h-5" />
                </button>
              ) : (
                <div className="flex items-center gap-2 animate-fade-in">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Firma adı, not içeriği..."
                      className="w-80 pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          handleSearchClose()
                        } else if (e.key === 'Enter' && searchQuery.trim()) {
                          handleSearch(e)
                        }
                      }}
                    />
                    {/* Search icon */}
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                    {/* Close button on the right */}
                    <button
                      onClick={handleSearchClose}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-close"
                      title="Kapat"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={handleSearch}
                    className="btn btn-primary btn-sm"
                    disabled={!searchQuery.trim()}
                  >
                    Ara
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </header>
  )
}

export default Header
