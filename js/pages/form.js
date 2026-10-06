(() => {
  Nav.render('nieuw-recept.html');

  const session = Auth.requireLogin();
  if (!session) return;

  const editId = new URLSearchParams(window.location.search).get('id');
  const editing = editId ? RecipeStore.getById(editId) : null;
  if (editId && (!editing || !Auth.canManage(editing, session))) {
    UI.flash('Je kunt dit recept niet bewerken.', 'error');
    window.location.replace('dashboard.html');
    return;
  }

  const TABS = ['info', 'ingredients', 'steps'];
  const form = UI.$('#recipeForm');
  const tabButtons = TABS.map((name) => UI.$(`#tab-${name}`));
  const panels = TABS.map((name) => UI.$(`#panel-${name}`));
  const prevBtn = UI.$('#prevBtn');
  const nextBtn = UI.$('#nextBtn');
  const saveBtn = UI.$('#saveBtn');

  /* ---------- State ---------- */

  // Elke rij krijgt een vast id, zodat verwijderen nooit de verkeerde rij raakt.
  let lastId = 0;
  const nextRowId = () => (lastId += 1);
  const newIngredient = () => ({ id: nextRowId(), amount: '', name: '' });
  const newStep = () => ({ id: nextRowId(), text: '' });

  const state = {
    tab: 0,
    image: editing?.image ?? '',
    ingredients: editing?.ingredients.length
      ? editing.ingredients.map((item) => ({ id: nextRowId(), ...item }))
      : [newIngredient()],
    steps: editing?.steps.length
      ? editing.steps.map((text) => ({ id: nextRowId(), text }))
      : [newStep()]
  };

  /* ---------- Fouten ---------- */

  const setError = (name, message = '') => {
    const error = UI.$(`#err-${name}`);
    const field = UI.$(`#${name}`);
    error.textContent = message;
    error.hidden = !message;
    if (field) {
      if (message) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
    }
  };

  const validators = {
    info: () => {
      const minutes = Number(form.elements.minutes.value);
      return {
        title: form.elements.title.value.trim().length < 3 ? 'Geef het recept een titel van minimaal 3 tekens.' : '',
        category: form.elements.category.value ? '' : 'Kies een categorie.',
        minutes: Number.isInteger(minutes) && minutes >= 1 && minutes <= 600 ? '' : 'Vul een bereidingstijd in tussen 1 en 600 minuten.'
      };
    },
    ingredients: () => ({
      ingredients: state.ingredients.some((item) => item.name.trim()) ? '' : 'Voeg minimaal één ingrediënt toe.'
    }),
    steps: () => ({
      steps: state.steps.some((item) => item.text.trim()) ? '' : 'Voeg minimaal één bereidingsstap toe.'
    })
  };

  /** Toont de fouten van één tab en geeft terug of de tab geldig is. */
  const validateTab = (index) => {
    const errors = validators[TABS[index]]();
    Object.entries(errors).forEach(([name, message]) => setError(name, message));
    const firstInvalid = Object.keys(errors).find((name) => errors[name]);
    if (firstInvalid) UI.$(`#${firstInvalid}`)?.focus();
    return !firstInvalid;
  };

  form.addEventListener('input', (event) => {
    if (event.target.id && UI.$(`#err-${event.target.id}`)) setError(event.target.id);
  });

  /* ---------- Tabs ---------- */

  const switchTab = (index) => {
    state.tab = index;
    tabButtons.forEach((button, i) => {
      button.setAttribute('aria-selected', String(i === index));
      button.tabIndex = i === index ? 0 : -1;
    });
    panels.forEach((panel, i) => { panel.hidden = i !== index; });
    prevBtn.hidden = index === 0;
    nextBtn.hidden = index === TABS.length - 1;
    saveBtn.hidden = index !== TABS.length - 1;
  };

  const goNext = () => {
    if (validateTab(state.tab)) switchTab(state.tab + 1);
  };

  tabButtons.forEach((button, index) => {
    button.addEventListener('click', () => switchTab(index));
    button.addEventListener('keydown', (event) => {
      const offset = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      if (!offset) return;
      const target = (index + offset + TABS.length) % TABS.length;
      switchTab(target);
      tabButtons[target].focus();
    });
  });
  prevBtn.addEventListener('click', () => switchTab(state.tab - 1));
  nextBtn.addEventListener('click', goNext);

  /* ---------- Dynamische lijsten ---------- */

  const ingredientList = UI.$('#ingredientList');
  const stepList = UI.$('#stepList');

  const renderIngredients = () => {
    ingredientList.innerHTML = state.ingredients.map((item, index) => `
      <li class="dynamic-row" data-id="${item.id}">
        <input class="input input-amount" type="text" data-field="amount" value="${UI.escapeHtml(item.amount)}" placeholder="Hoeveelheid" aria-label="Hoeveelheid van ingrediënt ${index + 1}">
        <input class="input" type="text" data-field="name" value="${UI.escapeHtml(item.name)}" placeholder="Ingrediënt" aria-label="Naam van ingrediënt ${index + 1}">
        <button class="icon-btn" type="button" data-action="remove" aria-label="Verwijder ingrediënt ${index + 1}">✕</button>
      </li>`).join('');
  };

  const renderSteps = () => {
    stepList.innerHTML = state.steps.map((item, index) => `
      <li class="dynamic-row" data-id="${item.id}">
        <span class="step-number" aria-hidden="true">${index + 1}</span>
        <textarea class="input" rows="2" data-field="text" placeholder="Beschrijf stap ${index + 1}…" aria-label="Stap ${index + 1}">${UI.escapeHtml(item.text)}</textarea>
        <button class="icon-btn" type="button" data-action="remove" aria-label="Verwijder stap ${index + 1}">✕</button>
      </li>`).join('');
  };

  /**
   * Koppelt gedrag aan een dynamische lijst met event delegation:
   * één listener per lijst, ongeacht het aantal rijen.
   */
  const setupList = ({ listEl, addBtn, items, createItem, render, focusSelector }) => {
    const findIndex = (target) => {
      const row = target.closest('[data-id]');
      return row ? items.findIndex((item) => item.id === Number(row.dataset.id)) : -1;
    };

    listEl.addEventListener('input', (event) => {
      const index = findIndex(event.target);
      const field = event.target.dataset.field;
      if (index !== -1 && field) items[index][field] = event.target.value;
    });

    listEl.addEventListener('click', (event) => {
      if (!event.target.closest('[data-action="remove"]')) return;
      const index = findIndex(event.target);
      if (index === -1) return;
      // De laatste rij wordt leeggemaakt in plaats van verwijderd.
      if (items.length === 1) items.splice(0, 1, createItem());
      else items.splice(index, 1);
      render();
      (UI.$(focusSelector, listEl) ?? addBtn).focus();
    });

    addBtn.addEventListener('click', () => {
      items.push(createItem());
      render();
      UI.$(focusSelector, listEl.lastElementChild).focus();
    });
  };

  setupList({
    listEl: ingredientList, addBtn: UI.$('#addIngredientBtn'), items: state.ingredients,
    createItem: newIngredient, render: renderIngredients, focusSelector: '[data-field="amount"]'
  });
  setupList({
    listEl: stepList, addBtn: UI.$('#addStepBtn'), items: state.steps,
    createItem: newStep, render: renderSteps, focusSelector: '[data-field="text"]'
  });

  /* ---------- Afbeelding ---------- */

  const imageInput = UI.$('#imageInput');
  const uploadZone = UI.$('#uploadZone');
  const imagePreview = UI.$('#imagePreview');
  const previewImg = UI.$('#previewImg');

  const renderImage = () => {
    uploadZone.hidden = Boolean(state.image);
    imagePreview.hidden = !state.image;
    if (state.image) previewImg.src = state.image;
  };

  imageInput.addEventListener('change', async () => {
    const [file] = imageInput.files;
    if (!file) return;
    try {
      state.image = await UI.readImageFile(file);
      setError('image');
      renderImage();
    } catch (error) {
      setError('image', error.message);
    } finally {
      imageInput.value = '';
    }
  });

  UI.$('#removeImageBtn').addEventListener('click', () => {
    state.image = '';
    renderImage();
  });

  /* ---------- Opslaan ---------- */

  const deriveTags = ({ category, minutes, diet, extraTags }) => {
    const tags = new Set(extraTags);
    if (minutes <= 20) tags.add('Snel');
    if (category === 'Vega' || diet.includes('vegan')) tags.add('Vega');
    return [...tags];
  };

  const buildRecipe = () => {
    const data = new FormData(form);
    const category = data.get('category');
    const minutes = Number(data.get('minutes'));
    const diet = data.getAll('diet');

    return {
      id: editing?.id ?? RecipeStore.nextId(),
      title: String(data.get('title')).trim(),
      category,
      minutes,
      rating: editing?.rating ?? 0,
      author: editing?.author ?? session.username,
      status: editing?.status ?? (session.role === 'admin' ? RecipeStore.STATUS.published : RecipeStore.STATUS.draft),
      image: state.image,
      diet,
      tags: deriveTags({ category, minutes, diet, extraTags: data.getAll('tag') }),
      ingredients: state.ingredients
        .filter((item) => item.name.trim())
        .map((item) => ({ amount: item.amount.trim(), name: item.name.trim() })),
      steps: state.steps.map((item) => item.text.trim()).filter(Boolean),
      comments: editing?.comments ?? []
    };
  };

  const save = () => {
    const firstInvalidTab = TABS.findIndex((_, index) => !validateTab(index));
    if (firstInvalidTab !== -1) {
      switchTab(firstInvalidTab);
      UI.toast('Controleer de gemarkeerde velden.', 'error');
      return;
    }

    const recipe = buildRecipe();
    try {
      RecipeStore.save(recipe);
    } catch {
      UI.toast('Opslaan mislukt: de browseropslag is vol. Probeer een kleinere afbeelding.', 'error');
      return;
    }

    const published = recipe.status === RecipeStore.STATUS.published;
    UI.flash(editing ? 'Recept bijgewerkt.' : published ? 'Recept gepubliceerd.' : 'Recept opgeslagen als concept. Een beheerder bekijkt het eerst.');
    window.location.href = 'dashboard.html';
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    // Enter in een veld mag niet per ongeluk opslaan voordat de laatste tab bereikt is.
    if (state.tab < TABS.length - 1) goNext();
    else save();
  });

  /* ---------- Initialisatie ---------- */

  if (editing) {
    UI.$('#pageTitle').textContent = 'Recept bewerken';
    document.title = 'Recept bewerken – Food Freaks';
    form.elements.title.value = editing.title;
    form.elements.category.value = editing.category;
    form.elements.minutes.value = editing.minutes;
    UI.$$('input[name="diet"]').forEach((box) => { box.checked = editing.diet.includes(box.value); });
    UI.$$('input[name="tag"]').forEach((box) => { box.checked = editing.tags.includes(box.value); });
  }

  renderIngredients();
  renderSteps();
  renderImage();
  switchTab(0);
})();
