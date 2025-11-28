import React, { useState, useEffect, useMemo } from 'react';

const PAGE_SIZE = 10;

const AlbumDrilldownSection = ({ data, isAdmin, formatCurrency }) => {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const showPagination = totalPages > 1;

  const visibleData = useMemo(() => {
    if (!showPagination) return data;
    const start = page * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, page, showPagination]);

  const startIndex = page * PAGE_SIZE;

  useEffect(() => {
    setPage(0);
  }, [data.length]);

  return (
    <div className="report-section">
      <div className="section-header">
        <h2>{isAdmin ? 'DRILL DOWN: Best-Selling Albums' : 'Top Albums'}</h2>
        <p>{isAdmin ? 'Most detailed level - individual album performance' : 'Most popular albums by sales volume'}</p>
      </div>
      <div className="table-wrapper fixed-height">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Album</th>
              <th>Artist</th>
              <th>Company</th>
              <th>Orders</th>
              <th>Units Sold</th>
              {isAdmin && <th>Revenue</th>}
            </tr>
          </thead>
          <tbody>
            {visibleData.map((album, idx) => (
              <tr key={idx}>
                <td className="rank-cell">#{startIndex + idx + 1}</td>
                <td className="album-cell">{album.album_title}</td>
                <td>{album.artist_name}</td>
                <td>{album.company_name}</td>
                <td>{album.total_orders}</td>
                <td>{album.total_units_sold}</td>
                {isAdmin && <td className="revenue-cell">{formatCurrency(album.total_revenue)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
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
    </div>
  );
};

export default AlbumDrilldownSection;

