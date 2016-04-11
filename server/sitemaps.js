sitemaps.add('/sitemap.xml', function() {
  // required: page
  // optional: lastmod, changefreq, priority, xhtmlLinks, images, videos
	arrhash = []
	alltopic = TopicList.find().fetch()
        for (i = 0;i < alltopic.length; i++) {
            arrhash.push({ page: '/topic/'+alltopic[i].unique_q_id, lastmod: new Date() })
        }
	allquestion = QuestionsList.find().fetch()
        for (i = 0;i < allquestion.length; i++) {
            arrhash.push({ page: '/topic/'+allquestion[i].unique_q_id, lastmod: new Date() })
        }
  return arrhash;
});
