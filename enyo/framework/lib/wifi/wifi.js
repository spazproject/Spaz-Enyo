/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/******************************
WiFi - Service
******************************/
var rb = new enyo.g11n.Resources({root: "$enyo-lib/wifi"});
enyo.kind({
	name: "WiFiService",
	kind: "PalmService",
	service: "palm://com.palm.wifi/"
});

/******************************
WiFi - Popup 
******************************/

label_headerTitle_networklist		= rb.$L("Wi-Fi Setup");
label_headerTitle_ipconfig			= rb.$L("Wi-Fi Setup");
label_headerTitle_joinnewnetwork	= rb.$L("Join Other Network");
label_headerTitle_joinsecurenetwork	= rb.$L("Join ");
label_headerTitle_captiveportal		= rb.$L("No Internet Connection");
label_headerTitle_nointernet		= rb.$L("No Internet Connection");
label_headerTitle_testing			= rb.$L("Wi-Fi Setup");

label_headerInfo_networklist		= rb.$L("Choose a network");
label_headerInfo_ipconfig			= rb.$L("Connected to ");
label_headerInfo_joinnewnetwork		= rb.$L("");
label_headerInfo_joinsecurenetwork	= rb.$L("");
label_headerInfo_captiveportal		= rb.$L("The network you have selected contains a captive portal which requires additional authentication, and cannot be used for initial setup. Try another network.");
label_headerInfo_nointernet			= rb.$L("Cannot connect to the internet through this connection. Try another network.");
label_headerInfo_testing			= rb.$L("Checking internet connectivity...");

enyo.kind({
	name: "WiFiPopup",
	kind: "ModalDialog",
	lazy: false,
	width: "451px",
	published: {
		headerTitle: label_headerTitle_networklist,
		headerInfo: label_headerInfo_networklist
	},
	events: {
		onFinish: "",
		onCancel: ""
	},

	caption: label_headerTitle_networklist,

	components: [
		{"content": label_headerInfo_networklist , name: "_headerInfo", style: "font-size: 18px;" },
		{flex:1, name: "wifiConfig", kind: "WiFiConfig", className: "wifi-list", onViewChange: "updatePopup"},
		{name: "cancelButton", kind: "Button", caption: rb.$L("Cancel"), showing: false, onclick: "closePopup"}
	],
	create: function() {
		this.inherited(arguments);
	},
	reset: function() {
		this.$.wifiConfig.purgeWiFiProfiles();
	},
	start: function() {
		this.$.wifiConfig.turnWiFiOn();
	},
	closePopup: function() {
		this.$.wifiConfig.deconfigure();
		this.close();
		this.doCancel();
	},
	updatePopup: function(inSender, inViewName) {
		var hideCancelButton = false;
		switch (inViewName) {
			case "IpConfig":
				hideCancelButton = true;
				this.setCaption(label_headerTitle_ipconfig);
				this.$._headerInfo.setContent(label_headerInfo_ipconfig +
					this.$.wifiConfig.getJoinedNetwork().ssid);
				break;
			case "JoinSecureNetwork":
				hideCancelButton = true;
				this.setCaption(label_headerTitle_joinsecurenetwork +
					this.$.wifiConfig.getSelectedNetwork().ssid);
				this.$._headerInfo.setContent(label_headerInfo_joinsecurenetwork);
				break;
			case "JoinNewNetwork":
				hideCancelButton = true;
				this.setCaption(label_headerTitle_joinnewnetwork);
				this.$._headerInfo.setContent(label_headerInfo_joinnewnetwork);
				break;
			case "CaptivePortal":
				this.setCaption(label_headerTitle_captiveportal);
				this.$._headerInfo.setContent(label_headerInfo_captiveportal);
				break;
			case "NoInternet":
				this.setCaption(label_headerTitle_nointernet);
				this.$._headerInfo.setContent(label_headerInfo_nointernet);
				break;
			case "TestingInternet":
				this.setCaption(label_headerTitle_testing);
				this.$._headerInfo.setContent(label_headerInfo_testing);
				break;
			default:
				this.setCaption(label_headerTitle_networklist);
				this.$._headerInfo.setContent(label_headerInfo_networklist);
				break;
		}

		(hideCancelButton) ? this.$.cancelButton.hide() : this.$.cancelButton.show();
	},
	headerTitleChanged: function() {
		if (this.$.wifiConfig.isInNetworkView() ) this.setCaption(this.headerTitle);
	},
	headerInfoChanged: function() {
		if (this.$.wifiConfig.isInNetworkView() ) this.$._headerInfo.setContent(this.headerInfo);
	}
});

/******************************
WiFi - Config 
******************************/
enyo.kind({
	name: "WiFiConfig",
	kind: "enyo.VFlexBox",
	lazy: false,
	height: "410px",
	published: {
		liteMode: false,
		selectedNetwork: null,
		joinedNetwork: null
	},
	events: {
		onViewChange: ""
	},
	components: [
		{name: "GetNetworkStatus", kind: "PalmService", service: "palm://com.palm.connectionmanager/", method: "getStatus", subscribe: true, resubscribe: true, onResponse: "handleNetworkStatusResponse"},

		{name: "SetRadioState", kind: "WiFiService", method: "setstate", onFailure: "handleSetStateFailure"},
		{name: "GetConnectionStatus", kind: "WiFiService", method: "getstatus", subscribe: true, resubscribe: true, onResponse: "handleWiFiConnectionStatus"},
		{name: "FindNetworks", kind: "WiFiService", method: "findnetworks", onResponse: "handleFindNetworksResponse"},
		{name: "Connect", kind: "WiFiService", method: "connect", onResponse: "handleConnectResponse"},
		{name: "GetProfileInfo", kind: "WiFiService", method: "getprofile", onResponse: "handleProfileInfoResponse"},
		{name: "DeleteProfile", kind: "WiFiService", method: "deleteprofile", onFailure: "handleDeleteProfileFailure"},

		{kind: "Pane", name: "pane", flex: 1, components: [
			{kind: "Group", components: [
				{kind: "Item", className: "enyo-first", layoutKind: "HFlexLayout", name: "searchMsg", pack: "center", showing: false, flex: 1, components: [
					{content: rb.$L("Searching for networks..."), style: "font-size: 18px;", flex: 1},
					{kind: "Spinner", name:"searchSpinner", style: "margin: -3px 0;", showing: false}
				]},
				{kind: "Scroller", height: "405px", flex: 1, components: [
					{name: "list", kind: "VirtualRepeater", onSetupRow: "updateRow", flex: 1, components: [
						{kind: "Item", name: "item", onclick: "itemClick", tapHighlight: true, components: [
							{kind: "HFlexBox", components: [
								{className: "wifi-item-name", name: "itemName", flex:1},
								{kind:"Spacer", flex:0.1},
								{kind:"Image", className: "wifi-item-state", name: "itemConnected", src: "$enyo-lib/wifi/images/checkmark.png"},
								{kind:"Image", className: "wifi-item-secure", name: "itemSecure", src:"$enyo-lib/wifi/images/secure-icon.png"},
								{kind:"Image", name: "itemStrength"}
							]},
							{className: "wifi-message-status", name: "itemStatus", content: ""}
						]}
					]},
					{kind: "Item", className: "enyo-last", onclick: "showJoinOtherNetwork", tapHighlight: true, layoutKind: "HFlexLayout", flex: 1, components: [
						{kind:"Image", className: "wifi-item-join", src:"$enyo-lib/wifi/images/join-plus-icon.png"},
						{className: "wifi-item-name", content: "Join Network", flex: 1}
					]}
				]}
			]},
			{kind: "WiFiIpConfig", name: "wifiIpConfig", onForget: "handleForgetNetwork", onBack: "showNetworkList"},
			{kind: "VFlexBox", components: [
				{kind: "VFlexBox", flex:1, components: [
					{kind: "Input", alwaysLooksFocused: true, name: "joinSsid", changeOnInput: true, onkeydown: "ssidKeyDowned", onchange: "joinInfoChanged", hint: rb.$L("Enter network name"), autoCapitalize: "lowercase", autocorrect: false, spellcheck: false},
					{kind: "Input", alwaysLooksFocused: true, name: "joinUsername", changeOnInput: true, onkeydown: "usernameKeyDowned", onchange: "joinInfoChanged", hint: rb.$L("Enter username"), autoCapitalize: "lowercase", autocorrect: false, spellcheck: false, showing: false, style: "margin-top: 10px;"},
					{kind: "PasswordInput", alwaysLooksFocused: true, name: "joinPassword", changeOnInput: true, onkeydown: "passwordKeyDowned", onchange: "joinInfoChanged", hint: rb.$L("Enter password"), autoCapitalize: "lowercase", autocorrect: false, spellcheck: false, showing: false, style: "margin-top: 10px;"},
					{kind: "RowGroup", name: "securityGroup", caption: rb.$L("NETWORK SECURITY"), components: [
						{kind: "ListSelector", name: "securityList", onChange: "handleSecuritySelection", items: [
							{caption: rb.$L("Open"), value: "none"},
							{caption: rb.$L("WPA Personal"), value: "wpa-personal"},
							{caption: rb.$L("WEP"), value: "wep"},
							{caption: rb.$L("Enterprise"), value: "enterprise"}
						]}
					]}
				]},
				{name: "joinMessage", content: "", className: "wifi-message-error"},
				{kind: "HFlexBox", components: [
					{kind: "Button", flex: 1, style: "margin-right:10px;", caption: rb.$L("Cancel"), onclick: "discardNetwork"},
					{kind: "ActivityButton", flex: 1, height: "42px", className: "enyo-button-dark", caption: rb.$L("Sign In"), name: "joinButton", disabled: true, onclick: "joinNetwork"}
				]}
			]}
		]}
	],

	create: function() {
		this.inherited(arguments);
		this.data = [];
		this.autoscan = null;
		this.lastAddedProfileId = 0;
		this.shouldDiscardNetwork = false;
		this.$.GetConnectionStatus.call({});
		this.$.GetNetworkStatus.call({});
	},

	isInNetworkView: function() {
		return (0 === this.$.pane.getViewIndex() );
	},

	turnWiFiOn: function() {
		this.$.SetRadioState.call({"state":"enabled"});
		this.startAutoScan();
	},

	turnWiFiOff: function() {
		this.$.SetRadioState.call({"state":"disabled"});
	},

	deconfigure: function() {
		this.cancelPendingConnection();
		this.stopAutoScan('clear');
		this.lastAddedProfileId = 0;
		this.shouldDiscardNetwork = false;
		this.selectedNetwork = null;
	},

	disconnect: function() {
		if (null !== this.joinedNetwork) {
			this.$.DeleteProfile.call({"profileId":this.joinedNetwork.profileId});
		}
		else if (null !== this.selectedNetwork && this.selectedNetwork.profileId) {
			this.$.DeleteProfile.call({"profileId":this.selectedNetwork.profileId});
		}
	},

	cancelPendingConnection: function() {
		if (0 !== this.lastAddedProfileId) {
			this.$.DeleteProfile.call({"profileId":this.lastAddedProfileId});
			this.lastAddedProfileId = 0;
		}
	},

	purgeWiFiProfiles: function() {
		this.$.DeleteProfile.call({});
	},

	startAutoScan: function() {
		if (null === this.autoscan) {
			this.autoscan = window.setInterval(enyo.bind(this, this.triggerAutoScan), 12000);
			if (!this.data.length) {
				this.$.searchMsg.show();
				this.$.searchSpinner.setShowing(true);
				this.triggerAutoScan(); // force-trigger the first scan 

				// show connected network if any
				if (null !== this.joinedNetwork) {
					this.data.push({networkInfo:this.joinedNetwork});
					this.$.list.render();
				}
			}
		}
	},

	delayAutoScan: function() {
		if (null !== this.autoscan) {
			window.clearInterval(this.autoscan);
			this.autoscan = window.setInterval(enyo.bind(this, this.triggerAutoScan), 12000);
		}
	},

	stopAutoScan: function(action) {
		if (null !== this.autoscan) {
			window.clearInterval(this.autoscan);
			this.autoscan = null;
		}
		if ('clear' === action) {
			this.data = [];
			this.$.list.render();
		}
	},

	triggerAutoScan: function() {
		this.$.FindNetworks.call({});
	},

	assocFailureString: function(error) {
		var message;
		switch (error) {
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
		return message;
	},

	disableJoinButtons: function(state) {
		this.$.joinButton.setActive(false);
		this.$.joinButton.setCaption(rb.$L("Sign In") );
		this.$.joinButton.setDisabled(state);
	},

	showNetworkList: function() {
		this.selectedNetwork = null;
		this.applyStyle("height", "410px");
		this.$.pane.selectViewByIndex(0);
		this.doViewChange("NetworkList");
		this.startAutoScan();
	},

	showIpConfig: function(inProfile) {
		this.selectedNetwork = null;
		this.applyStyle("height", "410px");
		this.$.pane.selectViewByIndex(1);
		this.$.wifiIpConfig.setJoinedProfile(inProfile);
		this.doViewChange("IpConfig");
		this.stopAutoScan('clear');
	},

	showJoinOtherNetwork: function() {
		this.selectedNetwork = null;
		this.shouldDiscardNetwork = false;
		this.applyStyle("height", "240px");
		this.$.pane.selectViewByIndex(2);
		this.doViewChange("JoinNewNetwork");
		this.stopAutoScan('clear');

		this.$.joinSsid.setValue("");
		this.$.joinUsername.setValue("");
		this.$.joinPassword.setValue("");
		this.$.joinMessage.setContent("");

		this.$.joinSsid.show();
		this.$.securityList.setValue("none");
		this.$.securityGroup.show();
		this.$.joinUsername.hide();
		this.$.joinPassword.hide();

		this.disableJoinButtons(true);
		this.$.joinSsid.forceFocus();
	},

	showJoinSecureNetwork: function(info) {
		this.selectedNetwork = info;
		this.shouldDiscardNetwork = false;
		this.$.pane.selectViewByIndex(2);
		this.doViewChange("JoinSecureNetwork");
		this.stopAutoScan('clear');

		this.$.joinSsid.setValue("");
		this.$.joinUsername.setValue("");
		this.$.joinPassword.setValue("");
		this.$.joinMessage.setContent("");

		this.$.joinSsid.hide();
		this.$.securityGroup.hide();
		this.$.joinPassword.show();

		if ("enterprise" === info.securityType) {
			this.applyStyle("height", "220px");
			this.$.joinUsername.show();
			this.$.joinUsername.forceFocus();
		}
		else {
			this.applyStyle("height", "150px");
			this.$.joinUsername.hide();
			this.$.joinPassword.forceFocus();
		}

		this.disableJoinButtons(true);
	},

	updateNetworkItem: function(info, inIndex) {
		var isSelected = false;
		var isJoined   = false;

		if (0 === inIndex)
		{
			this.$.item.addClass("enyo-first");
		}

		if (null !== this.selectedNetwork &&
			this.selectedNetwork.ssid === info.ssid)
		{
			isSelected = true;
		}

		if (null !== this.joinedNetwork &&
			this.joinedNetwork.ssid === info.ssid)
		{
			isJoined = true;
		}

		this.$.itemName.setContent(info.ssid);

		if (undefined !== info.securityType) {
			this.$.itemSecure.show();
		}
		else {
			this.$.itemSecure.hide();
		}

		var sb = info.signalBars;
		if (!sb) {
			this.$.itemStrength.hide();
		}
		else {
			var strength = ['low','average','excellent'];
			this.$.itemStrength.setSrc('$enyo-lib/wifi/images/wifi-icon-'+strength[sb-1]+'.png');
			this.$.itemStrength.show();
		}

		this.$.itemStatus.setContent("");
		this.$.itemStatus.hide();
		this.$.itemConnected.hide();

		switch (info.connectState) {
		case "associated":
			this.joinedNetwork = info;
			this.$.itemStatus.setContent(rb.$L("CONNECTING..."));
			this.$.itemStatus.show();
			break;
		case "associating":
			this.$.itemStatus.setContent(rb.$L("CONNECTING..."));
			this.$.itemStatus.show();
			break;
		case "ipConfigured":
			this.joinedNetwork = info;
			this.$.itemConnected.show();
			break;
		case "ipFailed":
			this.joinedNetwork = info;
			this.$.itemStatus.setContent(rb.$L("TAP TO CONFIGURE IP ADDRESS"));
			this.$.itemStatus.show();
			break;
		case "associationFailed":
			if (undefined !== info.lastConnectError &&
					"ApNotFound" !== info.lastConnectError &&
					"DisconnectRequest" !== info.lastConnectErr)
			{
				this.$.itemStatus.setContent(rb.$L("ASSOCIATION FAILED"));
				this.$.itemStatus.show();
			}
		case "notAssociated":
			if (isJoined) this.joinedNetwork = null;
			if (isSelected) this.selectedNetwork = null;
			break;
		default:
			break;
		}

		// display connecting status as soon as the network is selected
		if (undefined === info.connectState && isSelected)
		{
			this.$.itemStatus.setContent(rb.$L("CONNECTING..."));
			this.$.itemStatus.show();
		}
	},

	associationStateChanged: function(info) {
		var that = this;
		this.data.forEach(function(record, index) {
			if (record.networkInfo.ssid === info.ssid) {
				record.networkInfo.connectState = info.connectState;
				record.networkInfo.lastConnectError = info.lastConnectError;
				record.networkInfo.profileId = info.profileId;
				if (undefined !== info.signalBars) {
					record.networkInfo.signalBars = info.signalBars;
					record.networkInfo.signalLevel = info.signalLevel;
				}
				//that.$.list.renderRow(index); // doesn't seem to fully work
				that.$.list.render();
			}
		});
	},

	joinStateChanged: function(info) {
		// check if join state change is for our network
		if (null !== this.selectedNetwork &&
				this.selectedNetwork.ssid !== info.ssid &&
				this.$.joinSsid.getValue() !== info.ssid) {
			// nothing to do
			return;
		}

		switch (info.connectState) {
			case "associationFailed":
				this.$.joinMessage.setContent(this.assocFailureString(info.lastConnectError) );
				this.$.joinButton.setActive(false);
				this.$.joinButton.setCaption(rb.$L("Sign In") );
				this.$.joinPassword.forceFocus();
				break;
			case "ipConfigured":
			case "ipFailed":
				this.joinedNetwork = info;
				if (null !== this.selectedNetwork ||
						(null === this.selectedNetwork &&
						 this.$.joinSsid.getValue() === info.ssid) ) {
					this.selectedNetwork = null;
					this.showNetworkList();
				}
				break;
		}
	},

	handleWiFiConnectionStatus: function(inSender, inResponse, inRequest) {
		if (inResponse) {
			if ("serviceDisabled" !== inResponse.status) {
				if ("serviceEnabled" === inResponse.status) this.startAutoScan();
				if (undefined === inResponse.networkInfo) return;
				if (undefined === inResponse.networkInfo.connectState) return;

				if ("notAssociated" === inResponse.networkInfo.connectState) {
					this.joinedNetwork = null;
				}
				else if ("ipConfigured" === inResponse.networkInfo.connectState) {
					this.joinedNetwork = inResponse.networkInfo;
				}

				switch (this.$.pane.getViewIndex() ) {
					case 0:
						this.associationStateChanged(inResponse.networkInfo);
						break;
					case 1:
						if ("notAssociated" === inResponse.networkInfo.connectState) {
							this.showNetworkList();
						}
						else if ("ipConfigured" === inResponse.networkInfo.connectState) {
							this.$.GetProfileInfo.call({"profileId":inResponse.networkInfo.profileId});
						}
						break;
					case 2:
						this.joinStateChanged(inResponse.networkInfo);
						break;
				}
			}
			else {
				this.showNetworkList();
				this.stopAutoScan('clear');
			}
		}
	},

	handleNetworkStatusResponse: function(inSender, inResponse, inRequest) {
		var statusMsg = "";

		if (0 !== this.$.pane.getViewIndex() ) return;

		if (undefined !== inResponse &&
				false === inResponse.isInternetConnectionAvailable &&
				undefined !== inResponse.wifi &&
				"connected" === inResponse.wifi.state) {

			switch (inResponse.wifi.onInternet) {
				case "captivePortal":
					this.doViewChange("CaptivePortal");
					return;
				case "no":
					this.doViewChange("NoInternet");
					return;
				default:
					break;
			}
		}

		this.doViewChange("NetworkList");
	},

	handleConnectResponse: function(inSender, inResponse, inRequest) {
		if (undefined !== inResponse &&
				undefined !== inResponse.profileId) {
			this.lastAddedProfileId = inResponse.profileId;
		}
	},

	handleFindNetworksResponse: function(inSender, inResponse, inRequest) {

		if (0 !== this.$.pane.getViewIndex() ) return;
		if (null === this.autoScan) return;

		if (undefined !== inResponse &&
				true === inResponse.returnValue &&
				undefined !== inResponse.foundNetworks) {
			this.data = inResponse.foundNetworks;
			this.$.list.render();

			this.$.searchMsg.hide();
			this.$.searchSpinner.setShowing(false);
		}
		else {
			alert("Error: Cannot Load Network List");

			this.data = [];
			this.$.list.render();

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


	updateRow: function(inSender, inIndex) {
		var record = this.data[inIndex];
		if (record) {
			this.updateNetworkItem(record.networkInfo, inIndex);
			return true;
		}
	},

	itemClick: function(inSender, inEvent, inRowIndex) {
		var record = this.data[inRowIndex];
		if (record) {
			if ("ipConfigured" === record.networkInfo.connectState ||
					"ipFailed" === record.networkInfo.connectState)	{
				this.$.GetProfileInfo.call({"profileId":record.networkInfo.profileId});
				return;
			}
			else if (undefined === record.networkInfo.securityType) {
				this.delayAutoScan();
				this.cancelPendingConnection();
				this.$.Connect.call({"ssid":record.networkInfo.ssid});
				this.selectedNetwork = record.networkInfo;
				//this.$.list.renderRow(inRowIndex);
				this.$.list.render();
			}
			else if (undefined !== record.networkInfo.profileId &&
					undefined === record.networkInfo.lastConnectError) {
				this.delayAutoScan();
				this.cancelPendingConnection();
				this.$.Connect.call({"profileId":record.networkInfo.profileId});
				this.selectedNetwork = record.networkInfo;
				//this.$.list.renderRow(inRowIndex);
				this.$.list.render();
			}
			else {
				this.showJoinSecureNetwork(record.networkInfo);
			}
		}
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
			}
		}

		return pass;
	},

	isKeyInHex: function(type, key) {
		var hexPattern = new RegExp('^[A-Fa-f0-9]*$');
		var isInHex = false;

		if (hexPattern.test(key) ) {
			if ("wep" === type &&
					(10 === key.length || 26 === key.length) ) {
				isInHex = true;
			}
			else if ("wpa-personal" === type &&
					64 == key.length) {
				isInHex = true;
			}
		}

		return isInHex;
	},

	ssidKeyDowned: function(inSender, inResponse) {
		if (inResponse.keyCode !== 13) return;
		if (this.$.joinUsername.getShowing() ) this.$.joinUsername.forceFocus();
		else if (this.$.joinPassword.getShowing() ) this.$.joinPassword.forceFocus();
		else if (!this.$.joinButton.getDisabled() ) this.$.joinButton.doClick();
	},

	usernameKeyDowned: function(inSender, inResponse) {
		if (inResponse.keyCode !== 13) return;
		if (this.$.joinPassword.getShowing() ) this.$.joinPassword.forceFocus();
		else if (!this.$.joinButton.getDisabled() ) this.$.joinButton.doClick();
	},

	passwordKeyDowned: function(inSender, inResponse) {
		if (inResponse.keyCode !== 13) return;
		if (!this.$.joinButton.getDisabled() ) this.$.joinButton.doClick();
	},

	joinInfoChanged: function(inSender, inEvent) {
		var username = this.$.joinUsername.getValue();
		var password = this.$.joinPassword.getValue();
		var ssid     = this.$.joinSsid.getValue();
		var security = this.$.securityList.getValue();

		if (null !== this.selectedNetwork) {
			ssid = this.selectedNetwork.ssid;
			security = this.selectedNetwork.securityType;
		}

		if ("enterprise" === security) {
			if (0 < username.length && 0 < password.length) {
				this.disableJoinButtons(false);
			}
			else {
				this.disableJoinButtons(true);
			}
		}
		else if ("wpa-personal" === security || "wep" === security) {
			if (this.validatePasskey(security, password) ) {
				this.disableJoinButtons(false);
			}
			else {
				this.disableJoinButtons(true);
			}
		}
		else {
			this.disableJoinButtons(false);
		}

		if (!ssid.length || 32 < ssid.length) {
			this.disableJoinButtons(true);
		}

		this.$.joinMessage.setContent("");
	},

	discardNetwork: function() {
		if (this.shouldDiscardNetwork) {
			this.cancelPendingConnection();
			this.shouldDiscardNetwork = false;
		}
		this.showNetworkList();
	},

	handleForgetNetwork: function() {
		this.joinedNetwork = null;
	},

	joinNetwork: function() {
		var username = this.$.joinUsername.getValue();
		var password = this.$.joinPassword.getValue();
		var ssid     = this.$.joinSsid.getValue();
		var security = this.$.securityList.getValue();
		var hidden   = true; 

		if (null !== this.selectedNetwork) {
			ssid = this.selectedNetwork.ssid;
			security = this.selectedNetwork.securityType;
			hidden = false;
		}

		this.cancelPendingConnection();
		this.shouldDiscardNetwork = true;

		switch (security) {
		case "wpa-personal":
		case "wep":
			this.$.Connect.call({"ssid":ssid,
				"wasCreatedWithJoinOther":hidden,
				"security":{"securityType":security,
				"simpleSecurity":{"passKey":password,
						"isInHex":this.isKeyInHex(security, password)}}});
			break;
		case "enterprise":
			this.$.Connect.call({"ssid":ssid,
				"wasCreatedWithJoinOther":hidden,
				"security":{"securityType":security,
				"enterpriseSecurity":{"userId":username,"password":password}}});
			break;
		default:
			this.$.Connect.call({"ssid":ssid,"wasCreatedWithJoinOther":hidden});
			break;
		}

		this.$.joinMessage.setContent("");
		this.$.joinButton.setActive(true);
		this.$.joinButton.setCaption(rb.$L("Signing In...") );
		this.stopAutoScan(null);
	},

	handleSecuritySelection: function()	{
		switch (this.$.securityList.getValue() ) {
		case "none":
			this.applyStyle("height", "240px");
			this.$.joinUsername.hide();
			this.$.joinPassword.hide();
			this.$.joinSsid.forceFocus();
			break;
		case "wpa-personal":
		case "wep":
			this.applyStyle("height", "300px");
			this.$.joinPassword.show();
			this.$.joinUsername.hide();
			this.$.joinPassword.forceFocus();
			break;
		case "enterprise":
			this.applyStyle("height", "360px");
			this.$.joinUsername.show();
			this.$.joinPassword.show();
			this.$.joinUsername.forceFocus();
			break;
		}

		this.joinInfoChanged(null, null);
	}
});

/******************************
WiFi - IP Configuration
******************************/
enyo.kind({
	name: "WiFiIpConfig",
	kind: "enyo.VFlexBox",
	lazy: false,
	events:	{
		onForget: "",
		onBack: ""
	},
	published: {
		joinedProfile: ""
	},
	components: [
		{name: "DeleteProfile", kind: "WiFiService", method: "deleteprofile", onFailure: "handleDeleteProfileFailure"},
		{name: "Connect", kind: "WiFiService", method: "connect", onFailure: "handleConnectFailure"},
		{kind: "Item", className: "enyo-first", style: "margin-top: 15px;", align: "center", tapHighlight: false, layoutKind: "HFlexLayout", components: [
			{content: rb.$L("Automatic IP settings"), flex: 1},
			{kind: "ToggleButton", name: "dhcpToggleButton", onChange: "handleDhcpToggleButton"}
		]},
		{kind: "Group", components: [
			{kind: "Scroller", height: "235px", flex:1, components: [
					{kind: "Input", name: "ipField", hint: rb.$L("Enter IP address"), inputType: "number", autoKeyModifier: "num-lock", spellcheck: false, components: [
						{content: rb.$L("ADDRESS"), className: "wifi-label-text"}
					]},
					{kind: "Input", name: "subnetField", hint: rb.$L("Enter subnet mask"), inputType: "number", autoKeyModifier: "num-lock", spellcheck: false, components: [
						{content: rb.$L("SUBNET"), className: "wifi-label-text"}
					]},
					{kind: "Input", name: "gatewayField", hint: rb.$L("Enter gateway address"), inputType: "number", autoKeyModifier: "num-lock", spellcheck: false, components: [
						{content: rb.$L("GATEWAY"), className: "wifi-label-text"}
					]},
					{kind: "Input", name: "dns1Field", hint: rb.$L("Enter primary DNS server"), inputType: "number", autoKeyModifier: "num-lock", spellcheck: false, components: [
						{content: rb.$L("DNS SERVER"), className: "wifi-label-text"}
					]},
					{kind: "Input", name: "dns2Field", hint: rb.$L("Enter secondary DNS server (optional)"), inputType: "number", autoKeyModifier: "num-lock", spellcheck: false, components: [
						{content: rb.$L("DNS SERVER"), className: "wifi-label-text"}
					]}
			]}
		]},
		{kind: "Button", className: "enyo-button-negative", caption: rb.$L("Forget Network"), onclick: "handleForgetNetworkButton"},
		{kind: "Button", caption: rb.$L("Done"), onclick: "handleDoneButton"}
	],
	create: function() {
		this.inherited(arguments);
	},
	joinedProfileChanged: function() {
		var profileInfo = this.joinedProfile.wifiProfile;
		var emptyIp = "0.0.0.0";
		var editable = false;
		if (undefined === this.joinedProfile.ipInfo ||
				emptyIp === this.joinedProfile.ipInfo.ip ||
				(undefined !== profileInfo.useStaticIp &&
				 true === profileInfo.useStaticIp) ) {
			editable = true;
		}
		this.displayIpInfo(editable);
	},
	displayIpInfo: function(editable) {
		var emptyIp = "0.0.0.0";
		var ipInfo = this.joinedProfile.ipInfo;

		this.$.dhcpToggleButton.setState(!editable);
		this.useStaticIp = editable;

		this.$.ipField.setValue("");
		this.$.subnetField.setValue("");
		this.$.gatewayField.setValue("");
		this.$.dns1Field.setValue("");
		this.$.dns2Field.setValue("");

		this.$.ipField.setDisabled(!editable);
		this.$.subnetField.setDisabled(!editable);
		this.$.gatewayField.setDisabled(!editable);
		this.$.dns1Field.setDisabled(!editable);
		this.$.dns2Field.setDisabled(!editable);

		if (undefined !== ipInfo) {
			if (undefined !== ipInfo.ip && emptyIp !== ipInfo.ip) {
				this.$.ipField.setValue(ipInfo.ip);
			}
			if (undefined !== ipInfo.subnet && emptyIp !== ipInfo.subnet) {
				this.$.subnetField.setValue(ipInfo.subnet);
			}
			if (undefined !== ipInfo.gateway && emptyIp !== ipInfo.gateway) {
				this.$.gatewayField.setValue(ipInfo.gateway);
			}
			if (undefined !== ipInfo.dns1) {
				this.$.dns1Field.setValue(ipInfo.dns1);
			}
			if (undefined !== ipInfo.dns2) {
				this.$.dns2Field.setValue(ipInfo.dns2);
			}
		}

		if (editable) {
			this.$.ipField.forceFocus();
		}
	},

	handleDhcpToggleButton: function(inSender, inState) {
		this.displayIpInfo(!inState);
	},

	handleForgetNetworkButton: function() {
		var profileInfo = this.joinedProfile.wifiProfile;
		this.doForget();		
		this.$.DeleteProfile.call({"profileId":profileInfo.profileId});
		this.doBack();
	},

	validateIpSettings: function() {
		return true;
	},

	handleDoneButton: function() {
		var profileInfo = this.joinedProfile.wifiProfile;
		var ipInfo = {
			ip: this.$.ipField.getValue(),
			subnet: this.$.subnetField.getValue(),
			gateway: this.$.gatewayField.getValue(),
			dns1: this.$.dns1Field.getValue(),
			dns2: this.$.dns2Field.getValue()
		};
		var valid = this.validateIpSettings(ipInfo);
		var reconnect = false;

		if (undefined === profileInfo.useStaticIp ||
				false === profileInfo.useStaticIp) {
			if (true === this.useStaticIp && valid) {
				// old:dhcp, new:static, reconnect
				reconnect = true;
				profileInfo.ipInfo = ipInfo;
			}
		}
		else {
			if (true === this.useStaticIp && valid) {
				// old:static, new:static, reconnect
				reconnect = true;
				profileInfo.ipInfo = ipInfo;
			}
			else {
				// old:static, new:dhcp
				reconnect = true;
				profileInfo.ipInfo = undefined;
			}
		}

		profileInfo.useStaticIp = this.useStaticIp;
		if (reconnect) {
			this.$.Connect.call(profileInfo);
		}
		else {
			this.doBack();
		}
	}
});
