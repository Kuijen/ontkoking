(function () {
    function renumber(list) {
        Array.from(list.children).forEach(function (row, i) {
            var n = i + 1;
            var number = row.querySelector('.step-number');
            if (number) number.textContent = n;

            row.querySelectorAll('[aria-label]').forEach(function (el) {
                el.setAttribute('aria-label', el.getAttribute('aria-label').replace(/\d+$/, n));
            });
            row.querySelectorAll('textarea').forEach(function (el) {
                el.placeholder = el.placeholder.replace(/\d+/, n);
            });
        });
    }

    function clearRow(row) {
        row.querySelectorAll('input, textarea').forEach(function (field) {
            field.value = '';
        });
    }

    document.querySelectorAll('[data-add]').forEach(function (button) {
        var list = document.querySelector(button.dataset.add);

        button.addEventListener('click', function () {
            var row = list.firstElementChild.cloneNode(true);
            clearRow(row);
            list.appendChild(row);
            renumber(list);
            row.querySelector('input, textarea').focus();
        });
    });

    document.addEventListener('click', function (event) {
        var button = event.target.closest('.dynamic-row .icon-btn');
        if (!button) return;

        var row = button.closest('.dynamic-row');
        var list = row.parentElement;

        if (list.children.length === 1) {
            clearRow(row);
        } else {
            row.remove();
            renumber(list);
        }
    });
})();
