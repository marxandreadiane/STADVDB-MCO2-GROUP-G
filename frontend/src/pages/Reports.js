import React, { useState, useEffect } from 'react';
import './Reports.css';

function Reports() {
  const [topAlbums, setTopAlbums] = useState([]);
  const [salesReport, setSalesReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      const [topAlbumsRes, salesRes] = await Promise.all([
        fetch('http://localhost:5000/api/reports/top-albums'),
        fetch('http://localhost:5000/api/reports/sales')
      ]);

      const topAlbumsData = await topAlbumsRes.json();
      const salesData = await salesRes.json();

      setTopAlbums(Array.isArray(topAlbumsData) ? topAlbumsData : []);
      setSalesReport(Array.isArray(salesData) ? salesData : []);
      
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) return <div className="reports"><h2>Loading reports...</h2></div>;
  if (error) return (
    <div className="reports">
      <h2>Error: {error}</h2>
      <button onClick={fetchReports}>Retry</button>
    </div>
  );

  return (
    <div className="reports">
      <div className="reports-header">
        <h1>📊 Sales Reports & Analytics</h1>
        <p>View performance metrics and sales data</p>
      </div>

      <div className="reports-container">
        <section className="report-section">
          <h2>🏆 Top 5 Albums by Sales</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Album Name</th>
                  <th>Artist</th>
                  <th>Total Sales</th>
                </tr>
              </thead>
              <tbody>
                {topAlbums.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>No data available</td>
                  </tr>
                ) : (
                  topAlbums.map((album, index) => (
                    <tr key={index}>
                      <td className="rank">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </td>
                      <td className="album-name">{album.album_name}</td>
                      <td>{album.artist_name}</td>
                      <td className="highlight">{album.total_sales || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="report-section">
          <h2>🏢 Sales by Company</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Total Orders</th>
                  <th>Total Sales</th>
                </tr>
              </thead>
              <tbody>
                {salesReport.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center' }}>No data available</td>
                  </tr>
                ) : (
                  salesReport.map((company, index) => (
                    <tr key={index}>
                      <td className="company-name">{company.company_name}</td>
                      <td>{company.total_orders || 0}</td>
                      <td className="highlight">${company.total_sales || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Reports;
