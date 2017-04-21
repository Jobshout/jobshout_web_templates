	/**********************************************************************
	*  Author: Neha Kapoor (neha@rootcrm.org)
	*  Project Lead: Balinder WALIA (bwalia@rootcrm.org)
	*  Project Lead Web...: https://twitter.com/balinderwalia
	*  Name..: ROOTCRM
	*  Desc..: Root CRM (part of RootCrm Suite of Apps)
	*  Web: http://rootcrm.org
	*  License: http://rootcrm.org/LICENSE.txt
	**/

	/**********************************************************************
	*  functions.js contain all the functions required for requests
	**/
	
	var init = require('./init');
	var mongodb=init.mongodb;
	var nodemailer = require('nodemailer');
var self = module.exports = 
{
  // These functions which will be called in the main file, which is server.js
  	
  	templateSearch : function (db, templateStr, activeSystemsStr, req, cb){
     	var itemsPerPage = 10, pageNum=1;
		var outputObj = new Object();
	
		db.collection('system_templates').findOne({"code": templateStr , "status": { $in: [ 1, "1" ] } }, function(err, templateResponse) {
			if(err){
				outputObj["error"]   = "No such page exists!";
				cb(outputObj);
			}
			if(templateResponse){
		
				if(req.query.start){
					pageNum=parseInt(req.query.start);
				}
				if(req.query.limit){
					itemsPerPage=parseInt(req.query.limit);
				}
				if(pageNum==0){
					pageNum=1;
				}
				
				var definedAdminTablesArr= init.adminTablesArr;
				
				var query="{";
				var fetchFieldsObj="{}", table_name= templateResponse.table ;
				
				outputObj["table"]   = table_name;
				
				if(definedAdminTablesArr.indexOf(table_name)==-1){
					query+=" 'uuid_system': { $in: ['"+activeSystemsStr+"'] } ";
				}
				
				if (typeof templateResponse.search_columns !== 'undefined' && templateResponse.search_columns !== null && templateResponse.search_columns !== "")	{
					outputObj["enable_search"]   = true;
				}
				if (typeof templateResponse.enable_editor !== 'undefined' && templateResponse.enable_editor !== null && typeof templateResponse.editor_filename !== 'undefined' && templateResponse.editor_filename !== null && templateResponse.enable_editor==1  && templateResponse.editor_filename!="") {
						outputObj["editor"]   = templateResponse.editor_filename;
				}
				if(templateResponse.listing_columns){
					var listArr= templateResponse.listing_columns.split(',');
					if (typeof templateResponse.enable_editor !== 'undefined' && templateResponse.enable_editor !== null && typeof templateResponse.editor_field !== 'undefined' && templateResponse.editor_field !== null && templateResponse.enable_editor==1  && templateResponse.editor_field!="") {
						outputObj["uniqueField"]   = templateResponse.editor_field;
						listArr.push("Action");
					}
					outputObj["display_columns"]   = listArr;
					
					for(var l_count=0; l_count< listArr.length; l_count++){
						if(l_count==0){
							fetchFieldsObj="{";
							fetchFieldsObj+="'"+listArr[l_count]+"' : 1";
						}else{
							fetchFieldsObj+=", '"+listArr[l_count]+"' : 1";
						}
					}
					if (typeof templateResponse.enable_editor !== 'undefined' && templateResponse.enable_editor !== null && typeof templateResponse.editor_field !== 'undefined' && templateResponse.editor_field !== null && templateResponse.enable_editor==1  && templateResponse.editor_field!="") {
						fetchFieldsObj+=", '"+templateResponse.editor_field+"' : 1";
					}
					fetchFieldsObj+="}";
				}
				
				if(req.query.s){
					//query= '{'
					var searchStr = req.query.s;
					
					if(templateResponse.search_columns){
						if(typeof(templateResponse.search_columns)==="array" || typeof(templateResponse.search_columns)==="object"){
							var searchColumnArr=templateResponse.search_columns;
						}else{
							var searchColumnArr=JSON.parse(templateResponse.search_columns);
						}
						if(searchColumnArr.length>=1){
							
							var subQueryStr="";
							for(var s_count=0; s_count< searchColumnArr.length; s_count++){
								var subObj=  searchColumnArr[s_count];
								if(subQueryStr!=""){
     					 			subQueryStr+=",";
     					 		}
								for (var key in subObj) {
									if( subObj.hasOwnProperty(key) ) {
										var regex = new RegExp(searchStr, "i");
										var tempSeacrhStr=searchStr;
										
     					 				if(isNaN(searchStr)){
											tempSeacrhStr="'"+searchStr+"'";
										}
										
    									if(subObj[key]=="contains"){
     					 					subQueryStr+="{'"+key+"' : "+regex+" }";
     					 				}else if(subObj[key]=="="){
     					 					subQueryStr+="{'"+key+"' : "+tempSeacrhStr+"}";
     					 				}else if(subObj[key]=="!="){
     					 					subQueryStr+="{'"+key+"' : { $ne: "+tempSeacrhStr+" } }";
     					 				}else if(subObj[key]=="starts_with"){
     					 					subQueryStr+="{'"+key+"' : '/^"+regex+"/' }";
     					 				}else if(subObj[key]=="ends_with"){
     					 					subQueryStr+="{'"+key+"' : '/"+regex+"$/' }";
     					 				}
     					 			} 
    							} 
							}
							if(subQueryStr!=""){
								if(query!="{") {
									query+= ', ';
								}
								if(templateResponse.search_condition=="and" || templateResponse.search_condition=="AND" ){
									query+= '$and:[';
								}else{
									query+= '$or:[';
								}
								query+=subQueryStr;	
								query+=']';
							}
						}
					}
					
				}
				query+="}";
				
				if(templateResponse.listing_columns){
					eval('var obj='+query);
					eval('var fetchFieldsobj='+fetchFieldsObj);
					var total_records=0;
					var coll= db.collection(table_name);
					coll.find(obj).count(function (e, count) {
      					total_records= count;
      				});
     				
     				
					coll.find(obj, fetchFieldsobj).sort({modified: -1}).skip(pageNum-1).limit(itemsPerPage).toArray(function(err, items) {
						if (err) {
							outputObj["total"]   = 0;
      						outputObj["error"]   = 'Error, please inform developer to fix this!';
							cb(outputObj);
      					} else if (items) {
      						outputObj["total"]   = total_records;
      						outputObj["aaData"]   = items;
							cb(outputObj);
     					}
					});
				}else{
					outputObj["total"]   = 0;
      				outputObj["error"]   = 'No columns to display!';
					cb(outputObj);
				}
      		}else{
				outputObj["total"]   = 0;
      			outputObj["error"]   = "No such page exists!";
				cb(outputObj);
			}
      	});
	},
	
	returnFindOneByMongoID : function (db, collectionName, search_id, cb){
		var outputObj = new Object();
		/**self.crudOpertions(db, collectionName, 'findOne', null, '_id', new mongodb.ObjectID(search_id), null,function(result) {
			if(result.error){
				outputObj["error"]   = result.error;
				cb(outputObj);
			}else if(result.success){
				outputObj["aaData"]   = result.aaData;
				cb(outputObj);
      		}
		});**/
		
		if(search_id!="" && search_id!="undefined" && search_id!=null){
			db.collection(collectionName).findOne({_id: new mongodb.ObjectID(search_id)}, function(err, document_details) {
				if (err) {
					outputObj["error"]   = err;
					cb(outputObj);
      			} else if (document_details) {
      				outputObj["aaData"]   = document_details;
      				cb(outputObj);
     			}
     		});
		}else{
			outputObj["error"]   = "Invalid id passed";
			cb(outputObj);
		}
	},
	
	createIndexes : function (db, collectionName, columnsArr, cb){
		var outputObj = new Object();
		var fetchFieldsObj="";
		if(typeof(columnsArr)!=="object"){
			columnsArr = columnsArr.replace(/'/g, '"');
			columnsArr = JSON.parse(columnsArr);
		}
		
		if(columnsArr.length>0){
			for(var l_count=0; l_count< columnsArr.length; l_count++){
				if(l_count==0){
					fetchFieldsObj="{";
					fetchFieldsObj+="'"+columnsArr[l_count]+"' : 1";
				}else{
					fetchFieldsObj+=", '"+columnsArr[l_count]+"' : 1";
				}
			}
			if(fetchFieldsObj!=""){
				fetchFieldsObj+="}";
				
				eval('var fetchFieldsobj='+fetchFieldsObj);
				db.collection(collectionName).createIndex(fetchFieldsobj);
			}
		}
	},
	
	crudOpertions: function(db, collectionStr, actionStr, postContent, uniqueFieldNameStr, uniqueFieldValueStr, checkForExistenceStr, cb){
		var outputObj = new Object();
		
		for(var key in postContent) {
			var contentStr=postContent[key];
			if(typeof(contentStr)=="string")	{
				if(contentStr.charAt(0)=="["){
					try{
        				postContent[key]=JSON.parse(contentStr);
        			}
    				catch (error){
       					postContent[key]=contentStr;
    				}
				}	
			}else{
				postContent[key]=contentStr;
			}		
		}
		if (typeof checkForExistenceStr !== 'undefined' && checkForExistenceStr != "null" && checkForExistenceStr !== null && checkForExistenceStr!=""){
			var checkForExistenceObj=checkForExistenceStr;
		}else if((uniqueFieldNameStr!="" && uniqueFieldValueStr!="") || (uniqueFieldNameStr!=null && uniqueFieldValueStr!=null)){
			var checkForExistenceObj= '{'+uniqueFieldNameStr +': \''+uniqueFieldValueStr+'\'}';
		}
				
		//if(uniqueFieldNameStr!="" && uniqueFieldValueStr!=""){
		if(checkForExistenceObj!="" && checkForExistenceObj!=null){
			if(postContent!="" && postContent!=null){
				postContent.modified=self.currentTimestamp();
			}
			eval('var findStr='+checkForExistenceObj);
						
			switch (actionStr) {
    			case 'findOne':
        			db.collection(collectionStr).findOne(findStr, function(searchErr, document) {
        				if (searchErr) {
							outputObj["error"]   = searchErr;
							cb(outputObj);
      					} else if(document){
      						outputObj["success"] = "OK";
      						outputObj["aaData"] = document;
      						cb(outputObj);
      					}else{
      						outputObj["error"]   = "No results found!";
							cb(outputObj);
      					}
					});
        			break;
        		case 'create':
        			db.collection(collectionStr).findOne(findStr, function(searchErr, document) {
        				if (searchErr) {
        					outputObj["error"]   = "Error occurred while saving ["+searchErr+"], please try after some time!";
							cb(outputObj);
      					}else if(document){
      						outputObj["error"] = "This "+uniqueFieldValueStr+" already exists!"
      						cb(outputObj);
      					}else{
      						postContent.created=self.currentTimestamp();
      						postContent.uuid=self.guid();
      						db.collection(collectionStr).save(postContent, (err4, result) => {
      							if (err4) outputObj["error"]  = "Error occurred while saving ["+err4+"], please try after some time!";
    							outputObj["success"]  = "Saved successfully!";
    							outputObj["_id"]  = result["ops"][0]["_id"];
    							cb(outputObj);
  							});
      					}
					});
        			break;
    			case 'update':
    				db.collection(collectionStr).findOne(findStr, function(searchErr, document) {
        				if(document){
        					if(document.created){
								postContent["created"]=document.Created;
							}else{
								postContent['created']=self.currentTimestamp();
							}
							if(document.uuid){
								postContent["uuid"]=document.uuid;
							}else{
								postContent['uuid']=self.guid();
							}
      						db.collection(collectionStr).update(findStr, postContent, (err1	, result) => {
    							if (err1) outputObj["error"]="Error occurred while updating ["+err1+"], please try after some time!";
    							outputObj["success"]= "Updated successfully!";
    							cb(outputObj);
  							});
						}else{
							outputObj["error"]   = "Error occurred while updating ["+searchErr+"], please try after some time!";
							cb(outputObj);
						}
					});
       				break;
       			case 'delete':
       				db.collection(collectionStr).findOne(findStr, function(searchErr, document) {
       					if(document){
							db.collection(collectionStr).remove(findStr, function(err, result){
    							if (err) outputObj["error"]="Error occurred while deleting ["+err+"], please try after some time!";
    							outputObj["success"]="Deleted successfully!";
    							cb(outputObj);
  							});
						}else {
							outputObj["error"]   = "Error occurred while deleting, please try after some time!";
							cb(outputObj);
						}
					});
       				break;
    			default:
        			outputObj["error"]   = "Please specify the action!";
					cb(outputObj);
			}
		}else if(actionStr=='create'){
			postContent.created=self.currentTimestamp();
			postContent.uuid=self.guid();
      		db.collection(collectionStr).save(postContent, (err4, result) => {
      			if (err4) outputObj["error"]  = "Error occurred while saving ["+err4+"], please try after some time!";
    			outputObj["success"]  = "Saved successfully!";
    			outputObj["_id"]  = result["ops"][0]["_id"];
    			cb(outputObj);
  			});
      	}else{
			outputObj["error"]   = "Please specify unique field name and its value!";
			cb(outputObj);
		}
	},
	
	saveEntry : function(db, table_nameStr, checkForExistence, postContent, parameterStr, findmongoID, unique_fieldStr, unique_fieldVal, cb){
		for(var key in postContent) {
			var contentStr=postContent[key];
			if(contentStr.charAt(0)=="["){
				try{
        			postContent[key]=JSON.parse(contentStr);
        		}
    			catch (error){
       				postContent[key]=contentStr;
    			}
			}			
		}
		
		var link="";
		postContent['modified']=self.currentTimestamp();
		
		db.collection(table_nameStr).findOne({_id : findmongoID}, function(err, existingDocument) {
			var checkForExistenceObj=checkForExistence;	
			if (existingDocument) {
				if (typeof checkForExistenceObj === 'undefined' || checkForExistenceObj === null || checkForExistenceObj==""){
					checkForExistenceObj= '{'+unique_fieldStr +': \''+unique_fieldVal+'\'}';
				}
				eval('var findObj='+checkForExistenceObj);
				
				db.collection(table_nameStr).find(findObj, {"_id" : 1}).toArray(function(err, items) {
					var alreadyBool=false;
					for(var i=0; i < items.length; i++) {
						var subObject=items[i];
						if(subObject._id.toHexString() != existingDocument._id.toHexString()){
							alreadyBool=true;
						}
					}
					
					if(alreadyBool){
						link+="error_msg=This "+parameterStr+" already exists!"
      					cb(link);
					}else{
						if(existingDocument.created){
							postContent["created"]=existingDocument.created;
						}else{
							postContent['created']=self.currentTimestamp();
						}
						if(existingDocument.uuid){
							postContent["uuid"]=existingDocument.uuid;
						}else{
							postContent['uuid']=self.guid();
						}
      					db.collection(table_nameStr).update({_id:findmongoID}, postContent, (err1	, result) => {
    						if (err1){
    							link+="error_msg=Error occurred while saving ["+err1+"], please try after some time!";	
    						}else{
    							link+="success_msg=Updated successfully!";
    						}
    						cb(link);
  						});
					}
				});
			} else{
				if (typeof checkForExistenceObj === 'undefined' || checkForExistenceObj === null || checkForExistenceObj==""){
					checkForExistenceObj= '{'+unique_fieldStr +': \''+unique_fieldVal+'\'}';
				}
				
				self.crudOpertions(db, table_nameStr, 'create', postContent, unique_fieldStr, unique_fieldVal, checkForExistenceObj,function(result) {
					if(result.error){
						link+="error_msg="+result.error;
      					cb(link);
					}else if(result.success){
						link+="_id="+result._id+"&success_msg="+result.success;
						cb(link);
      				}
				});
			}	
		});
		
	},
	
	saveSessionBeforeLogin : function(db, user_id, systems_access, cb){
		var outputObj = new Object();
		db.collection('sessions').save({"user_id": new mongodb.ObjectID(user_id), "status" : true, "active_system_uuid" : systems_access}, (err, result) => {
			if (result){
				db.collection('systems').find({}).count(function (e, count) {
					if(count==0){
      					outputObj["cookie"]   = result["ops"][0]["_id"];
      					outputObj["link"]   = '/default_system';
      					outputObj["success"]   = 'OK';
      					cb(outputObj);
      				}else{
      					outputObj["cookie"]   = result["ops"][0]["_id"];
      					outputObj["link"]   = '/index';
      					outputObj["success"]   = 'OK';
      					cb(outputObj);
      				}
     			});
      		}else{
      			outputObj["error"]   = 'no';
      			cb(outputObj);
    		}
  		});
	},
	currentTimestamp : function (){
		var timeStampStr=Math.round(new Date().getTime()/1000)
		return timeStampStr;
	},
	
	returnActivetokens : function (db, cb){
		db.collection('tokens').find({"Status": { $in: [ 1, "1" ] } }, {"name" : 1, "code" : 1}).toArray(function(err, tokens_result) {
			if(err) return cb(null)
			cb(tokens_result);
		});
	},
	
	returnActiveCategories : function (db, cb){
		db.collection('categories').find({"status": { $in: [ 1, "1" ] } }, {"name" : 1, "code" : 1}).toArray(function(err, tokens_result) {
			if(err) return cb(null)
			cb(tokens_result);
		});
	},
	
	returnAllCollections : function (db, cb){
		db.listCollections().toArray(function(err, coll) {
			if(err) return cb(null)
			var allCollections=new Array();
			for(var i=0; i < coll.length; i++) {
				if(coll[i].name!="system.users"){
					allCollections.push(coll[i].name);
				}
			}
			return cb(allCollections);
		});
	},
	
	guid : function () {
  		function s4() {
    		return Math.floor((1 + Math.random()) * 0x10000)
      		.toString(16)
      		.substring(1);
  		}
  		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	},
	
	// every time add a entry page for a table please create a entry here, mention the page name as "filename" and its related collection name 
	// (This is hard coded right now, will make this option dynamic from system_templates)
	fetchTableName : function (filename){
		var table_name="";
		if(filename=="document"  || filename=="document_list" || filename=="documents_test"){
			table_name="documents";
		}else if(filename=="template" || filename=="templates"){
			table_name="templates";
		}else if(filename=="token" || filename=="tokens"){
			table_name="tokens";
		}else if(filename=="web_route" || filename=="web_routes"){
			table_name="web_routes";
		}else if(filename=="category" || filename=="categories"){
			table_name="categories";
		}else if(filename=="bookmark" || filename=="bookmarks"){
			table_name="bookmarks";
		}else if(filename=="emails" || filename=="email"){
			table_name="email_queue";
		}else if(filename=="users" || filename=="user"){
			table_name="users";
		}else if(filename=="contacts" || filename=="contact"){
			table_name="contacts";
		}else if(filename=="system_templates" || filename=="system_template"){
			table_name="system_templates";
		}else if(filename=="leads" || filename=="lead"){
			table_name="leads";
		}else if(filename=="modules" || filename=="module"){
			table_name="modules";
		}else if(filename=="groups" || filename=="group"){
			table_name="groups";
		}else if(filename=="task" || filename=="calendar" || filename=="test"){
			table_name="tasks";
		}else if(filename=="project"){
			table_name="projects";
		}else if(filename=="customer"){
			table_name="Companies";
		}else if(filename=="system"){
			table_name="systems";
		}else if(filename=="team"){
			table_name="teams";
		}else if(filename=="venue"){
			table_name="venue";
		}else{
			table_name=filename+"s";
		}
		return table_name;
	},
	
	fetchTableColumns : function (db, table, cb) {
		var allKeys=new Array();
  		db.collection(table).findOne({}, (err, result) => {
   			if(err) return cb(allKeys)
   			for (key in result){
   				allKeys.push(key);
   			}
			return cb(allKeys);
		});
	},
	
	send_email : function (db, from_email, sender_name, to_email, subject, plaintext, htmlContent, cb){
  		var outputObj = new Object();
  		
  		var emailApiUsername = process.env.emailApiUsername;
  		var emailApiHost = process.env.emailApiHost;
		
		var emailLinkStr= 'smtps://'+emailApiUsername+':'+emailApiHost;
		
		// create reusable transporter object using the default SMTP transport 
		var transporter = nodemailer.createTransport(emailLinkStr);

		// setup e-mail data with unicode symbols 
		var mailOptions = {
    		from: from_email, // sender address 
    		to: to_email, // list of receivers 
    		subject: subject, // Subject line 
   			text: plaintext, // plaintext body 
    		html: htmlContent // html body 
		};
 
		// send mail with defined transport object 
		transporter.sendMail(mailOptions, function(error, info){
			var insertEmail=new Object();
			insertEmail["sender_name"]=sender_name;
			insertEmail["sender_email"]=to_email;
			insertEmail["subject"]=subject;
			insertEmail["body"]=plaintext;
			insertEmail["created"]=self.currentTimestamp();
			insertEmail["modified"]=self.currentTimestamp();
			insertEmail["recipient"]=from_email;
  			
  			if(error){
        		outputObj["error"]   = error;
        		insertEmail["status"]=0;
    		}	else	{
    			outputObj["success"]   = info.response;
    			insertEmail["status"]=1;
    		}
    		self.crudOpertions(db, 'email_queue', 'create', insertEmail, null, null, null,function(email_response) {
				cb(outputObj);
			});
			
		});
	},
	
	// this function is used to add/update entry in notifications table
	// notify_to means user mongo _id
	// read_status 0 means unread, 1 means read
	// link_id will be used to redirect to that page	
	send_notification : function (db, uniqueId, notify_to, message_type, message, read_status, table_name, table_id, cb){
  		var outputObj = new Object();
  		
  		var tablenameStr='notifications';
  		var postContentArr={};
  		postContentArr["notify_to"]= notify_to;
  		postContentArr["message_type"]= message_type;
  		postContentArr["read_status"]= read_status;
  		postContentArr["message"]= message;
  		postContentArr["collection_link_id"]= table_id;
  		postContentArr["collection_linked"]= table_name;
  		
  		self.returnFindOneByMongoID(db, tablenameStr, uniqueId, function(result) {
  			if(result.error){
  				//add new entry
  				postContentArr["created"]= self.currentTimestamp();
  				self.crudOpertions(db, tablenameStr, 'create', postContentArr, null, null, null, function(email_response) {
					cb(email_response);
				});
  			}	else if(result.aaData){
  				//update entry
  				db.collection(tablenameStr).update({_id:new mongodb.ObjectID(uniqueId)}, postContentArr, (err, response) => {
    				if (response){
    					outputObj["success"]   = "Updated notification";
					}else{
    					outputObj["error"]   = "Sorry, some error occurred, please try after sometime!";
    				}
    				cb(outputObj);
  				});
  			}
		});
	}
};