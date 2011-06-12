if (!window.AppUtils) { window.AppUtils = {}; }

/**
 * define a placeholder $L() method to handle future localization
 */
if (!window.$L) {
	var $L = function(str) {
		return str;
	};
}

AppUtils.getAppObj = function() {
	return window.App;
};


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
	}
	
	var to_addresses  = opts.to	 || null;
	var cc_addresses  = opts.cc	 || null;
	var bcc_addresses = opts.bcc || null;
	
	var recipients = [];
	
	var i;
	if (to_addresses) {
		for (i=0; i < to_addresses.length; i++) {
			recipients.push( makeRecipientObj(to_addresses[i].address, 'to', to_addresses[i].name) );
		}
	}														
															
	if (cc_addresses) {			
		for (i=0; i < cc_addresses.length; i++) {
			recipients.push( makeRecipientObj(cc_addresses[i].address, 'cc', cc_addresses[i].name) );
		}
	}														
															
	if (bcc_addresses) {									
		for (i=0; i < bcc_addresses.length; i++) {		
			recipients.push( makeRecipientObj(bcc_addresses[i].address, 'bcc', bcc_addresses[i].name) );
		}
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
	
	var email_srvc = new enyo.PalmService({
		service: 'palm://com.palm.applicationManager/',
		method: 'open',
	});
	email_srvc.call({
		id: 'com.palm.app.email',
		params: email_params
	});
};


AppUtils.emailTweet = function(tweetobj) {
	var message = "From @" + tweetobj.author_username + ":<br><br>"
				+ sch.autolink(tweetobj.text_raw) + "<br><br>"
				+ sch.autolink("Shared from Spaz HD http://getspaz.com")+"\n\n";
	AppUtils.sendEmail({
		msg: message,
		subject: "A tweet by @" + tweetobj.author_username + " shared from Spaz HD"
	});
};


AppUtils.SMSTweet = function(tweetobj) {	
	var message = ""
				+ "From @" + tweetobj.author_username + ":\n"
				+ tweetobj.text_raw + "\n\n"
				+ "Shared from Spaz HD http://getspaz.com\n\n";
	
	var sms_srvc = new enyo.PalmService({
		service: 'palm://com.palm.applicationManager/',
		method: 'open',
	});
	sms_srvc.call({
		id: "com.palm.app.messaging",
		params: {
			compose: {
				messageText: message
			}
		}
	});
};


AppUtils.copyTweet = function(tweetobj) {
    enyo.dom.setClipboard(tweetobj.text);
    AppUtils.showBanner(enyo._$L("Post copied to clipboard"));
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

	if (sc.helpers.iswebOS() && App.Prefs.get('timeline-absolute-timestamps')) {

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


/**
 * Get the avatar image URL for the given account_id.
 */
AppUtils.getAccountAvatar = function(account_id, onSuccess, onFailure) {

	if (!window.App.avatarCache) {
		window.App.avatarCache = {};
	}

	if (window.App.avatarCache[account_id]) {
		onSuccess(window.App.avatarCache[account_id]);
		return;
	}

	var twit = AppUtils.makeTwitObj(account_id);
	var username = App.Users.get(account_id).username;

	console.log(username);

	twit.getUser(
		'@'+username,
		function(data) {
			var av_url = data.profile_image_url;
			window.App.avatarCache[account_id] = av_url;
			onSuccess(av_url);
		}, function(xhr, msg, exc) {
			onFailure(xhr, msg, exc);
		}
	);

};

AppUtils.getAccount = function(account_id, onSuccess, onFailure) {

	if (!window.App.avatarCache) {
		window.App.avatarCache = {};
	}
	/* @TODO: cache?

	if (window.App.avatarCache[account_id]) {
		onSuccess(window.App.avatarCache[account_id]);
		return;
	}
	*/

	var twit = AppUtils.makeTwitObj(account_id);
	var username = App.Users.get(account_id).username;

	console.log(username);

	twit.getUser(
		'@'+username,
		function(data) {
			window.App.avatarCache[account_id] = data.profile_image_url; //cache the avatar here for now.
			onSuccess(data);
		}, function(xhr, msg, exc) {
			onFailure(xhr, msg, exc);
		}
	);

};


/**
 * Retrieves the custom API url for the current account, or the account with the passed id
 */
AppUtils.getCustomAPIUrl = function(account_id) {

	var custom_api_url = App.Users.getMeta(account_id, 'twitter-api-base-url');
	if (!custom_api_url) {
		// used to be called api-url, so try that
		custom_api_url = App.Users.getMeta(account_id, 'api-url');
	}
	return custom_api_url;
};



AppUtils.makeTwitObj = function(account_id) {

	var twit = new SpazTwit({
		'timeout':1000*60
	});
	twit.setSource(App.Prefs.get('twitter-source'));
		
	var auth;
	if (account_id) {
		if ( (auth = App.Users.getAuthObject(account_id)) ) {
			twit.setCredentials(auth);
			if (App.Users.getType(account_id) === SPAZCORE_ACCOUNT_CUSTOM) {
				twit.setBaseURL(AppUtils.getCustomAPIUrl(account_id));
			} else {
				twit.setBaseURLByService(App.Users.getType(account_id));
			}
		}		
	} else {
		// AppUtils.showBanner('NOT seetting credentials for!');
	}

	return twit;

};



AppUtils.getAuthObj = function(account_id) {
	var auth = App.Users.getAuthObject(account_id);
	return auth;
};


AppUtils.convertToUser = function(srvc_user) {
	
	var user = {};
	
	user.spaz_id     = sch.UUID();	
	user.username    = srvc_user.screen_name;
	user.description = srvc_user.description;
	user.fullname    = srvc_user.name;
	user.service 	 = srvc_user.SC_service;
	user.service_id  = srvc_user.id;
	user.avatar      = srvc_user.profile_image_url;
	user.avatar_bigger = AppUtils.getBiggerAvatar(user);
	user.url         = srvc_user.url;
	user._orig       = _.extend({},srvc_user);
	
	
	
	//following: true
	return user;
};


/**
 * This converts an item from a given service into 
 * a common structure we use for everything internally
 */
AppUtils.convertToEntry = function(item) {
	
	var entry = {};

	if (!item.SC_service) {
		item.SC_service = SPAZCORE_SERVICE_TWITTER;
	}

	switch(item.SC_service) {
		
		case SPAZCORE_SERVICE_TWITTER:
		case SPAZCORE_SERVICE_IDENTICA:
		case SPAZCORE_SERVICE_CUSTOM:

			entry.service       = item.SC_service;
			entry.service_id    = item.id;
			entry.spaz_id       = sch.UUID();
			entry.text          = item.text;
			entry.text_raw      = item.SC_text_raw;
			entry.publish_date  = item.SC_created_at_unixtime;
			
			if (item.SC_is_dm) {
				entry.author_username = item.sender.screen_name;
				entry.author_description = item.sender.description;
				entry.author_fullname = item.sender.name;
				entry.author_id  = item.sender.id;
				entry.author_avatar = item.sender.profile_image_url;
				entry.author_url = item.sender.url;

				entry.recipient_username = item.recipient.screen_name;
				entry.recipient_description = item.recipient.description;
				entry.recipient_fullname = item.recipient.name;
				entry.recipient_id  = item.recipient.id;
				entry.recipient_avatar = item.recipient.profile_image_url;
				
				entry.is_private_message = true;

			} else {
				
				if (item.SC_is_retweet) { // Twitter API retweets are a curious circumstance
					
					entry.is_repost = true;
					
					entry.text          = item.retweeted_status.text;
					entry.text_raw      = item.retweeted_status.text;
					
					entry.repost_orig_date  = sc.helpers.httpTimeToInt(item.retweeted_status.created_at);
					entry.repost_orig_id    = item.retweeted_status.id;
					
					entry.author_username = item.retweeted_status.user.screen_name;
					entry.author_description = item.retweeted_status.user.description;
					entry.author_fullname = item.retweeted_status.user.name;
					entry.author_id  = item.retweeted_status.user.id;
					entry.author_avatar = item.retweeted_status.user.profile_image_url;
					entry.author_url = item.retweeted_status.user.url;
					
					entry.reposter_username = item.user.screen_name;
					entry.reposter_description = item.user.description;
					entry.reposter_fullname = item.user.name;
					entry.reposter_id  = item.user.id;
					entry.reposter_avatar = item.user.profile_image_url;
					entry.reposter_url = item.user.url;
					
					if (item.retweeted_status.in_reply_to_screen_name) {
						entry.recipient_username = item.retweeted_status.in_reply_to_screen_name;
						entry.recipient_id  = item.retweeted_status.in_reply_to_user_id;
					}

					if (item.retweeted_status.in_reply_to_status_id) {
						entry.in_reply_to_id = item.retweeted_status.in_reply_to_status_id;
					}
					
				} else {
					
					entry.author_username = item.user.screen_name;
					entry.author_description = item.user.description;
					entry.author_fullname = item.user.name;
					entry.author_id  = item.user.id;
					entry.author_avatar = item.user.profile_image_url;

					if (item.SC_is_reply) {
						entry.is_mention = true; // mentions the authenticated user
					}

					if (item.in_reply_to_screen_name) {
						entry.recipient_username = item.in_reply_to_screen_name;
						entry.recipient_id  = item.in_reply_to_user_id;
					}

					if (item.in_reply_to_status_id) {
						entry.in_reply_to_id = item.in_reply_to_status_id;
					}
					
					if (item.favorited) {
						entry.is_favorite = true;
					} else {
						entry.is_favorite = false;
					}					

				}

			}
			
			entry.author_avatar_bigger = AppUtils.getBiggerAvatar(entry);
			
			// copy to _orig
			entry._orig = _.extend({},item);

			break;
			
		default:
			break;
	}

	return entry;

};


AppUtils.setAdditionalEntryProperties = function(entries, account_id) {
	// add in the account used to get this entry. this seems sloppy here.
	for (var j = entries.length - 1; j >= 0; j--){
		entries[j].account_id = account_id;
		
		var acc_username = App.Users.get(account_id).username;
		var acc_service  = App.Users.get(account_id).type;
		
		if (acc_username.toLowerCase() === entries[j].author_username.toLowerCase()
			&& acc_service === entries[j].service) {
			entries[j].is_author = true;
		}

	}
	return entries;
};


AppUtils.getBiggerAvatar = function(entry_or_user) {
	var bigger_url, username, avatar_url;
	
	if (entry_or_user.author_username) { // is entry
		username = entry_or_user.author_username;
		avatar_url = entry_or_user.author_avatar;
	} else { // is user
		username = entry_or_user.username;
		avatar_url = entry_or_user.avatar;	
	}
	
	
	switch(entry_or_user.service) {
		case SPAZCORE_SERVICE_TWITTER:
			bigger_url = avatar_url.replace(/_normal\.([a-zA-Z]+)$/, "_bigger.$1");
			break;
		case SPAZCORE_SERVICE_IDENTICA: // we abuse their API to get a 302 to the proper URL
			bigger_url = 'http://identi.ca/api/users/profile_image/'+username+'.json?size=bigger';
			break;
		default: // no idea.
			bigger_url = avatar_url;
	}
	
	return bigger_url;
};


AppUtils.convertToEntries = function(item_array) {
	
	for (var i = 0; i < item_array.length; i++) {
		item_array[i] = AppUtils.convertToEntry(item_array[i]);
	};

	return item_array;
};




AppUtils.showBanner = function(inMessage, timeout, waitForMove) {
	window.humane.timeout = timeout||1500;
	window.humane.waitForMove = waitForMove||false;
	enyo.windows.addBannerMessage(inMessage, "{}");
	humane(inMessage);
};



AppUtils.showDashboard = function(opts) {
	
	opts = sch.defaults({
		icon:'icon.png',
		title:$L('Dashboard Title'),
		text:$L('This is the dashboard message'),
		duration:null,
		onClick:null
	}, opts);
	
	switch (AppUtils.getPlatform()) {
		
		case SPAZCORE_PLATFORM_WEBOS:
			window.enyo.$.spaz.pushDashboard(opts.icon, opts.title, opts.text);
			break;
		
		case SPAZCORE_PLATFORM_TITANIUM:
			var ntfy = Titanium.Notification.createNotification();
			ntfy.setMessage(opts.text);
			ntfy.setIcon(opts.icon||null);
			ntfy.setTimeout(opts.duration||null);
			ntfy.setTitle(opts.title);
			ntfy.setCallback(function () {
				if (opts.onClick) {
					opts.onClick();
				}
			});	
			ntfy.show();
			break;
		
		default:
			if (window.webkitNotifications) {
				if (window.webkitNotifications.checkPermission() === 0) {
					window.webkitNotifications.createNotification(opts.icon, opts.title, opts.text).show();
				} else {
					// this can't be raised by a non-user action.
					window.webkitNotifications.requestPermission();
				}
			}
			break;
		
	}
};


AppUtils.getPlatform = function() {
	var platform;
	platform = sch.getPlatform();
	return platform;
};



AppUtils.getQueryVars = function(qstring) {
	var qvars = [];
	var qvars_tmp = qstring.split('&');
	for (var i = 0; i < qvars_tmp.length; i++) {;
		var y = qvars_tmp[i].split('=');
		qvars[y[0]] = decodeURIComponent(y[1]);
	};
	return qvars;
};
