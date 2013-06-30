/**
* Automatic Web Testing Utility
* @ver 0.1
* @license BSD License - www.opensource.org/licenses/bsd-license.php
*
* Copyright (c) 2013 Sayak Banerjee <mail@sayakbanerjee.com>
* All rights reserved. Do not remove this copyright notice.
*/

/**
* General website operations
*/
var ui = {
	/**
	* Executed on global load
	*/
	load: function() {
		ui.loadProfileSelect();
		ui.loadProfileCreate();
		ui.loadProfileImport();
		ui.loadProfileViewer();
		ui.loadPopupElements();
	},

	/**
	* Loads the existing profiles list and handles selection
	*/
	loadProfileSelect: function() {
		// Populate the list of profiles
		$('#profile-list').empty();
		var list = profiles.list();

		if (!$.isEmptyObject(list)) {
			$.each(list, function(index, item) {
				$('#profile-list').append(html.createOption(item));
				$('#profile-list-btn').removeAttr('disabled');
			});
		}

		// Handle profile select button click
		$('#profile-list-btn')
			.off('click')
			.on('click', function() {
				var profile = $('#profile-list').val();
				var status = profiles.load(profile);

				if (status == constants.io.success) {
					ui.openProfile();
				}
				else {
					popups.showMessage('Error', 'An error occurred while loading the profile', constants.popups.ok);
				}
			});
	},

	/**
	* Performs all operations needed for new profile creation
	*/
	loadProfileCreate: function() {
		// Prepare the create field
		$('#profile-new').val(null);
		ui.toggleButton('#profile-new', '#profile-new-btn');

		// Allow limited characters for the new name box
		$('#profile-new')
			.on('keyup', function() {
				var text = $(this).val().replace(/[^a-zA-Z0-9 \-]/g,'').toLowerCase();
				$(this).val(text);
			});

		// Handle profile create button click
		$('#profile-new-btn')
			.off('click')
			.on('click', function() {
				var name = $('#profile-new').val();
				var status = profiles.save(name, '{}');

				if (status == constants.io.success) {
					status = profiles.load(name);

					if (status == constants.io.success) {
						ui.openProfile();
						return;
					}
				}
				else if (status == constants.io.fileExists) {
					popups.showMessage('Error', 'A profile with the same name already exists', constants.popups.ok);
					return;
				}

				popups.showMessage('Error', 'An error occurred while creating the profile', constants.popups.ok);
			});
	},

	/**
	* Set up the upload triggers
	*/
	loadProfileImport: function() {
		// Prepare the import field
		$('#profile-new').val(null);
		ui.toggleButton('#profile-import-file', '#profile-import-btn');

		// Handle form submission for file upload
		$('#profile-form')
			.off('submit')
			.on('submit', function() {
				$(this).ajaxSubmit({ success: ui.handleProfileUpload });
				return false;
			});

		// Link the import box to the hidden upload box
		$('#profile-import')
			.off('click')
			.on('click', function() {
				$('#profile-import-file').click();
			});

		$('#profile-import-file')
			.on('change', function() {
				var file = $(this).val().split('\\').pop();
				$('#profile-import').val(file);
			});
	},

	/**
	* Sets up event handlers for the profile viewer page
	*/
	loadProfileViewer: function() {
		// Activate tooltips
		$('[data-toggle=tooltip]').tooltip();

		// Hide test results
		$('#test-results').hide();

		// Allow limited characters for the profile name box
		$('#profile-current')
			.on('keyup', function() {
				var text = $(this).val().replace(/[^a-zA-Z0-9 \-]/g,'').toLowerCase();
				$(this).val(text);
			});

		// Handler for rename profile button
		$('#profile-rename')
			.off('click')
			.on('click', function() {
				var newName = $('#profile-current').val();
				var status = profiles.rename(profiles.name, newName);

				if (status == constants.io.success) {
					status = profiles.load(newName);

					if (status == constants.io.success) {
						ui.toggleButton('#profile-current', '#profile-rename', profiles.name);
						popups.showMessage('Information', 'Profile renamed successfully', constants.popups.ok);

						return;
					}
				}
				else if (status == constants.io.fileExists) {
					popups.showMessage('Error', 'A profile with the same name already exists', constants.popups.ok);
					return;
				}

				popups.showMessage('Error', 'An error occurred while renaming the profile', constants.popups.ok);
			});

		// Handler for profile delete button
		$('#profile-delete')
			.off('click')
			.on('click', function() {
				popups.showMessage('Question', 'Are you sure you want to delete this profile?', constants.popups.yesNo, ui.handleProfileDelete);
			});

		// Handler for change profile button
		$('#brand, #profile-change')
			.off('click')
			.on('click', function() {
				ui.setScreen(constants.ui.wrapperHome);
			});

		// Add test case button handler
		$('#test-add')
			.off('click')
			.on('click', function() {
				popups.showTestCaseModal();
			});

		// Run test case button handler
		$('#test-run')
			.off('click')
			.on('click', validator.start);

		// Change event for the base url textbox
		$('#profile-base-url')
			.off('change')
			.on('change', function() {
				profiles.data.baseUrl = $(this).val();
				profiles.sync();
			});

		// Handler for test edit link
		$('.btn-test-edit')
			.off('click')
			.on('click', function() {
				var row = $(this).parent().parent();
				var id = row.attr('data-id');

				popups.showTestCaseModal(id);
				ui.loadPopupElements();
			});
	},

	/**
	* Sets up event handlers for the popup buttons
	*/
	loadPopupElements: function() {
		// Activate tooltips
		$('[data-toggle=tooltip]').tooltip();

		// Message box OK button
		$('#popup-message-ok')
			.off('click')
			.on('click', function() {
				popups.messageButton(constants.popups.ok);
			});

		// Message box Yes button
		$('#popup-message-yes')
			.off('click')
			.on('click', function() {
				popups.messageButton(constants.popups.yes);
			});

		// Message box No button
		$('#popup-message-no')
			.off('click')
			.on('click', function() {
				popups.messageButton(constants.popups.no);
			});

		// Handle save button click for the test case modal
		$('#test-case-save')
			.off('click')
			.on('click', function() {
				var name = $('#test-name').val();
				var url = $('#test-url').val();
				var method = $('#test-method-get').hasClass('active') ? 'GET' : 'POST';
				var parent = $('#test-parent').val();
				var parentId = parent.length > 0 ? parseInt(parent) : 0;

				if (name.length == 0) {
					popups.showMessage('Error', 'Please enter the name', constants.popups.ok);
					return false;
				}

				if (url.length == 0) {
					popups.showMessage('Error', 'Please enter the script path', constants.popups.ok);
					return false;
				}

				// Save the test case info
				var id = parseInt($('#popup-test').attr('data-id'));

				if (isNaN(id)) {
					id = profiles.nextTestCaseId();
					profiles.createTest(id, name, url, parentId, method);
				}
				else {
					profiles.updateTest(id, name, url, parentId, method);
				}

				$('#popup-test').modal('hide');

				profiles.sync();
				ui.openProfile();
			});

		// Handler for the request delete buttons
		$('#column-req-actions i')
			.off('click')
			.on('click', function() {
				var id = $(this).parent().parent().attr('data-id');
				var param = decodeURI(param);

				delete profiles.request[param];
			});

		// Handler for the request delete buttons
		$('.column-req-actions i.icon-trash')
			.off('click')
			.on('click', function() {
				var row = $(this).parent().parent();
				var id = row.attr('data-id');
				var param = decodeURI(id);

				profiles.deleteRequest(param);
				row.remove();
			});

		// Handler for the response delete buttons
		$('.column-resp-actions i.icon-trash')
			.off('click')
			.on('click', function() {
				var row = $(this).parent().parent();
				var id = row.attr('data-id');

				profiles.deleteResponse(id);
				row.remove();
			});

		// Handler for the add request button on test case modal
		$('#test-req-add')
			.off('click')
			.on('click', function() {
				var param = $('#test-req-param').val();
				var value = $('#test-req-val').val();
				var id = encodeURI(param);

				if (param.length > 0 && value.length > 0) {
					if (profiles.addRequest(param, value)) {
						var row = html.createTestRequestRow(id, param, value);
						$('#test-request-ctrl').before(row);
						$('#test-request-ctrl input').val(null);

						ui.loadPopupElements();
					}
					else {
						popups.showMessage('Error', 'Parameter already exists', constants.popups.ok);
					}
				}
			});

		// Handler for the add response button on test case modal
		$('#test-resp-add')
			.off('click')
			.on('click', function() {
				var id = profiles.nextTestResponseId();
				var selector = $('#test-resp-sel').val();
				var value = $('#test-resp-val').val();
				var exact = $('#test-resp-exact-yes').hasClass('active');

				if (value.length > 0) {
					var row = html.createTestResponseRow(id, selector, value, exact);
					$('#test-resp-ctrl').before(row);
					$('#test-resp-ctrl input').val(null);
					$('#test-resp-exact-yes').addClass('active');
					$('#test-resp-exact-no').removeClass('active');

					profiles.addResponse(id, selector, value, exact);
					ui.loadPopupElements();
				}
			});
	},

	/**
	* Handles profile upload operation
	*
	* @param data	Uploaded templete contents
	*/
	handleProfileUpload: function(data) {
		if (profiles.sanityCheck(data)) {
			var name = $.md5(new Date().getTime());
			var status = profiles.save(name, data);

			if (status == constants.io.success) {
				status = profiles.load(name);

				if (status == constants.io.success) {
					ui.openProfile();
					return;
				}
			}
			else if (status == constants.io.fileExists) {
				popups.showMessage('Error', 'A profile with the same name already exists', constants.popups.ok);
				return;
			}
		}

		popups.showMessage('Error', 'An error occurred while importing the profile', constants.popups.ok);
	},

	/**
	* Opens a profile and loads it to the UI
	*/
	openProfile: function() {
		// Activate tooltips
		$('[data-toggle=tooltip]').tooltip();

		// Clear old data
		$('#profile-base-url').val(null);
		$('#test-table > tbody').empty();
		$('#test-no-cases').show();

		// Load profile data
		$('#profile-current').val(profiles.name);

		if (profiles.data.baseUrl !== undefined) {
			$('#profile-base-url').val(profiles.data.baseUrl);
		}

		if (profiles.data.testCases !== undefined) {
			$.each(profiles.data.testCases, function(i, test) {
				$('#test-table > tbody').append(html.createTestCaseRow(test));
				$('#test-no-cases').hide();
			});
		}

		// Handler for export button click
		$('#profile-export')
			.off('click')
			.on('click', function() {
				window.open('profiles/' + profiles.name + '.awt', 'Export profile');
			});

		// Handler for delete button of test cases
		$('#test-table i.icon-trash')
			.off('click')
			.on('click', function() {
				var id = $(this).parent().parent().attr('data-id');
				popups.showMessage('Question', 'Are you sure you want to delete this test case?', constants.popups.yesNo, ui.handleTestDelete, id);
			});

		// Enable rename button only when name is changed
		ui.toggleButton('#profile-current', '#profile-rename', profiles.name);

		// Show the profile screen
		ui.setScreen(constants.ui.wrapperProfile);
	},

	/**
	* Handles deletion of the current profile
	*/
	handleProfileDelete: function() {
		var status = profiles.remove(profiles.name);

		if (status == constants.io.success) {
			popups.showMessage('Information', 'Profile deleted successfully', constants.popups.ok, ui.setScreen, constants.ui.wrapperHome);
		}
		else {
			popups.showMessage('Error', 'An error occurred while deleting the profile', constants.popups.ok);
		}
	},

	/**
	* Handles deletion of a test case
	*
	* @param id	Test case ID
	*/
	handleTestDelete: function(id) {
		profiles.deleteTest(id);
		profiles.sync();

		ui.openProfile();
	},

	/**
	* Sets the currently active screen
	*
	* @param screen	Active screen name
	*/
	setScreen: function(screen) {
		switch(screen) {
			case constants.ui.wrapperHome:
				$('#wrapper-profile').fadeOut(function() {
					$('#wrapper-home').fadeIn();
					ui.load();
				});
				break;

			case constants.ui.wrapperProfile:
				$('#wrapper-home').fadeOut(function() {
					$('#wrapper-profile').fadeIn();
					ui.load();
				});
				break;
		}
	},

	/**
	* Toggles availability of a button based on control data
	*
	* @param control		The control on which the button depends on
	* @param button			The button to be toggled
	* @param originalVal	Original value of the control
	*/
	toggleButton: function(control, button, originalVal) {
		$(control)
			.off('keyup change')
			.on('keyup change', function() {
				var value = $(this).val();
				originalVal = originalVal !== undefined ? originalVal : '';

				if (value != originalVal) {
					$(button).removeAttr('disabled');
				}
				else {
					$(button).attr('disabled', 'disabled');
				}
			});

		// Assuming default value, disable the button
		$(button).attr('disabled', 'disabled');
	},
};

/**
* This is the entry point for all scripts
*/
$(ui.load);