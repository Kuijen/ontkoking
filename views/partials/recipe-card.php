<article class="card recipe-card"<?php if (!empty($withData)): ?>
 data-category="<?= e($recipe['category']) ?>"
 data-minutes="<?= (int) $recipe['minutes'] ?>"
 data-rating="<?= (int) $recipe['rating'] ?>"
 data-diet="<?= e($recipe['diet']) ?>"
 data-newest="<?= (int) $recipe['id'] ?>"
 data-search="<?= e($recipe['search_text']) ?>"<?php endif; ?>>
    <a class="recipe-link" href="recept.php?id=<?= (int) $recipe['id'] ?>">
<?php if ($recipe['image']): ?>
        <img class="recipe-img" src="<?= e($recipe['image']) ?>" alt="<?= e($recipe['title']) ?>" loading="lazy">
<?php else: ?>
        <div class="recipe-img"></div>
<?php endif; ?>
        <div class="recipe-info">
            <span class="badge badge-soft"><?= e($recipe['category']) ?></span>
            <h3 class="recipe-title"><?= e($recipe['title']) ?></h3>
            <span class="stars" role="img" aria-label="<?= (int) $recipe['rating'] ?> van 5 sterren"><?= stars($recipe['rating']) ?></span>
            <p class="recipe-meta"><?= (int) $recipe['minutes'] ?> min</p>
        </div>
    </a>
</article>
