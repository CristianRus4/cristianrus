<?php
header('Content-Type: application/json');

// Your intervals.icu API key
$apiKey = '49clsz0uj28l1siice0biswv7';

$url = 'https://intervals.icu/api/v1/user';
$options = array(
  'http' => array(
    'header'  => "Authorization: Bearer $apiKey"
  )
);
$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);

echo $response;
?>