hexo.extend.generator.register('articles_stats', function(locals) {
  var stats = [];
  
  locals.posts.sort('-date').each(function(post) {
    var content = post.content || '';
    var wordCount = content.replace(/<[^>]*>/g, '').replace(/\s/g, '').length;
    var imgCount = (content.match(/<img/g) || []).length;
    
    stats.push({
      title: post.title,
      link: '/' + post.path,
      words: wordCount,
      images: imgCount,
      date: post.date.format('YYYY-MM-DD')
    });
  });
  
  return {
    path: 'api/articles_stats.json',
    data: JSON.stringify(stats)
  };
});
