import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/tasks');
    } catch (error) {
      alert('Error al iniciar sesión');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }} />
        <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ display: 'block', margin: '10px 0', padding: '8px', width: '100%' }} />
        <button type="submit" style={{ background: 'green', color: 'white', padding: '10px', border: 'none', cursor: 'pointer' }}>Iniciar Sesión</button>
      </form>
      <p>¿No tienes cuenta? <a href="/register">Regístrate</a></p>
    </div>
  );
}

export default Login;