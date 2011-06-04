enyo.kind({
	name: "Spaz.EntryView",
	kind: "VFlexBox",
	width: "322px",
	published: {
		entry: {}
	},
	events: {
		onAddViewEvent: "",
		onGoPreviousViewEvent: "",
		onDestroy: "",
		onShowImageView: ""
	},
	components: [
		{className: "entry-view", width: "322px", height: "100%", layoutKind: "VFlexLayout", components: [
			{name: "viewManagement", kind: "Toolbar", defaultKind: "Control", onclick: "doGoPreviousViewEvent", className: "viewManagement truncating-text", showing: false, content: "", components: [
				{name: "leftArrowIcon", kind: "Image", src: "source/images/icon-back.png", style: "position: relative; bottom: 1px;"},
				{name: "viewManagementText", content: "", className: "underlineOnClick", style: "color: #ccc; font-size: 14px;"},
				{kind: "Spacer"}

			]},
			{kind: "Header", width: "322px", components: [
				{kind: "VFlexBox", className: "header", components: [
					{kind: "HFlexBox", width: "322px", components: [
						{kind: "Image", width: "75px",  height: "75px", className: "avatar"},
						{width: "10px"},
						{kind: "VFlexBox", height: "75px", flex: 1, components: [
							{kind: "Spacer"},
    						{name: "realname", className: "author-realname truncating-text"},
    						{name: "username", className: "link author-username", onclick: "entryClick"},
    						{name: "url", allowHtml: true, className: "small"},
    						{kind: "Spacer"}
						]},	
						{kind: "ToolButton", icon: "source/images/icon-close.png", style: "position: relative; bottom: 10px; right: 10px; float: right;", onclick: "doDestroy"}	
					]},
					{name: "bio", width: "305px", allowHtml: true, style: "padding-right: 10px", onclick: "entryClick", className: "small"},

				]},
			]},
			//{layoutKind: "HFlexLayout", pack: "center", components: [
		    {kind: "Scroller", name: "detail_scroller", flex: 1, className: "entry-view", components: [
				{kind: "VFlexBox", className: "header", style: "", components: [
						//{kind: "Divider", className: "divider", style: "display: none", caption: ""},
						{name: "entry", allowHtml: true, onclick: "entryClick", className: "message"},
						{name: "small", kind: "HFlexBox", className: "small", style: "padding: 5px 0px",
							components: [
								{name: "time"},
								{content: "from", style: "padding: 0px 3px;"},
								{name: "from",  allowHtml: true}
							]
						},
						{name: "images", kind: "enyo.VFlexBox", align: "center"},
						{name: "repost", allowHtml: true, className: "repost-outer", onclick: "entryClick", showing: false},
						{kind: "ActivityButton", name: "conversation_button", onclick: "toggleDrawer", toggling: true, content: "View Conversation"},
						{kind: "Drawer", name: "conversation_drawer", /*caption: "Conversation",*/ open: false, onOpenChanged: "onConversationOpenChanged", components: [
						    {kind: "Spaz.Conversation", name: "conversation", onStart: "onConversationLoadStart", onDone: "onConversationLoadDone"}
						]}
				]},
				//]},
				
	        ]},
	        {kind: "Toolbar", components: [
				{kind: "Spacer"},
				{kind: "ToolButton", icon: "source/images/icon-reply.png", onclick: "reply"},
				{kind: "ToolButton", disabled: true, icon: "source/images/icon-share.png"},
				{name: "favoriteButton", onclick: "toggleFavorite", kind: "ToolButton", disabled: true, icon: "source/images/icon-favorite.png"},
				{kind: "Spacer"}
			]},
			{name: "browser", kind: "enyo.PalmService", service: "palm://com.palm.applicationManager/", method: "open"}
		]}
	],
	entryChanged: function(){
		
		var self = this;
		
		if(this.$.entry.content !== this.entry.message){

			var events = this.doAddViewEvent({type: (this.entry.is_private_message === true) ? "message" : "entry", entry: this.entry});
		    if(events.length > 1){
		    	this.$.viewManagement.setShowing(true);
		    	var lastEvent = events[events.length-2];
		    	switch (lastEvent.type){
		    		case "user":
			    		this.$.viewManagementText.setContent("Back to @" + lastEvent.user.username);
		    			break;
		    		case "entry":
			    		this.$.viewManagementText.setContent("Back to @" + lastEvent.entry.author_username + "'s Entry");
		    			break;
					case "message":
			    		this.$.viewManagementText.setContent("Back to @" + lastEvent.entry.author_username + "'s Private Message");					
						break;
		    	}
		    } else {
		    	this.$.viewManagement.setShowing(false);		    	
		    }

		    this.$.detail_scroller.setScrollPositionDirect(0,0);
		    
			this.$.image.setSrc(this.entry.author_avatar_bigger);
			this.$.image.applyStyle("display", "");			
			this.$.realname.setContent(this.entry.author_fullname||this.entry.author_username);
			this.$.username.setContent("@" + this.entry.author_username);
			var url = this.entry.author_url || '';
			this.$.url.setContent(sch.autolink(enyo.string.runTextIndexer(url)), url.length);
			this.$.bio.setContent(AppUtils.makeItemsClickable(this.entry.author_description) || '');
			this.$.time.setContent(sch.getRelativeTime(this.entry.publish_date));
			if (this.entry._orig.source) {
				this.$.from.setContent(this.entry._orig.source);
			}
			enyo.forEach (this.$.images.getControls(), function (control) {
				control.destroy();
			});
			this.$.entry.setContent(AppUtils.makeItemsClickable(this.entry.text));
			
			
			// expand URLs
			var shurl = new SpazShortURL();
			var entryhtml = self.$.entry.getContent();
			var urls = shurl.findExpandableURLs(entryhtml);
			if (urls) {
				for (var i = 0; i < urls.length; i++) {
					shurl.expand(urls[i], {
						'onSuccess':function(data) {
							entryhtml = shurl.replaceExpandableURL(entryhtml, data.shorturl, data.longurl)
							self.$.entry.setContent(entryhtml);
							if ((i + 1) >= urls.length) {
								self.buildMediaPreviews();
							}
						}
					});
				}
			} else {
				this.buildMediaPreviews();
			}
			

			
			
			// build conversation
			if(!this.entry.in_reply_to_id) {
			    this.$.conversation_button.hide();
			    this.$.conversation.clearConversationMessages();
			} else {
			    this.$.conversation_button.show();
			    this.$.conversation_button.setDepressed(false);
			    this.$.conversation_drawer.close();
    			this.$.conversation.setEntry(this.entry);
			}

			if(this.entry.is_repost === true){
				this.$.repost.setContent("<span class='repost'>Reposted by <span class='username'>" + this.entry.reposter_username + "</span> " + sch.getRelativeTime(this.entry.publish_date) + "</span>");//@TODO
				this.$.repost.setShowing(true);

				this.$.time.setContent(sch.getRelativeTime(this.entry.repost_orig_date));
			} else {
				this.$.repost.setShowing(false);			
			}
			
			this.setFavButtonState();
		} else {
			this.doDestroy();
		}
	},
	
	
	buildMediaPreviews: function() {
		
		var self = this;
		
		var siu = new SpazImageURL();
		var imageThumbUrls = siu.getThumbsForUrls(this.entry.text);
		var imageFullUrls = siu.getImagesForUrls(this.entry.text);
		this.imageFullUrls = [];
		if ((imageThumbUrls) && (imageThumbUrls.length > 0)) {
			var i = 0;
			for (var imageUrl in imageThumbUrls) {
				var imageComponent = this.$.images.createComponent({
					kind: "enyo.Control",
					owner: this,
					components: [
						{style: "height: 10px;"},
						{name: "imagePreview" + i, kind: "enyo.Image", onclick: "imageClick", src: imageThumbUrls[imageUrl]}
					]
				});
				imageComponent.render();
				this.imageFullUrls.push(imageFullUrls[imageUrl]);
				i++;
			}
		}
		else {
			jQuery('#spaz_entryview_entry').embedly({
				urls:'/http:\/\/(.*yfrog\..*\/.*|tweetphoto\.com\/.*|www\.flickr\.com\/photos\/.*|flic\.kr\/.*|twitpic\.com\/.*|www\.twitpic\.com\/.*|twitpic\.com\/photos\/.*|www\.twitpic\.com\/photos\/.*|.*imgur\.com\/.*|.*\.posterous\.com\/.*|post\.ly\/.*|twitgoo\.com\/.*|i.*\.photobucket\.com\/albums\/.*|s.*\.photobucket\.com\/albums\/.*|phodroid\.com\/.*\/.*\/.*|www\.mobypicture\.com\/user\/.*\/view\/.*|moby\.to\/.*|xkcd\.com\/.*|www\.xkcd\.com\/.*|imgs\.xkcd\.com\/.*|www\.asofterworld\.com\/index\.php\?id=.*|www\.asofterworld\.com\/.*\.jpg|asofterworld\.com\/.*\.jpg|www\.qwantz\.com\/index\.php\?comic=.*|23hq\.com\/.*\/photo\/.*|www\.23hq\.com\/.*\/photo\/.*|.*dribbble\.com\/shots\/.*|drbl\.in\/.*|.*\.smugmug\.com\/.*|.*\.smugmug\.com\/.*#.*|emberapp\.com\/.*\/images\/.*|emberapp\.com\/.*\/images\/.*\/sizes\/.*|emberapp\.com\/.*\/collections\/.*\/.*|emberapp\.com\/.*\/categories\/.*\/.*\/.*|embr\.it\/.*|picasaweb\.google\.com.*\/.*\/.*#.*|picasaweb\.google\.com.*\/lh\/photo\/.*|picasaweb\.google\.com.*\/.*\/.*|dailybooth\.com\/.*\/.*|brizzly\.com\/pic\/.*|pics\.brizzly\.com\/.*\.jpg|img\.ly\/.*|www\.tinypic\.com\/view\.php.*|tinypic\.com\/view\.php.*|www\.tinypic\.com\/player\.php.*|tinypic\.com\/player\.php.*|www\.tinypic\.com\/r\/.*\/.*|tinypic\.com\/r\/.*\/.*|.*\.tinypic\.com\/.*\.jpg|.*\.tinypic\.com\/.*\.png|meadd\.com\/.*\/.*|meadd\.com\/.*|.*\.deviantart\.com\/art\/.*|.*\.deviantart\.com\/gallery\/.*|.*\.deviantart\.com\/#\/.*|fav\.me\/.*|.*\.deviantart\.com|.*\.deviantart\.com\/gallery|.*\.deviantart\.com\/.*\/.*\.jpg|.*\.deviantart\.com\/.*\/.*\.gif|.*\.deviantart\.net\/.*\/.*\.jpg|.*\.deviantart\.net\/.*\/.*\.gif|plixi\.com\/p\/.*|plixi\.com\/profile\/home\/.*|plixi\.com\/.*|m\.plixi\.com\/.*|www\.fotopedia\.com\/.*\/.*|fotopedia\.com\/.*\/.*|photozou\.jp\/photo\/show\/.*\/.*|photozou\.jp\/photo\/photo_only\/.*\/.*|instagr\.am\/p\/.*|instagram\.com\/p\/.*|skitch\.com\/.*\/.*\/.*|img\.skitch\.com\/.*|https:\/\/skitch\.com\/.*\/.*\/.*|https:\/\/img\.skitch\.com\/.*|share\.ovi\.com\/media\/.*\/.*|www\.questionablecontent\.net\/|questionablecontent\.net\/|www\.questionablecontent\.net\/view\.php.*|questionablecontent\.net\/view\.php.*|questionablecontent\.net\/comics\/.*\.png|www\.questionablecontent\.net\/comics\/.*\.png|picplz\.com\/user\/.*\/pic\/.*\/|twitrpix\.com\/.*|.*\.twitrpix\.com\/.*|www\.someecards\.com\/.*\/.*|someecards\.com\/.*\/.*|some\.ly\/.*|www\.some\.ly\/.*|pikchur\.com\/.*|achewood\.com\/.*|www\.achewood\.com\/.*|achewood\.com\/index\.php.*|www\.achewood\.com\/index\.php.*|www\.whosay\.com\/content\/.*|www\.whosay\.com\/photos\/.*|www\.whosay\.com\/videos\/.*|say\.ly\/.*|ow\.ly\/i\/.*|color\.com\/s\/.*|soundcloud\.com\/.*|soundcloud\.com\/.*\/.*|soundcloud\.com\/.*\/sets\/.*|soundcloud\.com\/groups\/.*|snd\.sc\/.*|www\.last\.fm\/music\/.*|www\.last\.fm\/music\/+videos\/.*|www\.last\.fm\/music\/+images\/.*|www\.last\.fm\/music\/.*\/_\/.*|www\.last\.fm\/music\/.*\/.*|www\.mixcloud\.com\/.*\/.*\/|www\.radionomy\.com\/.*\/radio\/.*|radionomy\.com\/.*\/radio\/.*|www\.hark\.com\/clips\/.*|www\.rdio\.com\/#\/artist\/.*\/album\/.*|www\.rdio\.com\/artist\/.*\/album\/.*|www\.zero-inch\.com\/.*|.*\.bandcamp\.com\/|.*\.bandcamp\.com\/track\/.*|.*\.bandcamp\.com\/album\/.*|freemusicarchive\.org\/music\/.*|www\.freemusicarchive\.org\/music\/.*|freemusicarchive\.org\/curator\/.*|www\.freemusicarchive\.org\/curator\/.*|www\.npr\.org\/.*\/.*\/.*\/.*\/.*|www\.npr\.org\/.*\/.*\/.*\/.*\/.*\/.*|www\.npr\.org\/.*\/.*\/.*\/.*\/.*\/.*\/.*|www\.npr\.org\/templates\/story\/story\.php.*|huffduffer\.com\/.*\/.*|www\.audioboo\.fm\/boos\/.*|audioboo\.fm\/boos\/.*|boo\.fm\/b.*|www\.xiami\.com\/song\/.*|xiami\.com\/song\/.*|www\.saynow\.com\/playMsg\.html.*|www\.saynow\.com\/playMsg\.html.*|listen\.grooveshark\.com\/s\/.*|radioreddit\.com\/songs.*|www\.radioreddit\.com\/songs.*|radioreddit\.com\/\?q=songs.*|www\.radioreddit\.com\/\?q=songs.*|www\.gogoyoko\.com\/song\/.*|.*amazon\..*\/gp\/product\/.*|.*amazon\..*\/.*\/dp\/.*|.*amazon\..*\/dp\/.*|.*amazon\..*\/o\/ASIN\/.*|.*amazon\..*\/gp\/offer-listing\/.*|.*amazon\..*\/.*\/ASIN\/.*|.*amazon\..*\/gp\/product\/images\/.*|.*amazon\..*\/gp\/aw\/d\/.*|www\.amzn\.com\/.*|amzn\.com\/.*|www\.shopstyle\.com\/browse.*|www\.shopstyle\.com\/action\/apiVisitRetailer.*|api\.shopstyle\.com\/action\/apiVisitRetailer.*|www\.shopstyle\.com\/action\/viewLook.*|www\.crunchbase\.com\/.*\/.*|crunchbase\.com\/.*\/.*|www\.slideshare\.net\/.*\/.*|www\.slideshare\.net\/mobile\/.*\/.*|slidesha\.re\/.*|scribd\.com\/doc\/.*|www\.scribd\.com\/doc\/.*|scribd\.com\/mobile\/documents\/.*|www\.scribd\.com\/mobile\/documents\/.*|screenr\.com\/.*|polldaddy\.com\/community\/poll\/.*|polldaddy\.com\/poll\/.*|answers\.polldaddy\.com\/poll\/.*|www\.5min\.com\/Video\/.*|www\.howcast\.com\/videos\/.*|www\.screencast\.com\/.*\/media\/.*|screencast\.com\/.*\/media\/.*|www\.screencast\.com\/t\/.*|screencast\.com\/t\/.*|issuu\.com\/.*\/docs\/.*|www\.kickstarter\.com\/projects\/.*\/.*|www\.scrapblog\.com\/viewer\/viewer\.aspx.*|ping\.fm\/p\/.*|chart\.ly\/symbols\/.*|chart\.ly\/.*|maps\.google\.com\/maps\?.*|maps\.google\.com\/\?.*|maps\.google\.com\/maps\/ms\?.*|.*\.craigslist\.org\/.*\/.*|my\.opera\.com\/.*\/albums\/show\.dml\?id=.*|my\.opera\.com\/.*\/albums\/showpic\.dml\?album=.*&picture=.*|www\.polleverywhere\.com\/polls\/.*|www\.polleverywhere\.com\/multiple_choice_polls\/.*|www\.polleverywhere\.com\/free_text_polls\/.*|www\.quantcast\.com\/wd:.*|www\.quantcast\.com\/.*|siteanalytics\.compete\.com\/.*|statsheet\.com\/statplot\/charts\/.*\/.*\/.*\/.*|statsheet\.com\/statplot\/charts\/e\/.*|statsheet\.com\/.*\/teams\/.*\/.*|statsheet\.com\/tools\/chartlets\?chart=.*|brainbird\.net\/notice\/.*|shitmydadsays\.com\/notice\/.*|www\.studivz\.net\/Profile\/.*|www\.studivz\.net\/l\/.*|www\.studivz\.net\/Groups\/Overview\/.*|www\.studivz\.net\/Gadgets\/Info\/.*|www\.studivz\.net\/Gadgets\/Install\/.*|www\.studivz\.net\/.*|www\.meinvz\.net\/Profile\/.*|www\.meinvz\.net\/l\/.*|www\.meinvz\.net\/Groups\/Overview\/.*|www\.meinvz\.net\/Gadgets\/Info\/.*|www\.meinvz\.net\/Gadgets\/Install\/.*|www\.meinvz\.net\/.*|www\.schuelervz\.net\/Profile\/.*|www\.schuelervz\.net\/l\/.*|www\.schuelervz\.net\/Groups\/Overview\/.*|www\.schuelervz\.net\/Gadgets\/Info\/.*|www\.schuelervz\.net\/Gadgets\/Install\/.*|www\.schuelervz\.net\/.*|myloc\.me\/.*|redux\.com\/stream\/item\/.*\/.*|redux\.com\/f\/.*\/.*|www\.redux\.com\/stream\/item\/.*\/.*|www\.redux\.com\/f\/.*\/.*|cl\.ly\/.*|cl\.ly\/.*\/content|speakerdeck\.com\/u\/.*\/p\/.*|www\.kiva\.org\/lend\/.*|www\.timetoast\.com\/timelines\/.*|storify\.com\/.*\/.*|.*meetup\.com\/.*|meetu\.ps\/.*|www\.dailymile\.com\/people\/.*\/entries\/.*|.*\.kinomap\.com\/.*|www\.metacdn\.com\/api\/users\/.*\/content\/.*|www\.metacdn\.com\/api\/users\/.*\/media\/.*|prezi\.com\/.*\/.*|.*\.uservoice\.com\/.*\/suggestions\/.*|formspring\.me\/.*|www\.formspring\.me\/.*|formspring\.me\/.*\/q\/.*|www\.formspring\.me\/.*\/q\/.*|twitlonger\.com\/show\/.*|www\.twitlonger\.com\/show\/.*|tl\.gd\/.*|www\.qwiki\.com\/q\/.*|crocodoc\.com\/.*|.*\.crocodoc\.com\/.*|https:\/\/crocodoc\.com\/.*|https:\/\/.*\.crocodoc\.com\/.*|.*youtube\.com\/watch.*|.*\.youtube\.com\/v\/.*|youtu\.be\/.*|.*\.youtube\.com\/user\/.*|.*\.youtube\.com\/.*#.*\/.*|m\.youtube\.com\/watch.*|m\.youtube\.com\/index.*|.*\.youtube\.com\/profile.*|.*\.youtube\.com\/view_play_list.*|.*\.youtube\.com\/playlist.*|.*justin\.tv\/.*|.*justin\.tv\/.*\/b\/.*|.*justin\.tv\/.*\/w\/.*|www\.ustream\.tv\/recorded\/.*|www\.ustream\.tv\/channel\/.*|www\.ustream\.tv\/.*|qik\.com\/video\/.*|qik\.com\/.*|qik\.ly\/.*|.*revision3\.com\/.*|.*\.dailymotion\.com\/video\/.*|.*\.dailymotion\.com\/.*\/video\/.*|collegehumor\.com\/video:.*|collegehumor\.com\/video\/.*|www\.collegehumor\.com\/video:.*|www\.collegehumor\.com\/video\/.*|.*twitvid\.com\/.*|www\.break\.com\/.*\/.*|vids\.myspace\.com\/index\.cfm\?fuseaction=vids\.individual&videoid.*|www\.myspace\.com\/index\.cfm\?fuseaction=.*&videoid.*|www\.metacafe\.com\/watch\/.*|www\.metacafe\.com\/w\/.*|blip\.tv\/file\/.*|.*\.blip\.tv\/file\/.*|video\.google\.com\/videoplay\?.*|.*revver\.com\/video\/.*|video\.yahoo\.com\/watch\/.*\/.*|video\.yahoo\.com\/network\/.*|.*viddler\.com\/explore\/.*\/videos\/.*|liveleak\.com\/view\?.*|www\.liveleak\.com\/view\?.*|animoto\.com\/play\/.*|dotsub\.com\/view\/.*|www\.overstream\.net\/view\.php\?oid=.*|www\.livestream\.com\/.*|www\.worldstarhiphop\.com\/videos\/video.*\.php\?v=.*|worldstarhiphop\.com\/videos\/video.*\.php\?v=.*|teachertube\.com\/viewVideo\.php.*|www\.teachertube\.com\/viewVideo\.php.*|www1\.teachertube\.com\/viewVideo\.php.*|www2\.teachertube\.com\/viewVideo\.php.*|bambuser\.com\/v\/.*|bambuser\.com\/channel\/.*|bambuser\.com\/channel\/.*\/broadcast\/.*|www\.schooltube\.com\/video\/.*\/.*|bigthink\.com\/ideas\/.*|bigthink\.com\/series\/.*|sendables\.jibjab\.com\/view\/.*|sendables\.jibjab\.com\/originals\/.*|www\.xtranormal\.com\/watch\/.*|socialcam\.com\/v\/.*|www\.socialcam\.com\/v\/.*|dipdive\.com\/media\/.*|dipdive\.com\/member\/.*\/media\/.*|dipdive\.com\/v\/.*|.*\.dipdive\.com\/media\/.*|.*\.dipdive\.com\/v\/.*|v\.youku\.com\/v_show\/.*\.html|v\.youku\.com\/v_playlist\/.*\.html|www\.snotr\.com\/video\/.*|snotr\.com\/video\/.*|video\.jardenberg\.se\/.*|www\.clipfish\.de\/.*\/.*\/video\/.*|www\.myvideo\.de\/watch\/.*|www\.whitehouse\.gov\/photos-and-video\/video\/.*|www\.whitehouse\.gov\/video\/.*|wh\.gov\/photos-and-video\/video\/.*|wh\.gov\/video\/.*|www\.hulu\.com\/watch.*|www\.hulu\.com\/w\/.*|hulu\.com\/watch.*|hulu\.com\/w\/.*|.*crackle\.com\/c\/.*|www\.fancast\.com\/.*\/videos|www\.funnyordie\.com\/videos\/.*|www\.funnyordie\.com\/m\/.*|funnyordie\.com\/videos\/.*|funnyordie\.com\/m\/.*|www\.vimeo\.com\/groups\/.*\/videos\/.*|www\.vimeo\.com\/.*|vimeo\.com\/groups\/.*\/videos\/.*|vimeo\.com\/.*|vimeo\.com\/m\/#\/.*|www\.ted\.com\/talks\/.*\.html.*|www\.ted\.com\/talks\/lang\/.*\/.*\.html.*|www\.ted\.com\/index\.php\/talks\/.*\.html.*|www\.ted\.com\/index\.php\/talks\/lang\/.*\/.*\.html.*|.*nfb\.ca\/film\/.*|www\.thedailyshow\.com\/watch\/.*|www\.thedailyshow\.com\/full-episodes\/.*|www\.thedailyshow\.com\/collection\/.*\/.*\/.*|movies\.yahoo\.com\/movie\/.*\/video\/.*|movies\.yahoo\.com\/movie\/.*\/trailer|movies\.yahoo\.com\/movie\/.*\/video|www\.colbertnation\.com\/the-colbert-report-collections\/.*|www\.colbertnation\.com\/full-episodes\/.*|www\.colbertnation\.com\/the-colbert-report-videos\/.*|www\.comedycentral\.com\/videos\/index\.jhtml\?.*|www\.theonion\.com\/video\/.*|theonion\.com\/video\/.*|wordpress\.tv\/.*\/.*\/.*\/.*\/|www\.traileraddict\.com\/trailer\/.*|www\.traileraddict\.com\/clip\/.*|www\.traileraddict\.com\/poster\/.*|www\.escapistmagazine\.com\/videos\/.*|www\.trailerspy\.com\/trailer\/.*\/.*|www\.trailerspy\.com\/trailer\/.*|www\.trailerspy\.com\/view_video\.php.*|www\.atom\.com\/.*\/.*\/|fora\.tv\/.*\/.*\/.*\/.*|www\.spike\.com\/video\/.*|www\.gametrailers\.com\/video\/.*|gametrailers\.com\/video\/.*|www\.koldcast\.tv\/video\/.*|www\.koldcast\.tv\/#video:.*|techcrunch\.tv\/watch.*|techcrunch\.tv\/.*\/watch.*|mixergy\.com\/.*|video\.pbs\.org\/video\/.*|www\.zapiks\.com\/.*|tv\.digg\.com\/diggnation\/.*|tv\.digg\.com\/diggreel\/.*|tv\.digg\.com\/diggdialogg\/.*|www\.trutv\.com\/video\/.*|www\.nzonscreen\.com\/title\/.*|nzonscreen\.com\/title\/.*|app\.wistia\.com\/embed\/medias\/.*|https:\/\/app\.wistia\.com\/embed\/medias\/.*|hungrynation\.tv\/.*\/episode\/.*|www\.hungrynation\.tv\/.*\/episode\/.*|hungrynation\.tv\/episode\/.*|www\.hungrynation\.tv\/episode\/.*|indymogul\.com\/.*\/episode\/.*|www\.indymogul\.com\/.*\/episode\/.*|indymogul\.com\/episode\/.*|www\.indymogul\.com\/episode\/.*|channelfrederator\.com\/.*\/episode\/.*|www\.channelfrederator\.com\/.*\/episode\/.*|channelfrederator\.com\/episode\/.*|www\.channelfrederator\.com\/episode\/.*|tmiweekly\.com\/.*\/episode\/.*|www\.tmiweekly\.com\/.*\/episode\/.*|tmiweekly\.com\/episode\/.*|www\.tmiweekly\.com\/episode\/.*|99dollarmusicvideos\.com\/.*\/episode\/.*|www\.99dollarmusicvideos\.com\/.*\/episode\/.*|99dollarmusicvideos\.com\/episode\/.*|www\.99dollarmusicvideos\.com\/episode\/.*|ultrakawaii\.com\/.*\/episode\/.*|www\.ultrakawaii\.com\/.*\/episode\/.*|ultrakawaii\.com\/episode\/.*|www\.ultrakawaii\.com\/episode\/.*|barelypolitical\.com\/.*\/episode\/.*|www\.barelypolitical\.com\/.*\/episode\/.*|barelypolitical\.com\/episode\/.*|www\.barelypolitical\.com\/episode\/.*|barelydigital\.com\/.*\/episode\/.*|www\.barelydigital\.com\/.*\/episode\/.*|barelydigital\.com\/episode\/.*|www\.barelydigital\.com\/episode\/.*|threadbanger\.com\/.*\/episode\/.*|www\.threadbanger\.com\/.*\/episode\/.*|threadbanger\.com\/episode\/.*|www\.threadbanger\.com\/episode\/.*|vodcars\.com\/.*\/episode\/.*|www\.vodcars\.com\/.*\/episode\/.*|vodcars\.com\/episode\/.*|www\.vodcars\.com\/episode\/.*|confreaks\.net\/videos\/.*|www\.confreaks\.net\/videos\/.*|video\.allthingsd\.com\/video\/.*|videos\.nymag\.com\/.*|aniboom\.com\/animation-video\/.*|www\.aniboom\.com\/animation-video\/.*|clipshack\.com\/Clip\.aspx\?.*|www\.clipshack\.com\/Clip\.aspx\?.*|grindtv\.com\/.*\/video\/.*|www\.grindtv\.com\/.*\/video\/.*|ifood\.tv\/recipe\/.*|ifood\.tv\/video\/.*|ifood\.tv\/channel\/user\/.*|www\.ifood\.tv\/recipe\/.*|www\.ifood\.tv\/video\/.*|www\.ifood\.tv\/channel\/user\/.*|logotv\.com\/video\/.*|www\.logotv\.com\/video\/.*|lonelyplanet\.com\/Clip\.aspx\?.*|www\.lonelyplanet\.com\/Clip\.aspx\?.*|streetfire\.net\/video\/.*\.htm.*|www\.streetfire\.net\/video\/.*\.htm.*|trooptube\.tv\/videos\/.*|www\.trooptube\.tv\/videos\/.*|sciencestage\.com\/v\/.*\.html|sciencestage\.com\/a\/.*\.html|www\.sciencestage\.com\/v\/.*\.html|www\.sciencestage\.com\/a\/.*\.html|www\.godtube\.com\/featured\/video\/.*|godtube\.com\/featured\/video\/.*|www\.godtube\.com\/watch\/.*|godtube\.com\/watch\/.*|www\.tangle\.com\/view_video.*|mediamatters\.org\/mmtv\/.*|www\.clikthrough\.com\/theater\/video\/.*|espn\.go\.com\/video\/clip.*|espn\.go\.com\/.*\/story.*|abcnews\.com\/.*\/video\/.*|abcnews\.com\/video\/playerIndex.*|washingtonpost\.com\/wp-dyn\/.*\/video\/.*\/.*\/.*\/.*|www\.washingtonpost\.com\/wp-dyn\/.*\/video\/.*\/.*\/.*\/.*|www\.boston\.com\/video.*|boston\.com\/video.*|www\.facebook\.com\/photo\.php.*|www\.facebook\.com\/video\/video\.php.*|www\.facebook\.com\/v\/.*|cnbc\.com\/id\/.*\?.*video.*|www\.cnbc\.com\/id\/.*\?.*video.*|cnbc\.com\/id\/.*\/play\/1\/video\/.*|www\.cnbc\.com\/id\/.*\/play\/1\/video\/.*|cbsnews\.com\/video\/watch\/.*|www\.google\.com\/buzz\/.*\/.*\/.*|www\.google\.com\/buzz\/.*|www\.google\.com\/profiles\/.*|google\.com\/buzz\/.*\/.*\/.*|google\.com\/buzz\/.*|google\.com\/profiles\/.*|www\.cnn\.com\/video\/.*|edition\.cnn\.com\/video\/.*|money\.cnn\.com\/video\/.*|today\.msnbc\.msn\.com\/id\/.*\/vp\/.*|www\.msnbc\.msn\.com\/id\/.*\/vp\/.*|www\.msnbc\.msn\.com\/id\/.*\/ns\/.*|today\.msnbc\.msn\.com\/id\/.*\/ns\/.*|multimedia\.foxsports\.com\/m\/video\/.*\/.*|msn\.foxsports\.com\/video.*|www\.globalpost\.com\/video\/.*|www\.globalpost\.com\/dispatch\/.*|guardian\.co\.uk\/.*\/video\/.*\/.*\/.*\/.*|www\.guardian\.co\.uk\/.*\/video\/.*\/.*\/.*\/.*|bravotv\.com\/.*\/.*\/videos\/.*|www\.bravotv\.com\/.*\/.*\/videos\/.*|video\.nationalgeographic\.com\/.*\/.*\/.*\.html|dsc\.discovery\.com\/videos\/.*|animal\.discovery\.com\/videos\/.*|health\.discovery\.com\/videos\/.*|investigation\.discovery\.com\/videos\/.*|military\.discovery\.com\/videos\/.*|planetgreen\.discovery\.com\/videos\/.*|science\.discovery\.com\/videos\/.*|tlc\.discovery\.com\/videos\/.*|video\.forbes\.com\/fvn\/.*)/i',
				maxWidth: 300,
				maxHeight:300,
				'method':'afterParent',
				'wrapElement':'div',
				'className':'thumbnails',
				'success':function(oembed, dict) {
					var embedlyComponent = self.$.images.createComponent({
						kind: "enyo.Control",
						owner: self,
						components: [
							{style: "height: 10px;"},
							// {kind: "enyo.Image", style: "max-width: 100%;", onclick: "embedlyClick", src: oembed.thumbnail_url, url: oembed.url},
							{kind: "enyo.HFlexBox", pack: "center", components: [
								{name: "oembed_code", allowHtml: true, content:oembed.code}
							]}
						]
					});
					embedlyComponent.render();
				}
			});
		};
	},
	
	entryClick: function(inSender, inEvent) {
		var className = inEvent.target.className;
		if(_.includes(className, "username")){
			var username = inEvent.target.getAttribute('data-user-screen_name') || inEvent.target.innerText.replace("@", "");
			AppUI.viewUser(username, this.entry.service, this.entry.account_id);
		} else if(_.includes(className, "avatar")){
			AppUI.viewUser(this.entry.author_username, this.entry.service, this.entry.account_id);
		} else if(_.includes(className, "hashtag")){
			AppUI.search(inEvent.target.innerText, this.entry.account_id);
		}
	},
	toggleDrawer: function(inSender, inEvent){
		this.$.conversation_drawer.toggleOpen();	
	},
	onConversationOpenChanged: function(inSender, inEvent) {
	    if(this.$.conversation_drawer.open){
	        this.loadConversation();	
	    } else {
			setTimeout(enyo.bind(this, function(){ this.$.detail_scroller.scrollTo(0, 0)}), 100);
		}
	},
	loadConversation: function() {
	    this.$.conversation.loadConversation();
	},
	onConversationLoadStart: function () {
	    console.log("Load Conversation Start");
	    this.$.conversation_button.setActive(true);
	},
	onConversationLoadDone: function() {
	    console.log("Load Conversation Done");
	    this.$.conversation_button.setActive(false);
	},
	reply: function() {
		AppUI.reply(this.entry);
	},
	imageClick: function(inSender) {
		var imageIndex = parseInt(inSender.getName().replace("imagePreview", ""), 10);
		this.doShowImageView(this.imageFullUrls, imageIndex);
	},
	embedlyClick: function(inSender) {
		if(inSender.url) {
			this.$.browser.call({id: "com.palm.app.browser", params: {target: inSender.url}});
		}
	},
	toggleFavorite: function(inSender){
		var that = this;
		var account = App.Users.get(this.entry.account_id);
		var auth = new SpazAuth(account.type);
		auth.load(account.auth);
			
		that.twit = that.twit || new SpazTwit();
		that.twit.setBaseURLByService(account.type);
		that.twit.setSource(App.Prefs.get('twitter-source'));
		that.twit.setCredentials(auth);
			
		if (that.entry.is_favorite) {
			console.log('UNFAVORITING %j', that.entry);
			that.twit.unfavorite(
				that.entry.service_id,
				function(data) {
					that.entry.is_favorite = false;
					that.setFavButtonState();
					AppUI.rerenderTimelines();
					AppUtils.showBanner($L('Removed favorite'));
				},
				function(xhr, msg, exc) {
					AppUtils.showBanner($L('Error removing favorite'));
				}
			);
		} else {
			console.log('FAVORITING %j', that.entry);
			that.twit.favorite(
				that.entry.service_id,
				function(data) {
					that.entry.is_favorite = true;
					that.setFavButtonState();
					AppUI.rerenderTimelines();
					AppUtils.showBanner($L('Added favorite'));								
				},
				function(xhr, msg, exc) {
					AppUtils.showBanner($L('Error adding favorite'));
				}
			);
		}
	}, 
	setFavButtonState: function(){
		if(this.entry.is_favorite === true){
			this.$.favoriteButton.setDisabled(false);
			this.$.favoriteButton.setIcon("source/images/icon-favorite.png");
		} else if(this.entry.is_private_message === true){
			this.$.favoriteButton.setDisabled(true)
		} else {		
			this.$.favoriteButton.setIcon("source/images/icon-favorite-outline.png");
			this.$.favoriteButton.setDisabled(false)
		}
	},
});
