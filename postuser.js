if (Meteor.isClient) {
Template.postuser.emoticons = function () {
return (Meteor.settings.public.coreEmoticons);
}

Template.postuser.postfiles = function () {
		 if (typeof Meteor.userId() !== 'undefined'){
      		  return Images.find({_id: Meteor.users.findOne({_id: Meteor.userId()}).profile.image_id});
       		 }
}

Template.postuser.helpers({
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
Template.postuser.events({
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
		  if(Meteor.userId() == null){
                Modal.show("modal_signIn")
                return
       		 }
                Meteor.call("create_topic_post",hash, function (error, result) {
                        $('#textarea').val('');
                })
        },
 'click #emot_show': function(event, template) {
        $("#emoticon_id").toggle();
  },
 'click .image_emoticons' : function(event,template) {
 $('#textarea').val($('#textarea').val() + " "+ this.replacements[0] + " ")
  $("#emoticon_id").toggle();
  }
	

})
}
