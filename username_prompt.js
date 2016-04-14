if (Meteor.isClient) {
var templateName = 'prompt_username'
var usernameKey             = templateName+'_username'
var usernameErrorKey        = templateName+'_usernameError'
var occupiedUsernamesKey    = templateName+'_occupiedUsernames'
Template[templateName].created = function(){

                Session.setDefault(usernameKey, "")
		Session.setDefault(occupiedUsernamesKey, [])
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
}

 Template[templateName].helpers({
                usernameError: function(){
                        return Session.get(usernameErrorKey)
                },
		  isAnythingWrong: function(){
                        return !(Session.equals(usernameErrorKey , "") )
                }

})
Template[templateName].events({
		'keyup #prompt_username_username': function(event, template){
                        var username = event.currentTarget.value
                        Session.set(usernameKey, username)
                },
		'submit form': function(event, template){

                        event.preventDefault()

                        var username = Session.get(usernameKey)
			Meteor.call("setusername",username, function(error){
                                if(error){
					switch(error.reason){
                                                case "Username already exists.":
                                                        var occupiedUsernames = Session.get(occupiedUsernamesKey)
                                                        occupiedUsernames.push(username)
                                                        Session.set(occupiedUsernamesKey, occupiedUsernames)
                                                break
                                                default:
                                                        Session.set(usernameErrorKey, "Unknown error reason '"+error.reason+"'. This is a bug, please report it.")
                                        }

				}else{
				Modal.hide()
				}})
}})
}
