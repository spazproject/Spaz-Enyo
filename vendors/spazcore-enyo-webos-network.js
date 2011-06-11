/*jslint 
browser: true,
nomen: false,
debug: true,
forin: true,
undef: true,
white: false,
onevar: false 
 */

/**
 * opts = {
 *  content_type:'', // optional
 *  field_name:'', //optional, default to 'media;
 *  file_url:'',
 *  url:'', // REQ
 *  platform: {
 * 		sceneAssistant:{} // REQ; the sceneAssistant we're firing the service req from
 *  }
 * 	extra:{...} // extra post fields (text/plain only atm)
 * } 
 * @param Function onSuccess 
 */
sc.helpers.HTTPUploadFile = function(opts, onSuccess, onFailure) {
	
	opts = sch.defaults({
        'method':'POST',
        'content_type':'img',
        'field_name':'media',
        'file_url':null,
        'url':null,
        'extra':null,
        'headers':null,
        'username':null,
        'password':null,
		'onProgress':null
    }, opts);

	
	var key, val, postparams = [], customHttpHeaders = [];
	var file_url   = opts.file_url || null;
	var url        = opts.url      || null;
	var field_name = opts.field_name || 'media';
	var content_type = opts.content_type || 'img';

	if (opts.extra) {
		for (key in opts.extra) {
			val = opts.extra[key];
			postparams.push({ 'key' :key, 'data':val, contentType:'text/plain' });
		}
	}
	
	if (opts.username) {
		postparams.push({ 'key' :'username', 'data':opts.username, contentType:'text/plain' });
	}
	if (opts.password) {
		postparams.push({ 'key' :'password', 'data':opts.password, contentType:'text/plain' });
	}
	
	
	if (opts.platform) {
		var owner = opts.platform.owner;
		var componentName = opts.platform.componentName||'spazcore_http_uploader';
	} else {
		sch.error('You must pass the opts.platform.owner argument to upload on webOS Enyo');
		return;
	}

	var onSuccessCheck = _.bind(function(inSender, inResponse) {
		if (inResponse.completed) { // we're actually done
			this[componentName+'onSuccess'](inResponse); 
		} else { // fire a progress event
			if (opts.onProgress) {
				opts.onProgress(inResponse);
			}
		}
	}, owner);

	
	var headers = [];
	if (opts.headers) {
		for(key in opts.headers) {
			customHttpHeaders.push( key + ': ' + opts.headers[key] );
		}
	}


	if (!owner.$[componentName]) {
		
		// map the callback function names to the functions we passed
		
		owner[componentName+'onSuccessCheck'] = onSuccessCheck;
		owner[componentName+'onSuccess'] = onSuccess;
		owner[componentName+'onFailure'] = onFailure;
		
		owner.createComponent({
				'name': componentName,
				'kind': 'enyo.PalmService',
				'service': 'palm://com.palm.downloadmanager',
				'method': 'upload', 
				'subscribe': true,
				'onResponse' : componentName+'onSuccessCheck',
				'onFailure' : componentName+'onFailure'
			}, {'owner': owner}
		);		
	}

	
	var request = owner.$[componentName].call({
		'url'        : url,
		'contentType': content_type,
		'fileLabel'  : field_name,
		'fileName'   : file_url,
		'postParameters': postparams,
		cookies      : {}, // optional
		customHttpHeaders: customHttpHeaders // optional
	});

};