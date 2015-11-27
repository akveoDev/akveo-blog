/*
*	AFTERTYPE DYNAWIDGETS
*
*	This plugin helps to serve Aftertype.com functionality. 
*	Specifically, to interpret users widget configuration 
*	and render the widgets on sidebars and/or footer.
*
*	If you need help don't hesitate to ask for help 
*	at aftertype.com/community
*
*	v1.0.0
*	Copyright (c) 2015 */

define([], function(){
	// Dynamic widget insertion functions
	// ====================================================
	var dribbble_insert_shot = function (spot, url, teaser){
			var to_insert = '<a href="'+url+'" target="_blank" class="grid-img" style="background-image:url('+teaser+');"></a>';
			$(spot+' .pics-container').append(to_insert);
		},
		flickr_insert_photo = function (spot, url, src){
			var to_insert = '<a href="'+url+'" target="_blank" class="grid-img" style="background-image:url('+src+');"></a>';
			$(spot+' .pics-container').append(to_insert);
		},
		instagram_insert_photo = function (spot, url, src){
			var to_insert = '<a href="'+url+'" target="_blank" class="grid-img" style="background-image:url('+src+');"></a>';
			$(spot+' .pics-container').append(to_insert);
		},
		widget_spot_renders = {
			dribbble: function (_dribbble){
				$('#dyna-spot-'+_dribbble.spot).addClass('gridding').append('<h5>'+_dribbble.label+'</h5><div class="pics-container"></div>');

				$.ajax({
					type: 'GET',
					cache: true,
					url: 'http://api.dribbble.com/players/'+_dribbble._id+'/shots',
					dataType: 'jsonp'
				}).done(function (res){
					var shots = res.shots.slice(0,6);
					$.each(shots, function (key, val){
						dribbble_insert_shot('#dyna-spot-'+_dribbble.spot, val.url, val.image_teaser_url);
					});
				}).fail(function (){
					console.log('Dribbble API not responding');
				});
			},
			flickr: function (_flickr){
				$('#dyna-spot-'+_flickr.spot).addClass('gridding').append('<h5>'+_flickr.label+'</h5><div class="pics-container"></div>');

				$.getJSON('http://api.flickr.com/services/feeds/photos_public.gne?id='+_flickr._id+'&format=json&jsoncallback=?',
				function (data){
					var photos = data.items.slice(0,6);
					$.each(photos, function (key, val){
						flickr_insert_photo('#dyna-spot-'+_flickr.spot, val.link, val.media.m);
					});
				});
			},
			instagram: function (_instagram){
				$('#dyna-spot-'+_instagram.spot).addClass('gridding').append('<h5>'+_instagram.label+'</h5><div class="pics-container"></div>');

				$.ajax({
					type: 'GET',
					cache: true,
					url: 'https://api.instagram.com/v1/users/'+_instagram._id+'/media/recent/?client_id='+_instagram._clientId,
					dataType: 'jsonp'
				}).done(function (res){
					var photos = res.data.slice(0,6);
					$.each(photos, function (key, val){
						instagram_insert_photo('#dyna-spot-'+_instagram.spot, val.link, val.images.low_resolution.url);
					});
				}).fail(function (){
					console.log('Instagram API not respnding');
				});
			}
		}

	// Dyna Render function to parse user configuration
	// ====================================================
	var _dynarender = function(_config){
		// Render Spots
		$.each(_config._areas, function (key, val){
			var dynaarea = $('[data-dynaarea_name="'+val.name+'"]');
			$.each(val.spots, function (k, v){
				dynaarea.append('<div id="dyna-spot-'+v+'" class="dyna-spot"></div>');
			});
		});

		$.each(_config._widgets, function (key, data){
			if (!data.active) { return false; };
			widget_spot_renders[data.type](data);
		});

	};

	// Export Dyna Render function
	// ====================================================
	return _dynarender;
});