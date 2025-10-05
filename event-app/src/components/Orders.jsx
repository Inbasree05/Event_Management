import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';

const Orders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE_URL}/booking/my`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        console.debug('Orders response status:', res.status);
        const data = await res.json().catch(() => ({}));
        console.debug('Orders response body:', data);
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            throw new Error('Please login again to view your orders.');
          }
          throw new Error(data.message || `Failed to fetch orders (status ${res.status})`);
        }
        
        setOrders(Array.isArray(data.bookings) ? data.bookings : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchOrders();
  }, [token]);

  if (loading) return <div style={{ padding: 16 }}>Loading your orders...</div>;
  if (error) return <div style={{ padding: 16, color: 'red' }}>Error: {error}</div>;

  if (!orders.length) {
    return <div style={{ padding: 16 }}>You have no orders yet.</div>;
  }

  const resolveImage = (src) => {
    if (!src) return null;
    if (/^https?:\/\//i.test(src)) return src;
    // If image is served by backend uploads, prefix API base
    if (src.startsWith('/uploads') || src.startsWith('uploads/')) {
      const normalized = src.startsWith('/') ? src : `/${src}`;
      return `${API_BASE_URL}${normalized}`;
    }
    // Otherwise, let frontend dev server/static handle it (e.g., /assets/...)
    return src;
  };

  return (
    <div style={{ padding: 16, color: '#fff' }}>
      <h2>Your Orders</h2>
      <div style={{ display: 'grid', gap: 16 }}>
        {orders.map((o) => (
          <div key={o._id} style={{ border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <strong>Order:</strong> {o.bookingId || o._id}
              </div>
              <div>
                <strong>Date:</strong> {o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}
              </div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <strong>Status:</strong> {o.status}
            </div>
            <div>
              <strong>Items:</strong>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginTop: 8 }}>
                {(o.items || []).map((it, idx) => {
                  const imgSrc = it.image || it.imageUrl;
                  const img = resolveImage(imgSrc);
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #f1f1f1', borderRadius: 8, padding: 8 }}>
                      {img ? (
                        <img src={img} alt={it.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, background: '#fafafa' }} />
                      ) : (
                        <div style={{ width: 64, height: 64, borderRadius: 6, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 12 }}>
                          No Image
                        </div>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{it.name}</span>
                        <span>Qty: {it.quantity || 1}</span>
                        <span>₹{Number(it.price || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <strong>Total:</strong> ₹{Number(o.totalAmount || 0).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
