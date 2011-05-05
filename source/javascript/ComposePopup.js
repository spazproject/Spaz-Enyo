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
		dmUser: "",
		inReplyTweet: ""	
	},
	style: "min-width: 400px;",
	components: [
		{layoutKind: "HFlexLayout", components: [
			{content: "New Entry", style: "padding-bottom: 0px"},
			{kind: "Spacer"},
			{kind: "ToolButton", icon: "source/images/icon-close.png", style: "position: relative; bottom: 7px;", onclick: "doClose"},
		]},
		{kind: "InputBox", style: "min-height: 50px", components: [
		    //{kind: "Input", hint: "entry...", className: "enyo-input-inner", onchange: "inputChange", onfocus: "inputFocus"},
		    {kind: "BasicRichText", richContent: false, multiline: true, flex: 1, className: "enyo-input-inner"},
		    {content: "140"},
		]},
		{name: "controls", layoutKind: "HFlexLayout", style: "padding-top: 5px", components: [
			{kind: "Button", toggling: true, down: true, label: "@Tibfib"},
			{kind: "Button", toggling: true, label: "@Spaz"},
			{kind: "Spacer", style: "min-width: 50px"},
			{kind: "Button", label: "Send"}
		]}
	],
	create: function(){
		this.inherited(arguments);
	},
	"showAtCenter": function(){
		 this.$.basicRichText.forceFocus();
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
});