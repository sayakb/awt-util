/**
* Automatic Web Testing Utility
* @ver 0.1
* @license BSD License - www.opensource.org/licenses/bsd-license.php
*
* Copyright (c) 2013 Sayak Banerjee <mail@sayakbanerjee.com>
* All rights reserved. Do not remove this copyright notice.
*/

/**
* HTML generator library
*/
var html = {
	/**
	* Creates a dropdown option tag
	*
	* @param item	Option item
	* @returns		string
	*/
	createOption: function(item) {
		item = item !== undefined ? item : '';
		return '<option>' + item + '</option>';
	},

	/**
	* Creates a web test case row
	*
	* @param test	Test case object
	* @returns		string
	*/
	createTestCaseRow: function(test) {
		var row = '<tr data-id="' + test.id + '">';
		row += '<td class="column-id">' + $.strPad(test.id, 4, 0) + '</td>';
		row += '<td class="column-name"><button type="button" class="btn btn-link btn-test-edit">';
		row += test.name + '</button></td>';
		row += '<td class="column-run">NO RUN</td>';
		row += '<td class="column-actions"><i class="icon-trash hand" data-toggle="tooltip" ';
		row += 'title="Delete"></i></td>';
		row += '</tr>';

		return row;
	},

	/**
	* Creates a web test request row
	*
	* @param id		ID for the request
	* @param param	Request parameter
	* @param value	Parameter value
	* @returns		string
	*/
	createTestRequestRow: function(id, param, value) {
		var row = '<tr class="req" data-id="' + id + '">';
		row += '<td class="column-req-param">' + param + '</td>';
		row += '<td class="column-req-val">' + value + '</td>';
		row += '<td class="column-req-actions"><i class="icon-trash hand" data-toggle="tooltip" ';
		row += 'title="Delete"></i></td>';
		row += '</tr>';

		return row;
	},

	/**
	* Creates a web test response row
	*
	* @param id			ID for the validation
	* @param selector	jQuery selector
	* @param value		Value to look for
	* @param exact		Apply exact match
	* @returns			string
	*/
	createTestResponseRow: function(id, selector, value, exact) {
		var icon = exact ? 'icon-ok' : 'icon-remove';
		selector = selector.length > 0 ? selector : '-';

		var row = '<tr class="resp" data-id="' + id + '">';
		row += '<td class="column-resp-sel">' + selector + '</td>';
		row += '<td class="column-resp-val">' + value + '</td>';
		row += '<td class="column-resp-exact"><i class="' + icon + '"></i></td>';
		row += '<td class="column-resp-actions"><i class="icon-trash hand" data-toggle="tooltip" ';
		row += 'title="Delete"></i></td>';
		row += '</tr>';

		return row;
	},

	/**
	* Escapes HTML for displaying it on the screen
	*/
	escape: function(text) {
	},
}