/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.CanonPasswordPrompt",
	kind: enyo.Control,
	events: {
		onSubmit: "",
		onCancel: ""
	},
	components: [
		{content: "Palm Profile Password", style: "font-size: 26px; padding: 6px;"},
		{style: "padding: 6px;", content: "Please enter your Palm Profile password so you can purchase this item."},
		{kind: "PasswordInput"},
		{kind: "HFlexBox", style: "padding-top: 6px;", components: [
			{kind: "Button", flex: 1, caption: "Cancel", onclick: "doCancel"},
			{kind: "Spacer"},
			{kind: "Button", flex: 1, caption: "Submit", onclick: "doSubmit"},
		]}
	],
	getPassword: function() {
		return this.$.passwordInput.getValue();
	}
});
