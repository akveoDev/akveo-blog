/*
*	AFTERTYPE DYNACOMMENTS
*
*	Commenting Systems.
*	Simple helper to organize and diplay the choosen method for comments.
*
*	v1.0.0
*	Copyright (c) 2015 */

define([], function(){
	var commentSystems = {
		disqus: function(shortname){
			$('#dynacomments').html('<div id="disqus_thread"></div>');
			var disqus_shortname = shortname,
				disqus_identifier = $('#dynacomments').data('backuseid');

			var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
			dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
			(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
		},
		livefyre: function(liID){
			$('#dynacomments').html('<div id="livefyre-comments"></div>');
			var articleId = fyre.conv.load.makeArticleId(null);
			fyre.conv.load({}, [{
				el: 'livefyre-comments',
				network: "livefyre.com",
				siteId: liID,
				articleId: articleId,
				signed: false,
				collectionMeta: {
					articleId: articleId,
					url: fyre.conv.load.makeCollectionUrl(),
				}
			}], function() {});
		},
		facebook: function(appID){
			if ($('#fb-root').length == 0) {
				$('body').append('<div id="fb-root"></div>');
			};
			var currentPage = window.location.href;

			(function(d, s, id) {
				var js, fjs = d.getElementsByTagName(s)[0];
				if (d.getElementById(id)) return;
				js = d.createElement(s); js.id = id;
				js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.4&appId="+appID;
				fjs.parentNode.insertBefore(js, fjs);
			}(document, 'script', 'facebook-jssdk'));

			$('#dynacomments').html('<div class="fb-comments" data-href="'+currentPage+'" data-numposts="5"></div>');
		}
	}
	return commentSystems;
});