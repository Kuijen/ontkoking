/**
 * Nav: rendert header en footer en koppelt het menu aan event listeners.
 */
const Nav = (() => {
  const PAGES = [
    { href: 'index.html', label: 'Home' },
    { href: 'recepten.html', label: 'Recepten' },
    { href: 'nieuw-recept.html', label: 'Toevoegen' },
    { href: 'dashboard.html', label: 'Mijn keuken' },
    { href: 'admin.html', label: 'Admin', adminOnly: true }
  ];

  const linkMarkup = (page, activePage) => `
    <li><a href="${page.href}"${page.href === activePage ? ' aria-current="page"' : ''}>${page.label}</a></li>`;

  const userMarkup = (session) => {
    if (!session) return '<a class="btn btn-outline btn-sm" href="login.html">Inloggen</a>';
    const adminBadge = session.role === 'admin' ? ' <span class="badge badge-accent">admin</span>' : '';
    return `
      <span>${UI.escapeHtml(session.username)}${adminBadge}</span>
      <button class="btn btn-outline btn-sm" type="button" data-action="logout">Uitloggen</button>`;
  };

  const bindEvents = (header) => {
    const toggle = UI.$('.nav-toggle', header);
    const menu = UI.$('.site-nav', header);

    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Menu sluiten' : 'Menu openen');
    });

    header.addEventListener('click', (event) => {
      if (!event.target.closest('[data-action="logout"]')) return;
      Auth.logout();
      UI.flash('Je bent uitgelogd.', 'info');
      window.location.href = 'index.html';
    });
  };

  const render = (activePage) => {
    const session = Auth.getSession();
    const header = UI.$('#site-header');
    const footer = UI.$('#site-footer');

    const links = PAGES
      .filter((page) => !page.adminOnly || session?.role === 'admin')
      .map((page) => linkMarkup(page, activePage))
      .join('');

    header.innerHTML = `
      <div class="header-inner">
        <a class="brand" href="index.html">GLR <span>Food Freaks</span></a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="siteNav" aria-label="Menu openen">☰</button>
        <nav id="siteNav" class="site-nav" aria-label="Hoofdmenu">
          <ul class="nav-links">${links}</ul>
          <div class="nav-user">${userMarkup(session)}</div>
        </nav>
      </div>`;
    bindEvents(header);

    if (footer) {
      footer.innerHTML = `
        <div class="footer-inner">
          <span>GLR Food Freaks: stop de ontkoking.</span>
          <span>Schoolproject, gegevens blijven in je eigen browser.</span>
        </div>`;
    }

    UI.showFlash();
  };

  return { render };
})();
