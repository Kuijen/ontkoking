<?php

function current_user()
{
    static $cache = [];

    if (empty($_SESSION['user_id'])) {
        return null;
    }

    $id = (int) $_SESSION['user_id'];
    if (!array_key_exists($id, $cache)) {
        $stmt = db_query('SELECT id, username, role FROM users WHERE id = ?', [$id]);
        $cache[$id] = $stmt->fetch() ?: null;
    }
    if ($cache[$id] === null) {
        unset($_SESSION['user_id']);
    }

    return $cache[$id];
}

function is_admin($user)
{
    return $user && $user['role'] === 'admin';
}

function require_login()
{
    $user = current_user();
    if (!$user) {
        $page = basename($_SERVER['SCRIPT_NAME']);
        if (!empty($_SERVER['QUERY_STRING'])) {
            $page .= '?' . $_SERVER['QUERY_STRING'];
        }
        redirect('login.php?next=' . urlencode($page));
    }
    return $user;
}

function require_admin()
{
    $user = require_login();
    if (!is_admin($user)) {
        redirect('index.php');
    }
    return $user;
}

function find_user($username)
{
    return db_query('SELECT * FROM users WHERE username = ?', [$username])->fetch() ?: null;
}

function create_user($username, $password)
{
    db_query(
        'INSERT INTO users (username, password_hash) VALUES (?, ?)',
        [$username, password_hash($password, PASSWORD_DEFAULT)]
    );
    return (int) db()->lastInsertId();
}

function login_user($userId)
{
    session_regenerate_id(true);
    $_SESSION['user_id'] = (int) $userId;
}

function logout_user()
{
    $_SESSION = [];
    session_destroy();
}
