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
			{name:"postTextBox", kind: "RichText", richContent: false, multiline: false, flex: 1, onkeydown: "searchBoxKeydown"},
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
			if(this.$.sendButton.disabled === false){
				// Enter to send - this should be a pref evenutally.
				this.onSendClick();
			}
			inEvent.preventDefault();	
			
		}
	}
});