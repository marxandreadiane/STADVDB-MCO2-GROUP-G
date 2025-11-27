import React from 'react';

const TimeTabs = ({ active, onChange }) => (
  <div className="trend-tabs">
    {['daily', 'monthly', 'quarterly', 'yearly'].map(tab => (
      <button
        key={tab}
        className={`trend-tab ${active === tab ? 'active' : ''}`}
        onClick={() => onChange(tab)}
      >
        {tab === 'daily'
          ? 'Daily'
          : tab === 'monthly'
          ? 'Monthly'
          : tab === 'quarterly'
          ? 'Quarterly'
          : 'Yearly'}
      </button>
    ))}
  </div>
);

const TimeTable = ({ rows, view, formatCurrency, formatDate }) => (
  <div className="table-wrapper slice-time-table">
    <table>
      <thead>
        <tr>
          <th>{view === 'daily' ? 'Date' : 'Period'}</th>
          <th>Orders</th>
          <th>Revenue</th>
          <th>Avg Value</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx} className={row.type === 'quarter' ? 'quarter-row' : ''}>
            <td>{view === 'daily' ? formatDate(row.date) : row.label}</td>
            <td>{row.total_orders}</td>
            <td>{formatCurrency(row.total_revenue)}</td>
            <td>{formatCurrency(row.avg_order_value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SliceGrid = ({ dimension, data, formatCurrency }) => {
  const [page, setPage] = React.useState(0);
  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const showPagination = totalPages > 1;
  const visibleData = React.useMemo(() => {
    if (!showPagination) return data;
    const start = page * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, page, showPagination]);

  React.useEffect(() => {
    setPage(0);
  }, [data.length]);

  return (
    <>
      <div className="status-grid" style={{ opacity: data.length === 0 ? 0.5 : 1, transition: 'opacity 0.3s' }}>
        {visibleData.map((item, idx) => {
          const title = dimension === 'company' ? item.company_name : item.artist_name;

          return (
            <div key={idx} className="status-card">
              <div className="status-indicator neutral"></div>
              <h3>{title}</h3>
              <div className="status-stats">
                <div className="stat-item">
                  <span className="stat-label">Orders</span>
                  <span className="stat-value">{item.total_orders}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Revenue</span>
                  <span className="stat-value">{formatCurrency(item.total_revenue)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Avg Value</span>
                  <span className="stat-value">{formatCurrency(item.avg_order_value)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {showPagination && (
        <div className="pagination-controls">
          <button className="pagination-button" onClick={() => setPage(prev => Math.max(0, prev - 1))} disabled={page === 0}>
            &lt;
          </button>
          <span className="pagination-info">{`${page * PAGE_SIZE + 1}-${Math.min((page + 1) * PAGE_SIZE, data.length)} of ${data.length}`}</span>
          <button
            className="pagination-button"
            onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={page >= totalPages - 1}
          >
            &gt;
          </button>
        </div>
      )}
    </>
  );
};

const PAGE_SIZE = 10;

const SliceAnalysisSection = ({
  sliceDimension,
  onDimensionChange,
  sliceData,
  sliceLoading,
  formatCurrency,
  timeData,
  timeView,
  onTimeViewChange,
  formatDate
}) => (
  <div className="report-section">
    <div className="section-header">
      <h2>🔪 SLICE: Sales by Dimension</h2>
      <p>Single dimension analysis - select a dimension to analyze</p>
    </div>

    <div className="filter-controls">
      <div className="filter-group">
        <label>Slice by:</label>
        <select value={sliceDimension} onChange={(e) => onDimensionChange(e.target.value)}>
          <option value="time">Time Period</option>
          <option value="company">Company</option>
          <option value="artist">Artist</option>
        </select>
      </div>
      {sliceLoading && <span style={{ color: '#667eea', marginLeft: '1rem' }}>⟳ Updating...</span>}
    </div>

    {sliceDimension === 'time' ? (
      <div style={{ opacity: sliceLoading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
        <TimeTabs active={timeView} onChange={onTimeViewChange} />
        <TimeTable
          rows={timeData?.[timeView] || []}
          view={timeView}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      </div>
    ) : (
      <SliceGrid
        dimension={sliceDimension}
        data={sliceData}
        formatCurrency={formatCurrency}
      />
    )}
  </div>
);

export default SliceAnalysisSection;

