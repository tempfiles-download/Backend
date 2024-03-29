<?php

use com\carlgo11\tempfiles\datastorage\DataStorage;

require __DIR__ . '/src/com/carlgo11/tempfiles/autoload.php';

function return404() {
	$notFoundURL = filter_input(INPUT_ENV, 'TMP_404_URL', FILTER_VALIDATE_URL, ['options' => ['default' => 'https://tempfiles.download/download/?404=1']]);
	header($_SERVER['SERVER_PROTOCOL'] . " 404 File Not Found");
	header("Location: $notFoundURL");
	exit;
}

$url = explode('/', $_SERVER['REQUEST_URI']);
$id = filter_var(strtoupper($url[1]), FILTER_VALIDATE_REGEXP, ['options' => ['regexp' => '/^D([0-9]|[A-Z]){14}/']]);
$password = filter_var($url[2]);
if (is_null($password)|| is_null($id)) die("Missing ID or password.");
try {
	$file = DataStorage::getFile($id, $password);
} catch (Exception $ex) {
	return404();
}

$metadata = $file->getMetaData();

if ($file->getMaxViews()) { // max views > 0
	if ($file->getMaxViews() <= $file->getCurrentViews() + 1) DataStorage::deleteFile($id);
	else DataStorage::updateViews($id, $file->getCurrentViews() + 1);
}

// Set headers
header("Content-Description: File Transfer");
header("Expires: 0");
header("Pragma: public");
header("Content-Type: {$metadata['type']}");
header("Content-Disposition: inline; filename=\"{$metadata['name']}\"");
header("Content-Length: {$metadata['size']}");

// output file contents
echo $file->getContent();
