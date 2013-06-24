<?php
/**
* Automatic Web Testing Utility
* @ver 0.1
* @license BSD License - www.opensource.org/licenses/bsd-license.php
*
* Copyright (c) 2013 Sayak Banerjee <mail@sayakbanerjee.com>
* All rights reserved. Do not remove this copyright notice.
*/

// Hierarcy check
if (!defined('IN_IO'))
{
    exit('Script access not allowed');
}

// Response status codes
define('STATUS_NO_DATA', 100);
define('STATUS_IO_ERROR', 150);
define('STATUS_FILE_EXISTS', 200);
define('STATUS_SUCCESS', 500);

?>