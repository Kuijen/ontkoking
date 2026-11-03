<section class="page-hero">
    <div class="page-hero-inner">
        <h1>Mijn keuken</h1>
        <p>Je favorieten en je eigen recepten op één plek.</p>
    </div>
</section>

<main id="main" class="container">

    <section class="stats" aria-label="Overzicht">
        <div class="stat">
            <span class="stat-value"><?= count($mine) ?></span>
            <span class="stat-label">Mijn recepten</span>
        </div>
        <div class="stat">
            <span class="stat-value"><?= (int) $conceptCount ?></span>
            <span class="stat-label">Concepten</span>
        </div>
        <div class="stat">
            <span class="stat-value"><?= count($favorites) ?></span>
            <span class="stat-label">Favorieten</span>
        </div>
    </section>

    <div class="dash-grid">
        <section class="section" aria-labelledby="favorites">
            <div class="section-heading">
                <h2 id="favorites">Mijn favorieten</h2>
            </div>

<?php if ($favorites): ?>
            <div class="grid grid-compact">
<?php foreach ($favorites as $recipe): ?>
<?php include __DIR__ . '/partials/recipe-card.php'; ?>
<?php endforeach; ?>
            </div>
<?php else: ?>
            <p class="muted">Je hebt nog geen favorieten. Open een recept en kies "Opslaan in favorieten".</p>
<?php endif; ?>
        </section>

        <div>
            <section class="section" aria-labelledby="mine">
                <div class="section-heading">
                    <h2 id="mine">Mijn recepten</h2>
                    <a class="btn btn-primary btn-sm" href="nieuw-recept.php">Nieuw recept</a>
                </div>

<?php if ($mine): ?>
                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th scope="col">Titel</th>
                                <th scope="col">Status</th>
                                <th scope="col">Acties</th>
                            </tr>
                        </thead>
                        <tbody>
<?php foreach ($mine as $recipe): ?>
                            <tr>
                                <td class="cell-title"><?= e($recipe['title']) ?></td>
                                <td>
<?php if ($recipe['status'] === 'published'): ?>
                                    <span class="badge badge-success">Gepubliceerd</span>
<?php else: ?>
                                    <span class="badge badge-muted">Concept</span>
<?php endif; ?>
                                </td>
                                <td>
                                    <div class="cell-actions">
                                        <a class="btn btn-outline btn-sm" href="recept.php?id=<?= (int) $recipe['id'] ?>">Bekijk</a>
                                        <a class="btn btn-outline btn-sm" href="nieuw-recept.php?id=<?= (int) $recipe['id'] ?>">Bewerk</a>
                                        <form action="actie.php" method="post" onsubmit="return confirm('Dit recept verwijderen?');">
                                            <?= csrf_field() ?>
                                            <input type="hidden" name="actie" value="verwijder_recept">
                                            <input type="hidden" name="recept_id" value="<?= (int) $recipe['id'] ?>">
                                            <input type="hidden" name="terug" value="dashboard.php">
                                            <button class="btn btn-danger btn-sm" type="submit">Verwijder</button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
<?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
<?php else: ?>
                <p class="muted">Je hebt nog geen recepten geschreven.</p>
<?php endif; ?>
            </section>

            <section class="section" aria-labelledby="community">
                <div class="section-heading">
                    <h2 id="community">Nieuw van de community</h2>
                </div>
                <div class="card card-body">
<?php if ($community): ?>
                    <ul class="list-plain">
<?php foreach ($community as $recipe): ?>
                        <li>
                            <a href="recept.php?id=<?= (int) $recipe['id'] ?>"><?= e($recipe['title']) ?></a>
                            <span class="recipe-meta">door <?= e($recipe['author']) ?></span>
                        </li>
<?php endforeach; ?>
                    </ul>
<?php else: ?>
                    <p class="muted">Er zijn nog geen recepten van anderen.</p>
<?php endif; ?>
                </div>
            </section>
        </div>

    </div>
</main>
