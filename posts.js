if (Meteor.isClient) {
Template.everypost.events({
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
    'click .add_post': function(event){
        event.preventDefault();
        var div_id = '#dat_' + this._id;
        //var answer = UniHTML.purify($(div_id).html());
//      var answer = $(div_id).html().replace(new RegExp(('contenteditable=\"true\"'), ''), replace); 
        var answer = $(div_id).summernote('code');
        //$(div_id).summernote('destroy');
//      var answer = $(div_id).html().replace(/contenteditable=\"true\"/g,'')
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
		div_id = '#edit_content_ans'+q_id;
		$(div_id).show();
                })
        }
})
}
