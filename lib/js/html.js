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
	* HTML escape characters
	*/
	escapeChars: {
		'<': '&lt;',
		'>': '&gt;'
	},

	/**
	* Creates a dropdown option tag
	*
	* @param item	Option item
	* @return string
	*/
	createOption: function(item) {
		item = item !== undefined ? item : '';
		return '<option>' + html.escape(item) + '</option>';
	},

	/**
	* Creates a web test case row
	*
	* @param test	Test case object
	* @return string
	*/
	createTestCaseRow: function(test) {
		var row = '<tr data-id="' + html.escape(test.id) + '">';
		row += '<td class="column-id">' + html.escape($.strPad(test.id, 4, 0)) + '</td>';
		row += '<td class="column-name"><button type="button" class="btn btn-link btn-test-edit">';
		row += html.escape(test.name) + '</button></td>';
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
	* @return string
	*/
	createTestRequestRow: function(id, param, value) {
		var row = '<tr class="req" data-id="' + html.escape(id) + '">';
		row += '<td class="column-req-param">' + html.escape(param) + '</td>';
		row += '<td class="column-req-val">' + html.escape(value) + '</td>';
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
	* @return string
	*/
	createTestResponseRow: function(id, selector, value, exact) {
		var icon = exact ? 'icon-ok' : 'icon-remove';
		selector = selector.length > 0 ? selector : '-';

		var row = '<tr class="resp" data-id="' + html.escape(id) + '">';
		row += '<td class="column-resp-sel">' + html.escape(selector) + '</td>';
		row += '<td class="column-resp-val">' + html.escape(value) + '</td>';
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
		return ('' + text).replace(/[<>]/g, function(match) {
			return html.escapeChars[match];
		});
	},
}