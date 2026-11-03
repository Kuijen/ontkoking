<?php

function recipe_select()
{
    return "SELECT r.*, c.name AS category, u.username AS author,
                   COALESCE((SELECT ROUND(AVG(score)) FROM ratings WHERE recipe_id = r.id), 0) AS rating,
                   (SELECT GROUP_CONCAT(i.name SEPARATOR ' ')
                      FROM recipe_ingredients ri
                      JOIN ingredients i ON i.id = ri.ingredient_id
                     WHERE ri.recipe_id = r.id) AS search_text
              FROM recipes r
              JOIN categories c ON c.id = r.category_id
              JOIN users u ON u.id = r.user_id ";
}

function recipes_published($tag = '')
{
    $where = "r.status = 'published'";
    $params = [];

    if ($tag === 'vega') {
        $where .= " AND c.name = 'Vega'";
    } elseif ($tag === 'snel') {
        $where .= ' AND r.minutes <= 25';
    } elseif (isset(LABELS[$tag])) {
        $where .= " AND CONCAT(' ', r.tags, ' ') LIKE ?";
        $params[] = '% ' . $tag . ' %';
    }

    return db_query(recipe_select() . "WHERE $where ORDER BY r.id DESC", $params)->fetchAll();
}

function recipes_featured($limit = 4)
{
    $sql = recipe_select() . "WHERE r.status = 'published' ORDER BY rating DESC, r.id DESC LIMIT " . (int) $limit;
    return db_query($sql)->fetchAll();
}

function recipes_all()
{
    return db_query(recipe_select() . 'ORDER BY r.id DESC')->fetchAll();
}

function recipes_by_user($userId)
{
    return db_query(recipe_select() . 'WHERE r.user_id = ? ORDER BY r.id DESC', [$userId])->fetchAll();
}

function recipes_favorited_by($userId)
{
    $sql = recipe_select() . "JOIN favorites f ON f.recipe_id = r.id
                              WHERE f.user_id = ? AND r.status = 'published'
                              ORDER BY r.id DESC";
    return db_query($sql, [$userId])->fetchAll();
}

function recipes_from_others($userId, $limit = 5)
{
    $sql = recipe_select() . "WHERE r.status = 'published' AND r.user_id != ? ORDER BY r.id DESC LIMIT " . (int) $limit;
    return db_query($sql, [$userId])->fetchAll();
}

function recipe_find($id)
{
    return db_query(recipe_select() . 'WHERE r.id = ?', [$id])->fetch() ?: null;
}

function recipe_ingredients($id)
{
    $sql = 'SELECT ri.amount, i.name
              FROM recipe_ingredients ri
              JOIN ingredients i ON i.id = ri.ingredient_id
             WHERE ri.recipe_id = ?
             ORDER BY ri.sort_order';
    return db_query($sql, [$id])->fetchAll();
}

function recipe_steps($id)
{
    return db_query('SELECT description FROM steps WHERE recipe_id = ? ORDER BY sort_order', [$id])
        ->fetchAll(PDO::FETCH_COLUMN);
}

function recipe_comments($id)
{
    $sql = 'SELECT c.body, u.username
              FROM comments c
              JOIN users u ON u.id = c.user_id
             WHERE c.recipe_id = ?
             ORDER BY c.id';
    return db_query($sql, [$id])->fetchAll();
}

function can_view_recipe(array $recipe, $user)
{
    return $recipe['status'] === 'published' || can_edit_recipe($recipe, $user);
}

function can_edit_recipe(array $recipe, $user)
{
    return $user && ($user['id'] == $recipe['user_id'] || is_admin($user));
}

function is_favorite($userId, $recipeId)
{
    $stmt = db_query('SELECT 1 FROM favorites WHERE user_id = ? AND recipe_id = ?', [$userId, $recipeId]);
    return (bool) $stmt->fetchColumn();
}

function toggle_favorite($userId, $recipeId)
{
    if (is_favorite($userId, $recipeId)) {
        db_query('DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?', [$userId, $recipeId]);
        return false;
    }
    db_query('INSERT INTO favorites (user_id, recipe_id) VALUES (?, ?)', [$userId, $recipeId]);
    return true;
}

function user_rating($userId, $recipeId)
{
    $stmt = db_query('SELECT score FROM ratings WHERE user_id = ? AND recipe_id = ?', [$userId, $recipeId]);
    return (int) $stmt->fetchColumn();
}

function save_rating($userId, $recipeId, $score)
{
    db_query(
        'INSERT INTO ratings (user_id, recipe_id, score) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE score = VALUES(score)',
        [$userId, $recipeId, $score]
    );
}

function recipe_save($id, $userId, array $d)
{
    $pdo = db();
    $pdo->beginTransaction();

    try {
        if ($id === null) {
            db_query(
                'INSERT INTO recipes (user_id, category_id, title, description, image, minutes, diet, tags, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [$userId, $d['category_id'], $d['title'], $d['description'], $d['image'],
                 $d['minutes'], $d['diet'], $d['tags'], $d['status']]
            );
            $id = (int) $pdo->lastInsertId();
        } else {
            db_query(
                'UPDATE recipes
                    SET category_id = ?, title = ?, description = ?, image = COALESCE(?, image),
                        minutes = ?, diet = ?, tags = ?, status = ?
                  WHERE id = ?',
                [$d['category_id'], $d['title'], $d['description'], $d['image'],
                 $d['minutes'], $d['diet'], $d['tags'], $d['status'], $id]
            );
            db_query('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [$id]);
            db_query('DELETE FROM steps WHERE recipe_id = ?', [$id]);
        }

        foreach ($d['ingredients'] as $position => $row) {
            db_query('INSERT IGNORE INTO ingredients (name) VALUES (?)', [$row['name']]);
            $ingredientId = db_query('SELECT id FROM ingredients WHERE name = ?', [$row['name']])->fetchColumn();
            db_query(
                'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, sort_order) VALUES (?, ?, ?, ?)',
                [$id, $ingredientId, $row['amount'], $position]
            );
        }

        foreach ($d['steps'] as $position => $text) {
            db_query(
                'INSERT INTO steps (recipe_id, sort_order, description) VALUES (?, ?, ?)',
                [$id, $position + 1, $text]
            );
        }

        $pdo->commit();
    } catch (Throwable $ex) {
        $pdo->rollBack();
        throw $ex;
    }

    return $id;
}
