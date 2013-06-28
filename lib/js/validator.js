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

		$('#test-run').button('loading');
		$('#test-table tr')
			.removeClass('success error warning')
			.children('td.column-run')
			.html('WAITING');

		$.each(profiles.data.testCases, function(i, test) {
			validator.check(test.id);
		});

		$('#test-run').button('reset');
	},

	/**
	* Runs a specific test case
	*
	* @param id	Test case identifier
	*/
	check: function(id) {
		var test = profiles.getTest(id);

		// Has the test already been run?
		if ($.inArray(id, validator.passed) != -1) {
			return true;
		}

		if ($.inArray(id, validator.failed) != -1) {
			return false;
		}

		// Run the dependencies
		if (test.parent > 0 && !validator.check(test.parent)) {
			validator.setStatus(id, constants.validator.stalled);
			return false;
		}

		// At least one response validation is needed
		if (test.response.length == 0) {
			validator.setStatus(id, constants.validator.failed);
			return false;
		}

		// Mark test case as running
		validator.setStatus(id, constants.validator.running);

		// Send the request
		var response = $.ajax({
			type: test.method,
			url: profiles.data.baseUrl + test.url,
			data: test.request,
			async: false
		}).responseText;

		// Validate the response
		var passed = true;

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

			if (resp.exact && text != resp.value) {
				passed = false;
				return false;
			}
			else if (!resp.exact && text.indexOf(resp.value) == -1) {
				passed = false;
				return false;
			}
		});

		// Set the status and exit
		var status = passed ? constants.validator.passed : constants.validator.failed;
		validator.setStatus(id, status);

		return true;
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
				validator.passed.push(id);
				color = 'success';
				break;

			case constants.validator.failed:
				validator.failed.push(id);
				color = 'error';
				break;

			case constants.validator.stalled:
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
}