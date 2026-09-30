const express = require('express');
const path = require('path');
const supabaseService = require('./supabase');

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');
const staticDir = path.join(__dirname, 'organizador de notas');

// Middlewares
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve static assets (soporte para Vercel public y carpeta original)
app.use(express.static(publicDir, { extensions: ['html', 'htm'] }));
app.use(express.static(staticDir, { extensions: ['html', 'htm'] }));
app.use('/organizador de notas', express.static(staticDir, { extensions: ['html', 'htm'] }));

// ====================================================================
// RUTAS DE LA API REST CON SUPABASE (POSTGRESQL)
// ====================================================================

// 0. Estado de conexión con Supabase
app.get('/api/supabase/status', async (req, res) => {
  try {
    const status = await supabaseService.getStatus();
    res.json({ success: true, ...status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 1. Autenticación (Login tradicional)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña requeridos.' });
    }

    const result = await supabaseService.loginUser(email, password, role);
    if (!result.success) {
      return res.status(401).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error('Error en /api/auth/login:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

// 1.1 Autenticación con Google
app.post('/api/auth/google', async (req, res) => {
  try {
    const { email, name, role, grade, photoUrl } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'El correo de Google es requerido.' });
    }

    const result = await supabaseService.loginOrRegisterGoogleUser({
      email,
      name,
      role,
      grade,
      photoUrl
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error('Error en /api/auth/google:', err);
    res.status(500).json({ success: false, message: 'Error interno en autenticación con Google.' });
  }
});

// 1.2 Búsqueda de cuenta para recuperación de contraseña
app.post('/api/auth/recover-password', async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'El correo electrónico es requerido.' });
    }

    const result = await supabaseService.findUserForRecovery(email, role);
    if (!result.success) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error('Error en /api/auth/recover-password:', err);
    res.status(500).json({ success: false, message: 'Error interno al consultar cuenta.' });
  }
});

// 1.3 Restablecimiento de contraseña
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, role, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Correo y nueva contraseña requeridos.' });
    }

    const result = await supabaseService.resetUserPassword(email, role, newPassword);
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error('Error en /api/auth/reset-password:', err);
    res.status(500).json({ success: false, message: 'Error interno al restablecer contraseña.' });
  }
});

// 1.4 Registro de nuevo usuario (Docente o Estudiante)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nombre, email, password, rol, grado, telefono, asignatura } = req.body;
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ success: false, message: 'Nombre, correo, contraseña y rol son obligatorios.' });
    }

    if (password.length < 4) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 4 caracteres.' });
    }

    const result = await supabaseService.registerUser({
      nombre,
      email,
      password,
      rol,
      grado,
      telefono,
      asignatura
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (err) {
    console.error('Error en /api/auth/register:', err);
    res.status(500).json({ success: false, message: 'Error interno al registrar el usuario.' });
  }
});

// 2. Cursos
app.get('/api/cursos', async (req, res) => {
  try {
    const { grado } = req.query;
    const cursos = await supabaseService.getCursos(grado);
    res.json({ success: true, data: cursos });
  } catch (err) {
    console.error('Error en GET /api/cursos:', err);
    res.status(500).json({ success: false, message: 'Error al obtener cursos.' });
  }
});

app.post('/api/cursos', async (req, res) => {
  try {
    const { nombre, grado, docente_id, descripcion } = req.body;
    if (!nombre || !grado) {
      return res.status(400).json({ success: false, message: 'Nombre y grado son obligatorios.' });
    }

    const result = await supabaseService.createCurso({ nombre, grado, docente_id, descripcion });
    res.status(201).json(result);
  } catch (err) {
    console.error('Error en POST /api/cursos:', err);
    res.status(500).json({ success: false, message: 'Error al crear curso.' });
  }
});

// 3. Estudiantes
app.get('/api/estudiantes', async (req, res) => {
  try {
    const estudiantes = await supabaseService.getEstudiantes();
    res.json({ success: true, data: estudiantes });
  } catch (err) {
    console.error('Error en GET /api/estudiantes:', err);
    res.status(500).json({ success: false, message: 'Error al obtener estudiantes.' });
  }
});

app.post('/api/estudiantes', async (req, res) => {
  try {
    const { nombre, email, grado, curso_id, telefono } = req.body;
    if (!nombre || !email) {
      return res.status(400).json({ success: false, message: 'Nombre y correo son obligatorios.' });
    }

    const result = await supabaseService.createEstudiante({ nombre, email, grado, curso_id, telefono });
    res.status(201).json(result);
  } catch (err) {
    console.error('Error en POST /api/estudiantes:', err);
    res.status(500).json({ success: false, message: 'Error al registrar estudiante.' });
  }
});

// 4. Calificaciones
app.get('/api/calificaciones', async (req, res) => {
  try {
    const calificaciones = await supabaseService.getCalificaciones();
    res.json({ success: true, data: calificaciones });
  } catch (err) {
    console.error('Error en GET /api/calificaciones:', err);
    res.status(500).json({ success: false, message: 'Error al obtener calificaciones.' });
  }
});

app.post('/api/calificaciones', async (req, res) => {
  try {
    const { estudiante_id, curso_id, actividad_nombre, nota, observacion } = req.body;
    if (!estudiante_id || !curso_id || !actividad_nombre || nota === undefined) {
      return res.status(400).json({ success: false, message: 'Faltan campos obligatorios para registrar la nota.' });
    }

    const numNota = parseFloat(nota);
    if (isNaN(numNota) || numNota < 0 || numNota > 5.0) {
      return res.status(400).json({ success: false, message: 'La nota debe estar entre 0.0 y 5.0.' });
    }

    const result = await supabaseService.createCalificacion({
      estudiante_id,
      curso_id,
      actividad_nombre,
      nota: numNota,
      observacion
    });

    res.status(201).json(result);
  } catch (err) {
    console.error('Error en POST /api/calificaciones:', err);
    res.status(500).json({ success: false, message: 'Error al registrar calificación.' });
  }
});

// 5. Actividades
app.get('/api/actividades', async (req, res) => {
  try {
    const actividades = await supabaseService.getActividades();
    res.json({ success: true, data: actividades });
  } catch (err) {
    console.error('Error en GET /api/actividades:', err);
    res.status(500).json({ success: false, message: 'Error al obtener actividades.' });
  }
});

app.post('/api/actividades', async (req, res) => {
  try {
    const { curso_id, titulo, tipo, fecha_entrega } = req.body;
    if (!curso_id || !titulo || !fecha_entrega) {
      return res.status(400).json({ success: false, message: 'Curso, título y fecha de entrega son obligatorios.' });
    }

    const result = await supabaseService.createActividad({ curso_id, titulo, tipo, fecha_entrega });
    res.status(201).json(result);
  } catch (err) {
    console.error('Error en POST /api/actividades:', err);
    res.status(500).json({ success: false, message: 'Error al crear actividad.' });
  }
});

// 6. Métricas del Panel
app.get('/api/metricas', async (req, res) => {
  try {
    const metricas = await supabaseService.getMetricas();
    res.json({ success: true, data: metricas });
  } catch (err) {
    console.error('Error en GET /api/metricas:', err);
    res.status(500).json({ success: false, message: 'Error al calcular métricas.' });
  }
});

// 7. Reportes individuales a estudiantes
app.get('/api/reportes', async (req, res) => {
  try {
    const { estudiante_id, docente_id, curso_id } = req.query;
    const reportes = await supabaseService.getReportes({ estudiante_id, docente_id, curso_id });
    res.json({ success: true, data: reportes });
  } catch (err) {
    console.error('Error en GET /api/reportes:', err);
    res.status(500).json({ success: false, message: 'Error al obtener reportes individuales.' });
  }
});

app.post('/api/reportes', async (req, res) => {
  try {
    const { estudiante_id, docente_id, curso_id, periodo, tipo, titulo, contenido, recomendaciones, fecha, archivo_adjunto, archivo_nombre } = req.body;
    if (!estudiante_id || !titulo || !contenido) {
      return res.status(400).json({ success: false, message: 'Estudiante, título y contenido son obligatorios.' });
    }

    const result = await supabaseService.createReporte({
      estudiante_id, docente_id, curso_id, periodo, tipo, titulo, contenido, recomendaciones, fecha, archivo_adjunto, archivo_nombre
    });
    res.status(201).json(result);
  } catch (err) {
    console.error('Error en POST /api/reportes:', err);
    res.status(500).json({ success: false, message: 'Error al crear reporte individual.' });
  }
});

app.delete('/api/reportes/:id', async (req, res) => {
  try {
    const result = await supabaseService.deleteReporte(req.params.id);
    res.json(result);
  } catch (err) {
    console.error('Error en DELETE /api/reportes:', err);
    res.status(500).json({ success: false, message: 'Error al eliminar reporte individual.' });
  }
});

// Default fallback to index.html / menu.html
app.get('/', (req, res) => {
  res.sendFile(path.join(staticDir, 'menu.html'));
});

// Iniciar servidor solo si se ejecuta directamente (no en entorno serverless como Vercel)
if (require.main === module || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`⚡ Servidor Organizador de Notas corriendo en el puerto ${PORT}`);
    console.log(`📁 Directorio estático: ${staticDir}`);
  });
}

module.exports = app;
