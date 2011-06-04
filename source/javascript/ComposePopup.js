enyo.kind({
	name: "Spaz.ComposePopup",
	kind: "Spaz.Popup",
	scrim: true,
	modal: true, //yes/no?
	//width: "400px",
	events: {
		onClose: ""
	},
	published: {
		dmUser: "", // use this to show the user we are direct messaging
		inReplyEntryText: "" // use this to display the tweet being replied to
	},
	isDM: false,
	inReplyToId:null, // set this when making a reply to a specific entry
	width: "500px",
	// showKeyboardWhenOpening:true, // opens the keyboard and positions the popup correctly
	//style: "min-width: 400px;",
	components: [
		{layoutKind: "HFlexLayout", components: [
			{name: "composeHeader", content: "New Entry", style: "padding-bottom: 0px"},
			{kind: "Spacer"},
			{name: "closeButton", kind: "ToolButton", icon: "source/images/icon-close.png", style: "position: relative; bottom: 7px;", onclick: "doClose"}
		]},
		{kind: "HFlexBox", name: "inReplyEntryText", content: "", allowHtml: true, style: "color:#666666; font-size:14px; padding-bottom:1em;" },
		{name: "postTextBoxContainer", kind: "Control", style: "min-height: 50px", components: [
			{name:"postTextBox", kind: "RichText", alwaysLooksFocused: true, richContent: false, multiline: true, flex: 1, oninput: "postTextBoxInput", hint: "Type message here...", onkeydown: "postTextBoxKeydown", onfocus: "postTextBoxFocus", components: [
				{name: "remaining", style: "color: grey; padding-left: 5px;", content: "140"}
			]}
		]},
		{name: "controls", layoutKind: "HFlexLayout", style: "padding-top: 5px", components: [
			{name: "accountSelectionButton", kind: "Button", style: "padding: 0px 5px;", components: [
			   {name: "accountSelection", "kind":"ListSelector", onChange: "onChangeAccount", className: "accountSelection"}
			]},
			{kind: "Spacer", style: "min-width: 50px"},
			{name: "imageButton", kind: "IconButton", icon: "source/images/icon-imageattach.png", onclick: ""},
			{name: "shortenButton", kind: "Spaz.ActivityIconButton", icon: "source/images/icon-shorten.png", style: "padding-top: 6px;", onclick: "onShortenClick"},
			{name: "sendButton", kind: "ActivityButton", style: "min-width: 100px; padding-top: 6px;", label: enyo._$L("Send"), onclick: "onSendClick"}
		]},
		{name: "shortenPopup", kind: "PopupSelect", onSelect:'itemSelect', items: [
			{caption:$L("Shorten URLs"), value:'shortenURLs'},
			{caption:$L("Shorten Text"), value:'shortenText'}
		]}
	],
	create: function(){
		this.inherited(arguments);
	},
	close: function(){
		this.inherited(arguments);
		// enyo.keyboard.setManualMode(false); // closes the keyboard
	},
	buildAccounts: function() {

		var allusers = App.Users.getAll();
		var last_posting_account_id = App.Prefs.get('last_posting_account_id');
		var found_last_posting_account_id = false;
		this.accounts = [];
		for (var key in allusers) {
			if(allusers[key].id === last_posting_account_id) {
				found_last_posting_account_id = true;
			}
			this.accounts.push({
				id:allusers[key].id,
				value: allusers[key].id,
				caption:App.Users.getLabel(allusers[key].id),
				type:allusers[key].type
			});
		}
		this.$.accountSelection.setItems(this.accounts);
		this.setPostingAccount(this.accounts[0].value);

		// Check if the last posting account from prefs is still here.
		// It's possible the account was deleted.
		if ((last_posting_account_id) && (found_last_posting_account_id)) {
			this.setPostingAccount(last_posting_account_id);
		}
		else {
			this.setPostingAccount(this.accounts[0].value);
		}
	},
	showAtCenter: function(){
		if(this.lazy) {
			this.validateComponents();
		}
		this.buildAccounts();
		
		var width = 0;
		_.each(this.accounts, function(account){
			if(account.caption.length > width){
				width = account.caption.length;			
			}
		});
		this.applyStyle("width", 490 + width + "px"); //set the width based on the longest username.

		this.setAllDisabled(false);
		this.$.postTextBoxContainer.setShowing(true);
		
		this.openAtHalfCenter();
		this.$.postTextBox.forceFocus();
		//var width = this.getBounds().width + "px"

	},

	dmUserChanged: function(){
		//this can be set by calling this.$.composePopup.setDmUser({}); (from parent) 
		//this should be cleared on send
		//set flag?
		if (!this.dmUser) {
			this.isDM = false;
		} else {
			this.$.composeHeader.setContent('Message to '+this.dmUser);
			this.isDM = true;
		}
		
	},
	
	inReplyEntryChanged: function(){
		this.$.inReplyEntryText.setContent(this.inReplyEntryText);
		
		if (!this.isDM) { // we can set the irtText when it's a DM too, so check
			if (!this.inReplyToId) {
				this.$.inReplyEntryText.hide();
			} else {
				this.$.composeHeader.setContent('Reply');
				this.$.inReplyEntryText.show();
			}		
		}
		
		
		if (this.inReplyEntryText) {
			this.$.inReplyEntryText.show();
		} else {
			this.$.inReplyEntryText.hide();
		}
		
		
	},
	setPostingAccount: function(account_id) {
		for (var i = 0; i < this.$.accountSelection.items.length; i++) {
			if (this.$.accountSelection.items[i].id === account_id) {
				this.$.accountSelection.setValue(this.$.accountSelection.items[i].value);
				break;
			}
		}

		// make the SpazTwit object
		this.twit = AppUtils.makeTwitObj(account_id);

		// save this for next time
		App.Prefs.set('last_posting_account_id', account_id);
	},
	onChangeAccount: function(inSender, inValue, inOldValue) {
		this.setPostingAccount(inValue);
	},

	onSendClick: function(inSender) {
		this.$.sendButton.setActive(true);
		this.setAllDisabled(true);
		
		if (this.isDM) {
			this.twit.sendDirectMessage('@'+this.dmUser, this.$.postTextBox.getValue(),
				enyo.bind(this, function() {
					this.$.postTextBox.setValue('');
					this.$.sendButton.setActive(false);
					this.setAllDisabled(false);
					AppUI.refresh();
					this.close();
				}),
				enyo.bind(this, function() {
					//@TODO report error info
					AppUtils.showBanner('Sending failed');
					this.$.sendButton.setActive(false);
					this.setAllDisabled(false);
				})
			);			
		} else if(this.isRepost){
		
			this.twit.retweet(
				this.repostEntry.service_id,
				enyo.bind(this, function(data){
					this.repostEntry = null;
					this.isRepost = null;
					
					this.$.sendButton.setActive(false);
					this.setAllDisabled(false);
					AppUI.refresh();					
					this.close();
				}), 
				enyo.bind(this, function(xhr, msg, exc){
					this.$.sendButton.setActive(false);
				})
			);
		} else {
			this.twit.update(this.$.postTextBox.getValue(), null, this.inReplyToId,
				enyo.bind(this, function() {
					this.$.postTextBox.setValue('');
					this.$.sendButton.setActive(false);
					this.setAllDisabled(false);
					AppUI.refresh();
					this.close();
				}),
				enyo.bind(this, function() {
					//@TODO report error info
					AppUtils.showBanner('Sending failed');
					this.$.sendButton.setActive(false);
					this.setAllDisabled(false);
				})
			);			
		}
	},

	onShortenClick: function(inSender) {
		this.$.shortenPopup.openAroundControl(inSender);
	},
	
	itemSelect: function(inSender, inSelected) {
		switch(inSelected.value){
			case "shortenURLs":
				this.onShortenURLsClick();
				break;
			case "shortenText":
				this.onShortenTextClick();
				break;
			default: 
				console.error(inSelected.value + " has no handler");
				break;
		}		
	},
	
	onShortenTextClick: function(inSender) {
		this.$.postTextBox.setValue(new SpazShortText().shorten(this.$.postTextBox.getValue()));
		this.$.postTextBox.forceFocus();
		this.postTextBoxInput();
	},
	
	onShortenURLsClick: function(inSender) {
		//@TODO Hardcoding to use jmp for now, we should grab this from a pref
		var urls = sc.helpers.extractURLs(this.$.postTextBox.getValue());
		if (urls.length > 0) {
			this.$.shortenButton.setActive(true);
			this.$.shortenButton.setDisabled(true);
			
			new SpazShortURL(SPAZCORE_SHORTURL_SERVICE_JMP).shorten(urls, {
				apiopts: {
					version:'2.0.1',
					format:'json',
					login: 'spazcore',
					apiKey: 'R_f3b86681a63a6bbefc7d8949fd915f1d'
				},
				onSuccess: enyo.bind(this, function(inData) {
					this.$.postTextBox.setValue(this.$.postTextBox.getValue().replace(inData.longurl, inData.shorturl));
					this.$.postTextBox.forceFocus();
					this.postTextBoxInput();
					this.$.shortenButton.setActive(false);
					this.$.shortenButton.setDisabled(false);
				}),
				onFailure: enyo.bind(this, function() {
					this.$.shortenButton.setActive(false);
					this.$.shortenButton.setDisabled(false);
				})
			});
		}
	},
	
	postTextBoxInput: function(inSender, inEvent, inValue) {
		if (!inValue) {
			inValue = this.$.postTextBox.getValue();
		}
		var remaining = 140 - inValue.length;
		this.$.remaining.setContent(remaining);
		if(remaining > 0){
			this.$.remaining.applyStyle("color", "grey");
			this.$.sendButton.setDisabled(false);
		} else if(remaining === 0){
			this.$.remaining.applyStyle("color", "black");
			this.$.sendButton.setDisabled(false);
		} else {
			this.$.remaining.applyStyle("color", "red");
			this.$.sendButton.setDisabled(true);
		}
	},
	
	
	clear: function() {
		this.$.postTextBox.setValue('');
		this.dmUser = "";
		this.inReplyEntryText = "";
		this.inReplyToId = null;
		this.$.composeHeader.setContent('New Entry');
		this.postTextBoxInput();
		this.dmUserChanged();
		this.inReplyEntryChanged();
	},
	
	postTextBoxKeydown: function(inSender, inEvent) {
		// RichText.setDisabled(true) doesn't really work, so we'll check
		// if the control is disabled and throw out the event if it is.
		if (inSender.getDisabled()) {
			inEvent.preventDefault();
			return;
		}
		if (inEvent.keyCode === 13) {
			if(this.$.sendButton.disabled === false){
				// Enter to send - this should be a pref evenutally.
				this.onSendClick();
			}
			inEvent.preventDefault();	
			
		}
	},

	postTextBoxFocus: function(inSender, inEvent){
		if(inSender.getDisabled()){
			inSender.forceBlur();
		}
	},
	
	
	compose: function(opts) {
		
		this.showAtCenter();
		
		this.clear();
		
		opts = sch.defaults({
			'text':null,
			'account_id':null
		}, opts);
		
		if (opts.account_id) {
			this.setPostingAccount(opts.account_id);
		}
		
		var text = opts.text;

		this.showAtCenter();

		this.clear();
		
		this.$.postTextBox.setValue(text);
		this.$.postTextBox.forceFocus();
		this.cursorToEnd();

		this.postTextBoxInput();
		this.dmUserChanged();
		this.inReplyEntryChanged();
	},
	
	
	replyTo: function(opts) {
		
		this.showAtCenter();
		
		this.clear();
		
		opts = sch.defaults({
			'to':null,
			'text':null,
			'entry':null,
			'account_id':null,
			'all':false
		}, opts);
		
		var text = '';
		var skip_usernames = [];
		
		if (opts.account_id) {
			this.setPostingAccount(opts.account_id);
		}
		
		if (opts.entry) {
			
			this.inReplyEntryText = opts.entry.text_raw;
			
			this.inReplyToId = opts.entry.service_id;
			
			if (opts.account_id) {
				skip_usernames.push(App.Users.get(opts.account_id).username);
			}
			
			skip_usernames.push(opts.entry.author_username);
			
			var usernames = sch.extractScreenNames(opts.entry.text_raw, skip_usernames);

			// get entry id
			var irt_status_id = opts.entry.service_id;

			var usernames_str = usernames.join(' @');
			if (usernames_str.length > 0) {
				usernames_str = '@'+usernames_str;
			}
			
			text = ['@'+opts.entry.author_username, usernames_str, opts.text].join(' ') + ' ';
			

			
		} else if (opts.to) {
			text = '@'+opts.to;
		} else {
			text = '@';
		}
		
		this.$.postTextBox.setValue(text);
		this.$.postTextBox.forceFocus();
		this.cursorToEnd();


		this.postTextBoxInput();
		this.dmUserChanged();
		this.inReplyEntryChanged();
			
	},
	
	
	directMessage: function(opts) {
		
		this.showAtCenter();
		
		this.clear();

		this.isDM = true;
		
		opts = sch.defaults({
			'to':null,
			'text':null,
			'entry':null,
			'account_id':null
		}, opts);
		
		if (opts.account_id) {
			this.setPostingAccount(opts.account_id);
		}
		
		this.dmUser = opts.to;
		
		var text = opts.text || '';
		
		if (opts.entry) {
			this.inReplyEntryText = opts.entry.text_raw;
		}
		
		this.$.postTextBox.setValue(text);
		this.$.postTextBox.forceFocus();
		this.cursorToEnd();

		// try to select the text in order to position the cursor at the end
		var textlen = this.$.postTextBox.getValue().length;
		var selection = {start:textlen-1, end:textlen};
		this.$.postTextBox.setSelection(selection);

		this.postTextBoxInput();
		this.inReplyEntryChanged();
		this.dmUserChanged();
		
		// AppUtils.showBanner('NYI!');
		
	},
	
	
	repost: function(opts) {

		var self = this;

		this.isRepost = true; 

		this.showAtCenter();
		
		this.clear();

		this.$.composeHeader.setContent('Repost');

		// a superhack to get the components to render
		//this.close();
		
		opts = sch.defaults({
			'entry':null,
			'account_id':null
		}, opts);
		
		if (!opts.entry || !opts.account_id) {
			sch.error("No account and/or entry obj set");
			return;
		}
		this.repostEntry = opts.entry;
		this.setPostingAccount(opts.account_id);
		this.$.inReplyEntryText.show();
		
		this.$.inReplyEntryText.setContent("<span style='font-weight: bold'>@" + opts.entry.author_username + ":</span> " + opts.entry.text);
		this.$.postTextBoxContainer.setShowing(false);
		this.setRepostDisabled(true);


	},
	
	
	repostManual: function(opts) {
		
		this.showAtCenter();
		
		this.clear();
		
		opts = sch.defaults({
			'entry':null,
			'account_id':null
		}, opts);
		
		var text = opts.entry.text_raw;
		var screenname = opts.entry.author_username;

		text = 'RT @' + opts.entry.author_username+' '+opts.entry.text_raw;
		
		this.showAtCenter();

		this.clear();
		
		this.$.postTextBox.setValue(text);
		this.$.postTextBox.forceFocus();
		this.cursorToEnd();

		this.postTextBoxInput();
		this.dmUserChanged();
		this.inReplyEntryChanged();
		this.$.accountSelection.setValue(opts.entry.account_id);
	
	},
	
	
	quoteMessage: function(opts) {
		
		this.showAtCenter();
		
		this.clear();
		
		opts = sch.defaults({
			'message':null,
			'account_id':null
		}, opts);
	},
	
	setAllDisabled: function(inDisabled) {
		enyo.forEach (this.getComponents(),
			function(component) {
				// The closeButton should always remain enabled
				if ((component.setDisabled) && (component.getName() !== "closeButton")) {
					component.setDisabled(inDisabled);
				}
			}
		);
		if(inDisabled){
			this.$.postTextBox.applyStyle("color", "gray");
		} else {
			this.$.postTextBox.applyStyle("color", "black");			
		}
	},
	
	setRepostDisabled: function(inDisabled) {
		enyo.forEach (this.getComponents(),
			function(component) {
				// The closeButton should always remain enabled
				if ((component.setDisabled) && (component.getName() !== "closeButton") && (!_.includes(component.getName(), "accountSelection")) && (component.getName() !== "sendButton")){
					component.setDisabled(inDisabled);
				}
			}
		);
		if(inDisabled){
			this.$.postTextBox.applyStyle("color", "gray");
		} else {
			this.$.postTextBox.applyStyle("color", "black");			
		}
	},
	
	cursorToEnd : function() {
		this.$.postTextBox.forceSelect();
		window.setTimeout(function() {window.getSelection().collapseToEnd();}, 1);
	},

	cursorToStart : function() {
		this.$.postTextBox.forceSelect();
		window.setTimeout(function() {window.getSelection().collapseToStart();}, 1);
	}
	
});

