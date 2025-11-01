import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import './Albums.css';

function Albums() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart, cartItems, updateQuantity } = useCart();
  const { isAuthenticated, updateUserInfo } = useAuth();
  const [addedItems, setAddedItems] = useState({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAlbum, setPendingAlbum] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    artist: '',
    company: '',
    sortBy: 'newest'
  });
  const [artists, setArtists] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/albums');
      const data = await response.json();
      const albumsData = Array.isArray(data) ? data : [];
      setAlbums(albumsData);
      
      // Extract unique artists and companies for filters
      const uniqueArtists = [...new Set(albumsData.map(a => a.artist_name))].sort();
      const uniqueCompanies = [...new Set(albumsData.map(a => a.company_name))].sort();
      setArtists(uniqueArtists);
      setCompanies(uniqueCompanies);
      
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      artist: '',
      company: '',
      sortBy: 'newest'
    });
    setSearchQuery('');
    setCurrentPage(1); // Reset to first page
  };

  const getFilteredAndSortedAlbums = () => {
    let filtered = [...albums];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(album => 
        album.album_name.toLowerCase().includes(query) ||
        album.artist_name.toLowerCase().includes(query) ||
        album.company_name.toLowerCase().includes(query)
      );
    }

    // Filter by artist
    if (filters.artist) {
      filtered = filtered.filter(album => album.artist_name === filters.artist);
    }

    // Filter by company
    if (filters.company) {
      filtered = filtered.filter(album => album.company_name === filters.company);
    }

    // Sort albums
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
        break;
      case 'price-low':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'name':
        filtered.sort((a, b) => a.album_name.localeCompare(b.album_name));
        break;
      default:
        break;
    }

    return filtered;
  };

  const handleAddToCart = (album) => {
    // Check if user is logged in
    if (!isAuthenticated) {
      setPendingAlbum(album);
      setShowAuthModal(true);
      return;
    }

    // Add to cart if logged in
    proceedAddToCart(album);
  };

  const proceedAddToCart = (album) => {
    addToCart(album);
    setAddedItems({ ...addedItems, [album.album_id]: true });
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [album.album_id]: false }));
    }, 2000);
  };

  const handleAuthSuccess = (userData) => {
    updateUserInfo(userData);
    setShowAuthModal(false);
    
    // Add the pending album after successful auth
    if (pendingAlbum) {
      proceedAddToCart(pendingAlbum);
      setPendingAlbum(null);
    }
  };

  const getAlbumQuantity = (albumId) => {
    const item = cartItems.find(item => item.album_id === albumId);
    return item ? item.quantity : 0;
  };

  const handleQuantityChange = (album, change) => {
    const currentQty = getAlbumQuantity(album.album_id);
    const newQty = currentQty + change;
    
    if (newQty <= 0) {
      updateQuantity(album.album_id, 0); // This will remove it from cart
    } else {
      updateQuantity(album.album_id, newQty);
    }
  };

  if (loading) return <div className="albums"><h2>Loading albums...</h2></div>;
  if (error) return (
    <div className="albums">
      <h2>Error: {error}</h2>
      <button onClick={fetchAlbums}>Retry</button>
    </div>
  );

  const filteredAlbums = getFilteredAndSortedAlbums();
  const hasActiveFilters = filters.artist || filters.company || filters.sortBy !== 'newest' || searchQuery;
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredAlbums.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAlbums = filteredAlbums.slice(startIndex, endIndex);
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Maximum number of page buttons to show
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="albums">
      <div className="albums-header">
        <h1>Album Collection</h1>
        <p>Browse our collection of authentic K-Pop albums</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search albums, artists, companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <button 
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters {hasActiveFilters && <span className="filter-badge">•</span>}
        </button>

        {hasActiveFilters && (
          <button className="clear-all-btn" onClick={clearFilters}>
            ✕ Clear All
          </button>
        )}
      </div>

      {/* Collapsible Filter Controls */}
      {showFilters && (
        <div className="filters-container">
          <div className="filters-row">
            <div className="filter-group">
              <label>Artist:</label>
              <select 
                value={filters.artist} 
                onChange={(e) => handleFilterChange('artist', e.target.value)}
              >
                <option value="">All Artists</option>
                {artists.map(artist => (
                  <option key={artist} value={artist}>{artist}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Company:</label>
              <select 
                value={filters.company} 
                onChange={(e) => handleFilterChange('company', e.target.value)}
              >
                <option value="">All Companies</option>
                {companies.map(company => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By:</label>
              <select 
                value={filters.sortBy} 
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="filter-results">
        Showing {startIndex + 1}-{Math.min(endIndex, filteredAlbums.length)} of {filteredAlbums.length} albums
        {filteredAlbums.length > 0 && <span style={{ marginLeft: '1rem', color: '#999' }}>({totalPages} {totalPages === 1 ? 'page' : 'pages'})</span>}
      </div>

      <div className="albums-grid">
        {currentAlbums.map((album) => {
          const quantity = getAlbumQuantity(album.album_id);
          
          return (
            <div key={album.album_id} className="album-card">
              <div className="album-image">
                <img 
                  src={album.image_url || `/images/albums/${album.album_id}.jpg`}
                  alt={album.album_name}
                  onError={(e) => {
                    e.target.src = '/images/album-placeholder.jpg';
                  }}
                />
              </div>
              <div className="album-info">
                <h3>{album.album_name}</h3>
                <p className="artist">{album.artist_name}</p>
                <p className="company">{album.company_name}</p>
                
                {/* Stock Indicator */}
                <p className={`stock-indicator ${album.stock_quantity === 0 ? 'out-of-stock' : album.stock_quantity < 10 ? 'low-stock' : 'in-stock'}`}>
                  {album.stock_quantity === 0 ? 'Out of Stock' : 
                   album.stock_quantity < 10 ? `Only ${album.stock_quantity} left` : 
                   `${album.stock_quantity} in stock`}
                </p>

                <div className="album-footer">
                  <span className="price">${album.price}</span>
                  
                  {quantity > 0 ? (
                    <div className="quantity-controls">
                      <button 
                        className="qty-btn"
                        onClick={() => handleQuantityChange(album, -1)}
                      >
                        -
                      </button>
                      <span className="quantity-display">{quantity}</span>
                      <button 
                        className="qty-btn"
                        onClick={() => handleQuantityChange(album, 1)}
                        disabled={quantity >= album.stock_quantity}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button 
                      className={`buy-button ${addedItems[album.album_id] ? 'added' : ''}`}
                      onClick={() => handleAddToCart(album)}
                      disabled={album.stock_quantity === 0}
                    >
                      {album.stock_quantity === 0 ? 'Out of Stock' : 
                       addedItems[album.album_id] ? '✓ Added' : 'Add to Cart'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination - Show if more than 1 page OR for testing show always */}
      {filteredAlbums.length > 0 && (
        <div className="pagination">
          <button 
            className="page-btn prev-btn"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || totalPages <= 1}
          >
            ← Prev
          </button>
          
          <div className="page-numbers">
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="page-ellipsis">...</span>
              ) : (
                <button
                  key={page}
                  className={`page-number ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                  disabled={totalPages <= 1}
                >
                  {page}
                </button>
              )
            ))}
          </div>
          
          <button 
            className="page-btn next-btn"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || totalPages <= 1}
          >
            Next →
          </button>
        </div>
      )}

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingAlbum(null);
        }}
        onSuccess={handleAuthSuccess}
        mode="login"
      />
    </div>
  );
}

export default Albums;
