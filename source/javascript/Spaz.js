enyo.kind({
	name: "Spaz",
	kind: enyo.VFlexBox,
	height: "100%",
	components: [
		{kind: "SlidingPane", flex: 1, components: [
			{name: "accounts", kind: "Spaz.Accounts", onToggleSlider: "toggleSlider"},
			{name: "timeline", kind: "Spaz.Timeline", onTweetClick: "tweetClick"},
			//{name: "tweetview", kind: "Spaz.TweetView"}
		]}
	],
	tweetClick: function(inSender, tweet){
		//this.$.tweetview.create();
		if(!this.$.tweetview){
			this.$.slidingPane.createComponent({name: "tweetview", kind: "Spaz.TweetView", onDestroy: "destroyTweetView"}, {owner: this});

			this.$.slidingPane.render();
			this.$.timeline.refreshList();

		} 
		this.$.tweetview.setTweet(tweet);
			//this.$.tweetview.destroy();
		
		
		//this.$.tweetview.open();


		//this.$.timeline.render();
		//this.$.tweetview.render();
		//this.render();
	},
	"toggleSlider": function(inSender, inEvent){
		var focus = this.$.slidingPane.getViewName() === "timeline" ? "accounts" : "timeline";
		this.$.slidingPane.selectViewByName(focus);
	},
	"destroyTweetView": function(inSender, inEvent){
		this.$.tweetview.destroy();

		this.$.slidingPane.render();
		this.$.timeline.refreshList();
	},
	resizeHandler: function() {
		this.$.slidingPane.resize();
	}
});