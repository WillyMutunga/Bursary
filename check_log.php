<?php

/**
 * Diagnostic tool: Read recent lines from backend/storage/logs/laravel.log
 * URL: https://bursary.skysoftsystems.co.ke/check_log.php
 */

header('Content-Type: text/plain; charset=utf-8');

$possibleLogPaths = [
    __DIR__ . '/backend/storage/logs/laravel.log',
    __DIR__ . '/../backend/storage/logs/laravel.log',
    __DIR__ . '/storage/logs/laravel.log',
    __DIR__ . '/../storage/logs/laravel.log',
];

$logFile = null;
foreach ($possibleLogPaths as $p) {
    if (file_exists($p)) {
        $logFile = $p;
        break;
    }
}

if (!$logFile) {
    die("laravel.log not found in searched paths: " . implode(', ', $possibleLogPaths));
}

$lines = file($logFile);
$total = count($lines);
$slice = array_slice($lines, max(0, $total - 80));

echo "=== LAST 80 LINES OF LARAVEL.LOG (Total: {$total} lines) ===" . PHP_EOL . PHP_EOL;
echo implode("", $slice);
