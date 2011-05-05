enyo.kind({
	name: "Spaz.AvatarButton",
	kind: "CustomButton",
	className: "enyo-button-avatar",
	published: {
		avatar: ""	
	},
	events: {
		onShowAccountColumns: ""	
	},
	components: [
		{kind: "Image", width: "100%", height: "100%", onclick: "imgClick", src: ""}
	],
	create: function(){
		this.inherited(arguments);
		this.avatarChanged();
	},
	imgClick: function(inSender, inEvent){
		console.log("img click");
		this.doShowAccountColumns(inEvent);	//this does not propogate for some reason...
	},
	avatarChanged: function(){
		this.$.image.setSrc(this.avatar);
	},
	focusOne: function(avatar){
		if(this.avatar === avatar){
			this.setDepressed(true);
		} else {
			this.setDepressed(false);			
		}
	},
});