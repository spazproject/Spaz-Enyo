var LastRead = {};

LastRead.get = function(col_id) {
	return App.Prefs.get('lastread_'+col_id)||1;
};

LastRead.set = function(col_id, date) {
	App.Prefs.set('lastread_'+col_id, date);
};