<?php
require __DIR__ . '/includes/bootstrap.php';

if (is_post()) {
    csrf_check();
    logout_user();
    redirect('login.php');
}

redirect('index.php');
