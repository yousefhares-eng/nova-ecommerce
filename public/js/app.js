/**
 * Shared app init – cart count, auth UI, admin redirect
 * Load after api.js, auth.js, cart.js
 */

(function () {
  function updateCartCount() {
    const el = document.getElementById('cart-count');
    if (el) {
      const n = typeof cartCount === 'function' ? cartCount() : 0;
      el.textContent = n;
      el.style.display = n > 0 ? 'flex' : 'none';
    }
  }

  function updateAuthUI() {
    const user = typeof getUser === 'function' ? getUser() : null;
    const loginLink = document.getElementById('nav-login');
    const registerLink = document.getElementById('nav-register');
    const logoutBtn = document.getElementById('nav-logout');
    const adminLink = document.getElementById('nav-admin');

    if (loginLink) loginLink.style.display = user ? 'none' : 'inline';
    if (registerLink) registerLink.style.display = user ? 'none' : 'inline';
    if (logoutBtn) {
      logoutBtn.style.display = user ? 'inline' : 'none';
      if (user) {
        const label = logoutBtn.querySelector('.logout-label');
        if (label) label.textContent = user.name || 'Logout';
      }
    }
    if (adminLink) adminLink.style.display = user && user.role === 'admin' ? 'inline' : 'none';
  }

  function setupLogout() {
    const btn = document.getElementById('nav-logout');
    if (btn && typeof logout === 'function') {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        logout();
      });
    }
  }

  function adminRedirect() {
    const path = window.location.pathname;
    if (!path.startsWith('/admin')) return;
    const user = typeof getUser === 'function' ? getUser() : null;
    if (!user || user.role !== 'admin') {
      window.location.href = '/login?redirect=' + encodeURIComponent(path);
    }
  }

  function init() {
    updateCartCount();
    updateAuthUI();
    setupLogout();
    adminRedirect();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.novaUpdateCartCount = updateCartCount;
})();
