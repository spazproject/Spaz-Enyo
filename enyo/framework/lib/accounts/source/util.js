/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
var AccountsUtil = (function () {
	var rb = new enyo.g11n.Resources({root: "$enyo-lib/accounts"});
	
	function whereEquals(prop, val) {
		return {
			prop: prop,
			op: "=",
			val: val
		};
	}

	// Get the template that matches the given ID.  Template ID's should
	// be unique so the first match is returned.
	function getTemplateById(templates, id) {
		for (var i=0, l=templates.length; i<l; i++) {
			if (templates[i].templateId === id) {
				return templates[i];
			}
		}
		console.log("getTemplateById: template " + id + " not found");
		return undefined;
	}

	function matchCapabilities(t) {
		// Automatically exclude hidden templates, or those without validators
		if (!t.validator || t.hidden) {
			console.log("matchCapabilities: excluding " + t.templateId + " because it is hidden or doesn't have a validator");
			return false;
		}
		
		// Should this template be excluded?
		if (this.exclude) {
			// Format the excludes consistently (in an array)
			var excludes;
			if (typeof this.exclude === "string") {
				excludes = [this.exclude];
			} else if (this.capability) {
				excludes = this.exclude;
			}
			for (var i=0, l=excludes.length; i<l; i++) {
				console.log("matchCapabilities: excluding " + excludes[i] + "?")
				if (t.templateId === excludes[i]) {
					console.log("matchCapabilities: excluding " + t.templateId)
					return false;
				}
			}
		}

		// Format the sought capability consistently (in an array)
		var capabilities;
		if (typeof this.capability === "string") {
			capabilities = [this.capability];
		} else if (this.capability) {
			capabilities = this.capability;
		}

		// First find out which of the asked-for capabilities match.
		// reject if no matches are found.  not every capability has to be
		// supported.
		if (capabilities) {
			// Loop through the capabilities
			for (var i=0, l=capabilities.length; i<l; i++) {
				for (var j=0, ll=t.capabilityProviders.length; j<ll; j++) {
					if (t.capabilityProviders[j].capability === capabilities[i]) {
						console.log("matchCapabilities: " + t.templateId + " has capability " + capabilities[i]);
						return true;
					}
				}
			}
		}
		return false;
	}

	return {
		// Exported methods
		
		// Get the template that matches the given ID
		// Example: var template = AccountsUtil.getTemplateById(this.templates, "com.palm.yahoo");
		getTemplateById: getTemplateById,

		filterTemplateId: function(account) {
			var excludes = [];
			if (typeof this.exclude === "string")
				excludes = [this.exclude];
			else
				excludes = this.exclude;
			for (var i=0, l=excludes.length; i<l; i++) {
				if (account.templateId === excludes[i]) {
					console.log("filterTemplateId: excluding " + account.templateId)
					return false;
				}
			}
			return true;
		},
		
		toArray: function(object) {
			if (typeof object === "string")
				return(object);
			else if (object)
				return (object);
			return [];
		},
		
		// Iterate through an array of accounts for the one that matches the given accountId
		getAccount: function(accountArray, accountId) {
			for (i=0, l=accountArray.length; i < l; i++) {
				if (accountArray[i]._id === accountId)
					return accountArray[i];
			}
		},

		// Filter the templates by ID or capability
		// Templates marked hidden or those without a validator will automatically be filtered out
		// Examples:
		// var template = AccountsUtil.filterTemplates(this.templates, {templateId: 'com.palm.yahoo'}); (returns single template)
		// var template = AccountsUtil.filterTemplates(this.templates, {capability: 'MAIL'}); (returns array of templates)
		// var template = AccountsUtil.filterTemplates(this.templates, {capability: ['MAIL', 'CONTACTS']}); (returns array of templates)
		// var template = AccountsUtil.filterTemplates(this.templates, {capability: 'MAIL', exclude:'com.palm.yahoo'}); (returns array of templates, excluding Yahoo)
		// var template = AccountsUtil.filterTemplates(this.templates, {capability: 'MAIL'], exclude: ["com.palm.sim", "com.palm.palmprofile"]});
		filterTemplates: function (templates, filterBy) {
			var selectedTemplates = templates, tmpl;

			if (filterBy) {
				if (filterBy.templateId) {
					console.log("filterTemplates: filterBy.templateId");
					tmpl = getTemplateById(templates, filterBy.templateId);
					if (tmpl == undefined) {
						console.log("filterTemplates: Unable to find template with id=" + filterBy.templateId)
						return undefined;
					}
					return tmpl;
				}
				
				if (filterBy.capability) {
					// First match templates based on capabilities
					selectedTemplates = templates.filter(matchCapabilities, filterBy);
					for (var i=0, l=selectedTemplates.length; i<l; i++)
						console.log("filterBy.capability match =" + selectedTemplates[i].templateId);
					
					return selectedTemplates;
				}
				
				console.log("filterTemplates: Must specify 'templateId' or 'capability' - no filtering performed!")	
			}
			return selectedTemplates;
		},
		
		createWhere: function (filterBy) {
			var where = [];

			if (filterBy) {
				if (filterBy.templateId) {
					where.push(whereEquals("templateId", filterBy.templateId));
				} else if (filterBy.capability) {
					where.push(whereEquals("capabilityProviders.capability", filterBy.capability));
				}
			}
			if (!(filterBy && filterBy.showDeleted)) {
				where.push(whereEquals("beingDeleted", false));
			}

			return (where.length > 0) ? where : undefined;
		},
	
		annotateAccount: function (account, templates) {
			// net effect is totally stitched together acct+template obj,
			// where template props override acct props at both the top level
			// and per-capability
			// (but extra acct props are still present in case accounts need to store supplemental data)

			if (this.templates)
				templates = this.templates;
			var result,
				phoneNumber,
				usernameTemplate,
			    template = getTemplateById(templates, account.templateId);

			result = enyo.clone(account);

			if (!template) {
				console.warn("annotateAccount: template not found: " + account.templateId);
				return result;
			}

			enyo.mixin(result, template);

			// Copy the capability providers from the template
			result.capabilityProviders = template.capabilityProviders.map(function (c) {
				var clone = enyo.clone(c), accountCap;
				
				// Find the capability in the template
				for (var i=0, l=account.capabilityProviders.length; i<l; i++) {
					if (account.capabilityProviders[i].id === c.id) {
						accountCap = account.capabilityProviders[i];
						break;
					}
				}    

				return enyo.mixin(clone, accountCap);
			});
			
			if (account.templateId === "com.palm.sim" && result.username && result.username.indexOf("SIMREMOVED ") === 0) {
				phoneNumber = result.username.substring(11);
				if (phoneNumber) {
					var phone = new enyo.g11n.PhoneNumber(phoneNumber);
					var phonefmt = new enyo.g11n.PhoneFmt();
					var template = new enyo.g11n.Template(this.SIM_REMOVED_TEMPLATE);
					result.username = template.evaluate({phoneNumber: phonefmt.format(phone)});
				}
			}

			return result;
		},
		
		// Dedupe an array, based on the specifies property.  The array passed in is modified by this call.
		dedupeByProperty: function (items, idProp) {
			var hash = {};
			
			console.log("dedupeByProperty: BEFORE array items: " + items.length);
			for (var i=0, l=items.length; i<l; i++) {
//				console.log("dedupeByProperty: looking at id = : " + items[i][idProp]);
				if (hash[items[i][idProp]] === undefined) {
					hash[items[i][idProp]] = 1;
//					console.log("dedupeByProperty: " + items[i][idProp] + " is unique");
				}
				else {
					items.splice(i, 1);
					i--; l--;
				}
			}
			console.log("dedupeByProperty: AFTER array items: " + items.length);
		},
		
		// Convenience method method to enable/disable controls
		disableControl: function(control, disable) {
			control.disabled = disable;
			control.disabledChanged();
		},

		// Convenience method method to set a caption
		changeCaption: function(control, caption) {
			control.caption = caption;
			control.captionChanged();
		},
		
		getCapabilityText: function (rawName) {
			var capability = this.localizedCapabilities[rawName];
			return capability || rawName; 
		},
		
		setCrossAppParameters: function(crossAppObj, ui, params) {
			// Special case email
			if (ui.appId === "com.palm.app.email") {
				ui.name = "accounts/wizard.html";
			}
			console.log("Custom UI: Opening iFrame " + ui.appId + "/" + ui.name);			
			crossAppObj.setPath(ui.name);
			crossAppObj.setApp(ui.appId);
			crossAppObj.setParams(params);
		},
		
		getSynergyTitle: function(capability) {
			if (!capability || enyo.isArray(capability))
				return this.TITLE_SYNERGY_SEARCH;
			var template = new enyo.g11n.Template(this.TITLE_SYNERGY_PIM_SEARCH);
			var capabilityStr = this.getCapabilityText(capability);
			return template.evaluate({capability: capabilityStr});
		},

		// The path to the accounts library		
		libPath: enyo.path.paths["-..-lib-accounts"],
		
		// Localized strings
		PAGE_TITLE_ACCOUNTS:		rb.$L("Accounts"),
		PAGE_TITLE_ADD_ACCOUNT:		rb.$L("Add an account"),
		PAGE_TITLE_SIGN_IN:			rb.$L("Sign in"),
		PAGE_TITLE_ACCOUNT_SETTINGS:rb.$L("Account settings"),
		BUTTON_ADD_ACCOUNT:			rb.$L("Add account"),
		BUTTON_BACK:				rb.$L("Back"),
		BUTTON_CANCEL:				rb.$L("Cancel"),
		BUTTON_SIGN_IN:				rb.$L("Sign in"),
		BUTTON_SIGNING_IN:			rb.$L("Signing in..."),
		BUTTON_CHANGE_LOGIN:		rb.$L("Change login settings"),
		BUTTON_REMOVE_ACCOUNT:		rb.$L("Remove account"),
		BUTTON_CREATE_ACCOUNT:		rb.$L("Create account"),
		BUTTON_CREATING_ACCOUNT:	rb.$L("Creating account..."),
		BUTTON_GO:					rb.$L("Go"),
		BUTTON_REMOVE_ACCOUNT:		rb.$L("Remove Account"),
		BUTTON_KEEP_ACCOUNT:		rb.$L("Cancel"),
		LIST_TITLE_USERNAME:		rb.$L("Username"),
		LIST_TITLE_PASSWORD:		rb.$L("Password"),
		GROUP_TITLE_ACCOUNT_NAME:	rb.$L("Account name"),
		GROUP_TITLE_USE_ACCOUNT_WITH: rb.$L("Use account with"),
		LOADING_ACCOUNTS:			rb.$L("Loading Accounts..."),
		SIM_REMOVED_TEMPLATE:		rb.$L("#{phoneNumber} - SIM Removed"),
		TEXT_WELCOME:				rb.$L("Welcome!"),
		TEXT_GET_STARTED_PROFILE_ACCOUNT: rb.$L("Get started with your HP webOS account:"),
		TEXT_GET_STARTED_EXISTING_ACCOUNTS: rb.$L("Get started with your existing accounts:"),
		TEXT_OR_ADD_NEW_ACCOUNT:	rb.$L("Or add a new account:"),
		TEXT_FIND_MORE:				rb.$L("Find More ..."),
		TEXT_REMOVE_CONFIRM:		rb.$L("Are you sure you want to remove this account and all associated data from your device?"),
		TITLE_SYNERGY_SEARCH: 		rb.$L("HP Synergy Services"),
		TITLE_SYNERGY_PIM_SEARCH:	rb.$L("#{capability} HP Synergy Services"),
		
		localizedCapabilities: {
			"MAIL": rb.$L("Email"),
			"CALENDAR": rb.$L("Calendar"),
			"CONTACTS": rb.$L("Contacts"),
			"REMOTECONTACTS": rb.$L("Address Lookup"),
			"TASKS": rb.$L("Tasks"),
			"MEMOS": rb.$L("Memos"),
			"MESSAGING": rb.$L("Messaging"),
			"PHONE": rb.$L("Phone"),
			"SMS": rb.$L("Text Messaging"),
			"IM": rb.$L("Instant Messaging"),
			"PHOTO": rb.$L("Photo"),
			"VIDEO.UPLOAD": rb.$L("Video Upload"),
			"DOCUMENTS": rb.$L("Documents")
		}

		
		
	};
}());

