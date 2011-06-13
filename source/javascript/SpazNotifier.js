enyo.kind({
	name: "Spaz.Notifier",
	kind: enyo.Component,
	entries: {},
	valid_types: ['entry', 'mention', 'private_message', 'search'],
	addEntry: function(inEntry) {
		
		if (!inEntry.is_author) {
			var account_id = inEntry.account_id;
			var account_label = App.Users.getLabel(inEntry.account_id);
			var service_id = service_id;
			var entry_type = 'notify-newmessages';
			if (inEntry.is_mention) {
				entry_type = 'notify-mentions';
			} else if (inEntry.is_private_message) {
				entry_type = 'notify-dms';
			} else if (inEntry.is_search_result) {
				entry_type = 'notify-searchresults';
			}
		}
		
		if (App.Prefs.get(entry_type)) {
			
			if (!this.entries[account_label]) {
				this.entries[account_label] = {
					'notify-newmessages':[],
					'notify-mentions':[],
					'notify-dms':[],
					'notify-searchresults':[]
				};
			}

			var notify_entry_array = this.entries[account_label][entry_type];

			if (notify_entry_array.indexOf(service_id) === -1) {
				this.entries[account_label][entry_type].push(service_id);
			}
		}
	},
	
	
	raiseNotifications:function() {
		for (var account in this.entries) {
			for (var type in this.entries[account]) {
				var count = this.entries[account][type].length;
				var msg = '';
				var type_label = '';
				if (count > 0) {
					
					switch(type) {
						case 'notify-newmessages':
							type_label = (count > 1) ? 'entries':'entry';
							break;
						case 'notify-mentions':
							type_label = (count > 1) ? 'mentions':'mention';
							break;
						case 'notify-dms':
							type_label = (count > 1) ? 'private messages':'private message';
							break;
						case 'notify-searchresults':
							type_label = (count > 1) ? 'search results':'search result';
							break;
						default:
							type_label = 'entries';
							
					}
					
					msg = enyo.macroize($L('{$count} new {$type_label}'), {'count':count, 'type_label':type_label});
					this.raiseNotification(account, msg);
				}
			}
		}
		
		this.resetCounts();
	},
	
	

	raiseNotification:function(title, message) {
		AppUtils.showDashboard({
			'title':title,
			'text':message
		});
		
	},
	
	resetCounts: function() {
		this.entries = {};
	}
	
});