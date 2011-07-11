var SpazDefaultTextFilters = [
	{
		'label':'nl2br',
		'func':function(str) {
			str = sch.nl2br(str);
			return str;
		}
	},
	{
		'label':'simplemarkup',
		'func':function(str) {
			str = str.replace(/(\s|^)\*([^\*]+)\*($|[\s:.!,;])/g, '$1<strong>$2</strong>$3');
			str = str.replace(/(\s|^)`([^\`]+)`($||[\s:.!,;])/g, '$1<code>$2</code>$3');
			str = str.replace(/(\s|^)_([^\_]+)_($||[\s:.!,;])/g, '$1<em>$2</em>$3');
			return str;
		}
	},
	{
		'label':'autolink',
		'func':function(str) {
			str = AppUtils.makeItemsClickable(str);
			return str;
		}
	},
	{
		'label':'SAE',
		'func':function(str) {
			if (!window.SAE) { window.SAE = new Emoticons('SAE'); }
			str = window.SAE.apply(str);
			return str;
		}
	},
	{
		'label':'SimpleSmileys',
		'func':function(str) {
			if (!window.SpazSimpleSmileys) { window.SpazSimpleSmileys = new Emoticons('SimpleSmileys'); }
			str = window.SpazSimpleSmileys.apply(str);
			return str;
		}
	}
];