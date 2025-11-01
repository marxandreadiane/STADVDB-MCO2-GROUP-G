import React, { useState, useEffect } from 'react';
import './Reports.css';

function Reports() {
  const [loading, setLoading] = useState(true);
  const [salesByCompany, setSalesByCompany] = useState([]);
  const [salesByArtist, setSalesByArtist] = useState([]);
  const [salesByAlbum, setSalesByAlbum] = useState([]);
  const [salesByStatus, setSalesByStatus] = useState([]);
  const [salesTrends, setSalesTrends] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const responses = await Promise.all([
        fetch('http://localhost:5000/api/reports/rollup-sales?level=company'),
        fetch('http://localhost:5000/api/reports/rollup-sales?level=artist'),
        fetch('http://localhost:5000/api/reports/rollup-sales?level=album'),
        fetch('http://localhost:5000/api/reports/slice/status'),
        fetch('http://localhost:5000/api/reports/sales-trends'),
        fetch('http://localhost:5000/api/reports/dice')
      ]);

      const [companyData, artistData, albumData, statusData, trendsData, recentData] = await Promise.all(
        responses.map(r => r.json())
      );

      setSalesByCompany(companyData);
      setSalesByArtist(artistData);
      setSalesByAlbum(albumData.slice(0, 15));
      setSalesByStatus(statusData);
      setSalesTrends(trendsData);
      setRecentOrders(recentData.slice(0, 15));
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    return '' + num.toFixed(2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getMaxValue = (data, key) => {
    if (!data || data.length === 0) return 1;
    return Math.max(...data.map(item => parseFloat(item[key] || 0)));
  };

  const getBarWidth = (value, maxValue) => {
    const width = (parseFloat(value || 0) / maxValue) * 100;
    return width + '%';
  };

  if (loading) {
    return (
      <div className="reports-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading comprehensive reports...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = salesByCompany.reduce((sum, c) => sum + parseFloat(c.total_revenue || 0), 0);
  const totalOrders = salesByCompany.reduce((sum, c) => sum + parseInt(c.total_orders || 0), 0);
  const totalUnits = salesByCompany.reduce((sum, c) => sum + parseInt(c.total_units_sold || 0), 0);

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1>Sales Analytics Dashboard</h1>
        <p>Comprehensive OLAP Analysis & Business Intelligence</p>
      </div>

      <div className="summary-cards">
        <div className="summary-card purple">
          <div className="card-icon"></div>
          <div className="card-content">
            <h3>Total Revenue</h3>
            <p className="card-value">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
        <div className="summary-card blue">
          <div className="card-icon"></div>
          <div className="card-content">
            <h3>Total Orders</h3>
            <p className="card-value">{totalOrders}</p>
          </div>
        </div>
        <div className="summary-card green">
          <div className="card-icon"></div>
          <div className="card-content">
            <h3>Albums Sold</h3>
            <p className="card-value">{totalUnits}</p>
          </div>
        </div>
        <div className="summary-card orange">
          <div className="card-icon"></div>
          <div className="card-content">
            <h3>Active Companies</h3>
            <p className="card-value">{salesByCompany.length}</p>
          </div>
        </div>
      </div>

      <div className="report-section">
        <div className="section-header">
          <h2> ROLL UP: Sales by Company</h2>
          <p>Hierarchical aggregation at company level</p>
        </div>
        <div className="chart-container">
          {salesByCompany.map((company, idx) => {
            const maxRevenue = getMaxValue(salesByCompany, 'total_revenue');
            return (
              <div key={idx} className="bar-item">
                <div className="bar-label">
                  <span className="label-text">{company.company_name}</span>
                  <span className="label-value">{formatCurrency(company.total_revenue)}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill purple-bar" style={{width: getBarWidth(company.total_revenue, maxRevenue)}}>
                    <span className="bar-text">{company.total_orders} orders</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="report-section">
        <div className="section-header">
          <h2> ROLL UP: Top Performing Artists</h2>
          <p>Sales performance by artist across all companies</p>
        </div>
        <div className="chart-container">
          {salesByArtist.slice(0, 10).map((artist, idx) => {
            const maxRevenue = getMaxValue(salesByArtist, 'total_revenue');
            return (
              <div key={idx} className="bar-item">
                <div className="bar-label">
                  <span className="label-text">
                    <strong>{artist.artist_name}</strong>
                    <small> ({artist.company_name})</small>
                  </span>
                  <span className="label-value">{formatCurrency(artist.total_revenue)}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill blue-bar" style={{width: getBarWidth(artist.total_revenue, maxRevenue)}}>
                    <span className="bar-text">{artist.total_units_sold} units</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="report-section">
        <div className="section-header">
          <h2> DRILL DOWN: Best-Selling Albums</h2>
          <p>Most detailed level - individual album performance</p>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Album</th>
                <th>Artist</th>
                <th>Company</th>
                <th>Orders</th>
                <th>Units</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {salesByAlbum.map((album, idx) => (
                <tr key={idx}>
                  <td className="rank-cell">#{idx + 1}</td>
                  <td className="album-cell">{album.album_title}</td>
                  <td>{album.artist_name}</td>
                  <td>{album.company_name}</td>
                  <td>{album.total_orders}</td>
                  <td>{album.total_units_sold}</td>
                  <td className="revenue-cell">{formatCurrency(album.total_revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="report-section">
        <div className="section-header">
          <h2> SLICE: Sales by Order Status</h2>
          <p>Single dimension analysis - filtering by order status</p>
        </div>
        <div className="status-grid">
          {salesByStatus.map((status, idx) => (
            <div key={idx} className="status-card">
              <div className={`status-indicator ${status.status.toLowerCase()}`}></div>
              <h3>{status.status}</h3>
              <div className="status-stats">
                <div className="stat-item">
                  <span className="stat-label">Orders</span>
                  <span className="stat-value">{status.total_orders}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Revenue</span>
                  <span className="stat-value">{formatCurrency(status.total_revenue)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Avg Value</span>
                  <span className="stat-value">{formatCurrency(status.avg_order_value)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="report-section">
        <div className="section-header">
          <h2> TIME SERIES: Sales Trends (Last 30 Days)</h2>
          <p>Daily sales performance and order volume trends</p>
        </div>
        <div className="trend-chart">
          {salesTrends.map((trend, idx) => {
            const maxRevenue = getMaxValue(salesTrends, 'revenue');
            const maxOrders = getMaxValue(salesTrends, 'orders');
            return (
              <div key={idx} className="trend-item">
                <div className="trend-date">{formatDate(trend.date)}</div>
                <div className="trend-bars">
                  <div className="trend-bar-group">
                    <div className="trend-bar-label">Revenue</div>
                    <div className="trend-bar-track">
                      <div className="trend-bar-fill green-bar" style={{width: getBarWidth(trend.revenue, maxRevenue)}}></div>
                    </div>
                    <div className="trend-value">{formatCurrency(trend.revenue)}</div>
                  </div>
                  <div className="trend-bar-group">
                    <div className="trend-bar-label">Orders</div>
                    <div className="trend-bar-track">
                      <div className="trend-bar-fill orange-bar" style={{width: getBarWidth(trend.orders, maxOrders)}}></div>
                    </div>
                    <div className="trend-value">{trend.orders}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="report-section">
        <div className="section-header">
          <h2> DICE: Recent Transaction Details</h2>
          <p>Multi-dimensional view - Recent orders with all dimensions</p>
        </div>
        <div className="table-wrapper">
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
                  <td><span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span></td>
                  <td>{order.username}</td>
                  <td>{order.album_title}</td>
                  <td>{order.artist_name}</td>
                  <td>{order.quantity}</td>
                  <td className="revenue-cell">{formatCurrency(order.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="report-section">
        <div className="section-header">
          <h2> Performance Insights</h2>
          <p>Key metrics and comparative analysis</p>
        </div>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>Top Company</h4>
            <p className="insight-value">{salesByCompany[0]?.company_name || 'N/A'}</p>
            <p className="insight-subtitle">{formatCurrency(salesByCompany[0]?.total_revenue || 0)}</p>
          </div>
          <div className="insight-card">
            <h4>Top Artist</h4>
            <p className="insight-value">{salesByArtist[0]?.artist_name || 'N/A'}</p>
            <p className="insight-subtitle">{salesByArtist[0]?.total_units_sold || 0} units sold</p>
          </div>
          <div className="insight-card">
            <h4>Best Album</h4>
            <p className="insight-value">{salesByAlbum[0]?.album_title || 'N/A'}</p>
            <p className="insight-subtitle">{formatCurrency(salesByAlbum[0]?.total_revenue || 0)}</p>
          </div>
          <div className="insight-card">
            <h4>Avg Order Value</h4>
            <p className="insight-value">{formatCurrency(totalRevenue / totalOrders)}</p>
            <p className="insight-subtitle">Across all orders</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
