/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/******************************
WiFi - Helper 
******************************/
enyo.kind({
	name: "WiFiHelper",
	kind: "enyo.VFlexBox",
	published: {
		liteMode: false
	},
	components: [

		{name: "SetRadioState", kind: "WiFiService", method: "setstate", onFailure: "handleSetStateFailure"},

		{name: "GetConnectionStatus", kind: "WiFiService", method: "getstatus", subscribe: true, resubscribe: true, onResponse: "handleWiFiConnectionStatus"},

		{name: "FindNetworks", kind: "WiFiService", method: "findnetworks", onResponse: "handleFindNetworksResponse"},

		{name: "Connect", kind: "WiFiService", method: "connect", onFailure: "handleConnectFailure"},

		{name: "GetProfileInfo", kind: "WiFiService", method: "getprofile", onResponse: "handleProfileInfoResponse"},

		{kind: "RowGroup", name: "radioControl", components: [
			{kind: "HFlexBox", components: [
				{content: rb.$L("Wi-Fi"), flex: 1},
				{kind: "ToggleButton", name: "wifiToggleButton", onChange: "handleToggleButton"}
			]}
		]},

		{kind: "Pane", name: "pane", flex: 1, components: [

			{content: rb.$L("Wi-Fi is turned off"), className: "wifi-message-normal", style: "padding: 20px 35px 0px 33px;"},

			{kind:"Scroller", flex:1, layoutKind: "VFlexLayout", components: [
				{kind: "RowGroup", style:"overflow:hidden;", layoutKind:"VFlexLayout", caption: rb.$L("CHOOSE A NETWORK"), flex:1 , components: [
					{kind: "HFlexBox", className: "wifi-spinner-box", name: "searchMsg", components: [
						{content: rb.$L("Searching for networks..."), flex: 1},
						{kind: "Spinner", name:"searchSpinner", showing: false}
					]},
					{name: "list", className: "wifi-list",  kind: "VirtualRepeater", onGetItem: "updateRow", components: [
						{kind: "Item", onclick: "itemClick", tapHighlight: true, components: [
							{kind: "HFlexBox", components: [
								{kind:"Image", className: "wifi-item-join", name: "joinNewIcon", src:"$enyo-lib/wifi/images/join-plus-icon.png"},
								{className: "wifi-item-name", name: "itemName", flex:1},
								{kind:"Spacer"},
								{kind:"Image", className: "wifi-item-state", name: "itemConnected", src: "$enyo/images/checkmark.png"},
								{kind:"Image", className: "wifi-item-secure", name: "itemSecure", src:"$enyo-lib/wifi/images/secure-icon.png"},
								{kind:"Image", className: "wifi-item-strength", name: "itemStrength"}
							]},
							{className: "wifi-message-status", name: "itemStatus", content: ""}
						]}
					]}
				]},
				{name:'autoConnectMessage', content: rb.$L("Your device automatically connects to known networks"), className: "wifi-message-normal"}
			]},

			{kind:"Scroller", flex:1, layoutKind: "VFlexLayout", components: [
				{kind: "WiFiIpConfig", className: "wifi-ip-box", name: "wifiIpConfig", onBack: "showNetworkList"}
			]}
		]},

		{kind: "Popup", name: "popupPersonal", scrim: "true", modal: "true", dismissWithClick: "false", components: [
			{content: rb.$L("Join Network"), name: "personalSsid"},
			{kind: "PasswordInput", name: "passphrase", focused: true, onchange: "personalInfoChanged", hint: rb.$L("Password"), autoCapitalize: "lowercase", autocorrect: false, spellcheck: false},
			{name: "personalConnectMessage", content: "", className: "wifi-message-error"},
			{kind: "ActivityButton", caption: rb.$L("JOIN"), name: "personalJoinButton", disabled: true, onclick: "handleJoinPersonal"},
			{kind: "Button", caption: rb.$L("CANCEL"), onclick: "closeAllPopups"}
		]},

		{kind: "Popup", name: "popupEnterprise", scrim: "true", modal: "true", dismissWithClick: "false", components: [
			{content: rb.$L("Join Network"), name: "enterpriseSsid"},
			{kind: "Input", name: "username", focused: true, onchange: "enterpriseInfoChanged", hint: rb.$L("Username"), autoCapitalize: "lowercase", autocorrect: false, spellcheck: false},
			{kind: "PasswordInput", name: "password", onchange: "enterpriseInfoChanged", hint: rb.$L("Password"), spellcheck: false},
			{name: "enterpriseConnectMessage", content: "", className: "wifi-message-error"},
			{kind: "ActivityButton", caption: rb.$L("JOIN"), name: "enterpriseJoinButton", disabled: true, onclick: "handleJoinEnterprise"},
			{kind: "Button", caption: rb.$L("CANCEL"), onclick: "closeAllPopups"}
		]},

		{kind: "Popup", name: "popupNew", scrim: "true", modal: "true", dismissWithClick: "false", components: [
			{content: rb.$L("Join Network")},
			{kind: "Input", name: "newSsid", focused: true, onchange: "newInfoChanged", hint: rb.$L("Enter network name..."), autoCapitalize: "lowercase", autocorrect: false, spellcheck: false},
			{kind: "Input", name: "newUsername", onchange: "newInfoChanged", hint: rb.$L("Username"), autoCapitalize: "lowercase", autocorrect: false, spellcheck: false},
			{kind: "PasswordInput", name: "newPassword", onchange: "newInfoChanged", hint: rb.$L("Password"), autoCapitalize: "lowercase", autocorrect: false, spellcheck: false},
			{kind: "RowGroup", caption: rb.$L("NETWORK SECURITY"), components: [
				{kind: "ListSelector", name: "securityList", onChange: "handleSecuritySelection", items: [
					{caption: rb.$L("Open")},
					{caption: rb.$L("WPA Personal")},
					{caption: rb.$L("WEP")},
					{caption: rb.$L("Enterprise")}
				]}
			]},
			{name: "otherConnectMessage", content: "", className: "wifi-message-error"},
			{kind: "ActivityButton", caption: rb.$L("JOIN"), name: "newJoinButton", disabled: true, onclick: "handleJoinNewNetwork"},
			{kind: "Button", caption: rb.$L("CANCEL"), onclick: "closeAllPopups"}
		]}

	],

	create: function() {
		this.data = [];
		this.inherited(arguments);

		this.selectedNetwork = null;
		this.joinedNetwork = null;

		this.autoscan = null;

		this.$.GetConnectionStatus.call({});
		this.liteModeChanged();
	},

	liteModeChanged: function() {
		if (true === this.liteMode) {
			// hide unused elements in minimal mode
			this.$.radioControl.hide();
			this.$.autoConnectMessage.hide();
		}
		else {
			this.$.radioControl.show();
			this.$.autoConnectMessage.show();
		}
	},

	handleToggleButton: function(inSender, inState)	{
		if (inState)	{
			this.turnWiFiOn();
		} else	{
			this.turnWiFiOff();
		}
	},

	turnWiFiOn: function(){
		this.$.wifiToggleButton.setState(true);
		this.$.SetRadioState.call({"state":"enabled"});
	},

	turnWiFiOff: function(){
		this.$.wifiToggleButton.setState(false);
		this.$.SetRadioState.call({"state":"disabled"});
	},

	handleWiFiConnectionStatus: function(inSender, inResponse, inRequest) {
		if (inResponse) {
			if ("serviceDisabled" !== inResponse.status) {

				if (2 === this.$.pane.getViewIndex() ) {
					// if in ip configuration screen, nothing to do for status notification
					// except for notAssociated event
					if (inResponse.networkInfo &&
							"notAssociated" === inResponse.networkInfo.connectState) {
						this.showNetworkList();
					}
					return;
				}

				this.$.wifiToggleButton.setState(true);
				this.$.pane.selectViewByIndex(1);
				this.startAutoScan();

				if (inResponse.networkInfo) {
					this.updateNetworkList(inResponse.networkInfo);

					if ("associationFailed" === inResponse.networkInfo.connectState) {
						this.handleAssociationFailure(inResponse.networkInfo);
					}
					else if ("associated" === inResponse.networkInfo.connectState) {
						this.handleAssociationSuccess(inResponse.networkInfo);
						this.joinedNetwork = inResponse.networkInfo;
					}
					else if ("ipFailed" === inResponse.networkInfo.connectState ||
							"ipConfigured" === inResponse.networkInfo.connectState) {
						this.joinedNetwork = inResponse.networkInfo;
					}
				}
			}
			else {
				this.$.wifiToggleButton.setState(false);
				this.$.pane.selectViewByIndex(0);
				this.stopAutoScan();
			}
		}
	},

	handleAssociationFailure: function(info) {
		var message = "";

		if (this.popupSsid !== info.ssid) {
			// this message is not for us, ignore
			return;
		}

		switch (info.lastConnectError) {
			case "ApNotFound":
				message = rb.$L("No network of that name with that security setting was found.");
				break;
			case "IncorrectPasskey":
				message = rb.$L("The password you entered is not correct. Try again.");
				break;
			case "IncorrectPassword":
				message = rb.$L("The username or password you entered is not correct. Try again.");
				break;
			default:
				message = rb.$L("Unable to connect. Try again.");
				break;
		}

		this.$.personalConnectMessage.setContent(message);
		this.$.enterpriseConnectMessage.setContent(message);
		this.$.otherConnectMessage.setContent(message);

		this.$.personalJoinButton.setActive(false);
		this.$.enterpriseJoinButton.setActive(false);
		this.$.newJoinButton.setActive(false);
	},

	handleAssociationSuccess: function(info) {
		if (this.popupSsid === info.ssid) {
			this.closeAllPopups();
		}
	},

	updateNetworkList: function(info) {
		//console.log("UPDATING NETWORK LIST");

		this.data.forEach(function(record) {
			//console.log(record.networkInfo.ssid + " vs. " + info.ssid);

			if (record.networkInfo.ssid === info.ssid) {
				record.networkInfo.connectState = info.connectState;
				record.networkInfo.lastConnectError = info.lastConnectError;
				if (undefined !== info.signalBars) {
					record.networkInfo.signalBars = info.signalBars;
					record.networkInfo.signalLevel = info.signalLevel;
				}
			}
		});
		//this.$.list.punt();
		this.$.list.render();
	},

	startAutoScan: function() {
		if (null === this.autoscan) {
			//console.log("CREATING WIFI SCAN TIMER");

			this.$.searchMsg.show();
			this.$.searchSpinner.setShowing(true);

			this.autoscan = window.setInterval(enyo.bind(this, this.triggerAutoScan), 12000);
			this.triggerAutoScan(); // force-trigger the first scan 
		}
	},

	stopAutoScan: function() {
		if (null !== this.autoscan) {
			//console.log("DESTROYING WIFI SCAN TIMER");
			window.clearInterval(this.autoscan);
			this.autoscan = null;
		}
		this.data = [];
		this.$.list.render();
	},

	triggerAutoScan: function() {
		//console.log("AUTO SCAN TRIGGERED");
		//this.$.list.punt();
		this.$.FindNetworks.call({});
	},

	handleFindNetworksResponse: function(inSender, inResponse, inRequest) {
		if (undefined !== inResponse &&
			true === inResponse.returnValue &&
			undefined !== inResponse.foundNetworks) {
			this.data = inResponse.foundNetworks;
			this.data.push({networkInfo:{ssid:rb.$L("Join Network")}});
			this.$.list.render();

			this.$.searchMsg.hide();
			this.$.searchSpinner.setShowing(false);
		}
		else {
			alert("Error: Cannot Load Network List");

			this.$.searchMsg.show();
			this.$.searchSpinner.setShowing(true);
		}

	},

	handleProfileInfoResponse: function(inSender, inResponse, inRequest) {
		if (undefined !== inResponse &&
			true === inResponse.returnValue &&
			inResponse.wifiProfile.profileId === this.joinedNetwork.profileId) {
			this.showIpConfig(inResponse);
		}
	},

	showNetworkList: function() {
		this.$.pane.selectViewByIndex(1);
		this.startAutoScan();
	},

	showIpConfig: function(inProfile) {
		this.$.wifiIpConfig.setJoinedProfile(inProfile);
		this.$.pane.selectViewByIndex(2);
		this.selectedNetwork = null;
		this.stopAutoScan();
	},

	updateRow: function(inSender, inIndex) {

		var record = this.data[inIndex];
		if (record) {
			// bind data to item controls
			this.$.itemName.setContent(record.networkInfo.ssid);

			if (undefined !== record.networkInfo.securityType)	{
				this.$.itemSecure.show();
			} else	{
				this.$.itemSecure.hide();;
			}

			this.$.itemStatus.setContent("");
			this.$.itemStatus.hide();
			this.$.itemConnected.hide();

			if (undefined !== record.networkInfo.connectState) {
				switch (record.networkInfo.connectState) {
				case "associating":
				case "associated":
					this.$.itemStatus.setContent(rb.$L("CONNECTING..."));
					this.$.itemStatus.show();
					break;
				case "ipConfigured":
					this.$.itemConnected.show();
					break;
				case "ipFailed":
					this.$.itemStatus.setContent(rb.$L("TAP TO CONFIGURE IP ADDRESS"));
					this.$.itemStatus.show();
					break;

				case "associationFailed":
				case "notAssociated":
					if (null !== this.joinedNetwork &&
							record.networkInfo.ssid === this.joinedNetwork.ssid) {
						this.joinedNetwork = null;
					}
					if (null !== this.selectedNetwork &&
							record.networkInfo.ssid === this.selectedNetwork.ssid) {
						this.selectedNetwork = null;
					}
					break;
          
				default:
					break;
				}
			}
			else if (null !== this.selectedNetwork &&
					record.networkInfo.ssid === this.selectedNetwork.ssid &&
					rb.$L("Join Network") !== this.selectedNetwork.ssid) {
				this.$.itemStatus.setContent(rb.$L("CONNECTING..."));
				this.$.itemStatus.show();
            }

			var sb = record.networkInfo.signalBars;
			if (!sb) {
				this.$.itemStrength.hide();
			} else {
				var strength = ['low','average','excellent'];
				this.$.itemStrength.setSrc('$enyo-lib/wifi/images/wifi-icon-'+strength[sb-1]+'.png');
				this.$.itemStrength.show();
			}

			if (inIndex === (this.data.length - 1)) {
				this.$.joinNewIcon.show();
			} else {
				this.$.joinNewIcon.hide();
			}

			return true;
		}
	},

	itemClick: function(inSender, inEvent, inRowIndex) {
		var record = this.data[inRowIndex];
		if (record) {
			this.selectedNetwork = record.networkInfo;

			if (inRowIndex === (this.data.length - 1)) {
				this.openJoinNewPopup();
				return;
			}

			if ("ipConfigured" === record.networkInfo.connectState ||
				"ipFailed" === record.networkInfo.connectState)	{
				this.$.GetProfileInfo.call({"profileId":record.networkInfo.profileId});
			} else if (undefined !== record.networkInfo.profileId) {
				this.$.list.render();
				this.$.Connect.call({"profileId":record.networkInfo.profileId});
			} else if (undefined !== record.networkInfo.securityType)	{
				if ("enterprise" === record.networkInfo.securityType) {
					this.openJoinEnterprisePopup(record.networkInfo);
				}
				else {
					this.openJoinPersonalPopup(record.networkInfo);
				}
			} else	{
				this.$.list.render();
				this.$.Connect.call({"ssid":record.networkInfo.ssid});
			}

		}
	},

	handleJoinPersonal: function()	{
		this.popupSsid = this.selectedNetwork.ssid;
		this.$.Connect.call({"ssid":this.selectedNetwork.ssid,
			"security":{"securityType":this.selectedNetwork.securityType,
			"simpleSecurity":{"passKey":this.$.passphrase.getValue(),
							  "isInHex":this.selectedNetwork.isKeyInHex}}});
		this.$.personalConnectMessage.setContent("");
		this.$.personalJoinButton.setActive(true);
	},

	handleJoinEnterprise: function()	{
		this.popupSsid = this.selectedNetwork.ssid;
		this.$.Connect.call({"ssid":this.selectedNetwork.ssid,
			"security":{"securityType":this.selectedNetwork.securityType,
			"enterpriseSecurity":{"userId":this.$.username.getValue(),"password":this.$.password.getValue()}}});
		this.$.enterpriseConnectMessage.setContent("");
		this.$.enterpriseJoinButton.setActive(true);
	},

	handleJoinNewNetwork: function()	{
		this.popupSsid = this.$.newSsid.getValue();

		switch (this.$.securityList.getValue() ) {
		case rb.$L("Open"):
			this.$.Connect.call({"ssid":this.popupSsid,"wasCreatedWithJoinOther":true});
			break;
		case rb.$L("WPA Personal"):
			this.$.Connect.call({"ssid":this.popupSsid,
				"wasCreatedWithJoinOther":true,
				"security":{"securityType":"wpa-personal",
				"simpleSecurity":{"passKey":this.$.newPassword.getValue(),
								  "isInHex":this.selectedNetwork.isKeyInHex}}});
			break;
		case rb.$L("WEP"):
			this.$.Connect.call({"ssid":this.popupSsid,
				"wasCreatedWithJoinOther":true,
				"security":{"securityType":"wep",
				"simpleSecurity":{"passKey":this.$.newPassword.getValue(),
								  "isInHex":this.selectedNetwork.isKeyInHex}}});
			break;
		case rb.$L("Enterprise"):
			this.$.Connect.call({"ssid":this.popupSsid,
				"wasCreatedWithJoinOther":true,
				"security":{"securityType":"enterprise",
				"enterpriseSecurity":{"userId":this.$.newUsername.getValue(),"password":this.$.newPassword.getValue()}}});
			break;
		}

		this.$.otherConnectMessage.setContent("");
		this.$.newJoinButton.setActive(true);
	},

	handleSecuritySelection: function()	{
		switch (this.$.securityList.getValue() ) {
		case rb.$L("Open"):
			this.$.newUsername.hide();
			this.$.newPassword.hide();
			this.$.newSsid.forceFocus();
			break;
		case rb.$L("WPA Personal"):
		case rb.$L("WEP"):
			this.$.newPassword.show();
			this.$.newUsername.hide();
			this.$.newPassword.forceFocus();
			break;
		case rb.$L("Enterprise"):
			this.$.newUsername.show();
			this.$.newPassword.show();
			this.$.newUsername.forceFocus();
			break;
		}

		this.newInfoChanged(null, null);
	},

	validatePasskey: function(type, key) {
		var hexPattern = new RegExp('^[A-Fa-f0-9]*$');
		var asciiPattern = new RegExp('^[\x00-\x7F]*$');
		var pass = false;

		if ("wep" === type) {
			switch (key.length) {
				case 5:		// 40-bit ASCII
				case 13:	// 104-bit ASCII
					if (asciiPattern.test(key) ) {
						pass = true;
					}
					break;
				case 10:	// 40-bit HEX
				case 26:	// 104-bit HEX
					if (hexPattern.test(key) ) {
						pass = true;
						this.selectedNetwork.isKeyInHex = true;
					}
					break;
				default:
					break;
			}
		}
		else if ("wpa-personal" === type) {
			if (8 <= key.length && 63 >= key.length) {
				pass = true;
			}
			else if (64 == key.length && hexPattern.test(key) ) {
				pass = true;
				this.selectedNetwork.isKeyInHex = true;
			}
		}

		return pass;
	},

	personalInfoChanged: function(inSender, inEvent) {
		var type = this.selectedNetwork.securityType;
		var key = this.$.passphrase.getValue();

		if (this.validatePasskey(type, key) ) {
			this.disableJoinButtons(false);
		}
		else {
			this.disableJoinButtons(true);
		}
	},

	enterpriseInfoChanged: function(inSender, inEvent) {
		var username = this.$.username.getValue();
		var password = this.$.password.getValue();

		if (0 < username.length && 0 < password.length) {
			this.disableJoinButtons(false);
		}
		else {
			this.disableJoinButtons(true);
		}
	},

	newInfoChanged: function(inSender, inEvent) {
		var ssid = this.$.newSsid.getValue();
		var username = this.$.newUsername.getValue();
		var password = this.$.newPassword.getValue();
		var securityAccepted = false;

		switch (this.$.securityList.getValue() ) {
		case rb.$L("Open"):
			securityAccepted = true;
			break;
		case rb.$L("WPA Personal"):
			securityAccepted = this.validatePasskey(
					"wpa-personal", password);
			break;
		case rb.$L("WEP"):
			securityAccepted = this.validatePasskey(
					"wep", password);
			break;
		case rb.$L("Enterprise"):
			if (0 < username.length && 0 < password.length) {
				securityAccepted = true;
			}
			break;
		}

		if (0 < ssid.length && 32 >= ssid.length && securityAccepted) {
			this.disableJoinButtons(false);
		}
		else {
			this.disableJoinButtons(true);
		}
	},

	openJoinNewPopup: function()	{
		this.$.newUsername.hide();
		this.$.newPassword.hide();
		this.$.securityList.setValue(rb.$L("Open"));

		this.$.newSsid.setValue("");
		this.$.newUsername.setValue("");
		this.$.newPassword.setValue("");
		this.$.otherConnectMessage.setContent("");
		this.$.popupNew.openAtCenter();
		this.disableJoinButtons(true);
		this.selectedNetwork.isKeyInHex = false;
		this.popupSsid = "";
		this.$.newSsid.forceFocus();
	},

	openJoinPersonalPopup: function(info)	{
		var joinTmp = new enyo.g11n.Template(rb.$L("Join #{ssid}"));
		this.$.personalSsid.setContent(joinTmp.evaluate({ssid: info.ssid}));
		this.$.passphrase.setValue("");
		this.$.personalConnectMessage.setContent("");
		this.$.popupPersonal.openAtCenter();
		this.disableJoinButtons(true);
		this.selectedNetwork.isKeyInHex = false;
		this.$.passphrase.forceFocus();
	},

	openJoinEnterprisePopup: function(info)	{
		var joinTmp = new enyo.g11n.Template(rb.$L("Join #{ssid}"));
		this.$.enterpriseSsid.setContent(joinTmp.evaluate({ssid: info.ssid}));
		this.$.username.setValue("");
		this.$.password.setValue("");
		this.$.enterpriseConnectMessage.setContent("");
		this.$.popupEnterprise.openAtCenter();
		this.disableJoinButtons(true);
		this.$.username.forceFocus();
	},

	disableJoinButtons: function(state) {
		this.$.personalJoinButton.setActive(false);
		this.$.enterpriseJoinButton.setActive(false);
		this.$.newJoinButton.setActive(false);

		this.$.personalJoinButton.setDisabled(state);
		this.$.enterpriseJoinButton.setDisabled(state);
		this.$.newJoinButton.setDisabled(state);
	},

	closeAllPopups: function()	{
		this.$.popupNew.close();
		this.$.popupPersonal.close();
		this.$.popupEnterprise.close();

		this.selectedNetwork = null;
	}

});

