<?php
$back = 'recept.php?id=' . (int) $recipe['id'];
$published = $recipe['status'] === 'published';
?>
<section class="page-hero">
    <div class="page-hero-inner">
        <a class="back-link" href="recepten.php">Terug naar recepten</a>
        <h1><?= e($recipe['title']) ?></h1>
<?php if ($recipe['description'] !== ''): ?>
        <p><?= e($recipe['description']) ?></p>
<?php endif; ?>
    </div>
</section>

<main id="main" class="container">
    <article class="detail">

        <aside class="detail-side" aria-label="Receptinformatie">
<?php if ($recipe['image']): ?>
            <img class="detail-img" src="<?= e($recipe['image']) ?>" alt="Foto van <?= e(strtolower($recipe['title'])) ?>">
<?php endif; ?>

            <div class="meta-list">
                <span class="badge badge-soft"><?= (int) $recipe['minutes'] ?> min</span>
                <span class="badge badge-soft"><?= e($recipe['category']) ?></span>
<?php if (!$published): ?>
                <span class="badge badge-muted">Concept</span>
<?php endif; ?>
<?php foreach (words($recipe['diet']) as $diet): ?>
                <span class="badge badge-accent"><?= e($diet) ?></span>
<?php endforeach; ?>
            </div>

            <div class="author">
                <span class="avatar" aria-hidden="true"><?= e(initial($recipe['author'])) ?></span>
                <div>
                    <p class="author-name"><?= e($recipe['author']) ?></p>
                    <p class="recipe-meta">Auteur</p>
                </div>
            </div>

<?php if ($published): ?>
<?php if ($user): ?>
            <form action="actie.php" method="post">
                <?= csrf_field() ?>
                <input type="hidden" name="actie" value="favoriet">
                <input type="hidden" name="recept_id" value="<?= (int) $recipe['id'] ?>">
                <input type="hidden" name="terug" value="<?= e($back) ?>">
                <button class="btn btn-primary btn-block" type="submit">
                    <?= $isFavorite ? 'Verwijder uit favorieten' : 'Opslaan in favorieten' ?>
                </button>
            </form>
<?php else: ?>
            <a class="btn btn-primary btn-block" href="login.php?next=<?= urlencode($back) ?>">Log in om op te slaan</a>
<?php endif; ?>
<?php endif; ?>
<?php if ($canEdit): ?>
            <a class="btn btn-outline btn-block" href="nieuw-recept.php?id=<?= (int) $recipe['id'] ?>">Recept bewerken</a>
<?php endif; ?>
        </aside>

        <div class="detail-main">
            <h1><?= e($recipe['title']) ?></h1>
            <span class="stars" role="img" aria-label="<?= (int) $recipe['rating'] ?> van 5 sterren"><?= stars($recipe['rating']) ?></span>

<?php if ($published && $user): ?>
            <form class="comment-form" action="actie.php" method="post">
                <?= csrf_field() ?>
                <input type="hidden" name="actie" value="beoordeling">
                <input type="hidden" name="recept_id" value="<?= (int) $recipe['id'] ?>">
                <input type="hidden" name="terug" value="<?= e($back) ?>">
                <label class="visually-hidden" for="score">Jouw beoordeling</label>
                <select class="input" id="score" name="score">
<?php for ($i = 5; $i >= 1; $i--): ?>
                    <option value="<?= $i ?>"<?= $myRating === $i ? ' selected' : '' ?>><?= $i ?> van 5 sterren</option>
<?php endfor; ?>
                </select>
                <button class="btn btn-outline btn-sm" type="submit">Beoordeel</button>
            </form>
<?php endif; ?>

            <section aria-labelledby="ingredientsTitle">
                <h2 id="ingredientsTitle">Ingrediënten</h2>
                <ul class="checklist">
<?php foreach ($ingredients as $item): ?>
                    <li>
                        <label class="check">
                            <input type="checkbox">
                            <span><?= e(trim($item['amount'] . ' ' . $item['name'])) ?></span>
                        </label>
                    </li>
<?php endforeach; ?>
                </ul>
            </section>

            <section aria-labelledby="stepsTitle">
                <h2 id="stepsTitle">Bereidingsstappen</h2>
                <ol class="step-list">
<?php foreach ($steps as $step): ?>
                    <li><?= e($step) ?></li>
<?php endforeach; ?>
                </ol>
            </section>

<?php if ($published): ?>
            <section aria-labelledby="commentsTitle">
                <h2 id="commentsTitle">Reacties</h2>

<?php foreach ($comments as $comment): ?>
                <div class="comment">
                    <span class="avatar" aria-hidden="true"><?= e(initial($comment['username'])) ?></span>
                    <div>
                        <p class="comment-name"><?= e($comment['username']) ?></p>
                        <p class="comment-text"><?= e($comment['body']) ?></p>
                    </div>
                </div>
<?php endforeach; ?>
<?php if (!$comments): ?>
                <p class="muted">Nog geen reacties.</p>
<?php endif; ?>

<?php if ($user): ?>
                <form class="comment-form" action="actie.php" method="post">
                    <?= csrf_field() ?>
                    <input type="hidden" name="actie" value="reactie">
                    <input type="hidden" name="recept_id" value="<?= (int) $recipe['id'] ?>">
                    <input type="hidden" name="terug" value="<?= e($back) ?>">
                    <label class="visually-hidden" for="commentInput">Schrijf een reactie</label>
                    <input class="input" id="commentInput" name="body" type="text" maxlength="500" placeholder="Schrijf een reactie…" required>
                    <button class="btn btn-primary" type="submit">Plaatsen</button>
                </form>
<?php else: ?>
                <p class="muted"><a href="login.php?next=<?= urlencode($back) ?>">Log in</a> om te reageren.</p>
<?php endif; ?>
            </section>
<?php endif; ?>
        </div>

    </article>
</main>
