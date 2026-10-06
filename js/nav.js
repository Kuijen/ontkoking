function renderNav(activePage) {
  const user = getSession();
  const pages = [
    { href: 'index.html',       label: 'Home' },
    { href: 'recepten.html',    label: 'Recepten' },
    { href: 'nieuw-recept.html',label: 'Toevoegen' },
    { href: 'dashboard.html',   label: 'Mijn Keuken' },
  ];
  if (user && user.role === 'admin') {
    pages.push({ href: 'admin.html', label: 'Admin' });
  }

  const links = pages.map(p => `
    <a href="${p.href}" class="${activePage === p.href ? 'active' : ''}">${p.label}</a>
  `).join('');

  const rightSide = user
    ? `<span class="nav-user">${user.username}${user.role === 'admin' ? '<span class="badge-admin">ADMIN</span>' : ''}</span>
       <button class="btn-nav" onclick="logout(); window.location.href='index.html'">Uitloggen</button>`
    : `<a href="login.html" class="btn-nav">Inloggen</a>`;

  document.getElementById('nav').innerHTML = `
    <div class="nav-inner">
      <a href="index.html" class="nav-logo">GLR <span>Food Freaks</span></a>
      <nav class="nav-links">${links}</nav>
      <div class="nav-right">${rightSide}</div>
    </div>
  `;
}
