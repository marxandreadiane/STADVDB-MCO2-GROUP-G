import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [albums, setAlbums] = useState([]);
  const [topAlbums, setTopAlbums] = useState([]);
  const [salesReport, setSalesReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch albums
      const albumsRes = await fetch('http://localhost:5000/api/albums');
      const albumsData = await albumsRes.json();
      setAlbums(Array.isArray(albumsData) ? albumsData : []);

      // Fetch top albums report
      const topAlbumsRes = await fetch('http://localhost:5000/api/reports/top-albums');
      const topAlbumsData = await topAlbumsRes.json();
      setTopAlbums(Array.isArray(topAlbumsData) ? topAlbumsData : []);

      // Fetch sales report
      const salesRes = await fetch('http://localhost:5000/api/reports/sales');
      const salesData = await salesRes.json();
      setSalesReport(Array.isArray(salesData) ? salesData : []);

      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) return <div className="App"><h2>Loading...</h2></div>;
  if (error) return (
    <div className="App">
      <h2>Error: {error}</h2>
      <p>Check the console for more details</p>
      <button onClick={fetchData}>Retry</button>
    </div>
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎵 KPop Store Dashboard</h1>
      </header>

      <div style={{ padding: '20px' }}>
        <section style={{ marginBottom: '40px' }}>
          <h2>📀 All Albums ({albums.length})</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#282c34', color: 'white' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Album Name</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Artist</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Company</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {albums.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '10px', textAlign: 'center' }}>No albums found</td>
                </tr>
              ) : (
                albums.map((album) => (
                  <tr key={album.album_id}>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{album.album_id}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{album.album_name}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{album.artist_name}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{album.company_name}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>${album.price}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2>🏆 Top 5 Albums by Sales</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#282c34', color: 'white' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Album Name</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {topAlbums.map((album, index) => (
                <tr key={index}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{album.album_name}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{album.total_sales}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2>📊 Sales by Company</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#282c34', color: 'white' }}>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Company Name</th>
                <th style={{ padding: '10px', border: '1px solid #ddd' }}>Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {salesReport.map((company, index) => (
                <tr key={index}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{company.company_name}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>${company.total_sales}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

export default App;
