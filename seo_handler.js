Meteor.startup(function() {
    if (Meteor.isClient) {
        return SEO.config({
            title: 'Topicerrati.com - Question and Quantify Everything',
            meta: {
                'description': 'Social Network where we question and quantify everything'
            },
            og: {
                'image': '' 
           }
        });
    }
});
