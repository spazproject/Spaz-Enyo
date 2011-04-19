/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
enyo.stripQuotes = function(inString) {
	var c0 = inString.charAt(0);
	if (c0 == '"' || c0 == "'") {
		inString = inString.substring(1);
	}
	var l = inString.length - 1, cl = inString.charAt(l);
	if (cl == '"' || cl == "'") {
		inString = inString.substr(0, l);
	}
	return inString;	
};

enyo.kind({
	name: "enyo.translator.enyoDocs", 
	commentRx: /\/\/(?:\:\s*(.*))|(?:\#\s(.*))/,
	constructor: function(inParser) {
		if (inParser) {
			this.results = this.parseNodes(inParser.nodes);
		}
	},
	parseNodes: function(inNodes) {
		var result = {kinds: []};
		for (var i=0, comment=[], n; (n=inNodes[i]); i++) {
			switch (n.kind) {
				case 'identifier':
					switch(n.token) {
						case 'enyo.kind': 
							result.kinds.push(this.makeKind(inNodes[++i].children, comment));
							break;
					}
					comment = [];
					break;
				case 'comment':
					var m = n.token.match(this.commentRx);
					m && comment.push(m[2]);
				default:
					break;
			}
		}
		return result;
	},
	makeKind: function(inNodes, inComment) {
		var o = this.makeObject('kind', inNodes);
		o.comment = inComment.join(' ');
		//
		var map = o.properties.map, names = o.properties.names;
		var promote = function(name, newName) {
			var p = map[name];
			if (p) {
				if (typeof p.value == "string") {
					p.value = enyo.stripQuotes(p.value);
				}
				o[newName || name] = p;
			}
			delete map[name];
			for (var i=0, n; n=names[i]; i++) {
				if (n == name) {
					names.splice(i, 1);
					break;
				}
			}
		}
		promote("name");
		promote(map.isa ? "isa" : "kind", "kind");
		promote("published");
		promote("events");
		//
		delete map.chrome;
		delete map.components;
		//
		return o;
	},
	makeObject: function(inType, inArgs) {
		var props = inArgs[0];
		return this.parseProperties(name, props.children);
	},
	parseProperties: function(inClass, inProps) {
		var props = {names: [], map: {}};
		var methods = {names: [], map: {}};
		var result = {properties: props, methods: methods};
		//
		if (!inProps) {
			return result;
		}
		//
		var group = 'public';
		var comment = [];
		//
		// iterate through object
		for (var i=0, p, pt; (p=inProps[i]); i++) {
			// if we have a comment then establish the method group or push the ($) comment
			if (p.kind == 'comment') {
				var m = p.token.match(this.commentRx);
				if (m && m[1]) {
					group = m[1];
				}
				else if (m && m[2]) {
					comment.push(m[2]);
				}
			// otherwise grab the property: (method or value)
			} else {		
				var t = p.token.split(":");
				if (t.length > 1) {
					var name = t[0];
					var nextP = inProps[i+1];
					// we have a method
					if (nextP && nextP.token == 'function') {
						// next two objects, argument list and function body, are part of this declaration
						i += 2;						
						methods.names.push(name);
						methods.map[name] = {
							name: name,
							args: this.composeAssociation(inProps[i]),
							comment: comment.join(' '),
							group: group
						};
					// we have a simple property
					} else {
						var o = {
							name: name, 
							value: t[1],
							comment: comment.join(' '),
							group: group
						};
						if (nextP && nextP.kind == 'block') {
							o.value = this.parseProperties(inClass, inProps[++i].children);
						} else if (nextP && nextP.kind == 'array') {
							o.value = [];
						}
						props.names.push(name);
						props.map[name] = o;
						//console.log(o.name, o);
					}
					comment = [];
				}
			}
		}
		return result;
	},
	composeAssociation: function(inNode) {
		if (inNode.children) {
			var e = [];
			for (var i=0, n; (n=inNode.children[i]); i++)
				if (n.kind != 'comment') {
					e.push(n.token);
				}
			return e.join(', ');
		}
		return inNode.token;
	},
	getGroups: function(inParsed) {
		function sortFunc(a, b) {
			return (a.name > b.name ? 1 : -1);
		}
		
		function processGroups(inProperties, inPropMethod) {
			for (var i=0, g=null, p; (p=inProperties[i]); i++) {
				if (g != p.group && !(p.group in inPropMethod))
					inPropMethod[p.group] = [ ];
				inPropMethod[p.group].push(p);	
				g = p.group;
			}
			// alpha sort on name
			for (var i in inPropMethod)
				inPropMethod[i].sort(sortFunc);
		}
		
		function processType(inType) {
			for (var i=0, c, groups; (c=inType[i]); i++) {
				groups = c.properties.groups = { props: {}, methods: {} };
				processGroups(c.properties.props, groups.props);
				processGroups(c.properties.methods, groups.methods);
			}
		}
			
		processType(inParsed.classes);
		processType(inParsed.widgets);
	}
})