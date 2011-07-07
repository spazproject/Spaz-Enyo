var SpazDefaultFilters = [
	{
		'label':'nl2br',
		'func':function(d) {
			d.text = sch.nl2br(d.text);
			if (d.SC_is_retweet) {
				d.retweeted_status.text = sch.nl2br(d.retweeted_status.text);
			}
			return d;
		}
	},
	{
		'label':'autolink',
		'func':function(d) {
			d.text = AppUtils.makeItemsClickable(d.text);
			return d;
		}
	},
	{
		'label':'SAE',
		'func':function(d) {
			if (!window.SpazSAE) { window.SpazSAE = new Emoticons('SAE'); }
			d.text = window.SpazSAE.apply(d.text);
			if (d.SC_is_retweet) {
				d.retweeted_status.text = window.SpazSAE.apply(d.retweeted_status.text);
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
	},
	{
		'label':'markdown',
		'func':function(d) {
			if (!window.Spaz_Showdown) { window.Spaz_Showdown = new Showdown.converter(); }
			d.text = window.Spaz_Showdown.makeHtml(d.text);
			d.text = d.text.replace(/href="([^"]+)"/gi, 'href="$1" title="Open link in a browser window" class="inline-link"');		
			return d;	
		}
	}
];