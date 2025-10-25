import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpLogin } from '../../api/config';
import { User, Lock } from 'phosphor-react';
import './Login.css';

export default function Login() {
  const [user, setuser] = useState('');
  const [password, setpassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(httpLogin, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_username: user,
          user_password: password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Password or Username Incorrect.');
      }
    } catch {
      setError('Conection error.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Bienvenido a Yeyi</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              className="form-input"
              placeholder="Usuario"
              value={user}
              onChange={e => setuser(e.target.value)}
              required
            />
            <User size={20} weight="bold" className="input-icon" />
          </div>

          <div className="input-group">
            <input
              type="password"
              className="form-input"
              placeholder="Contraseña"
              value={password}
              onChange={e => setpassword(e.target.value)}
              required
            />
            <Lock size={20} weight="bold" className="input-icon" />
          </div>

          <button type="submit" className="login-btn">
            Ingresar
          </button>

          {error && <div className="error-message">{error}</div>}
        </form>
      </div>
    </div>
  );
}
