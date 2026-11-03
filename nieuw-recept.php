<?php
require __DIR__ . '/includes/bootstrap.php';

$user = require_login();
$id = (int) ($_GET['id'] ?? 0);
$existing = null;

if ($id) {
    $existing = recipe_find($id);
    if (!$existing || !can_edit_recipe($existing, $user)) {
        not_found();
    }
}

$categories = db_query('SELECT id, name FROM categories ORDER BY id')->fetchAll();
$errors = [];

if ($existing) {
    $form = [
        'title' => $existing['title'],
        'description' => $existing['description'],
        'category_id' => (int) $existing['category_id'],
        'minutes' => (int) $existing['minutes'],
        'diet' => words($existing['diet']),
        'tags' => words($existing['tags']),
        'ingredients' => array_map(function ($row) {
            return ['amount' => $row['amount'], 'name' => $row['name']];
        }, recipe_ingredients($id)),
        'steps' => recipe_steps($id),
    ];
} else {
    $form = [
        'title' => '', 'description' => '', 'category_id' => 0, 'minutes' => '',
        'diet' => [], 'tags' => [], 'ingredients' => [], 'steps' => [],
    ];
}

if (is_post()) {
    csrf_check();

    $form['title'] = text_input($_POST, 'title');
    $form['description'] = text_input($_POST, 'description');
    $form['category_id'] = (int) ($_POST['category_id'] ?? 0);
    $form['minutes'] = (int) ($_POST['minutes'] ?? 0);
    $form['diet'] = array_values(array_intersect(array_keys(DIETS), (array) ($_POST['diet'] ?? [])));
    $form['tags'] = array_values(array_intersect(array_keys(LABELS), (array) ($_POST['tag'] ?? [])));

    $form['ingredients'] = [];
    $amounts = (array) ($_POST['amount'] ?? []);
    foreach ((array) ($_POST['ingredient'] ?? []) as $i => $name) {
        $name = is_string($name) ? trim($name) : '';
        $amount = isset($amounts[$i]) && is_string($amounts[$i]) ? trim($amounts[$i]) : '';
        if ($name !== '') {
            $form['ingredients'][] = ['amount' => $amount, 'name' => $name];
        }
    }

    $form['steps'] = [];
    foreach ((array) ($_POST['step'] ?? []) as $text) {
        $text = is_string($text) ? trim($text) : '';
        if ($text !== '') {
            $form['steps'][] = $text;
        }
    }

    $validCategory = in_array($form['category_id'], array_map('intval', array_column($categories, 'id')), true);

    if ($form['title'] === '' || mb_strlen($form['title']) > 120) {
        $errors[] = 'Geef het recept een titel van maximaal 120 tekens.';
    }
    if (mb_strlen($form['description']) > 200) {
        $errors[] = 'De korte omschrijving mag maximaal 200 tekens zijn.';
    }
    if (!$validCategory) {
        $errors[] = 'Kies een categorie.';
    }
    if ($form['minutes'] < 1 || $form['minutes'] > 1000) {
        $errors[] = 'Vul een bereidingstijd in tussen 1 en 1000 minuten.';
    }
    if (!$form['ingredients']) {
        $errors[] = 'Voeg minimaal één ingrediënt toe.';
    }
    if (!$form['steps']) {
        $errors[] = 'Voeg minimaal één bereidingsstap toe.';
    }

    [$image, $uploadError] = store_upload($_FILES['image'] ?? ['error' => UPLOAD_ERR_NO_FILE]);
    if ($uploadError) {
        $errors[] = $uploadError;
    }

    if (!$errors) {
        $status = ($_POST['status'] ?? '') === 'published' ? 'published' : 'concept';

        $savedId = recipe_save($existing ? $id : null, $existing ? $existing['user_id'] : $user['id'], [
            'category_id' => $form['category_id'],
            'title' => $form['title'],
            'description' => $form['description'],
            'image' => $image,
            'minutes' => $form['minutes'],
            'diet' => implode(' ', $form['diet']),
            'tags' => implode(' ', $form['tags']),
            'status' => $status,
            'ingredients' => $form['ingredients'],
            'steps' => $form['steps'],
        ]);

        if ($image && $existing) {
            delete_upload($existing['image']);
        }

        flash('success', $status === 'published' ? 'Recept gepubliceerd.' : 'Recept opgeslagen als concept.');
        redirect($status === 'published' ? 'recept.php?id=' . $savedId : 'dashboard.php');
    }

    delete_upload($image);
}

while (count($form['ingredients']) < 3) {
    $form['ingredients'][] = ['amount' => '', 'name' => ''];
}
while (count($form['steps']) < 2) {
    $form['steps'][] = '';
}

render('recipe-form', [
    'title' => ($existing ? 'Recept bewerken' : 'Nieuw recept') . ' – Food Freaks',
    'active' => 'toevoegen',
    'scripts' => ['recept-form.js'],
    'existing' => $existing,
    'form' => $form,
    'categories' => $categories,
    'errors' => $errors,
]);
