<?php
require __DIR__ . '/includes/bootstrap.php';

$categories = db_query('SELECT id, name FROM categories ORDER BY id')->fetchAll();

render('recipes', [
    'title' => 'Recepten – Food Freaks',
    'active' => 'recepten',
    'scripts' => ['filters.js'],
    'recipes' => recipes_published(text_input($_GET, 'tag')),
    'categories' => $categories,
    'q' => text_input($_GET, 'q'),
]);
