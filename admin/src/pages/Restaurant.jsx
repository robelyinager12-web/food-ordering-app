import { useEffect, useState } from 'react';
import client, { errorMessage } from '../api/client.js';
import { useRestaurant } from '../context/RestaurantContext.jsx';

export default function RestaurantPage() {
  const { restaurant, loading, reload } = useRestaurant();
  const [form, setForm] = useState({ name: '', description: '', address: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (restaurant) {
      setForm({
        name: restaurant.name,
        description: restaurant.description || '',
        address: restaurant.address || '',
      });
    }
  }, [restaurant]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    try {
      if (restaurant) await client.patch(`/restaurants/${restaurant.id}`, form);
      else await client.post('/restaurants', form);
      await reload();
      setMsg('Saved!');
    } catch (err) {
      setMsg(errorMessage(err));
    }
  };

  const toggleOpen = async () => {
    try {
      await client.patch(`/restaurants/${restaurant.id}`, { is_open: !restaurant.is_open });
      reload();
    } catch (err) {
      setMsg(errorMessage(err));
    }
  };

  if (loading) return <p className="muted">Loading...</p>;

  return (
    <div>
      <div className="page-head"><h1>{restaurant ? 'Restaurant settings' : 'Create your restaurant'}</h1></div>

      {restaurant && (
        <div className="card row">
          <div>
            <strong>{restaurant.is_open ? 'Open for orders' : 'Closed'}</strong>
            <div className="muted">Customers cannot order while you are closed.</div>
          </div>
          <button className={`btn ${restaurant.is_open ? 'danger' : ''}`} onClick={toggleOpen}>
            {restaurant.is_open ? 'Close now' : 'Open now'}
          </button>
        </div>
      )}

      <form className="card" onSubmit={save}>
        <label>Restaurant name</label>
        <input value={form.name} onChange={set('name')} required />
        <label>Description</label>
        <input value={form.description} onChange={set('description')} />
        <label>Address</label>
        <input value={form.address} onChange={set('address')} />
        <button className="btn">{restaurant ? 'Save changes' : 'Create restaurant'}</button>
        {msg && <p className="muted">{msg}</p>}
      </form>
    </div>
  );
}
