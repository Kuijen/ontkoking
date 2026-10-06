(() => {
  Nav.render('admin.html');

  const session = Auth.getSession();
  const noAccess = UI.$('#noAccess');
  const adminContent = UI.$('#adminContent');

  if (!Auth.isAdmin(session)) {
    noAccess.hidden = false;
    return;
  }
  adminContent.hidden = false;

  const usersBody = UI.$('#usersBody');
  const contentBody = UI.$('#contentBody');
  const queueStats = UI.$('#queueStats');

  const renderUsers = () => {
    usersBody.innerHTML = Auth.getAccounts().map((account) => {
      const isMain = account.username === Auth.MAIN_ADMIN;
      const isSelf = account.username === session.username;
      const isAdmin = account.role === 'admin';

      let actions = '<span class="recipe-meta">Hoofdaccount</span>';
      if (!isMain) {
        actions = `
          <div class="cell-actions">
            <button class="btn btn-outline btn-sm" type="button" data-action="toggle-admin" ${isSelf ? 'disabled' : ''}>${isAdmin ? 'Verwijder admin' : 'Maak admin'}</button>
            <button class="btn btn-danger btn-sm" type="button" data-action="delete-user" ${isSelf ? 'disabled' : ''}>Verwijder</button>
          </div>`;
      }

      return `
        <tr data-username="${UI.escapeHtml(account.username)}">
          <td class="cell-title">${UI.escapeHtml(account.username)}</td>
          <td><span class="badge ${isAdmin ? 'badge-accent' : 'badge-muted'}">${account.role}</span></td>
          <td>${actions}</td>
        </tr>`;
    }).join('');
  };

  const renderContent = () => {
    const recipes = RecipeStore.getAll();
    if (!recipes.length) {
      contentBody.innerHTML = '<tr><td class="table-empty" colspan="4">Er zijn nog geen recepten.</td></tr>';
      return;
    }
    contentBody.innerHTML = recipes.map((recipe) => {
      const isPublished = recipe.status === RecipeStore.STATUS.published;
      return `
        <tr data-id="${recipe.id}">
          <td class="cell-title">${UI.escapeHtml(recipe.title)}</td>
          <td>${UI.escapeHtml(recipe.author)}</td>
          <td>${UI.statusBadge(recipe.status)}</td>
          <td>
            <div class="cell-actions">
              <button class="btn btn-outline btn-sm" type="button" data-action="toggle-status">${isPublished ? 'Zet op concept' : 'Publiceer'}</button>
              <a class="btn btn-outline btn-sm" href="recept-detail.html?id=${recipe.id}">Bekijk</a>
              <a class="btn btn-outline btn-sm" href="nieuw-recept.html?id=${recipe.id}">Bewerk</a>
              <button class="btn btn-danger btn-sm" type="button" data-action="delete-recipe">Verwijder</button>
            </div>
          </td>
        </tr>`;
    }).join('');
  };

  const renderQueue = () => {
    const recipes = RecipeStore.getAll();
    const drafts = recipes.filter((r) => r.status === RecipeStore.STATUS.draft).length;
    const stats = [
      { label: 'Te controleren recepten', value: drafts, highlight: drafts > 0 },
      { label: 'Gepubliceerde recepten', value: recipes.length - drafts },
      { label: 'Totaal aantal recepten', value: recipes.length },
      { label: 'Geregistreerde gebruikers', value: Auth.getAccounts().length }
    ];
    queueStats.innerHTML = stats.map((stat) => `
      <div class="stat ${stat.highlight ? 'stat-highlight' : ''}">
        <span class="stat-value">${stat.value}</span>
        <span class="stat-label">${stat.label}</span>
      </div>`).join('');
  };

  const renderAll = () => {
    renderUsers();
    renderContent();
    renderQueue();
  };

  /* ---------- Acties ---------- */

  const toggleAdmin = (username) => {
    const accounts = Auth.getAccounts().map((account) =>
      account.username === username ? { ...account, role: account.role === 'admin' ? 'user' : 'admin' } : account);
    Auth.saveAccounts(accounts);
    UI.toast('Rol bijgewerkt.');
  };

  const deleteUser = async (username) => {
    if (!(await UI.confirmDialog(`Gebruiker "${username}" verwijderen?`))) return;
    Auth.saveAccounts(Auth.getAccounts().filter((account) => account.username !== username));
    UI.toast('Gebruiker verwijderd.', 'info');
  };

  const toggleStatus = (id) => {
    const recipe = RecipeStore.getById(id);
    if (!recipe) return;
    const published = recipe.status === RecipeStore.STATUS.published;
    RecipeStore.save({ ...recipe, status: published ? RecipeStore.STATUS.draft : RecipeStore.STATUS.published });
    UI.toast(published ? 'Recept staat nu als concept.' : 'Recept gepubliceerd.');
  };

  const deleteRecipe = async (id) => {
    const recipe = RecipeStore.getById(id);
    if (!recipe || !(await UI.confirmDialog(`Recept "${recipe.title}" verwijderen?`))) return;
    RecipeStore.remove(id);
    UI.toast('Recept verwijderd.', 'info');
  };

  usersBody.addEventListener('click', async (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    const username = event.target.closest('[data-username]')?.dataset.username;
    if (!action || !username || username === Auth.MAIN_ADMIN || username === session.username) return;

    if (action === 'toggle-admin') toggleAdmin(username);
    if (action === 'delete-user') await deleteUser(username);
    renderAll();
  });

  contentBody.addEventListener('click', async (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    const id = Number(event.target.closest('[data-id]')?.dataset.id);
    if (!action || !id) return;

    try {
      if (action === 'toggle-status') toggleStatus(id);
      if (action === 'delete-recipe') await deleteRecipe(id);
    } catch {
      UI.toast('De wijziging kon niet worden opgeslagen.', 'error');
    }
    renderAll();
  });

  renderAll();
})();
