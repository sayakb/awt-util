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
	* Name of the active profile
	*/
	name: null,

	/**
	* The currently active profile's data
	*/
	data: [],

	/**
	* Initializes a blank profile
	*/
	init: function(name) {
		profiles.name = name;
		profiles.data = [];
	},

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
	* Loads an existing profile
	*
	* @data		The profile name
	* @returns	constants.io
	*/
	load: function(name) {
		var response = $.ajax({
			type: 'POST',
			url: 'lib/php/io.php',
			data: { action: 'load', profile: name },
			async: false
		}).responseText;

		// Parse the response JSON data
		var response = $.parseJSON(response);

		// If loaded, set the current profile data to loaded data
		if (response.statusCode == constants.io.success) {
			profiles.name = name;
			profiles.data = response.profile;
		}

		return response.statusCode;
	},

	/**
	* Saves a profile
	*
	* @name		The profile name
	* @data		The JSON template to be saved
	* @returns	constants.io
	*/
	save: function(name, data) {
		var response = $.ajax({
			type: 'POST',
			url: 'lib/php/io.php',
			data: { action: 'save', profile: name, data: data },
			async: false
		}).responseText;

		// Parse the response JSON data
		var response = $.parseJSON(response);
		return response.statusCode;
	},

	/**
	* Renames a profile
	*
	* @name		The current profile name
	* @data		The new profile name
	* @returns	constants.io
	*/
	rename: function(oldName, newName) {
		var response = $.ajax({
			type: 'POST',
			url: 'lib/php/io.php',
			data: { action: 'rename', profile: oldName, rename: newName },
			async: false
		}).responseText;

		// Parse the response JSON data
		var response = $.parseJSON(response);
		return response.statusCode;
	},

	/**
	* Deletes a profile
	*
	* @name		The profile to be deleted
	* @returns	constants.io
	*/
	remove: function(name) {
		var response = $.ajax({
			type: 'POST',
			url: 'lib/php/io.php',
			data: { action: 'remove', profile: name },
			async: false
		}).responseText;

		// Parse the response JSON data
		var response = $.parseJSON(response);
		return response.statusCode;
	},

	/**
	* Checks the validity of a user uploaded profile
	*
	* @param data	JSON data content of the file
	* @returns		boolean
	*/
	sanityCheck: function(data) {
		return true;
	},
};