/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.RoundedInput",
	kind: enyo.Input,
	className: "enyo-rounded-input",
	focusClassName: "",
	chrome: [
		{kind: "RoundedBox", components: [
			{flex: 1, components: enyo.Input.prototype.chrome},
			{name: "client"}
		]}
	]
});