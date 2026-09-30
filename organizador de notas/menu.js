document.addEventListener("DOMContentLoaded", function () {
    // ---------- Referencias ----------
    const views = document.querySelectorAll(".view");
    const topLoginBtn = document.getElementById("topLogin");
    const roleButtons = document.querySelectorAll(".role-button[data-role]");
    const backHomeBtn = document.getElementById("backHome");

    const loginCard = document.getElementById("loginCard");
    const sideRoleIcon = document.getElementById("sideRoleIcon");
    const sideRoleText = document.getElementById("sideRoleText");
    const formRoleText = document.getElementById("formRoleText");
    const emailLabel = document.getElementById("emailLabel");

    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const rememberCheckbox = document.getElementById("remember");
    const togglePasswordBtn = document.getElementById("togglePassword");
    const forgotBtn = document.getElementById("forgotPassword");
    const createAccountBtn = document.getElementById("createAccount");
    const googleBtn = document.getElementById("googleLogin");

    const toast = document.getElementById("toast");
    const yearEl = document.getElementById("year");
    const footerYearEl = document.getElementById("footerYear");

    let currentRole = "docente";
    let toastTimeout;

    const ROLE_ICONS = {
        docente: `<svg viewBox="0 0 64 64" fill="none"><circle cx="23" cy="25" r="7" stroke="currentColor" stroke-width="3"/><path d="M10 49c1.5-9 6.5-13 13-13s11.5 4 13 13" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M35 15h17v25H35" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M35 31h-7" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`,
        estudiante: `<svg viewBox="0 0 64 64" fill="none"><path d="M13 25 32 15l19 10-19 10-19-10Z" fill="currentColor"/><path d="M20 29v10c4 4 20 4 24 0V29" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><circle cx="32" cy="23" r="4" fill="white"/><path d="M48 28v11" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`
    };

    // ---------- Utilidades ----------
    function showToast(message) {
        if (!toast) return;
        clearTimeout(toastTimeout);
        toast.textContent = message;
        toast.classList.add("show");
        toastTimeout = setTimeout(() => toast.classList.remove("show"), 3000);
    }

    function showView(viewId) {
        views.forEach(v => v.classList.remove("active-view"));
        const target = document.getElementById(viewId);
        if (target) target.classList.add("active-view");

        document.querySelectorAll(".nav-link").forEach(link => {
            link.classList.toggle("active", link.dataset.view === viewId);
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function setRoleMode(role) {
        currentRole = role;
        const isStudent = role === "estudiante";

        if (loginCard) {
            loginCard.classList.toggle("student-mode", isStudent);
            loginCard.classList.toggle("student-form", isStudent);
            loginCard.classList.toggle("student-login", isStudent);
        }

        if (sideRoleIcon) sideRoleIcon.innerHTML = ROLE_ICONS[role];

        const roleLabel = isStudent ? "Estudiantes" : "Docentes";
        if (sideRoleText) sideRoleText.textContent = roleLabel;
        if (formRoleText) formRoleText.textContent = roleLabel;
        if (emailLabel) emailLabel.textContent = isStudent ? "estudiantil" : "institucional";

        // Actualizar pestañas del selector de rol en el login
        const tabDoc = document.getElementById("tabDocente");
        const tabEst = document.getElementById("tabEstudiante");
        if (tabDoc) tabDoc.classList.toggle("active", role === "docente");
        if (tabEst) tabEst.classList.toggle("active", role === "estudiante");
    }

    function deriveName(email) {
        const local = email.split("@")[0].replace(/[._\d]+/g, " ").trim();
        if (!local) return currentRole === "docente" ? "Docente" : "Estudiante";
        return local
            .split(" ")
            .filter(Boolean)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
    }

    function setFieldError(inputEl, errorId, message) {
        const wrap = inputEl.closest(".input-wrap");
        if (wrap) wrap.classList.add("input-error");
        const errorEl = document.getElementById(errorId);
        if (errorEl) errorEl.textContent = message;
    }

    function clearFieldErrors() {
        document.querySelectorAll(".error-message").forEach(el => el.textContent = "");
        document.querySelectorAll(".input-wrap").forEach(el => el.classList.remove("input-error"));
    }

    function validateForm() {
        let isValid = true;
        clearFieldErrors();

        if (!emailInput.value.trim()) {
            setFieldError(emailInput, "emailError", "El correo electrónico es requerido.");
            isValid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(emailInput.value.trim())) {
            setFieldError(emailInput, "emailError", "Ingresa un correo electrónico válido.");
            isValid = false;
        }

        if (!passwordInput.value.trim()) {
            setFieldError(passwordInput, "passwordError", "La contraseña es requerida.");
            isValid = false;
        } else if (passwordInput.value.trim().length < 4) {
            setFieldError(passwordInput, "passwordError", "La contraseña debe tener al menos 4 caracteres.");
            isValid = false;
        }

        return isValid;
    }

    // ---------- Año dinámico en footer ----------
    const currentYear = new Date().getFullYear();
    if (yearEl) yearEl.textContent = currentYear;
    if (footerYearEl) footerYearEl.textContent = currentYear;

    // ---------- Recordar correo ----------
    const savedEmail = localStorage.getItem("organizadorNotasEmail");
    if (savedEmail && emailInput) {
        emailInput.value = savedEmail;
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }

    // ---------- Navegación (Inicio / Proyecto / Acerca de) ----------
    document.querySelectorAll("[data-view]").forEach(el => {
        el.addEventListener("click", function (e) {
            e.preventDefault();
            showView(this.dataset.view);
        });
    });

    // ---------- Botón "Iniciar sesión" del navbar ----------
    if (topLoginBtn) {
        topLoginBtn.addEventListener("click", function () {
            setRoleMode(currentRole);
            showView("login");
        });
    }

    // ---------- Tarjetas de rol (Docente / Estudiante) ----------
    roleButtons.forEach(button => {
        button.addEventListener("click", function () {
            setRoleMode(this.dataset.role);
            showView("login");
        });
    });

    // Pestañas de cambio directo de rol dentro de la tarjeta de login
    document.querySelectorAll("[data-set-role]").forEach(tab => {
        tab.addEventListener("click", function () {
            setRoleMode(this.dataset.setRole);
        });
    });

    // ---------- Volver al inicio desde el login ----------
    if (backHomeBtn) {
        backHomeBtn.addEventListener("click", function (e) {
            e.preventDefault();
            showView("inicio");
        });
    }

    // ---------- Mostrar / ocultar contraseña ----------
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener("click", function () {
            const isHidden = passwordInput.type === "password";
            passwordInput.type = isHidden ? "text" : "password";
            togglePasswordBtn.setAttribute("aria-label", isHidden ? "Ocultar contraseña" : "Mostrar contraseña");
        });
    }

    // ---------- Acciones secundarias (modo demostración) ----------
    // ---------- Modal de Recuperación / Obtención de Contraseña ----------
    const recoverModalOverlay = document.getElementById("recoverModalOverlay");
    const recoverModalClose = document.getElementById("recoverModalClose");
    const btnRecoverDocente = document.getElementById("btnRecoverDocente");
    const btnRecoverEstudiante = document.getElementById("btnRecoverEstudiante");
    const recoverStep1Pane = document.getElementById("recoverStep1Pane");
    const recoverStep2Pane = document.getElementById("recoverStep2Pane");
    const recoverEmailInput = document.getElementById("recoverEmailInput");
    const recoverEmailRoleLabel = document.getElementById("recoverEmailRoleLabel");
    const recoverStep1Error = document.getElementById("recoverStep1Error");
    const recoverCheckForm = document.getElementById("recoverCheckForm");
    const chipDocente = document.getElementById("chipDocente");
    const chipEstudiante = document.getElementById("chipEstudiante");

    const verifiedAvatar = document.getElementById("verifiedAvatar");
    const verifiedName = document.getElementById("verifiedName");
    const verifiedRoleBadge = document.getElementById("verifiedRoleBadge");
    const verifiedEmail = document.getElementById("verifiedEmail");
    const verifiedGrade = document.getElementById("verifiedGrade");

    const tabObtenerClave = document.getElementById("tabObtenerClave");
    const tabCambiarClave = document.getElementById("tabCambiarClave");
    const subviewObtenerClave = document.getElementById("subviewObtenerClave");
    const subviewCambiarClave = document.getElementById("subviewCambiarClave");

    const displayCurrentPassword = document.getElementById("displayCurrentPassword");
    const btnToggleCurrentPwd = document.getElementById("btnToggleCurrentPwd");
    const btnCopyPwd = document.getElementById("btnCopyPwd");
    const btnDirectLogin = document.getElementById("btnDirectLogin");

    const formResetPassword = document.getElementById("formResetPassword");
    const newPasswordInput = document.getElementById("newPasswordInput");
    const confirmNewPasswordInput = document.getElementById("confirmNewPasswordInput");
    const btnToggleNewPwd = document.getElementById("btnToggleNewPwd");
    const resetPasswordError = document.getElementById("resetPasswordError");
    const btnBackToStep1 = document.getElementById("btnBackToStep1");

    const recoverLoadingOverlay = document.getElementById("recoverLoadingOverlay");
    const recoverLoadingText = document.getElementById("recoverLoadingText");

    let recoveryRole = "docente";
    let verifiedUserData = null;

    function setRecoveryRole(role) {
        recoveryRole = role;
        const isDoc = role === "docente";
        if (btnRecoverDocente) btnRecoverDocente.classList.toggle("active", isDoc);
        if (btnRecoverEstudiante) btnRecoverEstudiante.classList.toggle("active", !isDoc);
        if (recoverEmailRoleLabel) recoverEmailRoleLabel.textContent = isDoc ? "docente" : "estudiante";
        if (recoverStep1Error) recoverStep1Error.textContent = "";

        if (recoverEmailInput && !recoverEmailInput.value.trim()) {
            recoverEmailInput.placeholder = isDoc ? "ejemplo@institucion.edu.co" : "ejemplo@estudiante.edu.co";
        }
    }

    function openRecoverModal() {
        if (!recoverModalOverlay) return;
        setRecoveryRole(currentRole);

        // Pre-cargar correo del formulario principal si ya fue escrito
        if (emailInput && emailInput.value.trim() && recoverEmailInput) {
            recoverEmailInput.value = emailInput.value.trim();
        }

        if (recoverStep1Pane) recoverStep1Pane.classList.remove("hidden");
        if (recoverStep2Pane) recoverStep2Pane.classList.add("hidden");
        if (recoverLoadingOverlay) recoverLoadingOverlay.classList.remove("active");
        if (recoverStep1Error) recoverStep1Error.textContent = "";

        recoverModalOverlay.classList.add("active");
        recoverModalOverlay.setAttribute("aria-hidden", "false");
    }

    function closeRecoverModal() {
        if (!recoverModalOverlay) return;
        recoverModalOverlay.classList.remove("active");
        recoverModalOverlay.setAttribute("aria-hidden", "true");
        if (recoverLoadingOverlay) recoverLoadingOverlay.classList.remove("active");
    }

    if (forgotBtn) {
        forgotBtn.addEventListener("click", function (e) {
            e.preventDefault();
            openRecoverModal();
        });
    }

    if (recoverModalClose) {
        recoverModalClose.addEventListener("click", closeRecoverModal);
    }

    if (recoverModalOverlay) {
        recoverModalOverlay.addEventListener("click", function (e) {
            if (e.target === recoverModalOverlay) {
                closeRecoverModal();
            }
        });
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && recoverModalOverlay && recoverModalOverlay.classList.contains("active")) {
            closeRecoverModal();
        }
    });

    if (btnRecoverDocente) {
        btnRecoverDocente.addEventListener("click", function () {
            setRecoveryRole("docente");
        });
    }

    if (btnRecoverEstudiante) {
        btnRecoverEstudiante.addEventListener("click", function () {
            setRecoveryRole("estudiante");
        });
    }

    if (chipDocente) {
        chipDocente.addEventListener("click", function () {
            setRecoveryRole("docente");
            if (recoverEmailInput) recoverEmailInput.value = "docente@institucion.edu.co";
        });
    }

    if (chipEstudiante) {
        chipEstudiante.addEventListener("click", function () {
            setRecoveryRole("estudiante");
            if (recoverEmailInput) recoverEmailInput.value = "maria.perez@estudiante.edu.co";
        });
    }

    // Paso 1: Enviar formulario para buscar cuenta
    if (recoverCheckForm) {
        recoverCheckForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            if (recoverStep1Error) recoverStep1Error.textContent = "";

            const emailVal = (recoverEmailInput ? recoverEmailInput.value : "").trim();
            if (!emailVal) {
                if (recoverStep1Error) recoverStep1Error.textContent = "Por favor ingresa tu correo electrónico.";
                if (recoverEmailInput) recoverEmailInput.focus();
                return;
            }

            if (!/^\S+@\S+\.\S+$/.test(emailVal)) {
                if (recoverStep1Error) recoverStep1Error.textContent = "Ingresa un formato de correo válido.";
                if (recoverEmailInput) recoverEmailInput.focus();
                return;
            }

            if (recoverLoadingOverlay) {
                recoverLoadingOverlay.classList.add("active");
                if (recoverLoadingText) recoverLoadingText.textContent = `Buscando cuenta en base de datos para modo ${recoveryRole}...`;
            }

            try {
                const response = await fetch("/api/auth/recover-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: emailVal,
                        role: recoveryRole
                    })
                });

                const data = await response.json();
                if (recoverLoadingOverlay) recoverLoadingOverlay.classList.remove("active");

                if (data.success && data.user) {
                    verifiedUserData = data.user;

                    // Poblar ficha verificada
                    const userName = verifiedUserData.nombre || verifiedUserData.name || "Usuario";
                    const initial = userName.charAt(0).toUpperCase();
                    if (verifiedAvatar) verifiedAvatar.textContent = initial;
                    if (verifiedName) verifiedName.textContent = userName;
                    if (verifiedEmail) verifiedEmail.textContent = verifiedUserData.email;

                    const isStudent = (verifiedUserData.rol || recoveryRole) === "estudiante";
                    if (verifiedRoleBadge) {
                        verifiedRoleBadge.textContent = isStudent ? "🎓 Estudiante" : "👨‍🏫 Docente";
                        verifiedRoleBadge.style.background = isStudent ? "#dcfce7" : "#dbeafe";
                        verifiedRoleBadge.style.color = isStudent ? "#15803d" : "#1d4ed8";
                        verifiedRoleBadge.style.borderColor = isStudent ? "#bbf7d0" : "#bfdbfe";
                    }

                    if (verifiedGrade) {
                        if (isStudent && (verifiedUserData.grado || verifiedUserData.grade)) {
                            verifiedGrade.style.display = "block";
                            verifiedGrade.textContent = `Grado: ${verifiedUserData.grado || verifiedUserData.grade}`;
                        } else {
                            verifiedGrade.style.display = "none";
                        }
                    }

                    // Establecer contraseña actual
                    if (displayCurrentPassword) {
                        displayCurrentPassword.value = verifiedUserData.password || "123456";
                        displayCurrentPassword.type = "password";
                    }

                    // Reiniciar sub-vistas a la pestaña "Obtener Clave"
                    if (tabObtenerClave) tabObtenerClave.classList.add("active");
                    if (tabCambiarClave) tabCambiarClave.classList.remove("active");
                    if (subviewObtenerClave) subviewObtenerClave.classList.remove("hidden");
                    if (subviewCambiarClave) subviewCambiarClave.classList.add("hidden");

                    // Mostrar Paso 2
                    if (recoverStep1Pane) recoverStep1Pane.classList.add("hidden");
                    if (recoverStep2Pane) recoverStep2Pane.classList.remove("hidden");
                } else {
                    if (recoverStep1Error) {
                        recoverStep1Error.textContent = data.message || `No se encontró cuenta para ${emailVal} en modo ${recoveryRole}.`;
                    }
                }
            } catch (err) {
                if (recoverLoadingOverlay) recoverLoadingOverlay.classList.remove("active");
                console.error("Error al buscar cuenta:", err);
                if (recoverStep1Error) {
                    recoverStep1Error.textContent = "Error al conectar con el servidor. Intenta de nuevo.";
                }
            }
        });
    }

    // Pestañas del Paso 2
    if (tabObtenerClave && tabCambiarClave) {
        tabObtenerClave.addEventListener("click", function () {
            tabObtenerClave.classList.add("active");
            tabCambiarClave.classList.remove("active");
            if (subviewObtenerClave) subviewObtenerClave.classList.remove("hidden");
            if (subviewCambiarClave) subviewCambiarClave.classList.add("hidden");
        });

        tabCambiarClave.addEventListener("click", function () {
            tabCambiarClave.classList.add("active");
            tabObtenerClave.classList.remove("active");
            if (subviewCambiarClave) subviewCambiarClave.classList.remove("hidden");
            if (subviewObtenerClave) subviewObtenerClave.classList.add("hidden");
            if (newPasswordInput) newPasswordInput.focus();
        });
    }

    // Mostrar / ocultar clave actual
    if (btnToggleCurrentPwd && displayCurrentPassword) {
        btnToggleCurrentPwd.addEventListener("click", function () {
            const isHidden = displayCurrentPassword.type === "password";
            displayCurrentPassword.type = isHidden ? "text" : "password";
            btnToggleCurrentPwd.textContent = isHidden ? "🙈" : "👁️";
        });
    }

    // Copiar clave actual
    if (btnCopyPwd && displayCurrentPassword) {
        btnCopyPwd.addEventListener("click", function () {
            const pwdVal = displayCurrentPassword.value;
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(pwdVal).then(() => {
                    showToast("📋 Contraseña copiada al portapapeles.");
                    btnCopyPwd.textContent = "✓ ¡Copiada!";
                    setTimeout(() => { btnCopyPwd.textContent = "📋 Copiar"; }, 2000);
                }).catch(() => {
                    showToast(`Contraseña: ${pwdVal}`);
                });
            } else {
                showToast(`Contraseña: ${pwdVal}`);
            }
        });
    }

    // Iniciar sesión directamente con la cuenta verificada
    if (btnDirectLogin) {
        btnDirectLogin.addEventListener("click", function () {
            if (!verifiedUserData) return;

            const finalRole = (verifiedUserData.rol || recoveryRole).toLowerCase();
            const userName = verifiedUserData.nombre || verifiedUserData.name || "Usuario";
            const userGrade = verifiedUserData.grado || verifiedUserData.grade || null;

            const session = {
                id: verifiedUserData.id,
                role: finalRole,
                rol: finalRole,
                email: verifiedUserData.email,
                name: userName,
                nombre: userName,
                grado: userGrade,
                grade: userGrade,
                loginAt: Date.now()
            };

            localStorage.setItem("organizadorNotasSesion", JSON.stringify(session));
            closeRecoverModal();
            showToast(`¡Bienvenido/a, ${userName}! Accediendo al sistema...`);

            const targetPage = finalRole === "docente" ? "menudocentes.html" : "menuestudiantes.html";
            setTimeout(() => {
                window.location.href = targetPage;
            }, 600);
        });
    }

    // Mostrar / ocultar nueva clave
    if (btnToggleNewPwd && newPasswordInput) {
        btnToggleNewPwd.addEventListener("click", function () {
            const isHidden = newPasswordInput.type === "password";
            newPasswordInput.type = isHidden ? "text" : "password";
            btnToggleNewPwd.textContent = isHidden ? "🙈" : "👁️";
        });
    }

    // Formulario de restablecimiento de contraseña
    if (formResetPassword) {
        formResetPassword.addEventListener("submit", async function (e) {
            e.preventDefault();
            if (resetPasswordError) resetPasswordError.textContent = "";

            const newPwd = (newPasswordInput ? newPasswordInput.value : "").trim();
            const confirmPwd = (confirmNewPasswordInput ? confirmNewPasswordInput.value : "").trim();

            if (!newPwd) {
                if (resetPasswordError) resetPasswordError.textContent = "Ingresa tu nueva contraseña.";
                if (newPasswordInput) newPasswordInput.focus();
                return;
            }

            if (newPwd.length < 4) {
                if (resetPasswordError) resetPasswordError.textContent = "La contraseña debe tener mínimo 4 caracteres.";
                if (newPasswordInput) newPasswordInput.focus();
                return;
            }

            if (newPwd !== confirmPwd) {
                if (resetPasswordError) resetPasswordError.textContent = "Las contraseñas no coinciden. Verifica nuevamente.";
                if (confirmNewPasswordInput) confirmNewPasswordInput.focus();
                return;
            }

            if (recoverLoadingOverlay) {
                recoverLoadingOverlay.classList.add("active");
                if (recoverLoadingText) recoverLoadingText.textContent = "Guardando nueva contraseña en base de datos...";
            }

            try {
                const response = await fetch("/api/auth/reset-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: verifiedUserData.email,
                        role: recoveryRole,
                        newPassword: newPwd
                    })
                });

                const data = await response.json();
                if (recoverLoadingOverlay) recoverLoadingOverlay.classList.remove("active");

                if (data.success) {
                    showToast("✅ Contraseña actualizada con éxito en la base de datos.");

                    // Actualizar campo de contraseña en el formulario principal
                    if (passwordInput) passwordInput.value = newPwd;
                    if (emailInput) emailInput.value = verifiedUserData.email;

                    // Iniciar sesión automáticamente
                    const finalRole = (verifiedUserData.rol || recoveryRole).toLowerCase();
                    const userName = verifiedUserData.nombre || verifiedUserData.name || "Usuario";
                    const userGrade = verifiedUserData.grado || verifiedUserData.grade || null;

                    const session = {
                        id: verifiedUserData.id,
                        role: finalRole,
                        rol: finalRole,
                        email: verifiedUserData.email,
                        name: userName,
                        nombre: userName,
                        grado: userGrade,
                        grade: userGrade,
                        loginAt: Date.now()
                    };

                    localStorage.setItem("organizadorNotasSesion", JSON.stringify(session));
                    closeRecoverModal();

                    showToast(`¡Contraseña restablecida! Iniciando sesión como ${userName}...`);

                    const targetPage = finalRole === "docente" ? "menudocentes.html" : "menuestudiantes.html";
                    setTimeout(() => {
                        window.location.href = targetPage;
                    }, 650);
                } else {
                    if (resetPasswordError) resetPasswordError.textContent = data.message || "Error al actualizar la contraseña.";
                }
            } catch (err) {
                if (recoverLoadingOverlay) recoverLoadingOverlay.classList.remove("active");
                console.error("Error al restablecer contraseña:", err);
                if (resetPasswordError) resetPasswordError.textContent = "Error al conectar con el servidor.";
            }
        });
    }

    // Volver al paso 1
    if (btnBackToStep1) {
        btnBackToStep1.addEventListener("click", function () {
            if (recoverStep2Pane) recoverStep2Pane.classList.add("hidden");
            if (recoverStep1Pane) recoverStep1Pane.classList.remove("hidden");
            if (recoverEmailInput) recoverEmailInput.focus();
        });
    }

    // ---------- Modal de Creación de Cuenta (Registro Docente / Estudiante) ----------
    const registerModalOverlay = document.getElementById("registerModalOverlay");
    const registerModalClose = document.getElementById("registerModalClose");
    const registerHeaderIcon = document.getElementById("registerHeaderIcon");
    const registerModalTitle = document.getElementById("registerModalTitle");
    const registerModalSubtitle = document.getElementById("registerModalSubtitle");
    const btnRegDocente = document.getElementById("btnRegDocente");
    const btnRegEstudiante = document.getElementById("btnRegEstudiante");
    const fieldsDocente = document.getElementById("fieldsDocente");
    const fieldsEstudiante = document.getElementById("fieldsEstudiante");
    const regNombre = document.getElementById("regNombre");
    const regEmail = document.getElementById("regEmail");
    const regEmailHint = document.getElementById("regEmailHint");
    const regAsignatura = document.getElementById("regAsignatura");
    const regTelefonoDocente = document.getElementById("regTelefonoDocente");
    const regGrado = document.getElementById("regGrado");
    const regTelefonoEstudiante = document.getElementById("regTelefonoEstudiante");
    const regPassword = document.getElementById("regPassword");
    const regConfirmPassword = document.getElementById("regConfirmPassword");
    const btnToggleRegPwd = document.getElementById("btnToggleRegPwd");
    const btnSubmitRegister = document.getElementById("btnSubmitRegister");
    const btnRegToLogin = document.getElementById("btnRegToLogin");
    const registerForm = document.getElementById("registerForm");
    const regNombreError = document.getElementById("regNombreError");
    const regEmailError = document.getElementById("regEmailError");
    const regPasswordError = document.getElementById("regPasswordError");
    const regConfirmPasswordError = document.getElementById("regConfirmPasswordError");
    const regGeneralError = document.getElementById("regGeneralError");
    const registerLoadingOverlay = document.getElementById("registerLoadingOverlay");
    const registerLoadingText = document.getElementById("registerLoadingText");

    let currentRegRole = "docente";

    function setRegistrationRole(role) {
        currentRegRole = role;
        const isDoc = role === "docente";

        if (btnRegDocente) btnRegDocente.classList.toggle("active", isDoc);
        if (btnRegEstudiante) btnRegEstudiante.classList.toggle("active", !isDoc);

        if (fieldsDocente) fieldsDocente.classList.toggle("hidden", !isDoc);
        if (fieldsEstudiante) fieldsEstudiante.classList.toggle("hidden", isDoc);

        if (registerHeaderIcon) {
            registerHeaderIcon.classList.toggle("estudiante-mode", !isDoc);
            registerHeaderIcon.innerHTML = isDoc ? "<span>👨‍🏫</span>" : "<span>🎓</span>";
        }

        if (registerModalTitle) {
            registerModalTitle.textContent = isDoc ? "Crear Cuenta de Docente" : "Crear Cuenta de Estudiante";
        }

        if (registerModalSubtitle) {
            registerModalSubtitle.textContent = isDoc
                ? "Registra tus datos profesionales para gestionar calificaciones, cursos y actividades."
                : "Registra tus datos estudiantiles para consultar tus áreas, notas y reportes académicos.";
        }

        if (regEmail) {
            regEmail.placeholder = isDoc ? "profesor@institucion.edu.co" : "estudiante@institucion.edu.co";
        }
        if (regEmailHint) {
            regEmailHint.textContent = isDoc ? "(institucional o personal)" : "(estudiantil o personal)";
        }

        if (btnSubmitRegister) {
            btnSubmitRegister.textContent = isDoc ? "🚀 Registrar cuenta como Docente" : "🚀 Registrar cuenta como Estudiante";
            btnSubmitRegister.classList.toggle("student-theme", !isDoc);
        }

        clearRegErrors();
    }

    function clearRegErrors() {
        if (regNombreError) regNombreError.textContent = "";
        if (regEmailError) regEmailError.textContent = "";
        if (regPasswordError) regPasswordError.textContent = "";
        if (regConfirmPasswordError) regConfirmPasswordError.textContent = "";
        if (regGeneralError) {
            regGeneralError.textContent = "";
            regGeneralError.classList.remove("active");
        }
    }

    function openRegisterModal() {
        if (!registerModalOverlay) return;
        setRegistrationRole(currentRole);
        clearRegErrors();

        if (registerLoadingOverlay) registerLoadingOverlay.classList.remove("active");
        registerModalOverlay.classList.add("active");
        registerModalOverlay.setAttribute("aria-hidden", "false");
        if (regNombre) regNombre.focus();
    }

    function closeRegisterModal() {
        if (!registerModalOverlay) return;
        registerModalOverlay.classList.remove("active");
        registerModalOverlay.setAttribute("aria-hidden", "true");
        if (registerLoadingOverlay) registerLoadingOverlay.classList.remove("active");
    }

    if (createAccountBtn) {
        createAccountBtn.addEventListener("click", function (e) {
            e.preventDefault();
            openRegisterModal();
        });
    }

    if (registerModalClose) {
        registerModalClose.addEventListener("click", closeRegisterModal);
    }

    if (registerModalOverlay) {
        registerModalOverlay.addEventListener("click", function (e) {
            if (e.target === registerModalOverlay) {
                closeRegisterModal();
            }
        });
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && registerModalOverlay && registerModalOverlay.classList.contains("active")) {
            closeRegisterModal();
        }
    });

    if (btnRegDocente) {
        btnRegDocente.addEventListener("click", function () {
            setRegistrationRole("docente");
        });
    }

    if (btnRegEstudiante) {
        btnRegEstudiante.addEventListener("click", function () {
            setRegistrationRole("estudiante");
        });
    }

    if (btnRegToLogin) {
        btnRegToLogin.addEventListener("click", function () {
            closeRegisterModal();
            setRoleMode(currentRegRole);
            showView("login");
        });
    }

    if (btnToggleRegPwd && regPassword) {
        btnToggleRegPwd.addEventListener("click", function () {
            const isHidden = regPassword.type === "password";
            regPassword.type = isHidden ? "text" : "password";
            btnToggleRegPwd.textContent = isHidden ? "🙈" : "👁️";
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            clearRegErrors();

            const nombreVal = (regNombre ? regNombre.value : "").trim();
            const emailVal = (regEmail ? regEmail.value : "").trim();
            const passwordVal = (regPassword ? regPassword.value : "").trim();
            const confirmVal = (regConfirmPassword ? regConfirmPassword.value : "").trim();
            const isDoc = currentRegRole === "docente";

            let isValid = true;

            if (!nombreVal || nombreVal.length < 3) {
                if (regNombreError) regNombreError.textContent = "Ingresa tu nombre completo (mínimo 3 letras).";
                if (isValid && regNombre) regNombre.focus();
                isValid = false;
            }

            if (!emailVal) {
                if (regEmailError) regEmailError.textContent = "El correo electrónico es requerido.";
                if (isValid && regEmail) regEmail.focus();
                isValid = false;
            } else if (!/^\S+@\S+\.\S+$/.test(emailVal)) {
                if (regEmailError) regEmailError.textContent = "Ingresa una dirección de correo válida.";
                if (isValid && regEmail) regEmail.focus();
                isValid = false;
            }

            if (!passwordVal) {
                if (regPasswordError) regPasswordError.textContent = "La contraseña es requerida.";
                if (isValid && regPassword) regPassword.focus();
                isValid = false;
            } else if (passwordVal.length < 4) {
                if (regPasswordError) regPasswordError.textContent = "La contraseña debe tener al menos 4 caracteres.";
                if (isValid && regPassword) regPassword.focus();
                isValid = false;
            }

            if (passwordVal !== confirmVal) {
                if (regConfirmPasswordError) regConfirmPasswordError.textContent = "Las contraseñas no coinciden.";
                if (isValid && regConfirmPassword) regConfirmPassword.focus();
                isValid = false;
            }

            if (!isValid) return;

            const payload = {
                nombre: nombreVal,
                email: emailVal,
                password: passwordVal,
                rol: currentRegRole,
                grado: isDoc ? null : (regGrado ? regGrado.value : "10°A"),
                telefono: isDoc ? (regTelefonoDocente ? regTelefonoDocente.value : "") : (regTelefonoEstudiante ? regTelefonoEstudiante.value : ""),
                asignatura: isDoc ? (regAsignatura ? regAsignatura.value : "Matemáticas") : null
            };

            if (registerLoadingOverlay) {
                registerLoadingOverlay.classList.add("active");
                if (registerLoadingText) {
                    registerLoadingText.textContent = `Registrando cuenta como ${isDoc ? "Docente" : "Estudiante"}...`;
                }
            }

            try {
                const response = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();
                if (registerLoadingOverlay) registerLoadingOverlay.classList.remove("active");

                if (data.success && data.user) {
                    const newUser = data.user;
                    const finalRole = (newUser.rol || currentRegRole).toLowerCase();
                    const userName = newUser.nombre || nombreVal;
                    const userGrade = newUser.grado || payload.grado;

                    const session = {
                        id: newUser.id,
                        role: finalRole,
                        rol: finalRole,
                        email: newUser.email || emailVal,
                        name: userName,
                        nombre: userName,
                        grado: userGrade,
                        grade: userGrade,
                        loginAt: Date.now()
                    };

                    localStorage.setItem("organizadorNotasSesion", JSON.stringify(session));
                    localStorage.setItem("organizadorNotasEmail", emailVal);

                    closeRegisterModal();
                    showToast(`🎉 ¡Cuenta creada con éxito! Bienvenido/a, ${userName}`);

                    const targetPage = finalRole === "docente" ? "menudocentes.html" : "menuestudiantes.html";
                    setTimeout(() => {
                        window.location.href = targetPage;
                    }, 650);
                } else {
                    if (regGeneralError) {
                        regGeneralError.textContent = data.message || "Error al registrar la cuenta.";
                        regGeneralError.classList.add("active");
                    }
                }
            } catch (err) {
                if (registerLoadingOverlay) registerLoadingOverlay.classList.remove("active");
                console.error("Error al registrar:", err);
                if (regGeneralError) {
                    regGeneralError.textContent = "Error al conectar con el servidor para registrar la cuenta.";
                    regGeneralError.classList.add("active");
                }
            }
        });
    }

    // ---------- Modal de Inicio de Sesión con Google ----------
    const googleModalOverlay = document.getElementById("googleModalOverlay");
    const googleModalClose = document.getElementById("googleModalClose");
    const googleAccountsView = document.getElementById("googleAccountsView");
    const googleCustomView = document.getElementById("googleCustomView");
    const googleUseAnotherBtn = document.getElementById("googleUseAnotherBtn");
    const googleBackToAccounts = document.getElementById("googleBackToAccounts");
    const googleCustomForm = document.getElementById("googleCustomForm");
    const googleCustomEmail = document.getElementById("googleCustomEmail");
    const googleCustomName = document.getElementById("googleCustomName");
    const googleEmailError = document.getElementById("googleEmailError");
    const googleLoadingOverlay = document.getElementById("googleLoadingOverlay");
    const googleLoadingText = document.getElementById("googleLoadingText");
    const googleGradeWrap = document.getElementById("googleGradeWrap");
    const googleRoleDocente = document.getElementById("googleRoleDocente");
    const googleRoleEstudiante = document.getElementById("googleRoleEstudiante");
    const googleCustomGrade = document.getElementById("googleCustomGrade");

    function openGoogleModal() {
        if (!googleModalOverlay) return;
        googleAccountsView.classList.remove("hidden");
        googleCustomView.classList.add("hidden");
        googleLoadingOverlay.classList.remove("active");
        if (googleEmailError) googleEmailError.textContent = "";

        // Sincronizar radio del rol en el formulario personalizado con el rol actual
        if (currentRole === "docente") {
            if (googleRoleDocente) googleRoleDocente.checked = true;
            if (googleGradeWrap) googleGradeWrap.style.display = "none";
        } else {
            if (googleRoleEstudiante) googleRoleEstudiante.checked = true;
            if (googleGradeWrap) googleGradeWrap.style.display = "block";
        }

        googleModalOverlay.classList.add("active");
        googleModalOverlay.setAttribute("aria-hidden", "false");
    }

    function closeGoogleModal() {
        if (!googleModalOverlay) return;
        googleModalOverlay.classList.remove("active");
        googleModalOverlay.setAttribute("aria-hidden", "true");
        googleLoadingOverlay.classList.remove("active");
    }

    if (googleBtn) {
        googleBtn.addEventListener("click", function () {
            openGoogleModal();
        });
    }

    if (googleModalClose) {
        googleModalClose.addEventListener("click", closeGoogleModal);
    }

    if (googleModalOverlay) {
        googleModalOverlay.addEventListener("click", function (e) {
            if (e.target === googleModalOverlay) {
                closeGoogleModal();
            }
        });
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && googleModalOverlay && googleModalOverlay.classList.contains("active")) {
            closeGoogleModal();
        }
    });

    if (googleUseAnotherBtn) {
        googleUseAnotherBtn.addEventListener("click", function () {
            googleAccountsView.classList.add("hidden");
            googleCustomView.classList.remove("hidden");
            if (googleCustomEmail) googleCustomEmail.focus();
        });
    }

    if (googleBackToAccounts) {
        googleBackToAccounts.addEventListener("click", function () {
            googleCustomView.classList.add("hidden");
            googleAccountsView.classList.remove("hidden");
        });
    }

    // Alternar selector de grado según rol seleccionado en formulario Google
    if (googleRoleDocente && googleRoleEstudiante && googleGradeWrap) {
        googleRoleDocente.addEventListener("change", function () {
            if (this.checked) googleGradeWrap.style.display = "none";
        });
        googleRoleEstudiante.addEventListener("change", function () {
            if (this.checked) googleGradeWrap.style.display = "block";
        });
    }

    // Ejecutar login con Google
    async function executeGoogleLogin({ email, name, role, grade }) {
        if (!email) return;

        let effectiveRole = role;
        if (!effectiveRole || effectiveRole === "auto") {
            effectiveRole = email.includes("docente") ? "docente" : currentRole;
        }

        const effectiveGrade = effectiveRole === "estudiante" ? (grade || "10°A") : null;
        const effectiveName = name || deriveName(email);

        if (googleLoadingOverlay) {
            googleLoadingOverlay.classList.add("active");
            if (googleLoadingText) {
                googleLoadingText.textContent = `Accediendo con ${email}...`;
            }
        }

        showToast(`Conectando con cuenta de Google: ${email}`);

        try {
            const response = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    name: effectiveName,
                    role: effectiveRole,
                    grade: effectiveGrade
                })
            });

            const data = await response.json();

            if (data.success && data.user) {
                const userObj = data.user;
                const finalRole = (userObj.role || userObj.rol || effectiveRole).toLowerCase();
                const finalName = userObj.name || userObj.nombre || effectiveName;
                const finalGrade = userObj.grade || userObj.grado || effectiveGrade;

                const session = {
                    id: userObj.id,
                    role: finalRole,
                    rol: finalRole,
                    email: userObj.email || email,
                    name: finalName,
                    nombre: finalName,
                    grado: finalGrade,
                    grade: finalGrade,
                    provider: "google",
                    avatar: userObj.avatar || null,
                    loginAt: Date.now()
                };

                localStorage.setItem("organizadorNotasSesion", JSON.stringify(session));
                showToast(`¡Bienvenido/a con Google, ${finalName}!`);

                const targetPage = finalRole === "docente" ? "menudocentes.html" : "menuestudiantes.html";
                setTimeout(() => {
                    window.location.href = targetPage;
                }, 600);
                return;
            } else {
                throw new Error(data.message || "Error al autenticar con Google");
            }
        } catch (err) {
            console.warn("Fallo en API Google, creando sesión local resiliente:", err);
            // Modo resiliente en cliente
            const finalRole = effectiveRole.toLowerCase();
            const session = {
                role: finalRole,
                rol: finalRole,
                email: email,
                name: effectiveName,
                nombre: effectiveName,
                grado: effectiveGrade,
                grade: effectiveGrade,
                provider: "google",
                loginAt: Date.now()
            };
            localStorage.setItem("organizadorNotasSesion", JSON.stringify(session));
            showToast(`Acceso exitoso con Google como ${effectiveName}`);

            const targetPage = finalRole === "docente" ? "menudocentes.html" : "menuestudiantes.html";
            setTimeout(() => {
                window.location.href = targetPage;
            }, 600);
        }
    }

    // Clic en cuenta sugerida de la lista
    document.querySelectorAll(".google-account-item").forEach(item => {
        item.addEventListener("click", function () {
            const email = this.dataset.email;
            const name = this.dataset.name;
            const role = this.dataset.role;
            const grade = this.dataset.grade;
            executeGoogleLogin({ email, name, role, grade });
        });
    });

    // Envío del formulario de cuenta personalizada de Google
    if (googleCustomForm) {
        googleCustomForm.addEventListener("submit", function (e) {
            e.preventDefault();
            if (googleEmailError) googleEmailError.textContent = "";

            const emailVal = (googleCustomEmail ? googleCustomEmail.value : "").trim();
            const nameVal = (googleCustomName ? googleCustomName.value : "").trim();
            const selectedRole = googleRoleDocente && googleRoleDocente.checked ? "docente" : "estudiante";
            const selectedGrade = googleCustomGrade ? googleCustomGrade.value : "10°A";

            if (!emailVal) {
                if (googleEmailError) googleEmailError.textContent = "Ingresa tu correo de Google.";
                if (googleCustomEmail) googleCustomEmail.focus();
                return;
            }

            if (!/^\S+@\S+\.\S+$/.test(emailVal)) {
                if (googleEmailError) googleEmailError.textContent = "Ingresa un correo electrónico válido.";
                if (googleCustomEmail) googleCustomEmail.focus();
                return;
            }

            executeGoogleLogin({
                email: emailVal,
                name: nameVal || deriveName(emailVal),
                role: selectedRole,
                grade: selectedGrade
            });
        });
    }

    // Comprobar estado de conexión con Supabase
    const dbNote = document.getElementById("dbNote");
    fetch("/api/supabase/status")
        .then(res => res.json())
        .then(data => {
            if (dbNote && data.configured && data.connected) {
                dbNote.innerHTML = `🟢 <strong>Supabase Conectado</strong> (${data.backend}). Acceso: <strong>docente@institucion.edu.co</strong> o <strong>maria.perez@estudiante.edu.co</strong> (clave: <strong>123456</strong>)`;
            } else if (dbNote && data.configured && !data.connected) {
                dbNote.innerHTML = `🟡 <strong>Supabase detectado en .env</strong>. Recuerda ejecutar <code>supabase_schema.sql</code> en el SQL Editor de Supabase.`;
            }
        })
        .catch(() => {});

    // ---------- Envío del formulario de login (con Supabase API) ----------
    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            if (!validateForm()) return;

            const emailVal = emailInput.value.trim();
            const passwordVal = passwordInput.value;
            const submitBtn = document.getElementById("submitLogin");

            if (rememberCheckbox && rememberCheckbox.checked) {
                localStorage.setItem("organizadorNotasEmail", emailVal);
            } else {
                localStorage.removeItem("organizadorNotasEmail");
            }

            if (submitBtn) submitBtn.disabled = true;
            showToast("Verificando credenciales en base de datos...");

            try {
                const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: emailVal,
                        password: passwordVal,
                        role: currentRole
                    })
                });

                const data = await response.json();

                if (data.success && data.user) {
                    const userRole = (data.user.role || data.user.rol || currentRole || "").toLowerCase();
                    const userName = data.user.name || data.user.nombre || deriveName(emailVal);
                    const userGrade = data.user.grade || data.user.grado || null;

                    const session = {
                        id: data.user.id,
                        role: userRole,
                        rol: userRole,
                        email: data.user.email,
                        name: userName,
                        nombre: userName,
                        grado: userGrade,
                        grade: userGrade,
                        loginAt: Date.now()
                    };
                    localStorage.setItem("organizadorNotasSesion", JSON.stringify(session));
                    showToast(`¡Bienvenido/a, ${userName}!`);

                    const isDocente = userRole === "docente";
                    const targetPage = isDocente ? "menudocentes.html" : "menuestudiantes.html";

                    setTimeout(() => {
                        window.location.href = targetPage;
                    }, 600);
                    return;
                } else {
                    showToast("⚠️ " + (data.message || "Credenciales incorrectas"));
                    if (submitBtn) submitBtn.disabled = false;
                }
            } catch (err) {
                // Modo resiliente si el servidor no responde
                console.warn("Fallo de conexión con la API, usando sesión local:", err);
                const userRole = currentRole.toLowerCase();
                const userName = deriveName(emailVal);
                const session = {
                    role: userRole,
                    rol: userRole,
                    email: emailVal,
                    name: userName,
                    nombre: userName,
                    loginAt: Date.now()
                };
                localStorage.setItem("organizadorNotasSesion", JSON.stringify(session));
                showToast(`Iniciando sesión como ${userRole.toUpperCase()}...`);

                const targetPage = userRole === "docente" ? "menudocentes.html" : "menuestudiantes.html";
                setTimeout(() => {
                    window.location.href = targetPage;
                }, 600);
            }
        });
    }

    // Estado inicial del login (por si se entra directo a la vista)
    setRoleMode(currentRole);
});
