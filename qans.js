QuestionsList = new Mongo.Collection('questions');
FollowList = new Mongo.Collection('follow');
Notification = new Mongo.Collection('notifications')
TopicList = new Mongo.Collection('topic');
TopicAnswersList = new Mongo.Collection('topicanswers');
ChatMessage = new Mongo.Collection('chatmessages');
QuestionsIndex = new EasySearch.Index({
  collection: QuestionsList,
  fields: ['text'],
  defaultSearchOptions: {
   limit: 5
},
  engine: new EasySearch.MongoDB({
//	transform: null
})
});

TopicsIndex = new EasySearch.Index({
  collection: TopicList,
  fields: ['title'],
  defaultSearchOptions: {
   limit: 5
},
  engine: new EasySearch.MongoDB({
	 sort: function () {
	return { created_at: -1 };
	}
//        tranform: null
})
});

var shareImage = function(fileObj, readStream, writeStream) {
  // Transform the image into a 10x10px thumbnail
  gm(readStream, fileObj.name()).resize('1400', '700').stream().pipe(writeStream);
};


var createCover = function(fileObj, readStream, writeStream) {
  // Transform the image into a 10x10px thumbnail
  gm(readStream, fileObj.name()).resize('1050', '250').stream().pipe(writeStream);
};

var createSmall = function(fileObj, readStream, writeStream) {
  // Transform the image into a 10x10px thumbnail
  gm(readStream, fileObj.name()).resize('200', '200').stream().pipe(writeStream);
};
var createThumb = function(fileObj, readStream, writeStream) {
  // Transform the image into a 10x10px thumbnail
  gm(readStream, fileObj.name()).resize('50', '50').stream().pipe(writeStream);
};
Images = new FS.Collection("images", {
  stores: [
new FS.Store.FileSystem("share", { transformWrite: shareImage }),
new FS.Store.FileSystem("cover", { transformWrite: createCover }),
new FS.Store.FileSystem("thumbs", { transformWrite: createThumb }),
new FS.Store.FileSystem("small", { transformWrite: createSmall }),
new FS.Store.FileSystem("images", {path: "/home/karan/uploads"})],
filter: {
    allow: {
      contentTypes: ['image/*'] //allow only images in this FS.Collection
    }
  }

});
if (Meteor.isClient) {


         ShareIt.configure({
    sites: {                // nested object for extra configurations
        'facebook': {
            'appId': 807503276021457   // use sharer.php when it's null, otherwise use share dialog
        },
        'twitter': {},
        'googleplus': {},
        'pinterest': {}
    },
    classes: "large btn", // string (default: 'large btn')
                          // The classes that will be placed on the sharing buttons, bootstrap by default.
    iconOnly: true,      // boolean (default: false)
                          // Don't put text on the sharing buttons
    applyColors: true,     // boolean (default: true)
                          // apply classes to inherit each social networks background color
    faSize: '',            // font awesome size
    faClass: ''       // font awesome classes like square
  });


  Meteor.startup(function() {
  GoogleMaps.load({
    key: 'AIzaSyD6UVxaabyCDJ4Uol02JaeLa_tvoMLqs_o',
    libraries: 'places'  // also accepts an array if you need more than one
  });
});
 
  // counter starts at 0
  Session.setDefault('counter', 0);
//  Meteor.subscribe("questions");
  Meteor.subscribe("answers");
  Meteor.subscribe("comments");
  Meteor.subscribe("replycomments");
  Meteor.subscribe("users");
  Meteor.subscribe("votes");
  Meteor.subscribe("images");
  Meteor.subscribe("follow");
  Meteor.subscribe("topic");
  Meteor.subscribe("topicanswers");
  Meteor.subscribe("chatmessages");
  Meteor.subscribe("notifications");
 Template.registerHelper('formatId', function(data) {
  return (data && data._str) || data;
});
Template.registerHelper('formatDate', function(date) {
  return moment(date).fromNow();;
});
Template.chat.usersonline = function(){
	
	array_followers = FollowList.findOne({u_id:Meteor.userId(),is_topic:0})	
	_isfollowed = FollowList.find({following_ids:Meteor.userId(),is_topic:0})
	array_isfollowed = []
	if (typeof _isfollowed !== 'undefined'){
	_isfollowed = _isfollowed.fetch()
	for (i = 0;i < _isfollowed.length; i++) {
	array_isfollowed.push(_isfollowed[i].u_id)
	}
	}
	friends = []
/*	friends = array_followers.filter(function(n) {
   	 return array_isfollowed.indexOf(n) != -1;
	});*/
//	var friends = $(array_followers.following_ids).not(array_isfollowed).get();
	if (typeof array_followers !== 'undefined' && typeof _isfollowed !== 'undefined'){
	var friends = _.intersection(array_followers.following_ids, array_isfollowed);
	}
	return Meteor.users.find({ $and: [{ "_id": { $ne: Meteor.userId() } },{ "_id": { $in: friends } },{ "status.online": true }]},{
	transform: function(doc) {
	doc.unread_messages = ChatMessage.find({from:doc._id,to:Meteor.userId(),is_seen:0})
	return doc
	}
})/*.observe({
  added: function(id) {
    // id just came online
  },
  removed: function(id) {
    // id just went offline
  }
});*/
}
Template.userprofile.onRendered(function() {
	$('#user_birthdate').datepicker();
	this.autorun(function () {
   		 if (GoogleMaps.loaded()) {
		      	$("#user_location").geocomplete();
		    }
 		 });
});
Template.userprofile.events({
  'click .image_emoticons' : function(event,template) {
 $('#textarea').val($('#textarea').val() + " "+ this.replacements[0] + " ")
  $("#emoticon_id").toggle();
  },
  'click #emot_show': function(event, template) {
	$("#emoticon_id").toggle();
  },
  'change .myFileInput': function(event, template) {
       FS.Utility.eachFile(event, function(file) {
	var fileObj = new FS.File(file);
//	Meteor.call("upload_profile_pic",fileObj)
	
	if ((typeof Meteor.users.findOne({_id: Meteor.userId()}).profile !== 'undefined') && (typeof Meteor.users.findOne({_id: Meteor.userId()}).profile.image_id !== 'undefined')){
		Images.remove({_id: Meteor.users.findOne({_id: Meteor.userId()}).profile.image_id})
	}
	
	
	Images.insert(file, function (err, fileObj) {
        // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
      		Session.set('uploadedfileId', fileObj._id);
		Meteor.call("upload_profile_pic",fileObj._id)
	});
    });

  },
  'change .myCoverInput': function(event, template) {
       FS.Utility.eachFile(event, function(file) {
        var fileObj = new FS.File(file);
//      Meteor.call("upload_profile_pic",fileObj)

        if ((typeof Meteor.users.findOne({_id: Meteor.userId()}).profile !== 'undefined') && (typeof Meteor.users.findOne({_id: Meteor.userId()}).profile.cover_image_id !== 'undefined')){
                Images.remove({_id: Meteor.users.findOne({_id: Meteor.userId()}).profile.cover_image_id})
        }


        Images.insert(file, function (err, fileObj) {
        // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
                Session.set('uploadedcoverId', fileObj._id);
                Meteor.call("upload_cover_pic",fileObj._id)
        });
    });

  },
     'click .post_profile': function () {
                var q_id = this._id;
                //div_id = '#post_in_topic_area' + this._id;
                //var post_topic = $(div_id).val();
                div_id = '#textarea'
                var post_topic = $(div_id).val();
                if (post_topic == '<p><br></p>'){
                        alert('Please put some words and post');
                        return
                }	
                hash = {topic_id:q_id,text:post_topic,is_status:1}
                Meteor.call("create_topic_post",hash, function (error, result) {
                        $('#textarea').val('');
                })
        },

  'click #edit_name': function () {
	$('#user_name').attr('contenteditable','true')
	$('#user_name').focus()
  },
  'click #edit_occupation': function () {
	$('#user_occupation').attr('contenteditable','true')
	$('#user_occupation').focus()
	$("#edit_occupation").attr("disabled", true);
  },
'click #edit_bio': function () {
	$('#user_bio').attr('contenteditable','true')
	$('#user_bio').focus()
  },
'click #edit_interest': function () {
	$('#user_interest').attr('contenteditable','true')
	$('#user_interest').focus()
  },
'click #edit_skills': function () {
        $('#user_skills').attr('contenteditable','true')
        $('#user_skills').focus()
  },
'click #edit_location': function () {
        $('#user_location').attr('contenteditable','true')
        $('#user_location').focus()
  },
'click #edit_birthdate': function () {
        $('#user_birthdate').attr('contenteditable','true')
        $('#user_birthdate').focus()
  },
   'blur #user_name': function () {
	var text = $('#user_name').html()
	$('#user_name').html('');
	Meteor.users.update({_id:Meteor.userId()}, {$set:{"username": text}})	
//	$('#user_name').html(text);  
	$('#user_name').attr('contenteditable','false')
	
},
  'blur #user_occupation': function () {
	var text = $('#user_occupation').html()
	$('#user_occupation').html('')
	Meteor.call("update_user_profile",{"profile.occupation": text},function(error,result){
	})
//	Meteor.users.update({_id:Meteor.userId()}, {$set:{"profile.occupation": text}})
//	$('#user_occupation').html(text)
	$('#user_occupation').attr('contenteditable','false')
	$('#edit_occupation').removeAttr("disabled");
  },
'blur #user_bio': function () {
	var bio = $('#user_bio').html()
	$('#user_bio').html('');
	Meteor.call("update_user_profile",{"profile.bio": bio},function(error,result){
	})
	//Meteor.users.update({_id:Meteor.userId()}, {$set:{"profile.bio": bio}})
//	$('#user_bio').html(bio);
	$('#user_bio').attr('contenteditable','false')
 },
'blur #user_interest': function () {
	var interest = $('#user_interest').html()
	$('#user_interest').html('')
	Meteor.call("update_user_profile",{"profile.interest": interest})
//	Meteor.users.update({_id:Meteor.userId()}, {$set:{"profile.interest": interest}})
//	$('#user_interest').html(interest)
	$('#user_interest').attr('contenteditable','false')
  },
'blur #user_skills': function () {
        var skills = $('#user_skills').html()
        $('#user_skills').html('')
	Meteor.call("update_user_profile",{"profile.skills": skills})
//        Meteor.users.update({_id:Meteor.userId()}, {$set:{"profile.skills": skills}})
//      $('#user_interest').html(interest)
        $('#user_skills').attr('contenteditable','false')
  },
'blur #user_location': function () {
        var locations = $('#user_location').val()
        //$('#user_location').val('')
	Meteor.call("update_user_profile",{"profile.location": locations})  
  //    Meteor.users.update({_id:Meteor.userId()}, {$set:{"profile.location": locations}})
//      $('#user_interest').html(interest)
        $('#user_location').attr('contenteditable','false')
  },
'blur #user_birthdate': function () {
        var birthdate = $('#user_birthdate').val()
        //$('#user_birthdate').val('')
	Meteor.call("update_user_profile",{"profile.birthdate": birthdate})
//        Meteor.users.update({_id:Meteor.userId()}, {$set:{"profile.birthdate": birthdate}})
//      $('#user_interest').html(interest)
        $('#user_birthdate').attr('contenteditable','false')
  },
   'click .follow': function () {
	q_id = this._id
	 Meteor.call("userfollow",this._id, function(error, result) {
		if (result.unfollow){
                div_id = '#follow' + q_id;
                $(div_id).html("Unfollow");
                }
		if (result.follow){
                div_id = '#follow' + q_id;
                $(div_id).html("Follow");
                }
		})
        },
	 'click .comment_ans': function () {
                div_id = '#comment' + this._id;
                $(div_id).show();
                div_id = '#comment_ans' + this._id;
                $(div_id).removeClass('comment_ans');
                $(div_id).addClass('comment_ans_hide');
                 div_id = '#comment_ansi' + this._id;
                $(div_id).removeClass('comment_ans');
                $(div_id).addClass('comment_ans_hide');
                }
                ,
        'click .comment_ans_hide': function () {
                div_id = '#comment' + this._id;
                $(div_id).hide();
                div_id = '#comment_ans' + this._id;
                $(div_id).addClass('comment_ans');
                $(div_id).removeClass('comment_ans_hide');
                div_id = '#comment_ansi' + this._id;
                $(div_id).addClass('comment_ans');
                $(div_id).removeClass('comment_ans_hide');
                },
        'click .reply_comment': function () {
                div_id = '#commentreply' + this._id;
                $(div_id).show();
                div_id = '#reply_comment' + this._id;
                $(div_id).removeClass('reply_comment');
                $(div_id).addClass('reply_comment_hide');
                }
                ,
        'click .reply_comment_hide': function () {
                div_id = '#commentreply' + this._id;
                $(div_id).hide();
                div_id = '#reply_comment' + this._id;
                $(div_id).addClass('reply_comment');
                $(div_id).removeClass('reply_comment_hide');
                }

 
});
Template.userprofile.emoticons = function () {
return (Meteor.settings.public.coreEmoticons);
}
Template.userprofile.coverfiles = function () {
//		alert(this._id);
	if (typeof this._id !== 'undefined'){
	return Images.find({_id: Meteor.users.findOne({_id: this._id}).profile.cover_image_id});
	}
};
Template.userprofile.files = function () {
//              alert(this._id);
        if (typeof this._id !== 'undefined'){
        return Images.find({_id: Meteor.users.findOne({_id: this._id}).profile.image_id});
        }
};
Template.userprofile.checkstatus = function () {
	if(typeof this.is_status !== 'undefined'){
		return true;
	}else{
		return false;
	}
}
Template.questionPage.shareData =  function(){
	return { title: this.text, description:'Question ' + this.text + ' at Topicerrati.com', image:'http://topicerrati.com/cfs/files/images/4BDWq25drBKRHBupD/Topicerrati.png'}
}

Template.questionPage.rendered = function(){
	QuestionsIndex.getComponentMethods().search("")
}
Template.home.rendered = function(){
        QuestionsIndex.getComponentMethods().search("")
}
Template.rightrecent.rendered = function(){
        TopicsIndex.getComponentMethods().search("")
}

//Modal Functionality Topic

Template.inputAutocomplete.events({
	'click .-autocomplete-container' : function(event, template, doc){
			event.preventDefault;
		//	$('#tag_people_div').val($('#tag_people_div').val() + '<b>'+doc.username+'</b>')
			return;
	},

	'keypress input.input-xlarge': function (evt, template) {
		//console.log(evt)
		//console.log(template)	
	}
})

Template.userPill.labelClass = function() {
  if (this._id === Meteor.userId()){
    return "label-warning"
  }else if(this.status.online === true){
    return "label-success"}
  else{
    return ""
	}
}


Template.modal_newTopic.helpers({
  settings: function() {
    return {
      position: "top",
      limit: 5,
      rules: [
        {
          token: '@',
          collection: Meteor.users,
          field: "username",
          template: Template.userPill
        }
      ]
    };
  }
});

Template.userprofile.helpers({
  settings: function() {
    return {
      position: "top",
      limit: 5,
      rules: [
        {
          token: '@',
          collection: Meteor.users,
          field: "username",
          template: Template.userPill
        }
      ]
    };
  }
})

var temp = 'rightrecent'
	 Template[temp].events({
                'click button': function(event, template){

                        var button = event.currentTarget

                        var modalName = 'modal_'+button.getAttribute('data-modal')

                        Modal.show(modalName)

                }
        })

var templateName = 'modal_newTopic'
Template[templateName].events({
	 'submit form': function(event, template){
                        event.preventDefault()
			var topic = template.find('#modal_newTopic_topic').value			
			var unique_q_id = topic.toLowerCase().replace(/[^A-Za-z0-9 ]/g,'').replace(/\s{2,}/g,' ').replace(/\s/g, "-")	
				//alert($('#tag_people_div').val())
				hash ={'topic':topic,'unique_q_id':unique_q_id}	
				Meteor.call("topic_create",hash, function(error,result){
				Modal.hide()
                                Router.go('/topic/'+unique_q_id)
				})
			},
	  "autocompleteselect input": function(event, template, doc) {
		event.preventDefault()
	//	$('#tag_people_div').val($('#tag_people_div').val() + '<b>'+doc.username+'</b>')
	//	$('#tag_people_div').val($('#tag_people_div').val())
	  }

})


Template.topic.events({
	'click .follow': function () {
        var q_id = this._id;
	Meteor.call("topicfollow",q_id, function (error, result) {
                if (result.unfollow){
                div_id = '#follow' + q_id;
                $(div_id).html("Unfollow");
                }
                if (result.follow){
                div_id = '#follow' + q_id;
                $(div_id).html("Follow");
                }
                })

        },
	'click .post_topic': function () {
		var q_id = this._id;
		//div_id = '#post_in_topic_area' + this._id;
		//var post_topic = $(div_id).val();
		div_id = '#summernote'
		var post_topic = $(div_id).summernote('code');
		if (post_topic == '<p><br></p>'){
			alert('Please put some words and post');
			return
		}
		hash = {topic_id:q_id,text:post_topic}
		Meteor.call("create_topic_post",hash, function (error, result) {
			$('#summernote').summernote('reset');
		})
	},
	 'click .comment_ans': function () {
                div_id = '#comment' + this._id;
                $(div_id).show();
                div_id = '#comment_ans' + this._id;
                $(div_id).removeClass('comment_ans');
                $(div_id).addClass('comment_ans_hide');
                 div_id = '#comment_ansi' + this._id;
                $(div_id).removeClass('comment_ans');
                $(div_id).addClass('comment_ans_hide');
                }
                ,
        'click .comment_ans_hide': function () {
                div_id = '#comment' + this._id;
                $(div_id).hide();
                div_id = '#comment_ans' + this._id;
                $(div_id).addClass('comment_ans');
                $(div_id).removeClass('comment_ans_hide');
                div_id = '#comment_ansi' + this._id;
                $(div_id).addClass('comment_ans');
                $(div_id).removeClass('comment_ans_hide');
                },
        'click .reply_comment': function () {
                div_id = '#commentreply' + this._id;
                $(div_id).show();
                div_id = '#reply_comment' + this._id;
                $(div_id).removeClass('reply_comment');
                $(div_id).addClass('reply_comment_hide');
                }
                ,
        'click .reply_comment_hide': function () {
                div_id = '#commentreply' + this._id;
                $(div_id).hide();
                div_id = '#reply_comment' + this._id;
                $(div_id).addClass('reply_comment');
                $(div_id).removeClass('reply_comment_hide');
                },

		 'change .myFileInput': function(event, template) {
	var topicid = this._id
       FS.Utility.eachFile(event, function(file) {
        var fileObj = new FS.File(file);
//      Meteor.call("upload_profile_pic",fileObj)
        if (typeof TopicList.findOne({_id: topicid}).topic_image_id !== 'undefined'){
                Images.remove({_id: TopicList.findOne({_id: topicid}).topic_image_id})
        }

        Images.insert(file, function (err, fileObj) {
        // Inserted new doc with ID fileObj._id, and kicked off the data upload using HTTP
                Session.set('uploadedfileId', fileObj._id);
                Meteor.call("upload_topic_pic",topicid,fileObj._id)
        });
    });

  },

});

//Modal Functionality Login
var templateName = 'index'

	Template[templateName].events({
		'click button': function(event, template){
			
			var button = event.currentTarget
			
			var modalName = 'modal_'+button.getAttribute('data-modal')
			
			Modal.show(modalName)
			
		}
	})

var templateName = 'modal_signIn'
	
	// Store user input in the Session object so it survives code reloads.
	var usernameErrorKey = templateName+'_usernameError'
	var passwordErrorKey = templateName+'_passwordError'
	
	Template[templateName].created = function(){
		
		Session.set(usernameErrorKey, "")
		Session.set(passwordErrorKey, "")
		
	}
	
	Template[templateName].helpers({
		usernameError: function(){
			return Session.get(usernameErrorKey)
		},
		passwordError: function(){
			return Session.get(passwordErrorKey)
		},
		signinCallback: function(){
			 Meteor.loginWithGoogle({
                                        requestPermissions: ['email', 'profile']
                            }, function (err) {
                                if(err) {
                                    //error handling
                                    alert('error : '+err.message);
                                } else {
                                        Modal.hide()
                                }
                            });

		}
	})
	
	Template[templateName].events({
		'click #customBtn' : function () {
    			Meteor.loginWithGoogle({
					requestPermissions: ['email', 'profile']	
			    }, function (err) {
			        if(err) {
			            //error handling
			            alert('error : '+err.message);
			        } else {
					Modal.hide()
			        }
			    });

		},
		 'click #fb-root': function(event) {
        		Meteor.loginWithFacebook({}, function(err){
		      	      if (err) {
                		throw new Meteor.Error("Facebook login failed");
		            }else{
				Modal.hide()
				}
			        });
		    },	
		'submit form': function(event, template){
			
			event.preventDefault()
			
			Session.set(usernameErrorKey, "")
			Session.set(passwordErrorKey, "")
			
			var username = template.find('#modal_signIn_username').value
			var password = template.find('#modal_signIn_password').value
			
			if(username == ""){
				Session.set(usernameErrorKey, "The username can't be empty")
				return
			}
			
			var user = {
				username: username
			}
			
			Meteor.loginWithPassword(user, password, function(error){
				if(error){
					switch(error.reason){
						case "User not found":
							Session.set(usernameErrorKey, "There is no user with this username.")
						break
						case "Incorrect password":
							Session.set(passwordErrorKey, "Wrong password.")
						break
						default:
							Session.set(usernameErrorKey, "Unknown error reason '"+error.reason+"'. This is a bug, please report it.")
					}
				}else{
					
					// Successfully signed in, just close the modal.
					Modal.hide()
					
				}
			})
		}
		
	})

	var templateName = 'modal_signUp'
	
	// Store user input in the Session object so it survives code reloads.
	// The error "" means there is no error.
	var usernameKey             = templateName+'_username'
	var usernameErrorKey        = templateName+'_usernameError'
	var emailKey                = templateName+'_email'
	var emailErrorKey           = templateName+'_emailError'
	var password0Key            = templateName+'_password0'
	var password0ErrorKey       = templateName+'_password0Error'
	var password1Key            = templateName+'_password1'
	var password1ErrorKey       = templateName+'_password1Error'
	var acceptsUserAgreementKey = templateName+'_acceptsUserAgreement'
	var occupiedUsernamesKey    = templateName+'_occupiedUsernames'
	
	Template[templateName].created = function(){
		
		Session.setDefault(usernameKey, "")
		Session.setDefault(emailKey, "")
		Session.setDefault(password0Key, "")
		Session.setDefault(password1Key, "")
		Session.setDefault(acceptsUserAgreementKey, false)
		Session.setDefault(occupiedUsernamesKey, [])
		// The other sessions are set in the validation autoruns below.
		
		// The validation autoruns below are to be consistent with the settings in
		// the accounts-ui-unstyled package.
		// https://github.com/meteor/meteor/blob/556c0e28e94b9351cbf0b28e80a71a4e35f1362a/packages/accounts-ui-unstyled/login_buttons.js#L74
		
		// Validate username.
		this.autorun(function(computation){
			if(Session.equals(usernameKey, "")){
				Session.set(usernameErrorKey, "Your username can't be empty.")
			}else{
				var username = Session.get(usernameKey)
				if(username.length <= 2){
					Session.set(usernameErrorKey, "Your username must be at least 2 characters long.")
				}else{
					var occupiedUsernames = Session.get(occupiedUsernamesKey)
					if(occupiedUsernames.indexOf(username) != -1){
						Session.set(usernameErrorKey, "This username is already taken by another member.")
					}else{
						Session.set(usernameErrorKey, "")
					}
				}
			}
		})
		
		// Validate email.
		this.autorun(function(computation){
			if(Session.equals(emailKey, "")){
				Session.set(emailErrorKey, "This is not a valid email.")
			}else{
				var email = Session.get(emailKey)
				if(email.indexOf("@") == -1){
					Session.set(emailErrorKey, "This is not a valid email.")
				}else{
					Session.set(emailErrorKey, "")
				}
			}
		})
		
		// Validate password0.
		this.autorun(function(computation){
			if(Session.equals(password0Key, "")){
				Session.set(password0ErrorKey, "You can't have an empty password.")
			}else{
				var password0 = Session.get(password0Key)
				if(password0.length <= 5){
					Session.set(password0ErrorKey, "The password needs to be a bit longer.")
				}else{
					Session.set(password0ErrorKey, "")
				}
			}
		})
		
		// Validate password1.
		this.autorun(function(computation){
			var password0 = Session.get(password0Key)
			var password1 = Session.get(password1Key)
			if(password0 == password1){
				Session.set(password1ErrorKey, "")
			}else{
				Session.set(password1ErrorKey, "This password is not the same as the first.")
			}
		})
		
	}
	
	Template[templateName].helpers({
		username: function(){
			return Session.get(usernameKey)
		},
		usernameError: function(){
			return Session.get(usernameErrorKey)
		},
		email: function(){
			return Session.get(emailKey)
		},
		emailError: function(){
			return Session.get(emailErrorKey)
		},
		password0: function(){
			return Session.get(password0Key)
		},
		password0Error: function(){
			return Session.get(password0ErrorKey)
		},
		password1: function(){
			return Session.get(password1Key)
		},
		password1Error: function(){
			return Session.get(password1ErrorKey)
		},
		isUserAgrementAccepted: function(){
			return Session.equals(acceptsUserAgreementKey, true)
		},
		isAnythingWrong: function(){
			return !(Session.equals(usernameErrorKey , "") &&
						Session.equals(emailErrorKey    , "") &&
						Session.equals(password0ErrorKey, "") &&
						Session.equals(password1ErrorKey, "")
						//Session.equals(acceptsUserAgreementKey, true)
						)
		}
	})
	
	Template[templateName].events({
		
		'keyup #modal_signUp_username': function(event, template){
			var username = event.currentTarget.value
			Session.set(usernameKey, username)
		},
		
		'keyup #modal_signUp_email': function(event, template){
			var email = event.currentTarget.value
			Session.set(emailKey, email)
		},
		
		'keyup #modal_signUp_password0': function(event, template){
			var password0 = event.currentTarget.value
			Session.set(password0Key, password0)
		},
		
		'keyup #modal_signUp_password1': function(event, template){
			var password1 = event.currentTarget.value
			Session.set(password1Key, password1)
		},
		
		'change #modal_signUp_acceptsUserAgreement': function(event, template){
			var acceptsUserAgreement = event.currentTarget.checked
			Session.set(acceptsUserAgreementKey, acceptsUserAgreement)
		},
		
		'click .clickRoutesToUserAgreement': function(event, template){
			
			event.preventDefault()
			
			// Hide the modal...
			Modal.hide()
			
			// ...and go to the page with the user agreement.
			// (in this example, that does not exist).
			//Router.go('userAgreement')
			
		},
		
		'submit form': function(event, template){
			
			event.preventDefault()
			
			var username = Session.get(usernameKey)
			var email = Session.get(emailKey)
			var password0 = template.find('#modal_signUp_password0').value
			var password1 = template.find('#modal_signUp_password1').value
			
			var options = {
				username: username,
				email: email,
				password: password0,
					
			}
			
			Accounts.createUser(options, function(error){
				if(error){
					switch(error.reason){
						case "Username already exists.":
							var occupiedUsernames = Session.get(occupiedUsernamesKey)
							occupiedUsernames.push(username)
							Session.set(occupiedUsernamesKey, occupiedUsernames)
						break
						case "Email already exists.":
							Session.set(emailErrorKey, "There is a user registered with this email.")
						break
						default:
							Session.set(usernameErrorKey, "Unknown error reason '"+error.reason+"'. This is a bug, please report it.")
					}
				}else{
					// Explicity remove the passwords, so no one can read them.
					Session.set(password0Key, "")
					Session.set(password1Key, "")
					Meteor.call("create_default_fields")
					Modal.hide()
				}
			})
		}
		
	})


Tracker.autorun(function () {
  //let cursor = TopicsIndex.search('cbse');
  //console.log(cursor.fetch()); // log found documents with default search limit
  //console.log(cursor.count()); // log count of all found documents
});

Template.question.helpers({
  inputAttributes: function () {
return { 'class': 'easy-search-input search_box', 'placeholder': 'Start searching...', 'id':'question_input' , 'required': 'true', 'name': 'search', 'autocomplete': 'off', 'style':'width:70%;color:white;'};
},
  questionsIndex: () => QuestionsIndex // instanceof EasySearch.Index
});

Template.rightrecent.helpers({
  inputAttributes: function () {
return { 'class': 'easy-search-input search_box', 'placeholder': 'Search Topic...', 'id':'topic_input' , 'required': 'true', 'name': 'search_topic', 'autocomplete': 'off'};
},
  topicsIndex: () => TopicsIndex // instanceof EasySearch.Index
});
 Template.question.events({
    'submit form': function(event){
	event.preventDefault();
    	var question = event.target.search.value;
	arr = ["what"," why"," where", "when" ,"how" ,"who"]
	var unique_q_id = question.toLowerCase().replace(/[^A-Za-z0-9 ]/g,'').replace(/\s{2,}/g,' ').replace(/\s/g, "-")
	hash = {question:question,unique_q_id:unique_q_id}
	Meteor.call("question_ask",hash, function(error,response){
		$('#question_input').val("");
        Router.go('/question/'+unique_q_id)
	})
	/*
    	QuestionsList.insert({
        	text: question,
		unique_q_id: question.toLowerCase().replace(/[^A-Za-z0-9 ]/g,'').replace(/\s{2,}/g,' ').replace(/\s/g, "-"),
		user: Meteor.userId(),
		answer_ids: [],
		created_at: new Date(),
    }, function(err,docsInserted){
	});*/
    }
});


 Template.everyq.events({
    'click .add_answer': function(event){
        event.preventDefault();
	var div_id = '#dat_' + this._id;
        //var answer = UniHTML.purify($(div_id).html());
//	var answer = $(div_id).html().replace(new RegExp(('contenteditable=\"true\"'), ''), replace); 
	var answer = $(div_id).summernote('code');
	//$(div_id).summernote('destroy');
//	var answer = $(div_id).html().replace(/contenteditable=\"true\"/g,'')
	var q_id = this._id;
	var q_text = this.text;
	var q_date = this.created_at
	var q_unique = this.unique_q_id
	var q_user = this.user
	var thiselement = jQuery.extend({}, this);
	Meteor.call("add_answer",q_id,answer, function (error, result){
		if (result.edit){
		div_id = '#anser' + q_id;
                $(div_id).hide();
                div_id = '#answer_edit' + q_id;
                $(div_id).addClass('answer_edit');
                $(div_id).removeClass('answer_edit_hide');
		}
		if (result.add){
		div_id = '#answer' + q_id;
	        $(div_id).hide();
        	div_id = '#anser' + q_id;
	        $(div_id).hide();
		}
	})
},
	'click .edit_content_answer': function(event){
	  event.preventDefault();
        var div_id = '#dat_' + this._id;
        //var answer = UniHTML.purify($(div_id).html());
//      var answer = $(div_id).html().replace(new RegExp(('contenteditable=\"true\"'), ''), replace); 
        var answer = $(div_id).summernote('code');
        //$(div_id).summernote('destroy');
//      var answer = $(div_id).html().replace(/contenteditable=\"true\"/g,'')
		q_id = this._id;
		Meteor.call("edit_answer",q_id,answer,function(error,result){
		 div_id = '#anser' + q_id;
                $(div_id).hide();
                div_id = '#answer_edit' + q_id;
                $(div_id).addClass('answer_edit');
                $(div_id).removeClass('answer_edit_hide');
		})
	}
});

 Template.answer_voting.events({
    'click .add_comment': function(event){
        event.preventDefault();
	//console.log("cppment onsertion called")
        var div_id = '#comment_' + this._id;
        var comment = UniHTML.purify($(div_id).val());
	Meteor.call("comment_insert",this._id,comment)	
        div_id = '#comment' + this._id;
        $(div_id).hide();
    }
});

 Template.comment_reply.events({
    'click .add_reply': function(event){
        event.preventDefault();
	//console.log("reply onsertion called")
	var div_id = '#commentreply_' + this._id;
        var commentreply = UniHTML.purify($(div_id).val());
	Meteor.call("reply_insert",this._id,commentreply)	
        div_id = '#commentreply_ans' + this._id;
	
        $(div_id).hide();
        div_id = '#commentreply' + this._id;
        $(div_id).hide();
    }
});

Template.editor.onRendered(function (){
		var self = this;

Tracker.autorun(function(a) {
var data = Template.currentData(self.view);
//if(!data) return;
 var cont = '#dat_' + data._id;
	  if (typeof $(cont).summernote('code') == 'undefined'){
          $(cont).summernote({
                dialogsInBody: true
                });
		}
//...
}); 
});

Template.editeditor.onRendered(function (){
                var self = this;

Tracker.autorun(function(a) {
var data = Template.currentData(self.view);
//if(!data) return;
 var cont = '#dat_' + data._id;
          if (typeof $(cont).summernote('code') == 'undefined'){
          $(cont).summernote({
                dialogsInBody: true
                });
                }
//...
});
});


Template.topic.shareData =  function(){
	 q_id = TopicList.findOne({unique_q_id: this.unique_q_id})
        if (typeof TopicList.findOne({unique_q_id: q_id}) !== 'undefined' && typeof TopicList.findOne({unique_q_id: q_id}).topic_image_id !== 'undefined'){
         image =  Images.findOne({_id: TopicList.findOne({unique_q_id: q_id}).topic_image_id});
        }
        if (typeof image !== 'undefined'){
        image_url = "http://topicerrati.com" + image.url().substring(0,image.url().lastIndexOf("?")) + '?store=share'
        }else{
        image_url = "http://topicerrati.com/cfs/files/images/4BDWq25drBKRHBupD/Topicerrati.png?store=share"
        }

	return { title: this.title, description: 'Discuss '+  this.title + ' at Topicerrati.com', image:image_url}
}

Template.topic.rendered = function(){
	$(document).ready(function() {
          var cont = '#summernote';
          $(cont).summernote({
		required: true,
                dialogsInBody: true
                });
                });
}
/* DEprectae quill editor
Template.quill_editor.onRendered(function () {
  var fullEditor;
	id_q_complete = QuestionsList.findOne({_id:Template.parentData(0)._id})
	if (typeof id_q_complete != 'undefined'){
		id_q = id_q_complete._id
	}else{
		id_q_complete = TopicList.findOne({_id:Template.parentData(0)._id})
		id_q = id_q_complete._id
	}
	fulleditor_id = '#full-editor-' + id_q
	fulltoolbar_id = '#full-toolbar-' + id_q
	var fullEditor = new Quill(fulleditor_id, {
  modules: {
    //'multi-cursor': true,
    'toolbar': { container: fulltoolbar_id },
     //'image-tooltip': true,
    //'link-tooltip': true
  },
  theme: 'snow'
});

// Add basic editor's author

// Add a cursor to represent basic editor's cursor
//var cursorManager = fullEditor.getModule('multi-cursor');
//cursorManager.setCursor('gandalf', fullEditor.getLength()-1, 'Gandalf', 'rgba(255,153,51,0.9)');

// Sync basic editor's cursor location
basicEditor.on('selection-change', function(range) {
  if (range) {
    cursorManager.moveCursor('gandalf', range.end);
  }
});

// Update basic editor's content with ours
fullEditor.on('text-change', function(delta, source) {
  if (source === 'user') {
    basicEditor.updateContents(delta);
  }
});

// basicEditor needs authorship module to accept changes from fullEditor's authorship module
basicEditor.addModule('authorship', {
  authorId: 'gandalf',
  color: 'rgba(255,153,51,0.4)'
});

// Update our content with basic editor's
basicEditor.on('text-change', function(delta, source) {
  if (source === 'user') {
    fullEditor.updateContents(delta);
  }
});
  return fullEditor;
});
*/

 Template.home.helpers({
  } );

   Template.home.count = function(){
    return QuestionsList.find().count()
  }
  
 
 /* 
  Template.home1.ques = function(){
        return QuestionsList.find({}, {sort: {created_at: -1}, 
	 transform: function(doc) {
        var index = 0;
        if (typeof doc.answers_ids !== 'undefined') {
                doc.answersObj = AnswersList.find({
                _id:  {$in: doc.answers_ids}
            });
        }
	doc.upvotesObj = Votes.find({question_id: doc._id, upvote: 1})
	doc.downvotesObj = Votes.find({question_id: doc._id, downvote: 1})
	doc.isupvoted = Votes.find({question_id: doc._id, upvote: 1, u_id: Meteor.userId()})
	doc.isdownvoted = Votes.find({question_id: doc._id, downvote: 1, u_id: Meteor.userId()})
	doc.is_answered = AnswersList.find({question_id: doc._id, u_id: Meteor.userId()})
	//alert(JSON.stringify(doc))
        return doc
}
})}
*/
Template.rightrecent.toptopic = function() {
	return TopicList.find({},{limit:5, sort: {created_at: -1}})
}



Template.index.profilepic_dd = function() {
	if (Meteor.userId() != null){
		return Images.findOne({_id: Meteor.users.findOne({_id: Meteor.userId()}).profile.image_id})
	}
}
  Template.index.events({
	'click #change_password_link': function () {
        Router.go('/change_password');
        },
    'click #edit_prof': function () {
    	Router.go('/user/' + Meteor.userId());
	},
	'click #log_out': function () {
	Meteor.logout();
	Router.go('/')
	},
	'click .fa-envelope': function() {
		$('.fa-envelope').siblings('.badge2').hide();	
   	},
	'click .fa-user-plus': function() {
		$('.fa-user-plus').siblings('.badge2').hide();
        },
	'click .item-heading': function() {
		Meteor.call("remove_notification",this._id)
	},
	'click .notification-message':function() {
                Meteor.call("remove_message_notification",this._id)
        }
	

  });
  
  Template.index.helpers({
  notification: function() { 
	Notification.find({u_id:Meteor.userId(),is_seen:0,is_f_notify:1}).observe({
  added: function(id) {
	if(id.is_topic == 0){
		$('.fa-envelope').siblings('.badge2').show();
	}else{
		$('.fa-user-plus').siblings('.badge2').show();
	}	
	}
	})
	return Notification.find({u_id:Meteor.userId(),is_seen:0,is_f_notify:1},{sort:{created_at:-1},
	transform: function(doc){
                        doc.notify_user = Meteor.users.findOne({_id: doc.follower_id})
                          if (typeof doc.notify_user !== 'undefined'){
                                if (typeof doc.notify_user.profile !== 'undefined'){
                                         doc.notify_user_image = Images.findOne({_id: doc.notify_user.profile.image_id})
                                }
                        }
                        return doc
                }}
)
	},
   notification_bell: function() {
        Notification.find({ $and:[{u_id:Meteor.userId(),is_seen:0,is_f_notify:0,"is_type": {
        $in: ["comment","reply","answer","user_answer_upvote","user_comment_upvote","user_question_upvote"]
    }}, {"follower_id": { $ne: [Meteor.userId()] }}]}).observe({
  added: function(id) {
        if(id.is_topic == 0){
                $('.fa-envelope').siblings('.badge2').show();
        }else{
                $('.fa-user-plus').siblings('.badge2').show();
        }
        }
        })
        return Notification.find({u_id:Meteor.userId(),is_seen:0,is_f_notify:0},{sort:{created_at:-1},
        transform: function(doc){
                        doc.notify_user = Meteor.users.findOne({_id: doc.follower_id})
                          if (typeof doc.notify_user !== 'undefined'){
                                if (typeof doc.notify_user.profile !== 'undefined'){
                                         doc.notify_user_image = Images.findOne({_id: doc.notify_user.profile.image_id})
                                }
                        }
                        return doc
                }}
)
        },

  messages: function(){
	return ChatMessage.find({to:Meteor.userId(),is_seen:0},{sort:{created_at:-1},
        transform: function(doc){
                        doc.notify_user = Meteor.users.findOne({_id: doc.from})
                          if (typeof doc.notify_user !== 'undefined'){
                                if (typeof doc.notify_user.profile !== 'undefined'){
                                         doc.notify_user_image = Images.findOne({_id: doc.notify_user.profile.image_id})
                                }
                        }
                        return doc
                }}
		
)
  },
  votes: function(){
	return Votes.find({user_id:Meteor.userId(),upvote:1,is_seen:0},
		{sort:{created_at:-1},
	        transform: function(doc){
                        doc.notify_user = Meteor.users.findOne({_id: doc.u_id})
                          if (typeof doc.notify_user !== 'undefined'){
                                if (typeof doc.notify_user.profile !== 'undefined'){
                                         doc.notify_user_image = Images.findOne({_id: doc.notify_user.profile.image_id})
                                }
                        }
                        return doc
                }}

)
   },
  isComment: function (name) {
    return name === "comment"
  },
  isReply: function (name) {
    return name === "reply"
  },
  isAnswer: function (name) {
    return name === "answer"
  },
  isAnswerUpvote: function (name) {
    return name === "user_answer_upvote"
  },
  isCommentUpvote: function (name) {
    return name === "user_comment_upvote"
  },
  isQuestionUpvote: function (name) {
    return name === "user_question_upvote"
  },
  isAnswerDownvote: function (name) {
    return name === "user_answer_downvote"
  },
  isCommentDownvote: function (name) {
    return name === "user_comment_downvote"
  },
  isQuestionDownvote: function (name) {
    return name === "user_question_downvote"
  },
   isUserFollow: function (name) {
    return name === "user_follow"
  },
  isTopicFollow: function (name) {
    return name === "topic"
  }
  }) 


Template.home.moreResults = function() {
    // If, once the subscription is ready, we have less rows than we
    // asked for, we've got all the rows in the collection.
    return !(QuestionsList.find().count() < Session.get("itemsLimit"));
}
Template.chat.legaluser = function(){
        if(this._id == Meteor.userId()) {
                return true
        }else{
                return false
        }
}
Template.topic.files = function () {
//              alert(this._id);
        if (typeof this._id !== 'undefined'){
        return Images.find({_id: TopicList.findOne({_id: this._id}).topic_image_id});
        }
};

Template.topic.legaluser = function(){
        if(this.u_id == Meteor.userId()) {
                return true
        }else{
                return false
        }
}

Template.userprofile.legaluser = function(){
	if(this._id == Meteor.userId()) {
		return true
	}else{
		return false
	}
}
Template.userprofile.legalanswer = function(){
        if(this.u_id == Meteor.userId()) {
                return true
        }else{
                return false
        }
}
var ITEMS_INCREMENT = 5; 
// whenever #showMoreResults becomes visible, retrieve more results
function showMoreVisible() {
    var threshold, target = $("#showMoreResults");
    if (!target.length) return;
 
    threshold = $(window).scrollTop() + $(window).height() - target.height();
 
    if (target.offset().top < threshold) {
        if (!target.data("visible")) {
             //console.log("target became visible (inside viewable area)");
            target.data("visible", true);
            Session.set("itemsLimit",
                Session.get("itemsLimit") + ITEMS_INCREMENT);
        }
    } else {
        if (target.data("visible")) {
             //console.log("target became invisible (below viewable arae)");
            target.data("visible", false);
        }
    }       
}

$(window).scroll(showMoreVisible);

  Session.setDefault('itemsLimit', ITEMS_INCREMENT);
Deps.autorun(function() {
  Meteor.subscribe('questions', Session.get('itemsLimit'));
  Meteor.subscribe("answers");
  Meteor.subscribe("comments");
  Meteor.subscribe("replycomments");
  Meteor.subscribe("users");
  Meteor.subscribe("votes");
  Meteor.subscribe("notifications");
  Meteor.subscribe("chatmessages");
});

  Template.home.posts = function(){
 return AnswersList.find({is_status:1}, {sort: {created_at: -1},transform: function(doc){
                        doc.countupVoteAnsObj = Votes.find({answer_id: doc._id,upvote:1})
                        doc.countdownVoteAnsObj = Votes.find({answer_id: doc._id,downvote:1})
                        doc.isupvotedans = Votes.find({answer_id: doc._id,upvote:1,u_id: Meteor.userId()})
                        doc.isdownvotedans = Votes.find({answer_id: doc._id,downvote:1,u_id: Meteor.userId()})
                        doc.answer_user = Meteor.users.findOne({_id: doc.u_id})
			doc.is_answered = AnswersList.find({ u_id: Meteor.userId(), _id:doc._id})
                        if (typeof doc.question_id !== 'undefined'){
                        doc.is_answered = AnswersList.find({question_id: doc.question_id, u_id: Meteor.userId()})}
                        if (typeof doc.answer_user !== 'undefined'){
                                if (typeof doc.answer_user.profile !== 'undefined'){
                                        doc.answer_user_image = Images.findOne({_id: doc.answer_user.profile.image_id})
                                }  }
                        if (typeof doc.comment_ids !== 'undefined') {
                                doc.commentsmulti = CommentsList.find({  _id:  {$in: doc.comment_ids}
                                 },{sort: {created_at: -1},transform: function(doc){
                                  doc.countupVoteCommentObj = Votes.find({comment_id: doc._id,upvote:1})
                        doc.countdownVoteCommentObj = Votes.find({comment_id: doc._id,downvote:1})
                        doc.isupvotedcomment = Votes.find({comment_id: doc._id,upvote:1,u_id: Meteor.userId()})
                        doc.isdownvotedcomment = Votes.find({comment_id: doc._id,downvote:1,u_id: Meteor.userId()})
                        doc.comment_user = Meteor.users.findOne({_id: doc.u_id})
                        if (typeof doc.comment_user !== 'undefined'){
                                if (typeof doc.comment_user.profile !== 'undefined'){
                        doc.comment_user_image = Images.findOne({_id: doc.comment_user.profile.image_id})  }                        }
                         if (typeof doc.commentreply_ids !== 'undefined') {
                                doc.commentsreplymulti =ReplyComment.find({   _id:  {$in: doc.commentreply_ids}
                                },{sort: {created_at: -1},transform: function(doc){
                                  doc.countupVoteCommentReplyObj = Votes.find({commentreply_id: doc._id,upvote:1})
                                doc.countdownVoteCommentReplyObj = Votes.find({commentreply_id: doc._id,downvote:1})
                                doc.isupvotedcommentreply = Votes.find({commentreply_id: doc._id,upvote:1,u_id: Meteor.userId()})
                                doc.isdownvotedcommentreply = Votes.find({commentreply_id: doc._id,downvote:1,u_id: Meteor.userId()})
                                doc.reply_user = Meteor.users.findOne({_id: doc.u_id})
                                        if (typeof doc.reply_user !== 'undefined'){
                                                if (typeof doc.reply_user.profile !== 'undefined'){
                                                doc.reply_user_image = Images.findOne({_id: doc.reply_user.profile.image_id}) } }
                        return doc                      }})}
                        return doc                      }})}
                        return doc                      }})}


  Template.home.ques = function(){
        return QuestionsList.find({}, {sort: {created_at: -1} , limit: Session.get("itemsLimit"), 
         transform: function(doc) {
        var index = 0;
        if (typeof doc.answers_ids !== 'undefined') {
                doc.answersObj = AnswersList.find({
                _id:  {$in: doc.answers_ids}
            }, {sort: {created_at: -1}, transform: function(doc){
			doc.countupVoteAnsObj = Votes.find({answer_id: doc._id,upvote:1})
			doc.countdownVoteAnsObj = Votes.find({answer_id: doc._id,downvote:1})
			doc.isupvotedans = Votes.find({answer_id: doc._id,upvote:1,u_id: Meteor.userId()})
                        doc.isdownvotedans = Votes.find({answer_id: doc._id,downvote:1,u_id: Meteor.userId()})
			doc.answer_user = Meteor.users.findOne({_id: doc.u_id})
			doc.is_answered = AnswersList.find({_id:doc._id, question_id: doc.question_id, u_id: Meteor.userId()})
			if (typeof doc.answer_user !== 'undefined'){
				if (typeof doc.answer_user.profile !== 'undefined'){
        		doc.answer_user_image = Images.findOne({_id: doc.answer_user.profile.image_id})
				}
		        }	
	//		doc.commentsmulti = Comments.find({_id:  {$in: doc.comments_ids}})
			 if (typeof doc.comment_ids !== 'undefined') {
		                doc.commentsmulti = CommentsList.find({
                		_id:  {$in: doc.comment_ids}
				},{sort: {created_at: -1},transform: function(doc){
				  doc.countupVoteCommentObj = Votes.find({comment_id: doc._id,upvote:1})
                        doc.countdownVoteCommentObj = Votes.find({comment_id: doc._id,downvote:1})
                        doc.isupvotedcomment = Votes.find({comment_id: doc._id,upvote:1,u_id: Meteor.userId()})
                        doc.isdownvotedcomment = Votes.find({comment_id: doc._id,downvote:1,u_id: Meteor.userId()})
			doc.comment_user = Meteor.users.findOne({_id: doc.u_id})
			if (typeof doc.comment_user !== 'undefined'){
				if (typeof doc.comment_user.profile !== 'undefined'){
	        	doc.comment_user_image = Images.findOne({_id: doc.comment_user.profile.image_id})
				}
        		}
				         //CommentsReplies
                                   if (typeof doc.commentreply_ids !== 'undefined') {
                                doc.commentsreplymulti =ReplyComment.find({
                                _id:  {$in: doc.commentreply_ids}
                                },{sort: {created_at: -1},transform: function(doc){
                                  doc.countupVoteCommentReplyObj = Votes.find({commentreply_id: doc._id,upvote:1})
                                doc.countdownVoteCommentReplyObj = Votes.find({commentreply_id: doc._id,downvote:1})
                                doc.isupvotedcommentreply = Votes.find({commentreply_id: doc._id,upvote:1,u_id: Meteor.userId()})
                                doc.isdownvotedcommentreply = Votes.find({commentreply_id: doc._id,downvote:1,u_id: Meteor.userId()})
				doc.reply_user = Meteor.users.findOne({_id: doc.u_id})
				if (typeof doc.reply_user !== 'undefined'){
					if (typeof doc.reply_user.profile !== 'undefined'){
       				 doc.reply_user_image = Images.findOne({_id: doc.reply_user.profile.image_id})
					}
			        }
                                return doc
}})
                        }

			return doc
}})
			}
			return doc
		}
 });
        }
        doc.upvotesObj = Votes.find({question_id: doc._id, upvote: 1})
        doc.downvotesObj = Votes.find({question_id: doc._id, downvote: 1})
        doc.isupvoted = Votes.find({question_id: doc._id, upvote: 1, u_id: Meteor.userId()})
        doc.isdownvoted = Votes.find({question_id: doc._id, downvote: 1, u_id: Meteor.userId()})
        doc.is_answered = AnswersList.find({question_id: doc._id, u_id: Meteor.userId()})
	doc.question_user = Meteor.users.findOne({_id:doc.user})
	if (typeof doc.question_user !== 'undefined'){
		if (typeof doc.question_user.profile !== 'undefined'){
	doc.question_user_image = Images.findOne({_id: doc.question_user.profile.image_id})
		}
	}
        //alert(JSON.stringify(doc))
        return doc
}}
)}


Template.chat.onCreated( function() {
  this.currentTab = new ReactiveVar( "empty" );
});
Template.chat.helpers({
  tab: function() {
    return Template.instance().currentTab.get();
  },
  tabData: function() {
    	var tab = Template.instance().currentTab.get();
	var tab_user = Meteor.users.findOne({_id: Template.instance().currentTab.get().toString()});
	var user = Meteor.users.findOne({_id: Meteor.userId()})
	var chat_messages = ChatMessage.find({$or: [ {from: tab, to:Meteor.userId()}, {from: Meteor.userId(), to:tab} ]},{sort: {created_at: 1}})
 var chat_messages_1 = ChatMessage.find({$or: [ {from: tab, to:Meteor.userId()}, {from: Meteor.userId(), to:tab} ]},{sort: {created_at: 1}}).observe({
  added: function(id) {
    	ChatMessage.update(id._id,{$set:{is_seen:1}})
	if(typeof $('#panel-body') !== 'undefined'){
          $('#panel-body').scrollTop($('#panel-body')[0].scrollHeight);
        }
	// id just came online
  }})
                if (typeof user.profile !== 'undefined'){
                        user_image = Images.findOne({_id: user.profile.image_id})
			user = user.username
                }else{
			
		}
		


	if (typeof tab_user == 'undefined'){
		tab_user = "Chat"
		 if(typeof $('#panel-body') !== 'undefined'){
                 //$('#panel-body').scrollTop($('#panel-body')[0].scrollHeight);
                }
		$('#chatbox').hide();
		tab_user_image = "nothing"
	}else{
                if (typeof tab_user.profile !== 'undefined'){
		        tab_user_image = Images.findOne({_id: tab_user.profile.image_id})
			
                }

		tab_user = tab_user.username
		$('#chatbox').show();
		if(typeof $('#panel-body') !== 'undefined'){
                 $('#panel-body').scrollTop($('#panel-body')[0].scrollHeight);
		}

	}
          $('#btn-input').val('') 
	  if(typeof $('#panel-body') !== 'undefined'){
	  //$('#panel-body').scrollTop($('#panel-body')[0].scrollHeight);
	}
     return { tab_user: tab_user,user: user, chat_messages: chat_messages, chatter : tab, user_image:user_image, tab_user_image:tab_user_image};
  },
  countunreadmessage: function() {
	if (this.unread_messages.count() != 0){
		return true;
	}else{
		return false;
	}
  }  
});

Template.chatbox.helpers({
  whoisboss: function() {
		 $('.meteoremoticon').css({"max-width":"20px"})
		if(this.from == Meteor.userId()){
			return true
			
		}else{
			return false
		}		
	},
  letsrolldown: function() {
	 if(typeof $('#panel-body') !== 'undefined'){
        $('#panel-body').scrollTop($('#panel-body')[0].scrollHeight);
        }
	return true;
  }
});
/*Template.chatbox.rendered = function (){
	alert("sadasd")
	if(typeof $('#panel-body') !== 'undefined'){
	$('#panel-body').scrollTop($('#panel-body')[0].scrollHeight);
	}
}*/
Template.chatbox.events({
	 'keypress input.chat_class': function (evt, template) {
	    if (evt.which === 13) {
		 var to_message = $('#to_msg').val();
                var from_message = Meteor.userId();
                var message = $('#btn-input').val();
		if (message == ''){
                        return true;
                }
		hash= {"message" : message, to_message:to_message}
                Meteor.call('addChat', hash);
		$('#btn-input').val('')
		if(typeof $('#panel-body') !== 'undefined'){
                $('#panel-body').scrollTop($('#panel-body')[0].scrollHeight);
		}
		}
	  },
	"click #btn-chat": function(event, template) {
		var to_message = $('#to_msg').val();
		var from_message = Meteor.userId();
		var message = $('#btn-input').val();
		 if (message == ''){
                        return true;
                }
		hash= {"message" : message, to_message:to_message}
                Meteor.call('addChat', hash);
		$('#btn-input').val('')
		if(typeof $('#panel-body') !== 'undefined'){
		$('#panel-body').scrollTop($('#panel-body')[0].scrollHeight);
		}
	},
	"click .glyphicon-chevron-down": function(event, template) {
		var div_id = $('#chatbox')
		div_id.hide();
	},
	 "click .panel-heading-open": function(event, template) {
        	$('#panel-body').hide();
		$('#panel-footer').hide();
		var div_id = $('#panel-heading')
		div_id.addClass('panel-heading-closed')
		div_id.removeClass('panel-heading-open')
		$('#chatbox').css("margin-top","2%")
	},
	 "click .panel-heading-closed": function(event, template) {
                $('#panel-body').show();
                $('#panel-footer').show();
                var div_id = $('#panel-heading')
		div_id.addClass('panel-heading-open')
                div_id.removeClass('panel-heading-closed')
		$('#chatbox').css("margin-top","-20%")
        }

});


Template.chat.events({
        "click .chat_new ": function(event, template) {
       		//Session.set(this._id, true);	 
		var currentTab = $(event.target)
		var tab_user = currentTab.data( "template" )
		hash= {"to_message":tab_user}
                Meteor.call('updateChat', hash);
		$('#chatbox').show();
		 $('#panel-body').show();
                $('#panel-footer').show();
                var div_id = $('#panel-heading')
                div_id.addClass('panel-heading-open')
                div_id.removeClass('panel-heading-closed')
                $('#chatbox').css("margin-top","-20%")
		template.currentTab.set( currentTab.data( "template" ) );

	}	
});



  Template.home.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
    }
    
  });


  Template.answer_voting.events({
        'click .upvote_ans': function () {
        var q_id = this._id;
	Meteor.call("upvote_answer", q_id, function (error,result) {
		if (hash.upvoted) {
			div_id = '#upvote_ans' + q_id;
		         $(div_id).html("Upvoted");
		        div_id = '#downvote_ans' + q_id;
		        $(div_id).html("Downvote");
		}else{
			div_id = '#upvote_ans' + q_id;
	                $(div_id).html("Upvote");
        		div_id = '#downvote_ans' + q_id;
		        $(div_id).html("Downvote");
		}

	})
        },
	   'click .downvoting_ans': function () {
        var q_id = this._id;
	Meteor.call("downvote_answer",q_id, function (error, result) {
		if (hash.downvoted) {
		div_id = '#downvote_ans' + q_id;
                $(div_id).html("Downvoted");
	        div_id = '#upvote_ans' + q_id;
                $(div_id).html("Upvote");
		}else{
		div_id = '#downvote_ans' + this._id;
	        $(div_id).html("Downvote");
        	div_id = '#upvote_ans' + this._id;
	        $(div_id).html("Upvote");
		}
	})
        },
	//Comment Voting System
		'click .upvote_comment': function () {
        var q_id = this._id;
	Meteor.call("upvote_comment",q_id, function(error, result){
		if (result.upvoted){
			div_id = '#upvote_comment' + q_id;
		         $(div_id).html("Upvoted");
		        div_id = '#downvote_comment' + q_id;
		        $(div_id).html("Downvote");
		}else{
			div_id = '#upvote_comment' + q_id;
	                $(div_id).html("Upvote");
        		div_id = '#downvote_comment' + q_id;
		        $(div_id).html("Downvote");
		}
	})
        },
           'click .downvoting_comment': function () {
        var q_id = this._id;
	Meteor.call("downvote_comment",q_id,function (error,result){
		if (result.downvoted){
		div_id = '#downvote_comment' + q_id;
                $(div_id).html("Downvoted");
	        div_id = '#upvote_comment' + q_id;
                $(div_id).html("Upvote");
		}else{
		div_id = '#downvote_comment' + this._id;
	        $(div_id).html("Downvote");
        	div_id = '#upvote_comment' + this._id;
	        $(div_id).html("Upvote");
		}
	})
        }
});



  Template.everyq.events({
	'click .upvote': function () {
	var q_id = this._id;
	Meteor.call("upvote_question",q_id, function(error,result){
		if (result.upvoted) {
			 div_id = '#upvote' + q_id;
		         $(div_id).html("Upvoted");
		        div_id = '#downvote' + q_id;
		        $(div_id).html("Downvote");
		}else{
			div_id = '#upvote' + q_id;
	                $(div_id).html("Upvote");
        		div_id = '#downvote' + q_id;
		        $(div_id).html("Downvote");
		}

	})
	},
	    'click .downvoting': function () {
	var q_id = this._id;
	Meteor.call("downvote_question",q_id,function(error,result){
		if (result.downvoted){
			div_id = '#downvote' + q_id;
	                $(div_id).html("Downvoted");
		}else{
			div_id = '#downvote' + this._id;
		        $(div_id).html("Downvote");
		        div_id = '#upvote' + this._id;
		        $(div_id).html("Upvote");
		}
	})
        }
	
});
  Template.everyq.events({
        'click .answer': function () {
		div_id = '#anser' + this._id;
		$(div_id).show();
		div_id = '#answer' + this._id;
                $(div_id).removeClass('answer');
		$(div_id).addClass('answer_hide');
		}
		,    
	'click .answer_hide': function () {
                div_id = '#anser' + this._id;
                $(div_id).hide();
                div_id = '#answer' + this._id;
                $(div_id).addClass('answer');
                $(div_id).removeClass('answer_hide');
                }
		,
	'click .answer_edit': function () {
                div_id = '#anser' + this._id;
                $(div_id).show();
                div_id = '#answer_edit' + this._id;
                $(div_id).removeClass('answer_edit');
                $(div_id).addClass('answer_edit_hide');
		div_ans = '#edit_content_ans' + this._id;
		$(div_ans).hide();
                }
                ,
        'click .answer_edit_hide': function () {
                div_id = '#anser' + this._id;
                $(div_id).hide();
                div_id = '#answer_edit' + this._id;
                $(div_id).addClass('answer_edit');
                $(div_id).removeClass('answer_edit_hide');
		 div_ans = '#edit_content_ans' + this._id;
                $(div_ans).show();
                },
	'click .edit_content_answer': function () {
                div_id = '#anser' + this._id;
                $(div_id).hide();
                div_id = '#answer_edit' + this._id;
                $(div_id).addClass('answer_edit');
                $(div_id).removeClass('answer_edit_hide');
                 div_ans = '#edit_content_ans' + this._id;
                $(div_ans).show();
                }
		,
	'click .comment_ans': function () {
                div_id = '#comment' + this._id;
                $(div_id).show();
                div_id = '#comment_ans' + this._id;
                $(div_id).removeClass('comment_ans');
                $(div_id).addClass('comment_ans_hide');
		 div_id = '#comment_ansi' + this._id;
                $(div_id).removeClass('comment_ans');
                $(div_id).addClass('comment_ans_hide');
                }
		,
	'click .comment_ans_hide': function () {
                div_id = '#comment' + this._id;
                $(div_id).hide();
                div_id = '#comment_ans' + this._id;
                $(div_id).addClass('comment_ans');
                $(div_id).removeClass('comment_ans_hide');
		div_id = '#comment_ansi' + this._id;
                $(div_id).addClass('comment_ans');
                $(div_id).removeClass('comment_ans_hide');
                },
	'click .reply_comment': function () {
                div_id = '#commentreply' + this._id;
                $(div_id).show();
                div_id = '#reply_comment' + this._id;
                $(div_id).removeClass('reply_comment');
                $(div_id).addClass('reply_comment_hide');
                }
                ,
        'click .reply_comment_hide': function () {
                div_id = '#commentreply' + this._id;
                $(div_id).hide();
                div_id = '#reply_comment' + this._id;
                $(div_id).addClass('reply_comment');
                $(div_id).removeClass('reply_comment_hide');
                }
	
});
   

  Accounts.ui.config({

    passwordSignupFields: "USERNAME_AND_EMAIL"

  });
  
}
if (Meteor.isServer) {

	Meteor.startup(function () {
  UploadServer.init({
    tmpDir: process.env.PWD + '/.uploads/tmp',
    uploadDir: process.env.PWD + '/.uploads/',
    checkCreateDirectories: true //create the directories for you
  });
});
	Meteor.publish("questions", function (limit) {
		return QuestionsList.find({}, {sort: {created_at: -1},  fields: { text: 1, answers_ids: true, created_at:true, user:true, unique_q_id:1 } }, {limit:limit});
	});
	Meteor.publish("answers", function () {
                return AnswersList.find({}, { fields: { is_status:1, text:1, topic_id:1, ans: 1, comment_ids: true, created_at:true, question_id:true, u_id:true } });
        });
	Meteor.publish("comments", function () {
                return CommentsList.find({}, { fields: { comment: 1, commentreply_ids: true, created_at:true, answer_id:true, u_id:true } });
        });
	 Meteor.publish("replycomments", function () {
                return ReplyComment.find({}, { fields: { reply: 1, created_at:true, comment_id:true, u_id:true } });
        });
	Meteor.publish("users", function () {
//                return Meteor.users.find({}, { fields: { u_id: 1, user_name:true, profile.image_id: 1 } });
		return Meteor.users.find();
        });
	Meteor.publish("votes", function () {
                return Votes.find({}, { fields: { answer_id: 1, question_id: 1, comment_id:1, upvote:1, downvote:1, u_id:1 , is_seen:1, user_id:1} });
        });
	Meteor.publish("images", function () {
                return Images.find();
        });
	Meteor.publish("follow", function () {
                return FollowList.find();
        });
	  Meteor.publish("topic", function () {
                return TopicList.find();
        });
        Meteor.publish("topicanswers", function () {
                return TopicAnswersList.find();
        });
	 Meteor.publish("chatmessages", function () {
                return ChatMessage.find();
        });
	Meteor.publish("notifications", function () {
                return Notification.find();
        });

	Images.allow({
 	 'insert': function () {
    		// add custom authentication code here
	    return true;
	  },
	  'remove': function () {
                // add custom authentication code here
            return true;
          },
	 'update': function () {
                // add custom authentication code here
            return true;
          },
	  'download':function(){
   		 return true;
	  }
	});
	 Meteor.users.allow({
         'insert': function () {
                // add custom authentication code here
            return true;
          },
          'update': function () {
                // add custom authentication code here
            return true;
          }
        });

ServiceConfiguration.configurations.remove({
  service: "google"
});	
	ServiceConfiguration.configurations.insert({
  service: "google",
  clientId: "416834881013-jghvl5iln09ee83linvflhnurppph1f0.apps.googleusercontent.com",
  secret: "vZ2JW9CgjvXG2UPO33SMFUIB"
});

ServiceConfiguration.configurations.remove({
  service: "facebook"
});
        ServiceConfiguration.configurations.insert({
  service: "facebook",
  appId: "807503276021457",
  secret: "0143d8c75837d48eb45a6e38fdebf045"
});
	


}

//Questions = new Mongo.Collection('questions');
AnswersList = new Mongo.Collection('answers', {
 transform: function(doc) {
    doc.quesObj = QuestionsList.find({
      answers_id:  {$in: [doc._id]}
    });
    return doc;
  }

});
//AnswersList = new Mongo.Collection('answers');
Votes = new Mongo.Collection('votes');
CommentsList = new Mongo.Collection('comments')
ReplyComment = new Mongo.Collection('replycomments')

Router.configure({
    layoutTemplate: 'main'
});
Router.route('/login');
Router.route('/', {
    name: 'home',
    template: 'home',
     onAfterAction: function() {
      // The SEO object is only available on the client.
      // Return if you define your routes on the server, too.
      if (!Meteor.isClient) {
        //return;
      }
      SEO.config({
        title: "Topicerrati.com - Question and Quantify Everything",
        meta: {
          'description': "Social Network where we question and quantify everything"
        },
        og: {
          'title': "Topicerrati.com - Question and Quantify Everything",
          'description': "Social Network where we question and quantify everything",
	  'image': 'http://topicerrati.com/cfs/files/images/4BDWq25drBKRHBupD/Topicerrati.png',
	  'image:width':'200',
          'image:height':'200',
	   'image:type':'image/png',
           'image:url': 'http://www.topicerrati.com/cfs/files/images/4BDWq25drBKRHBupD/Topicerrati.png'

        }
	      ,
           fb: {
                'app_id':'807503276021457'
          }
      });
    },
    action : function () {
    if (this.ready()) {
        this.render();
    }
}

});

/*
Router.route('/change_password', {
    template: 'change_password',
     onAfterAction: function() {
      // The SEO object is only available on the client.
      // Return if you define your routes on the server, too.
      SEO.config({
        title: 'Topicerrati : Change Password ',
        meta: {
          'description': 'Change password for topicerrati'
        },
        og: {
          'title': 'Change Password',
          'description': 'Chnage Password for topicerrati'
        }
      });
    }

});
*/
Router.map(function() {
  return this.route('change_password', {
    path: '/change_password',
    template: 'change_password',
    onAfterAction: function() {
      // The SEO object is only available on the client.
      // Return if you define your routes on the server, too.
      if (!Meteor.isClient) {
        //return;
      }
      SEO.config({
        title: "Change Password at Topicerrati.com",
        meta: {
          'description': "Change Password at Topicerrati.com"
        },
        og: {
          'title': "Change Password at Topicerrati.com",
          'description': "Change Password at Topicerrati.com"
        }
      });
    },
    action : function () {
    if (this.ready()) {
        this.render();
    }
}
  });
});


Router.route('/question/:_id', {
    template: 'questionPage',
    data: function(){
        var q_id = this.params._id;
	return QuestionsList.findOne({ unique_q_id: q_id  },{
	 transform: function(doc) {
	 var index = 0;
        if (typeof doc.answers_ids !== 'undefined') {
                doc.answersObj = AnswersList.find({
                _id:  {$in: doc.answers_ids}
            }, {sort: {created_at: -1},transform: function(doc){
                        doc.countupVoteAnsObj = Votes.find({answer_id: doc._id,upvote:1})
                        doc.countdownVoteAnsObj = Votes.find({answer_id: doc._id,downvote:1})
                        doc.isupvotedans = Votes.find({answer_id: doc._id,upvote:1,u_id: Meteor.userId()})
                        doc.isdownvotedans = Votes.find({answer_id: doc._id,downvote:1,u_id: Meteor.userId()})
			doc.answer_user = Meteor.users.findOne({_id: doc.u_id})
			doc.is_answered = AnswersList.find({question_id: doc.question_id, u_id: Meteor.userId()})
			if (typeof doc.answer_user !== 'undefined'){
                                if (typeof doc.answer_user.profile !== 'undefined'){
                        doc.answer_user_image = Images.findOne({_id: doc.answer_user.profile.image_id})
                                }
                        }

        //              doc.commentsmulti = Comments.find({_id:  {$in: doc.comments_ids}})
                         if (typeof doc.comment_ids !== 'undefined') {
                                doc.commentsmulti = CommentsList.find({
                                _id:  {$in: doc.comment_ids}
                                },{sort: {created_at: -1},transform: function(doc){
                                  doc.countupVoteCommentObj = Votes.find({comment_id: doc._id,upvote:1})
                        doc.countdownVoteCommentObj = Votes.find({comment_id: doc._id,downvote:1})
                        doc.isupvotedcomment = Votes.find({comment_id: doc._id,upvote:1,u_id: Meteor.userId()})
                        doc.isdownvotedcomment = Votes.find({comment_id: doc._id,downvote:1,u_id: Meteor.userId()})
			doc.comment_user = Meteor.users.findOne({_id: doc.u_id})
			if (typeof doc.comment_user !== 'undefined'){
                                if (typeof doc.comment_user.profile !== 'undefined'){
                        doc.comment_user_image = Images.findOne({_id: doc.comment_user.profile.image_id})
                                }
                        }

				//CommentsReplies
				   if (typeof doc.commentreply_ids !== 'undefined') {
                                doc.commentsreplymulti =ReplyComment.find({
                                _id:  {$in: doc.commentreply_ids}
                                },{sort: {created_at: -1},transform: function(doc){
                                  doc.countupVoteCommentReplyObj = Votes.find({commentreply_id: doc._id,upvote:1})
	                        doc.countdownVoteCommentReplyObj = Votes.find({commentreply_id: doc._id,downvote:1})
        	                doc.isupvotedcommentreply = Votes.find({commentreply_id: doc._id,upvote:1,u_id: Meteor.userId()})
                	        doc.isdownvotedcommentreply = Votes.find({commentreply_id: doc._id,downvote:1,u_id: Meteor.userId()})
				doc.reply_user = Meteor.users.findOne({_id: doc.u_id})
					if (typeof doc.reply_user !== 'undefined'){
        		                        if (typeof doc.reply_user.profile !== 'undefined'){
                        			doc.reply_user_image = Images.findOne({_id: doc.reply_user.profile.image_id})
                                }
                        }

	                        return doc
}})
                        }

                        return doc
}})
                        }
                        return doc
                }
 });
        }
	doc.question_user = Meteor.users.findOne({_id: doc.user})
        doc.upvotesObj = Votes.find({question_id: doc._id, upvote: 1})
        doc.downvotesObj = Votes.find({question_id: doc._id, downvote: 1})
        doc.isupvoted = Votes.find({question_id: doc._id, upvote: 1, u_id: Meteor.userId()})
        doc.isdownvoted = Votes.find({question_id: doc._id, downvote: 1, u_id: Meteor.userId()})
        doc.is_answered = AnswersList.find({question_id: doc._id, u_id: Meteor.userId()})
	  if (typeof doc.question_user !== 'undefined'){
		if (typeof doc.question_user.profile !== 'undefined'){
        doc.question_user_image = Images.findOne({_id: doc.question_user.profile.image_id})
		}
        }

	return doc
	}
});
    },

 onAfterAction: function() {
      // The SEO object is only available on the client.
      // Return if you define your routes on the server, too.
      if (!Meteor.isClient) {
        //return;
      }
        var q_id = this.params._id
        dat = QuestionsList.findOne({unique_q_id:q_id})
        if (typeof dat !== 'undefined'){
      SEO.config({
        title: "Question: " + dat.text + " at Topicerrati.com",
        meta: {
          'description': "Question: " + dat.text +  " at Topicerrati.com"
        },
        og: {
          'title':  "Question: " + dat.text + " at Topicerrati.com",
          'description': "Question: " + dat.text +  " at Topicerrati.com",
	  'image': 'http://topicerrati.com/cfs/files/images/4BDWq25drBKRHBupD/Topicerrati.png?store=share'
        }
      });
        }
    },
  action : function () {
    if (this.ready()) {
        this.render();
    }
}


});
Router.route('/user/:_id', {
    template: 'userprofile',
    data: function(){
	var q_id = this.params._id;
	return Meteor.users.findOne({_id:q_id},{
         transform: function(doc) {
		doc.followers = FollowList.find({following_ids:q_id})
		doc.is_followed = FollowList.findOne({following_ids:q_id, u_id:Meteor.userId()})
		 doc.answersObj = AnswersList.find({u_id: q_id}, {sort: {created_at: -1},transform: function(doc){
                        doc.countupVoteAnsObj = Votes.find({answer_id: doc._id,upvote:1})
                        doc.countdownVoteAnsObj = Votes.find({answer_id: doc._id,downvote:1})
                        doc.isupvotedans = Votes.find({answer_id: doc._id,upvote:1,u_id: Meteor.userId()})
                        doc.isdownvotedans = Votes.find({answer_id: doc._id,downvote:1,u_id: Meteor.userId()})
                        doc.answer_user = Meteor.users.findOne({_id: doc.u_id})
			if (typeof doc.question_id !== 'undefined'){
			//Writing Code for question
			doc.question = QuestionsList.findOne({ _id: doc.question_id  })
				if (typeof doc.question !== 'undefined'){
				doc.question_user = Meteor.users.findOne({_id: doc.question.user})
			        doc.upvotesObj = Votes.find({question_id: doc.question._id, upvote: 1})
			        doc.downvotesObj = Votes.find({question_id: doc.question._id, downvote: 1})
			        doc.isupvoted = Votes.find({question_id: doc.question._id, upvote: 1, u_id: Meteor.userId()})
			        doc.isdownvoted = Votes.find({question_id: doc.question._id, downvote: 1, u_id: Meteor.userId()})
			        doc.is_answered = AnswersList.find({question_id: doc.question._id, u_id: Meteor.userId()})
			          if (typeof doc.question_user !== 'undefined'){
			                if (typeof doc.question_user.profile !== 'undefined'){
				        doc.question_user_image = Images.findOne({_id: doc.question_user.profile.image_id})
			                }
			        }
				}
			//Ending code for a question
                        doc.is_answered = AnswersList.find({question_id: doc.question_id, u_id: Meteor.userId()})
			}
                        if (typeof doc.answer_user !== 'undefined'){
                                if (typeof doc.answer_user.profile !== 'undefined'){
                        		doc.answer_user_image = Images.findOne({_id: doc.answer_user.profile.image_id})
                                }
                        }
			if (typeof doc.comment_ids !== 'undefined') {
                                doc.commentsmulti = CommentsList.find({  _id:  {$in: doc.comment_ids}
                                },{sort: {created_at: -1},transform: function(doc){
                                  doc.countupVoteCommentObj = Votes.find({comment_id: doc._id,upvote:1})
                        doc.countdownVoteCommentObj = Votes.find({comment_id: doc._id,downvote:1})
                        doc.isupvotedcomment = Votes.find({comment_id: doc._id,upvote:1,u_id: Meteor.userId()})
                        doc.isdownvotedcomment = Votes.find({comment_id: doc._id,downvote:1,u_id: Meteor.userId()})
                        doc.comment_user = Meteor.users.findOne({_id: doc.u_id})
                        if (typeof doc.comment_user !== 'undefined'){
                                if (typeof doc.comment_user.profile !== 'undefined'){
                        doc.comment_user_image = Images.findOne({_id: doc.comment_user.profile.image_id})  }                        }
			 if (typeof doc.commentreply_ids !== 'undefined') {
                                doc.commentsreplymulti =ReplyComment.find({   _id:  {$in: doc.commentreply_ids}
                                },{sort: {created_at: -1},transform: function(doc){
                                  doc.countupVoteCommentReplyObj = Votes.find({commentreply_id: doc._id,upvote:1})
                                doc.countdownVoteCommentReplyObj = Votes.find({commentreply_id: doc._id,downvote:1})
                                doc.isupvotedcommentreply = Votes.find({commentreply_id: doc._id,upvote:1,u_id: Meteor.userId()})
                                doc.isdownvotedcommentreply = Votes.find({commentreply_id: doc._id,downvote:1,u_id: Meteor.userId()})
                                doc.reply_user = Meteor.users.findOne({_id: doc.u_id})
                                        if (typeof doc.reply_user !== 'undefined'){
                                                if (typeof doc.reply_user.profile !== 'undefined'){
                                                doc.reply_user_image = Images.findOne({_id: doc.reply_user.profile.image_id}) } }
			return doc			}})}
			return doc			}})}
			return doc			}})
			return doc		}})},

	onAfterAction: function() {
      // The SEO object is only available on the client.
      // Return if you define your routes on the server, too.
      if (!Meteor.isClient) {
        //return;
      }
        var q_id = this.params._id
        dat = Meteor.users.findOne({_id:q_id})
        image =  Images.findOne({_id: Meteor.users.findOne({_id: q_id}).profile.image_id});
	if (typeof image !== 'undefined'){
	image_url = "http://topicerrati.com" + image.url().substring(0,image.url().lastIndexOf("?")) + '?store=share';
	}else{
	image_url = "http://topicerrati.com/cfs/files/images/4BDWq25drBKRHBupD/Topicerrati.png?store=share"
	}
        if (typeof dat !== 'undefined'){
      SEO.config({
        title: "User: " + dat.username + " at Topicerrati.com",
        meta: {
          'description': "User: " + dat.username +  " at Topicerrati.com"
        },
        og: {
          'title':  "User: " + dat.username + " at Topicerrati.com",
          'description': "User: " + dat.username +  " at Topicerrati.com",
	  'image' : 'http://topicerrati.com/cfs/files/images/4BDWq25drBKRHBupD/Topicerrati.png?store=share',
	  'image:width':'200',
          'image:height':'200',
	   'image:type':'image/png',
           'image:url': 'http://www.topicerrati.com/cfs/files/images/4BDWq25drBKRHBupD/Topicerrati.png?store=share'

        }
	      ,
           fb: {
                'app_id':'807503276021457'
          }
      });
        }
    },
   action : function () {
    if (this.ready()) {
        this.render();
    }
}

});
Router.route('/topic/:_id', {
    template: 'topic',
    data: function(){ var q_id = this.params._id;
        return TopicList.findOne({unique_q_id:q_id},{
	 transform: function(doc) {
		doc.topicanswers = AnswersList.find({topic_id:doc._id},{sort:{created_at:-1},
		transform: function(doc){ doc.countupVoteAnsObj = Votes.find({answer_id: doc._id,upvote:1})
                        doc.countdownVoteAnsObj = Votes.find({answer_id: doc._id,downvote:1})
                        doc.isupvotedans = Votes.find({answer_id: doc._id,upvote:1,u_id: Meteor.userId()})
                        doc.isdownvotedans = Votes.find({answer_id: doc._id,downvote:1,u_id: Meteor.userId()})
                        doc.answer_user = Meteor.users.findOne({_id: doc.u_id})
                        if (typeof doc.question_id !== 'undefined'){
                        doc.is_answered = AnswersList.find({question_id: doc.question_id, u_id: Meteor.userId()})    }
                        if (typeof doc.answer_user !== 'undefined'){
                                if (typeof doc.answer_user.profile !== 'undefined'){
                                        doc.answer_user_image = Images.findOne({_id: doc.answer_user.profile.image_id})    }  }
                        if (typeof doc.comment_ids !== 'undefined') {
                                doc.commentsmulti = CommentsList.find({  _id:  {$in: doc.comment_ids}
                                },{sort: {created_at: -1},transform: function(doc){
                                  doc.countupVoteCommentObj = Votes.find({comment_id: doc._id,upvote:1})
                        doc.countdownVoteCommentObj = Votes.find({comment_id: doc._id,downvote:1})
                        doc.isupvotedcomment = Votes.find({comment_id: doc._id,upvote:1,u_id: Meteor.userId()})
                        doc.isdownvotedcomment = Votes.find({comment_id: doc._id,downvote:1,u_id: Meteor.userId()})
                        doc.comment_user = Meteor.users.findOne({_id: doc.u_id})
                        if (typeof doc.comment_user !== 'undefined'){
                                if (typeof doc.comment_user.profile !== 'undefined'){
                        doc.comment_user_image = Images.findOne({_id: doc.comment_user.profile.image_id})  }                        }
                         if (typeof doc.commentreply_ids !== 'undefined') {
                                doc.commentsreplymulti =ReplyComment.find({   _id:  {$in: doc.commentreply_ids}
                                },{sort: {created_at: -1},transform: function(doc){
                                  doc.countupVoteCommentReplyObj = Votes.find({commentreply_id: doc._id,upvote:1})
                                doc.countdownVoteCommentReplyObj = Votes.find({commentreply_id: doc._id,downvote:1})
                                doc.isupvotedcommentreply = Votes.find({commentreply_id: doc._id,upvote:1,u_id: Meteor.userId()})
                                doc.isdownvotedcommentreply = Votes.find({commentreply_id: doc._id,downvote:1,u_id: Meteor.userId()})
                                doc.reply_user = Meteor.users.findOne({_id: doc.u_id})
                                        if (typeof doc.reply_user !== 'undefined'){
                                                if (typeof doc.reply_user.profile !== 'undefined'){
                                                doc.reply_user_image = Images.findOne({_id: doc.reply_user.profile.image_id}) } }
                        return doc                      }})}
                        return doc                      }})}
                        return doc                      }})
                doc.followers = FollowList.find({following_topic_ids:doc._id})
                doc.is_followed = FollowList.findOne({following_topic_ids:doc._id, u_id:Meteor.userId()})
                return doc
}})
},
 onAfterAction: function() {
      // The SEO object is only available on the client.
      // Return if you define your routes on the server, too.
      if (!Meteor.isClient) {
        //return;
      }
	var q_id = this.params._id
	//console.log(q_id)
	dat = TopicList.findOne({unique_q_id:q_id})
	if (typeof TopicList.findOne({unique_q_id: q_id}) !== 'undefined' && typeof TopicList.findOne({unique_q_id: q_id}).topic_image_id !== 'undefined'){
	 image =  Images.findOne({_id: TopicList.findOne({unique_q_id: q_id}).topic_image_id});
	}
        if (typeof image !== 'undefined'){
        image_url = "http://topicerrati.com" + image.url().substring(0,image.url().lastIndexOf("?")) + '?store=share'
	}else{
        image_url = "http://topicerrati.com/cfs/files/images/4BDWq25drBKRHBupD/Topicerrati.png?store=share"
        }
	if (typeof dat !== 'undefined'){
      SEO.config({
        title: dat.title + " at Topicerrati.com",
        meta: {
          'description': "Discuss " + dat.title +  " at Topicerrati.com"
        },
        og: {
          'title': dat.title + " at Topicerrati.com",
          'description': "Discuss " + dat.title +  " at Topicerrati.com",
	  'image': image_url,
	  'image:width':'200',
          'image:height':'200',
	 'image:type':'image/png',
         'image:url': image_url

        }
	      ,
           fb: {
                'app_id':'807503276021457'
          }
      });
	}
    },
	action : function () {
    if (this.ready()) {
        this.render();
    }
}

});


Meteor.methods({
addChat: function (hash) {
// Make sure the user is logged in before inserting a task
if (! Meteor.userId()) {
throw new Meteor.Error("not-authorized");
}
ChatMessage.insert({from:Meteor.userId(),to:hash["to_message"],message:hash["message"],created_at:new Date(),is_seen:0})
},
updateChat: function (hash) {
if (! Meteor.userId()) {
throw new Meteor.Error("not-authorized");
}
  unread_messages = ChatMessage.find({from: hash["to_message"], to:Meteor.userId(), is_seen:0}).fetch()
//alert(JSON.stringify(ids))
  
  for (i =0 ;i <= unread_messages.length;i++) {
if (typeof unread_messages[i] !== 'undefined'){
ChatMessage.update(unread_messages[i]._id,{$set:{"is_seen": 1}})
}
}
},
upload_profile_pic: function (fileObj_id) {
                Meteor.users.update({_id:Meteor.userId()}, {$set:{"profile.image_id": fileObj_id}})

},
upload_cover_pic: function (fileObj_id) {
                Meteor.users.update({_id:Meteor.userId()}, {$set:{"profile.cover_image_id": fileObj_id}})

},
upload_topic_pic: function (topicid,fileObj_id) {
                TopicList.update({_id:topicid}, {$set:{"topic_image_id": fileObj_id}})

},
userfollow: function(q_id) {
        found = FollowList.findOne({following_ids:q_id, u_id: Meteor.userId(),is_topic:0})
        found_u_id = ""
        following = []
                if (found == null ){
                        found_up = FollowList.findOne({u_id: Meteor.userId(),is_topic:0})
                        if (found_up != null ){
                                found_u_id = found_up._id;
                        }else{
                                FollowList.insert({following_ids:[], u_id: Meteor.userId(),is_topic:0}, function(err,docsInserted){
                                found_u_id = docsInserted.toString()
                          })
                        }
                        found_up = FollowList.findOne({u_id: Meteor.userId(),is_topic:0})
                        if (found_up == null){
                                following = [q_id]
                        }else{
                                following = found_up.following_ids

                                following.push(q_id)
                        }

                        FollowList.update(found_up._id,{$set:{following_ids: following}})
                        already_nof = Notification.findOne({u_id:q_id,follower_id:Meteor.userId(),is_topic:0,is_unfollowed:1,is_userfollow:1,is_f_notify:1})
                        if (already_nof == null){
                        Notification.insert({u_id:q_id,follower_id:Meteor.userId(),is_seen:0,is_unfollowed:0,is_type:"user_follow",is_topic:0,created_at:new Date(),is_userfollow:1,is_f_notify:1})
                        }else{
                                Notification.update(already_nof._id,{$set:{is_unfollowed:0}})
                        }
			hash ={'unfollow':true,'follow':false}
                        return hash;
                }else{
                        found_u_id = found._id;
                        var following = found.following_ids
			 following.pop(q_id)
                        FollowList.update(found._id,{$set:{following_ids: following}})
                        notify_del = Notification.findOne({u_id:q_id,follower_id:Meteor.userId(),is_userfollow:1,is_f_notify:1})
                        if (notify_del != null){
                                Notification.update(notify_del._id,{$set:{is_unfollowed:1}})
                        }
			hash ={'follow':true,'unfollow':false}
                        return hash;
                }


},
	topic_create: function(hash){
			 TopicList.insert({title:hash.topic
                                ,u_id:Meteor.userId(),created_at:new Date(),unique_q_id:hash.unique_q_id
                                }, function(err,docsInserted){
                                var id = docsInserted;
                        });

		},

	topicfollow: function(q_id) {
	 found = FollowList.findOne({following_topic_ids:q_id, u_id: Meteor.userId(),is_topic:1})
   	found_u_id = ""
        following = []
        if (found == null ){
                found_up = FollowList.findOne({u_id: Meteor.userId(),is_topic:1})
                        if (found_up != null ){
                        found_u_id = found_up._id;
                        }else{
                        FollowList.insert({following_topic_ids:[], u_id: Meteor.userId(),is_topic:1}, function(err,docsInserted){
                        found_u_id = docsInserted.toString()
                        })
                        }
                        found_up = FollowList.findOne({u_id: Meteor.userId(),is_topic:1})
                                if (found_up == null){
                                var following = [q_id]
                                }else{
                                        if(typeof found_up.following_topic_ids == 'undefined'){
                                        following = []
                                        }else{
                                         following = found_up.following_topic_ids
                                        }
                                following.push(q_id)
                                }
        FollowList.update(found_up._id,{$set:{following_topic_ids: following}})
	topic = TopicList.findOne({_id:q_id})
        user_id = topic.u_id
        already_nof = Notification.findOne({u_id:user_id,follower_id:Meteor.userId(),is_topic:1,is_unfollowed:1,is_f_notify:1})
                if (already_nof == null){
                Notification.insert({u_id:user_id,follower_id:Meteor.userId(),is_seen:0,is_unfollowed:0,is_type:"topic",notify_id:topic.unique_q_id,created_at:new Date(),is_f_notify:1})
                }else{
                Notification.update(already_nof._id,{$set:{is_unfollowed:0}})
                }
		hash ={'unfollow':true,'follow':false}
                        return hash;
         //div_id = '#follow' + q_id;
         //$(div_id).html("Unfollow");
	 }else{
        found_u_id = found._id;
        var following = found.following_topic_ids
        following.pop(q_id)
        FollowList.update(found._id,{$set:{following_topic_ids: following}})
        user_id = TopicList.findOne({_id:q_id}).u_id
         notify_del = Notification.findOne({u_id:user_id,follower_id:Meteor.userId(),is_topic:1,is_f_notify:1})
                        if (notify_del != null){
                                Notification.update(notify_del._id,{$set:{is_unfollowed:1}})
                        }
			hash ={'follow':true,'unfollow':false}
                        return hash;
        }


	},

	create_topic_post: function(hash) {
	if ((typeof hash.is_status !== 'undefined') && (hash.is_status == 1)){
	AnswersList.insert({text:hash.text,topic_id:hash.topic_id,created_at:new Date(),u_id:Meteor.userId(),is_status:1})	
	}else
	{
	AnswersList.insert({text:hash.text,topic_id:hash.topic_id,created_at:new Date(),u_id:Meteor.userId()})
	}
	},
	
	question_ask: function(hash) {
	 QuestionsList.insert({
                text: hash.question,
                unique_q_id: hash.question.toLowerCase().replace(/[^A-Za-z0-9 ]/g,'').replace(/\s{2,}/g,' ').replace(/\s/g, "-"),
                user: Meteor.userId(),
                answer_ids: [],
                created_at: new Date()})

	},
	
	add_answer: function(q_id, answer) {
	thiselement = QuestionsList.findOne({_id:q_id})
	var q_id = thiselement._id;
        var q_text = thiselement.text;
        var q_date = thiselement.created_at
        var q_unique = thiselement.unique_q_id
        var q_user = thiselement.user
	 if (thiselement.answers_ids != null){
        var q_answer_ids = thiselement.answers_ids;
        }else{
        var q_answer_ids = [];
        }
        found = AnswersList.findOne({u_id:Meteor.userId(), question_id: thiselement._id})
        if (found==null){
        AnswersList.insert({
                ans: answer,
                question_id: thiselement._id,
                u_id: Meteor.userId(),
                created_at: new Date(),
                comment_ids: [],
    },  function(err,docsInserted){
        q_answer_ids.push(docsInserted)
        QuestionsList.update({_id: q_id}, {text: q_text, answers_ids: q_answer_ids, created_at: q_date, unique_q_id:q_unique, user:q_user})
        Notification.insert({u_id:q_user,follower_id:Meteor.userId(),is_seen:0,is_unfollowed:0,is_topic:0,is_type:"answer",notify_id:docsInserted,created_at:new Date(),is_f_notify:0})
        });
	hash = {edit:false,add:true}
	return hash
	/*         div_id = '#answer' + thiselement._id;
        $(div_id).hide();
        div_id = '#anser' + thiselement._id;
        $(div_id).hide();
*/
        }else{
                var created_at = found.created_at;
                var comment_ids = found.comment_ids;
                AnswersList.update({_id:found._id},{ans: answer, question_id: thiselement._id, u_id: Meteor.userId(), created_at: created_at, comment_ids:comment_ids})
		hash = {edit:true,add:false}
		return hash
                /*div_id = '#anser' + thiselement._id;
                $(div_id).hide();
                div_id = '#answer_edit' + thiselement._id;
                $(div_id).addClass('answer_edit');
                $(div_id).removeClass('answer_edit_hide');*/
        }

	
	},

	edit_answer: function(q_id,answer) {
		ans_or_post = AnswersList.findOne({_id:q_id})
		if(typeof ans_or_post.is_status !== 'undefined' && ans_or_post.is_status == 1){
		AnswersList.update(q_id,{$set:{"text": answer}})
		}else{
		AnswersList.update(q_id,{$set:{"ans": answer}})
		}
	},
	comment_insert: function(q_id,comment) {
	thiselement = AnswersList.findOne({_id:q_id})	
	//console.log(thiselement)
	if (typeof thiselement.topic_id == 'undefined'){
	console.log("m here")
	var q_id = thiselement._id;
        var q_text = thiselement.ans;
        var q_date = thiselement.created_at
        var q_uid = thiselement.u_id
        var q_qid = thiselement.question_id
        if (this.comment_ids != null){
        var q_comment_ids = thiselement.comment_ids;
        }else{
        var q_comment_ids = [];
        }
        CommentsList.insert({
                comment: comment,
                answer_id: thiselement._id,
                u_id: Meteor.userId(),
                created_at: new Date(),
                commentreply_ids: [],
    },  function(err,docsInserted){
        q_comment_ids.push(docsInserted)
        AnswersList.update({_id: q_id}, {ans: q_text, comment_ids: q_comment_ids, created_at: q_date, u_id:q_uid, question_id:q_qid })
        Notification.insert({u_id:q_uid,follower_id:Meteor.userId(),is_seen:0,is_unfollowed:0,is_topic:0,is_type:"comment",notify_id:docsInserted,created_at:new Date(),is_f_notify:0})
        });
	}else{
	 var q_id = thiselement._id;
        var q_text = thiselement.text;
        var q_date = thiselement.created_at
        var q_uid = thiselement.u_id
        var q_qid = thiselement.topic_id
        if (this.comment_ids != null){
        var q_comment_ids = thiselement.comment_ids;
        }else{
        var q_comment_ids = [];
        }
        CommentsList.insert({
                comment: comment,
                answer_id: thiselement._id,
                u_id: Meteor.userId(),
                created_at: new Date(),
                commentreply_ids: [],
    },  function(err,docsInserted){
        q_comment_ids.push(docsInserted)
	if (typeof thiselement.is_status !== 'undefined'){
        AnswersList.update({_id: q_id}, {text: q_text, comment_ids: q_comment_ids, created_at: q_date, u_id:q_uid, topic_id:q_qid, is_status: 1 })
	}else{
	AnswersList.update({_id: q_id}, {text: q_text, comment_ids: q_comment_ids, created_at: q_date, u_id:q_uid, topic_id:q_qid })
	}
        Notification.insert({u_id:q_uid,follower_id:Meteor.userId(),is_seen:0,is_unfollowed:0,is_topic:0,is_type:"comment",notify_id:docsInserted,created_at:new Date(),is_f_notify:0})
        });


	}

	},

	reply_insert: function(q_id,commentreply) {
	//console.log(q_id)
	thiselement = CommentsList.findOne({_id:q_id})
	console.log(thiselement)
	 var q_id = thiselement._id;
        var q_answer_id = thiselement.answer_id;
        var q_date = thiselement.created_at
        var q_uid = thiselement.u_id
        var q_comment = thiselement.comment
        if (thiselement.commentreply_ids != null){
        var q_commentreply_ids = thiselement.commentreply_ids;
        }else{
        var q_commentreply_ids = [];
        }
        ReplyComment.insert({
                reply: commentreply,
                comment_id: q_id,
                u_id: Meteor.userId(),
                created_at: new Date(),
    },  function(err,docsInserted){
        q_commentreply_ids.push(docsInserted)
        CommentsList.update({_id: q_id}, {comment: q_comment, commentreply_ids: q_commentreply_ids, created_at: q_date, u_id:q_uid, answer_id:q_answer_id })
        Notification.insert({u_id:q_uid,follower_id:Meteor.userId(),is_seen:0,is_unfollowed:0,is_topic:0,is_type:"reply",notify_id:docsInserted,created_at:new Date(),is_f_notify:0})
        });

	},

	upvote_answer: function (q_id) {
	thiselement = AnswersList.findOne({_id:q_id})	
	found = Votes.findOne({answer_id: q_id, u_id: Meteor.userId(), upvote:1})
        if (found == null ){
        found_up = Votes.findOne({answer_id: q_id, u_id: Meteor.userId()})
        if (found_up != null ){
        found_u_id = found_up._id;
        Votes.remove({_id: found_u_id})
        }
        Votes.insert({
                createdAt: new Date(),
                upvote: 1,
                answer_id: q_id,
                u_id: Meteor.userId(),
                is_seen:0,
                user_id:thiselement.u_id,
            },function(err,docsInserted){
                Notification.insert({u_id:thiselement.u_id,follower_id:Meteor.userId(),is_seen:0,is_unfollowed:0,is_type:"user_answer_upvote",notify_id:docsInserted,is_topic:0,created_at:new Date(),is_f_notify:0})
        });
	hash ={upvoted:true}
	return hash
        }else{
        found_u_id = found._id;
        Votes.remove({_id: found_u_id})
	hash ={upvoted:false}
        return hash
        }
	},

	downvote_answer : function (q_id) {
	thiselement = AnswersList.find({_id:q_id})
	found_vote = Votes.findOne({answer_id: q_id, u_id: Meteor.userId(),downvote: 1})
        if (found_vote == null ){
           found_down = Votes.findOne({answer_id: q_id, u_id: Meteor.userId()})
          if (found_down != null ){
           found_u_id = found_down._id;
           Votes.remove({_id: found_u_id})
        }
           Votes.insert({
                createdAt: new Date(),
                downvote: 1,
                answer_id: q_id,
                u_id: Meteor.userId(),
                is_seen:0,
                user_id:thiselement.u_id,
    },function(err,docsInserted){
                Notification.insert({u_id:thiselement.u_id,follower_id:Meteor.userId(),is_seen:0,is_unfollowed:0,is_type:"user_answer_downvote",notify_id:docsInserted,is_topic:0,created_at:new Date(),is_f_notify:0})
        });
        hash ={downvoted:true}
        return hash

	}else{
        found_u_id = found_vote._id;
        Votes.remove({_id: found_u_id})
        hash ={downvoted:false}
        return hash
	}


	},

	upvote_comment: function(q_id) {
	thiselement = CommentsList.findOne({_id:q_id})
	found = Votes.findOne({comment_id: q_id, u_id: Meteor.userId(), upvote:1})
        if (found == null ){
        found_up = Votes.findOne({comment_id: q_id, u_id: Meteor.userId()})
        if (found_up != null ){
        found_u_id = found_up._id;
        Votes.remove({_id: found_u_id})
        }
        Votes.insert({
                createdAt: new Date(),
                upvote: 1,
                comment_id: q_id,
                u_id: Meteor.userId(),
                is_seen:0,
                user_id:thiselement.u_id,
    },function(err,docsInserted){
                Notification.insert({u_id:thiselement.u_id,follower_id:Meteor.userId(),is_seen:0,is_unfollowed:0,is_type:"user_comment_upvote",notify_id:docsInserted,is_topic:0,created_at:new Date(),is_f_notify:0})
        });
	hash = {upvoted:true}
	return hash
        }else{
        found_u_id = found._id;
        Votes.remove({_id: found_u_id})
	hash = {upvoted:false}
	return hash
        }
	},
	downvote_comment: function(q_id) {
	thiselement = CommentsList.findOne({_id:q_id})
	found_vote = Votes.findOne({comment_id: q_id, u_id: Meteor.userId(),downvote: 1})
        if (found_vote == null ){
           found_down = Votes.findOne({comment_id: q_id, u_id: Meteor.userId()})
          if (found_down != null ){
           found_u_id = found_down._id;
           Votes.remove({_id: found_u_id})
        }
           Votes.insert({
                createdAt: new Date(),
                downvote: 1,
                comment_id: q_id,
                u_id: Meteor.userId(),
                is_seen:0,
                user_id:thiselement._id,
    },function(err,docsInserted){
                Notification.insert({u_id:thiselement.u_id,follower_id:Meteor.userId(),is_seen:0,is_unfollowed:0,is_type:"user_comment_downvote",notify_id:docsInserted,is_topic:0,created_at:new Date(),is_f_notify:0})
        });
	hash = {downvoted:true}
        return hash
	}else{
        found_u_id = found_vote._id;
        Votes.remove({_id: found_u_id})
	hash = {downvoted:false}
	return hash
        }

	},

	upvote_question: function(q_id) {
	thiselement =  QuestionsList.findOne({_id:q_id}) 
        found = Votes.findOne({question_id: q_id, u_id: Meteor.userId(), upvote:1})
        if (found == null ){
        found_up = Votes.findOne({question_id: q_id, u_id: Meteor.userId()})
        if (found_up != null ){
        found_u_id = found_up._id;
        Votes.remove({_id: found_u_id})
        }
        Votes.insert({
                createdAt: new Date(),
                upvote: 1,
                question_id: q_id,
                u_id: Meteor.userId(),
                is_seen:0,
                user_id :thiselement.user,
    },function(err,docsInserted){
                Notification.insert({u_id:thiselement.user,follower_id:Meteor.userId(),is_seen:0,is_unfollowed:0,is_type:"user_question_upvote",notify_id:docsInserted,is_topic:0,created_at:new Date(),is_f_notify:0})
        });
	hash = {upvoted:true}
	return hash

        }else{
        found_u_id = found._id;
        Votes.remove({_id: found_u_id})
	hash = {upvoted:false}
	return hash
        }
	},

	downvote_question: function(q_id) {
	thiselement =  QuestionsList.findOne({_id:q_id})
	 found_vote = Votes.findOne({question_id: q_id, u_id: Meteor.userId(),downvote: 1})
        if (found_vote == null ){
           found_down = Votes.findOne({question_id: q_id, u_id: Meteor.userId()})
          if (found_down != null ){
           found_u_id = found_down._id;
           Votes.remove({_id: found_u_id})
        }
           Votes.insert({
                createdAt: new Date(),
                downvote: 1,
                question_id: q_id,
                u_id: Meteor.userId(),
                is_seen:0,
                user_id : thiselement.user,
    },function(err,docsInserted){
                Notification.insert({u_id:thiselement.user,follower_id:Meteor.userId(),is_seen:0,is_unfollowed:0,is_type:"user_question_downvote",notify_id:docsInserted,is_topic:0,created_at:new Date(),is_f_notify:0})                
        });
	hash = {downvoted:true}
	return hash
        }else{
        found_u_id = found_vote._id;
        Votes.remove({_id: found_u_id})
	hash = {downvoted:false}
	return hash
        }
	},

	remove_notification: function(q_id){
		Notification.update(q_id,{$set:{is_seen:1}})
	},
	remove_message_notification: function(q_id){
                ChatMessage.update(q_id,{$set:{is_seen:1}})
        },

	create_default_fields: function(){
	Meteor.users.update({_id:Meteor.userId()}, {$set:{"profile.occupation": '',"profile.skills": '',"profile.bio": '',"profile.birthdate": '',"profile.location": ''}})
	},
	update_user_profile: function(text,attr){
	var attr = JSON.stringify(attr)
	var text = JSON.stringify(text)
	Meteor.users.update({_id:Meteor.userId()}, {$set:{attr:text}})
	},
	 update_user_profile: function(hash){
        Meteor.users.update({_id:Meteor.userId()}, {$set:hash})
        }

});
