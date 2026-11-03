<?php
require __DIR__ . '/includes/bootstrap.php';

if (!is_post()) {
    redirect('index.php');
}

csrf_check();
$user = require_login();

$back = safe_next($_POST['terug'] ?? '', 'dashboard.php');
$recipeId = (int) ($_POST['recept_id'] ?? 0);
$recipe = $recipeId ? recipe_find($recipeId) : null;

switch ($_POST['actie'] ?? '') {
    case 'favoriet':
        if ($recipe && can_view_recipe($recipe, $user)) {
            $added = toggle_favorite($user['id'], $recipeId);
            flash('success', $added ? 'Toegevoegd aan je favorieten.' : 'Verwijderd uit je favorieten.');
        }
        break;

    case 'reactie':
        $body = text_input($_POST, 'body');
        if ($recipe && $recipe['status'] === 'published' && $body !== '' && mb_strlen($body) <= 500) {
            db_query('INSERT INTO comments (recipe_id, user_id, body) VALUES (?, ?, ?)', [$recipeId, $user['id'], $body]);
            flash('success', 'Je reactie is geplaatst.');
        } else {
            flash('error', 'Je reactie moet tussen 1 en 500 tekens zijn.');
        }
        break;

    case 'beoordeling':
        $score = (int) ($_POST['score'] ?? 0);
        if ($recipe && $recipe['status'] === 'published' && $score >= 1 && $score <= 5) {
            save_rating($user['id'], $recipeId, $score);
            flash('success', 'Bedankt voor je beoordeling.');
        }
        break;

    case 'verwijder_recept':
        if ($recipe && can_edit_recipe($recipe, $user)) {
            delete_upload($recipe['image']);
            db_query('DELETE FROM recipes WHERE id = ?', [$recipeId]);
            flash('success', 'Recept verwijderd.');
        }
        break;

    case 'recept_status':
        if ($recipe && is_admin($user)) {
            $status = ($_POST['status'] ?? '') === 'published' ? 'published' : 'concept';
            db_query('UPDATE recipes SET status = ? WHERE id = ?', [$status, $recipeId]);
            flash('success', $status === 'published' ? 'Recept gepubliceerd.' : 'Recept op concept gezet.');
        }
        break;

    case 'maak_admin':
    case 'verwijder_gebruiker':
        $targetId = (int) ($_POST['gebruiker_id'] ?? 0);
        if (!is_admin($user) || $targetId === (int) $user['id']) {
            break;
        }
        if ($_POST['actie'] === 'maak_admin') {
            db_query("UPDATE users SET role = 'admin' WHERE id = ?", [$targetId]);
            flash('success', 'Gebruiker is nu admin.');
        } else {
            foreach (recipes_by_user($targetId) as $own) {
                delete_upload($own['image']);
            }
            db_query('DELETE FROM users WHERE id = ?', [$targetId]);
            flash('success', 'Gebruiker verwijderd.');
        }
        break;
}

redirect($back);
