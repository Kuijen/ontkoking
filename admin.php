<?php
require __DIR__ . '/includes/bootstrap.php';

$user = require_admin();
$recipes = recipes_all();

$published = count(array_filter($recipes, function ($recipe) {
    return $recipe['status'] === 'published';
}));

render('admin', [
    'title' => 'Beheer – Food Freaks',
    'active' => 'admin',
    'users' => db_query('SELECT id, username, role FROM users ORDER BY id')->fetchAll(),
    'recipes' => $recipes,
    'publishedCount' => $published,
    'conceptCount' => count($recipes) - $published,
]);
