document.addEventListener("DOMContentLoaded", function () {
    // ---------- Sesión ----------
    const session = JSON.parse(localStorage.getItem("organizadorNotasSesion") || "null");
    const displayName = session && session.name ? session.name : "Estudiante";
    const displayEmail = session && session.email ? session.email : "estudiante@institucion.edu.co";
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

        document.querySelector(".dashboard-content").scrollTo({ top: 0, behavior: "smooth" });
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
        userMenu.classList.remove("open");
        userPanel.classList.remove("open");
        notifMenu.classList.remove("open");
        notifPanel.classList.remove("open");
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
});
