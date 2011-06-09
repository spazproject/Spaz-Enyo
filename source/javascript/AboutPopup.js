enyo.kind({
	name: "Spaz.AboutPopup",
	kind: "Popup",
	scrim: true,
	modal: true,
	width: "400px",
	events: {
		onClose: "",
	},
	components: [
		{layoutKind: "HFlexLayout", components: [
			{content: "About Spaz"},
			{kind: "Spacer"},
			{kind: "ToolButton", icon: "source/images/icon-close.png", style: "position: relative; bottom: 7px;", onclick: "doClose"}
		]},	
		{kind: "HFlexBox", onclick: "entryClick", components: [
			{kind: "HtmlContent", style: "font-size: 14px", srcId: "aboutContent"}
		]},
		
	],
	create: function(){
		this.inherited(arguments);
	},
	close: function(){
		this.inherited(arguments);
	},
	showAtCenter: function(){
		if(this.lazy) {
			this.validateComponents();
		}
		
		this.openAtCenter();
	},
	entryClick: function(inSender, inEvent) {
		var className = inEvent.target.className;
		if(_.includes(className, "username")){
			var username = inEvent.target.getAttribute('data-user-screen_name') || inEvent.target.innerText.replace("@", "");
			AppUI.viewUser(username, SPAZCORE_SERVICE_TWITTER);
			this.doClose();
		} else if(_.includes(className, "hashtag")){
			AppUI.search(inEvent.target.innerText);
			this.doClose();
		}
	},
});
