/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
var G11N_RB = new enyo.g11n.Resources({root:"$enyo-lib/networkalerts"});

enyo.kind({
	name:"WiFiAlert",
	kind: "VFlexBox",
	className: "system-notification wifi",
	events:{
			onTap: ""
	},
	components: [
		{
			kind: enyo.Control,
			className: "message",
			components: [
				{
					className: "notification-icon"
				},
				{
					className: "notification-text",
					components: [
						{
							className: "title",
							content: G11N_RB.$L("No Internet Connection")
						},
						{
							className: "body",
							content: G11N_RB.$L("Turn Wi-Fi on to automatically connect to a known network.")
						}
					]
				}
			]
		 },
		 {
		 	 className:"palm-notification-button affirmative", content: G11N_RB.$L("Turn Wi-Fi On"), onclick: "handleTurnOn"
		 },
		 {
		 	 className:"palm-notification-button negative", content: G11N_RB.$L("Dismiss"), onclick: "onClose"
		 }
	],
	
	create: function() {
		this.inherited(arguments);
		var params = enyo.windowParams;
		this.setOwner(params.owner);
		// Copy event handlers in from launch params:
		for (var prop in this.events) {
			if (this.events.hasOwnProperty(prop)) {
				this[prop] = params[prop];
			}
		}
		this.userTapped = false;
		var currTime = Math.ceil(new Date().getTime() / (1000 * 60));
		this.owner.$.sysService.call({"lastDataAlertTimestamp": currTime}, {method:"setPreferences"});
		this.boundDestroy = enyo.bind(this, "destroy");
		window.addEventListener('unload', this.boundDestroy);
	},
	
	destroy: function() {
		if(!this.userTapped) {
			this.doTap({response:"WiFi-UserCancelled"});
		}
		this.inherited(arguments);
	},
	
	handleTurnOn: function(event) {
		this.userTapped = true;
		this.owner.$.wifiService.call({'state':"enabled"}, {method:"setstate"});
		this.doTap({response:"WiFi-StartingUp"});
     	close();
    },

    onClose: function(event) {
		this.userTapped = true;
		this.doTap({response:"WiFi-UserCancelled"});
     	close();
    }
	
	
});

enyo.kind({
	name:"FlightModeAlert",
	kind: "VFlexBox",
	className: "system-notification flight-mode",
	events:{
			onTap: ""
	},
	components: [
		{
			kind: enyo.Control,
			className: "message",
			components: [
				{
					className: "notification-icon"
				},
				{
					className: "notification-text",
					components: [
						{
							className: "title",
							content: G11N_RB.$L("Airplane Mode Is On")
						},
						{
							className: "body",
							content: G11N_RB.$L("Turn off Airplane Mode for network access?")
						}
					]
				}
			]
		 },
		 {
		 	 className:"palm-notification-button affirmative", content: G11N_RB.$L("Turn Off"), onclick: "handleTurnOn"
		 },
		 {
		 	 className:"palm-notification-button negative", content: G11N_RB.$L("Dismiss"), onclick: "onClose"
		 }
	],
	
	create: function() {
		this.inherited(arguments);
		var params = enyo.windowParams;
		this.setOwner(params.owner);
		// Copy event handlers in from launch params:
		for (var prop in this.events) {
			if (this.events.hasOwnProperty(prop)) {
				this[prop] = params[prop];
			}
		}
		this.userTapped = false;
		this.boundDestroy = enyo.bind(this, "destroy");
		window.addEventListener('unload', this.boundDestroy);
	},
	
	destroy: function() {
		if(!this.userTapped) {
			this.doTap({response:"PhoneNetwork-UserCancelled"});
		}
		this.inherited(arguments);
	},
	
	handleTurnOn: function(event) {
		this.userTapped = true;
		this.owner.$.sysService.call({'airplaneMode':false}, {method:"setPreferences"});
		this.doTap({response:"PhoneNetwork-StartingUp"});
     	close();
    },

    onClose: function(event) {
		this.userTapped = true;
		this.doTap({response:"PhoneNetwork-UserCancelled"});
     	close();
    }
	
	
});

enyo.kind({
	name:"BluetoothAlert",
	kind: "VFlexBox",
	className: "system-notification bluetooth",
	events:{
			onTap: ""
	},
	components: [
		{
			kind: enyo.Control,
			className: "message",
			components: [
				{
					className: "notification-icon"
				},
				{
					className: "notification-text",
					components: [
						{
							className: "title",
							content: G11N_RB.$L("Bluetooth Is Off")
						},
						{
							className: "body",
							content: G11N_RB.$L("No devices connected.")
						}
					]
				}
			]
		 },
		 {
		 	 className:"palm-notification-button affirmative", content: G11N_RB.$L("Turn Bluetooth On"), onclick: "handleTurnOn"
		 },
		 {
		 	 className:"palm-notification-button negative", content: G11N_RB.$L("Dismiss"), onclick: "onClose"
		 }
	],
	
	create: function() {
		this.inherited(arguments);
		var params = enyo.windowParams;
		this.setOwner(params.owner);
		// Copy event handlers in from launch params:
		for (var prop in this.events) {
			if (this.events.hasOwnProperty(prop)) {
				this[prop] = params[prop];
			}
		}
		this.userTapped = false;
		this.boundDestroy = enyo.bind(this, "destroy");
		window.addEventListener('unload', this.boundDestroy);
	},
	
	destroy: function() {
		if(!this.userTapped) {
			this.doTap({response:"BT-UserCancelled"});
		}
		this.owner.alertWindowClosed();
		this.inherited(arguments);
	},
	
	handleTurnOn: function(event) {
		this.userTapped = true;
		this.owner.$.btService.call({'visible':false, 'connectable':true}, {method:"radioon"});
		this.doTap({response:"BT-StartingUp"});
     	close();
    },

    onClose: function(event) {
		this.userTapped = true;
		this.doTap({response:"BT-UserCancelled"});
     	close();
    }
	
	
});

enyo.kind({
	name:"ManualNetworkAlert",
	kind: "VFlexBox",
	className: "system-notification network-availability",
	events:{
			onTap: ""
	},
	components: [
		{
			kind: enyo.Control,
			className: "message",
			components: [
				{
					className: "notification-icon"
				},
				{
					className: "notification-text",
					components: [
						{
							className: "title",
							content: G11N_RB.$L("Manual Network")
						},
						{
							className: "body",
							allowHtml:true,
							content: G11N_RB.$L("Wireless network unavailable.<br/>Select different one?")
						}
					]
				}
			]
		 },
		 {
		 	 className:"palm-notification-button affirmative", content: G11N_RB.$L("SELECT NEW"), onclick: "handleTurnOn"
		 },
		 {
		 	 className:"palm-notification-button negative", content: G11N_RB.$L("DON'T SWITCH"), onclick: "onClose"
		 },
		 {kind:"PalmService", name:"appLaunch", service:"palm://com.palm.applicationManager/"}
	],
	
	create: function() {
		this.inherited(arguments);
		var params = enyo.windowParams;
		this.setOwner(params.owner);
		// Copy event handlers in from launch params:
		for (var prop in this.events) {
			if (this.events.hasOwnProperty(prop)) {
				this[prop] = params[prop];
			}
		}
		this.userTapped = false;
		this.boundDestroy = enyo.bind(this, "destroy");
		window.addEventListener('unload', this.boundDestroy);
	},
	
	destroy: function() {
		if(!this.userTapped) {
			this.doTap({response:"PhoneManualNetwork-UserCancelled"});
		}
		this.inherited(arguments);
	},
	
	handleTurnOn: function(event) {
		this.userTapped = true;
		this.$.appLaunch.call({id: 'com.palm.app.phone',params: {preferences:true,launchType: 'startNetworkSearch'}}, {method:"open"});
		this.doTap({response:"PhoneManualNetwork-StartingUp"});
     	close();
    },

    onClose: function(event) {
		this.userTapped = true;
		this.doTap({response:"PhoneManualNetwork-UserCancelled"});
     	close();
    }
	
	
});