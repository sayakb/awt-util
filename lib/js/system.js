/**
* Automatic Web Testing Utility
* @ver 0.1
* @license BSD License - www.opensource.org/licenses/bsd-license.php
*
* Copyright (c) 2013 Sayak Banerjee <mail@sayakbanerjee.com>
* All rights reserved. Do not remove this copyright notice.
*/

/**
* General system operations
*/
var system = {
	/**
	* Executed on global load
	*/
	load: function() {
		// If we don't have currentProfile set, we are on index page
		if ($.isEmptyObject(profiles.current)) {
			system.handleProfileSelect();
			system.handleProfileCreate();
			system.handleProfileImport();
		}
		else {
		}
	},

	/**
	* Loads the existing profiles list and handled selection
	*/
	handleProfileSelect: function() {
		var list = profiles.list();

		if (!$.isEmptyObject(list)) {
			$('#profile-list').html('');

			$.each(list, function(index, item) {
				$('#profile-list').append('<option>' + item + '</option>');
			});
		}
	},

	/**
	* Performs all operations needed for new profile creation
	*/
	handleProfileCreate: function() {
		// Allow limited characters for the new name box
		$('#profile-new').keyup(function() {
			var text =  $(this).val();
			var filterText = text.replace(/[^a-zA-Z0-9 \-]/g,'').toLowerCase();

			$(this).val(filterText);
		});
	},

	/**
	* Set up the upload triggers
	*/
	handleProfileImport: function() {
		// Handle form submission for file upload
		$('#profile-form').submit(function() {
			$(this).ajaxSubmit({ success: profiles.import });
			return false;
		});

		// Handle 'import' button validation
		$('#profile-import-btn').click(function() {
			if ($('#profile-import-file').val() == '') {
				popups.showMessage('Error', 'Please select a file to import', constants.popups.ok);
				return false;
			}
		});

		// Link the import box to the hidden upload box
		$('#profile-import').click(function() {
			$('#profile-import-file').click();
		});

		$('#profile-import-file').change(function() {
			var file = $(this).val();
			$('#profile-import').val(file);
		});
	}
};

/**
* This is the entry point for all scripts
*/
$(system.load);