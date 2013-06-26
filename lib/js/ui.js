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
					return false;
				}

				popups.showMessage('Error', 'An error occurred while loading the profile', constants.popups.ok);
				return false;
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
			.off('keydown')
			.on('keydown', function(key) {
				var text = $(this).val();
				key = key.toChar().replace(/[^a-zA-Z0-9 \-]/g,'').toLowerCase();

				$(this).val(text + key);
			});

		// Handle profile create button click
		$('#profile-new-btn')
			.off('click')
			.on('click', function() {
				var name = $('#profile-new').val();
				var status = profiles.save(name, '[]');

				if (status == constants.io.success) {
					status = profiles.load(name);

					if (status == constants.io.success) {
						ui.openProfile();
						return false;
					}
				}
				else if (status == constants.io.fileExists) {
					popups.showMessage('Error', 'A profile with the same name already exists', constants.popups.ok);
					return false;
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
				$(this).ajaxSubmit({ success: profiles.upload });
				return false;
			});

		// Link the import box to the hidden upload box
		$('#profile-import')
			.off('click')
			.on('click', function() {
				$('#profile-import-file').click();
			});

		$('#profile-import-file')
			.off('change')
			.on('change', function() {
				var file = $(this).val().split('\\').pop();
				$('#profile-import').val(file);
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
					return false;
				}
			}
			else if (status == constants.io.fileExists) {
				popups.showMessage('Error', 'A profile with the same name already exists', constants.popups.ok);
				return false;
			}
		}

		popups.showMessage('Error', 'An error occurred while importing the profile', constants.popups.ok);
		return false;
	},

	/**
	* Sets up event handlers for the profile viewer page
	*/
	loadProfileViewer: function() {
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

						return false;
					}
				}
				else if (status == constants.io.fileExists) {
					popups.showMessage('Error', 'A profile with the same name already exists', constants.popups.ok);
					return false;
				}

				popups.showMessage('Error', 'An error occurred while renaming the profile', constants.popups.ok);
				return false;
			});

		// Handler for profile delete button
		$('#profile-delete')
			.off('click')
			.on('click', function() {
				popups.showMessage('Question', 'Are you sure you want to delete this profile?', constants.popups.yesNo, ui.handleProfileDelete);
				return false;
			});

		// Handler for change profile button
		$('#profile-change')
			.off('click')
			.on('click', function() {
				ui.setScreen(constants.ui.wrapperHome);
				return false;
			});

		// Load the test cases
		$('#test-table > tbody').empty();
		$('#test-no-cases').show();

		$.each(profiles.data, function(i, test) {
			$('#test-table > tbody').append(html.createTestCaseRow(test));
			$('#test-no-cases').hide();
		});
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
	* Opens a profile and loads it to the UI
	*/
	openProfile: function() {
		$('#profile-current').val(profiles.name);

		// Enable rename button only when name is changed
		ui.toggleButton('#profile-current', '#profile-rename', profiles.name);

		// Show the profile screen
		ui.setScreen(constants.ui.wrapperProfile);
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