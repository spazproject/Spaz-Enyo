enyo.kind({
	name: "Spaz",
	kind: enyo.HFlexBox,
	height: "100%",
	components: [
		//{kind: "Pane", dragAnywhere: false, flex: 1, components: [
			{name: "sidebar", kind: "Spaz.Sidebar"},
			{name: "timeline", kind: "Spaz.Timeline", onTweetClick: "tweetClick"},
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
			this.$.timeline.refreshList();

		} 
		this.$.tweetview.setTweet(tweet);
		
		//this.$.tweetview.destroy();
		
		
		//this.$.tweetview.open();


		//this.$.timeline.render();
		//this.$.tweetview.render();
		//this.render();
	},
	"destroyTweetView": function(inSender, inEvent){
		this.$.tweetview.destroy();

		//this.$.timeline.render();
		//this.$.timeline.refreshList();
	},
	resizeHandler: function() {
		this.$.timeline.resizeHandler();
	}
});