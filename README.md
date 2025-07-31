# Gestor de Tareas Personales

## Prueba Local

1. **Backend:**
   - Navega a la carpeta `backend`.
   - Ejecuta `node index.js` para iniciar el servidor en http://localhost:5000.

2. **Frontend:**
   - Navega a la carpeta `frontend`.
   - Ejecuta `npm start` para iniciar la app React en http://localhost:3001 (o el puerto predeterminado).

Accede a http://localhost:3001 para usar la aplicación: regístrate, inicia sesión y gestiona tareas.

## Esquema SQL para Supabase

Crea las siguientes tablas en Supabase:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  category TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL
);
```

## Integración con Supabase

1. Instala el cliente de Supabase en el backend: `npm install @supabase/supabase-js`.
2. Configura las variables de entorno en un archivo .env con SUPABASE_URL y SUPABASE_KEY.
3. Modifica index.js para usar Supabase en lugar de datos simulados: inicializa el cliente, y actualiza las rutas para interactuar con la base de datos.

## Despliegue en Vercel

1. Instala Vercel CLI: `npm i -g vercel`.
2. En la raíz del proyecto, ejecuta `vercel` para desplegar.
3. Configura variables de entorno en Vercel para SUPABASE_URL, SUPABASE_KEY y JWT_SECRET.
4. Para el frontend, asegúrate de que las llamadas API apunten a la URL del backend desplegado.