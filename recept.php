<?php
require __DIR__ . '/includes/bootstrap.php';

$user = current_user();
$recipe = recipe_find((int) ($_GET['id'] ?? 0));

if (!$recipe || !can_view_recipe($recipe, $user)) {
    not_found();
}

$id = (int) $recipe['id'];

render('recipe-detail', [
    'title' => $recipe['title'] . ' – Food Freaks',
    'active' => 'recepten',
    'recipe' => $recipe,
    'ingredients' => recipe_ingredients($id),
    'steps' => recipe_steps($id),
    'comments' => recipe_comments($id),
    'isFavorite' => $user ? is_favorite($user['id'], $id) : false,
    'myRating' => $user ? user_rating($user['id'], $id) : 0,
    'canEdit' => can_edit_recipe($recipe, $user),
]);
