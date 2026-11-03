<section class="page-hero">
    <div class="page-hero-inner">
        <h1>Recepten</h1>
        <p>Zoek, filter en sorteer alle gepubliceerde recepten.</p>
    </div>
</section>

<main id="main" class="container">
    <div class="layout-sidebar">

        <aside aria-label="Filters">
            <details class="card filters" open>
                <summary>Filters</summary>
                <form class="filters-body" action="recepten.php" method="get">

                    <div class="field field-flush">
                        <label for="q">Zoeken</label>
                        <input type="search" id="q" name="q" class="input" placeholder="Titel of ingrediënt" value="<?= e($q) ?>">
                    </div>

                    <fieldset>
                        <legend>Type gerecht</legend>
<?php foreach ($categories as $category): ?>
                        <label class="check"><input type="checkbox" name="category" value="<?= e($category['name']) ?>"> <?= e($category['name']) ?></label>
<?php endforeach; ?>
                    </fieldset>

                    <div>
                        <label class="field-label" for="minutes">Bereidingstijd</label>
                        <input type="range" id="minutes" name="minutes" min="5" max="120" step="5" value="120">
                        <div class="range-labels">
                            <span>5 min</span>
                            <span>Alle tijden</span>
                        </div>
                    </div>

                    <fieldset>
                        <legend>Dieet</legend>
<?php foreach (DIETS as $value => $label): ?>
                        <label class="check"><input type="checkbox" name="diet" value="<?= e($value) ?>"> <?= e($label) ?></label>
<?php endforeach; ?>
                    </fieldset>

                    <div class="field field-flush">
                        <label for="sort">Sorteren op</label>
                        <select id="sort" name="sort" class="input">
                            <option value="default">Standaard</option>
                            <option value="rating">Beoordeling</option>
                            <option value="time">Bereidingstijd</option>
                            <option value="newest">Nieuwste eerst</option>
                        </select>
                    </div>

                    <button type="reset" class="btn btn-outline btn-block">Filters wissen</button>
                </form>
            </details>
        </aside>

        <section aria-labelledby="results">
            <div class="results-head">
                <h2 id="results" class="visually-hidden">Zoekresultaten</h2>
                <p class="muted"><?= count($recipes) ?> recepten gevonden</p>
                <div class="active-filters"></div>
            </div>

            <div class="grid">
<?php $withData = true; ?>
<?php foreach ($recipes as $recipe): ?>
<?php include __DIR__ . '/partials/recipe-card.php'; ?>
<?php endforeach; ?>

                <div class="empty-state" id="empty" hidden>
                    <span class="empty-icon" aria-hidden="true">🍽️</span>
                    <h3>Geen recepten gevonden</h3>
                    <p>Probeer een andere zoekterm of haal een filter weg.</p>
                    <button class="btn btn-outline btn-sm" type="button" id="clear">Filters wissen</button>
                </div>
            </div>
        </section>

    </div>
</main>
