<?php
require 'api/bootstrap.php';
$banks = \App\Core\Database::fetchAll("SELECT * FROM bank_accounts");
print_r($banks);
