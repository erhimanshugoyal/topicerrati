Meteor.startup(function() {
    if (Meteor.isClient) {
        return SEO.config({
            title: 'Topicerrati.com - Question and Quantify Everything',
            meta: {
                'description': 'Social Network where we question and quantify everything'
            },
            og: {
               'image': 'http://topicerrati.com/cfs/files/images/4BDWq25drBKRHBupD/Topicerrati.png?store=share',
		'image:width':'200',
		'image:height':'200',
		'image:type':'image/png',
		'image:url': 'http://topicerrati.com/cfs/files/images/4BDWq25drBKRHBupD/Topicerrati.png?store=share'
           }
		,
	   fb: {
		'app_id':'807503276021457'
	  }
        });
    }
});
