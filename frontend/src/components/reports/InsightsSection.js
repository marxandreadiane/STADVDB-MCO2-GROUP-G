import React from 'react';

const InsightsSection = ({ salesByCompany, salesByArtist, salesByAlbum, isAdmin, formatCurrency, totalRevenue, totalOrders }) => {
  const bestAlbum = React.useMemo(() => {
    if (!salesByAlbum?.length) return null;
    const grouped = salesByAlbum.reduce((acc, album) => {
      const baseTitle = album.album_title.split('-')[0]?.trim() || album.album_title;
      if (!acc[baseTitle]) {
        acc[baseTitle] = {
          baseTitle,
          artist_name: album.artist_name,
          total_units_sold: 0,
          total_revenue: 0,
        };
      }
      acc[baseTitle].total_units_sold += parseFloat(album.total_units_sold || 0);
      acc[baseTitle].total_revenue += parseFloat(album.total_revenue || 0);
      return acc;
    }, {});
    const values = Object.values(grouped);
    values.sort((a, b) => {
      const metricA = isAdmin ? parseFloat(b.total_revenue) - parseFloat(a.total_revenue) : parseFloat(b.total_units_sold) - parseFloat(a.total_units_sold);
      return metricA;
    });
    return values[0];
  }, [salesByAlbum, isAdmin]);

  return (
  <div className="report-section">
    <div className="section-header">
      <h2> Performance Insights</h2>
      <p>Key metrics and comparative analysis</p>
    </div>
    <div className="insights-grid">
      <div className="insight-card">
        <h4>Top Company</h4>
        <p className="insight-value">{salesByCompany[0]?.company_name || 'N/A'}</p>
        {isAdmin ? (
          <p className="insight-subtitle">{formatCurrency(salesByCompany[0]?.total_revenue || 0)}</p>
        ) : (
          <p className="insight-subtitle">{salesByCompany[0]?.total_orders || 0} orders</p>
        )}
      </div>
      <div className="insight-card">
        <h4>Top Artist</h4>
        <p className="insight-value">{salesByArtist[0]?.artist_name || 'N/A'}</p>
        <p className="insight-subtitle">{salesByArtist[0]?.total_units_sold || 0} albums sold</p>
      </div>
      <div className="insight-card">
        <h4>Best Album</h4>
        <p className="insight-value">{bestAlbum?.baseTitle || 'N/A'}</p>
        <p className="insight-subtitle">
          {bestAlbum?.artist_name ? `by ${bestAlbum.artist_name}` : ' '}
        </p>
        {isAdmin ? (
          <p className="insight-subtitle">{formatCurrency(bestAlbum?.total_revenue || 0)}</p>
        ) : (
          <p className="insight-subtitle">{bestAlbum?.total_units_sold || 0} units</p>
        )}
      </div>
      {isAdmin ? (
        <div className="insight-card">
          <h4>Avg Order Value</h4>
          <p className="insight-value">
            {totalOrders > 0 ? formatCurrency(totalRevenue / totalOrders) : formatCurrency(0)}
          </p>
          <p className="insight-subtitle">Across all orders</p>
        </div>
      ) : (
        <div className="insight-card">
          <h4>Total Albums</h4>
          <p className="insight-value">{salesByAlbum.length}</p>
          <p className="insight-subtitle">Available titles</p>
        </div>
      )}
    </div>
  </div>
);
};

export default InsightsSection;


