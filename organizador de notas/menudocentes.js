document.addEventListener("DOMContentLoaded", function () {
    // ---------- Sesión ----------
    const session = JSON.parse(localStorage.getItem("organizadorNotasSesion") || "null");
    
    // Si la sesión activa es de estudiante, redirigir al panel de estudiante
    if (session && (session.role === "estudiante" || session.rol === "estudiante")) {
        window.location.href = "menuestudiantes.html";
        return;
    }

    const displayName = session && (session.name || session.nombre) ? (session.name || session.nombre) : "Carlos Andrés Mejía";
    const displayEmail = session && session.email ? session.email : "docente@institucion.edu.co";
    const initial = displayName.charAt(0).toUpperCase();

    const navUserName = document.getElementById("navUserName");
    const userAvatar = document.getElementById("userAvatar");
    const welcomeName = document.getElementById("welcomeName");
    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");
    const profileAvatar = document.getElementById("profileAvatar");

    if (navUserName) navUserName.textContent = displayName;
    if (userAvatar) userAvatar.textContent = initial;
    if (welcomeName) welcomeName.textContent = displayName;
    if (profileName) profileName.textContent = displayName;
    if (profileEmail) profileEmail.textContent = displayEmail;
    if (profileAvatar) profileAvatar.textContent = initial;

    // ---------- Fecha actual ----------
    const todayDate = document.getElementById("todayDate");
    const footerYear = document.getElementById("footerYear");
    const now = new Date();
    if (todayDate) {
        todayDate.textContent = now.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
    }
    if (footerYear) footerYear.textContent = now.getFullYear();

    // ---------- Toast ----------
    const toast = document.getElementById("toast");
    let toastTimeout;
    function showToast(message) {
        if (!toast) return;
        clearTimeout(toastTimeout);
        toast.textContent = message;
        toast.classList.add("show");
        toastTimeout = setTimeout(() => toast.classList.remove("show"), 2800);
    }

    // ---------- Navegación del panel lateral ----------
    const sidebarItems = document.querySelectorAll(".sidebar-item");
    const panels = document.querySelectorAll(".panel");

    function showSection(sectionName) {
        panels.forEach(p => p.classList.remove("active-panel"));
        const target = document.getElementById("panel-" + sectionName);
        if (target) {
            target.classList.add("active-panel");
        } else {
            showToast("Esta sección estará disponible próximamente.");
            const pInicio = document.getElementById("panel-inicio");
            if (pInicio) pInicio.classList.add("active-panel");
            sectionName = "inicio";
        }

        sidebarItems.forEach(item => {
            const link = item.querySelector("a[data-section]");
            item.classList.toggle("active", !!link && link.dataset.section === sectionName);
        });

        const dashContent = document.querySelector(".dashboard-content");
        if (dashContent) dashContent.scrollTo({ top: 0, behavior: "smooth" });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    document.querySelectorAll("[data-section]").forEach(el => {
        el.addEventListener("click", function (e) {
            e.preventDefault();
            showSection(this.dataset.section);
        });
    });

    // ---------- Menús desplegables (usuario / notificaciones) ----------
    const userMenu = document.getElementById("userMenu");
    const userTrigger = document.getElementById("userTrigger");
    const userPanel = document.getElementById("userPanel");

    const notifMenu = document.getElementById("notifMenu");
    const notifBtn = document.getElementById("notifBtn");
    const notifPanel = document.getElementById("notifPanel");

    function closeAllMenus() {
        if (userMenu) userMenu.classList.remove("open");
        if (userPanel) userPanel.classList.remove("open");
        if (notifMenu) notifMenu.classList.remove("open");
        if (notifPanel) notifPanel.classList.remove("open");
    }

    if (userTrigger && userPanel) {
        userTrigger.addEventListener("click", function (e) {
            e.stopPropagation();
            const willOpen = !userPanel.classList.contains("open");
            closeAllMenus();
            if (willOpen) {
                userMenu.classList.add("open");
                userPanel.classList.add("open");
            }
        });
    }

    if (notifBtn && notifPanel) {
        notifBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            const willOpen = !notifPanel.classList.contains("open");
            closeAllMenus();
            if (willOpen) {
                notifMenu.classList.add("open");
                notifPanel.classList.add("open");
            }
        });
    }

    document.addEventListener("click", closeAllMenus);

    // ---------- Cerrar sesión ----------
    function logout() {
        localStorage.removeItem("organizadorNotasSesion");
        showToast("Cerrando sesión...");
        setTimeout(() => { window.location.href = "menu.html"; }, 600);
    }

    const logoutBtn = document.getElementById("logoutBtn");
    const logoutBtnSidebar = document.getElementById("logoutBtnSidebar");
    if (logoutBtn) logoutBtn.addEventListener("click", function (e) { e.preventDefault(); logout(); });
    if (logoutBtnSidebar) logoutBtnSidebar.addEventListener("click", function (e) { e.preventDefault(); logout(); });

    // ====================================================================
    // INTEGRACIÓN CON BASE DE DATOS SUPABASE (REST API)
    // ====================================================================

    let state = {
        cursos: [],
        estudiantes: [],
        calificaciones: [],
        actividades: [],
        reportes: [],
        metricas: {}
    };

    // Helper: badge color for grades
    function getScoreBadge(score) {
        const num = parseFloat(score);
        if (isNaN(num)) return `<span class="badge-score">--</span>`;
        return `<span class="badge-score">${num.toFixed(1)}</span>`;
    }

    // 1. Cargar métricas
    async function fetchMetricas() {
        try {
            const res = await fetch('/api/metricas');
            const data = await res.json();
            if (data.success) {
                state.metricas = data.data;
                const mC = document.getElementById('metricCursos');
                const mE = document.getElementById('metricEstudiantes');
                const mP = document.getElementById('metricPendientes');
                const mPr = document.getElementById('metricPromedio');
                if (mC) mC.textContent = state.metricas.cursos || 0;
                if (mE) mE.textContent = state.metricas.estudiantes || 0;
                if (mP) mP.textContent = state.metricas.pendientes || 0;
                if (mPr) mPr.textContent = state.metricas.promedio || '0.0';
            }
        } catch (e) {
            console.error('Error al cargar métricas:', e);
        }
    }

    // 2. Cargar cursos
    async function fetchCursos() {
        try {
            const res = await fetch('/api/cursos');
            const data = await res.json();
            if (data.success) {
                state.cursos = data.data;
                renderCursos();
                populateCursoDropdowns();
            }
        } catch (e) {
            console.error('Error al cargar cursos:', e);
        }
    }

    function renderCursos() {
        const grid = document.getElementById('cursosGrid');
        const dashTbody = document.getElementById('dashCursosTableBody');

        if (grid) {
            grid.innerHTML = state.cursos.map(c => `
                <div class="course-card">
                    <span class="course-tag">${c.grado}</span>
                    <h3>${c.nombre}</h3>
                    <p>${c.total_estudiantes || 0} estudiantes · ${c.descripcion || 'Sin descripción'}</p>
                    <div class="course-meta">
                        <span>Promedio: <strong>${c.promedio || '4.0'}</strong></span>
                        <span>Progreso: ${c.progreso || 75}%</span>
                    </div>
                </div>
            `).join('');
        }

        if (dashTbody) {
            dashTbody.innerHTML = state.cursos.slice(0, 5).map(c => `
                <tr>
                    <td><strong>${c.nombre}</strong></td>
                    <td>${c.grado}</td>
                    <td>${c.total_estudiantes || 0}</td>
                    <td>${getScoreBadge(c.promedio || 4.2)}</td>
                </tr>
            `).join('');
        }
    }

    function populateCursoDropdowns() {
        const estCursoSelect = document.getElementById('estCurso');
        const calCursoSelect = document.getElementById('calCurso');
        const actCursoSelect = document.getElementById('actCurso');

        const options = state.cursos.map(c => `<option value="${c.id}">${c.nombre} (${c.grado})</option>`).join('');

        if (estCursoSelect) estCursoSelect.innerHTML = `<option value="">Seleccione curso inicial...</option>` + options;
        if (calCursoSelect) calCursoSelect.innerHTML = `<option value="">Seleccione curso...</option>` + options;
        if (actCursoSelect) actCursoSelect.innerHTML = `<option value="">Seleccione curso...</option>` + options;
    }

    // 3. Cargar estudiantes
    async function fetchEstudiantes() {
        try {
            const res = await fetch('/api/estudiantes');
            const data = await res.json();
            if (data.success) {
                state.estudiantes = data.data;
                renderEstudiantes(state.estudiantes);
                populateEstudianteDropdown();
            }
        } catch (e) {
            console.error('Error al cargar estudiantes:', e);
        }
    }

    function renderEstudiantes(list) {
        const tbody = document.getElementById('estudiantesTableBody');
        if (!tbody) return;

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:20px;">No se encontraron estudiantes.</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(e => `
            <tr>
                <td><strong>${e.nombre}</strong></td>
                <td style="color:var(--muted);font-size:13px;">${e.email}</td>
                <td><span class="badge-tag" style="background:#eef1f6;color:var(--navy);font-weight:600;">${e.grado || '10°A'}</span></td>
                <td>${getScoreBadge(e.promedio || 4.0)}</td>
                <td>
                    <button type="button" class="btn-action-sm" onclick="window.abrirModalReporteConEstudiante(${e.id})" title="Redactar reporte individual">
                        ✍️ Reporte
                    </button>
                </td>
            </tr>
        `).join('');
    }

    function populateEstudianteDropdown() {
        const calEstSelect = document.getElementById('calEstudiante');
        if (!calEstSelect) return;
        calEstSelect.innerHTML = `<option value="">Seleccione estudiante...</option>` +
            state.estudiantes.map(e => `<option value="${e.id}">${e.nombre} (${e.grado || 'General'})</option>`).join('');
    }

    // 4. Cargar calificaciones
    async function fetchCalificaciones() {
        try {
            const res = await fetch('/api/calificaciones');
            const data = await res.json();
            if (data.success) {
                state.calificaciones = data.data;
                renderCalificaciones(state.calificaciones);
            }
        } catch (e) {
            console.error('Error al cargar calificaciones:', e);
        }
    }

    function renderCalificaciones(list) {
        const tbody = document.getElementById('calificacionesTableBody');
        const dashTbody = document.getElementById('dashCalificacionesTableBody');

        const rows = list.map(c => `
            <tr>
                <td><strong>${c.estudiante_nombre}</strong></td>
                <td>${c.curso_nombre} (${c.curso_grado})</td>
                <td>${c.actividad_nombre}</td>
                <td>${getScoreBadge(c.nota)}</td>
                <td style="font-size:12.5px;color:var(--muted);">${c.fecha}</td>
            </tr>
        `).join('');

        if (tbody) {
            tbody.innerHTML = rows || `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:20px;">No hay calificaciones registradas.</td></tr>`;
        }
        if (dashTbody) {
            dashTbody.innerHTML = list.slice(0, 5).map(c => `
                <tr>
                    <td><strong>${c.estudiante_nombre}</strong></td>
                    <td>${c.curso_nombre} (${c.curso_grado})</td>
                    <td>${c.actividad_nombre}</td>
                    <td>${getScoreBadge(c.nota)}</td>
                    <td style="font-size:12.5px;color:var(--muted);">${c.fecha}</td>
                </tr>
            `).join('');
        }
    }

    // 5. Cargar actividades
    async function fetchActividades() {
        try {
            const res = await fetch('/api/actividades');
            const data = await res.json();
            if (data.success) {
                state.actividades = data.data;
                renderActividades(state.actividades);
            }
        } catch (e) {
            console.error('Error al cargar actividades:', e);
        }
    }

    function renderActividades(list) {
        const fullList = document.getElementById('actividadesList');
        const dashList = document.getElementById('dashActividadesList');

        if (fullList) {
            fullList.innerHTML = list.map(a => `
                <div class="list-item">
                    <div class="list-item-info">
                        <strong>${a.titulo}</strong>
                        <small>${a.curso_nombre} (${a.curso_grado}) · Entrega: ${a.fecha_entrega}</small>
                    </div>
                    <span class="badge-tag ${a.estado === 'Calificado' ? 'green' : 'amber'}">${a.estado}</span>
                </div>
            `).join('');
        }

        if (dashList) {
            dashList.innerHTML = list.slice(0, 4).map(a => `
                <div class="list-item">
                    <div class="list-item-info">
                        <strong>${a.titulo}</strong>
                        <small>${a.curso_nombre} (${a.curso_grado})</small>
                    </div>
                    <span class="badge-tag ${a.estado === 'Calificado' ? 'green' : 'amber'}">${a.estado}</span>
                </div>
            `).join('');
        }
    }

    // ---------- Filtros de Búsqueda ----------
    const searchEst = document.getElementById('searchEstudiante');
    if (searchEst) {
        searchEst.addEventListener('input', function () {
            const term = this.value.toLowerCase().trim();
            const filtered = state.estudiantes.filter(e =>
                e.nombre.toLowerCase().includes(term) ||
                e.email.toLowerCase().includes(term) ||
                (e.grado && e.grado.toLowerCase().includes(term))
            );
            renderEstudiantes(filtered);
        });
    }

    const searchCal = document.getElementById('searchCalificacion');
    if (searchCal) {
        searchCal.addEventListener('input', function () {
            const term = this.value.toLowerCase().trim();
            const filtered = state.calificaciones.filter(c =>
                c.estudiante_nombre.toLowerCase().includes(term) ||
                c.curso_nombre.toLowerCase().includes(term) ||
                c.actividad_nombre.toLowerCase().includes(term)
            );
            renderCalificaciones(filtered);
        });
    }

    const searchAct = document.getElementById('searchActividad');
    if (searchAct) {
        searchAct.addEventListener('input', function () {
            const term = this.value.toLowerCase().trim();
            const filtered = state.actividades.filter(a =>
                a.titulo.toLowerCase().includes(term) ||
                a.curso_nombre.toLowerCase().includes(term) ||
                a.tipo.toLowerCase().includes(term)
            );
            renderActividades(filtered);
        });
    }

    // ---------- Manejo de Modales ----------
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('open');
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('open');
    }

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', function () {
            closeModal(this.dataset.closeModal);
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function (e) {
            if (e.target === this) this.classList.remove('open');
        });
    });

    // Disparadores de modales
    const btnOpenEst = document.getElementById('btnOpenModalEstudiante');
    const qaOpenEst = document.getElementById('qaNuevoEstudiante');
    if (btnOpenEst) btnOpenEst.addEventListener('click', () => openModal('modalEstudiante'));
    if (qaOpenEst) qaOpenEst.addEventListener('click', (e) => { e.preventDefault(); openModal('modalEstudiante'); });

    const btnOpenCal = document.getElementById('btnOpenModalCalificacion');
    const qaOpenCal = document.getElementById('qaRegistrarCal');
    if (btnOpenCal) btnOpenCal.addEventListener('click', () => openModal('modalCalificacion'));
    if (qaOpenCal) qaOpenCal.addEventListener('click', (e) => { e.preventDefault(); openModal('modalCalificacion'); });

    const btnOpenAct = document.getElementById('btnOpenModalActividad');
    const qaOpenAct = document.getElementById('qaCrearActividad');
    if (btnOpenAct) btnOpenAct.addEventListener('click', () => openModal('modalActividad'));
    if (qaOpenAct) qaOpenAct.addEventListener('click', (e) => { e.preventDefault(); openModal('modalActividad'); });

    // ---------- Envíos de Formulario (Guardado en SQLite) ----------

    // 1. Guardar Estudiante
    const formEst = document.getElementById('formNuevoEstudiante');
    if (formEst) {
        formEst.addEventListener('submit', async function (e) {
            e.preventDefault();
            const submitBtn = formEst.querySelector('button[type="submit"]');
            submitBtn.disabled = true;

            const payload = {
                nombre: document.getElementById('estNombre').value,
                email: document.getElementById('estEmail').value,
                grado: document.getElementById('estGrado').value,
                curso_id: document.getElementById('estCurso').value || null,
                telefono: document.getElementById('estTelefono').value
            };

            try {
                const res = await fetch('/api/estudiantes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (result.success) {
                    showToast('✅ Estudiante registrado en la base de datos');
                    formEst.reset();
                    closeModal('modalEstudiante');
                    await fetchEstudiantes();
                    await fetchMetricas();
                } else {
                    showToast('⚠️ ' + (result.message || 'Error al guardar'));
                }
            } catch (err) {
                showToast('Error de conexión al servidor');
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    // 2. Guardar Calificación
    const formCal = document.getElementById('formNuevaCalificacion');
    if (formCal) {
        formCal.addEventListener('submit', async function (e) {
            e.preventDefault();
            const submitBtn = formCal.querySelector('button[type="submit"]');
            submitBtn.disabled = true;

            const payload = {
                estudiante_id: document.getElementById('calEstudiante').value,
                curso_id: document.getElementById('calCurso').value,
                actividad_nombre: document.getElementById('calActividadNombre').value,
                nota: document.getElementById('calNota').value,
                observacion: document.getElementById('calObservacion').value
            };

            try {
                const res = await fetch('/api/calificaciones', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (result.success) {
                    showToast('✅ Calificación guardada en la base de datos');
                    formCal.reset();
                    closeModal('modalCalificacion');
                    await fetchCalificaciones();
                    await fetchEstudiantes();
                    await fetchMetricas();
                    await fetchCursos();
                } else {
                    showToast('⚠️ ' + (result.message || 'Error al registrar nota'));
                }
            } catch (err) {
                showToast('Error de conexión al servidor');
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    // 3. Guardar Actividad
    const formAct = document.getElementById('formNuevaActividad');
    if (formAct) {
        formAct.addEventListener('submit', async function (e) {
            e.preventDefault();
            const submitBtn = formAct.querySelector('button[type="submit"]');
            submitBtn.disabled = true;

            const payload = {
                curso_id: document.getElementById('actCurso').value,
                titulo: document.getElementById('actTitulo').value,
                tipo: document.getElementById('actTipo').value,
                fecha_entrega: document.getElementById('actFecha').value
            };

            try {
                const res = await fetch('/api/actividades', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (result.success) {
                    showToast('✅ Actividad creada en la base de datos');
                    formAct.reset();
                    closeModal('modalActividad');
                    await fetchActividades();
                    await fetchMetricas();
                } else {
                    showToast('⚠️ ' + (result.message || 'Error al crear actividad'));
                }
            } catch (err) {
                showToast('Error de conexión al servidor');
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    // ====================================================================
    // GESTIÓN DE REPORTES INDIVIDUALES A ESTUDIANTES
    // ====================================================================

    // Helper: badge para tipo de reporte
    function getTipoReporteBadge(tipo) {
        switch (tipo) {
            case 'Felicitación y Mérito':
                return `<span class="badge-tag green">⭐ Felicitación</span>`;
            case 'Plan de Mejoramiento':
                return `<span class="badge-tag amber">⚠️ Plan de Mejora</span>`;
            case 'Llamado de Atención':
                return `<span class="badge-tag red">🛑 Atención</span>`;
            case 'Informe Convivencial':
                return `<span class="badge-tag purp">🤝 Convivencia</span>`;
            default:
                return `<span class="badge-tag">📘 ${tipo || 'Académico'}</span>`;
        }
    }

    // Cargar reportes individuales
    async function fetchReportes() {
        try {
            const res = await fetch('/api/reportes');
            const data = await res.json();
            if (data.success) {
                state.reportes = data.data || [];
                const countBadge = document.getElementById('countReportes');
                if (countBadge) countBadge.textContent = state.reportes.length;
                renderReportes(state.reportes);
                renderEstudiantesReportesTable();
                populateReporteDropdowns();
            }
        } catch (e) {
            console.error('Error al cargar reportes individuales:', e);
        }
    }

    function renderReportes(list) {
        const grid = document.getElementById('reportesGrid');
        const emptyState = document.getElementById('emptyReportes');
        if (!grid) return;

        if (!list || list.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        grid.innerHTML = list.map(r => {
            const avatarInitial = (r.estudiante_nombre || 'E').charAt(0).toUpperCase();
            const recomendacionHtml = r.recomendaciones ? `
                <div class="reporte-recom-box">
                    <strong>💡 Recomendaciones y Compromisos:</strong>
                    ${r.recomendaciones}
                </div>
            ` : '';

            const adjuntoHtml = r.archivo_adjunto ? `
                <div class="reporte-attachment-badge">
                    <span>📎 <strong>${r.archivo_nombre || 'Documento adjunto'}</strong></span>
                    <a href="${r.archivo_adjunto}" download="${r.archivo_nombre || 'reporte-estudiante.pdf'}" target="_blank" rel="noopener noreferrer">
                        Descargar / Abrir ↗
                    </a>
                </div>
            ` : '';

            return `
                <div class="reporte-card-item">
                    <div>
                        <div class="reporte-card-header">
                            <div class="reporte-student-meta">
                                <div class="rep-avatar">${avatarInitial}</div>
                                <div class="rep-info">
                                    <strong>${r.estudiante_nombre}</strong>
                                    <small>${r.estudiante_grado ? r.estudiante_grado + ' · ' : ''}Periodo: ${r.periodo || '1'}</small>
                                </div>
                            </div>
                            ${getTipoReporteBadge(r.tipo)}
                        </div>

                        <div class="reporte-card-body">
                            <div class="reporte-course-info">📚 ${r.curso_nombre || 'Asignatura'} · Docente: ${r.docente_nombre || 'Carlos Andrés Mejía'}</div>
                            <h3>${r.titulo}</h3>
                            <p>${r.contenido}</p>
                            ${recomendacionHtml}
                            ${adjuntoHtml}
                        </div>
                    </div>

                    <div class="reporte-card-footer">
                        <span>📅 ${r.fecha || 'Fecha'}</span>
                        <div class="reporte-actions">
                            <button type="button" class="btn-action-sm" onclick="window.abrirVerReporte(${r.id})" title="Ver formato completo e imprimir">
                                🖨️ Ver / Imprimir
                            </button>
                            <button type="button" class="btn-action-sm danger" onclick="window.eliminarReporte(${r.id})" title="Eliminar este reporte">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Tabla del directorio para escribir reportes directos
    function renderEstudiantesReportesTable() {
        const tbody = document.getElementById('estudiantesReportesTbody');
        if (!tbody) return;

        if (state.estudiantes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:20px;">No hay estudiantes disponibles.</td></tr>`;
            return;
        }

        tbody.innerHTML = state.estudiantes.map(e => {
            const countForStudent = state.reportes.filter(r => r.estudiante_id === e.id).length;
            return `
                <tr>
                    <td><strong>${e.nombre}</strong><br><small style="color:var(--muted);font-size:12px;">${e.email}</small></td>
                    <td><span class="badge-tag" style="background:#eef1f6;color:var(--navy);font-weight:600;">${e.grado || '10°A'}</span></td>
                    <td>${getScoreBadge(e.promedio || 4.0)}</td>
                    <td>
                        <span class="badge-tag ${countForStudent > 0 ? 'green' : ''}">
                            ${countForStudent} ${countForStudent === 1 ? 'reporte' : 'reportes'}
                        </span>
                    </td>
                    <td>
                        <button type="button" class="primary-btn" style="padding:6px 14px;font-size:12px;" onclick="window.abrirModalReporteConEstudiante(${e.id})">
                            ✍️ Escribir reporte
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function populateReporteDropdowns() {
        const selEst = document.getElementById('repEstudiante');
        const selCur = document.getElementById('repCurso');
        const filterCur = document.getElementById('filterReporteCurso');
        const subirSelEst = document.getElementById('subirRepEstudiante');
        const subirSelCur = document.getElementById('subirRepCurso');

        if (selEst && state.estudiantes.length > 0) {
            selEst.innerHTML = `<option value="">Selecciona al estudiante...</option>` +
                state.estudiantes.map(e => `<option value="${e.id}">${e.nombre} (${e.grado || 'General'})</option>`).join('');
        }

        if (subirSelEst && state.estudiantes.length > 0) {
            subirSelEst.innerHTML = `<option value="">Selecciona al estudiante...</option>` +
                state.estudiantes.map(e => `<option value="${e.id}">${e.nombre} (${e.grado || 'General'})</option>`).join('');
        }

        if (selCur && state.cursos.length > 0) {
            selCur.innerHTML = `<option value="">Selecciona el curso...</option>` +
                state.cursos.map(c => `<option value="${c.id}">${c.nombre} (${c.grado})</option>`).join('');
        }

        if (subirSelCur && state.cursos.length > 0) {
            subirSelCur.innerHTML = `<option value="">Selecciona el curso...</option>` +
                state.cursos.map(c => `<option value="${c.id}">${c.nombre} (${c.grado})</option>`).join('');
        }

        if (filterCur && state.cursos.length > 0) {
            filterCur.innerHTML = `<option value="">Todos los cursos</option>` +
                state.cursos.map(c => `<option value="${c.id}">${c.nombre} (${c.grado})</option>`).join('');
        }
    }

    // Pestañas internas de Reportes (Emitidos / Directorio / Estadísticas)
    document.querySelectorAll('[data-rep-view]').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('[data-rep-view]').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const view = this.dataset.repView;
            const subEmitidos = document.getElementById('repSubViewEmitidos');
            const subDirectorio = document.getElementById('repSubViewDirectorio');
            const subCursos = document.getElementById('repSubViewCursos');
            const toolbar = document.getElementById('toolbarReportes');

            if (subEmitidos) subEmitidos.style.display = view === 'emitidos' ? 'block' : 'none';
            if (subDirectorio) subDirectorio.style.display = view === 'directorio' ? 'block' : 'none';
            if (subCursos) subCursos.style.display = view === 'cursos' ? 'block' : 'none';
            if (toolbar) toolbar.style.display = view === 'cursos' ? 'none' : 'flex';
        });
    });

    // Filtros de búsqueda en reportes
    function applyReportFilters() {
        const term = (document.getElementById('searchReporte')?.value || '').toLowerCase().trim();
        const cursoId = document.getElementById('filterReporteCurso')?.value || '';
        const tipoVal = document.getElementById('filterReporteTipo')?.value || '';

        const filtered = state.reportes.filter(r => {
            const matchesTerm = !term ||
                (r.estudiante_nombre && r.estudiante_nombre.toLowerCase().includes(term)) ||
                (r.titulo && r.titulo.toLowerCase().includes(term)) ||
                (r.contenido && r.contenido.toLowerCase().includes(term)) ||
                (r.curso_nombre && r.curso_nombre.toLowerCase().includes(term));

            const matchesCurso = !cursoId || String(r.curso_id) === String(cursoId);
            const matchesTipo = !tipoVal || r.tipo === tipoVal;

            return matchesTerm && matchesCurso && matchesTipo;
        });

        renderReportes(filtered);
    }

    const searchRepInput = document.getElementById('searchReporte');
    if (searchRepInput) searchRepInput.addEventListener('input', applyReportFilters);

    const filterRepCurso = document.getElementById('filterReporteCurso');
    if (filterRepCurso) filterRepCurso.addEventListener('change', applyReportFilters);

    const filterRepTipo = document.getElementById('filterReporteTipo');
    if (filterRepTipo) filterRepTipo.addEventListener('change', applyReportFilters);

    // Abrir modal de nuevo reporte
    const btnOpenReporte = document.getElementById('btnOpenModalReporte');
    if (btnOpenReporte) {
        btnOpenReporte.addEventListener('click', function () {
            populateReporteDropdowns();
            openModal('modalReporteIndividual');
        });
    }

    // Función global para redactar reporte directo a un estudiante específico
    window.abrirModalReporteConEstudiante = function (estudianteId) {
        populateReporteDropdowns();
        const selEst = document.getElementById('repEstudiante');
        if (selEst) {
            selEst.value = String(estudianteId);
            // Intentar seleccionar el curso correspondiente al grado del alumno
            const student = state.estudiantes.find(e => e.id === estudianteId);
            if (student && student.grado) {
                const matchCourse = state.cursos.find(c => c.grado === student.grado);
                const selCur = document.getElementById('repCurso');
                if (matchCourse && selCur) selCur.value = String(matchCourse.id);
            }
        }
        openModal('modalReporteIndividual');
    };

    // Función global para ver reporte formal e imprimirlo
    window.abrirVerReporte = function (reporteId) {
        const reporte = state.reportes.find(r => r.id === reporteId);
        if (!reporte) return;

        const container = document.getElementById('verReporteContent');
        if (!container) return;

        container.innerHTML = `
            <div class="print-paper">
                <div class="print-header">
                    <div>
                        <h3>Institución Educativa Inocencio Chincá</h3>
                        <p>Tame, Arauca · Sistema de Información Académica</p>
                        <p><strong>INFORME VALORATIVO INDIVIDUAL DEL ESTUDIANTE</strong></p>
                    </div>
                    <div>
                        ${getTipoReporteBadge(reporte.tipo)}
                    </div>
                </div>

                <div class="print-student-box">
                    <div><strong>Estudiante:</strong> ${reporte.estudiante_nombre}</div>
                    <div><strong>Grado:</strong> ${reporte.estudiante_grado || '10°A'}</div>
                    <div><strong>Asignatura:</strong> ${reporte.curso_nombre || 'General'}</div>
                    <div><strong>Periodo Escolar:</strong> ${reporte.periodo || 'Primer Periodo'}</div>
                    <div><strong>Docente Evaluador:</strong> ${reporte.docente_nombre || 'Carlos Andrés Mejía'}</div>
                    <div><strong>Fecha de Emisión:</strong> ${reporte.fecha || 'Fecha actual'}</div>
                </div>

                <div class="print-body">
                    <h4>Motivo / Asunto:</h4>
                    <p><strong>${reporte.titulo}</strong></p>

                    <h4>Observación Pedagógica y Valoración del Desempeño:</h4>
                    <p>${reporte.contenido}</p>

                    ${reporte.recomendaciones ? `
                        <h4>Recomendaciones Formativas y Compromisos:</h4>
                        <p>${reporte.recomendaciones}</p>
                    ` : ''}

                    ${reporte.archivo_adjunto ? `
                        <div class="reporte-attachment-badge" style="margin-top:18px;">
                            <span>📎 <strong>Documento / Anexo adjunto:</strong> ${reporte.archivo_nombre || 'archivo-reporte'}</span>
                            <a href="${reporte.archivo_adjunto}" download="${reporte.archivo_nombre || 'reporte.pdf'}" target="_blank">
                                Descargar documento original ↗
                            </a>
                        </div>
                    ` : ''}
                </div>

                <div class="print-signature">
                    <div class="signature-line">
                        <strong>${reporte.docente_nombre || 'Carlos Andrés Mejía'}</strong><br>
                        Docente Titular
                    </div>
                    <div class="signature-line">
                        Firma Acudiente / Padre de Familia
                    </div>
                </div>
            </div>
        `;

        openModal('modalVerReporte');
    };

    // Imprimir reporte individual
    const btnPrint = document.getElementById('btnPrintReporte');
    if (btnPrint) {
        btnPrint.addEventListener('click', function () {
            window.print();
        });
    }

    // Botón abrir modal específico de subir reporte
    const btnOpenSubirRep = document.getElementById('btnOpenModalSubirReporte');
    if (btnOpenSubirRep) {
        btnOpenSubirRep.addEventListener('click', function () {
            populateReporteDropdowns();
            openModal('modalSubirReporte');
        });
    }

    // Helper: Lectura de archivo a Base64
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // Configurar Dropzone 1: Para modal de reporte escrito (opcional)
    let archivoEscritoData = null;
    let archivoEscritoNombre = null;

    const dropzoneEscrito = document.getElementById('dropzoneReporteEscrito');
    const inputEscrito = document.getElementById('repArchivoEscrito');
    const previewEscrito = document.getElementById('previewArchivoEscrito');

    if (dropzoneEscrito && inputEscrito) {
        dropzoneEscrito.addEventListener('click', (e) => {
            if (e.target.closest('.remove-btn')) return;
            inputEscrito.click();
        });

        dropzoneEscrito.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzoneEscrito.classList.add('dragover');
        });

        dropzoneEscrito.addEventListener('dragleave', () => {
            dropzoneEscrito.classList.remove('dragover');
        });

        dropzoneEscrito.addEventListener('drop', async (e) => {
            e.preventDefault();
            dropzoneEscrito.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileSelectEscrito(e.dataTransfer.files[0]);
            }
        });

        inputEscrito.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleFileSelectEscrito(e.target.files[0]);
            }
        });

        async function handleFileSelectEscrito(file) {
            if (file.size > 15 * 1024 * 1024) {
                showToast('⚠️ El archivo no debe superar 15MB');
                return;
            }
            try {
                archivoEscritoData = await fileToBase64(file);
                archivoEscritoNombre = file.name;
                if (previewEscrito) {
                    previewEscrito.innerHTML = `📎 ${file.name} (${(file.size/1024).toFixed(1)} KB) <button type="button" class="remove-btn" title="Quitar archivo">&times;</button>`;
                    previewEscrito.style.display = 'inline-flex';
                    previewEscrito.querySelector('.remove-btn').onclick = (ev) => {
                        ev.stopPropagation();
                        archivoEscritoData = null;
                        archivoEscritoNombre = null;
                        inputEscrito.value = '';
                        previewEscrito.style.display = 'none';
                    };
                }
            } catch (err) {
                showToast('Error al procesar el archivo');
            }
        }
    }

    // Configurar Dropzone 2: Para modal específico de Subir Reporte / Documento
    let archivoSubirData = null;
    let archivoSubirNombre = null;

    const dropzoneSubir = document.getElementById('dropzoneSubirReporte');
    const inputSubir = document.getElementById('inputSubirArchivo');
    const previewSubir = document.getElementById('previewSubirArchivo');

    if (dropzoneSubir && inputSubir) {
        dropzoneSubir.addEventListener('click', (e) => {
            if (e.target.closest('.remove-btn')) return;
            inputSubir.click();
        });

        dropzoneSubir.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzoneSubir.classList.add('dragover');
        });

        dropzoneSubir.addEventListener('dragleave', () => {
            dropzoneSubir.classList.remove('dragover');
        });

        dropzoneSubir.addEventListener('drop', async (e) => {
            e.preventDefault();
            dropzoneSubir.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileSelectSubir(e.dataTransfer.files[0]);
            }
        });

        inputSubir.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleFileSelectSubir(e.target.files[0]);
            }
        });

        async function handleFileSelectSubir(file) {
            if (file.size > 15 * 1024 * 1024) {
                showToast('⚠️ El archivo no debe superar 15MB');
                return;
            }
            try {
                archivoSubirData = await fileToBase64(file);
                archivoSubirNombre = file.name;
                if (previewSubir) {
                    previewSubir.innerHTML = `📄 ${file.name} (${(file.size/1024).toFixed(1)} KB) <button type="button" class="remove-btn" title="Quitar archivo">&times;</button>`;
                    previewSubir.style.display = 'inline-flex';
                    previewSubir.querySelector('.remove-btn').onclick = (ev) => {
                        ev.stopPropagation();
                        archivoSubirData = null;
                        archivoSubirNombre = null;
                        inputSubir.value = '';
                        previewSubir.style.display = 'none';
                    };
                }
                // Si el título está vacío, autocompletar con el nombre del archivo sin extensión
                const titInput = document.getElementById('subirRepTitulo');
                if (titInput && !titInput.value) {
                    titInput.value = file.name.replace(/\.[^/.]+$/, '');
                }
            } catch (err) {
                showToast('Error al leer el archivo');
            }
        }
    }

    // Manejar envío del formulario modal "Subir Reporte"
    const formSubir = document.getElementById('formSubirReporteDoc');
    if (formSubir) {
        formSubir.addEventListener('submit', async function (e) {
            e.preventDefault();
            if (!archivoSubirData) {
                showToast('⚠️ Debes seleccionar o arrastrar un archivo para subir.');
                return;
            }

            const submitBtn = formSubir.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Subiendo reporte...';

            const payload = {
                estudiante_id: document.getElementById('subirRepEstudiante').value,
                curso_id: document.getElementById('subirRepCurso').value,
                periodo: document.getElementById('subirRepPeriodo').value,
                tipo: document.getElementById('subirRepTipo').value,
                titulo: document.getElementById('subirRepTitulo').value.trim(),
                contenido: document.getElementById('subirRepContenido').value.trim() || `Reporte / documento adjunto cargado por el docente para revisión del estudiante y acudientes.`,
                recomendaciones: 'Descargar y revisar el archivo adjunto.',
                archivo_adjunto: archivoSubirData,
                archivo_nombre: archivoSubirNombre
            };

            try {
                const res = await fetch('/api/reportes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (result.success) {
                    showToast('🎉 ¡Reporte subido y publicado con éxito!');
                    formSubir.reset();
                    archivoSubirData = null;
                    archivoSubirNombre = null;
                    if (previewSubir) previewSubir.style.display = 'none';
                    closeModal('modalSubirReporte');
                    await fetchReportes();
                } else {
                    showToast('⚠️ ' + (result.message || 'Error al subir reporte'));
                }
            } catch (err) {
                showToast('Error de conexión al servidor al subir archivo');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = '☁️ Subir y Publicar Reporte';
            }
        });
    }

    // Función global para eliminar reporte individual
    window.eliminarReporte = async function (reporteId) {
        if (!confirm('¿Estás seguro de que deseas eliminar este reporte individual?')) return;

        try {
            const res = await fetch(`/api/reportes/${reporteId}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                showToast('🗑️ Reporte eliminado');
                await fetchReportes();
            } else {
                showToast('⚠️ No se pudo eliminar el reporte');
            }
        } catch (e) {
            showToast('Error de conexión al eliminar reporte');
        }
    };

    // Guardar nuevo reporte escrito individual
    const formRep = document.getElementById('formNuevoReporte');
    if (formRep) {
        formRep.addEventListener('submit', async function (e) {
            e.preventDefault();
            const submitBtn = formRep.querySelector('button[type="submit"]');
            submitBtn.disabled = true;

            const payload = {
                estudiante_id: document.getElementById('repEstudiante').value,
                curso_id: document.getElementById('repCurso').value,
                periodo: document.getElementById('repPeriodo').value,
                tipo: document.getElementById('repTipo').value,
                titulo: document.getElementById('repTitulo').value.trim(),
                contenido: document.getElementById('repContenido').value.trim(),
                recomendaciones: document.getElementById('repRecomendaciones').value.trim(),
                archivo_adjunto: archivoEscritoData,
                archivo_nombre: archivoEscritoNombre
            };

            try {
                const res = await fetch('/api/reportes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (result.success) {
                    showToast('✅ Reporte individual emitido con éxito');
                    formRep.reset();
                    archivoEscritoData = null;
                    archivoEscritoNombre = null;
                    if (previewEscrito) previewEscrito.style.display = 'none';
                    closeModal('modalReporteIndividual');
                    await fetchReportes();
                } else {
                    showToast('⚠️ ' + (result.message || 'Error al guardar reporte'));
                }
            } catch (err) {
                showToast('Error de conexión al servidor');
            } finally {
                submitBtn.disabled = false;
            }
        });
    }

    // Inicializar carga de datos desde Supabase / backend
    fetchMetricas();
    fetchCursos();
    fetchEstudiantes();
    fetchCalificaciones();
    fetchActividades();
    fetchReportes();
});
