Meteor.startup(function() {
    if (Meteor.isClient) {
        return SEO.config({
            title: 'Topicerrati.com - Question and Quantify Everything',
            meta: {
                'description': 'Social Network where we question and quantify everything'
            },
            og: {
               'image': 'https://s3-ap-southeast-1.amazonaws.com/topicerrati/share/images/Topicerrati.png',
		'image:width':'200',
		'image:height':'200',
		'image:type':'image/png',
		'image:url': 'https://s3-ap-southeast-1.amazonaws.com/topicerrati/share/images/Topicerrati.png'
           }
		,
	   fb: {
		'app_id':'807503276021457'
	  }
        });
    }
});
