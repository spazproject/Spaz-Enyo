enyo.kind({
	name: "Spaz.AvatarButton",
	kind: "CustomButton",
	className: "enyo-button-avatar",
	published: {
		avatar: ""	
	},
	components: [
		{kind: "Image", width: "100%", height: "100%", src: ""}
	],
	create: function(){
		this.inherited(arguments);
		this.avatarChanged();
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