enyo.kind({
	name: "Spaz",
	kind: enyo.HFlexBox,
	height: "100%",
	components: [
		//{kind: "Pane", dragAnywhere: false, flex: 1, components: [
			{name: "sidebar", kind: "Spaz.Sidebar"},
			{name: "container", kind: "Spaz.Container", onTweetClick: "tweetClick"},
			//{name: "tweetview", kind: "Spaz.TweetView"}
		//]}		
	],
	create: function(){
		this.inherited(arguments);	
		//this.$.pane.selectViewByName("timeline");
	},
	tweetClick: function(inSender, tweet){
		//this.$.tweetview.create();
		if(!this.$.tweetview){
			//this.$.pane.createComponent({name: "tweetview", kind: "Spaz.TweetView", onDestroy: "destroyTweetView"}, {owner: this});
			this.createComponent({name: "tweetview", kind: "Spaz.TweetView", onDestroy: "destroyTweetView"}, {owner: this});

			this.render();
			//this.$.container.refreshList();

		} 
		this.$.tweetview.setTweet(tweet);
		
	},
	"destroyTweetView": function(inSender, inEvent){
		this.$.tweetview.destroy();

		//this.$.timeline.render();
		//this.$.timeline.refreshList();
	},
	resizeHandler: function() {
		this.$.container.resizeHandler();
	}
});