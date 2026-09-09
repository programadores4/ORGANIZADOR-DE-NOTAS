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
    if (forgotBtn) {
        forgotBtn.addEventListener("click", function () {
            showToast("Comunícate con la coordinación académica para restablecer tu contraseña.");
        });
    }

    if (createAccountBtn) {
        createAccountBtn.addEventListener("click", function () {
            showToast("Solicita la creación de tu cuenta en secretaría académica.");
        });
    }

    if (googleBtn) {
        googleBtn.addEventListener("click", function () {
            showToast("El acceso con Google no está disponible en modo demostración.");
        });
    }

    // ---------- Envío del formulario de login ----------
    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();

            if (!validateForm()) return;

            if (rememberCheckbox && rememberCheckbox.checked) {
                localStorage.setItem("organizadorNotasEmail", emailInput.value.trim());
            } else {
                localStorage.removeItem("organizadorNotasEmail");
            }

            // Guarda la sesión para personalizar el panel correspondiente
            const session = {
                role: currentRole,
                email: emailInput.value.trim(),
                name: deriveName(emailInput.value.trim()),
                loginAt: Date.now()
            };
            localStorage.setItem("organizadorNotasSesion", JSON.stringify(session));

            const submitBtn = document.getElementById("submitLogin");
            if (submitBtn) submitBtn.disabled = true;

            showToast(`Iniciando sesión como ${currentRole === "docente" ? "DOCENTE" : "ESTUDIANTE"}...`);

            setTimeout(() => {
                window.location.href = currentRole === "docente" ? "menudocentes.html" : "menuestudiantes.html";
            }, 1100);
        });
    }

    // Estado inicial del login (por si se entra directo a la vista)
    setRoleMode(currentRole);
});
