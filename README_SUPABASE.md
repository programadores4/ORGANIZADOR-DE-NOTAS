# ⚡ Conexión de Supabase (PostgreSQL) - Organizador de Notas

Esta guía explica paso a paso cómo conectar tu base de datos en **Supabase** a este proyecto.

---

## 🚀 Paso 1: Obtener las Credenciales de Supabase

1. Inicia sesión en tu cuenta de [Supabase](https://supabase.com/dashboard).
2. Entra a tu proyecto.
3. En el menú lateral izquierdo, haz clic en el ícono de engranaje **Project Settings** (Configuración del proyecto).
4. Selecciona **API**.
5. Encontrarás:
   * **Project URL**: Ejemplo `https://abcdefghijklm.supabase.co`
   * **Project API Keys**:
     * `anon` / `public`: Tu clave anónima pública.
     * `service_role` (opcional): Clave con permisos completos de administrador para el backend.

---

## 🔑 Paso 2: Crear el archivo `.env` en la raíz del proyecto

Crea un archivo llamado `.env` en la raíz de este proyecto (al mismo nivel que `package.json` y `server.js`) con el siguiente formato:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3000
```

*(Puedes guiarte del archivo de ejemplo `.env.example`)*

---

## 🗄️ Paso 3: Crear las Tablas en Supabase

Hemos preparado el script SQL listo para ejecutar:

1. En tu panel de Supabase, ve a la sección **SQL Editor** (ícono de terminal `>_` a la izquierda).
2. Haz clic en **New query** (Nueva consulta).
3. Abre el archivo **`supabase_schema.sql`** ubicado en este proyecto, copia todo su contenido y pégalo en el editor de Supabase.
4. Haz clic en el botón verde **RUN** (Ejecutar).

¡Listo! Esto creará:
* Tabla **`usuarios`**: Docentes y estudiantes con sus contraseñas, roles y datos.
* Tabla **`cursos`**: Asignaturas escolares con grados y docentes asociados.
* Tabla **`matriculas`**: Relación de alumnos matriculados en cada materia.
* Tabla **`actividades`**: Talleres, quices, laboratorios y proyectos.
* Tabla **`calificaciones`**: Registro de notas (escala de 1.0 a 5.0) con observaciones pedagógicas.
* Políticas de seguridad **RLS (Row Level Security)** para permitir acceso seguro desde la API.
* Datos iniciales de demostración para probar de inmediato.

---

## 👥 Usuarios de Prueba Iniciales (en `supabase_schema.sql`)

| Rol | Correo Electrónico | Contraseña | Grado |
|---|---|---|---|
| **Docente** | `docente@institucion.edu.co` | `123456` | Docente titular |
| **Docente** | `laura.sanchez@institucion.edu.co` | `123456` | Docente de Ciencias |
| **Estudiante** | `maria.perez@estudiante.edu.co` | `123456` | 10°A |
| **Estudiante** | `juan.gomez@estudiante.edu.co` | `123456` | 11°A |

---

## 📡 Endpoints de la API Backend (`server.js` + `supabase.js`)

La aplicación se comunica con Supabase mediante el SDK oficial `@supabase/supabase-js` a través de los siguientes endpoints:

* **`GET /api/supabase/status`**: Comprueba si el proyecto está conectado a Supabase en la nube o si requiere configuración en `.env`.
* **`POST /api/auth/login`**: Valida credenciales contra la tabla `usuarios` de Supabase.
* **`GET /api/cursos`** y **`POST /api/cursos`**: Consulta y creación de asignaturas escolares.
* **`GET /api/estudiantes`** y **`POST /api/estudiantes`**: Gestión de estudiantes matriculados.
* **`GET /api/calificaciones`** y **`POST /api/calificaciones`**: Registro y consulta de notas en tiempo real.
* **`GET /api/actividades`** y **`POST /api/actividades`**: Tareas y proyectos escolares.
* **`GET /api/metricas`**: Totales de cursos, estudiantes, promedio general y tareas pendientes.

---

## 🛡️ Modo Resiliente
Si aún no has colocado tus credenciales en `.env`, el servidor utiliza automáticamente un almacén local en memoria para que puedas seguir probando la interfaz de usuario sin interrupciones ni pantallas en blanco. En cuanto definas `SUPABASE_URL` y `SUPABASE_ANON_KEY`, se conectará directamente a tu nube de Supabase.
