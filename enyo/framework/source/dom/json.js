/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.json = {
	//* @protected
	tab: "  ",
	_block: function(p, inDent) {
		p = p.join(",\n");
		var j = (p ? "\n" + p + "\n" + inDent : "");
		return j;
	},
	obj: function(inObj, inDent) {
		var p = [], pp, v;
		for (var n in inObj) {
			v = inObj[n];
			if (n == "isa" && v.prototype) {
				v = v.prototype.kindName;
			} else {
				v = this.value(v, inDent + this.tab);
			}
			pp = inDent + this.tab + '"' + n + '"' + ': ' + v;
			p.push(pp);
		}
		return "{" + this._block(p, inDent) + "}";
	},
	array: function(inObj, inDent) {
		var p = [], pp;
		for (var i=0, l=inObj.length; i<l; i++) {
			pp = inDent + this.tab + this.value(inObj[i], inDent + this.tab);
			p.push(pp);
		}
		return "[" + this._block(p, inDent) + "]";
	},
	value: function(v, inDent) {
		var t = (v === null || v === undefined) ? "" : typeof v;
		switch (t) {
			case "string":
				v = v.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\"/g, "\\\"");
				return '"' + v + '"';
			case "function":
				// stringify the function body 
				// FIXME: browser incompatibilities. Instead, we probably should cache the method block
				// in string form and never interpret it.
				var lines = v.toString();
				// turn "\r" or "\n\r" into "\n"
				lines = lines.replace(/\n*\r/g, "\n");
				// FIXME: webkit doesn't seem to support \t in textarea
				// TODO: finalize editor. Assuming we aren't using textarea, above doesn't matter.
				// replace leading spaces with tabs, 4 spaces to a tab
				lines = lines.replace(/(^\.\.\.\.)|[\.\t]+(\.\.\.\.)/g, "\t");
				// replace 4-space tabs with 2-space tabs
				//lines = lines.replace(/(^\.\.\.\.)|[\.\t]+(\.\.)/g, "\t");
				// divide on newlines
				lines = lines.split("\n");
				// add indent, combine with newlines
				return lines.join("\n" + inDent);
			case "object":
				return enyo.isArray(v) ? this.array(v, inDent) : this.obj(v, inDent);
			default: 
				return v;
		}
	},
	//* @public
	/**
		Returns a JSON string for a given object using a custom converter. Performs indenting and includes ability to encode function-bodies as strings, which is non-standard JSON.
		<i>inValue</i> is the Object to be converted to JSON.
	*/
	to: function(inValue) {
		return this.value(inValue, "");
	},
	/**
		Returns a JavaScript object for a given JSON string using _eval_.
		<i>inJson</i> is the JSON string to be converted to a JavaScript object.
	*/
	from: function(inJson) {
		return eval('(' + inJson + ')');
	},
	/**
		Returns a JSON string for a given object, using native stringify
		routine if it's available.
		<i>inValue</i> is the Object to be converted to JSON.
	*/
	stringify: function(inValue) {
	},
	/**
		Returns a JavaScript object for a given JSON string, using native stringify
		routine if it's available.
		<i>inJson</i> is the JSON string to be converted to a JavaScript object.
	*/
	parse: function(inJson) {
	}
};

if (window.JSON) {
	enyo.json.stringify = window.JSON ? JSON.stringify : enyo.json.to;
	enyo.json.parse = window.JSON ? JSON.parse : enyo.json.from;
};
