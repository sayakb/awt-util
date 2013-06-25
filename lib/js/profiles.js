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
	current: {},

	/**
	* Gets a list of saved profile names
	*
	* @returns	array
	*/
	list: function() {
		var response = $.ajax({
			type: 'POST',
			url: 'lib/php/io.php',
			data: { action: 'list' },
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
	* Loads
	*
	* @data		The JSON template to be loaded
	* @returns	array
	*/
	load: function(data) {
		profiles.current = data;
	},

	/**
	* Imports a user uploaded file
	*
	* @returns	boolean
	*/
	import: function(data) {
		if (profiles.sanityCheck(data)) {
			var name = $.md5(new Date().getTime());

			// Save the new profile
			var response = $.ajax({
				type: 'POST',
				url: 'lib/php/io.php',
				data: { action: 'save', profile: name, data: data },
				async: false
			}).responseText;

			// Parse the response JSON data
			var response = $.parseJSON(response);

			if (response.statusCode == constants.io.success) {
				profiles.load(data);alert(profiles.current);
				return true;
			}
		}

		popups.showMessage('Error', 'An error occurred while loading the template', constants.popups.ok);
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