<?php
require __DIR__ . '/includes/bootstrap.php';

$next = safe_next($_GET['next'] ?? $_POST['next'] ?? '');

if (current_user()) {
    redirect($next);
}

$errors = ['login' => '', 'register' => ''];
$old = ['username' => '', 'new_username' => ''];

if (is_post()) {
    csrf_check();

    if (($_POST['form'] ?? '') === 'login') {
        $old['username'] = text_input($_POST, 'username');
        $password = is_string($_POST['password'] ?? null) ? $_POST['password'] : '';
        $found = $old['username'] !== '' ? find_user($old['username']) : null;

        if ($old['username'] === '' || $password === '') {
            $errors['login'] = 'Vul je gebruikersnaam en wachtwoord in.';
        } elseif (!$found || !password_verify($password, $found['password_hash'])) {
            $errors['login'] = 'Gebruikersnaam of wachtwoord klopt niet.';
        } else {
            login_user($found['id']);
            redirect($next);
        }
    } else {
        $old['new_username'] = text_input($_POST, 'new_username');
        $password = is_string($_POST['new_password'] ?? null) ? $_POST['new_password'] : '';
        $confirm = is_string($_POST['confirm'] ?? null) ? $_POST['confirm'] : '';

        if (mb_strlen($old['new_username']) < 3) {
            $errors['register'] = 'Kies een gebruikersnaam van minimaal 3 tekens.';
        } elseif (mb_strlen($old['new_username']) > 30) {
            $errors['register'] = 'Een gebruikersnaam mag maximaal 30 tekens zijn.';
        } elseif (find_user($old['new_username'])) {
            $errors['register'] = 'Deze gebruikersnaam is al in gebruik.';
        } elseif (strlen($password) < 6) {
            $errors['register'] = 'Je wachtwoord moet minimaal 6 tekens hebben.';
        } elseif ($password !== $confirm) {
            $errors['register'] = 'De wachtwoorden zijn niet hetzelfde.';
        } else {
            login_user(create_user($old['new_username'], $password));
            redirect($next);
        }
    }
}

render('login', [
    'title' => 'Inloggen – Food Freaks',
    'bare' => true,
    'next' => $next,
    'errors' => $errors,
    'old' => $old,
]);
