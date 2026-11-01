import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client, { errorMessage } from '../api/client.js';
import { useRestaurant } from '../context/RestaurantContext.jsx';

const EMPTY = { name: '', description: '', price: '' };
const money = (v) => `${Number(v).toFixed(2)} ETB`;

function ItemForm({ initial = EMPTY, onSave, onCancel, submitLabel }) {
  const [f, setF] = useState(initial);
  const set = (key) => (e) => setF({ ...f, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const ok = await onSave({
      name: f.name.trim(),
      description: f.description.trim(),
      price: Number(f.price),
    });
    if (ok && !onCancel) setF(EMPTY); // clear the "add" form after saving
  };

  return (
    <form className="item-form" onSubmit={submit}>
      <input placeholder="Name" value={f.name} onChange={set('name')} required />
      <input placeholder="Description" value={f.description} onChange={set('description')} />
      <input placeholder="Price" type="number" min="0" step="0.01" value={f.price} onChange={set('price')} required />
      <button className="btn">{submitLabel}</button>
      {onCancel && <button type="button" className="btn outline" onClick={onCancel}>Cancel</button>}
    </form>
  );
}

export default function Menu() {
  const { restaurant, loading } = useRestaurant();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!restaurant) return;
    try {
      const { data } = await client.get(`/restaurants/${restaurant.id}/menu/all`);
      setItems(data);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [restaurant]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="muted">Loading...</p>;
  if (!restaurant) {
    return <p>Create your restaurant first on the <Link to="/restaurant">Restaurant</Link> page.</p>;
  }

  const base = `/restaurants/${restaurant.id}/menu`;

  const run = async (fn) => {
    setError('');
    try {
      await fn();
      await load();
      return true;
    } catch (err) {
      setError(errorMessage(err));
      return false;
    }
  };

  const add = (payload) => run(() => client.post(base, payload));
  const save = async (id, payload) => {
    const ok = await run(() => client.patch(`${base}/${id}`, payload));
    if (ok) setEditing(null);
    return ok;
  };
  const toggle = (item) => run(() => client.patch(`${base}/${item.id}`, { is_available: !item.is_available }));
  const remove = (item) => {
    if (confirm(`Delete "${item.name}"?`)) run(() => client.delete(`${base}/${item.id}`));
  };

  return (
    <div>
      <div className="page-head"><h1>Menu</h1></div>

      <div className="card">
        <h3>Add a dish</h3>
        <ItemForm onSave={add} submitLabel="Add" />
      </div>

      {error && <p className="error">{error}</p>}

      <div className="card">
        {!items.length && <p className="muted">No dishes yet. Add your first one above.</p>}
        {items.map((item) =>
          editing === item.id ? (
            <ItemForm
              key={item.id}
              initial={{ name: item.name, description: item.description || '', price: item.price }}
              onSave={(payload) => save(item.id, payload)}
              onCancel={() => setEditing(null)}
              submitLabel="Save"
            />
          ) : (
            <div key={item.id} className={`menu-row ${item.is_available ? '' : 'off'}`}>
              <div>
                <strong>{item.name}</strong>
                <div className="muted">{item.description}</div>
              </div>
              <div className="menu-actions">
                <strong>{money(item.price)}</strong>
                <button className="btn small outline" onClick={() => toggle(item)}>
                  {item.is_available ? 'Available' : 'Sold out'}
                </button>
                <button className="btn small outline" onClick={() => setEditing(item.id)}>Edit</button>
                <button className="btn small danger" onClick={() => remove(item)}>Delete</button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
