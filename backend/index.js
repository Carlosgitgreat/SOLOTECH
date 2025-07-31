const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const app = express();
const secret = process.env.JWT_SECRET || 'your_jwt_secret';

app.use(bodyParser.json());
app.use(cors());
const path = require('path');

app.use(express.static(path.join(__dirname, '../frontend/build')));

// Lazy initialization for Supabase
let supabaseInstance = null;

function getSupabase() {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseInstance;
}

// Health check route
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Middleware para autenticación
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, secret, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Registro
app.post('/register', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password: hashedPassword }]);
    if (error) { console.error('Error al insertar tarea:', error); return res.status(400).json({ error: error.message }); }
    res.status(201).send('Usuario registrado');
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Inicio de sesión
app.post('/login', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { email, password } = req.body;
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);
    if (error || users.length === 0) return res.status(401).send('Credenciales inválidas');
    const user = users[0];
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Credenciales inválidas');
    }
    const token = jwt.sign({ email: user.email, id: user.id }, secret, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Obtener tareas
app.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', req.user.id);
    if (error) { console.error('Error al insertar tarea:', error); return res.status(400).json({ error: error.message }); }
    res.json(data);
  } catch (error) {
    console.error('Error in get tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Agregar tarea
app.post('/tasks', authenticateToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { name, category, dueDate, status } = req.body;
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ user_id: req.user.id, name, category, due_date: dueDate, status }])
      .select();
    if (error) { console.error('Error al insertar tarea:', error); return res.status(400).json({ error: error.message }); }
    if (!data || data.length === 0) { console.error('No data returned from insert:', req.body); return res.status(500).json({ error: 'Failed to insert task' }); }
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error in add task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Editar tarea
app.put('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { id } = req.params;
    const { name, category, dueDate, status } = req.body;
    const { data, error } = await supabase
      .from('tasks')
      .update({ name, category, due_date: dueDate, status })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select();
    if (error) return res.status(400).json({ error: error.message });
    if (!data) { console.error('Unexpected null data in update:', req.body); return res.status(500).json({ error: 'Unexpected error in update' }); }
    if (data.length === 0) return res.sendStatus(404);
    res.json(data[0]);
  } catch (error) {
    console.error('Error in update task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Eliminar tarea
app.delete('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const supabase = getSupabase();
    const { id } = req.params;
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);
    if (error) return res.status(400).json({ error: error.message });
    res.sendStatus(204);
  } catch (error) {
    console.error('Error in delete task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Servir frontend para rutas no API
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Remove the listen call as Vercel handles the server
// app.listen(port, () => {
//   console.log(`Servidor corriendo en http://localhost:${port}`);
// });

module.exports = app;