import { useCallback, useEffect, useState } from 'react';
import client, { errorMessage } from '../api/client.js';

const LABEL = {
  pending: 'New order',
  accepted: 'Accepted',
  preparing: 'Preparing',
  on_the_way: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

// what the restaurant can do next at each status
const ACTIONS = {
  pending: [
    { label: 'Accept', status: 'accepted' },
    { label: 'Reject', status: 'cancelled', danger: true },
  ],
  accepted: [{ label: 'Start preparing', status: 'preparing' }],
  preparing: [{ label: 'Out for delivery', status: 'on_the_way' }],
  on_the_way: [{ label: 'Mark delivered', status: 'delivered' }],
};

const money = (v) => `${Number(v).toFixed(2)} ETB`;

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('active');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await client.get('/orders/restaurant');
      setOrders(data);
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [load]);

  const setStatus = async (id, status) => {
    try {
      await client.patch(`/orders/${id}/status`, { status });
      load();
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const shown = orders.filter(
    (o) => filter === 'all' || !['delivered', 'cancelled'].includes(o.status)
  );
  const newCount = orders.filter((o) => o.status === 'pending').length;

  return (
    <div>
      <div className="page-head">
        <h1>Orders {newCount > 0 && <span className="pill">{newCount} new</span>}</h1>
        <div className="tabs">
          <button className={filter === 'active' ? 'active' : ''} onClick={() => setFilter('active')}>Active</button>
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {!shown.length && !error && <p className="muted">No orders here yet. This page refreshes automatically.</p>}

      <div className="grid">
        {shown.map((o) => (
          <div key={o.id} className="card">
            <div className="row">
              <strong>Order #{o.id}</strong>
              <span className={`status ${o.status}`}>{LABEL[o.status]}</span>
            </div>
            <p className="muted">{new Date(o.created_at).toLocaleString()}</p>

            <ul className="items">
              {o.items.map((it, i) => (
                <li key={i}>
                  <span>{it.quantity} x {it.name}</span>
                  <span>{money(it.unit_price * it.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="row total">
              <span>Total ({o.payment_method === 'online' ? 'paid online' : 'cash on delivery'})</span>
              <strong>{money(o.total)}</strong>
            </div>

            <p><b>{o.customer_name}</b> {o.customer_phone && `- ${o.customer_phone}`}</p>
            <p className="muted">{o.delivery_address}</p>

            <div className="actions">
              {(ACTIONS[o.status] || []).map((a) => (
                <button
                  key={a.status}
                  className={`btn ${a.danger ? 'danger' : ''}`}
                  onClick={() => setStatus(o.id, a.status)}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
