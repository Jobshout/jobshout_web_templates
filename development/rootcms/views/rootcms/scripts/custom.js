var menuxhr;
function __alertModalBox(msg){
	$("#globalMessage").html(msg);
	$('#globalPrompt').modal('show');
}
function dateTimeFromUnix(UNIX_timestamp){
	var a = new Date(UNIX_timestamp * 1000);
    
	var year = a.getFullYear();
	var month = a.getMonth()+1;
	var dateNum = a.getDate();
	var hour = a.getHours();
	var min = a.getMinutes();
	var sec = a.getSeconds();
	var time = year + '-' + month + '-' + dateNum + ' ' + hour + ':' + min ;

	return time;
}

function getTimestampFromDate(dateString){
	var dateParts = dateString.split('/'),	date;
	var newDate=dateParts[1]+"/"+dateParts[0]+"/"+dateParts[2];
	date = new Date(newDate);
	date= date.getTime();
	date= parseInt(date)/1000;
	return date;
}

function getTimestampFromDateTime(dateString){
	var dateTimeParts = dateString.split(' '),
	timeParts = dateTimeParts[1].split(':'),
	dateParts = dateTimeParts[0].split('-'),
	date;

	date = new Date(dateParts[0], parseInt(dateParts[1], 10) - 1, dateParts[2], timeParts[0], timeParts[1]);
	date= date.getTime();
	date= parseInt(date)/1000;
	return date;
}
function datePickerFormat (UNIX_timestamp) {
  var a = new Date(UNIX_timestamp * 1000);
  var year = a.getFullYear();
  var month = a.getMonth()+1;
  var date = a.getDate();
  var dateStr = month + '/' + date + '/' + year ;
  return dateStr;
}
function datetime(e, showTime){
	if (typeof showTime === "undefined") { 
		showTime = true;
	}
	var a = new Date(e * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var timeStr="am";
  if(hour>12){
  	timeStr="pm";
  	hour= hour-12;
  } 
  var min = a.getMinutes().toString();
  if(min.length==1)	{
  	min = "0"+min;
  }
  var time = month + ' ' + date + ',' + year;
  if(showTime){
  	time += ', '+ hour + ':' + min + " " + timeStr ;
  }
  return time;
}
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

function dataAsJson(name, form){
	var x = $("#"+name).serializeArray();
	var outputObj = new Object();
    $.each(x, function(i, field){
    	if(field.name!="id" && field.name!="table_name" && field.name!="unique_field" && field.name!="editorField" && field.name!="editorValue" && field.name!="data"){
    		$("input[name="+field.name+"]").removeAttr('name');
        	outputObj[field.name]   = field.value;
     	}
    });
    $("#data").val(JSON.stringify(outputObj));
	form.submit();
}

function switchInSystems(id){
	var jsonRow = backendDirectory+'/swtich_user_system?id='+id;
	$.getJSON(jsonRow,function(result){
		if(result.success){
			window.location.href=backendDirectory+"/index";
		}
	});
}

function fetch_users_sites(){
	$("#swtich_sites").html('');
	var jsonRow = backendDirectory+'/fetch_user_systems';
	$("#loggedInUserSystems").hide();
	$.getJSON(jsonRow,function(result){
		var activeSystemStr="", logoPathStr="";
		if(result.active_system){
			activeSystemStr=result.active_system;
		}
		if(result.aaData){
			var contentHtmlStr="", countUserSystems=0;
			$.each(result.aaData, function(i,item){
				countUserSystems++;
				contentHtmlStr+='<li class="';
				if(item._id==activeSystemStr){
					if(item.logo_path){
						logoPathStr=item.logo_path;
					}
					contentHtmlStr+='active2';
				}
				contentHtmlStr+='"><a href="javascript:void(0)" onClick="switchInSystems(\''+item._id+'\'); return false;">'+item.name+'</li>';     
			});
			if(countUserSystems>=1){
				$("#loggedInUserSystems").show();
				$(".totalLoggedInUserSystems").html(countUserSystems);
				$("#swtich_sites").append(contentHtmlStr);
			}
		}
		if(logoPathStr!=""){
			$("#root_logo").attr("src", logoPathStr);
		}
	});
}
function load_navigation_data(){
	$("#dashboard-menu").html('');
	var jsonRow = backendDirectory+'/load_navigator';
	var keyword= $("#menuSearchBox").val();
	if(keyword!='' && keyword!='undefined'){
		jsonRow +='?s='+keyword;
	}
	
	if(menuxhr) menuxhr.abort();
	menuxhr=$.getJSON(jsonRow,function(result){
		if(result.aaData){
			var urlStr = window.location.pathname;
			var findStr=backendDirectory;
			if(urlStr.indexOf(findStr)!==-1){
				var openedFileNameStr = urlStr.substring(findStr.length);
			}else{
				var openedFileNameStr = urlStr;
			}
			var table_html='<li class="treeview';
			
			if(openedFileNameStr=="index" || openedFileNameStr=="" || openedFileNameStr=="/"){
				table_html+=' active ';
			}	
			table_html+='"><a href="'+backendDirectory+'/"><i class="fa fa-dashboard"></i> <span>Dashboard</span><span class="pull-right-container"><i class="fa fa-angle-left pull-right"></i></span></a></li>';
			
			$.each(result.aaData, function(i,item){
				if(item.active==1){
					var activeMenuFlag=false;
					if(item.module_items){
						if(item.module_items!=""){
							try{
								var module_items = JSON.parse(item.module_items); 
        					}	catch (error){
       							var module_items =  item.module_items; 
    						}
						
							module_items.sort(dynamicSort("item_sort_order"));
							
							var iconNameStr='';
							if(item.icon_class!=""){
								iconNameStr='<i class="'+item.icon_class+'"></i>';
							}
							if(item.icon_path!=""){
								iconNameStr='<img width="24" height="24" src="'+item.icon_path+'" alt="">';
							}
														
							var subTableHtmlStr="";	
							$.each(module_items, function(i,row){
								var linkStr=row.link;
								/**if(linkStr.charAt(0)!="/"){
									linkStr="/"+linkStr;
								}**/
								if(openedFileNameStr==row.link){
									activeMenuFlag=true;
									subTableHtmlStr+='<li class="active">';
								}else{
									subTableHtmlStr+='<li>';
								}
								subTableHtmlStr+='<a href="'+backendDirectory+row.link+'" ';
								if(row.target==0){
									subTableHtmlStr+=' target="_blank" ';
								}
								subTableHtmlStr+='><i class="fa fa-circle-o"></i> '+row.label+'</a></li>';
							});
									
							if(activeMenuFlag){
								table_html+='<li class="active treeview">';
							}else{
								table_html+='<li class="treeview">';
							}
							table_html+='<a href="#">'+iconNameStr+' <span>'+item.name+'</span><span class="pull-right-container"><i class="fa fa-angle-left pull-right"></i></span></a>';
							table_html+='<ul class="treeview-menu">'+subTableHtmlStr+'</ul>';
						}
					}   
				}             
			});
			$("#dashboard-menu").append(table_html);
		}
	});
}

function load_notifications(){
	var jsonRow=backendDirectory+"/load_notifications?start=0&limit=10";
	$.getJSON(jsonRow,function(html){
		if(html.error){
				
		}else{
			if(html.total){
				$(".notificationCount").html(html.total);
			}
			var contentHtml="";
			$.each(html.aaData, function(i,row){
				var msgStr="", iconClass='fa fa-warning text-yellow', activeClass='text-aqua';
				if(row.message_type=="comment")	{
					msgStr="A new message";
					iconClass="fa fa-envelope-o";
				}
				if(row.read_status=="0" || row.read_status==0)	{
					activeClass="text-red";
				}
				if(row.subject && row.subject!="") {
					msgStr=row.subject;
				}else if(row.message && row.messgae!="")	{
					msgStr=row.message;
				}
				if(msgStr.length>50){
					msgStr = msgStr.substr(0, 50)+"...";
				}
						
				contentHtml+='<li><a href="/change_notifications?id='+row._id+'"  data-ajax="false"><i class="'+iconClass+' '+activeClass+'"></i><span style="font-size:11px;">'+datetime(row.created, false)+'</span>: '+msgStr+'</a></li>';
			});
			$("#notificationsUl").html(contentHtml);
		}
	});
}

function upload_single_file(){
	if($('#file').val().length>0)	{
		var data = new FormData();
		data.append('related_collection', $('#table_name').val());
		data.append('collection_id', $('#id').val());
		data.append('type', $('#file_type').val());
		
		var filesize=Number($('#file')[0].files[0].size)/(1024*1024);
		
		if(filesize>5){
			var msg = "The CV file size larger than 5MB is not allowed.";

			$("#validation").css("padding-left", "0%");
			$("#validation").html(msg);
			window.location.href="#validation";
			$('#file').focus();
		}else{
			var files= $('#file')[0].files;
			$.each(files, function(key, value){
				data.append('file', value);
			});
			$.ajax({
				url: backendDirectory+'/upload',
				type: 'POST',
				data: data,
				dataType: 'json',
				contentType: false,
				enctype: 'multipart/form-data',
				cache: false,
				processData: false, // Don't process the files
				success: function(response){
					if(response.success){
						__alertModalBox(response.success);
					} else if(response.error) {
						__alertModalBox(response.error);
					}else {
						__alertModalBox('Sorry, error in uploading file!');
					}
				}
			});
		}
	}	else {
		__alertModalBox("Please select file to upload!");
	}
}

$(function () {
    load_navigation_data();
    fetch_users_sites();
    load_notifications();
});