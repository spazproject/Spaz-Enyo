if (!window.AppUtils) { window.AppUtils = {}; }

/**
 * define a placeholder $L() method to handle future localization
 */
if (!$L) {
	var $L = function(str) {
		return str;
	};
}

AppUtils.getAppObj = function() {
	return window.App;
}


/**
 * converts various items in a timeline entry's text into clickables
 * @param {string} str
 * @return {string}
 */
AppUtils.makeItemsClickable = function(str) {
	
	str = sch.autolink(str, null, null, 20);
	str = sch.autolinkTwitterScreenname(str, '<span class="username clickable" data-user-screen_name="#username#">@#username#</span>');
	str = sch.autolinkTwitterHashtag(str, '<span class="hashtag clickable" data-hashtag="#hashtag#">##hashtag#</span>');

	
	return str;
};


/**
 * @TODO can we make this generic, working on all systems?
 * 
 * preps an email and opens the compose email scene in the email app
 * 
 * the opts object passed should be of a format like:
 * {
 *	account:{integer, optional},
 *	attachments:{array of file paths, optional},
 *	subject:{string, optional},
 *	msg:{string, optional},
 *	to:{array of email addresses},
 *	cc:{array of email addresses},
 *	bcc:{array of email addresses}
 * }
 * 
 * @param {object} opts
 *	
 */
AppUtils.sendEmail = function(opts) {
	
	
	function makeRecipientObj(address, type, contactDisplay) {
		var to_role	 = 1;
		var cc_role	 = 2;
		var bcc_role = 3;
		
		var role = null;
		
		switch(type) {
			case 'to':
				role = to_role;
				break;
			case 'cc':
				role = cc_role;
				break;
			case 'bcc':
				role = bcc_role;
				break;
			default:
				role = to_role;
		}
		
		var re_obj = {
			'contactDisplay': contactDisplay,
			'role' :role,
			'value':address,
			'type' :'email'
		};
		
		return re_obj;
	};
	
	var to_addresses  = opts.to	 || null;
	var cc_addresses  = opts.cc	 || null;
	var bcc_addresses = opts.bcc || null;
	
	var recipients = [];
	
	if (to_addresses) {
		for (var i=0; i < to_addresses.length; i++) {
			recipients.push( makeRecipientObj(to_addresses[i].address, 'to', to_addresses[i].name) );
		};													
	}														
															
	if (cc_addresses) {										
		for (i=0; i < cc_addresses.length; i++) {		
			recipients.push( makeRecipientObj(cc_addresses[i].address, 'cc', cc_addresses[i].name) );
		};													
	}														
															
	if (bcc_addresses) {									
		for (i=0; i < bcc_addresses.length; i++) {		
			recipients.push( makeRecipientObj(bcc_addresses[i].address, 'bcc', bcc_addresses[i].name) );
		};
	}
	
	var account		= opts.account	   || null; // an integer or null
	var attachments = opts.attachments || null; // an array or null
	var summary		= opts.subject	   || null; // a string or null
	var text		= opts.msg		   || null; // a string or null
	
	
	var email_params = {
		'account':account,
		'attachments':attachments,
		'recipients':recipients,
		'summary':summary,
		'text':text
	};
	

	// THIS NEEDS TO BE REDONE FOR Enyo!
	var email_srvc = opts.controller.serviceRequest(
		'palm://com.palm.applicationManager',
		{
			method: 'open',
			parameters: {
				id: 'com.palm.app.email',
				params: email_params
			}
		}
	);
};


/**
 * Given a theme label, deactivates all themes CSS and activates the chosen theme CSS
 */
AppUtils.setTheme = function(theme) {
	console.error('AppThemes: %j', AppThemes);
	console.error('theme: %s', theme);
	console.error('AppThemes[theme]: %j', AppThemes[theme]);

	if (AppThemes && AppThemes[theme]) {
		
		if (AppThemes[theme].palmtheme == 'dark') {
			jQuery('body').addClass('palm-dark');
		} else {
			jQuery('body').removeClass('palm-dark');
		}
		
		jQuery('link[title="apptheme"]').attr('href', 'stylesheets/'+AppThemes[theme].stylesheet);
	}
};



/**
 * Given a time value and a set of labels, returns a relative or absolute time
 */
AppUtils.getFancyTime = function(time_value, labels, use_dateparse) {

	if (sc.helpers.iswebOS() && App.prefs.get('timeline-absolute-timestamps')) {

		if (use_dateparse === true) {
			parsed_date = new Date.parse(time_value);
		} else {
			parsed_date = new Date(time_value);
		}
		
		var now = new Date();
		var delta = parseInt( (now.getTime() - parsed_date.getTime()) / 1000, 10);
		
		if(delta < (24*60*60)) {
			return Mojo.Format.formatDate(parsed_date, {time: 'short'});
		} else {
			return Mojo.Format.formatDate(parsed_date, 'short');
		}

	} else {
	
		return sch.getRelativeTime(time_value, labels, use_dateparse);
		
	}
};