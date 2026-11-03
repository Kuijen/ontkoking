<section class="page-hero">
    <div class="page-hero-inner">
        <h1>Beheer</h1>
        <p>Gebruikers, recepten en de review-wachtrij.</p>
    </div>
</section>

<main id="main" class="container">
    <div class="admin-grid">
        <div>
            <section class="section" aria-labelledby="users">
                <div class="section-heading">
                    <h2 id="users">Gebruikers</h2>
                </div>

                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th scope="col">Gebruiker</th>
                                <th scope="col">Rol</th>
                                <th scope="col">Acties</th>
                            </tr>
                        </thead>
                        <tbody>
<?php foreach ($users as $row): ?>
                            <tr>
                                <td class="cell-title"><?= e($row['username']) ?></td>
                                <td>
                                    <span class="badge <?= $row['role'] === 'admin' ? 'badge-accent' : 'badge-muted' ?>"><?= e($row['role']) ?></span>
                                </td>
                                <td>
<?php if ((int) $row['id'] === (int) $user['id']): ?>
                                    <span class="recipe-meta">Dit ben jij</span>
<?php else: ?>
                                    <div class="cell-actions">
<?php if ($row['role'] !== 'admin'): ?>
                                        <form action="actie.php" method="post">
                                            <?= csrf_field() ?>
                                            <input type="hidden" name="actie" value="maak_admin">
                                            <input type="hidden" name="gebruiker_id" value="<?= (int) $row['id'] ?>">
                                            <input type="hidden" name="terug" value="admin.php">
                                            <button class="btn btn-outline btn-sm" type="submit">Maak admin</button>
                                        </form>
<?php endif; ?>
                                        <form action="actie.php" method="post" onsubmit="return confirm('Deze gebruiker en alle recepten verwijderen?');">
                                            <?= csrf_field() ?>
                                            <input type="hidden" name="actie" value="verwijder_gebruiker">
                                            <input type="hidden" name="gebruiker_id" value="<?= (int) $row['id'] ?>">
                                            <input type="hidden" name="terug" value="admin.php">
                                            <button class="btn btn-danger btn-sm" type="submit">Verwijder</button>
                                        </form>
                                    </div>
<?php endif; ?>
                                </td>
                            </tr>
<?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </section>

            <section class="section" aria-labelledby="recipes">
                <div class="section-heading">
                    <h2 id="recipes">Recepten</h2>
                </div>

                <div class="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th scope="col">Recept</th>
                                <th scope="col">Auteur</th>
                                <th scope="col">Status</th>
                                <th scope="col">Acties</th>
                            </tr>
                        </thead>
                        <tbody>
<?php foreach ($recipes as $recipe): ?>
<?php $isPublished = $recipe['status'] === 'published'; ?>
                            <tr>
                                <td class="cell-title"><?= e($recipe['title']) ?></td>
                                <td><?= e($recipe['author']) ?></td>
                                <td>
                                    <span class="badge <?= $isPublished ? 'badge-success' : 'badge-muted' ?>"><?= $isPublished ? 'Gepubliceerd' : 'Concept' ?></span>
                                </td>
                                <td>
                                    <div class="cell-actions">
                                        <form action="actie.php" method="post">
                                            <?= csrf_field() ?>
                                            <input type="hidden" name="actie" value="recept_status">
                                            <input type="hidden" name="recept_id" value="<?= (int) $recipe['id'] ?>">
                                            <input type="hidden" name="status" value="<?= $isPublished ? 'concept' : 'published' ?>">
                                            <input type="hidden" name="terug" value="admin.php">
                                            <button class="btn btn-outline btn-sm" type="submit"><?= $isPublished ? 'Zet op concept' : 'Publiceer' ?></button>
                                        </form>
                                        <a class="btn btn-outline btn-sm" href="recept.php?id=<?= (int) $recipe['id'] ?>">Bekijk</a>
                                        <a class="btn btn-outline btn-sm" href="nieuw-recept.php?id=<?= (int) $recipe['id'] ?>">Bewerk</a>
                                        <form action="actie.php" method="post" onsubmit="return confirm('Dit recept verwijderen?');">
                                            <?= csrf_field() ?>
                                            <input type="hidden" name="actie" value="verwijder_recept">
                                            <input type="hidden" name="recept_id" value="<?= (int) $recipe['id'] ?>">
                                            <input type="hidden" name="terug" value="admin.php">
                                            <button class="btn btn-danger btn-sm" type="submit">Verwijder</button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
<?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>

        <aside aria-labelledby="queue">
            <div class="section-heading">
                <h2 id="queue">Review-wachtrij</h2>
            </div>

            <div class="stats">
                <div class="stat stat-highlight">
                    <span class="stat-value"><?= (int) $conceptCount ?></span>
                    <span class="stat-label">Te controleren recepten</span>
                </div>
                <div class="stat">
                    <span class="stat-value"><?= (int) $publishedCount ?></span>
                    <span class="stat-label">Gepubliceerde recepten</span>
                </div>
                <div class="stat">
                    <span class="stat-value"><?= count($recipes) ?></span>
                    <span class="stat-label">Totaal aantal recepten</span>
                </div>
                <div class="stat">
                    <span class="stat-value"><?= count($users) ?></span>
                    <span class="stat-label">Geregistreerde gebruikers</span>
                </div>
            </div>
            <a href="nieuw-recept.php" class="btn btn-primary btn-block">Nieuw recept</a>
        </aside>
    </div>
</main>
