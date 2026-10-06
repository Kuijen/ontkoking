(() => {
  Nav.render('recepten.html');

  const MAX_SLIDER = 120;
  const SORTERS = {
    rating: (a, b) => b.rating - a.rating,
    time: (a, b) => a.minutes - b.minutes,
    newest: (a, b) => b.id - a.id
  };

  const form = UI.$('#filterForm');
  const filtersPanel = UI.$('#filters');
  const searchInput = UI.$('#searchInput');
  const slider = UI.$('#maxMinutes');
  const sliderOutput = UI.$('#maxMinutesOutput');
  const grid = UI.$('#recipeGrid');
  const resultCount = UI.$('#resultCount');
  const activeFilters = UI.$('#activeFilters');

  const params = new URLSearchParams(window.location.search);
  let activeTag = (params.get('tag') || '').replace(/^#/, '');
  searchInput.value = params.get('q') || '';

  // Op brede schermen staan de filters open, op mobiel ingeklapt.
  filtersPanel.open = window.matchMedia('(min-width: 901px)').matches;

  const readFilters = () => {
    const data = new FormData(form);
    return {
      query: String(data.get('q') || '').trim().toLowerCase(),
      categories: data.getAll('category'),
      diets: data.getAll('diet'),
      maxMinutes: Number(data.get('maxMinutes')),
      sort: String(data.get('sort') || '')
    };
  };

  const matchesFilters = (recipe, filters) => {
    const { query, categories, diets, maxMinutes } = filters;
    const haystack = [recipe.title, ...recipe.ingredients.map((i) => i.name)].join(' ').toLowerCase();

    return (!query || haystack.includes(query))
      && (!categories.length || categories.includes(recipe.category))
      && (maxMinutes >= MAX_SLIDER || recipe.minutes <= maxMinutes)
      && diets.every((diet) => recipe.diet.includes(diet))
      && (!activeTag || recipe.tags.some((tag) => tag.toLowerCase() === activeTag.toLowerCase()));
  };

  const renderActiveTag = () => {
    activeFilters.innerHTML = activeTag
      ? `<button class="chip chip-active" type="button" data-action="clear-tag" aria-label="Filter #${UI.escapeHtml(activeTag)} verwijderen">#${UI.escapeHtml(activeTag)} ✕</button>`
      : '';
  };

  const render = () => {
    const filters = readFilters();
    sliderOutput.textContent = filters.maxMinutes >= MAX_SLIDER ? 'Alle tijden' : `Maximaal ${filters.maxMinutes} min`;

    const sorter = SORTERS[filters.sort];
    const results = RecipeStore.getPublished().filter((recipe) => matchesFilters(recipe, filters));
    if (sorter) results.sort(sorter);

    resultCount.textContent = `${results.length} ${results.length === 1 ? 'recept' : 'recepten'} gevonden`;
    renderActiveTag();

    grid.innerHTML = results.length
      ? results.map(UI.recipeCard).join('')
      : UI.emptyState({
          icon: '🔎',
          title: 'Geen recepten gevonden',
          text: 'Er is niets dat past bij deze filters. Pas je zoekopdracht aan of begin opnieuw.',
          action: '<button class="btn btn-outline" type="button" data-action="reset">Filters wissen</button>'
        });
  };

  const resetFilters = () => {
    activeTag = '';
    form.reset();
    render();
  };

  form.addEventListener('input', render);
  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('reset', () => {
    activeTag = '';
    // reset zet de velden pas na dit event terug, dus render in de volgende tick.
    setTimeout(render);
  });

  document.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'clear-tag') { activeTag = ''; render(); }
    if (action === 'reset') resetFilters();
  });

  render();
})();
