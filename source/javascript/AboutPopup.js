enyo.kind({
	name: "Spaz.AboutPopup",
	kind: "Popup",
	scrim: true,
	modal: true,
	events: {
		onClose: "",
	},
	components: [
		{kind: "enyo.ToolButton", style: "position: absolute; right: -10px; top: -10px; z-index: 100;", icon: "source/images/icon-close.png", onclick: "doClose"},
		{kind: "enyo.Image", style: "position: absolute; right: 20px; top: 60px; opacity: 0.2; width: 90%; z-index: -100", src: "spaz-icon-flat-512.png"},
		{name: "scroller", kind: "enyo.BasicScroller", width: "500px", height: "600px", onclick: "entryClick", components: [
			{kind: "HtmlContent", style: "font-size: 14px", srcId: "aboutContent"}
		]}
	],
	showAtCenter: function(){
		if(this.lazy) {
			this.validateComponents();
		}
		this.$.scroller.setScrollTop(0);
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
	}
});
