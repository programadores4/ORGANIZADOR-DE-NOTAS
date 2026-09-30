# Guía de Despliegue en Vercel - Organizador de Notas (I.E. Inocencio Chincá)

Este proyecto está configurado para desplegarse en **Vercel** combinando la distribución estática de alto rendimiento para el frontend y funciones Serverless para la API de backend conectada a Supabase (PostgreSQL).

---

## 📁 Archivos creados y configurados para Vercel

1. **`vercel.json`**: Configura las rutas de reescritura (*rewrites*), redirigiendo las peticiones `/api/*` a las Serverless Functions de Node.js y sirviendo el frontend estático.
2. **`api/index.js`**: Punto de entrada Serverless que exporta la aplicación Express para que Vercel la ejecute bajo demanda.
3. **`public/`**: Contiene los archivos estáticos listos para la CDN de Vercel (`index.html`, `menu.html`, `menudocentes.html`, `menuestudiantes.html`, estilos y scripts).
4. **`.vercelignore`**: Excluye archivos locales y sensibles para optimizar la compilación.
5. **`server.js`**: Exporta `app` como módulo para entornos serverless y escucha en el puerto local solo cuando se ejecuta de forma independiente.

---

## ⚙️ Variables de Entorno Requeridas en Vercel

En el panel de tu proyecto en Vercel (**Settings** → **Environment Variables**), agrega las siguientes variables:

| Variable | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `SUPABASE_URL` | URL de tu proyecto en Supabase | `https://xyzcompany.supabase.co` |
| `SUPABASE_ANON_KEY` | Clave anónima pública de Supabase | `eyJhbGciOiJIUzI1NiIsInR5c...` |
| `SUPABASE_SERVICE_ROLE_KEY` *(Opcional)* | Clave de servicio para omitir políticas RLS | `eyJhbGciOiJIUzI1NiIsInR5c...` |

*(Nota: Si aún no configuras Supabase, la aplicación cuenta con un almacén local en memoria que permite probar el inicio de sesión, creación de cuentas y notas inmediatamente).*

---

## 🚀 Método 1: Despliegue mediante GitHub y Vercel (Recomendado)

1. **Sube tu código a un repositorio de GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Organizador de Notas listo para Vercel"
   git branch -M main
   git remote add origin https://github.com/tu-usuario/tu-repositorio.git
   git push -u origin main
   ```

2. **Importa el proyecto en Vercel**:
   - Ingresa a [vercel.com](https://vercel.com) e inicia sesión.
   - Haz clic en **"Add New..."** → **"Project"**.
   - Selecciona tu repositorio de GitHub y haz clic en **"Import"**.

3. **Configura el proyecto en Vercel**:
   - **Framework Preset**: Deja en *Other* (la configuración ya está definida en `vercel.json`).
   - **Root Directory**: `./` (la raíz del repositorio).
   - Despliega la sección **Environment Variables** y añade `SUPABASE_URL` y `SUPABASE_ANON_KEY`.

4. **Desplegar**:
   - Haz clic en **"Deploy"**.
   - En menos de 1 minuto tendrás tu enlace activo: `https://tu-proyecto.vercel.app`.

---

## 💻 Método 2: Despliegue con Vercel CLI (Desde tu terminal)

Si prefieres desplegar directamente desde la consola:

1. **Instala Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Inicia sesión en Vercel**:
   ```bash
   vercel login
   ```

3. **Despliega a producción**:
   ```bash
   vercel --prod
   ```
   Sigue las preguntas interactivas (presiona *Enter* para aceptar los valores predeterminados).

---

## 🗄️ Base de Datos en Supabase (Opcional para producción)

Si vas a conectar una base de datos real en Supabase:
1. Abre tu proyecto en [supabase.com](https://supabase.com/dashboard).
2. Ve al **SQL Editor** en el menú lateral.
3. Copia el contenido del archivo `supabase_schema.sql` y haz clic en **Run**.
4. ¡Listo! Todas las tablas, relaciones, cursos y actividades quedarán creadas automáticamente.
