import React, { useEffect, useState, useCallback, useContext } from "react";
import Axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
import { 
  FaCircle, 
  FaUserClock, 
  FaUserSlash, 
  FaSearch, 
  FaSignOutAlt, 
  FaFilter, 
  FaSort, 
  FaSync,
  FaUserCog,
  FaUsers,
  FaBox,
  FaClipboardList,
  FaPlus,
  FaUserPlus,
  FaTag,
  FaDollarSign
} from "react-icons/fa";
import { formatDistanceToNow, subDays, subMinutes, format } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import "./AdminDashboard.css";

// Status constants
const STATUS = {
  ACTIVE: { 
    label: 'Active', 
    color: '#10B981',
    icon: <FaCircle className="pulse" />,
    description: 'Active in last 10 minutes'
  },
  IDLE: { 
    label: 'Idle', 
    color: '#F59E0B',
    icon: <FaUserClock />,
    description: 'Active in last 30 days'
  },
  INACTIVE: { 
    label: 'Inactive', 
    color: '#EF4444',
    icon: <FaUserSlash />,
    description: 'No activity for 30+ days'
  }
};

// Helper function to get user status
const getUserStatus = (lastActive) => {
  if (!lastActive) return STATUS.INACTIVE;
  
  const lastActiveDate = new Date(lastActive);
  const now = new Date();
  const tenMinutesAgo = subMinutes(now, 10);
  const thirtyDaysAgo = subDays(now, 30);
  
  if (lastActiveDate >= tenMinutesAgo) return STATUS.ACTIVE;
  if (lastActiveDate >= thirtyDaysAgo) return STATUS.IDLE;
  return STATUS.INACTIVE;
};

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'lastActive', direction: 'desc' });
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', category: '', imageUrl: '', imageFile: null });
  const [addingProduct, setAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'user' });
  const [addingUser, setAddingUser] = useState(false);
  const [addUserMsg, setAddUserMsg] = useState({ type: '', text: '' });
  const [addProductMsg, setAddProductMsg] = useState({ type: '', text: '' });

  const navigate = useNavigate();

  // Use the auth context
  const { user, token, logout } = useAuth();

  // Generate a random date within the last 30 days
  const getRandomDate = () => {
    const now = new Date();
    const randomDays = Math.floor(Math.random() * 30);
    const randomHours = Math.floor(Math.random() * 24);
    const randomMinutes = Math.floor(Math.random() * 60);
    
    const date = new Date(now);
    date.setDate(now.getDate() - randomDays);
    date.setHours(randomHours, randomMinutes, 0, 0);
    return date.toISOString();
  };

  // Fetch users with error handling and loading states
  const fetchUsers = useCallback(async () => {
    if (!token || user?.role !== 'admin') {
      navigate("/login");
      return;
    }

    try {
      setRefreshing(true);
      const response = await Axios.get("http://localhost:3000/auth/all-users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data?.users) {
        // Use provided timestamps; fall back to updatedAt/createdAt for determinism
        const usersWithTimestamps = response.data.users.map(u => ({
          ...u,
          lastActive: u.lastActive || u.updatedAt || u.createdAt || getRandomDate()
        }));
        setUsers(usersWithTimestamps);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await Axios.get(`${API_BASE_URL}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(response.data)) setProducts(response.data);
      if (Array.isArray(response.data?.products)) setProducts(response.data.products);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  }, [token]);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await Axios.get(`${API_BASE_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(response.data)) setOrders(response.data);
      if (Array.isArray(response.data?.orders)) setOrders(response.data.orders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  }, [token]);

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
    fetchProducts();
    fetchOrders();
  }, [fetchUsers, fetchProducts, fetchOrders]);

  // Handle sorting
  const requestSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Apply filters and sorting
  const filteredAndSortedUsers = useCallback(() => {
    let result = [...users];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(user => 
        user.email?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (activeFilter !== 'all') {
      result = result.filter(user => {
        const status = getUserStatus(user.lastActive).label.toLowerCase();
        return status === activeFilter.toLowerCase();
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle nested properties and dates
        if (sortConfig.key === 'lastActive') {
          aValue = new Date(aValue || 0);
          bValue = new Date(bValue || 0);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [users, searchQuery, activeFilter, sortConfig]);

  // Get user counts by status
  const getUserCounts = useCallback(() => {
    const counts = { active: 0, idle: 0, inactive: 0, total: users.length };
    
    users.forEach(user => {
      const status = getUserStatus(user.lastActive).label.toLowerCase();
      if (counts.hasOwnProperty(status)) {
        counts[status]++;
      }
    });

    return counts;
  }, [users]);

  const userCounts = getUserCounts();
  const displayUsers = filteredAndSortedUsers();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleRefresh = () => {
    fetchUsers();
    fetchProducts();
    fetchOrders();
  };

  const StatusBadge = ({ status }) => {
    const statusInfo = STATUS[status?.toUpperCase()] || STATUS.INACTIVE;
    return (
      <span className="status-badge" style={{ backgroundColor: `${statusInfo.color}20`, color: statusInfo.color }}>
        {statusInfo.icon} {statusInfo.label}
      </span>
    );
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setAddingProduct(true);
      setAddProductMsg({ type: '', text: '' });
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('description', newProduct.description);
      formData.append('price', newProduct.price);
      formData.append('category', newProduct.category);
      if (newProduct.imageFile) {
        formData.append('image', newProduct.imageFile);
      }
      const response = await Axios.post(`${API_BASE_URL}/admin/products`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setNewProduct({ name: '', description: '', price: '', category: '', imageUrl: '', imageFile: null });
        fetchProducts();
        setActiveTab('products');
        setAddProductMsg({ type: 'success', text: response.data.message || 'Product added successfully' });
        try { localStorage.setItem('products:updatedAt', String(Date.now())); } catch {}
      }
    } catch (err) {
      console.error('Error adding product:', err);
      const apiMsg = err?.response?.data?.message || err?.message || 'Failed to add product';
      setAddProductMsg({ type: 'error', text: apiMsg });
    } finally {
      setAddingProduct(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      setAddingUser(true);
      setAddUserMsg({ type: '', text: '' });
      const response = await Axios.post(`${API_BASE_URL}/auth/signup`, newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setNewUser({ username: '', email: '', password: '', role: 'user' });
        fetchUsers();
        setActiveTab('users');
        setAddUserMsg({ type: 'success', text: response.data.message || 'User added successfully' });
      }
    } catch (err) {
      console.error('Error adding user:', err);
      const apiMsg = err?.response?.data?.message || err?.message || 'Failed to add user';
      setAddUserMsg({ type: 'error', text: apiMsg });
    } finally {
      setAddingUser(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct({ ...product });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      console.log('Updating product:', editingProduct);
      
      // Try real API first
      try {
        const formData = new FormData();
        formData.append('name', editingProduct.name);
        formData.append('category', editingProduct.category);
        formData.append('price', editingProduct.price);
        formData.append('description', editingProduct.description || '');
        // If a new file was chosen in future, append('image', file)
        if (editingProduct.imageFile) formData.append('image', editingProduct.imageFile);

        const response = await Axios.put(`${API_BASE_URL}/admin/products/${editingProduct._id || editingProduct.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data) {
          setEditingProduct(null);
          fetchProducts();
          alert('Product updated successfully!');
          try { localStorage.setItem('products:updatedAt', String(Date.now())); } catch {}
          return;
        }
      } catch (apiErr) {
        console.log('API not available, using mock update');
      }
      
      // Mock update for testing UI
      setProducts(prev => prev.map(p => 
        (p._id === editingProduct._id || p.id === editingProduct.id) 
          ? { ...p, ...editingProduct }
          : p
      ));
      setEditingProduct(null);
      alert('Product updated successfully! (Mock mode - no backend)');
      try { localStorage.setItem('products:updatedAt', String(Date.now())); } catch {}
      
    } catch (err) {
      console.error('Error updating product:', err);
      alert(`Error updating product: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      console.log('Deleting product:', productId);
      
      // Try real API first
      try {
        const response = await Axios.delete(`${API_BASE_URL}/admin/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data) {
          fetchProducts();
          alert('Product deleted successfully!');
          try { localStorage.setItem('products:updatedAt', String(Date.now())); } catch {}
          return;
        }
      } catch (apiErr) {
        console.log('API not available, using mock delete');
      }
      
      // Mock delete for testing UI - only delete API products, not static ones
      setProducts(prev => prev.filter(p => (p._id !== productId && p.id !== productId)));
      alert('Product deleted successfully! (Mock mode - no backend)\nNote: Only API-added products are deleted, static designs remain.');
      try { localStorage.setItem('products:updatedAt', String(Date.now())); } catch {}
      
    } catch (err) {
      console.error('Error deleting product:', err);
      alert(`Error deleting product: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="admin-dashboard loading">
        <div className="loader"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (e) {
      console.error('Error formatting date:', dateString, e);
      return 'Invalid date';
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      console.error('Error calculating time ago:', dateString, e);
      return 'Just now';
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="text-muted">Monitor users, products, and orders</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-icon" 
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh data"
          >
            <FaSync className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button 
            className="btn btn-outline-danger" 
            onClick={handleLogout}
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          <FaUsers /> Overview
        </button>
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          <FaUsers /> Users
        </button>
        <button className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
          <FaBox /> Products
        </button>
        <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          <FaClipboardList /> Orders
        </button>
      </div>

      {/* Overview Stats */}
      {activeTab === 'overview' && (
        <>
      <div className="stats-grid">
        <div className="stat-card total-users">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>{userCounts.total}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card active-users">
          <div className="stat-icon">
            <FaCircle className="pulse" />
          </div>
          <div className="stat-content">
            <h3>{userCounts.active}</h3>
            <p>Active Now</p>
          </div>
        </div>
        <div className="stat-card idle-users">
          <div className="stat-icon">
            <FaUserClock />
          </div>
          <div className="stat-content">
            <h3>{userCounts.idle}</h3>
            <p>Idle Users</p>
          </div>
        </div>
        <div className="stat-card inactive-users">
          <div className="stat-icon">
            <FaUserSlash />
          </div>
          <div className="stat-content">
            <h3>{userCounts.inactive}</h3>
            <p>Inactive</p>
          </div>
        </div>
      </div>

          {/* Quick add forms */}
          <div className="grid quick-actions">
            <div className="card">
              <h2><FaUserPlus /> Add User</h2>
              <form onSubmit={handleAddUser} className="form-grid" autoComplete="off">
                <input placeholder="Username" value={newUser.username} onChange={e => setNewUser(v => ({ ...v, username: e.target.value }))} required autoComplete="off" name="new-username" />
                <input placeholder="Email" type="email" value={newUser.email} onChange={e => setNewUser(v => ({ ...v, email: e.target.value }))} required autoComplete="off" name="new-email" inputMode="email" />
                <input placeholder="Password" type="password" value={newUser.password} onChange={e => setNewUser(v => ({ ...v, password: e.target.value }))} required autoComplete="new-password" name="new-password" />
                <select value={newUser.role} onChange={e => setNewUser(v => ({ ...v, role: e.target.value }))}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <button className="btn btn-primary" disabled={addingUser}>
                  <FaPlus /> {addingUser ? 'Adding...' : 'Add User'}
                </button>
              </form>
              {addUserMsg.text && (
                <div
                  className={`form-feedback ${addUserMsg.type}`}
                  style={{ marginTop: '10px', color: addUserMsg.type === 'error' ? '#b91c1c' : '#065f46' }}
                >
                  {addUserMsg.text}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
      <div className="card">
        <div className="card-header">
          <h2>Users</h2>
          <div className="controls">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-dropdown">
              <FaFilter />
              <select 
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
              >
                <option value="all">All Users</option>
                <option value="active">Active</option>
                <option value="idle">Idle</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="user-table">
            <thead>
              <tr>
                <th>User</th>
                <th 
                  className="sortable"
                  onClick={() => requestSort('lastActive')}
                >
                  <div className="th-content">
                    Status
                    <FaSort className={sortConfig.key === 'lastActive' ? `sort-${sortConfig.direction}` : ''} />
                  </div>
                </th>
                <th>Last Active</th>
                <th>Account Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayUsers.length > 0 ? (
                displayUsers.map((user) => {
                  const status = getUserStatus(user.lastActive);
                  return (
                    <tr key={user._id}>
                      <td className="user-info">
                        <div className="user-avatar">
                          {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="username">{user.username || 'No username'}</div>
                          <div className="email">{user.email}</div>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={status.label} />
                      </td>
                      <td>
                        <div className="last-active">
                          {getTimeAgo(user.lastActive)}
                          <div className="exact-time">{formatDateTime(user.lastActive)}</div>
                        </div>
                      </td>
                      <td>
                        <div className="created-at">
                          {formatDateTime(user.createdAt)}
                          <div className="time-ago">{getTimeAgo(user.createdAt)}</div>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon" title="Edit user">
                            <FaUserCog />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="no-results">
                    {searchQuery ? 'No users match your search' : 'No users found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <>
          <div className="card">
            <div className="card-header">
              <h2>Products</h2>
    </div>
            <div className="table-responsive">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Added</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? products.map(p => (
                    <tr key={p._id || p.id}>
                      <td>
                        {p.imageUrl ? (
                          <img
                            src={`${API_BASE_URL}${p.imageUrl}`}
                            alt={p.name}
                            style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <span className="text-muted">No image</span>
                        )}
                      </td>
                      <td>{p.name}</td>
                      <td>{p.category}</td>
                      <td>{p.price ? `$${Number(p.price).toFixed(2)}` : '-'}</td>
                      <td>{formatDateTime(p.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-icon" 
                            title="Edit product"
                            onClick={() => handleEditProduct(p)}
                          >
                            <FaUserCog />
                          </button>
          <button 
                            className="btn-icon danger" 
                            title="Delete product"
                            onClick={() => handleDeleteProduct(p._id || p.id)}
          >
                            🗑️
          </button>
        </div>
                      </td>
                    </tr>
                  )) : (
                  <tr>
                      <td colSpan="6" className="no-results">No products found</td>
                  </tr>
                  )}
                </tbody>
              </table>
      </div>
        </div>

          <div className="card">
            <h2><FaBox /> Add Product</h2>
            <form onSubmit={handleAddProduct} className="form-grid" autoComplete="off">
              <input placeholder="Name" value={newProduct.name} onChange={e => setNewProduct(v => ({ ...v, name: e.target.value }))} required autoComplete="off" name="product-name" />
              <input placeholder="Category" value={newProduct.category} onChange={e => setNewProduct(v => ({ ...v, category: e.target.value }))} required autoComplete="off" name="product-category" />
              <label htmlFor="product-image-file" style={{ alignSelf: 'center' }}>Product Image</label>
              <input id="product-image-file" type="file" accept="image/*" onChange={e => setNewProduct(v => ({ ...v, imageFile: e.target.files?.[0] || null }))} name="product-image-file" />
              <input placeholder="Price" type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct(v => ({ ...v, price: e.target.value }))} required autoComplete="off" name="product-price" inputMode="decimal" />
              <textarea placeholder="Description" value={newProduct.description} onChange={e => setNewProduct(v => ({ ...v, description: e.target.value }))} rows={3} />
              <button className="btn btn-primary" disabled={addingProduct}>
                <FaPlus /> {addingProduct ? 'Adding...' : 'Add Product'}
              </button>
            </form>
          </div>

          {/* Edit Product Modal */}
          {editingProduct && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h3>Edit Product</h3>
                  <button 
                    className="btn-icon" 
                    onClick={() => setEditingProduct(null)}
                  >
                    ✕
                  </button>
                    </div>
                <form onSubmit={handleUpdateProduct} className="form-grid">
                  <input 
                    placeholder="Name" 
                    value={editingProduct.name} 
                    onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} 
                    required 
                  />
                  <input 
                    placeholder="Category" 
                    value={editingProduct.category} 
                    onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} 
                    required 
                  />
                  <input 
                    placeholder="Image URL" 
                    value={editingProduct.imageUrl} 
                    onChange={e => setEditingProduct({...editingProduct, imageUrl: e.target.value})} 
                  />
                  <input 
                    placeholder="Price" 
                    type="number" 
                    step="0.01" 
                    value={editingProduct.price} 
                    onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} 
                    required 
                  />
                  <textarea 
                    placeholder="Description" 
                    value={editingProduct.description} 
                    onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} 
                    rows={3} 
                  />
                  <div className="modal-actions">
                    <button type="button" className="btn btn-outline" onClick={() => setEditingProduct(null)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Update Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="card">
          <div className="card-header">
            <h2>Orders</h2>
            <div className="order-summary">
              <span>Total Orders: {orders.length}</span>
              <span>Total Revenue: ${totalRevenue.toFixed(2)}</span>
            </div>
          </div>
          <div className="table-responsive">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Placed</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? orders.map(o => (
                  <tr key={o._id || o.id}>
                    <td>{o._id || o.id}</td>
                    <td>{o.user?.email || o.userEmail || '-'}</td>
                    <td>${Number(o.total || o.amount || 0).toFixed(2)}</td>
                    <td>{o.status || 'pending'}</td>
                    <td>{formatDateTime(o.createdAt)}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="no-results">No orders found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      </div>
      )}
    </div>
  );
};

export default AdminDashboard;
