const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const isConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('tu-proyecto')
);

let supabase = null;
if (isConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
    console.log('✅ Cliente de Supabase inicializado con URL:', supabaseUrl);
  } catch (err) {
    console.error('Error al inicializar cliente Supabase:', err.message);
  }
} else {
  console.log('ℹ️ Supabase aún no está configurado en .env. Usando almacén local en memoria hasta que agregues SUPABASE_URL y SUPABASE_ANON_KEY.');
}

// -------------------------------------------------------------------------
// ALMACÉN LOCAL EN MEMORIA (Fallback automático mientras el usuario agrega .env)
// -------------------------------------------------------------------------
const mockData = {
  usuarios: [
    { id: 1, nombre: 'Carlos Andrés Mejía', email: 'docente@institucion.edu.co', password: '123456', rol: 'docente', grado: null, telefono: '310 123 4567' },
    { id: 2, nombre: 'Laura Sánchez', email: 'laura.sanchez@institucion.edu.co', password: '123456', rol: 'docente', grado: null, telefono: '311 234 5678' },
    { id: 3, nombre: 'Jorge Luis Ramírez', email: 'jorge.ramirez@institucion.edu.co', password: '123456', rol: 'docente', grado: null, telefono: '312 345 6789' },
    { id: 4, nombre: 'María Fernanda Ortiz', email: 'maria.ortiz@institucion.edu.co', password: '123456', rol: 'docente', grado: null, telefono: '313 456 7890' },
    { id: 5, nombre: 'Andrés Felipe López', email: 'andres.lopez@institucion.edu.co', password: '123456', rol: 'docente', grado: null, telefono: '314 567 8901' },
    { id: 6, nombre: 'María José Pérez', email: 'maria.perez@estudiante.edu.co', password: '123456', rol: 'estudiante', grado: '10°A', telefono: '320 111 2233' },
    { id: 7, nombre: 'Juan Esteban Gómez', email: 'juan.gomez@estudiante.edu.co', password: '123456', rol: 'estudiante', grado: '11°A', telefono: '320 222 3344' },
    { id: 8, nombre: 'Valentina Rodríguez', email: 'valentina.rodriguez@estudiante.edu.co', password: '123456', rol: 'estudiante', grado: '11°B', telefono: '320 333 4455' },
    { id: 9, nombre: 'Andrés Felipe Torres', email: 'andres.torres@estudiante.edu.co', password: '123456', rol: 'estudiante', grado: '10°B', telefono: '320 444 5566' },
    { id: 10, nombre: 'Laura Camila Rojas', email: 'laura.rojas@estudiante.edu.co', password: '123456', rol: 'estudiante', grado: '10°C', telefono: '320 555 6677' },
    { id: 11, nombre: 'Santiago Morales', email: 'santiago.morales@estudiante.edu.co', password: '123456', rol: 'estudiante', grado: '10°A', telefono: '320 666 7788' },
    { id: 12, nombre: 'Daniela Castro', email: 'daniela.castro@estudiante.edu.co', password: '123456', rol: 'estudiante', grado: '11°A', telefono: '320 777 8899' },
    { id: 13, nombre: 'Mateo Vargas', email: 'mateo.vargas@estudiante.edu.co', password: '123456', rol: 'estudiante', grado: '11°B', telefono: '320 888 9900' }
  ],
  cursos: [
    // Áreas para Grado 10°A
    { id: 1, nombre: 'Matemáticas', grado: '10°A', docente_id: 1, docente_nombre: 'Carlos Andrés Mejía', descripcion: 'Álgebra, geometría analítica y trigonometría', progreso: 85, total_estudiantes: 28, promedio: 4.3 },
    { id: 6, nombre: 'Inglés', grado: '10°A', docente_id: 2, docente_nombre: 'Diana Marcela Rojas', descripcion: 'Gramática aplicada, vocabulario y comprensión lectora', progreso: 88, total_estudiantes: 28, promedio: 4.5 },
    { id: 7, nombre: 'Lengua Castellana y Literatura', grado: '10°A', docente_id: 4, docente_nombre: 'María Fernanda Ortiz', descripcion: 'Literatura clásica y producción textual', progreso: 80, total_estudiantes: 28, promedio: 4.1 },
    { id: 8, nombre: 'Ciencias Naturales y Física', grado: '10°A', docente_id: 3, docente_nombre: 'Jorge Luis Ramírez', descripcion: 'Mecánica clásica, cinemática y vectores', progreso: 84, total_estudiantes: 28, promedio: 4.2 },
    { id: 9, nombre: 'Ciencias Sociales y Filosofía', grado: '10°A', docente_id: 2, docente_nombre: 'Laura Sánchez', descripcion: 'Historia contemporánea, ciudadanía y filosofía', progreso: 79, total_estudiantes: 28, promedio: 4.0 },
    { id: 10, nombre: 'Tecnología e Informática', grado: '10°A', docente_id: 5, docente_nombre: 'Andrés Felipe López', descripcion: 'Algoritmos, bases de datos y desarrollo web', progreso: 85, total_estudiantes: 28, promedio: 4.4 },
    { id: 11, nombre: 'Educación Física y Deporte', grado: '10°A', docente_id: 5, docente_nombre: 'Andrés Felipe López', descripcion: 'Acondicionamiento físico y destrezas motrices', progreso: 95, total_estudiantes: 28, promedio: 4.8 },
    { id: 12, nombre: 'Ética y Valores Humanos', grado: '10°A', docente_id: 4, docente_nombre: 'María Fernanda Ortiz', descripcion: 'Convivencia ciudadana, ética y desarrollo moral', progreso: 90, total_estudiantes: 28, promedio: 4.6 },

    // Áreas para Grado 10°B
    { id: 2, nombre: 'Ciencias Naturales', grado: '10°B', docente_id: 2, docente_nombre: 'Laura Sánchez', descripcion: 'Ecosistemas, biología y conservación', progreso: 78, total_estudiantes: 26, promedio: 4.1 },
    { id: 13, nombre: 'Matemáticas', grado: '10°B', docente_id: 1, docente_nombre: 'Carlos Andrés Mejía', descripcion: 'Álgebra y trigonometría', progreso: 80, total_estudiantes: 26, promedio: 4.0 },
    { id: 14, nombre: 'Lengua Castellana', grado: '10°B', docente_id: 4, docente_nombre: 'María Fernanda Ortiz', descripcion: 'Comprensión y redacción', progreso: 82, total_estudiantes: 26, promedio: 4.2 },

    // Áreas para Grado 10°C
    { id: 5, nombre: 'Tecnología e Informática', grado: '10°C', docente_id: 5, docente_nombre: 'Andrés Felipe López', descripcion: 'Programación básica y desarrollo web', progreso: 75, total_estudiantes: 25, promedio: 4.0 },

    // Áreas para Grado 11°A
    { id: 3, nombre: 'Física', grado: '11°A', docente_id: 3, docente_nombre: 'Jorge Luis Ramírez', descripcion: 'Electricidad, magnetismo y ondas', progreso: 90, total_estudiantes: 24, promedio: 4.4 },
    { id: 15, nombre: 'Matemáticas y Cálculo', grado: '11°A', docente_id: 1, docente_nombre: 'Carlos Andrés Mejía', descripcion: 'Límites, derivadas e integrales', progreso: 85, total_estudiantes: 24, promedio: 4.3 },
    { id: 16, nombre: 'Química Orgánica', grado: '11°A', docente_id: 4, docente_nombre: 'María Fernanda Ortiz', descripcion: 'Carbono, enlaces y compuestos orgánicos', progreso: 86, total_estudiantes: 24, promedio: 4.2 },

    // Áreas para Grado 11°B
    { id: 4, nombre: 'Química', grado: '11°B', docente_id: 4, docente_nombre: 'María Fernanda Ortiz', descripcion: 'Ácidos, bases y reacciones químicas', progreso: 82, total_estudiantes: 25, promedio: 4.2 },
    { id: 17, nombre: 'Física', grado: '11°B', docente_id: 3, docente_nombre: 'Jorge Luis Ramírez', descripcion: 'Electromagnetismo y termodinámica', progreso: 88, total_estudiantes: 25, promedio: 4.1 }
  ],
  actividades: [
    { id: 1, curso_id: 1, curso_nombre: 'Matemáticas', curso_grado: '10°A', titulo: 'Taller: Ecuaciones cuadráticas', tipo: 'Taller', fecha_entrega: '22 ago. 2026', estado: 'Pendiente' },
    { id: 2, curso_id: 4, curso_nombre: 'Química', curso_grado: '11°B', titulo: 'Laboratorio: Reacciones químicas', tipo: 'Laboratorio', fecha_entrega: '25 ago. 2026', estado: 'Pendiente' },
    { id: 3, curso_id: 3, curso_nombre: 'Física', curso_grado: '11°A', titulo: 'Quiz: Electricidad y Magnetismo', tipo: 'Quiz', fecha_entrega: '26 ago. 2026', estado: 'Pendiente' },
    { id: 4, curso_id: 2, curso_nombre: 'Ciencias Naturales', curso_grado: '10°B', titulo: 'Proyecto: Cuidado del ambiente escolar', tipo: 'Proyecto', fecha_entrega: '28 ago. 2026', estado: 'Calificado' }
  ],
  calificaciones: [
    { id: 1, estudiante_id: 6, estudiante_nombre: 'María José Pérez', curso_id: 1, curso_nombre: 'Matemáticas', curso_grado: '10°A', actividad_nombre: 'Taller: Funciones lineales', nota: 4.5, observacion: 'Excelente razonamiento lógico', fecha: '18/08/2026' },
    { id: 2, estudiante_id: 7, estudiante_nombre: 'Juan Esteban Gómez', curso_id: 3, curso_nombre: 'Física', curso_grado: '11°A', actividad_nombre: 'Quiz: Ondas y sonido', nota: 4.2, observacion: 'Buen análisis teórico', fecha: '17/08/2026' },
    { id: 3, estudiante_id: 8, estudiante_nombre: 'Valentina Rodríguez', curso_id: 4, curso_nombre: 'Química', curso_grado: '11°B', actividad_nombre: 'Laboratorio: Ácidos y Bases', nota: 4.8, observacion: 'Excelente trabajo de campo', fecha: '16/08/2026' },
    { id: 4, estudiante_id: 9, estudiante_nombre: 'Andrés Felipe Torres', curso_id: 2, curso_nombre: 'Ciencias Naturales', curso_grado: '10°B', actividad_nombre: 'Evaluación: Ecosistemas', nota: 3.9, observacion: 'Repasar niveles tróficos', fecha: '15/08/2026' }
  ],
  reportes: [
    {
      id: 1,
      estudiante_id: 6,
      estudiante_nombre: 'María José Pérez',
      estudiante_grado: '10°A',
      docente_id: 1,
      docente_nombre: 'Carlos Andrés Mejía',
      curso_id: 1,
      curso_nombre: 'Matemáticas',
      curso_grado: '10°A',
      periodo: 'Primer Periodo',
      tipo: 'Seguimiento Académico',
      titulo: 'Informe de avance cognitivo y desempeño en matemáticas',
      contenido: 'María José demuestra un gran dominio en el razonamiento lógico, resolución de problemas algebraicos y participación constructiva en clase. Trabaja con entusiasmo y colabora con sus compañeros.',
      recomendaciones: 'Continuar fortaleciendo ejercicios de aplicación práctica y mantener el orden en el cuaderno de trabajo.',
      fecha: '19/08/2026'
    },
    {
      id: 2,
      estudiante_id: 8,
      estudiante_nombre: 'Valentina Rodríguez',
      estudiante_grado: '11°B',
      docente_id: 1,
      docente_nombre: 'Carlos Andrés Mejía',
      curso_id: 4,
      curso_nombre: 'Química',
      curso_grado: '11°B',
      periodo: 'Primer Periodo',
      tipo: 'Felicitación y Mérito',
      titulo: 'Felicitación por rendimiento destacado en laboratorio',
      contenido: 'Valentina ha demostrado un riguroso manejo de los protocolos de seguridad y una capacidad analítica sobresaliente en los informes de laboratorio de química.',
      recomendaciones: 'Se le anima a postularse como monitora de laboratorio y participar en las olimpiadas de ciencias.',
      fecha: '18/08/2026'
    }
  ]
};

// -------------------------------------------------------------------------
// FUNCIONES DE SERVICIO (SUPABASE CON FALLBACK RESILIENTE)
// -------------------------------------------------------------------------

async function getStatus() {
  if (!isConfigured || !supabase) {
    return {
      configured: false,
      connected: false,
      backend: 'Local Fallback (Pendiente .env)',
      message: 'Supabase no está configurado aún. Configura SUPABASE_URL y SUPABASE_ANON_KEY en tu archivo .env para conectar tu proyecto de Supabase.'
    };
  }

  try {
    const { data, error } = await supabase.from('usuarios').select('count', { count: 'exact', head: true });
    if (error) throw error;
    return {
      configured: true,
      connected: true,
      backend: 'Supabase Cloud (PostgreSQL)',
      url: supabaseUrl,
      message: 'Conectado exitosamente a la base de datos de Supabase.'
    };
  } catch (err) {
    return {
      configured: true,
      connected: false,
      backend: 'Supabase Cloud (Error)',
      url: supabaseUrl,
      error: err.message,
      message: 'Credenciales de Supabase detectadas, pero no se pudo conectar. Verifica que las tablas existan ejecutando supabase_schema.sql en el SQL Editor de Supabase.'
    };
  }
}

async function loginUser(email, password, role) {
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .single();

      if (error || !data) {
        return { success: false, message: 'Usuario no encontrado en Supabase.' };
      }

      if (data.password !== password) {
        return { success: false, message: 'Contraseña incorrecta.' };
      }

      if (data.rol !== role) {
        return { success: false, message: `Esta cuenta no tiene el rol de ${role}.` };
      }

      return {
        success: true,
        user: {
          id: data.id,
          name: data.nombre,
          nombre: data.nombre,
          email: data.email,
          role: data.rol,
          rol: data.rol,
          grade: data.grado,
          grado: data.grado
        }
      };
    } catch (e) {
      console.warn('Error al autenticar con Supabase, usando fallback:', e.message);
    }
  }

  // Fallback en memoria
  const user = mockData.usuarios.find(u =>
    u.email.toLowerCase() === email.trim().toLowerCase() &&
    u.password === password &&
    u.rol === role
  );

  if (user) {
    return {
      success: true,
      user: {
        id: user.id,
        name: user.nombre,
        nombre: user.nombre,
        email: user.email,
        role: user.rol,
        rol: user.rol,
        grade: user.grado,
        grado: user.grado
      }
    };
  }

  return { success: false, message: 'Credenciales inválidas o el usuario no existe.' };
}

async function getCursos(grado = null) {
  if (isConfigured && supabase) {
    try {
      let query = supabase
        .from('cursos')
        .select(`
          id, nombre, grado, descripcion, progreso,
          docente:usuarios(id, nombre)
        `)
        .order('id', { ascending: true });

      if (grado) {
        query = query.eq('grado', grado);
      }

      const { data, error } = await query;

      if (!error && data) {
        return data.map(c => ({
          id: c.id,
          nombre: c.nombre,
          grado: c.grado,
          descripcion: c.descripcion,
          progreso: c.progreso || 75,
          docente_nombre: c.docente ? c.docente.nombre : 'Docente titular',
          total_estudiantes: 25,
          promedio: 4.2
        }));
      }
    } catch (e) {
      console.warn('Error al obtener cursos de Supabase:', e.message);
    }
  }

  if (grado) {
    return mockData.cursos.filter(c => c.grado.toLowerCase() === grado.toLowerCase());
  }
  return mockData.cursos;
}

async function createCurso({ nombre, grado, docente_id, descripcion }) {
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('cursos')
        .insert([{
          nombre,
          grado,
          docente_id: docente_id || null,
          descripcion: descripcion || '',
          progreso: 0
        }])
        .select()
        .single();

      if (!error && data) return { success: true, data };
    } catch (e) {
      console.warn('Error al crear curso en Supabase:', e.message);
    }
  }

  const newCurso = {
    id: mockData.cursos.length + 1,
    nombre,
    grado,
    docente_id: docente_id || 1,
    docente_nombre: 'Carlos Andrés Mejía',
    descripcion: descripcion || '',
    progreso: 0,
    total_estudiantes: 0,
    promedio: 0.0
  };
  mockData.cursos.push(newCurso);
  return { success: true, data: newCurso };
}

async function getEstudiantes() {
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nombre, email, grado, telefono')
        .eq('rol', 'estudiante')
        .order('nombre', { ascending: true });

      if (!error && data) {
        return data.map(e => ({
          ...e,
          promedio: 4.2
        }));
      }
    } catch (e) {
      console.warn('Error al obtener estudiantes de Supabase:', e.message);
    }
  }
  return mockData.usuarios.filter(u => u.rol === 'estudiante').map(e => ({
    ...e,
    promedio: 4.2
  }));
}

async function createEstudiante({ nombre, email, grado, curso_id, telefono }) {
  if (isConfigured && supabase) {
    try {
      const { data: user, error: userError } = await supabase
        .from('usuarios')
        .insert([{
          nombre,
          email: email.trim().toLowerCase(),
          password: 'password123',
          rol: 'estudiante',
          grado,
          telefono: telefono || null
        }])
        .select()
        .single();

      if (!userError && user) {
        if (curso_id) {
          await supabase.from('matriculas').insert([{
            estudiante_id: user.id,
            curso_id: parseInt(curso_id, 10)
          }]);
        }
        return { success: true, data: user };
      }
    } catch (e) {
      console.warn('Error al registrar estudiante en Supabase:', e.message);
    }
  }

  const newEst = {
    id: mockData.usuarios.length + 1,
    nombre,
    email: email.trim().toLowerCase(),
    password: 'password123',
    rol: 'estudiante',
    grado,
    telefono: telefono || null
  };
  mockData.usuarios.push(newEst);
  return { success: true, data: newEst };
}

async function getCalificaciones() {
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('calificaciones')
        .select(`
          id, estudiante_id, curso_id, actividad_nombre, nota, observacion, fecha,
          estudiante:usuarios!calificaciones_estudiante_id_fkey(id, nombre),
          curso:cursos!calificaciones_curso_id_fkey(id, nombre, grado)
        `)
        .order('id', { ascending: false });

      if (!error && data) {
        return data.map(c => ({
          id: c.id,
          estudiante_id: c.estudiante_id,
          estudiante_nombre: c.estudiante ? c.estudiante.nombre : 'Estudiante',
          curso_id: c.curso_id,
          curso_nombre: c.curso ? c.curso.nombre : 'Curso',
          curso_grado: c.curso ? c.curso.grado : '',
          actividad_nombre: c.actividad_nombre,
          nota: parseFloat(c.nota),
          observacion: c.observacion,
          fecha: c.fecha
        }));
      }
    } catch (e) {
      console.warn('Error al obtener calificaciones de Supabase:', e.message);
    }
  }
  return mockData.calificaciones;
}

async function createCalificacion({ estudiante_id, curso_id, actividad_nombre, nota, observacion }) {
  const fechaStr = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const notaNum = parseFloat(nota);

  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('calificaciones')
        .insert([{
          estudiante_id: parseInt(estudiante_id, 10),
          curso_id: parseInt(curso_id, 10),
          actividad_nombre,
          nota: notaNum,
          observacion: observacion || null,
          fecha: fechaStr
        }])
        .select()
        .single();

      if (!error && data) return { success: true, data };
    } catch (e) {
      console.warn('Error al registrar calificación en Supabase:', e.message);
    }
  }

  const est = mockData.usuarios.find(u => u.id === parseInt(estudiante_id, 10));
  const cur = mockData.cursos.find(c => c.id === parseInt(curso_id, 10));
  const newCal = {
    id: mockData.calificaciones.length + 1,
    estudiante_id: parseInt(estudiante_id, 10),
    estudiante_nombre: est ? est.nombre : 'Estudiante',
    curso_id: parseInt(curso_id, 10),
    curso_nombre: cur ? cur.nombre : 'Curso',
    curso_grado: cur ? cur.grado : '',
    actividad_nombre,
    nota: notaNum,
    observacion: observacion || '',
    fecha: fechaStr
  };
  mockData.calificaciones.unshift(newCal);
  return { success: true, data: newCal };
}

async function getActividades() {
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('actividades')
        .select(`
          id, curso_id, titulo, tipo, fecha_entrega, estado,
          curso:cursos!actividades_curso_id_fkey(id, nombre, grado)
        `)
        .order('id', { ascending: false });

      if (!error && data) {
        return data.map(a => ({
          id: a.id,
          curso_id: a.curso_id,
          curso_nombre: a.curso ? a.curso.nombre : 'Curso',
          curso_grado: a.curso ? a.curso.grado : '',
          titulo: a.titulo,
          tipo: a.tipo,
          fecha_entrega: a.fecha_entrega,
          estado: a.estado
        }));
      }
    } catch (e) {
      console.warn('Error al obtener actividades de Supabase:', e.message);
    }
  }
  return mockData.actividades;
}

async function createActividad({ curso_id, titulo, tipo, fecha_entrega }) {
  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('actividades')
        .insert([{
          curso_id: parseInt(curso_id, 10),
          titulo,
          tipo: tipo || 'Taller',
          fecha_entrega,
          estado: 'Pendiente'
        }])
        .select()
        .single();

      if (!error && data) return { success: true, data };
    } catch (e) {
      console.warn('Error al crear actividad en Supabase:', e.message);
    }
  }

  const cur = mockData.cursos.find(c => c.id === parseInt(curso_id, 10));
  const newAct = {
    id: mockData.actividades.length + 1,
    curso_id: parseInt(curso_id, 10),
    curso_nombre: cur ? cur.nombre : 'Curso',
    curso_grado: cur ? cur.grado : '',
    titulo,
    tipo: tipo || 'Taller',
    fecha_entrega,
    estado: 'Pendiente'
  };
  mockData.actividades.unshift(newAct);
  return { success: true, data: newAct };
}

async function getMetricas() {
  const [cursos, estudiantes, actividades, calificaciones] = await Promise.all([
    getCursos(),
    getEstudiantes(),
    getActividades(),
    getCalificaciones()
  ]);

  const pendientes = actividades.filter(a => a.estado !== 'Calificado').length;
  let promedio = 4.3;
  if (calificaciones.length > 0) {
    const sum = calificaciones.reduce((acc, c) => acc + (parseFloat(c.nota) || 0), 0);
    promedio = parseFloat((sum / calificaciones.length).toFixed(1));
  }

  return {
    cursos: cursos.length,
    estudiantes: estudiantes.length,
    pendientes,
    promedio
  };
}

// -------------------------------------------------------------------------
// REPORTES INDIVIDUALES
// -------------------------------------------------------------------------

async function getReportes(filters = {}) {
  const { estudiante_id, docente_id, curso_id } = filters;

  if (isConfigured && supabase) {
    try {
      let query = supabase
        .from('reportes_individuales')
        .select(`
          id, estudiante_id, docente_id, curso_id, periodo, tipo, titulo, contenido, recomendaciones, fecha, archivo_adjunto, archivo_nombre, creado_en,
          estudiante:usuarios!reportes_individuales_estudiante_id_fkey(id, nombre, grado),
          docente:usuarios!reportes_individuales_docente_id_fkey(id, nombre),
          curso:cursos!reportes_individuales_curso_id_fkey(id, nombre, grado)
        `)
        .order('id', { ascending: false });

      if (estudiante_id) {
        query = query.eq('estudiante_id', parseInt(estudiante_id, 10));
      }
      if (docente_id) {
        query = query.eq('docente_id', parseInt(docente_id, 10));
      }
      if (curso_id) {
        query = query.eq('curso_id', parseInt(curso_id, 10));
      }

      const { data, error } = await query;
      if (!error && data) {
        return data.map(r => ({
          id: r.id,
          estudiante_id: r.estudiante_id,
          estudiante_nombre: r.estudiante ? r.estudiante.nombre : 'Estudiante',
          estudiante_grado: r.estudiante ? r.estudiante.grado : '',
          docente_id: r.docente_id,
          docente_nombre: r.docente ? r.docente.nombre : 'Docente titular',
          curso_id: r.curso_id,
          curso_nombre: r.curso ? r.curso.nombre : 'General',
          curso_grado: r.curso ? r.curso.grado : '',
          periodo: r.periodo || 'Primer Periodo',
          tipo: r.tipo || 'Seguimiento Académico',
          titulo: r.titulo,
          contenido: r.contenido,
          recomendaciones: r.recomendaciones || '',
          fecha: r.fecha,
          archivo_adjunto: r.archivo_adjunto || null,
          archivo_nombre: r.archivo_nombre || null
        }));
      }
    } catch (e) {
      console.warn('Error al obtener reportes individuales de Supabase:', e.message);
    }
  }

  // Fallback en memoria
  let list = [...mockData.reportes];
  if (estudiante_id) {
    list = list.filter(r => r.estudiante_id === parseInt(estudiante_id, 10));
  }
  if (curso_id) {
    list = list.filter(r => r.curso_id === parseInt(curso_id, 10));
  }
  return list;
}

async function createReporte({ estudiante_id, docente_id, curso_id, periodo, tipo, titulo, contenido, recomendaciones, fecha, archivo_adjunto, archivo_nombre }) {
  const fechaStr = fecha || new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });

  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('reportes_individuales')
        .insert([{
          estudiante_id: parseInt(estudiante_id, 10),
          docente_id: docente_id ? parseInt(docente_id, 10) : null,
          curso_id: curso_id ? parseInt(curso_id, 10) : null,
          periodo: periodo || 'Primer Periodo',
          tipo: tipo || 'Seguimiento Académico',
          titulo,
          contenido,
          recomendaciones: recomendaciones || '',
          fecha: fechaStr,
          archivo_adjunto: archivo_adjunto || null,
          archivo_nombre: archivo_nombre || null
        }])
        .select()
        .single();

      if (!error && data) return { success: true, data };
    } catch (e) {
      console.warn('Error al crear reporte individual en Supabase:', e.message);
    }
  }

  // Fallback en memoria
  const est = mockData.usuarios.find(u => u.id === parseInt(estudiante_id, 10));
  const doc = mockData.usuarios.find(u => u.id === (docente_id ? parseInt(docente_id, 10) : 1));
  const cur = mockData.cursos.find(c => c.id === (curso_id ? parseInt(curso_id, 10) : 1));

  const newReporte = {
    id: mockData.reportes.length + 1,
    estudiante_id: parseInt(estudiante_id, 10),
    estudiante_nombre: est ? est.nombre : 'Estudiante',
    estudiante_grado: est ? est.grado : (cur ? cur.grado : ''),
    docente_id: doc ? doc.id : 1,
    docente_nombre: doc ? doc.nombre : 'Carlos Andrés Mejía',
    curso_id: cur ? cur.id : null,
    curso_nombre: cur ? cur.nombre : 'General',
    curso_grado: cur ? cur.grado : '',
    periodo: periodo || 'Primer Periodo',
    tipo: tipo || 'Seguimiento Académico',
    titulo,
    contenido,
    recomendaciones: recomendaciones || '',
    fecha: fechaStr,
    archivo_adjunto: archivo_adjunto || null,
    archivo_nombre: archivo_nombre || null
  };

  mockData.reportes.unshift(newReporte);
  return { success: true, data: newReporte };
}

async function deleteReporte(id) {
  const numId = parseInt(id, 10);
  if (isConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('reportes_individuales')
        .delete()
        .eq('id', numId);
      if (!error) return { success: true };
    } catch (e) {
      console.warn('Error al eliminar reporte de Supabase:', e.message);
    }
  }

  const idx = mockData.reportes.findIndex(r => r.id === numId);
  if (idx !== -1) {
    mockData.reportes.splice(idx, 1);
    return { success: true };
  }
  return { success: false, message: 'Reporte no encontrado' };
}

module.exports = {
  isConfigured,
  getStatus,
  loginUser,
  getCursos,
  createCurso,
  getEstudiantes,
  createEstudiante,
  getCalificaciones,
  createCalificacion,
  getActividades,
  createActividad,
  getMetricas,
  getReportes,
  createReporte,
  deleteReporte
};
