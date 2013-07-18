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
	* Stores generated random number
	*/
	testRandom: [],

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
		validator.testRandom = [];
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

		console.clear();
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
				return;
			}
		}

		// At least one response validation is needed
		if (test.response.length == 0) {
			validator.setStatus(id, constants.validator.failed);
			return;
		}

		// Mark test case as running
		validator.setStatus(id, constants.validator.running);

		// Determing the request URL
		urlParsed = test.url;
		urlParsed = validator.parseMeta(id, urlParsed);

		if (urlParsed.indexOf('http://') === -1 && urlParsed.indexOf('https://') === -1 && urlParsed.substring(0, 1) != '/') {
			urlParsed = profiles.data.baseUrl + urlParsed;
		}

		// Parse the request params
		requestParsed = $.extend(true, {}, test.request);

		$.each(requestParsed, function(i) {
			requestParsed[i] = validator.parseMeta(id, requestParsed[i]);
		});

		// Log test execution
		console.log('Executing test case ' + id + ': "' + test.name + '" with request: ');
		console.log(requestParsed);

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
				respParsed = resp.value;
				respParsed = validator.parseMeta(id, respParsed);

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

		// Make the status clickable
		status = html.createTestStatusText(id, status);

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
	* @param id			Test ID
	* @param value		The value to be parsed
	* @param context	The context of parsing, usually the parent's response
	* @return string
	*/
	parseMeta: function(id, value) {
		var refStart;
		var refEnd;

		// Parse parent placeholders
		refStart = value.indexOf('$parent');
		refEnd = value.lastIndexOf('}') + 1;

		if (refStart != -1) {
			var reference = value.substring(refStart, refEnd);
			var match = value.match(/\{([^\}]+)\}/g);

			if (match != null && match.length == 3) {
				// Get placeholder values
				var parentId = match[0].replace(/[\{\}]+/g, '');
				var selector = match[1].replace(/[\{\}]+/g, '');
				var depValue = match[2].replace(/[\{\}]+/g, '');

				// Get parent context
				parentId = parseInt(parentId);

				if (!isNaN(parentId)) {
					var context = validator.testResponse[parentId];

					if (context !== undefined) {
						var item = $(context).find(selector);
						var parsed = null;

						// Was the item found in context?
						if (item.length != 0) {
							// Extract specific attribute from parent selection
							if (depValue.substring(0, 5) == 'attr=') {
								parsed = item.attr(depValue.substring(5));
							}

							// Extract chunk of text
							else if (depValue.substring(0, 4) == 'text') {
								parsed = item.text().trim();

								// Not all text but a part of it is to be used
								if (depValue.indexOf('[') != -1) {
									var depRange = depValue.replace(/[etx\[\]]+/g, '');
									var depRangeAry = depRange.split(',');

									var startRange = 0;
									var endRange = parsed.length;

									if (depRangeAry[0] !== undefined && $.isNumeric(depRangeAry[0].trim())) {
										startRange = parseInt(depRangeAry[0].trim());
									}

									if (depRangeAry[1] !== undefined && $.isNumeric(depRangeAry[1].trim())) {
										endRange = startRange + parseInt(depRangeAry[1].trim()) + 1;
									}

									parsed = parsed.substring(startRange, endRange);
								}
							}

							// Extract HTML
							else if (depValue == 'html') {
								parsed = item.html().trim();
							}
						}

						// Return new value
						if (parsed != null) {
							value = value.replace(reference, parsed);
						}
					}
				}
			}
		}

		// Parse metadata
		refStart = value.indexOf('$meta');

		if (refStart != -1) {
			var reference = value.substring(refStart, 6);
			var metaIdx = parseInt(reference[5]);

			// We support only 8 metadata values
			if (!isNaN(metaIdx) && metaIdx >= 1 && metaIdx <= 8) {
				var metaValue = profiles.data.meta[metaIdx - 1];

				if (metaValue !== undefined) {
					value = value.replace(reference, metaValue);
				}
			}
		}

		// Parse random placeholders
		refStart = value.indexOf('$rand');

		if (refStart != -1) {
			if (validator.testRandom[id] === undefined) {
				validator.testRandom[id] = Math.floor(Math.random() * 90000) + 10000;
			}

			value = value.replace('$rand', validator.testRandom[id]);
		}

		return value;
	},
}