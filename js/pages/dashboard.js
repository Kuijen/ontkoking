(() => {
  Nav.render('dashboard.html');

  const session = Auth.requireLogin();
  if (!session) return;

  const statsEl = UI.$('#stats');
  const favoritesGrid = UI.$('#favoritesGrid');
  const myRecipesEl = UI.$('#myRecipes');
  const communityEl = UI.$('#community');

  const renderStats = (mine) => {
    const drafts = mine.filter((r) => r.status === RecipeStore.STATUS.draft).length;
    const stats = [
      { label: 'Mijn recepten', value: mine.length },
      { label: 'Concepten', value: drafts },
      { label: 'Favorieten', value: Favorites.getIds().length }
    ];
    statsEl.innerHTML = stats.map((stat) => `
      <div class="stat"><span class="stat-value">${stat.value}</span><span class="stat-label">${stat.label}</span></div>`).join('');
  };

  const renderFavorites = (all) => {
    const favorites = Favorites.getIds()
      .map((id) => all.find((recipe) => recipe.id === id))
      .filter((recipe) => recipe && (recipe.status === RecipeStore.STATUS.published || Auth.canManage(recipe, session)));

    favoritesGrid.innerHTML = favorites.length
      ? favorites.map(UI.recipeCard).join('')
      : UI.emptyState({
          icon: '💛',
          title: 'Nog geen favorieten',
          text: 'Sla recepten op via de detailpagina, dan vind je ze hier terug.',
          action: '<a class="btn btn-primary" href="recepten.html">Recepten bekijken</a>'
        });
  };

  const renderMyRecipes = (mine) => {
    if (!mine.length) {
      myRecipesEl.innerHTML = UI.emptyState({
        icon: '📝',
        title: 'Nog geen eigen recepten',
        text: 'Deel je eerste recept met de community.',
        action: '<a class="btn btn-primary" href="nieuw-recept.html">Recept toevoegen</a>'
      });
      return;
    }

    myRecipesEl.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead><tr><th scope="col">Titel</th><th scope="col">Status</th><th scope="col">Acties</th></tr></thead>
          <tbody>
            ${mine.map((recipe) => `
              <tr data-id="${recipe.id}">
                <td class="cell-title">${UI.escapeHtml(recipe.title)}</td>
                <td>${UI.statusBadge(recipe.status)}</td>
                <td>
                  <div class="cell-actions">
                    <a class="btn btn-outline btn-sm" href="recept-detail.html?id=${recipe.id}">Bekijk</a>
                    <a class="btn btn-outline btn-sm" href="nieuw-recept.html?id=${recipe.id}">Bewerk</a>
                    <button class="btn btn-danger btn-sm" type="button" data-action="delete">Verwijder</button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  };

  const renderCommunity = (all) => {
    const latest = all
      .filter((recipe) => recipe.status === RecipeStore.STATUS.published && recipe.author !== session.username)
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);

    communityEl.innerHTML = latest.length
      ? `<ul class="list-plain">${latest.map((recipe) => `
          <li>
            <a href="recept-detail.html?id=${recipe.id}">${UI.escapeHtml(recipe.title)}</a>
            <span class="recipe-meta">door ${UI.escapeHtml(recipe.author)}</span>
          </li>`).join('')}</ul>`
      : '<p class="muted">Er zijn nog geen recepten van andere gebruikers.</p>';
  };

  const render = () => {
    const all = RecipeStore.getAll();
    const mine = all.filter((recipe) => recipe.author === session.username);
    renderStats(mine);
    renderFavorites(all);
    renderMyRecipes(mine);
    renderCommunity(all);
  };

  myRecipesEl.addEventListener('click', async (event) => {
    if (!event.target.closest('[data-action="delete"]')) return;
    const id = Number(event.target.closest('[data-id]').dataset.id);
    const recipe = RecipeStore.getById(id);
    if (!recipe || !Auth.canManage(recipe, session)) return;

    if (!(await UI.confirmDialog(`Weet je zeker dat je "${recipe.title}" wilt verwijderen?`))) return;
    RecipeStore.remove(id);
    UI.toast('Recept verwijderd.', 'info');
    render();
  });

  render();
})();
