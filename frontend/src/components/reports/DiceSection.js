import React from 'react';

const DiceSection = ({
  dateLimits,
  diceFilters,
  onFilterChange,
  diceLoading,
  recentOrders,
  formatCurrency,
  formatDate
}) => (
  <div className="report-section">
    <div className="section-header">
      <h2> DICE: Recent Transaction Details</h2>
      <p>Multi-dimensional view - Recent orders with all dimensions</p>
    </div>

    <div className="dice-filters">
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
      {diceLoading && <span style={{ color: '#667eea', marginLeft: 'auto', alignSelf: 'center' }}>⟳ Filtering...</span>}
    </div>

    <div className="table-wrapper" style={{ opacity: diceLoading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
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
                  <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
                </td>
                <td>{order.username}</td>
                <td>{order.album_title}</td>
                <td>{order.artist_name}</td>
                <td>{order.quantity}</td>
                <td className="revenue-cell">{formatCurrency(order.total_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty-state">
          <p>No orders found matching the selected filters.</p>
        </div>
      )}
    </div>
  </div>
);

export default DiceSection;

