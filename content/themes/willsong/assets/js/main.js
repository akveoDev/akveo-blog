/*
*	MAIN JS FILE for Willsong Ghost Theme
*
*	If you want to edit, add or remove any functionality
*	feel free to contact the author marcos@aftertype.com
*
*	Require.js is used for performance optimization,
*	call the required scripts on context
*	and execute extra Services.
*/

requirejs.config({
	paths: {
		userConfig: 'config',
		velocity: '//cdn.jsdelivr.net/velocity/1.1.0/', //jquery.velocity.min & velocity.ui.min.
		fitvids: '//cdn.jsdelivr.net/fitvids/1.1.0/jquery.fitvids',
		prettify: '//cdn.jsdelivr.net/prettify/0.1/prettify',
		livefyre: '//zor.livefyre.com/wjs/v3.0/javascripts/livefyre',
		adds: 'adds'
	}
});

requirejs(
[
	'userConfig',
	'velocity/velocity.min',
	'fitvids'
],
function (_uconfig){
// ===============================
// Start User Config.
// ===============================
if (_uconfig._userCustomScripts.length > 0) {
	require(_uconfig._userCustomScripts, function(){});
};

// ===============================
// Define recurrernt vars.
// ===============================
var _window = $(window),
	_body = $('body'),
	_topMenu = $('#top-menu-wsong'),
	_mobileMenuBtn = $('#mobile-menu-btn-wsong'),
	_mobileMenuIcon = $('#mobile-menu-btn-wsong span'),
	_inPostContent = $('#in-post-content'),
	_inPostImage = $('#in-post-content img'),
	_cTemplate = '';

// ===============================
// Get current template
// ===============================
if (_body.hasClass('home-template')) {_cTemplate = 'home'};
if (_body.hasClass('post-template')) {_cTemplate = 'post-page'};

// ===============================
// DynaWidgets
// ===============================
if (_uconfig.widgetsConfig._active) {
require(['adds/dynawidgets'], function (dynarender){
	dynarender( _uconfig.widgetsConfig );
});
};

// ===============================
// SocialProfiles
// ===============================
if (_uconfig.socialProfiles._active) {
	$.each(_uconfig.socialProfiles.items, function (key, profile){
		var sLink = '<a href="'+profile.url+'" class="fa fa-'+profile.site+'"></a>';
		$('#dynasocial-links').append(sLink);
	});
};

// ===============================
// Comments System
// ===============================
if (_uconfig.commentsSystem._active) {
	require(['adds/dynacomments'], function (dynacomments){	
		if (_uconfig.commentsSystem.type == 'disqus') {
			dynacomments.disqus(_uconfig.commentsSystem.idOrShortname);
		};

		if (_uconfig.commentsSystem.type == 'livefyre') {
			require(['livefyre'], function (){
				dynacomments.livefyre(_uconfig.commentsSystem.idOrShortname);		
			});
		};

		if (_uconfig.commentsSystem.type == 'facebook') {
			dynacomments.facebook(_uconfig.commentsSystem.appID);
		};
	});
} else {
	$('#dynacomments').remove();
};


// ===============================
// Parallax
// ===============================

// Element Schemas to parallax
var scrollTop = _window.scrollTop(),
	homeHeadHeight = $('#inside-head-wsong').height() + 134,
	blogCover = {
		alias: $('#inside-head-cover-wsong'),
		slowness: 0.4
	},
	diffElems = {
		alias: $('.diffuse-elements'),
		slowness: 0.5
	};

// Functions to run the parallax
function updateParallax(){
	window.requestAnimationFrame(function(){
		setScrollTops();
		animateElements();
	});
}

function setScrollTops() {
	scrollTop = _window.scrollTop();
}

function animateElements() {
	blogCover.alias.css({
		'opacity' : 0.2 + ( 0.8 * (scrollTop / homeHeadHeight)),
		'padding-top' : scrollTop * blogCover.slowness
	});
	diffElems.alias.css({
		'opacity' : 1 - (scrollTop / homeHeadHeight)
	});
}

// Run Parallax
scrollIntervalID = setInterval(updateParallax, 10);

// ===============================
// Mobile Menu
// ===============================
_mobileMenuBtn.click(function (){
	_topMenu.toggleClass('mmenushow');
	_mobileMenuBtn.toggleClass('giro');
	_mobileMenuIcon.toggleClass('fa-reorder fa-times');
});

// ===============================
// Styling Helpers
// ===============================
if (_cTemplate = 'post-page') {
	_inPostImage.each(function (index){
		if($(this).width() < 656){
			$(this).addClass('small-image');
		};
	});

	require(['fitvids'], function(){
		$('#in-post-content').fitVids();
	});
	
	require(['prettify'], function(){
		$('pre').addClass('prettyprint');
		prettyPrint();
	});
};

});