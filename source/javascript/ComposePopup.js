enyo.kind({
	name: "Spaz.ComposePopup",
	kind: "Popup",
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
	inReplyToId:null, // set this when making a reply to a specific entry
	style: "min-width: 400px;",
	components: [
		{layoutKind: "HFlexLayout", components: [
			{content: "New Entry", style: "padding-bottom: 0px"},
			{kind: "Spacer"},
			{kind: "ToolButton", icon: "source/images/icon-close.png", style: "position: relative; bottom: 7px;", onclick: "doClose"}
		]},
		{kind: "HFlexBox", style: "min-height: 50px", components: [
			{name:"postTextBox", kind: "RichText", alwaysLooksFocused: true, richContent: false, multiline: true, flex: 1, oninput: "postTextBoxInput", hint: "Type message here...", onkeydown: "postTextBoxKeydown", components: [
				{name: "remaining", style: "color: grey; padding-left: 5px;", content: "140"},
			]},
		]},
		{name: "controls", layoutKind: "HFlexLayout", style: "padding-top: 5px", components: [
			{kind: "Button", style: "padding: 0px 5px;", components: [
			   {name: "accountSelection", "kind":"ListSelector", onChange: "onChangeAccount", className: "accountSelection"}
			]},
			{kind: "Spacer", style: "min-width: 50px"},
			{kind: "Button", style: "padding-top: 6px;", label: enyo._$L("Shorten Text"), onclick: "onShortenTextClick"},
			{kind: "Button", style: "padding-top: 6px;", label: enyo._$L("Shorten URLs"), onclick: "onShortenURLsClick"},
			{name: "sendButton", kind: "Button", style: "padding-top: 6px;", label: enyo._$L("Send"), onclick: "onSendClick"}
		]}
	],
	create: function(){
		this.inherited(arguments);
	},
	buildAccounts: function() {

		var allusers = App.Users.getAll();
		this.accounts = [];
		for (var key in allusers) {
			this.accounts.push({
				id:allusers[key].id,
				value: allusers[key].id,
				caption:App.Users.getLabel(allusers[key].id),
				type:allusers[key].type
			});
		}
		this.$.accountSelection.setItems(this.accounts);
		this.$.accountSelection.setValue(this.accounts[0].value);

		var last_posting_account_id = App.Prefs.get('last_posting_account_id');
		if (last_posting_account_id) {
			this.setPostingAccount(last_posting_account_id);
		}
		else {
			this.setPostingAccount(this.accounts[0].value);
		}
	},
	"showAtCenter": function(){
		 this.buildAccounts();
		 this.$.postTextBox.forceFocus();
		 this.openAtCenter();
		 this.applyStyle("width", this.getBounds().width + "px");
	},

	dmUserChanged: function(){
		//this can be set by calling this.$.composePopup.setDmUser({}); (from parent) 
		//this should be cleared on send
		//set flag?
	},
	inReplyTweetChanged: function(){
		//this should be cleared on send
		//set flag?

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
		this.twit.update(this.$.postTextBox.getValue(), null, this.inReplyToId,
			enyo.bind(this, function() {
				this.$.postTextBox.setValue('');
				this.close();
			}),
			function() {
				//@TODO report error info
				alert('failed');
			}
		);
	},

	onShortenTextClick: function(inSender) {
		this.$.postTextBox.setValue(new SpazShortText().shorten(this.$.postTextBox.getValue()));
		this.$.postTextBox.forceFocus();
		this.postTextBoxInput();
	},
	
	onShortenURLsClick: function(inSender) {
		//@TODO Hardcoding to use jmp for now, we should grab this from a pref
		var urls = sc.helpers.extractURLs(this.$.postTextBox.getValue());
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
			})
		});
	},
	
	postTextBoxInput: function(inSender, inEvent, inValue) {
		if (!inValue) {
			var inValue = this.$.postTextBox.getValue();
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
	
	postTextBoxKeydown: function(inSender, inEvent) {
		if (inEvent.keyCode === 13) {
			if(this.$.sendButton.disabled === false){
				// Enter to send - this should be a pref evenutally.
				this.onSendClick();
			}
			inEvent.preventDefault();	
			
		}
	},
	
	
	
	replyTo: function(opts) {
		
		this.showAtCenter();
		
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

		// try to select the text in order to position the cursor at the end
		var textlen = this.$.postTextBox.getValue().length;
		var selection = {start:textlen-1, end:textlen};
		this.$.postTextBox.setSelection(selection);
		this.postTextBoxInput();
		
		
	
	},
	
	
	directMessage: function(opts) {
		
		this.showAtCenter();
		
		opts = sch.defaults({
			'to':null,
			'text':null,
			'message':null,
			'account_id':null
		}, opts);
		
	},
	
	
	retweet: function(opts) {
		
		this.showAtCenter();
		
		opts = sch.defaults({
			'message':null,
			'account_id':null
		}, opts);
	},
	
	
	retweetOldSchool: function(opts) {
		
		this.showAtCenter();
		
		opts = sch.defaults({
			'message':null,
			'account_id':null
		}, opts);
	},
	
	
	quoteMessage: function(opts) {
		
		this.showAtCenter();
		
		opts = sch.defaults({
			'message':null,
			'account_id':null
		}, opts);
	}
	
	
});

