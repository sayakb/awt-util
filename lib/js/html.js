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
		row += '<td class="column-id">' + $.strPad(test.id, 5, '0') + '</td>';
		row += '<td class="column-name"><a href="#">' + test.name + '</a></td>';
		row += '<td class="column-run">NO RUN</td>';
		row += '</tr>';

		return row;
	}
}