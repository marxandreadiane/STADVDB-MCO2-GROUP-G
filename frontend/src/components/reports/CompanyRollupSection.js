import React, { useState, useEffect, useMemo } from 'react';

const PAGE_SIZE = 10;

const CompanyRollupSection = ({ data, isAdmin, getBarWidth, formatCurrency }) => {
  const [page, setPage] = useState(0);
  const maxValue = isAdmin
    ? Math.max(...data.map(item => parseFloat(item.total_revenue || 0)), 1)
    : Math.max(...data.map(item => parseFloat(item.total_orders || 0)), 1);
  const totalPages = Math.ceil(data.length / PAGE_SIZE);
  const showPagination = totalPages > 1;

  const visibleData = useMemo(() => {
    if (!showPagination) return data;
    const start = page * PAGE_SIZE;
    return data.slice(start, start + PAGE_SIZE);
  }, [data, page, showPagination]);

  useEffect(() => {
    setPage(0);
  }, [data.length]);

  return (
    <div className="report-section">
      <div className="section-header">
        <h2>{isAdmin ? 'ROLL UP: Sales by Company' : 'Popular Companies'}</h2>
        <p>{isAdmin ? 'Hierarchical aggregation at company level' : 'Companies ranked by popularity'}</p>
      </div>
      <div className="chart-container fixed-height">
        {visibleData.map((company, idx) => {
          const barValue = isAdmin ? company.total_revenue : company.total_orders;
          return (
            <div key={idx} className="bar-item">
              <div className="bar-label">
                <span className="label-text">{company.company_name}</span>
                <span className="label-value">
                  {isAdmin ? formatCurrency(company.total_revenue) : `${company.total_orders} orders`}
                </span>
              </div>
              <div className="bar-track">
                <div className="bar-fill purple-bar" style={{ width: getBarWidth(barValue, maxValue) }}>
                  <span className="bar-text">{company.total_units_sold} albums sold</span>
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

export default CompanyRollupSection;

