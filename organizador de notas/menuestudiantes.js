document.addEventListener("DOMContentLoaded", function () {
    // ---------- Sesión ----------
    const session = JSON.parse(localStorage.getItem("organizadorNotasSesion") || "null");

    // Si la sesión activa es de docente, redirigir al panel de docente
    if (session && (session.role === "docente" || session.rol === "docente")) {
        window.location.href = "menudocentes.html";
        return;
    }

    const displayName = session && (session.name || session.nombre) ? (session.name || session.nombre) : "María José Pérez";
    const displayEmail = session && session.email ? session.email : "maria.perez@estudiante.edu.co";
    const studentGrado = session && (session.grade || session.grado) ? (session.grade || session.grado) : "10°A";
    const initial = displayName.charAt(0).toUpperCase();

    const navUserName = document.getElementById("navUserName");
    const userAvatar = document.getElementById("userAvatar");
    const welcomeName = document.getElementById("welcomeName");
    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");
    const profileAvatar = document.getElementById("profileAvatar");
    const profileGrado = document.getElementById("profileGrado");
    const areasGradoBadge = document.getElementById("areasGradoBadge");

    if (navUserName) navUserName.textContent = displayName;
    if (userAvatar) userAvatar.textContent = initial;
    if (welcomeName) welcomeName.textContent = displayName;
    if (profileName) profileName.textContent = displayName;
    if (profileEmail) profileEmail.textContent = displayEmail;
    if (profileAvatar) profileAvatar.textContent = initial;
    if (profileGrado) profileGrado.textContent = studentGrado;
    if (areasGradoBadge) areasGradoBadge.textContent = studentGrado;

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
        toastTimeout = setTimeout(() => toast.classList.remove("show"), 2600);
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
            document.getElementById("panel-inicio").classList.add("active-panel");
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

    if (userTrigger) {
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

    if (notifBtn) {
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
        setTimeout(() => { window.location.href = "menu.html"; }, 700);
    }

    const logoutBtn = document.getElementById("logoutBtn");
    const logoutBtnSidebar = document.getElementById("logoutBtnSidebar");
    if (logoutBtn) logoutBtn.addEventListener("click", function (e) { e.preventDefault(); logout(); });
    if (logoutBtnSidebar) logoutBtnSidebar.addEventListener("click", function (e) { e.preventDefault(); logout(); });

    // ====================================================================
    // CONEXIÓN CON LA BASE DE DATOS SUPABASE (REST API)
    // ====================================================================
    let studentState = {
        cursos: [],
        calificaciones: [],
        actividades: [],
        reportes: [],
        currentUser: null
    };

    function getScoreBadge(score) {
        const num = parseFloat(score);
        if (isNaN(num)) return `<span class="badge-score">--</span>`;
        return `<span class="badge-score">${num.toFixed(1)}</span>`;
    }

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

    async function loadStudentData() {
        try {
            // Cargar áreas según el grado del estudiante
            const resCursos = await fetch(`/api/cursos?grado=${encodeURIComponent(studentGrado)}`);
            const dataCursos = await resCursos.json();
            if (dataCursos.success && dataCursos.data && dataCursos.data.length > 0) {
                studentState.cursos = dataCursos.data;
            } else {
                // Fallback si no hay específicos por query: traer todos y filtrar por grado
                const resAll = await fetch('/api/cursos');
                const dataAll = await resAll.json();
                if (dataAll.success) {
                    const filteredByGrade = dataAll.data.filter(c => 
                        c.grado && c.grado.toLowerCase() === studentGrado.toLowerCase()
                    );
                    studentState.cursos = filteredByGrade.length > 0 ? filteredByGrade : dataAll.data;
                }
            }

            renderAreasEst(studentState.cursos);
            populateFilterCursos(studentState.cursos);
            updateStudentMetrics();

            // Cargar actividades
            const resAct = await fetch('/api/actividades');
            const dataAct = await resAct.json();
            if (dataAct.success) {
                studentState.actividades = dataAct.data;
                renderActividadesEst(studentState.actividades);
            }

            // Cargar calificaciones
            const resCal = await fetch('/api/calificaciones');
            const dataCal = await resCal.json();
            if (dataCal.success) {
                // Filtrar notas para el estudiante si coincide nombre o correo
                const allCal = dataCal.data;
                const studentCal = allCal.filter(c =>
                    c.estudiante_nombre.toLowerCase().includes(displayName.toLowerCase()) ||
                    displayName.toLowerCase().includes(c.estudiante_nombre.toLowerCase())
                );

                // Si no hay específicas, mostrar el listado general del grado
                studentState.calificaciones = studentCal.length > 0 ? studentCal : allCal;
                renderCalificacionesEst(studentState.calificaciones);
                updateStudentMetrics();
            }

            // Cargar reportes individuales para el estudiante
            const resRep = await fetch('/api/reportes');
            const dataRep = await resRep.json();
            if (dataRep.success) {
                const allRep = dataRep.data;
                const myRep = allRep.filter(r =>
                    (session && session.id && String(r.estudiante_id) === String(session.id)) ||
                    (r.estudiante_nombre && r.estudiante_nombre.toLowerCase().includes(displayName.toLowerCase())) ||
                    (displayName && displayName.toLowerCase().includes((r.estudiante_nombre || '').toLowerCase()))
                );
                studentState.reportes = myRep.length > 0 ? myRep : allRep.slice(0, 2);
                renderMisReportes(studentState.reportes);
            }
        } catch (e) {
            console.error('Error al conectar con la base de datos:', e);
        }
    }

    function renderMisReportes(list) {
        const grid = document.getElementById('misReportesGrid');
        const emptyState = document.getElementById('emptyMisReportes');
        if (!grid) return;

        if (!list || list.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        grid.innerHTML = list.map(r => {
            const initial = (r.estudiante_nombre || 'E').charAt(0).toUpperCase();
            return `
                <div class="reporte-card-item">
                    <div>
                        <div class="reporte-card-header">
                            <div class="reporte-student-meta">
                                <div class="rep-avatar">${initial}</div>
                                <div class="rep-info">
                                    <strong>${r.estudiante_nombre}</strong>
                                    <small>${r.periodo || 'Primer Periodo'} · ${r.fecha || 'Reciente'}</small>
                                </div>
                            </div>
                            ${getTipoReporteBadge(r.tipo)}
                        </div>

                        <div class="reporte-card-body">
                            <div class="reporte-course-info">📚 ${r.curso_nombre || 'Asignatura'} · Docente: ${r.docente_nombre || 'Docente titular'}</div>
                            <h3>${r.titulo}</h3>
                            <p>${r.contenido}</p>
                            ${r.recomendaciones ? `
                                <div class="reporte-recom-box">
                                    <strong>💡 Recomendaciones y Compromisos del Docente:</strong>
                                    ${r.recomendaciones}
                                </div>
                            ` : ''}
                            ${r.archivo_adjunto ? `
                                <div class="reporte-attachment-badge">
                                    <span>📎 <strong>${r.archivo_nombre || 'Documento adjunto'}</strong></span>
                                    <a href="${r.archivo_adjunto}" download="${r.archivo_nombre || 'mi-reporte.pdf'}" target="_blank" rel="noopener noreferrer">
                                        Descargar / Abrir ↗
                                    </a>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <div class="reporte-card-footer">
                        <span>Docente: <strong>${r.docente_nombre || 'Carlos Andrés Mejía'}</strong></span>
                        <button type="button" class="btn-action-sm" onclick="window.verMiReporte(${r.id})">
                            🖨️ Ver / Imprimir
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Modal para ver reporte en detalle
    window.verMiReporte = function (reporteId) {
        const rep = studentState.reportes.find(r => r.id === reporteId);
        if (!rep) return;

        const content = document.getElementById('verReporteEstContent');
        if (!content) return;

        content.innerHTML = `
            <div class="print-paper">
                <div class="print-header">
                    <div>
                        <h3>Institución Educativa Inocencio Chincá</h3>
                        <p>Tame, Arauca · Sistema de Información Académica</p>
                        <p><strong>INFORME VALORATIVO INDIVIDUAL DEL ESTUDIANTE</strong></p>
                    </div>
                    <div>
                        ${getTipoReporteBadge(rep.tipo)}
                    </div>
                </div>

                <div class="print-student-box">
                    <div><strong>Estudiante:</strong> ${rep.estudiante_nombre}</div>
                    <div><strong>Grado:</strong> ${rep.estudiante_grado || '10°A'}</div>
                    <div><strong>Asignatura:</strong> ${rep.curso_nombre || 'General'}</div>
                    <div><strong>Periodo Escolar:</strong> ${rep.periodo || 'Primer Periodo'}</div>
                    <div><strong>Docente Evaluador:</strong> ${rep.docente_nombre || 'Carlos Andrés Mejía'}</div>
                    <div><strong>Fecha de Emisión:</strong> ${rep.fecha || 'Fecha actual'}</div>
                </div>

                <div class="print-body">
                    <h4>Motivo / Asunto:</h4>
                    <p><strong>${rep.titulo}</strong></p>

                    <h4>Observación Pedagógica y Valoración del Desempeño:</h4>
                    <p>${rep.contenido}</p>

                    ${rep.recomendaciones ? `
                        <h4>Recomendaciones Formativas y Compromisos:</h4>
                        <p>${rep.recomendaciones}</p>
                    ` : ''}

                    ${rep.archivo_adjunto ? `
                        <div class="reporte-attachment-badge" style="margin-top:18px;">
                            <span>📎 <strong>Documento / Archivo adjunto:</strong> ${rep.archivo_nombre || 'archivo-reporte'}</span>
                            <a href="${rep.archivo_adjunto}" download="${rep.archivo_nombre || 'reporte.pdf'}" target="_blank">
                                Descargar documento original ↗
                            </a>
                        </div>
                    ` : ''}
                </div>

                <div class="print-signature">
                    <div class="signature-line">
                        <strong>${rep.docente_nombre || 'Carlos Andrés Mejía'}</strong><br>
                        Docente Titular
                    </div>
                    <div class="signature-line">
                        Firma Acudiente / Padre de Familia
                    </div>
                </div>
            </div>
        `;

        const modal = document.getElementById('modalVerReporteEst');
        if (modal) modal.classList.add('open');
    };

    // Cerrar modales
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', function () {
            const modalId = this.dataset.closeModal;
            const modal = document.getElementById(modalId);
            if (modal) modal.classList.remove('open');
        });
    });

    // Imprimir
    const btnPrintEst = document.getElementById('btnPrintReporteEst');
    if (btnPrintEst) {
        btnPrintEst.addEventListener('click', function () {
            window.print();
        });
    }

    function updateStudentMetrics() {
        const mC = document.getElementById('metricCursosEst');
        const mP = document.getElementById('metricPromedioEst');
        const mPend = document.getElementById('metricPendientesEst');

        if (mC) mC.textContent = studentState.cursos.length || 6;

        if (mP && studentState.calificaciones.length > 0) {
            const sum = studentState.calificaciones.reduce((acc, c) => acc + (parseFloat(c.nota) || 0), 0);
            const avg = (sum / studentState.calificaciones.length).toFixed(1);
            mP.textContent = avg;
        }

        if (mPend) {
            const pending = studentState.actividades.filter(a => a.estado !== 'Calificado').length;
            mPend.textContent = pending || 4;
        }
    }

    function getAreaIcon(nombre) {
        const n = (nombre || '').toLowerCase();
        if (n.includes('mate') || n.includes('cálculo') || n.includes('álgebra')) return '📐';
        if (n.includes('física')) return '⚡';
        if (n.includes('química')) return '🧪';
        if (n.includes('biología') || n.includes('naturales') || n.includes('ciencias')) return '🌿';
        if (n.includes('inglés') || n.includes('idioma')) return '🌐';
        if (n.includes('castellana') || n.includes('lengua') || n.includes('literatura') || n.includes('español')) return '📖';
        if (n.includes('sociales') || n.includes('historia') || n.includes('filosofía')) return '🏛️';
        if (n.includes('tecnología') || n.includes('informática') || n.includes('sistemas')) return '💻';
        if (n.includes('educación física') || n.includes('deporte')) return '⚽';
        if (n.includes('ética') || n.includes('valores') || n.includes('religión')) return '🕊️';
        if (n.includes('artística') || n.includes('arte')) return '🎨';
        return '📚';
    }

    function renderAreasEst(areas) {
        const grid = document.getElementById('areasEstGrid') || document.getElementById('cursosEstGrid');
        const dashTbody = document.getElementById('dashCursosEstTbody');

        if (grid) {
            if (!areas || areas.length === 0) {
                grid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: white; border-radius: 12px; border: 1px dashed var(--line);">
                        <p style="color: var(--muted); font-size: 15px;">No hay áreas registradas para el grado ${studentGrado}.</p>
                    </div>
                `;
            } else {
                grid.innerHTML = areas.map(a => {
                    const docenteName = a.docente_nombre || 'Docente titular';
                    const docenteInitial = docenteName.charAt(0).toUpperCase();
                    const areaIcon = getAreaIcon(a.nombre);

                    return `
                        <div class="area-card">
                            <div>
                                <div class="area-card-top">
                                    <span class="area-tag">Grado ${a.grado || studentGrado}</span>
                                    <div class="area-icon-pill" title="${a.nombre}">${areaIcon}</div>
                                </div>
                                <h3>${a.nombre}</h3>
                                <p class="area-desc">${a.descripcion || 'Plan curricular y desarrollo temático del periodo académico actual.'}</p>
                                
                                <div class="area-docente-box">
                                    <div class="docente-avatar-mini">${docenteInitial}</div>
                                    <div class="docente-meta">
                                        <small>Docente Titular</small>
                                        <strong title="${docenteName}">${docenteName}</strong>
                                    </div>
                                </div>
                            </div>

                            <div class="area-meta-footer">
                                <span>Promedio: <strong>${a.promedio || '4.2'}</strong></span>
                                <span>Progreso: <strong>${a.progreso || 80}%</strong></span>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        if (dashTbody) {
            dashTbody.innerHTML = areas.slice(0, 6).map(a => `
                <tr>
                    <td><strong>${a.nombre} (${a.grado || studentGrado})</strong></td>
                    <td>
                        <span style="display: inline-flex; align-items: center; gap: 6px;">
                            👤 <strong>${a.docente_nombre || 'Docente titular'}</strong>
                        </span>
                    </td>
                    <td>${getScoreBadge(a.promedio || 4.2)}</td>
                    <td class="progress-cell">
                        <span class="progress-track"><span class="progress-fill" style="width:${a.progreso || 80}%"></span></span>
                        <span>${a.progreso || 80}%</span>
                    </td>
                </tr>
            `).join('');
        }
    }

    // Mantener compatibilidad por si se llama a renderCursosEst
    function renderCursosEst(cursos) {
        renderAreasEst(cursos);
    }

    function populateFilterCursos(cursos) {
        const filter = document.getElementById('filterCursoEst');
        if (!filter) return;
        filter.innerHTML = `<option value="">Todas las áreas</option>` +
            cursos.map(c => `<option value="${c.nombre}">${c.nombre}</option>`).join('');
    }

    function renderActividadesEst(actividades) {
        const list = document.getElementById('actividadesEstList');
        const dashList = document.getElementById('dashActividadesEstList');

        if (list) {
            list.innerHTML = actividades.map(a => `
                <div class="list-item">
                    <div class="list-item-info">
                        <strong>${a.titulo}</strong>
                        <small>${a.curso_nombre} (${a.curso_grado}) · Entrega: ${a.fecha_entrega}</small>
                    </div>
                    <span class="badge-tag ${a.estado === 'Calificado' ? 'green' : ''}">${a.estado}</span>
                </div>
            `).join('');
        }

        if (dashList) {
            dashList.innerHTML = actividades.slice(0, 5).map(a => `
                <div class="list-item">
                    <div class="list-item-info">
                        <strong>${a.titulo}</strong>
                        <small>${a.curso_nombre} (${a.curso_grado})</small>
                    </div>
                    <div class="date-chip">
                        <strong>${a.fecha_entrega}</strong>
                        <span class="badge-tag ${a.estado === 'Calificado' ? 'green' : ''}">${a.estado}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    function renderCalificacionesEst(calificaciones) {
        const tbody = document.getElementById('calificacionesEstTbody');
        const dashTbody = document.getElementById('dashCalificacionesEstTbody');

        const rows = calificaciones.map(c => `
            <tr>
                <td><strong>${c.actividad_nombre}</strong>${c.observacion ? `<br><small style="color:var(--muted);">${c.observacion}</small>` : ''}</td>
                <td>${c.curso_nombre} (${c.curso_grado})</td>
                <td>${getScoreBadge(c.nota)}</td>
                <td style="color:var(--muted);font-size:13px;">${c.fecha}</td>
            </tr>
        `).join('');

        if (tbody) {
            tbody.innerHTML = rows || `<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:20px;">No hay calificaciones registradas aún.</td></tr>`;
        }
        if (dashTbody) {
            dashTbody.innerHTML = calificaciones.slice(0, 5).map(c => `
                <tr>
                    <td>${c.actividad_nombre}</td>
                    <td>${c.curso_nombre}</td>
                    <td>${getScoreBadge(c.nota)}</td>
                    <td style="color:var(--muted);font-size:13px;">${c.fecha}</td>
                </tr>
            `).join('');
        }
    }

    // Filtros de búsqueda para estudiantes
    const searchCalEst = document.getElementById('searchCalEst');
    const filterCursoEst = document.getElementById('filterCursoEst');

    function applyCalFilters() {
        const term = (searchCalEst ? searchCalEst.value : '').toLowerCase().trim();
        const cursoFilter = filterCursoEst ? filterCursoEst.value : '';

        const filtered = studentState.calificaciones.filter(c => {
            const matchesTerm = c.actividad_nombre.toLowerCase().includes(term) ||
                c.curso_nombre.toLowerCase().includes(term);
            const matchesCurso = !cursoFilter || c.curso_nombre.toLowerCase().includes(cursoFilter.toLowerCase());
            return matchesTerm && matchesCurso;
        });

        renderCalificacionesEst(filtered);
    }

    if (searchCalEst) searchCalEst.addEventListener('input', applyCalFilters);
    if (filterCursoEst) filterCursoEst.addEventListener('change', applyCalFilters);

    // Iniciar carga
    loadStudentData();
});
