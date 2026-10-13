/* Filteren, zoeken en sorteren op de receptenpagina */
(function () {
    'use strict';

    var form = document.querySelector('.filters-body');
    var grid = document.querySelector('.layout-sidebar .grid');
    if (!form || !grid) return;

    var cards = [].slice.call(grid.querySelectorAll('.recipe-card'));
    cards.forEach(function (card, i) { card.dataset.index = i; });

    var empty = document.getElementById('emptyState');
    var clearBtn = document.getElementById('clearFilters');
    var countEl = document.querySelector('.results-head .muted');
    var chipBox = document.querySelector('.active-filters');
    var qInput = form.elements.q;
    var range = form.elements.maxMinutes;
    var sortEl = form.elements.sort;
    var rangeLabel = form.querySelector('.range-labels span:last-child');
    var rangeMax = Number(range.max);

    var sorters = {
        'Standaard':      function (a, b) { return a.dataset.index - b.dataset.index; },
        'Beoordeling':    function (a, b) { return b.dataset.rating - a.dataset.rating || a.dataset.index - b.dataset.index; },
        'Bereidingstijd': function (a, b) { return a.dataset.minutes - b.dataset.minutes || a.dataset.index - b.dataset.index; },
        'Nieuwste eerst': function (a, b) { return a.dataset.newest - b.dataset.newest || a.dataset.index - b.dataset.index; }
    };

    function checked(name) {
        return [].map.call(form.querySelectorAll('input[name="' + name + '"]:checked'), function (i) { return i.value; });
    }
    function uncheck(name, value) {
        var input = form.querySelector('input[name="' + name + '"][value="' + value + '"]');
        if (input) input.checked = false;
    }

    function makeChip(label, onRemove) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chip chip-active';
        btn.textContent = label + ' ✕';
        btn.setAttribute('aria-label', 'Filter ' + label + ' verwijderen');
        btn.addEventListener('click', function () { onRemove(); apply(); });
        return btn;
    }

    function apply() {
        var q = qInput.value.trim().toLowerCase();
        var terms = q ? q.split(/\s+/) : [];
        var cats = checked('category');
        var diets = checked('diet');
        var max = Number(range.value);
        var timeOn = max < rangeMax;

        rangeLabel.textContent = timeOn ? 'Max. ' + max + ' min' : 'Alle tijden';

        var shown = 0;
        cards.forEach(function (card) {
            var d = card.dataset;
            var text = (card.querySelector('.recipe-title').textContent + ' ' + d.category + ' ' + (d.search || '')).toLowerCase();
            var ok = terms.every(function (t) { return text.indexOf(t) !== -1; }) &&
                (!cats.length || cats.indexOf(d.category) !== -1) &&
                (!timeOn || Number(d.minutes) <= max) &&
                diets.every(function (x) { return (' ' + (d.diet || '') + ' ').indexOf(' ' + x + ' ') !== -1; });
            card.hidden = !ok;
            if (ok) shown++;
        });

        // Alleen herschikken als de volgorde echt verandert (anders gaan klikken op kaarten of knoppen mis)
        var sorted = cards.slice().sort(sorters[sortEl.value] || sorters.Standaard);
        var inDom = [].slice.call(grid.querySelectorAll('.recipe-card'));
        var changed = sorted.some(function (card, i) { return card !== inDom[i]; });
        if (changed) {
            sorted.forEach(function (card) { grid.insertBefore(card, empty || null); });
        }
        if (empty) empty.hidden = shown !== 0;

        countEl.textContent = shown + (shown === 1 ? ' recept' : ' recepten') + ' gevonden';

        chipBox.textContent = '';
        if (q) chipBox.appendChild(makeChip('“' + qInput.value.trim() + '”', function () { qInput.value = ''; }));
        cats.forEach(function (c) { chipBox.appendChild(makeChip(c, function () { uncheck('category', c); })); });
        diets.forEach(function (x) { chipBox.appendChild(makeChip(x, function () { uncheck('diet', x); })); });
        if (timeOn) chipBox.appendChild(makeChip('Max. ' + max + ' min', function () { range.value = range.max; }));
    }

    form.addEventListener('input', apply);
    form.addEventListener('change', apply);
    form.addEventListener('submit', function (e) { e.preventDefault(); apply(); });
    form.addEventListener('reset', function () { setTimeout(apply, 0); });
    if (clearBtn) clearBtn.addEventListener('click', function () { form.reset(); });

    // Zoekterm vanaf de homepage (recepten.html?q=...)
    var fromUrl = new URLSearchParams(location.search).get('q');
    if (fromUrl) qInput.value = fromUrl;

    apply();
})();