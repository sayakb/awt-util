<?php
/**
* Automatic Web Testing Utility
* @ver 0.1
* @license BSD License - www.opensource.org/licenses/bsd-license.php
*
* Copyright (c) 2013 Sayak Banerjee <mail@sayakbanerjee.com>
* All rights reserved. Do not remove this copyright notice.
*/

define('IN_IO', true);

// Include headers
require('constants.php');
require('helpers.php');

// Get POSTed data
$action = http_var('action', '');
$profile = http_var('profile', '');
$data = http_var('data', '');

// Get the profile path
$profile_dir = realpath('../../profiles/');
$profile_src = "{$profile_dir}/{$profile}.awt";

// Check for mandatory params
switch($action)
{
    case 'load':
        // Kill the session if file was specified or not found
        validate_session(empty($profile), STATUS_NO_DATA);
        validate_session(!file_exists($profile_src), STATUS_IO_ERROR);

        // Read the profile data from the file
        $profile_data = file_get_contents($profile_src);
        validate_session(empty($profile_data), STATUS_IO_ERROR);

        // Output the file contents
        create_response($profile_data);
        break;

    case 'save':
        // Kill the session if missing data or file already exists
        validate_session(empty($profile) || empty($data), STATUS_NO_DATA);
        validate_session(file_exists($profile_src), STATUS_FILE_EXISTS);

        // Create the profile
        $status = file_put_contents($profile_src, $data, LOCK_EX);
        validate_session($status === false, STATUS_IO_ERROR);

        // Output success message
        $response = array('statusCode' => STATUS_SUCCESS);
        create_response($response);
        break;

    case 'delete':
        // Kill the session if file was specified or not found
        validate_session(empty($profile), STATUS_NO_DATA);
        validate_session(!file_exists($profile_src), STATUS_IO_ERROR);

        // Delete the file
        $status = unlink($profile_src);
        validate_session($status === false, STATUS_IO_ERROR);

        // Output success message
        $response = array('statusCode' => STATUS_SUCCESS);
        create_response($response);
        break;

    case 'list':
        // Get the file list in the profiles dir
        $files = scandir($profile_dir);
        validate_session($files === false, STATUS_IO_ERROR);

        // Remove non-profile files from the array
        $files_out = array();

        foreach ($files as $file)
        {
            $extension = pathinfo($file, PATHINFO_EXTENSION);

            if ($extension == 'awt')
            {
                $files_out[] = $file;
            }
        }

        // Output the profile list
        $response = array(
            'statusCode' => STATUS_SUCCESS,
            'profiles'   => $files_out
        );

        create_response($response);
        break;
}

// No data returned
validate_session(true, STATUS_NO_DATA);

?>