/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "panels.Dialogs",
	kind: HeaderView,
	components: [
		{name: "defaultButton", kind: "Button", caption: "Default Dialog", onclick: "defaultButtonClick"},
		{name: "defaultDialog", kind: "Dialog", components: [
			{className: "enyo-item enyo-first", style: "padding: 12px", content: "One Button"},
			{className: "enyo-item enyo-last", style: "padding: 12px; font-size: 14px", content: "A message"},
			{kind: "Button", caption: "A Button"}
		]},
		{name: "twoButton", kind: "Button", caption: "Two Button Dialog", onclick: "twoButtonClick"},
		{name: "twoDialog", kind: "Dialog", components: [
			{className: "enyo-item enyo-first", style: "padding: 12px", content: "Two Buttons"},
			{className: "enyo-item enyo-last", style: "padding: 12px; font-size: 14px", content: "Choose one of the following options"},
			{kind: "Button", caption: "Option 1"},
			{kind: "Button", caption: "Option 2"}
		]},
		{name: "errorButton", kind: "Button", caption: "Error Dialog", onclick: "errorButtonClick"},
		{name: "errorDialog", kind: "Dialog", components: [
			{className: "enyo-item enyo-first", style: "padding: 12px", content: "Error"},
			{className: "enyo-item enyo-last", style: "padding: 12px; font-size: 14px", content: "Acknowledge this error."},
			{kind: "Button", caption: "OK"}
		]},
		{name: "namePassButton", kind: "Button", caption: "Name & Password Dialog", onclick: "namePassButtonClick"},
		{name: "namePassDialog", kind: "Dialog", components: [
			{className: "enyo-item enyo-first", style: "padding: 12px", content: "Login"},
			{className: "enyo-item", components: [
				{kind: "Input", hint: "enter username..."},
			]},
			{className: "enyo-item enyo-last", components: [
				{kind: "PasswordInput", hint: "enter password..."},
			]},
			{kind: "Button", caption: "Login..."},
			{kind: "Button", caption: "Cancel"}
		]}
	],
	defaultButtonClick: function() {
		this.$.defaultDialog.toggleOpen();
	},
	twoButtonClick: function() {
		this.$.twoDialog.toggleOpen();
	},
	errorButtonClick: function() {
		this.$.errorDialog.toggleOpen();
	},
	namePassButtonClick: function() {
		this.$.namePassDialog.toggleOpen();
	}
});