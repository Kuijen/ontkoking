<?php
$title = $title ?? 'GLR Food Freaks';
$active = $active ?? '';
$bare = $bare ?? false;
$scripts = $scripts ?? [];
$messages = flash_pull();

$nav = [
    'home' => ['index.php', 'Home'],
    'recepten' => ['recepten.php', 'Recepten'],
    'toevoegen' => ['nieuw-recept.php', 'Toevoegen'],
    'keuken' => ['dashboard.php', 'Mijn keuken'],
];
?>
<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="dark light">
    <title><?= e($title) ?></title>

    <link rel="stylesheet" href="css/style.css">

    <script src="js/theme.js"></script>
<?php foreach ($scripts as $script): ?>
    <script src="js/<?= e($script) ?>" defer></script>
<?php endforeach; ?>
</head>
<body>

<?php if (!$bare): ?>
    <a class="skip-link" href="#main">Naar de inhoud</a>

    <header class="site-header">
        <div class="header-inner">
            <a class="brand" href="index.php">GLR <span>Food Freaks</span></a>

            <input class="nav-check" type="checkbox" id="menu" aria-label="Menu openen">
            <label class="nav-toggle" for="menu" aria-hidden="true">☰</label>

            <nav class="site-nav" aria-label="Hoofdmenu">
                <ul class="nav-links">
<?php foreach ($nav as $key => [$href, $label]): ?>
                    <li><a href="<?= $href ?>"<?= $active === $key ? ' aria-current="page"' : '' ?>><?= $label ?></a></li>
<?php endforeach; ?>
<?php if (is_admin($user)): ?>
                    <li><a href="admin.php"<?= $active === 'admin' ? ' aria-current="page"' : '' ?>>Admin</a></li>
<?php endif; ?>
                </ul>
                <div class="nav-user">
<?php if ($user): ?>
                    <span>
                        <?= e($user['username']) ?>
<?php if (is_admin($user)): ?>
                        <span class="badge badge-accent">admin</span>
<?php endif; ?>
                    </span>
                    <form action="logout.php" method="post">
                        <?= csrf_field() ?>
                        <button class="btn btn-outline btn-sm" type="submit">Uitloggen</button>
                    </form>
<?php else: ?>
                    <a class="btn btn-outline btn-sm" href="login.php">Inloggen</a>
<?php endif; ?>
                </div>
            </nav>
        </div>
    </header>
<?php endif; ?>

<?php if ($messages): ?>
    <div class="toast-stack" role="status">
<?php foreach ($messages as [$type, $text]): ?>
        <div class="toast toast-<?= e($type) ?>"><?= e($text) ?></div>
<?php endforeach; ?>
    </div>
<?php endif; ?>
