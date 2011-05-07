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
		inReplyTweet: "" // use this to display the tweet being replied to
	},
	inReplyToId:null, // set this when making a reply to a specific entry
	style: "min-width: 400px;",
	components: [
		{layoutKind: "HFlexLayout", components: [
			{content: "New Entry", style: "padding-bottom: 0px"},
			{kind: "Spacer"},
			{kind: "ToolButton", icon: "source/images/icon-close.png", style: "position: relative; bottom: 7px;", onclick: "doClose"}
		]},
		{kind: "InputBox", style: "min-height: 50px", components: [
		    //{kind: "Input", hint: "entry...", className: "enyo-input-inner", onchange: "inputChange", onfocus: "inputFocus"},
		    {name:"postTextBox", kind: "BasicRichText", richContent: false, multiline: true, flex: 1, className: "enyo-input-inner"},
		    {content: "140"}
		]},
		{name: "controls", layoutKind: "HFlexLayout", style: "padding-top: 5px", components: [
			{"kind":"Button","style":"padding: 0px 5px; position: relative; bottom: 7px;","components":[
			   {name: "accountSelection", "kind":"ListSelector", onChange: "onChangeAccount", className: "accountSelection"}
			]},
			{kind: "Spacer", style: "min-width: 50px"},
			{kind: "Button", label: "Send", onclick: "onSendClick"}
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

	updateCharCount:function() {
		//@TODO	
	},

	onSendClick: function(inSender) {
		var self = this;

		this.twit.update(this.$.postTextBox.value, null, this.inReplyToId,
			function() {
				self.$.postTextBox.setValue('');
				self.close();
			},
			function() {
				//@TODO report error info
				alert('failed');
			}
		);
	}
});