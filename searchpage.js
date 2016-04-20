if (Meteor.isClient) {
Template.searchPage.helpers({

files  : function () {
        if (typeof this._id !== 'undefined'){
        return Images.find({_id: TopicList.findOne({_id: this._id}).topic_image_id});
        }
},

 colorcode: function() {
Colors = {};
Colors.names = {
    aqua: "#00ffff",
    azure: "#f0ffff",
    beige: "#f5f5dc",
    black: "#000000",
    blue: "#0000ff",
    brown: "#a52a2a",
    cyan: "#00ffff",
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgrey: "#a9a9a9",
    darkgreen: "#006400",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
    darkred: "#8b0000",
    darksalmon: "#e9967a",
    darkviolet: "#9400d3",
    fuchsia: "#ff00ff",
    gold: "#ffd700",
    green: "#008000",
    indigo: "#4b0082",
    khaki: "#f0e68c",
    lightblue: "#add8e6",
    lightcyan: "#e0ffff",
    lightgreen: "#90ee90",
    lightgrey: "#d3d3d3",
    lightpink: "#ffb6c1",
    lightyellow: "#ffffe0",
    lime: "#00ff00",
    magenta: "#ff00ff",
    maroon: "#800000",
    navy: "#000080",
    olive: "#808000",
    orange: "#ffa500",
    pink: "#ffc0cb",
    purple: "#800080",
    violet: "#800080",
    red: "#ff0000",
    silver: "#c0c0c0",
    yellow: "#ffff00"
};
    var result;
    var count = 0;
    for (var prop in Colors.names)
        if (Math.random() < 1/++count)
           result = prop;
    return '#337AB7';
}
})

Template.searchPage.shareData =  function(){
        if(typeof this.title !== 'undefined'){
         q_id = TopicList.findOne({unique_q_id: this.unique_q_id})
        if (typeof TopicList.findOne({unique_q_id: q_id}) !== 'undefined' && typeof TopicList.findOne({unique_q_id: q_id}).topic_image_id !== 'undefined'){
         image =  Images.findOne({_id: TopicList.findOne({unique_q_id: q_id}).topic_image_id});
        }
        if (typeof image !== 'undefined'){
        image_url = "https://s3-ap-southeast-1.amazonaws.com/topicerrati/share/" + image.copies.shares3.key
        }else{
        image_url = "https://s3-ap-southeast-1.amazonaws.com/topicerrati/share/images/Topicerrati.png"
        }

        return { title: this.title, description: 'Discuss '+  this.title + ' at Topicerrati.com', image:image_url}
        }

         if(typeof this.text !== 'undefined'){
        if(typeof this.answer_user_image !== 'undefined'){
        image = this.answer_user_image
        image_url = "https://s3-ap-southeast-1.amazonaws.com/topicerrati/share/" + image.copies.shares3.key
        }else{
        image_url = 'https://s3-ap-southeast-1.amazonaws.com/topicerrati/share/images/Topicerrati.png'
        }
        return { title: Template.parentData().title, description:'' + this.answer_user.username +": " + $(this.text).text() + ' at Topicerrati.com ' , image:image_url}
                }

}
Template.searchPage.events({
        'click .follow': function () {
        var q_id = this._id;
         if(Meteor.userId() == null){
                Modal.show("modal_signIn")
                return
        }
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

        }
})

}
