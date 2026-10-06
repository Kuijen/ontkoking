/**
 * Data-laag: recepten en favorieten in localStorage.
 * Een recept ziet er zo uit:
 * { id, title, category, minutes, rating, author, status, image, tags[], diet[],
 *   ingredients: [{ amount, name }], steps: [string], comments: [{ user, text }] }
 */
const RecipeStore = (() => {
  const KEY = 'ff_recepten_v2';
  const STATUS = { published: 'Gepubliceerd', draft: 'Concept' };

  const ingredients = (...pairs) => pairs.map(([amount, name]) => ({ amount, name }));

  const SAMPLE = [
    {
      id: 1, title: 'Snelle vega curry', category: 'Vega', minutes: 25, rating: 4, author: Auth.MAIN_ADMIN,
      status: STATUS.published, image: '', tags: ['Snel', 'Vega', 'Budget'], diet: ['vegan', 'glutenvrij', 'lactosevrij'],
      ingredients: ingredients(['400 g', 'kikkererwten'], ['2', 'uien'], ['3 tenen', 'knoflook'], ['200 ml', 'kokosmelk'], ['2 el', 'currypoeder']),
      steps: ['Verhit olie in een pan.', 'Bak de ui en knoflook 3 minuten.', 'Voeg currypoeder en kikkererwten toe.', 'Giet de kokosmelk erbij en laat 10 minuten sudderen.'],
      comments: [{ user: 'Bekkeer', text: 'Heerlijk recept!' }, { user: 'Taan', text: 'Snel en makkelijk.' }]
    },
    {
      id: 2, title: 'Airfryer kippenfilets', category: 'Vlees', minutes: 20, rating: 5, author: Auth.MAIN_ADMIN,
      status: STATUS.published, image: '', tags: ['Snel', 'Diner'], diet: ['glutenvrij', 'lactosevrij'],
      ingredients: ingredients(['500 g', 'kipfilet'], ['2 el', 'olijfolie'], ['1 tl', 'paprikapoeder'], ['', 'zout en peper']),
      steps: ['Kruid de kip met olie en specerijen.', 'Zet de airfryer op 200 °C.', 'Bak 15 tot 18 minuten en draai halverwege om.'],
      comments: []
    },
    {
      id: 3, title: 'Mediterrane groentestoof', category: 'Vega', minutes: 35, rating: 4, author: Auth.MAIN_ADMIN,
      status: STATUS.published, image: '', tags: ['Vega', 'Budget', 'Diner'], diet: ['vegan', 'glutenvrij', 'lactosevrij'],
      ingredients: ingredients(['300 g', 'groenten naar keuze'], ['1 blik', 'tomatenblokjes'], ['1', 'ui'], ['1 el', 'Italiaanse kruiden']),
      steps: ['Snijd de groenten klein.', 'Bak de ui glazig.', 'Voeg de tomaten en kruiden toe en laat 20 minuten koken.'],
      comments: []
    },
    {
      id: 4, title: 'Airfryer gehaktballetjes', category: 'Vlees', minutes: 18, rating: 4, author: Auth.MAIN_ADMIN,
      status: STATUS.published, image: '', tags: ['Snel', 'Budget'], diet: [],
      ingredients: ingredients(['400 g', 'gehakt'], ['1', 'ui'], ['2 tenen', 'knoflook'], ['1 el', 'kruiden']),
      steps: ['Meng alle ingrediënten.', 'Rol er balletjes van.', 'Bak 15 minuten in de airfryer op 190 °C.'],
      comments: []
    },
    {
      id: 5, title: 'Romige pompoensoep', category: 'Soep', minutes: 40, rating: 5, author: Auth.MAIN_ADMIN,
      status: STATUS.published, image: '', tags: ['Vega', 'Budget'], diet: ['vegan', 'glutenvrij', 'lactosevrij'],
      ingredients: ingredients(['800 g', 'pompoen'], ['1', 'ui'], ['500 ml', 'groentebouillon'], ['100 ml', 'kokosmelk']),
      steps: ['Snijd de pompoen in blokjes en bak met de ui.', 'Voeg de bouillon toe en kook 20 minuten.', 'Pureer de soep en roer de kokosmelk erdoor.'],
      comments: []
    },
    {
      id: 6, title: 'Zalm uit de oven', category: 'Vis', minutes: 22, rating: 4, author: Auth.MAIN_ADMIN,
      status: STATUS.published, image: '', tags: ['Snel', 'Diner'], diet: ['glutenvrij', 'lactosevrij'],
      ingredients: ingredients(['2', 'zalmfilets'], ['1', 'citroen'], ['1 el', 'olijfolie'], ['1 tl', 'dille']),
      steps: ['Verwarm de oven voor op 200 °C.', 'Leg de zalm op bakpapier en besprenkel met olie, citroen en dille.', 'Bak 15 tot 18 minuten.'],
      comments: []
    }
  ];

  const clone = (value) => JSON.parse(JSON.stringify(value));

  /** Zorgt dat elk recept alle velden heeft, ook als er iets ontbreekt in de opslag. */
  const normalize = (recipe) => ({
    image: '',
    rating: 0,
    status: STATUS.draft,
    ...recipe,
    minutes: Number(recipe.minutes) || 30,
    tags: Array.isArray(recipe.tags) ? recipe.tags : [],
    diet: Array.isArray(recipe.diet) ? recipe.diet : [],
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
    steps: Array.isArray(recipe.steps) ? recipe.steps : [],
    comments: Array.isArray(recipe.comments) ? recipe.comments : []
  });

  /** Schrijven kan falen als de opslag vol is; de aanroeper vangt die fout op. */
  const write = (list) => localStorage.setItem(KEY, JSON.stringify(list));

  const getAll = () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw === null) {
        write(SAMPLE);
        return clone(SAMPLE).map(normalize);
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(normalize) : clone(SAMPLE).map(normalize);
    } catch {
      return clone(SAMPLE).map(normalize);
    }
  };

  const getPublished = () => getAll().filter((r) => r.status === STATUS.published);
  const getById = (id) => getAll().find((r) => r.id === Number(id)) ?? null;
  const nextId = () => Math.max(0, ...getAll().map((r) => r.id)) + 1;

  const save = (recipe) => {
    const list = getAll();
    const index = list.findIndex((r) => r.id === recipe.id);
    if (index >= 0) list[index] = recipe;
    else list.push(recipe);
    write(list);
  };

  const remove = (id) => write(getAll().filter((r) => r.id !== Number(id)));

  return { STATUS, getAll, getPublished, getById, nextId, save, remove };
})();

/** Favorieten per gebruiker (gasten delen één lijst). */
const Favorites = (() => {
  const storageKey = () => `ff_favorieten_${Auth.getSession()?.username ?? 'gast'}`;

  const getIds = () => {
    try {
      const ids = JSON.parse(localStorage.getItem(storageKey()));
      return Array.isArray(ids) ? ids : [];
    } catch {
      return [];
    }
  };

  const has = (id) => getIds().includes(Number(id));

  /** Wisselt de favoriet-status en geeft terug of het recept nu favoriet is. */
  const toggle = (id) => {
    const numericId = Number(id);
    const ids = getIds();
    const isFavorite = ids.includes(numericId);
    const next = isFavorite ? ids.filter((x) => x !== numericId) : [...ids, numericId];
    localStorage.setItem(storageKey(), JSON.stringify(next));
    return !isFavorite;
  };

  return { getIds, has, toggle };
})();
