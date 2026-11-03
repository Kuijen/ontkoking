<?php

function config($key)
{
    static $config = null;
    if ($config === null) {
        $config = require __DIR__ . '/config.php';
    }
    return $config[$key];
}

function db()
{
    static $pdo = null;

    if ($pdo === null) {
        $dsn = 'mysql:host=' . config('db_host') . ';dbname=' . config('db_name') . ';charset=utf8mb4';

        try {
            $pdo = new PDO($dsn, config('db_user'), config('db_pass'), [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $ex) {
            http_response_code(500);
            exit('Geen verbinding met de database. Controleer config/config.php.');
        }
    }

    return $pdo;
}

function db_query($sql, $params = [])
{
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return $stmt;
}
