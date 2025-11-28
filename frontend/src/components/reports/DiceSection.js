import React from 'react';

const DiceSection = ({
  dateLimits,
  diceFilters,
  onFilterChange,
  diceLoading,
  recentOrders,
  formatCurrency,
  formatDate,
  companyOptions,
  artistOptions,
  albumOptions,
}) => {
  const filteredArtists = React.useMemo(() => {
    if (!diceFilters.companyId) return artistOptions;
    return artistOptions.filter(
      (artist) => String(artist.company_id) === diceFilters.companyId
    );
  }, [artistOptions, diceFilters.companyId]);

  const filteredAlbums = React.useMemo(() => {
    if (diceFilters.artistId) {
      return albumOptions.filter(
        (album) => String(album.artist_id) === diceFilters.artistId
      );
    }
    if (diceFilters.companyId) {
      return albumOptions.filter(
        (album) => String(album.company_id) === diceFilters.companyId
      );
    }
    return albumOptions;
  }, [albumOptions, diceFilters.artistId, diceFilters.companyId]);

  return (
    <div className="report-section">
      <div className="section-header">
        <h2> DICE: Recent Transaction Details</h2>
        <p>Multi-dimensional view - Recent orders with all dimensions</p>
      </div>

      <div className="dice-filters">
        <div className="filter-group">
          <label>Company</label>
          <select
            value={diceFilters.companyId}
            onChange={(e) => onFilterChange('companyId', e.target.value)}
          >
            <option value="">All Companies</option>
            {companyOptions.map((company) => (
              <option key={company.company_id} value={company.company_id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Artist</label>
          <select
            value={diceFilters.artistId}
            onChange={(e) => onFilterChange('artistId', e.target.value)}
            disabled={!artistOptions.length}
          >
            <option value="">All Artists</option>
            {filteredArtists.map((artist) => (
              <option key={artist.artist_id} value={artist.artist_id}>
                {artist.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Album (combined versions)</label>
          <select
            value={diceFilters.albumKey}
            onChange={(e) => onFilterChange('albumKey', e.target.value)}
            disabled={!albumOptions.length}
          >
            <option value="">All Albums</option>
            {filteredAlbums.map((album) => (
              <option key={album.album_key} value={album.album_key}>
                {`${album.base_title} - ${album.artist_name}`}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Start Date</label>
          <input
            type="date"
            min={dateLimits.min}
            max={dateLimits.max}
            value={diceFilters.startDate}
            onChange={(e) => onFilterChange('startDate', e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>End Date</label>
          <input
            type="date"
            min={diceFilters.startDate || dateLimits.min}
            max={dateLimits.max}
            value={diceFilters.endDate}
            onChange={(e) => onFilterChange('endDate', e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Min Price</label>
          <input
            type="number"
            placeholder="0.01"
            min="0.01"
            max="9999"
            step="0.01"
            value={diceFilters.minPrice}
            onChange={(e) => onFilterChange('minPrice', e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Max Price</label>
          <input
            type="number"
            placeholder="9999.99"
            min="0.01"
            max="9999"
            step="0.01"
            value={diceFilters.maxPrice}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
          />
        </div>
        {diceLoading && (
          <span
            style={{ color: '#667eea', marginLeft: 'auto', alignSelf: 'center' }}
          >
            ⟳ Filtering...
          </span>
        )}
      </div>

      <div
        className="table-wrapper"
        style={{ opacity: diceLoading ? 0.5 : 1, transition: 'opacity 0.3s' }}
      >
        {recentOrders.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Customer</th>
                <th>Album</th>
                <th>Artist</th>
                <th>Company</th>
                <th>Qty</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, idx) => (
                <tr key={idx}>
                  <td>#{order.order_id}</td>
                  <td>{formatDate(order.order_date)}</td>
                  <td>
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.username}</td>
                  <td>{order.album_title}</td>
                  <td>{order.artist_name}</td>
                  <td>{order.company_name}</td>
                  <td>{order.quantity}</td>
                  <td className="revenue-cell">{formatCurrency(order.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>
              {diceLoading
                ? 'Loading filtered transactions...'
                : 'No transactions match the selected filters.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiceSection;

