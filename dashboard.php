<?php
require __DIR__ . '/includes/bootstrap.php';

$user = require_login();
$mine = recipes_by_user($user['id']);
$favorites = recipes_favorited_by($user['id']);

$concepts = array_filter($mine, function ($recipe) {
    return $recipe['status'] === 'concept';
});

render('dashboard', [
    'title' => 'Mijn keuken – Food Freaks',
    'active' => 'keuken',
    'mine' => $mine,
    'favorites' => $favorites,
    'conceptCount' => count($concepts),
    'community' => recipes_from_others($user['id'], 5),
]);
