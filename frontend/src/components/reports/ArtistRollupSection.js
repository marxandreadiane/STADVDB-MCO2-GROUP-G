import React, { useMemo, useState, useEffect } from 'react';

const PAGE_SIZE = 10;

const ArtistRollupSection = ({ data, isAdmin, getBarWidth, formatCurrency }) => {
  const [page, setPage] = useState(0);

  const sortedData = useMemo(() => {
    const copy = [...data];
    copy.sort((a, b) => {
      const metricA = isAdmin ? parseFloat(a.total_revenue || 0) : parseFloat(a.total_units_sold || 0);
      const metricB = isAdmin ? parseFloat(b.total_revenue || 0) : parseFloat(b.total_units_sold || 0);
      return metricB - metricA;
    });
    return copy;
  }, [data, isAdmin]);

  const maxValue = Math.max(...sortedData.map(item => parseFloat(item.total_units_sold || 0)), 1);

  const totalPages = Math.ceil(sortedData.length / PAGE_SIZE);
  const showPagination = totalPages > 1;
  const visibleData = useMemo(() => {
    if (!showPagination) return sortedData;
    const start = page * PAGE_SIZE;
    return sortedData.slice(start, start + PAGE_SIZE);
  }, [sortedData, page, showPagination]);

  useEffect(() => {
    setPage(0);
  }, [sortedData.length]);

  return (
    <div className="report-section">
      <div className="section-header">
        <h2>{isAdmin ? 'ROLL UP: Top Performing Artists' : 'Most Popular Artists'}</h2>
        <p>{isAdmin ? 'Sales performance by artist across all companies' : 'Artists ranked by album sales'}</p>
      </div>
      <div className="chart-container fixed-height">
        {visibleData.map((artist, idx) => {
          const barValue = isAdmin ? artist.total_revenue : artist.total_units_sold;
          return (
            <div key={idx} className="bar-item">
              <div className="bar-label">
                <span className="label-text">
                  <strong>{artist.artist_name}</strong>
                  <small> ({artist.company_name})</small>
                </span>
                <span className="label-value">
                  {isAdmin ? formatCurrency(artist.total_revenue) : `${artist.total_units_sold} albums`}
                </span>
              </div>
              <div className="bar-track">
                <div className="bar-fill blue-bar" style={{ width: getBarWidth(barValue, maxValue) }}>
                  <span className="bar-text">
                    {isAdmin ? `${artist.total_units_sold} albums sold` : formatCurrency(artist.total_revenue)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showPagination && (
        <div className="pagination-controls">
          <button
            className="pagination-button"
            onClick={() => setPage(prev => Math.max(0, prev - 1))}
            disabled={page === 0}
          >
            &lt;
          </button>
          <span className="pagination-info">{`${page * PAGE_SIZE + 1}-${Math.min((page + 1) * PAGE_SIZE, sortedData.length)} of ${sortedData.length}`}</span>
          <button
            className="pagination-button"
            onClick={() => setPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={page >= totalPages - 1}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default ArtistRollupSection;

