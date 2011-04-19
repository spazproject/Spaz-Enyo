/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
enyo.kind({
	name: "enyo.parser.Base", 
	i: 0,
	constructor: function(inTokens) {
		this.a = [];
		this.html = [];
		this.lastToken = {};
		this.nodes = inTokens && this.parse(inTokens);
	},
	next: function() {
		return this.tokens[this.i++];
	},
	setTokens: function(inTokens) {
		this.i = 0;
		this.tokens = inTokens;
	},
	pushToken: function(inT) {
		this.a.push(inT);
	},
	parse: function(inLexer) {
		this.setTokens(inLexer.r);
		return this.processTokens();
	}
});

enyo.kind({
	name: "enyo.parser.Code", 
	kind: enyo.parser.Base, 
	pushNode: function(inCode, inKind, inToken, inDelim) {
		var token = this.a.join('') + (inDelim||'') + (inToken||'') + (inDelim||'');
		if (arguments.length > 2) {
			this.a.push(inToken);
		}
		var node = { kind: inKind, tokens: this.a, token: token};
		inCode.push(node);
		this.a = [];
		return node
	},
	identifier: function(inCode) {
		if (this.a.length) {
			this.pushNode(inCode, 'identifier');
		}
		return inCode;
	},
	processArray: function(inCode, inToken) {
		this.identifier(inCode);
		this.pushNode(inCode, 'array').children = this.processTokens();
	},
	processBlock: function(inCode, inToken) {
		this.identifier(inCode);
		this.pushNode(inCode, 'block').children = this.processTokens();
	},
	processArguments: function(inCode, inToken) {
		this.identifier(inCode);
		var kind = 'association';
		if (this.lastToken.kind == "identifier" || this.lastToken.token=="function") {
			kind = 'argument-list';
		}
		this.pushNode(inCode, kind).children = this.processTokens();
	},
	processTokens: function(inKind) {
		var mt, t, code = [];
		var self = this;
		while (mt = this.next()) {
			t = mt.token;
			//
			if (mt.kind == "ws")
				continue;
			else if (mt.kind == "literal")
				this.pushNode(code, mt.kind, t, mt.delimiter);
			else if (mt.kind == "string")
				this.pushNode(code, mt.kind, t);
			else if (mt.kind == "comment" || mt.kind=="keyword") {
				this.identifier(code);
				this.pushNode(code, mt.kind, t);
			}
			//
			else if (t == '=' || t == ':') {
				this.identifier(code);
				this.pushNode(code, "assignment", t);
			}
			//
			else if (t == ';' || t == ',')
				this.identifier(code);
			//
			else if (t == '[')
				this.processArray(code, t);
			else if (t == ']')
				return this.identifier(code);
			//
			else if (t == '{')
				this.processBlock(code, t);
			else if (t == '}') 
				return this.identifier(code);
			//
			else if (t == '(') 
				this.processArguments(code, t);
			else if (t == ')')
				return this.identifier(code);
			//
		 	else this.pushToken(t);
			this.lastToken = mt;
		}
		return code;
	}
});

enyo.kind({
	name: "enyo.parser.Text",
	kind: enyo.parser.Base,
	pushLine: function(inT) {
		(arguments.length)&&(this.a.push(inT));
		this.html.push('<span>', this.a.join("&middot;"), "</span><br />");
		this.a = [ ];
	},
	processParams: function(inToken) {
		if (this.lastToken.kind != "symbol")
			this.pushToken("[arguments|params]")
		else
			this.pushToken("[ternary op]")
		this.pushToken(inToken);
		this.processTokens();
	},
	processTokens: function() {
		var mt, t;
		while (mt = this.next()) {
			t = mt.token;
			if (mt.kind == "ws")
				continue;
			else if (t == ";")
				this.pushLine(t);
			else if (t == '{')
				this.pushLine(t + "<blockquote>");
			else if (t == '}')
				this.pushLine("</blockquote>" + t);
			else if (t == '(')
				this.processParams(t);
			else if (t == ')') {
				this.pushToken(t);
				return;
			} else this.pushToken(t);
			this.lastToken = mt;
		}
		return this.html.join("");
	}
});

enyo.parser.Js = enyo.parser.Code;