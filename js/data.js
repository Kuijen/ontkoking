const DATA_KEY = 'ff_recepten';

const SAMPLE_RECEPTEN = [
  { id: 1, title: 'Snelle Vega Curry', cat: 'Vega', time: '25 min', rating: 4, author: 'ikbenadmin123', status: 'Gepubliceerd', ingredients: ['400g kikkererwten','2 uien','3 teen knoflook','200ml kokosmelk','2 el currypoeder'], steps: ['Verhit olie in een pan.','Voeg ui en knoflook toe, bak 3 min.','Voeg currypoeder en kikkererwten toe.','Giet kokosmelk erbij en laat 10 min sudderen.'], comments: [{user:'Bekkeer',text:'Heerlijk recept!'},{user:'Taan Adam',text:'Snel en makkelijk.'}] },
  { id: 2, title: 'Airfryer Kippenfilets', cat: 'Vlees', time: '20 min', rating: 5, author: 'ikbenadmin123', status: 'Gepubliceerd', ingredients: ['500g kipfilet','2 el olijfolie','1 tl paprikapoeder','zout & peper'], steps: ['Kruid de kip met olie en specerijen.','Zet de airfryer op 200°C.','Bak 15-18 minuten, halverwege draaien.'], comments: [] },
  { id: 3, title: 'Vega Vorry', cat: 'Vega', time: '35 min', rating: 4, author: 'ikbenadmin123', status: 'Gepubliceerd', ingredients: ['300g groenten','1 blik tomaten','1 ui','kruiden'], steps: ['Snij groenten klein.','Bak ui glazig.','Voeg tomaten en kruiden toe, 20 min koken.'], comments: [] },
  { id: 4, title: 'Airfryer Vippanvicogils', cat: 'Vlees', time: '18 min', rating: 4, author: 'ikbenadmin123', status: 'Gepubliceerd', ingredients: ['400g gehakt','1 ui','2 teentjes knoflook','kruiden'], steps: ['Meng alle ingrediënten.','Rol balletjes.','Bak 15 min in de airfryer op 190°C.'], comments: [] },
];

function getRecepten() {
  try { return JSON.parse(localStorage.getItem(DATA_KEY)) || SAMPLE_RECEPTEN; }
  catch { return SAMPLE_RECEPTEN; }
}

function saveRecepten(list) {
  localStorage.setItem(DATA_KEY, JSON.stringify(list));
}

function getRecept(id) {
  return getRecepten().find(r => r.id === parseInt(id));
}

function saveRecept(recept) {
  const list = getRecepten();
  const idx = list.findIndex(r => r.id === recept.id);
  if (idx >= 0) list[idx] = recept;
  else list.push(recept);
  saveRecepten(list);
}

function deleteRecept(id) {
  saveRecepten(getRecepten().filter(r => r.id !== parseInt(id)));
}

function nextId() {
  const list = getRecepten();
  return list.length ? Math.max(...list.map(r => r.id)) + 1 : 1;
}

function stars(n, total = 5) {
  return '★'.repeat(n) + '☆'.repeat(total - n);
}

function getFavorieten() {
  try { return JSON.parse(localStorage.getItem('ff_favorieten')) || []; }
  catch { return []; }
}

function toggleFavoriet(id) {
  const favs = getFavorieten();
  const idx = favs.indexOf(id);
  if (idx >= 0) favs.splice(idx, 1);
  else favs.push(id);
  localStorage.setItem('ff_favorieten', JSON.stringify(favs));
  return idx < 0;
}
