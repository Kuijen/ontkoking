(() => {
  Nav.render('recepten.html');

  const root = UI.$('#detail');
  const pageTitle = UI.$('#pageTitle');
  const session = Auth.getSession();
  const recipe = RecipeStore.getById(new URLSearchParams(window.location.search).get('id'));

  const canView = recipe && (recipe.status === RecipeStore.STATUS.published || Auth.canManage(recipe, session));
  if (!canView) {
    pageTitle.textContent = 'Recept niet gevonden';
    root.innerHTML = UI.emptyState({
      title: 'Recept niet gevonden',
      text: 'Dit recept bestaat niet (meer) of is nog niet gepubliceerd.',
      action: '<a class="btn btn-primary" href="recepten.html">Naar alle recepten</a>'
    });
    return;
  }

  pageTitle.textContent = recipe.title;
  document.title = `${recipe.title} – Food Freaks`;

  let activeStep = 0;

  const ingredientMarkup = (ingredient, index) => `
    <li>
      <label class="check">
        <input type="checkbox" id="ing-${index}">
        <span>${UI.escapeHtml([ingredient.amount, ingredient.name].filter(Boolean).join(' '))}</span>
      </label>
    </li>`;

  root.innerHTML = `
    <article class="detail">
      <aside class="detail-side" aria-label="Receptinformatie">
        <img class="detail-img" src="${UI.escapeHtml(UI.recipeImageSrc(recipe))}" alt="Foto van ${UI.escapeHtml(recipe.title)}" data-category="${UI.escapeHtml(recipe.category)}">
        <div class="meta-list">
          <span class="badge badge-soft">${recipe.minutes} min</span>
          <span class="badge badge-soft">${UI.escapeHtml(recipe.category)}</span>
          ${recipe.diet.map((diet) => `<span class="badge badge-accent">${UI.escapeHtml(diet)}</span>`).join('')}
        </div>
        <div class="author">
          <span class="avatar" aria-hidden="true">${UI.escapeHtml(recipe.author.charAt(0).toUpperCase())}</span>
          <div>
            <p class="author-name">${UI.escapeHtml(recipe.author)}</p>
            <p class="recipe-meta">Auteur</p>
          </div>
        </div>
        <button id="favoriteBtn" class="btn btn-primary btn-block" type="button" aria-pressed="false"></button>
        ${Auth.canManage(recipe, session) ? `<a class="btn btn-outline btn-block" href="nieuw-recept.html?id=${recipe.id}">Recept bewerken</a>` : ''}
      </aside>

      <div class="detail-main">
        ${recipe.status === RecipeStore.STATUS.published ? '' : '<p class="notice">Dit recept is een concept en nog niet zichtbaar voor anderen.</p>'}
        <h1>${UI.escapeHtml(recipe.title)}</h1>
        ${UI.ratingMarkup(recipe.rating)}

        <section aria-labelledby="ingredientsTitle">
          <h2 id="ingredientsTitle">Ingrediënten</h2>
          ${recipe.ingredients.length
            ? `<ul class="checklist">${recipe.ingredients.map(ingredientMarkup).join('')}</ul>`
            : '<p class="muted">Er zijn geen ingrediënten toegevoegd.</p>'}
        </section>

        <section aria-labelledby="stepsTitle">
          <h2 id="stepsTitle">Bereidingsstappen</h2>
          <div class="stepper" id="stepper"></div>
        </section>

        <section aria-labelledby="commentsTitle">
          <h2 id="commentsTitle">Reacties</h2>
          <div id="commentList"></div>
          <form class="comment-form" id="commentForm">
            <label class="visually-hidden" for="commentInput">Schrijf een reactie</label>
            <input class="input" id="commentInput" name="comment" type="text" maxlength="300" placeholder="Schrijf een reactie…" autocomplete="off">
            <button class="btn btn-primary" type="submit">Plaatsen</button>
          </form>
        </section>
      </div>
    </article>`;

  /* ---------- Favoriet ---------- */

  const favoriteBtn = UI.$('#favoriteBtn');

  const renderFavorite = () => {
    const saved = Favorites.has(recipe.id);
    favoriteBtn.textContent = saved ? 'Opgeslagen in favorieten' : 'Opslaan in favorieten';
    favoriteBtn.setAttribute('aria-pressed', String(saved));
    favoriteBtn.classList.toggle('btn-saved', saved);
    favoriteBtn.classList.toggle('btn-primary', !saved);
  };

  favoriteBtn.addEventListener('click', () => {
    const added = Favorites.toggle(recipe.id);
    renderFavorite();
    UI.toast(added ? 'Toegevoegd aan je favorieten.' : 'Verwijderd uit je favorieten.', added ? 'success' : 'info');
  });

  /* ---------- Stappen ---------- */

  const stepper = UI.$('#stepper');

  const renderSteps = () => {
    const total = recipe.steps.length;
    if (!total) {
      stepper.innerHTML = '<p class="muted">Er zijn geen bereidingsstappen toegevoegd.</p>';
      return;
    }
    stepper.innerHTML = `
      <div class="stepper-nav">
        ${recipe.steps.map((_, index) => `
          <button class="step-dot" type="button" data-step="${index}" aria-label="Stap ${index + 1}" aria-current="${index === activeStep}">${index + 1}</button>`).join('')}
      </div>
      <p class="stepper-label">Stap ${activeStep + 1} van ${total}</p>
      <p class="stepper-text">${UI.escapeHtml(recipe.steps[activeStep])}</p>
      <div class="stepper-controls">
        <button class="btn btn-outline btn-sm" type="button" data-move="-1" ${activeStep === 0 ? 'disabled' : ''}>Vorige</button>
        <button class="btn btn-outline btn-sm" type="button" data-move="1" ${activeStep === total - 1 ? 'disabled' : ''}>Volgende</button>
      </div>`;
  };

  stepper.addEventListener('click', (event) => {
    const dot = event.target.closest('[data-step]');
    const move = event.target.closest('[data-move]');
    if (dot) activeStep = Number(dot.dataset.step);
    else if (move) activeStep = Math.min(recipe.steps.length - 1, Math.max(0, activeStep + Number(move.dataset.move)));
    else return;
    renderSteps();
  });

  /* ---------- Reacties ---------- */

  const commentList = UI.$('#commentList');
  const commentForm = UI.$('#commentForm');
  const commentInput = UI.$('#commentInput');

  const renderComments = () => {
    commentList.innerHTML = recipe.comments.length
      ? recipe.comments.map((comment) => `
          <div class="comment">
            <span class="avatar" aria-hidden="true">${UI.escapeHtml(comment.user.charAt(0).toUpperCase())}</span>
            <div>
              <p class="comment-name">${UI.escapeHtml(comment.user)}</p>
              <p class="comment-text">${UI.escapeHtml(comment.text)}</p>
            </div>
          </div>`).join('')
      : '<p class="muted">Nog geen reacties. Deel als eerste wat je ervan vond.</p>';
  };

  commentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = commentInput.value.trim();
    if (!text) {
      commentInput.setAttribute('aria-invalid', 'true');
      UI.toast('Schrijf eerst een reactie.', 'error');
      return;
    }
    commentInput.removeAttribute('aria-invalid');

    const updated = { ...recipe, comments: [...recipe.comments, { user: session?.username ?? 'Gast', text }] };
    try {
      RecipeStore.save(updated);
    } catch {
      UI.toast('Reactie kon niet worden opgeslagen.', 'error');
      return;
    }
    recipe.comments = updated.comments;
    commentInput.value = '';
    renderComments();
    UI.toast('Reactie geplaatst.');
  });

  commentInput.addEventListener('input', () => commentInput.removeAttribute('aria-invalid'));

  renderFavorite();
  renderSteps();
  renderComments();
})();
