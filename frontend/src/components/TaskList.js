import React, { useState, useEffect } from 'react';
import axios from 'axios';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ name: '', category: 'Trabajo', dueDate: '', status: 'Pendiente' });
  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/tasks', { headers: { Authorization: localStorage.getItem('token') } });
      setTasks(response.data);
    } catch (error) {
      alert('Error al cargar tareas');
    }
  };

  const handleChange = (e) => {
    console.log('Cambiando campo:', e.target.name, 'a', e.target.value);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let formattedDueDate = form.dueDate;
    if (formattedDueDate.includes('/') && formattedDueDate.split('/').length === 3) {
      const [day, month, year] = formattedDueDate.split('/');
      formattedDueDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    const taskData = { ...form, dueDate: formattedDueDate };
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/tasks/${editingId}`, taskData, { headers: { Authorization: localStorage.getItem('token') } });
        setEditingId(null);
      } else {
        await axios.post('http://localhost:5000/tasks', taskData, { headers: { Authorization: localStorage.getItem('token') } });
      }
      setForm({ name: '', category: 'Trabajo', dueDate: '', status: 'Pendiente' });
      fetchTasks();
    } catch (error) {
    console.error('Error en submit:', error);
    alert('Error al guardar tarea');
  }
  };

  const handleEdit = (task) => {
    setForm({ name: task.name, category: task.category, dueDate: task.dueDate, status: task.status });
    setEditingId(task.id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/tasks/${id}`, { headers: { Authorization: localStorage.getItem('token') } });
      fetchTasks();
    } catch (error) {
      alert('Error al eliminar tarea');
    }
  };

  const filteredTasks = tasks.filter(t => 
    (filterCategory ? t.category === filterCategory : true) &&
    (filterStatus ? t.status === filterStatus : true)
  );

  return (
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
      <h2>Gestor de Tareas</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input name="name" placeholder="Nombre" value={form.name} onChange={handleChange} onKeyDown={(e) => console.log('Key down:', e.key)} required style={{ margin: '10px 5px', padding: '8px' }} />
        <select name="category" value={form.category} onChange={handleChange} style={{ margin: '10px 5px', padding: '8px' }}>
          <option>Trabajo</option>
          <option>Personal</option>
          <option>Otro</option>
        </select>
        <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} required style={{ margin: '10px 5px', padding: '8px' }} />
        <select name="status" value={form.status} onChange={handleChange} style={{ margin: '10px 5px', padding: '8px' }}>
          <option>Pendiente</option>
          <option>En Progreso</option>
          <option>Completada</option>
        </select>
        <button type="submit" style={{ background: 'green', color: 'white', padding: '10px', border: 'none', cursor: 'pointer', margin: '10px 5px' }}>{editingId ? 'Actualizar' : 'Agregar'}</button>
      </form>
      <div style={{ marginBottom: '20px' }}>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ margin: '0 5px', padding: '8px' }}>
          <option value="">Todas Categorías</option>
          <option>Trabajo</option>
          <option>Personal</option>
          <option>Otro</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ margin: '0 5px', padding: '8px' }}>
          <option value="">Todos Estados</option>
          <option>Pendiente</option>
          <option>En Progreso</option>
          <option>Completada</option>
        </select>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#333', color: 'white' }}>
            <th>Nombre</th><th>Categoría</th><th>Fecha Límite</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredTasks.map(task => (
            <tr key={task.id} style={{ borderBottom: '1px solid #ccc' }}>
              <td>{task.name}</td>
              <td>{task.category}</td>
              <td>{task.dueDate}</td>
              <td>{task.status}</td>
              <td>
                <button onClick={() => handleEdit(task)} style={{ background: 'green', color: 'white', margin: '0 5px', padding: '5px', border: 'none', cursor: 'pointer' }}>Editar</button>
                <button onClick={() => handleDelete(task.id)} style={{ background: 'red', color: 'white', margin: '0 5px', padding: '5px', border: 'none', cursor: 'pointer' }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }} style={{ background: 'gray', color: 'white', padding: '10px', border: 'none', cursor: 'pointer', marginTop: '20px' }}>Cerrar Sesión</button>
    </div>
  );
}

export default TaskList;