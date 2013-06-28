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
	data: {},

	/**
	* Request parameters cache
	*/
	request: {},

	/**
	* Response validation cache
	*/
	response: [],

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
			profiles.data = profiles.unescape(response.profile);
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
	save: function(name, data, sync) {
		var update = sync !== undefined ? sync : false;
		var response = $.ajax({
			type: 'POST',
			url: 'lib/php/io.php',
			data: { action: 'save', profile: name, data: data, update: update },
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
	* Syncs the currently active profile with the server
	*
	* @returns	constants.io
	*/
	sync: function() {
		if (profiles.name != null) {
			var data = profiles.escape(profiles.data);

			profiles.save(profiles.name, $.stringify(data), true);
			profiles.unescape(profiles.data);

			return constants.io.success;
		}
		else {
			return constants.io.noData;
		}
	},

	/**
	* Gets a specific test details
	*
	* @param id	Test case identifier
	* @returns	object
	*/
	getTest: function(id) {
		var found = {};

		$.each(profiles.data.testCases, function(i, test) {
			if (test.id == id) {
				found = test;
				return false;
			}
		});

		return found;
	},

	/**
	* Create a new test case
	*
	* @param id		Test case identifier
	* @param name	Test case name
	* @param url	Script path for the request
	* @param parent	Test dependency
	* @param method	HTTP request method
	* @returns		boolean
	*/
	createTest: function(id, name, url, parent, method) {
		if (profiles.data.testCases === undefined) {
			profiles.data.testCases = [];
		}

		profiles.data.testCases.push({
			id: id,
			name: name,
			url: url,
			parent: parent,
			method: method,
			request: profiles.request,
			response: profiles.response
		});
	},

	/**
	* Updates an existing test case
	*
	* @param id		Test case identifier
	* @param name	Test case name
	* @param url	Script path for the request
	* @param parent	Test dependency
	* @param method	HTTP request method
	* @returns		boolean
	*/
	updateTest: function(id, name, url, parent, method) {
		$.each(profiles.data.testCases, function(i, test) {
			if (test.id == id) {
				profiles.data.testCases[i] = {
					id: id,
					name: name,
					url: url,
					parent: parent,
					method: method,
					request: profiles.unescape(profiles.request),
					response: profiles.unescape(profiles.response)
				};

				return false;
			}
		});
	},

	/**
	* Deletes an existing test case
	*
	* @param id		Test case identifier
	* @returns		boolean
	*/
	deleteTest: function(id) {
		$.each(profiles.data.testCases, function(i, test) {
			if (test.id == id) {
				profiles.data.testCases.splice(i, 1);
				return false;
			}
		});
	},

	/**
	* Adds a HTTP request to a testcase
	*
	* @param param	Request parameter
	* @param value	Parameter value
	* @returns		boolean
	*/
	addRequest: function(param, value) {
		if (profiles.request[param] === undefined) {
			profiles.request[param] = value;
			return true;
		}

		return false;
	},

	/**
	* Deletes a HTTP request from a testcase
	*
	* @param param	Request parameter
	* @returns		boolean
	*/
	deleteRequest: function(param) {
		delete profiles.request[param.toString()];
		return true;
	},

	/**
	* Adds a response validation to a testcase
	*
	* @param id			Validation ID
	* @param selector	Optional selector for response
	* @param value		Value to match value
	* @param exact		Whether to do an exact match
	* @returns			boolean
	*/
	addResponse: function(id, selector, value, exact) {
		profiles.response.push({
			id: id,
			selector: selector,
			value: value,
			exact: exact
		});

		return true;
	},

	/**
	* Deletes a response validation
	*
	* @param id	Validation ID
	* @returns	boolean
	*/
	deleteResponse: function(id) {
		$.each(profiles.response, function(i, resp) {
			if (resp.id == id) {
				profiles.response.splice(i, 1);
				return false;
			}
		});

		return true;
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

	/**
	* Escapes the JSON string before saving it
	*
	* @param data	JSON to escape
	* @returns		object
	*/
	escape: function(data) {
		var what = Object.prototype.toString;

		$.each(data, function(i, item) {
			var type = what.call(item);

			if (type === '[object Object]' || type === '[object Array]') {
				data[i] = profiles.escape(item);
			}
			else if (type === '[object String]') {
				data[i] = item
							.replace(/"/g, '&quot;')
							.replace(/\\/g, '\\\\');
			}
		});

		return data;
	},

	/**
	* Un-escapes the JSON string before loading it
	*
	* @param data	JSON to un-escape
	* @returns		object
	*/
	unescape: function(data) {
		var what = Object.prototype.toString;

		$.each(data, function(i, item) {
			var type = what.call(item);

			if (type === '[object Object]' || type === '[object Array]') {
				data[i] = profiles.unescape(item);
			}
			else if (type === '[object String]') {
				data[i] = item
							.replace(/&quot;/g, '"')
							.replace(/\\\\/g, '\\');
			}
		});

		return data;
	},

	/**
	* Gets the next available test case ID
	*
	* @returns	int
	*/
	nextTestCaseId: function() {
		var max = 0;

		if (profiles.data.testCases !== undefined) {
			$.each(profiles.data.testCases, function(i, test) {
				if (test.id > max) {
					max = test.id;
				}
			});
		}

		return max + 1;
	},

	/**
	* Gets the next available test response ID
	*
	* @returns	int
	*/
	nextTestResponseId: function() {
		var max = 0;

		if (profiles.response !== undefined) {
			$.each(profiles.response, function(i, resp) {
				if (resp.id > max) {
					max = resp.id;
				}
			});
		}

		return max + 1;
	},
};