/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "Accounts.SIMAccount",
	kind: "VFlexBox",
	flex:1,
	events: {
		onSIMAccountDone: ""
	},
	components: [
		// Display one of two headers depending on the number of accounts
		{kind:"Toolbar", className:"enyo-toolbar-light accounts-header", pack:"center", components: [
			{kind: "Image", name:"titleIcon"},
			{kind: "Control", content: AccountsUtil.PAGE_TITLE_ACCOUNT_SETTINGS}
		]},
		{className:"accounts-header-shadow"},
		{kind: "Scroller", flex:1, className:"box-center", components: [
			{name: "SIMDescription", kind: "RowGroup", className:"accounts-group", components: [
				{kind: "Control", name: "SIMNumber"}
			]},
			{kind: "RowGroup", className:"accounts-group", name: "ContactCount", components: [
				{kind: "Control", name: "NumContacts"}
			]},
			{name: "SIMMsg", className:"accounts-body-title"},
			{name:"removeAccountButton", kind: "Accounts.RemoveAccount", className:"accounts-btn", onAccountsRemove_Done: "doSIMAccountDone"},
		]},
		{className:"accounts-footer-shadow"},
		{kind:"Toolbar", className:"enyo-toolbar-light", components:[
			{kind: "Button", label: AccountsUtil.BUTTON_BACK, className:"accounts-toolbar-btn", onclick: "doSIMAccountDone"}
		]},
		{name:"getNumContacts", kind: "DbService", dbKind: "com.palm.contact.sim:1", method: "find", onResponse: "gotNumContacts"}
	],
	
	showSIMInfo: function(account) {
		// Show the SIM icon in the title bar
		if (account && account.icon && account.icon.loc_48x48)
			this.$.titleIcon.setSrc(account.icon.loc_48x48);
		else
			this.$.titleIcon.setSrc(AccountsUtil.libPath + "images/acounts-48x48.png");
			
		// Determine if the device has a SIM slot, and get the model name		
		var deviceInfo = window.PalmSystem && JSON.parse(PalmSystem.deviceInfo);
		var simSlot = (deviceInfo && deviceInfo.carrierAvailable)? deviceInfo.carrierAvailable : "";
		var deviceName = (deviceInfo && deviceInfo.modelNameAscii)? deviceInfo.modelNameAscii : "";
		
		console.log("Number=" + account.phoneNumber + " isPhoneNumber=" + account.isPhoneNumber + " SIM slot=" + simSlot + " SIM removed=" + account.SIMRemoved + " name=" + deviceName);
		
		// Display the SIM info
		if (account.isPhoneNumber)
			this.$.SIMDescription.setCaption(AccountsUtil.LIST_TITLE_PHONENUMBER);
		else
			this.$.SIMDescription.setCaption(AccountsUtil.LIST_TITLE_SIM_ID);
		this.$.SIMNumber.setContent(account.phoneNumber);
		
		// Can the account be removed?  Yes, if the SIM isn't currently in the device
		if (account.SIMRemoved) {
			// The SIM is currently not in the device.  Can it be inserted?
			if (simSlot)
				template = new enyo.g11n.Template(AccountsUtil.TEXT_NO_SIM_HAS_SIM_SLOT);
			else
				template = new enyo.g11n.Template(AccountsUtil.TEXT_NO_SIM_WIFI_ONLY);
			this.$.SIMMsg.setContent(template.evaluate({device: deviceName}));
			
			// Initialize the 'Remove Account' button
			this.$.removeAccountButton.init(account);

			// Show the message and the 'Remove Account' button
			this.$.SIMMsg.show();
			this.$.removeAccountButton.show();
		}
		else {
			// Hide the message and the 'Remove Account' button
			this.$.SIMMsg.hide();
			this.$.removeAccountButton.hide();
		}
		
		// Hide the "XXX Contacts" box for now
		this.$.ContactCount.hide();
		
		// Get the number of contacts for this SIM
		this.$.getNumContacts.call({query: {"where":[{"prop":"accountId","op":"=","val": account._id}]}, count:true});
	},
	
	gotNumContacts: function(inSender, inResponse) {
		var num = (inResponse && inResponse.returnValue == true && inResponse.count)? inResponse.count: 0;

		// Display the number of contacts
		var template = new enyo.g11n.Template(AccountsUtil.TEXT_NUM_CONTACTS);
		var t = new enyo.g11n.Template(AccountsUtil.TEXT_NUM_CONTACTS);
		this.$.NumContacts.setContent(t.formatChoice(num, {num: num}));
		this.$.ContactCount.show();
	}
});
