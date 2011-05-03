/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.EnyoKeyManager",
	kind: enyo.VFlexBox,
	components: [
        { 
			kind: "PalmService", 
			service: "palm://com.palm.keymanager/", 
			method: "generate", 
			name: "generateService",
			onSuccess:"serviceSuccess", 
			onFailure: "serviceFail"
		},
        { 
			kind: "PalmService", 
			service: "palm://com.palm.keymanager/", 
			method: "fetchKey", 
			name: "fetchService",
			onSuccess:"serviceSuccess", 
			onFailure: "serviceFail"
		},
        { 
			kind: "PalmService", 
			service: "palm://com.palm.keymanager/", 
			method: "keyInfo", 
			name: "keyInfoService",
			onSuccess:"serviceSuccess", 
			onFailure: "serviceFail"
		},
        { 
			kind: "PalmService", 
			service: "palm://com.palm.keymanager/", 
			method: "store", 
			name: "storeService",
			onSuccess:"serviceSuccess", 
			onFailure: "serviceFail"
		},
        { 
			kind: "PalmService", 
			service: "palm://com.palm.keymanager/", 
			method: "remove", 
			name: "removeService",
			onSuccess:"serviceSuccess", 
			onFailure: "serviceFail"
		},
        { 
			kind: "PalmService", 
			service: "palm://com.palm.keymanager/", 
			method: "crypt", 
			name: "cryptService",
			onSuccess:"serviceCryptSuccess", 
			onFailure: "serviceCryptFail"
		},
		
		{kind: "PageHeader", components: [
			{kind: "VFlexBox", flex: 1, components: [
					{content: "Enyo Key Manager"},
					{content: "The Key Manager (KM) provides JavaScript applications with key management and cryptographic functionality.", style: "font-size: 14px"}
				]},
			]},
			{className: "enyo-row", components: [
			{kind: "Input", name:'keyname', hint: "Enter key name...", components: [
				{kind: "ListSelector", name:'encryptionType',value: "AES", items: [
					{caption: "AES"},
					{caption: "3DES"}
				]},
				{kind: "Button", name:'generateButton', caption: "Generate Key", onclick:"handleButtonTapped"}
				
			]},
			{className: "margin-medium", components: [
						{kind: "RowGroup", caption: "Inputs", components: [
							{kind: enyo.HFlexBox, style:'width:100%', components: [
								{kind: "Button", name:"fetchButton", flex:1,caption: "Fetch!", onclick:"handleButtonTapped"},
								{kind: "Button", name:"storeKeyButton", flex:1,caption: "Store Key", onclick:"handleButtonTapped"},
								{kind: "Button", name:"infoButton", flex:1,caption: "Key Info", onclick:"handleButtonTapped"},
								{kind: "Button", name:"removeButton", flex:1,caption: "Remove Key", onclick:"handleButtonTapped"}
							]}
						]},
						{name: "info1", style: "height: 50px;"}
					]},
			{
				kind: "RowGroup",
				caption: "Crypt",
				components: [{kind: "Input", name:'cryptText', hint: "Enter text to encrypt..."},{kind: enyo.HFlexBox, style:'width:100%', components: [
								
								{kind: "Button", name:'encryptButton',caption: "Encrypt",flex:1, className: "enyo-button-affirmative", onclick:"handleButtonTapped"},
								{kind: "Button", name:'decryptButton',caption: "Decrypt",flex:1, className: "enyo-button-negative", onclick:"handleButtonTapped"}
							]},
							{name: "info2", style: "height: 50px;"}
							 ]
			}		
		]},
		{name: "errorDialog", kind: "Dialog", components: [
			{name:'Title', className: "enyo-item enyo-first", style: "padding: 12px", content: ""},
			{name:'Desc', className: "enyo-item enyo-last", style: "padding: 12px; font-size: 14px", content: ""},
			{kind: "Button", caption: "OK", onclick:"closeErrorDialog"}
		]},
	],
	handleButtonTapped: function(inSender, inValue) {
		this.keyname = this.$.keyname.getValue();
		this.algorithm = this.$.encryptionType.value
		if (this.$.keyname.getValue() == '') {
			this.displayErrorDialog({
				title: 'Key Error',
				desc: 'Please enter a valid key.'
			});
		}
		else {
			switch (inSender.name) {
				case 'generateButton':
					if (this.algorithm === '3DES') 
						this.size = 24;
					else 
						this.size = 16
					this.$.generateService.call({
						"owner": 'com.palmdts.app.enyokeymanager',
						"keyname": this.keyname,
						"size": this.size,
						"type": this.$.encryptionType.value,
						"nohide": true
					});
					
					break;
				case 'fetchButton':
					console.log("inSender " + inSender.name)
					this.$.fetchService.call({
						"keyname": this.keyname
					});
					break;
				case 'storeKeyButton':
					console.log("STORE")
					this.$.storeService.call({
						"keyname": this.keyname,
						"keydata": Base64.encode("This here be some key data"),
						"type": this.algorithm
					});
					break;
				case 'infoButton':
					this.$.keyInfoService.call({
						"keyname": this.keyname
					});
					break;
				case 'removeButton':
					this.$.removeService.call({
						"keyname": this.keyname
					});
					break;
				case 'encryptButton':
					this.data = this.$.cryptText.getValue();
					this.encrypt = true;
					if (!this.data) {
						this.displayErrorDialog({
							title: 'No Text',
							desc: 'Please enter text to encrypt'
						});
					}
					else {
						this.$.cryptService.call({
							"keyname": this.keyname,
							"algorithm": this.algorithm,
							"decrypt": false,
							"data": Base64.encode(this.data)
						});
					}
					break;
				case 'decryptButton':
					if (!this.data) {
						this.displayErrorDialog({
							title: 'No data',
							desc: 'No data to decrypt, enter data first and encrypt first.'
						});
					}
					else {
						this.encrypt = false;
						this.$.cryptService.call({
							"keyname": this.keyname,
							"algorithm": this.algorithm,
							"decrypt": true,
							"data": this.encryptedData
						});
					}
					break;
			}
		}
	},
	displayErrorDialog: function(inValue) {
		this.$.Title.setContent(inValue.title);
		this.$.Desc.setContent(inValue.desc);
		this.$.errorDialog.toggleOpen();	
	},
	closeErrorDialog: function(inSender, inValue) {
		this.$.errorDialog.close();	
	},
	serviceSuccess: function(inSender, inValue) {
		this.$.info1.setContent(JSON.stringify(inValue));	
	},
	serviceFail: function(inSender, inValue) {
		this.$.info1.setContent(JSON.stringify(inValue));	
	},
	serviceCryptSuccess: function(inSender, inValue) {
		if(this.encrypt){
			this.encryptedData = inValue.data;
			this.$.info2.setContent(JSON.stringify(inValue));
		}else{
			this.$.info2.setContent("Decrypted data : " + Base64.decode(inValue.data));	
		}
		
			
		
	},
	serviceCryptFail: function(inSender, inValue) {
		this.$.info2.setContent(JSON.stringify(inValue));	
	}
});