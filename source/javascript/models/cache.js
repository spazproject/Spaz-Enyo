window.AppCache = {};

window.AppCache._data = {
	users: new Cache(500),
	entries: new Cache(1000)
};

/**
 *  
 */
window.AppCache.addUser = function(username, service, obj) {
	var key = service+"___"+username;
	AppCache._data.users.setItem(key, obj);
};

/**
 * 
 */
window.AppCache.getUser = function(username, service, account_id, onSuccess, onFailure) {
	var key = service+"___"+username;
	var user_obj = AppCache._data.users.getItem(key);
	
	if (user_obj) {
		onSuccess(user_obj);
		return user_obj;
	} else {
		var twit = AppUtils.makeTwitObj(account_id);

		twit.getUser(
			'@'+username,
			function(user_obj) {
				user_obj = AppUtils.convertToUser(user_obj);
				AppCache.addUser(username, service, user_obj);
				onSuccess(user_obj);
			},
			onFailure
		);
		return null;
	}
};