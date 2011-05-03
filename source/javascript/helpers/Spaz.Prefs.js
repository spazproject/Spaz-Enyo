/*
	Namespace for prefs helpers
*/
Spaz.Prefs = {};


/**
 * retrieves the username for the current account 
 */
Spaz.Prefs.getUsername = function(acc_id) {
		
	if (!acc_id) {
		acc_id = Spaz.Prefs.getCurrentAccountId();
	}

	if (acc_id) {
		var accobj = Spaz.getAppObj().accounts.get(acc_id);
		return !!accobj ? accobj.username : null;
	} else {
		return null;
	}

};

/**
 * DEPRECATED; calls Spaz.Prefs.getAuthKey
 */
Spaz.Prefs.getPassword = function(acc_id) {
	sch.error('Spaz.Prefs.getPassword is deprecated; use Spaz.Prefs.getAuthKey');
	return Spaz.Prefs.getAuthKey(acc_id);
};

/**
 * Returns the current account's auth key 
 */
Spaz.Prefs.getAuthKey = function(acc_id) {
	if (!acc_id) {
		acc_id = Spaz.Prefs.getCurrentAccountId();
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
Spaz.Prefs.getAuthObject = function(acc_id) {
	var authkey = Spaz.Prefs.getAuthKey(acc_id);
	Mojo.Log.error('getAuthObject authkey: %s', authkey);
	
	if (authkey) {
		var auth = new SpazAuth(Spaz.Prefs.getAccountType(acc_id));
		Mojo.Log.error('Spaz.Prefs.getAccountType(): %s', Spaz.Prefs.getAccountType(acc_id));
		Mojo.Log.error('auth: %j', auth);
		auth.load(authkey);
		return auth;
	} else {
		return null;
	}
};

/**
 * Returns the current account's type, or that of the passed id
 */
Spaz.Prefs.getAccountType = function(acc_id) {
	if (!acc_id) {
		acc_id = Spaz.Prefs.getCurrentAccountId();
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
Spaz.Prefs.getCustomAPIUrl = function(acc_id) {
	if (!acc_id) {
		acc_id = Spaz.Prefs.getCurrentAccountId();
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
Spaz.Prefs.getCurrentAccount = function() {
	var currentAccountId = Spaz.Prefs.getCurrentAccountId();
	if (currentAccountId) {
		return Spaz.getAppObj().accounts.get(currentAccountId);
	} else {
		return null;
	}

};


Spaz.Prefs.getCurrentAccountId = function() {
	if (Spaz.getAppObj().userid) {
		return Spaz.getAppObj().userid;
	} else {
		return Spaz.getAppObj().prefs.get('last_userid');
	}
	
};