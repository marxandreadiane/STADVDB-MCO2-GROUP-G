import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

/**
 * Admin Dashboard Component
 * 
 * Provides comprehensive CRUD (Create, Read, Update, Delete) operations
 * for managing the entire database through an intuitive UI.
 * 
 * Features:
 * - 5 Tabs: Orders, Albums, Artists, Companies, Users
 * - Full CRUD operations for each entity
 * - Modal forms for create/edit operations
 * - Delete confirmations to prevent accidents
 * - Role-based access control (admin only)
 * - Real-time data fetching
 * - Stock management for albums
 * - Order status updates
 * 
 * Access Control:
 * - Only users with role='admin' can access this page
 * - Redirects non-admin users to home page
 * 
 * Stock Management:
 * - Albums can be created/edited with stock_quantity field
 * - Stock validation happens on backend during orders
 * - Stock decrements automatically when orders are placed
 */
function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});

  const isAdmin = isAuthenticated && user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      setLoading(true);
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAdmin, activeTab]);

  const fetchData = () => {
    switch(activeTab) {
      case 'orders': fetchAllOrders(); break;
      case 'albums': fetchAlbums(); break;
      case 'artists': fetchArtists(); break;
      case 'companies': fetchCompanies(); break;
      case 'users': fetchUsers(); break;
      default: break;
    }
  };

  // FETCH OPERATIONS
  const fetchAllOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/orders');
      if (response.ok) setOrders(await response.json());
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlbums = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/albums');
      if (response.ok) setAlbums(await response.json());
    } catch (error) {
      console.error('Error fetching albums:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArtists = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/artists');
      if (response.ok) setArtists(await response.json());
    } catch (error) {
      console.error('Error fetching artists:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/companies');
      if (response.ok) setCompanies(await response.json());
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/users');
      if (response.ok) setUsers(await response.json());
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // CREATE/UPDATE OPERATIONS
  const handleSave = async () => {
    try {
      const isEditing = editingItem !== null;
      const url = getApiUrl(isEditing);
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(isEditing ? 'Updated successfully!' : 'Created successfully!');
        setShowModal(false);
        setEditingItem(null);
        setFormData({});
        fetchData();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Operation failed'}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving data');
    }
  };

  const getApiUrl = (isEditing) => {
    const base = 'http://localhost:5000/api/admin';
    const idField = getIdField();
    const id = isEditing ? editingItem[idField] : '';
    
    switch(activeTab) {
      case 'albums': return `${base}/albums${isEditing ? `/${id}` : ''}`;
      case 'artists': return `${base}/artists${isEditing ? `/${id}` : ''}`;
      case 'companies': return `${base}/companies${isEditing ? `/${id}` : ''}`;
      case 'users': return `${base}/users${isEditing ? `/${id}` : ''}`;
      default: return '';
    }
  };

  const getIdField = () => {
    switch(activeTab) {
      case 'albums': return 'album_id';
      case 'artists': return 'artist_id';
      case 'companies': return 'company_id';
      case 'users': return 'user_id';
      default: return 'id';
    }
  };

  // DELETE OPERATION
  const handleDelete = async (item) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const idField = getIdField();
      const id = item[idField];
      const response = await fetch(getApiUrl(true).replace(`/${id}`, '') + `/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Deleted successfully!');
        fetchData();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Delete failed'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting item');
    }
  };

  // ORDER STATUS UPDATE
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setOrders(orders.map(order => 
          order.order_id === orderId ? { ...order, status: newStatus } : order
        ));
        alert(`Order #${orderId} status updated to ${newStatus}`);
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating order status');
    }
  };

  // MODAL HANDLERS
  const openCreateModal = () => {
    setEditingItem(null);
    setFormData(getEmptyFormData());
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowModal(true);
  };

  const getEmptyFormData = () => {
    switch(activeTab) {
      case 'albums':
        return { title: '', artist_id: '', price: '', release_date: '', stock_quantity: '', image_url: '' };
      case 'artists':
        return { name: '', company_id: '', debut_date: '', country: '' };
      case 'companies':
        return { name: '', country: '', founded_year: '' };
      case 'users':
        return { username: '', email: '', password: '', phone: '', address: '', role: 'customer' };
      default:
        return {};
    }
  };

  // UTILITY FUNCTIONS
  const getStatusColor = (status) => {
    const colors = {
      'PENDING': '#ffa502', 'PAID': '#26de81', 'SHIPPED': '#4b7bec',
      'DELIVERED': '#20bf6b', 'CANCELLED': '#fc5c65'
    };
    return colors[status] || '#95a5a6';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(order => order.status === filter);

  // RENDER GUARDS
  if (!isAuthenticated) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <h2>🔒 Access Denied</h2>
          <p>Please log in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <h2>⛔ Unauthorized</h2>
          <p>You do not have admin privileges.</p>
          <p className="admin-hint">💡 Admin accounts: admin@kpopstore.com (password: admin123)</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // RENDER MAIN CONTENT
  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>🛡️ Admin Dashboard</h1>
        <p>Manage your store</p>
      </div>

      {/* TAB NAVIGATION */}
      <div className="admin-tabs">
        <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
          📦 Orders
        </button>
        <button className={activeTab === 'albums' ? 'active' : ''} onClick={() => setActiveTab('albums')}>
          💿 Albums
        </button>
        <button className={activeTab === 'artists' ? 'active' : ''} onClick={() => setActiveTab('artists')}>
          🎤 Artists
        </button>
        <button className={activeTab === 'companies' ? 'active' : ''} onClick={() => setActiveTab('companies')}>
          🏢 Companies
        </button>
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
          👥 Users
        </button>
      </div>

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <>
          <div className="admin-stats">
            <div className="stat-card">
              <span className="stat-number">{orders.length}</span>
              <span className="stat-label">Total Orders</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{orders.filter(o => o.status === 'PENDING').length}</span>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{orders.filter(o => o.status === 'PAID').length}</span>
              <span className="stat-label">Paid</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{orders.filter(o => o.status === 'SHIPPED').length}</span>
              <span className="stat-label">Shipped</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{orders.filter(o => o.status === 'DELIVERED').length}</span>
              <span className="stat-label">Delivered</span>
            </div>
          </div>

          <div className="admin-filters">
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All Orders</button>
            <button className={filter === 'PENDING' ? 'active' : ''} onClick={() => setFilter('PENDING')}>Pending</button>
            <button className={filter === 'PAID' ? 'active' : ''} onClick={() => setFilter('PAID')}>Paid</button>
            <button className={filter === 'SHIPPED' ? 'active' : ''} onClick={() => setFilter('SHIPPED')}>Shipped</button>
            <button className={filter === 'DELIVERED' ? 'active' : ''} onClick={() => setFilter('DELIVERED')}>Delivered</button>
          </div>

          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.order_id}>
                    <td className="order-id-cell">#{order.order_id}</td>
                    <td>
                      <div className="customer-info">
                        <div>{order.username}</div>
                        <div className="email">{order.email}</div>
                      </div>
                    </td>
                    <td>{formatDate(order.order_date)}</td>
                    <td className="amount">${parseFloat(order.total_amount).toFixed(2)}</td>
                    <td className="items-count">{order.item_count} items</td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.order_id, e.target.value)}
                        className="status-select"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredOrders.length === 0 && <div className="no-data">No orders found.</div>}
        </>
      )}

      {/* ALBUMS TAB */}
      {activeTab === 'albums' && (
        <>
          <div className="crud-header">
            <h2>Albums Management</h2>
            <button className="btn-create" onClick={openCreateModal}>➕ Add Album</button>
          </div>
          <div className="crud-table-container">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Artist</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Release Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {albums.map(album => (
                  <tr key={album.album_id}>
                    <td>{album.album_id}</td>
                    <td>{album.title}</td>
                    <td>{album.artist_name}</td>
                    <td>${parseFloat(album.price).toFixed(2)}</td>
                    <td>{album.stock_quantity}</td>
                    <td>{new Date(album.release_date).toLocaleDateString()}</td>
                    <td>
                      <button className="btn-edit" onClick={() => openEditModal(album)}>✏️ Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(album)}>🗑️ Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {albums.length === 0 && <div className="no-data">No albums found.</div>}
        </>
      )}

      {/* ARTISTS TAB */}
      {activeTab === 'artists' && (
        <>
          <div className="crud-header">
            <h2>Artists Management</h2>
            <button className="btn-create" onClick={openCreateModal}>➕ Add Artist</button>
          </div>
          <div className="crud-table-container">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Debut Date</th>
                  <th>Country</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {artists.map(artist => (
                  <tr key={artist.artist_id}>
                    <td>{artist.artist_id}</td>
                    <td>{artist.name}</td>
                    <td>{artist.company_name}</td>
                    <td>{new Date(artist.debut_date).toLocaleDateString()}</td>
                    <td>{artist.country}</td>
                    <td>
                      <button className="btn-edit" onClick={() => openEditModal(artist)}>✏️ Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(artist)}>🗑️ Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {artists.length === 0 && <div className="no-data">No artists found.</div>}
        </>
      )}

      {/* COMPANIES TAB */}
      {activeTab === 'companies' && (
        <>
          <div className="crud-header">
            <h2>Companies Management</h2>
            <button className="btn-create" onClick={openCreateModal}>➕ Add Company</button>
          </div>
          <div className="crud-table-container">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Country</th>
                  <th>Founded Year</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(company => (
                  <tr key={company.company_id}>
                    <td>{company.company_id}</td>
                    <td>{company.name}</td>
                    <td>{company.country}</td>
                    <td>{company.founded_year}</td>
                    <td>
                      <button className="btn-edit" onClick={() => openEditModal(company)}>✏️ Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(company)}>🗑️ Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {companies.length === 0 && <div className="no-data">No companies found.</div>}
        </>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <>
          <div className="crud-header">
            <h2>Users Management</h2>
            <button className="btn-create" onClick={openCreateModal}>➕ Add User</button>
          </div>
          <div className="crud-table-container">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(usr => (
                  <tr key={usr.user_id}>
                    <td>{usr.user_id}</td>
                    <td>{usr.username}</td>
                    <td>{usr.email}</td>
                    <td>{usr.phone}</td>
                    <td>
                      <span className={`role-badge role-${usr.role}`}>{usr.role}</span>
                    </td>
                    <td>
                      <button className="btn-edit" onClick={() => openEditModal(usr)}>✏️ Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(usr)}>🗑️ Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && <div className="no-data">No users found.</div>}
        </>
      )}

      {/* MODAL FOR CREATE/EDIT */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingItem ? 'Edit' : 'Create'} {activeTab.slice(0, -1)}</h2>
            <div className="modal-form">
              {activeTab === 'albums' && (
                <>
                  <input
                    type="text"
                    placeholder="Title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                  <select
                    value={formData.artist_id || ''}
                    onChange={(e) => setFormData({...formData, artist_id: e.target.value})}
                  >
                    <option value="">Select Artist</option>
                    {artists.map(a => <option key={a.artist_id} value={a.artist_id}>{a.name}</option>)}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                  <input
                    type="date"
                    placeholder="Release Date"
                    value={formData.release_date ? formData.release_date.split('T')[0] : ''}
                    onChange={(e) => setFormData({...formData, release_date: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Stock Quantity"
                    value={formData.stock_quantity || ''}
                    onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Image URL"
                    value={formData.image_url || ''}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  />
                </>
              )}
              {activeTab === 'artists' && (
                <>
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                  <select
                    value={formData.company_id || ''}
                    onChange={(e) => setFormData({...formData, company_id: e.target.value})}
                  >
                    <option value="">Select Company</option>
                    {companies.map(c => <option key={c.company_id} value={c.company_id}>{c.name}</option>)}
                  </select>
                  <input
                    type="date"
                    placeholder="Debut Date"
                    value={formData.debut_date ? formData.debut_date.split('T')[0] : ''}
                    onChange={(e) => setFormData({...formData, debut_date: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={formData.country || ''}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                  />
                </>
              )}
              {activeTab === 'companies' && (
                <>
                  <input
                    type="text"
                    placeholder="Name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={formData.country || ''}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Founded Year"
                    value={formData.founded_year || ''}
                    onChange={(e) => setFormData({...formData, founded_year: e.target.value})}
                  />
                </>
              )}
              {activeTab === 'users' && (
                <>
                  <input
                    type="text"
                    placeholder="Username"
                    value={formData.username || ''}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                  <select
                    value={formData.role || 'customer'}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                  </select>
                </>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-save" onClick={handleSave}>💾 Save</button>
              <button className="btn-cancel" onClick={() => setShowModal(false)}>❌ Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
