<section class="page-hero">
    <div class="page-hero-inner">
        <a class="back-link" href="dashboard.php">Terug naar mijn keuken</a>
        <h1><?= $existing ? 'Recept bewerken' : 'Nieuw recept' ?></h1>
        <p>Vul de drie onderdelen in en sla je recept op.</p>
    </div>
</section>

<main id="main" class="container container-narrow">
    <form action="nieuw-recept.php<?= $existing ? '?id=' . (int) $existing['id'] : '' ?>" method="post" enctype="multipart/form-data">
        <?= csrf_field() ?>

<?php if ($errors): ?>
        <div class="form-alert" role="alert">
<?php foreach ($errors as $error): ?>
            <div><?= e($error) ?></div>
<?php endforeach; ?>
        </div>
<?php endif; ?>

        <section class="card form-section" aria-labelledby="info">
            <div class="card-body">
                <h2 class="panel-title" id="info">
                    <span class="tab-num" aria-hidden="true">1</span> Algemene informatie
                </h2>

                <div class="field">
                    <label for="title">Titel</label>
                    <input type="text" id="title" name="title" class="input" placeholder="Naam van het recept" maxlength="120" value="<?= e($form['title']) ?>" required>
                </div>

                <div class="field">
                    <label for="description">Korte omschrijving (optioneel)</label>
                    <input type="text" id="description" name="description" class="input" placeholder="Bijvoorbeeld: een romige curry in 25 minuten" maxlength="200" value="<?= e($form['description']) ?>">
                </div>

                <div class="field">
                    <label for="category">Categorie</label>
                    <select id="category" name="category_id" class="input" required>
                        <option value="">Kies een categorie</option>
<?php foreach ($categories as $category): ?>
                        <option value="<?= (int) $category['id'] ?>"<?= (int) $form['category_id'] === (int) $category['id'] ? ' selected' : '' ?>><?= e($category['name']) ?></option>
<?php endforeach; ?>
                    </select>
                </div>

                <div class="field">
                    <label for="minutes">Bereidingstijd (minuten)</label>
                    <input type="number" id="minutes" name="minutes" class="input" min="1" max="1000" placeholder="Bijvoorbeeld 30" value="<?= e($form['minutes']) ?>" required>
                </div>

                <fieldset class="field">
                    <legend class="field-label">Dieet</legend>
                    <div class="check-group">
<?php foreach (DIETS as $value => $label): ?>
                        <label class="check"><input type="checkbox" name="diet[]" value="<?= e($value) ?>"<?= in_array($value, $form['diet'], true) ? ' checked' : '' ?>> <?= e($label) ?></label>
<?php endforeach; ?>
                    </div>
                </fieldset>

                <fieldset class="field">
                    <legend class="field-label">Labels</legend>
                    <div class="check-group">
<?php foreach (LABELS as $value => $label): ?>
                        <label class="check"><input type="checkbox" name="tag[]" value="<?= e($value) ?>"<?= in_array($value, $form['tags'], true) ? ' checked' : '' ?>> #<?= e($label) ?></label>
<?php endforeach; ?>
                    </div>
                </fieldset>

                <div class="field">
                    <span class="field-label">Afbeelding (optioneel)</span>
                    <label class="upload-zone" for="image">
                        <span aria-hidden="true">📷</span>
                        <span>Klik om een afbeelding te kiezen</span>
                        <span class="recipe-meta">jpg, png of webp, maximaal 5 MB<?= $existing && $existing['image'] ? ' (leeg laten om de huidige te houden)' : '' ?></span>
                    </label>
                    <input type="file" id="image" name="image" class="visually-hidden" accept="image/jpeg,image/png,image/webp">
                </div>
            </div>
        </section>

        <section class="card form-section" aria-labelledby="ingredients">
            <div class="card-body">
                <h2 class="panel-title" id="ingredients">
                    <span class="tab-num" aria-hidden="true">2</span> Ingrediënten
                </h2>

                <ul class="dynamic-list" id="ingredientList">
<?php foreach ($form['ingredients'] as $i => $row): ?>
                    <li class="dynamic-row">
                        <input class="input input-amount" type="text" name="amount[]" placeholder="Hoeveelheid" aria-label="Hoeveelheid ingrediënt <?= $i + 1 ?>" value="<?= e($row['amount']) ?>">
                        <input class="input" type="text" name="ingredient[]" placeholder="Ingrediënt" aria-label="Ingrediënt <?= $i + 1 ?>" value="<?= e($row['name']) ?>">
                        <button class="icon-btn" type="button" aria-label="Verwijder ingrediënt <?= $i + 1 ?>">✕</button>
                    </li>
<?php endforeach; ?>
                </ul>

                <button class="btn btn-outline btn-sm" type="button" data-add="#ingredientList">Ingrediënt toevoegen</button>
            </div>
        </section>

        <section class="card form-section" aria-labelledby="steps">
            <div class="card-body">
                <h2 class="panel-title" id="steps">
                    <span class="tab-num" aria-hidden="true">3</span> Bereidingsstappen
                </h2>

                <ol class="dynamic-list" id="stepList">
<?php foreach ($form['steps'] as $i => $text): ?>
                    <li class="dynamic-row">
                        <span class="step-number" aria-hidden="true"><?= $i + 1 ?></span>
                        <textarea class="input" name="step[]" rows="2" placeholder="Beschrijf stap <?= $i + 1 ?>…" aria-label="Stap <?= $i + 1 ?>"><?= e($text) ?></textarea>
                        <button class="icon-btn" type="button" aria-label="Verwijder stap <?= $i + 1 ?>">✕</button>
                    </li>
<?php endforeach; ?>
                </ol>

                <button class="btn btn-outline btn-sm" type="button" data-add="#stepList">Stap toevoegen</button>
            </div>
        </section>

        <div class="form-actions">
            <a class="btn btn-ghost" href="dashboard.php">Annuleren</a>
            <button class="btn btn-outline" type="submit" name="status" value="concept">Opslaan als concept</button>
            <button class="btn btn-primary" type="submit" name="status" value="published">Publiceren</button>
        </div>

    </form>
</main>
