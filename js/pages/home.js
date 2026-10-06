(() => {
  Nav.render('index.html');

  const searchForm = UI.$('#searchForm');
  const searchInput = UI.$('#searchInput');
  const quickFilters = UI.$('#quickFilters');
  const featuredGrid = UI.$('#featuredGrid');

  const goToRecipes = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    window.location.href = `recepten.html${query ? `?${query}` : ''}`;
  };

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const q = searchInput.value.trim();
    goToRecipes(q ? { q } : {});
  });

  quickFilters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-tag]');
    if (button) goToRecipes({ tag: button.dataset.tag });
  });

  const renderFeatured = () => {
    const featured = RecipeStore.getPublished()
      .sort((a, b) => b.rating - a.rating || b.id - a.id)
      .slice(0, 4);

    featuredGrid.innerHTML = featured.length
      ? featured.map(UI.recipeCard).join('')
      : UI.emptyState({
          title: 'Nog geen recepten',
          text: 'Er is nog niets gepubliceerd. Voeg het eerste recept toe.',
          action: '<a class="btn btn-primary" href="nieuw-recept.html">Recept toevoegen</a>'
        });
  };

  renderFeatured();
})();
