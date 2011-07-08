var SpazDefaultFilters = [
	{
		'label':'autolink',
		'func':function(d) {
			d.text = AppUtils.makeItemsClickable(d.text);
			return d;
		}
	},
	{
		'label':'markdown',
		'func':function(d) {
			var md = new Showdown.converter();
			d.text = md.makeHtml(d.text);
			d.text = d.text.replace(/href="([^"]+)"/gi, 'href="$1" title="Open link in a browser window" class="inline-link"');		
			return d;	
		}
	},
	{
		'label':'SAE',
		'func':function(d) {
			if (!window.SAE) { window.SAE = new Emoticons('SAE'); }
			d.text = window.SAE.apply(d.text);
			if (d.SC_is_retweet) {
				d.retweeted_status.text = window.SAE.apply(d.retweeted_status.text);
			}
			return d;
		}
	},
	{
		'label':'SimpleSmileys',
		'func':function(d) {
			if (!window.SpazSimpleSmileys) { window.SpazSimpleSmileys = new Emoticons('SimpleSmileys'); }
			d.text = window.SpazSimpleSmileys.apply(d.text);
			if (d.SC_is_retweet) {
				d.retweeted_status.text = window.SpazSimpleSmileys.apply(d.retweeted_status.text);
			}
			return d;
		}
	}
];