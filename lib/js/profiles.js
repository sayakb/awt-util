/**
* Automatic Web Testing Utility
* @ver 0.1
* @license BSD License - www.opensource.org/licenses/bsd-license.php
*
* Copyright (c) 2013 Sayak Banerjee <mail@sayakbanerjee.com>
* All rights reserved. Do not remove this copyright notice.
*/

/**
* Profile related operations
*/
var profiles = {
	/**
	* Gets the currently active profile
	*
	* @returns	string
	*/
	current: function() {
		return $.cookie(constants.cookies.currentProfile);
	},

	/**
	* Gets a list of saved profile names
	*
	* @returns	array
	*/
	list: function() {
		var response = $.ajax({
			type: 'POST',
			url: 'lib/php/io.php?action=list',
			async: false
		}).responseText;

		// Parse the response JSON data
		var response = $.parseJSON(response);

		if (response.statusCode == constants.io.success) {
			return response.profiles;
		}
		else {
			return null;
		}
	},

	/**
	* Imports a user uploaded file
	*
	* @returns	boolean
	*/
	import: function(data) {
		alert(data);
	},

	/**
	* Checks the validity of a user uploaded profile
	*
	* @param data	JSON data content of the file
	* @returns		boolean
	*/
	sanityCheck: function(data) {
		return true;
	}
};