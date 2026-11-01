import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { errorMessage } from '../api/client.js';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') await login(form.email.trim(), form.password);
      else await register({ ...form, email: form.email.trim() });
      navigate('/orders');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={submit}>
        <h1>{mode === 'login' ? 'Restaurant login' : 'Register your restaurant'}</h1>

        {mode === 'register' && (
          <>
            <label>Your name</label>
            <input value={form.name} onChange={set('name')} required />
            <label>Phone (optional)</label>
            <input value={form.phone} onChange={set('phone')} />
          </>
        )}

        <label>Email</label>
        <input type="email" value={form.email} onChange={set('email')} required />
        <label>Password</label>
        <input type="password" value={form.password} onChange={set('password')} minLength={6} required />

        {error && <p className="error">{error}</p>}

        <button className="btn" disabled={busy}>
          {busy ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>

        <p className="switch" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
          {mode === 'login' ? 'New restaurant? Create an account' : 'Already registered? Log in'}
        </p>
      </form>
    </div>
  );
}
