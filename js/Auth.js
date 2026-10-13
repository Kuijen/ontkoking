/* Inloggen, registreren en menu.
   Alles wordt opgeslagen in localStorage: handig voor een schoolproject,
   maar geen echte beveiliging (wachtwoorden staan leesbaar in de browser). */
(function () {
    'use strict';

    var USERS_KEY = 'ff-users';
    var SESSION_KEY = 'ff-session';

    // Startgebruikers, worden alleen de eerste keer aangemaakt
    var SEED_USERS = [
        { username: 'ikbenadmin123', password: 'admin123',  role: 'admin' },
        { username: 'Bekkeer',       password: 'welkom123', role: 'user' },
        { username: 'Taan',          password: 'welkom123', role: 'user' }
    ];

    var NEEDS_LOGIN = ['dashboard.html', 'nieuw-recept.html', 'admin.html'];
    var NEEDS_ADMIN = ['admin.html'];
    var SAFE_NEXT = /^[a-z-]+\.html$/;

    /* ---------- opslag ---------- */
    function read(key) {
        try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
    }
    function write(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* geen opslag */ }
    }
    function getUsers() {
        var list = read(USERS_KEY);
        if (!Array.isArray(list) || !list.length) {
            list = SEED_USERS.slice();
            write(USERS_KEY, list);
        }
        return list;
    }
    function findUser(name) {
        var wanted = String(name).trim().toLowerCase();
        return getUsers().filter(function (u) { return u.username.toLowerCase() === wanted; })[0] || null;
    }
    function currentUser() {
        var name = read(SESSION_KEY);
        return name ? findUser(name) : null;
    }
    function logIn(user) { write(SESSION_KEY, user.username); }
    function logOut() {
        try { localStorage.removeItem(SESSION_KEY); } catch (e) { /* niks */ }
    }

    /* ---------- pagina beveiligen ---------- */
    var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var user = currentUser();

    if (NEEDS_LOGIN.indexOf(page) !== -1 && !user) {
        location.replace('login.html?next=' + encodeURIComponent(page));
        return;
    }
    if (NEEDS_ADMIN.indexOf(page) !== -1 && user && user.role !== 'admin') {
        location.replace('index.html');
        return;
    }

    /* ---------- menu ---------- */
    function renderNav() {
        var box = document.querySelector('.nav-user');
        if (box) {
            box.textContent = '';
            if (user) {
                var who = document.createElement('span');
                who.appendChild(document.createTextNode(user.username + ' '));
                if (user.role === 'admin') {
                    var badge = document.createElement('span');
                    badge.className = 'badge badge-accent';
                    badge.textContent = 'admin';
                    who.appendChild(badge);
                }
                var out = document.createElement('button');
                out.type = 'button';
                out.className = 'btn btn-outline btn-sm';
                out.textContent = 'Uitloggen';
                out.addEventListener('click', function () {
                    logOut();
                    location.href = 'login.html';
                });
                box.appendChild(who);
                box.appendChild(out);
            } else {
                var link = document.createElement('a');
                link.className = 'btn btn-outline btn-sm';
                link.href = 'login.html';
                link.textContent = 'Inloggen';
                box.appendChild(link);
            }
        }
        var adminLink = document.querySelector('.nav-links a[href="admin.html"]');
        if (adminLink && adminLink.parentElement) {
            adminLink.parentElement.hidden = !(user && user.role === 'admin');
        }
    }

    /* ---------- loginpagina ---------- */
    function showError(form, message, fields) {
        clearError(form);
        var box = document.createElement('div');
        box.className = 'form-alert';
        box.setAttribute('role', 'alert');
        box.textContent = message;
        form.querySelector('h2').insertAdjacentElement('afterend', box);
        (fields || []).forEach(function (f) { f.setAttribute('aria-invalid', 'true'); });
        if (fields && fields[0]) fields[0].focus();
    }
    function clearError(form) {
        var old = form.querySelector('.form-alert');
        if (old) old.remove();
        [].forEach.call(form.querySelectorAll('[aria-invalid]'), function (f) {
            f.removeAttribute('aria-invalid');
        });
    }

    function initLogin() {
        var loginName = document.getElementById('username');
        var regName = document.getElementById('newUsername');
        if (!loginName || !regName) return;

        var loginPass = document.getElementById('password');
        var regPass = document.getElementById('newPassword');
        var regConfirm = document.getElementById('confirm');
        var loginForm = loginName.closest('form');
        var regForm = regName.closest('form');

        var next = new URLSearchParams(location.search).get('next');
        var target = next && SAFE_NEXT.test(next) ? next : 'index.html';

        [loginForm, regForm].forEach(function (form) {
            form.addEventListener('input', function () { clearError(form); });
        });

        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (!loginName.value.trim() || !loginPass.value) {
                showError(loginForm, 'Vul je gebruikersnaam en wachtwoord in.',
                    [loginName.value.trim() ? loginPass : loginName]);
                return;
            }
            var found = findUser(loginName.value);
            if (!found || found.password !== loginPass.value) {
                showError(loginForm, 'Gebruikersnaam of wachtwoord klopt niet.', [loginName, loginPass]);
                return;
            }
            logIn(found);
            location.href = target;
        });

        regForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var name = regName.value.trim();
            if (name.length < 3) {
                showError(regForm, 'Kies een gebruikersnaam van minimaal 3 tekens.', [regName]);
            } else if (findUser(name)) {
                showError(regForm, 'Deze gebruikersnaam is al in gebruik.', [regName]);
            } else if (regPass.value.length < 6) {
                showError(regForm, 'Je wachtwoord moet minimaal 6 tekens hebben.', [regPass]);
            } else if (regPass.value !== regConfirm.value) {
                showError(regForm, 'De wachtwoorden zijn niet hetzelfde.', [regConfirm]);
            } else {
                var created = { username: name, password: regPass.value, role: 'user' };
                var users = getUsers();
                users.push(created);
                write(USERS_KEY, users);
                logIn(created);
                location.href = target;
            }
        });
    }

    renderNav();
    initLogin();
})();