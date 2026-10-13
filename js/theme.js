/* Thema wisselen (licht / donker) – onthoudt je keuze op alle pagina's */
(function () {
    var KEY = 'ff-theme';
    var root = document.documentElement;

    var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
    var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

    function read() {
        try { return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark'; }
        catch (e) { return 'dark'; }
    }
    function save(theme) {
        try { localStorage.setItem(KEY, theme); } catch (e) { /* geen opslag beschikbaar */ }
    }

    // Meteen toepassen (script staat in <head>), zodat er geen flits is
    root.setAttribute('data-theme', read());

    document.addEventListener('DOMContentLoaded', function () {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'theme-toggle';

        var header = document.querySelector('.header-inner');
        if (header) {
            header.appendChild(btn);
        } else {
            btn.classList.add('theme-toggle-float'); // loginpagina heeft geen header
            document.body.appendChild(btn);
        }

        function render() {
            var light = root.getAttribute('data-theme') === 'light';
            btn.innerHTML = light ? MOON : SUN;
            var label = light ? 'Schakel naar donker thema' : 'Schakel naar licht thema';
            btn.setAttribute('aria-label', label);
            btn.title = label;
        }

        btn.addEventListener('click', function () {
            var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            root.setAttribute('data-theme', next);
            save(next);
            render();
        });

        // Andere open tabbladen meenemen
        window.addEventListener('storage', function (e) {
            if (e.key === KEY) { root.setAttribute('data-theme', read()); render(); }
        });

        render();
    });
})();