enyo.kind({
	name: "Spaz.SearchPopup",
	kind: "Popup",
	scrim: true,
	modal: true,
	width: "400px",
	events: {
		onClose: ""
	},
	components: [
		{layoutKind: "HFlexLayout", components: [
			{content: "Search"},
			{kind: "Spacer"},
			{kind: "ToolButton", icon: "source/images/icon-close.png", style: "position: relative; bottom: 7px;", onclick: "doClose"}
		]},	
		{kind: "HFlexBox", components: [
			{name:"postTextBox", kind: "RichText", alwaysLooksFocused: true, richContent: false, hint: "Enter query here...", multiline: false, flex: 1, onkeydown: "searchBoxKeydown", components: [
				{kind: "Button", content: "Search", onclick: "search"}
			]},
		]},
		{kind: "Scroller", height: "0px", horizontal: false, autoHorizontal: false, components: [
			{name: "searchResultsList", kind: "VirtualRepeater", onGetItem: "getItem", components: [
		        {name: "item", kind: "Spaz.Entry"}
		    ]}	
		]}
		
	],
	create: function(){
		this.inherited(arguments);
	},
	"showAtCenter": function(){
		 this.openAtCenter();
	},
	searchBoxKeydown: function(inSender, inEvent) {
		if (inEvent.keyCode === 13) {
			// Enter to send - this should be a pref evenutally.
			this.search();
			inEvent.preventDefault();	
			
		}
	},
	search: function(inValue){
		var searchTerm = inValue || this.$.postTextBox.getValue()
			, self = this;
		var account = App.Users.get(App.Users.getAll()[0].id);
		var auth = new SpazAuth(account.type);
		auth.load(account.auth);

		self.twit = new SpazTwit();
		self.twit.setBaseURLByService(account.type);
		self.twit.setSource(App.Prefs.get('twitter-source'));
		self.twit.setCredentials(auth);

		self.twit.search(searchTerm, 1, 200, null, null, null,
			function(data) {
				data = _.reject(data, function(item) {
					for (var i = 0; i < self.entries.length; i++) {
						if (item.id === self.entries[i].service_id) {
							return true;
						}
					};
				});

				/* convert to our internal format */
				data = AppUtils.convertToEntries(data);
				

				self.entries = [].concat(data.reverse(), self.entries);
				self.entries.sort(function(a,b){
					return b.service_id - a.service_id; // newest first
				});
				self.$.scroller.applyStyle("height", "400px");
				self.$.searchResultsList.render();
				self.resizeHandler();
			}
			//onFail loadFinished
		);
	},
	entries: [],
	getItem: function(inSender, inIndex) {
		if (this.entries[inIndex]) {
			var entry = this.entries[inIndex];
			this.$.item.setEntry(entry);
			
			//this.$.item.applyStyle("background-color", inSender.isSelected(inIndex) ? "rgba(218,235,251,0.4)" : null);

			return true;
		}
	},
});