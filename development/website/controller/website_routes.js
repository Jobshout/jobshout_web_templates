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
	*  website_routes.js handles the http requests
	**/
	
var initFunctions = require('../config/functions');	

module.exports = function(init, app, db){
	var mongodb=init.mongodb;
	
	//index page
	app.get('/', returnNavigation, function(req, res) {
		db.collection('tokens').find({"code" :  { $in: ['home-page-mini-slider','in-case-you-need-any-help', 'home-page-branding-token', 'home-page-develeopment-token', 'home-page-marketing-token', 'home-page-about-us', 'home-page-slider'] } , $or: [ { 'uuid_system' : { $in: [init.system_id] } }, { 'shared_systems': { $in: [init.system_id] } } ]}).toArray(function(err, document) {
			var resultdata;
			if(document){
				resultdata= document;
			}
			res.render('index', {
				homePageTokenData : resultdata,
      	 		navigation : req.navigation
       		});
       	});
	});
	
	app.get('/index', returnNavigation, function(req, res) {
		db.collection('tokens').find({"code" :  { $in: ['home-page-mini-slider','in-case-you-need-any-help', 'home-page-branding-token', 'home-page-develeopment-token', 'home-page-marketing-token', 'home-page-about-us', 'home-page-slider'] } , $or: [ { 'uuid_system' : { $in: [init.system_id] } }, { 'shared_systems': { $in: [init.system_id] } } ]}).toArray(function(err, document) {
			var resultdata;
			if(document){
				resultdata= document;
			}
			res.render('index', {
				homePageTokenData : resultdata,
      	 		navigation : req.navigation
       		});
       	});
	});
	
	/**
	//case studies
	app.get('/case-studies', returnNavigation, function(req, res) {
		db.collection('documents').findOne({"Code" : "case-studies"}, function(err, document) {
      		var aaData=new Object();
      		if(document){
      			aaData = document;
       		}
       		res.render('case-studies', {
      			resultData : document,
      	 		navigation :  req.navigation  
       		});
		});
	});
	**/
	
	//signup
	app.get('/signup', returnNavigation, function(req, res) {
		res.render('signup', {
      	 	navigation : req.navigation
       	});
	});
	
	//tour slider
	app.get('/tour-slider', function(req, res) {
		res.render('tour-slider');
	}); 

	//our clients
	app.get('/our-clients', returnNavigation, function(req, res) {
      		db.collection('documents').findOne({"Code" : "our-clients"}, function(err, document) {
      			if (err) {
      				res.redirect('/not_found');
      			}else if(document){
      				res.render('our-clients', {
      					resultData : document,
      	 				navigation :  req.navigation  
       				});
       			}else{
       				res.redirect('/not_found');
       			}
			});
	});

	//search page
	app.get('/search', returnNavigation, function(req, res) {
		res.render('search', {
      		queryString : req.query.s,
      		navigation : req.navigation  
    	});
    });

//unsubscribe
app.get('/unsubscribe', returnNavigation, function(req, res) {
	var email_to='', contact_uuid= '', uuid='', unsubscribed=1, status="unsubscribe";
	if(req.query.email_to){
		email_to=req.query.email_to;
	}
	if(req.query.contact_uuid){
		contact_uuid=req.query.contact_uuid;
	}
	if(req.query.uuid){
		uuid=req.query.uuid;
	}
	if(req.query.s){
		unsubscribed=req.query.s;
	}
	if(unsubscribed==0){
		status="subscribe";
	}
	if(email_to!="" && uuid!=""){
		var queryStr='email_to='+email_to+'&contact_uuid='+contact_uuid+'&uuid='+uuid+'&s=0';
		db.collection('mailing_preferences').findOne({"email_address" : email_to, "uuid" : uuid, "uuid_system" : init.system_id}, function(err, foundRecord) {
			if (typeof foundRecord !== 'undefined' && foundRecord !== null && foundRecord.uuid!="") {
    	  		var updateContent=new Object();
    	  		updateContent["modified"]=initFunctions.nowTimestamp();
    	  		updateContent["uuid"]=foundRecord.uuid;
    	  		updateContent["contact_uuid"]=foundRecord.contact_uuid;
    	  		updateContent["email_address"]=email_to;
    	  		updateContent["unsubscribed"]=unsubscribed;
    	  		updateContent["status"]=status;
    	  		updateContent["uuid_system"]=init.system_id;
    	  		db.collection('mailing_preferences').update({"email_address" : email_to, "uuid" : uuid, "uuid_system" : init.system_id}, updateContent, (updateErr, result) => {
    	  			var tokenFlag=false;
    	  			if(result){
    	  				tokenFlag=true;
    	  			}
    	  				res.render('unsubscribe', {
      	 					navigation : req.navigation,
      	 					tokenBool : tokenFlag,
      	 					emailAddress : email_to,
      	 					queryString : queryStr,
      	 					unsubscribed : unsubscribed
       					});
    	  		});
    	  	}else{
    	  		var addContent=new Object();
    	  		addContent["modified"]=initFunctions.nowTimestamp();
    	  		addContent["uuid"]=uuid;
    	  		addContent["contact_uuid"]=contact_uuid;
    	  		addContent["unsubscribed"]=unsubscribed;
    	  		addContent["email_address"]=email_to;
    	  		addContent["status"]=status;
    	  		addContent["uuid_system"]=init.system_id;
    	  		
    	  		db.collection("mailing_preferences").save(addContent, (insertErr, result) => {
    	  			var tokenFlag=false;
    	  			if(result){
    	  				tokenFlag=true;
    	  			}
    	  				res.render('unsubscribe', {
      	 					navigation : req.navigation,
      	 					tokenBool : tokenFlag,
      	 					emailAddress : email_to,
      	 					queryString : queryStr,
      	 					unsubscribed : unsubscribed
       					});
    			});
    	  	}
    	});
    }else{
    	res.render('unsubscribe', {
      		navigation : req.navigation,
      		tokenBool : false
       	});
    }
})

//search page
	app.get('/sitemap', returnNavigation, function(req, res) {
		db.collection('bookmarks').find({"categories" : "sitemap", "uuid_system" : init.system_id }).toArray(function(err, document) {
			res.render('sitemap', {
      	 		resultData : document,
      	 		navigation : req.navigation 
       		});
		});
 	});

//search results page
app.get('/search-results', function(req, res) {
	var myObj = new Object();
	var itemsPerPage = 10, pageNum=1;
	if(req.query.start){
		pageNum=parseInt(req.query.start);
	}
	if(req.query.limit){
		itemsPerPage=parseInt(req.query.limit);
	}
	if(pageNum==0){
		pageNum=1;
	}
	var type = req.query.type, data='', truncate = 250;
	var query="{}", fetchFieldsObj="{}";
	if(req.query.s){
		var searchStr = req.query.s;
		var regex = new RegExp(searchStr, "i");
		
		if(type=="site"){
			query= '{'
		}else{
			query= '{ "Type" : "'+type+'", "status": { $in: [ 1, "1" ] },  ';
		}
		query+=" '$text': { '$search': '"+req.query.s+"' } ";
		/**query+= '$or:[';
		query+="{'Document' : "+regex+" }, {'Code' :  "+regex+"}, {'Body' :  "+regex+" }, {'MetaTagDescription' :  "+regex+" }";
		query+=']';**/
		query+=", $or: [ { 'uuid_system' : { $in: ['"+init.system_id+"'] } }, { 'shared_systems': { $in: ['"+init.system_id+"'] } } ] ";
		query+='}';
		fetchFieldsObj='{"Document" : 1, "Code" : 1, "Body" : 1}';
	}	else	{
		query= '{ "Type" : "'+type+'", "status": { $in: [ 1, "1" ] }';
		query+=", $or: [ { 'uuid_system' : { $in: ['"+init.system_id+"'] } }, { 'shared_systems': { $in: ['"+init.system_id+"'] } } ] ";
		query+='}';
	}
		
		eval('var obj='+query);
		eval('var fetchFieldsobj='+fetchFieldsObj);
		db.collection('documents').find(obj, fetchFieldsobj).skip(pageNum-1).limit(itemsPerPage).toArray(function(err, document) {
			if (document) {
      			db.collection('documents').find(obj).count(function (e, count) {
      				myObj["total"]   = count;
      				myObj["aaData"]   = document;
					res.send(myObj);
     			});
			}else{
      			myObj["total"]   = 0;
      			myObj["error"]   = 'not found';
				res.send(myObj);
			}
      	});
});

//404 page
	app.get('/not_found', returnNavigation, function(req, res) {
		res.render('not_found', {
      	 	navigation : req.navigation  
       	});
	});

//blog page
	app.get('/blog', returnNavigation, function(req, res) {
		res.render('posts', {
      	 	navigation : req.navigation,
      	 	queryStr : req.query,
			fetch_type : 'blog'
       	});
	});

//news page
	app.get('/news', returnNavigation, function(req, res) {
		res.render('posts', {
      	 	navigation : req.navigation,
      	 	queryStr : req.query,
      	 	fetch_type : 'news'
       	});
	});

//resource-centre page
	app.get('/resource-centre', returnNavigation, function(req, res) {
		res.render('resource-centre', {
      	 	navigation : req.navigation,
      	 	queryStr : req.query
       	});
	});


//contact page
app.get('/contact', returnNavigation, function(req, res) {
		db.collection('tokens').findOne({"code" : "contact-page-address", uuid_system : init.system_id}, function(errdoc, addressContent) {
    		if(addressContent && addressContent!=""){
    			res.render('contact', {
      	 			navigation : req.navigation ,
      	 			address_token: addressContent,
      	 			queryStr : req.query
       			});
       		}else{
       			db.collection('tokens').findOne({"code" : "contact-page-address", shared_systems : { $in: [init.system_id] }}, function(errdoc, addressContent) {
       				res.render('contact', {
      	 				navigation : req.navigation ,
      	 				address_token: addressContent,
      	 				queryStr : req.query
       				});
    			});
       		}
		});
});

//save contact
app.post('/contact/save', (req, res) => {
	var link="/contact";
	var postJson=req.body;
	postJson.created=initFunctions.nowTimestamp();
	postJson.uuid_system=init.system_id;
    db.collection("contacts").save(postJson, (err, result) => {
		if (err){
    		link+="?error=Sorry, some problem occurred while submitting your request!";
    		res.redirect(link)
    	}else{ 
    		link+="?success=Thanks, your request has been sent successfully!";
    		
    		var insertEmail=new Object();
			insertEmail["uuid_system"]=init.system_id;
			insertEmail["sender_name"]=req.body.name;
			insertEmail["sender_email"]=req.body.email;
			insertEmail["subject"]=req.body.subject;
			insertEmail["body"]=req.body.message;
			insertEmail["created"]=initFunctions.nowTimestamp();
			insertEmail["modified"]=initFunctions.nowTimestamp();
			insertEmail["recipient"]='bwalia@tenthmatrix.co.uk';
			insertEmail["status"]=0;
			db.collection("email_queue").save(insertEmail, (err, e_result) => {
				res.redirect(link);
			})
    	} 	
  	});	
})

//save blog comment
app.post('/saveblogcomment', (req, res) => {
	var postJson=req.body;
	postJson.created=init.nowTimestamp;
	postJson.modified=init.nowTimestamp;
	postJson.status=0;
	postJson.uuid=initFunctions.guid();
	var blogID= req.body.blog_uuid;
	if(blogID!=""){
		var mongoIDField= new mongodb.ObjectID(blogID);
		var table_nameStr="documents";
		initFunctions.returnFindOneByMongoID(db, table_nameStr, blogID, function(resultObject) {
			var myObj = new Object();
			if(resultObject.aaData){
				var documentData=resultObject.aaData;
				var insertEmail=new Object();
    			var nameStr=req.body.name;
    			postJson.uuid_system=init.system_id;
    			insertEmail["uuid_system"]=init.system_id;
				insertEmail["sender_name"]=nameStr;
				insertEmail["sender_email"]=req.body.email;
				insertEmail["subject"]=nameStr+" has posted a comment";;
				insertEmail["body"]=req.body.comment;
				insertEmail["created"]=init.nowTimestamp;
				insertEmail["modified"]=init.nowTimestamp;
				insertEmail["recipient"]='bwalia@tenthmatrix.co.uk';
				insertEmail["status"]=0;
				if(typeof(documentData.BlogComments)=="string"){
	            	db.collection(table_nameStr).update({_id:mongoIDField}, { $set: { "BlogComments": new Array(postJson) } }, (err, result) => {
    	                if(result){
                    	    db.collection("email_queue").save(insertEmail, (err, e_result) => {
                        		myObj["success"]   = "Thanks your comment has been posted OK and will be visible soon!";
                                res.send(myObj);
                            });
                        }else{
                        	myObj["error"]   = "Error posting comment. Please try again later!!!";
                            res.send(myObj);
                        }
                    });
        		} else {
					db.collection(table_nameStr).update({_id:mongoIDField}, { $push: { "BlogComments": postJson } }, (err, result) => {
                    	if(result){
                        	db.collection("email_queue").save(insertEmail, (err, e_result) => {
                            	myObj["success"]   = "Thanks your comment has been posted OK and will be visible soon!";
                                res.send(myObj);
                            })
                        }else{
                            myObj["error"]   = "Error posting comment. Please try again later!!!";
                            res.send(myObj);
                        }
                    });
                }
			}else{
				myObj["error"]   = "Error posting comment. Please try again later!!!";
				res.send(myObj);
			}	
  		});	
  	}
})

//save wi_users
app.post('/savewiusers', (req, res) => {
	var postJson=req.body;
	postJson.created=currentTimestamp;
	postJson.modified=currentTimestamp;
	postJson.status=0;
	postJson.uuid=guid();
	var email= postJson.email;
	var myObj = new Object();
	if(email!=""){
		var table_nameStr="wi_users";
    	db.collection(table_nameStr).findOne({"email" : email}, function(err, existingDocument) {
			if(existingDocument){
				myObj["error"]   = "You are already a registered user!";
				res.send(myObj);
				
			}else{
				
				db.collection(table_nameStr).save(postJson, (err, result) => {
    				if(result){
    					var insertEmail=new Object();
    					var nameStr=req.body.name;
    					insertEmail["uuid_system"]=init.system_id;
						insertEmail["sender_name"]=nameStr;
						insertEmail["sender_email"]=req.body.email;
						insertEmail["subject"]=nameStr+" has registered to Jobshout";
						insertEmail["body"]=req.body.comment;
						insertEmail["created"]=initFunctions.nowTimestamp();
						insertEmail["modified"]=initFunctions.nowTimestamp();
						insertEmail["recipient"]='bwalia@tenthmatrix.co.uk';
						insertEmail["status"]=0;
						db.collection("email_queue").save(insertEmail, (err, e_result) => {
							myObj["success"]   = "Thank you for registering with us, we will contact you soon!";
							res.send(myObj);
						})
    				}else{
    					myObj["error"]   = "Error while registration, please try again later!";
						res.send(myObj);
    				}
    			});
			}	
  		});	
  	}else{
  		myObj["error"]   = "Please specify your email address!";
		res.send(myObj);
  	}
})

// fetch_tokens_content : to fetch tokens content
app.get('/fetch_tokens_content', function(req, res) {
	var myObj = new Object();
	if(req.query.code && req.query.code!=""){
		var obj = req.query.code;
		obj = obj.replace(/'/g, '"');
		obj = JSON.parse(obj);
		db.collection('tokens').find({ 'code': { $in: obj }, status: { $in: [ 1, "1" ] } }, {'code' : 1,'token_content' : 1}).toArray(function(avaErr, documents) {
      		myObj["aaData"]   = documents;
      		res.send(myObj);
   		});
    }	else{
    	myObj["error"]   = 'Please pass the parameter!';
      	res.send(myObj);
    }
});

//content page
app.get('/fetchTweets', function(req, res) {
	var tweetsObj = new Object();
	var Twitter = require('twitter');
	var client = new Twitter({
  		consumer_key: process.env.TWITTER_CONSUMER_KEY,
  		consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  		access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  		access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
	});
 
	var params = {screen_name : "jobshoutnews", count: '3', trim_user : "true", "exclude_replies" : "true"};
	client.get('statuses/user_timeline', params, function(error, tweets, response) {
  		if (!error) {
    		tweetsObj["aaData"]   = tweets;
		} else	{
  			tweetsObj["error"]   = "Please specify your email address!";
		}
  		res.send(tweetsObj);
	});
});

//content page
app.get('/:id', returnNavigation, function(req, res) {
      db.collection('documents').findOne({Code: req.params.id, uuid_system : init.system_id}, function(err, document) {
		if (document) {
			res.render('content', {
       			document_details: document,
       			navigation : req.navigation 
    		});
    	} else {
    		db.collection('documents').findOne({Code: req.params.id, shared_systems : { $in: [init.system_id] }}, function(err, document) {
				if (document) {
					res.render('content', {
       					document_details: document,
       					navigation : req.navigation 
    				});
    			} else {
       				res.redirect('/not_found');
    			}
    		});
    	}
    });
});

function returnNavigation (req, res, next) {
	initFunctions.returnNavigation(db, function(resultNav) {
		req.navigation=resultNav;
		next();
   	});
}

}