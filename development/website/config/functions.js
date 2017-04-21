	/**********************************************************************
	*  Author: Neha Kapoor (neha@jobshout.org)
	*  Project Lead: Balinder WALIA (bwalia@jobshout.org)
	*  Project Lead Web...: https://twitter.com/balinderwalia
	*  Name..: Jobshout Server NodeJS
	*  Desc..: Jobshout Server (part of Jobshout Suite of Apps)
	*  Web: http://jobshout.org
	*  License: http://jobshout.org/LICENSE.txt
	**/

	/**********************************************************************
	*  functions.js contain all the functions required for requests
	**/
	
	var init = require('./init');
	var mongodb=init.mongodb;

module.exports = 
{
  	// These functions which will be called in the main file, which is server.js
  	returnFindOneByMongoID : function (db, collectionName, search_id, cb){
		var outputObj = new Object();
		db.collection(collectionName).findOne({_id: new mongodb.ObjectID(search_id)}, function(err, document_details) {
			if (err) {
				outputObj["error"]   = err;
				cb(outputObj);
      		} else if (document_details) {
      			outputObj["aaData"]   = document_details;
				cb(outputObj);
     		}
		});
	},
	
	nowTimestamp : function (){
		var timeStampStr=Math.round(new Date().getTime()/1000)
		return timeStampStr;
	},
	
	returnNavigation : function (db, cb){
		db.collection('bookmarks').find({"status": { $in: [ 1, "1" ] } , categories: { $in: [ 'footer-navigation', 'main-menu' ] }}).sort( { order_by_num: 1 } ).toArray(function(err, tokens_result) {
			if(err) return cb(null)
			cb(tokens_result);
		});
	},
	
	guid : function () {
  		function s4() {
    		return Math.floor((1 + Math.random()) * 0x10000)
      		.toString(16)
      		.substring(1);
  		}
  		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	}
};