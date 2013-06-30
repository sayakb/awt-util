/**
* Automatic Web Testing Utility
* @ver 0.1
* @license BSD License - www.opensource.org/licenses/bsd-license.php
*
* Copyright (c) 2013 Sayak Banerjee <mail@sayakbanerjee.com>
* All rights reserved. Do not remove this copyright notice.
*/

/**
* The AWT validation engine
*/
var validator = {
	/**
	* Passed test IDs
	*/
	passed: [],

	/**
	* Failed test IDs
	*/
	failed: [],

	/**
	* Tests case queue
	*/
	queue: [],

	/**
	* Execution counter
	*/
	counter: 0,

	/**
	* Stores the response HTML for each test
	*/
	testResponse: [],

	/**
	* Entry point for text execution
	*/
	start: function() {
		if (profiles.data.baseUrl === undefined) {
			popups.showMessage('Error', 'No base URL defined', popups.constants.ok);
			return;
		}

		if (profiles.data.testCases === undefined || profiles.data.testCases.length == 0) {
			popups.showMessage('Error', 'No test cases have been defined', popups.constants.ok);
			return;
		}

		validator.passed = [];
		validator.failed = [];
		validator.queue = [];
		validator.testResponse = [];
		validator.counter = 0;

		$('#test-run').button('loading');
		$('#test-results').hide();

		$('#test-table tr')
			.removeClass('success error warning')
			.children('td.column-run')
			.html('WAITING');

		$.each(profiles.data.testCases, function(i, test) {
			validator.queue.push(test.id);
		});

		validator.process();
	},

	/**
	* Processes the test case queue
	*/
	process: function() {
		var loop = setInterval(function() {
			if (validator.queue.length == 0 && profiles.data.testCases.length == validator.counter) {
				$('#test-run').button('reset');
				$('#test-results').show();
				$('#test-passed').html(validator.passed.length + ' passed');
				$('#test-failed').html(validator.failed.length + ' failed');

				clearInterval(loop);
				return;
			}
			else {
				var id = validator.queue.pop();
				validator.check(id);
			}
		}, 200);
	},

	/**
	* Runs a specific test case
	*
	* @param id	Test case identifier
	*/
	check: function(id) {
		var test = profiles.getTest(id);
		var passed = true;
		var status = null;
		var parentData = null;
		var urlParsed = null;
		var reqParsed = null;
		var respParsed = null;

		// Check and parse dependencies
		if (test.parent > 0) {
			if ($.inArray(test.parent, validator.passed) === -1 && $.inArray(test.parent, validator.failed) === -1) {
				validator.queue.unshift(id);
				return;
			}

			if ($.inArray(test.parent, validator.failed) !== -1) {
				validator.setStatus(id, constants.validator.stalled);
				validator.counter++;
				return;
			}

			parentData = validator.testResponse[test.parent];
		}

		// At least one response validation is needed
		if (test.response.length == 0) {
			validator.setStatus(id, constants.validator.failed);
			validator.counter++;
			return;
		}

		// Mark test case as running
		validator.setStatus(id, constants.validator.running);

		// Determing the request URL
		urlParsed = validator.parseDeps(test.url, parentData);

		if (urlParsed.indexOf('http://') === -1 && urlParsed.indexOf('https://') === -1 && urlParsed.substring(0, 1) != '/') {
			urlParsed = profiles.data.baseUrl + urlParsed;
		}

		// Parse the request params
		requestParsed = $.extend(true, {}, test.request);

		$.each(requestParsed, function(i) {
			requestParsed[i] = validator.parseDeps(requestParsed[i], parentData);
		});

		// Send the request
		$.ajax({
			type: test.method,
			url: urlParsed,
			data: requestParsed,
			async: true
		}).done(function(response) {
			// Cache the response
			validator.testResponse[id] = response;

			// Iterate through the response validators and check against the
			// received response
			$.each(test.response, function(i, resp) {
				var text = response;

				if (resp.selector.length > 0) {
					var element = $(response).find(resp.selector);

					if (element.length == 0) {
						passed = false;
						return false;
					}
					else {
						text = element.html();
					}
				}

				// Parse response value
				respParsed = validator.parseDeps(resp.value, parentData);

				if (resp.exact && text != respParsed) {
					passed = false;
					return false;
				}
				else if (!resp.exact && text.indexOf(respParsed) === -1) {
					passed = false;
					return false;
				}
			});

			// Set the test status and exit
			validator.setStatus(id, passed ? constants.validator.passed : constants.validator.failed);
		}).error(function() {
			validator.setStatus(id, constants.validator.failed);
		});
	},

	/**
	* Sets the execution status for a test case
	*
	* @param id		Test case identifier
	* @param status	Execition status
	*/
	setStatus: function(id, status) {
		var color = null;
		var row = $('#test-table tr[data-id=' + id + ']');

		switch (status) {
			case constants.validator.passed:
				validator.counter++;
				validator.passed.push(id);
				color = 'success';
				break;

			case constants.validator.failed:
				validator.counter++;
				validator.failed.push(id);
				color = 'error';
				break;

			case constants.validator.stalled:
				validator.counter++;
				validator.failed.push(id);
				color = 'warning';
				break;
		}

		// Set status on the UI
		row.children('td.column-run').html(status);

		// Highlight the row
		if (color != null) {
			row.addClass(color);
		}
		else {
			row.removeClass('success error warning');
		}
	},

	/**
	* Parse dependencies from a parent test case
	*
	* @param vaue		The value to be parsed
	* @param context	The context of parsing, usually the parent's response
	* @returns			string
	*/
	parseDeps: function(value, context) {
		if (context != null) {
			var refMatch = value.match(/\$parent/g);
			var refStart = value.indexOf('$parent');
			var refEnd = value.lastIndexOf('}') + 1;

			if (refMatch != null && refMatch.length == 1) {
				var reference = value.substring(refStart, refEnd);
				var match = value.match(/\{([^\}]+)\}/g);

				if (match != null) {
					var selector = match[0].replace(/[\{\}]+/g, '');
					var depValue = match[1].replace(/[\{\}]+/g, '');
					var item = $(context).find(selector);
					var parsed = null;

					// Was the item found in context?
					if (item.length != 0) {
						if (depValue.substring(0, 5) == 'attr=') {
							parsed = item.attr(depValue.substring(5));
						}
						else if (depValue == 'html') {
							parsed = item.html();
						}
						else if (depValue == 'text') {
							parsed = item.text();
						}
					}

					// Return new value
					if (parsed != null) {
						return value.replace(reference, parsed);
					}
				}
			}
		}

		return value;
	},
}