/**
* Automatic Web Testing Utility
* @ver 0.1
* @license BSD License - www.opensource.org/licenses/bsd-license.php
*
* Copyright (c) 2013 Sayak Banerjee <mail@sayakbanerjee.com>
* All rights reserved. Do not remove this copyright notice.
*/

/**
* Library wide constants
*/
var constants = {
	/**
	* Profile IO constants
	*/
	io: {
		noData: 100,
		error: 150,
		fileExists: 200,
		success: 500
	},

	/**
	* Popup module constants
	*/
	popups: {
		ok: 0,
		yesNo: 1,
		yes: 2,
		no: 3
	},

	/**
	* User interface constants
	*/
	ui: {
		wrapperHome: 0,
		wrapperProfile: 1
	},

	/**
	* Test validator constants
	*/
	validator: {
		running: 'RUNNING',
		failed: 'FAILED',
		stalled: 'STALLED',
		passed: 'PASSED',
	},
}