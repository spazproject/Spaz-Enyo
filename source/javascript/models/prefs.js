/*
	Namespace for prefs helpers
*/
AppPrefs = {};


/**
 * retrieves the username for the current account 
 */
AppPrefs.getUsername = function(acc_id) {
		
	if (!acc_id) {
		acc_id = AppPrefs.getCurrentAccountId();
	}

	if (acc_id) {
		var accobj = Spaz.getAppObj().accounts.get(acc_id);
		return !!accobj ? accobj.username : null;
	} else {
		return null;
	}

};

/**
 * DEPRECATED; calls AppPrefs.getAuthKey
 */
AppPrefs.getPassword = function(acc_id) {
	sch.error('AppPrefs.getPassword is deprecated; use AppPrefs.getAuthKey');
	return AppPrefs.getAuthKey(acc_id);
};

/**
 * Returns the current account's auth key 
 */
AppPrefs.getAuthKey = function(acc_id) {
	if (!acc_id) {
		acc_id = AppPrefs.getCurrentAccountId();
	}

	sch.debug('getAuthKey acc_id:'+acc_id);
	if (acc_id) {
		var accobj = Spaz.getAppObj().accounts.get(acc_id);
		return !!accobj ? accobj.auth : null;
	} else {
		return null;
	}	
};

/**
 * Returns a SpazAuth object based on the current user's type and auth key 
 */
AppPrefs.getAuthObject = function(acc_id) {
	var authkey = AppPrefs.getAuthKey(acc_id);
	console.error('getAuthObject authkey: %s', authkey);
	
	if (authkey) {
		var auth = new SpazAuth(AppPrefs.getAccountType(acc_id));
		console.error('AppPrefs.getAccountType(): %s', AppPrefs.getAccountType(acc_id));
		console.error('auth: %j', auth);
		auth.load(authkey);
		return auth;
	} else {
		return null;
	}
};

/**
 * Returns the current account's type, or that of the passed id
 */
AppPrefs.getAccountType = function(acc_id) {
	if (!acc_id) {
		acc_id = AppPrefs.getCurrentAccountId();
	}

	if (acc_id) {
		var accobj = Spaz.getAppObj().accounts.get(acc_id);
		return !!accobj ? accobj.type : null;
	} else {
		return null;
	}

};


/**
 * Retrieves the custom API url for the current account, or the account with the passed id
 */
AppPrefs.getCustomAPIUrl = function(acc_id) {
	if (!acc_id) {
		acc_id = AppPrefs.getCurrentAccountId();
	}
	
	var custom_api_url = Spaz.getAppObj().accounts.getMeta(acc_id, 'twitter-api-base-url');
	if (!custom_api_url) {
		// used to be called api-url, so try that
		custom_api_url = Spaz.getAppObj().accounts.getMeta(acc_id, 'api-url');
	}
	return custom_api_url;
};


/**
 * Returns the current account object
 */
AppPrefs.getCurrentAccount = function() {
	var currentAccountId = AppPrefs.getCurrentAccountId();
	if (currentAccountId) {
		return Spaz.getAppObj().accounts.get(currentAccountId);
	} else {
		return null;
	}

};


AppPrefs.getCurrentAccountId = function() {
	if (Spaz.getAppObj().userid) {
		return Spaz.getAppObj().userid;
	} else {
		return Spaz.getAppObj().prefs.get('last_userid');
	}
	
};