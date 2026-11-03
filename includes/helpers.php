<?php

const DIETS = ['glutenvrij' => 'Glutenvrij', 'lactosevrij' => 'Lactosevrij', 'vegan' => 'Vegan'];
const LABELS = ['budget' => 'Budget', 'diner' => 'Diner'];

function e($value)
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function is_post()
{
    return $_SERVER['REQUEST_METHOD'] === 'POST';
}

function redirect($to)
{
    header('Location: ' . $to);
    exit;
}

function text_input(array $source, $key)
{
    $value = $source[$key] ?? '';
    return is_string($value) ? trim($value) : '';
}

function words($text)
{
    return array_values(array_filter(explode(' ', (string) $text)));
}

function stars($score)
{
    $score = max(0, min(5, (int) $score));
    return str_repeat('★', $score) . str_repeat('☆', 5 - $score);
}

function initial($name)
{
    return mb_strtoupper(mb_substr((string) $name, 0, 1));
}

function safe_next($next, $fallback = 'index.php')
{
    if (is_string($next) && preg_match('/^[a-z-]+\.php(\?[A-Za-z0-9=&_%-]*)?$/', $next)) {
        return $next;
    }
    return $fallback;
}

function flash($type, $message)
{
    $_SESSION['flash'][] = [$type, $message];
}

function flash_pull()
{
    $messages = $_SESSION['flash'] ?? [];
    unset($_SESSION['flash']);
    return $messages;
}

function csrf_token()
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function csrf_field()
{
    return '<input type="hidden" name="csrf" value="' . csrf_token() . '">';
}

function csrf_check()
{
    $sent = $_POST['csrf'] ?? '';
    if (!is_string($sent) || !hash_equals($_SESSION['csrf'] ?? '', $sent)) {
        http_response_code(400);
        exit('Ongeldig formulier. Ga terug, ververs de pagina en probeer het opnieuw.');
    }
}

function render($view, array $data = [])
{
    extract($data);
    $user = current_user();

    require __DIR__ . '/../views/partials/header.php';
    require __DIR__ . '/../views/' . $view . '.php';
    require __DIR__ . '/../views/partials/footer.php';
}

function not_found()
{
    http_response_code(404);
    render('not-found', ['title' => 'Niet gevonden – Food Freaks']);
    exit;
}

function store_upload(array $file)
{
    $types = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];

    if ($file['error'] === UPLOAD_ERR_NO_FILE) {
        return [null, null];
    }
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return [null, 'Het uploaden van de afbeelding is mislukt.'];
    }
    if ($file['size'] > config('max_upload_bytes')) {
        return [null, 'De afbeelding is te groot (maximaal 5 MB).'];
    }

    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    if (!isset($types[$mime])) {
        return [null, 'Kies een jpg, png of webp afbeelding.'];
    }

    $dir = config('upload_dir');
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }

    $name = bin2hex(random_bytes(8)) . '.' . $types[$mime];
    if (!move_uploaded_file($file['tmp_name'], $dir . '/' . $name)) {
        return [null, 'De afbeelding kon niet worden opgeslagen.'];
    }

    return ['img/uploads/' . $name, null];
}

function delete_upload($path)
{
    if (is_string($path) && strpos($path, 'img/uploads/') === 0) {
        $file = dirname(config('upload_dir'), 2) . '/' . $path;
        if (is_file($file)) {
            unlink($file);
        }
    }
}
