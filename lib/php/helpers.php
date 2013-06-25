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
if (!defined('IN_SCRIPT'))
{
	exit('Script access not allowed');
}

/**
* Function to generate a JSON output
*
* @param data	Data to be encoded to JSON
* @returns		void
*/
function create_response($data)
{
	if (gettype($data) == 'array')
	{
		$data = json_encode($data);
	}

	exit($data);
}

/**
* Function for validating and ending session
*
* @param condition		Condition when true should kill the session
* @param status_code	Status code to return if condition is false
* @returns				void
*/
function validate_session($condition, $status_code)
{
	if ($condition)
	{
		$response = array('statusCode' => $status_code);
		create_response($response);
	}
}

/**
* Function to retrieve the value of a HTTP GET or POST variable
*
* @param name		Name of the variable
* @param default	Default fallback value for the variable
* @returns			mixed
*/
function http_var($name, $default)
{
	if (gettype($default) == 'integer')
	{
		settype($default, 'double');
	}

	if (isset($_POST[$name]))
	{
		$post_data = $_POST[$name];
		settype($post_data, gettype($default));

		return $post_data;
	}
	else if (isset($_GET[$name]))
	{
		$get_data = $_GET[$name];
		settype($get_data, gettype($default));

		return $get_data;
	}
	else
	{
		return $default;
	}
}

/**
* Function to retrieve a POSTed file data
*
* @param name		Name of the file control
* @returns			array
*/
function http_file($name)
{
	if (isset($_FILES[$name]))
	{
		return $_FILES[$name];
	}
	else
	{
		return false;
	}
}