if (Meteor.isClient) {
        var templateName = 'change_password'
	var oldpasswordKey            = templateName+'_old_password'
	var oldpasswordErrorKey       = templateName+'_old_passwordError'
	var newpasswordKey            = templateName+'_new_password'
        var newpasswordErrorKey       = templateName+'_new_passwordError'
        var confirmnewpasswordKey            = templateName+'_confirm_new_password'
        var confirmnewpasswordErrorKey       = templateName+'_confirm_new_passwordError'
	
Template[templateName].created  = function(){
	
		Session.setDefault(oldpasswordKey, "")
		Session.setDefault(newpasswordKey, "")
                Session.setDefault(confirmnewpasswordKey, "")
		
		this.autorun(function(computation){
                        if(Session.equals(oldpasswordKey, "")){
                                Session.set(oldpasswordErrorKey, "This field can't be blank.")
                        }else{
                                var password0 = Session.get(oldpasswordKey)
                                        Session.set(oldpasswordErrorKey, "")
                        }
                })

           // Validate newpassword0.
                this.autorun(function(computation){
                        if(Session.equals(newpasswordKey, "")){
                                Session.set(newpasswordErrorKey, "You can't have an empty password.")
                        }else{
                                var password0 = Session.get(newpasswordKey)
                                if(password0.length <= 5){
                                        Session.set(newpasswordErrorKey, "The password needs to be a bit longer.")
                                }else{
                                        Session.set(newpasswordErrorKey, "")
                                }
                        }
                })

                // Validate newpassword1.
                this.autorun(function(computation){
                        var password0 = Session.get(newpasswordKey)
                        var password1 = Session.get(confirmnewpasswordKey)
                        if(password0 == password1){
                                Session.set(confirmnewpasswordErrorKey, "")
                        }else{
                                Session.set(confirmnewpasswordErrorKey, "This password is not the same as the first.")
                        }
                })

}

Template[templateName].helpers({
		oldpassword: function(){
                        return Session.get(oldpasswordKey)
                },
                oldpasswordError: function(){
                        return Session.get(oldpasswordErrorKey)
                },
                newpassword: function(){
                        return Session.get(newpasswordKey)
                },
                newpasswordError: function(){
                        return Session.get(newpasswordErrorKey)
                },
                confirmnewpassword: function(){
                        return Session.get(confirmnewpasswordKey)
                },
                confirmnewpasswordError: function(){
                        return Session.get(confirmnewpasswordErrorKey)
                },
                isAnythingWrongPwChange: function(){
                        return !(Session.equals(newpasswordErrorKey, "") &&
                                                Session.equals(confirmnewpasswordErrorKey, ""))
                }
        })

Template[templateName].events({
		'keyup #old_password': function(event, template){
                        var password0 = event.currentTarget.value
                        Session.set(oldpasswordKey, password0)
                },

		'keyup #new_password': function(event, template){
                        var password0 = event.currentTarget.value
                        Session.set(newpasswordKey, password0)
                },

                'keyup #confirm_new_password': function(event, template){
                        var password1 = event.currentTarget.value
                        Session.set(confirmnewpasswordKey, password1)
                },
		
		 'click #submit_user_change_pasword': function(event, template){

                        event.preventDefault
			var oldPassword = $('#old_password').val()
                        var newPassword = Session.get(confirmnewpasswordKey)
//			Meteor.call("change_password",oldPassword, newPassword)
			Accounts.changePassword(oldPassword, newPassword, function(error){
			if (error) {
				Session.set(oldpasswordErrorKey,error.reason)
			}else{
			Router.go('/')
			Meteor.logout();
			}
		
			})
		}
})
}
