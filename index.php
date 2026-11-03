<?php
require __DIR__ . '/includes/bootstrap.php';

render('home', [
    'title' => 'GLR Food Freaks',
    'active' => 'home',
    'recipes' => recipes_featured(4),
]);
