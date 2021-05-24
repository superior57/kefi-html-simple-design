/**
 * LoopSlider
 * @version 0.2
 * @author Pavel Khoroshkov aka pgood
 * @link https://github.com/pgooood/loopslider
 */
(function($){$.fn.loopslider=function(options){
 
 	options = $.extend({
		htmlSliderWraper:'<div class="loopslider"></div>'
		,htmlSliderBody:'<div class="loopslider-body"></div>'
		,htmlItemWraper:'<div class="loopslider-item-wraper"></div>'
		,htmlPaginationContainer:'<div class="loopslider-pagination"></div>'
		,htmlPaginationItem:'<div></div>'
		,visibleItems:3
		,slideDuration:400
		,easing:'swing'
		,responsive:false
		,touchSupport:true
		,autoplay:false
		,stopOnHover:false
		,autoplayInterval:3000
		,fullscreen:false
		,parallax:null
		,prevButton:null
		,nextButton:null
		,stopButton:null
		,playButton:null
		,gap:0
		,step:1
		,pagination:false
		,navigation:false
		,onStop:null
		,onPlay:null
		,onMove:null
	},options);
	
	options.gap = parseInt(options.gap);
	options.gap = !isNaN(options.gap) && options.gap > 0 ? options.gap : 0;
	options.visibleItems = options.visibleItems > 0 ? parseInt(options.visibleItems) : 1;
	options.step = parseInt(options.step);
	options.step = isNaN(options.step) || options.step < 1
				? 1 : (options.step > options.visibleItems ? options.visibleItems : options.step);
	if(options.parallax){
		if(typeof(options.parallax) != 'object'){
			options.parallax = {e: '>*',index: 1};
		}else{
			if(!options.parallax.e)
				options.parallax.e = '>*';
			if(isNaN(parseFloat(options.parallax.index)))
				options.parallax = null;
		}
	}

	var sliders = [],isPlaying;
	
	function wrap($container){
		var slider = {
			$e: $(options.htmlSliderBody).appendTo($(options.htmlSliderWraper).width('100%')).width('1000%')
			,$items: function(){return this.$e.find('>*');}
			,$currentItem: function(){return this.$e.find('>*:first-child');}
			,currentIndex: function(){return this.$currentItem().data('index');}
		};
		$container.find('>*').each(function(i){
			$(options.htmlItemWraper)
				.append(this)
				.appendTo(slider.$e)
				.data('index',i);
		});
		$container.append(slider.$e.parent());
		slider.length = slider.$items().length;
		return slider;
	};
	
	function init(slider,index){
		var $win = $(window)
			,width = slider.$e.parent().width();
		slider.itemWidth = (width - options.gap * (options.visibleItems - 1)) / options.visibleItems;
		if(slider.arInvisible && slider.arInvisible.length)
			slider.$e.append(slider.arInvisible);
		slider.arInvisible = [];
		var $items = slider.$items();
		$items.css({
			'margin-right': ((options.gap > 0 ? options.gap * 100 / width : 0) / 10).toFixed(3) + '%'
			,'width': ((slider.itemWidth * 100 / width) / 10).toFixed(3) + '%'
		});
		if(slider.enabled = slider.length > options.visibleItems){
			$items.each(function(i,e){
				if(i >= options.visibleItems)
					slider.arInvisible.push(e);
			});
			$(slider.arInvisible).detach();
		};
		if(options.fullscreen){
			var resizeHandler = function(evt){
				slider.$e.parent().height($win.height());
			};
			resizeHandler();
			$win.off('resize.loopslider')
				.on('resize.loopslider',resizeHandler);
			slider.$e.parent().addClass('loopslider-fullscreen');
		}
		if(options.parallax){
			$win.off('scroll.loopslider'+index)
				.on('scroll.loopslider'+index,function(){
					var scrollTop = $(window).scrollTop()
						,$items = slider.$items()
						,top = $items.offset().top
						,handler = function(){
							var $e = $(this).find(options.parallax.e);
							$e.css('background-position-y',(scrollTop - top) * options.parallax.index);
							$e.addClass('loopslider-parallax-container');
						};
					$items.each(handler);
					$(slider.arInvisible).each(handler);
				});
		};
		return slider;
	};
	
	function pagination(){
		$(sliders).each(function(){
			var slider = this
				,numPages = Math.ceil(slider.length / options.visibleItems)
				,$e = $(options.htmlPaginationContainer)
				,$eCont = $e.hasClass('loopslider-pagination') ? $e : $e.find('.loopslider-pagination');
			if(slider.$pagination)
				slider.$pagination.parent().remove();
			if(!slider.enabled)
				return true;
			for(var i = 0; i < numPages; i++)
				$(options.htmlPaginationItem)
					.appendTo($eCont)
					.addClass('loopslider-page-nav-item')
					.click(function(i){return function(){moveTo(i*options.visibleItems);};}(i));
			$e.insertAfter(slider.$e.parent());
			slider.$pagination = $e.find('.loopslider-page-nav-item');
			activatePageNavItem(slider);
		});
	};
	
	
	function addSvgButton(name,$container){
		if(!$('#loopslider-sprite').length)
			$('body').get(0).insertAdjacentHTML('afterbegin'
				,'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="loopslider-sprite" style="display:none">'
					+'<symbol id="loopslider-prev-icon" viewBox="0 0 50 50"><path d="M27.3 34.7L17.6 25l9.7-9.7 1.4 1.4-8.3 8.3 8.3 8.3z"/></symbol>'
					+'<symbol id="loopslider-next-icon" viewBox="0 0 50 50"><path d="M22.7 34.7l-1.4-1.4 8.3-8.3-8.3-8.3 1.4-1.4 9.7 9.7z"/></symbol>'
				+'</svg>');
		var href = window.location.pathname+window.location.search+'#loopslider-'+name+'-icon';
			$e = $('<div class="loopslider-nav-button loopslider-'+name+'-button"></div>');
		$e.appendTo($container)
			.get(0)
			.insertAdjacentHTML('afterbegin','<svg><use xlink:href="'+href+'"/></svg>');
		return $e;
	};
	
	function navigation(){
		$(sliders).each(function(){
			var slider = this
				,$img = slider.$e.find('img')
				,setHeight = function(){
					var h = slider.$e.parent().height() / 2;
					slider.prevButton.css('top',h - slider.prevButton.height()/2);
					slider.nextButton.css('top',h - slider.nextButton.height()/2);
				};
			if(!slider.prevButton)
				slider.prevButton = addSvgButton('prev',slider.$e.parent())
					.click(function(){prev();});
			if(!this.nextButton)
				this.nextButton = addSvgButton('next',slider.$e.parent())
					.click(function(){next();});
			setHeight();
			$img.on('load',setHeight);
		});
	};
	
	function activatePageNavItem(slider){
		if(slider.$pagination){
			slider.$pagination.removeClass('loopslider-active');
			slider.$pagination.eq(Math.round(slider.currentIndex() / options.visibleItems)).addClass('loopslider-active');
		};
	};
	
	function prev(step){
		step = step || options.step;
		$(sliders).each(function(){
			var slider = this,$items;
			if(slider.enabled && !slider.motion){
				stop();
				slider.motion = true;
				for(var i = 0; i < step; i++)
					$(slider.arInvisible.pop()).prependTo(slider.$e);
				slider.$e.css('left',((slider.itemWidth + options.gap) * -step));
				slider.$e.animate({left: 0},options.slideDuration,options.easing,function(){
					for(var i = 0; i < step; i++){
						$items = slider.$items();
						slider.arInvisible.unshift($items.get($items.length-1));
						$items.eq($items.length-1).detach();
					};
					slider.motion = false;
					activatePageNavItem(slider);
					if(isPlaying)
						play();
					if(typeof(options.onMove) === 'function')
						options.onMove(slider.currentIndex(),slider.$currentItem().find('>*:first-child'),'backward');
				});
			};
		});
		return false;
	};
	
	function next(step){
		step = step || options.step;
		$(sliders).each(function(){
			var slider = this,$items;
			if(slider.enabled && !slider.motion){
				stop();
				slider.motion = true;
				for(var i = 0; i < step; i++)
					$(slider.arInvisible.shift()).appendTo(slider.$e);
				slider.$e.animate({left: ((slider.itemWidth + options.gap) * -step)},options.slideDuration,options.easing,function(){
					for(var i = 0; i < step; i++){
						$items = slider.$items();
						slider.arInvisible.push($items.get(0));
						$items.eq(0).detach();
					};
					slider.$e.css('left',0);
					slider.motion = false;
					activatePageNavItem(slider);
					if(isPlaying)
						play();
					if(typeof(options.onMove) === 'function')
						options.onMove(slider.currentIndex(),slider.$currentItem().find('>*:first-child'),'forward');
				});
			};
		});
		return false;
	};
	
	function moveTo(index){
		index = parseInt(index);
		if(isNaN(index)) return;
		$(sliders).each(function(){
			var slider = this
				,pos = slider.$currentItem().data('index')
				,v1 = index - pos
				,v2 = slider.length - pos + index
				,v3 = slider.length - index + pos;
			if(index >= slider.length || index == pos)
				return true;
			if(Math.abs(v1) < v2 && Math.abs(v1) < v3){
				if(v1 > 0) next(v1);
				else prev(Math.abs(v1));
			}else if(v2 < v3) next(v2);
			else prev(v3);
		});
	};
	
	function play(){
		stop();
		$(sliders).each(function(){
			var slider = this;
			if(slider.enabled && options.autoplayInterval > options.slideDuration)
				slider.autoplayIntervalId = window.setInterval(function(){next();},options.autoplayInterval);
		});
	};
	
	function stop(){
		$(sliders).each(function(){
			var slider = this;
			if(slider.autoplayIntervalId){
				window.clearInterval(slider.autoplayIntervalId);
				slider.autoplayIntervalId = null;
			};
		});
	};
	
	function autoplay(){
		play();
		isPlaying = true;
		if(typeof(options.onPlay) === 'function')
			options.onPlay();
	};
	
	function touchEvents(){
		$(sliders).each(function(){
			var el = this.$e.get(0)
				,startX
				,startY
				,threshold = 100 //required min distance traveled to be considered swipe
				,allowedTime = 1000 //maximum time allowed to travel that distance
				,startTime;
			if(!el.addEventListener)return;
			el.addEventListener('touchstart',function(event){
				var o = event.changedTouches[0];
				startX = o.pageX;
				startY = o.pageY;
				startTime = new Date().getTime();
			},false);
			el.addEventListener('touchend', function(e){
				var o = e.changedTouches[0]
					,elapsedTime = new Date().getTime() - startTime
					,dist = Math.abs(o.pageX - startX);
				if(allowedTime >= elapsedTime && dist >= threshold && dist >= Math.abs(o.pageY - startY))
					o.pageX - startX > 0 ? prev() : next();
			},false);
		});
	};
	
	function initAll(){
		stop();
		$(sliders).each(function(){
			this.$e.stop(true,true);
		});
		if(options.responsive){
			var windowWidth = parseInt($(window).width())
				,width = Number.MAX_SAFE_INTEGER;
			for(var w in options.responsive)
				if(parseInt(w) >= windowWidth && parseInt(w) < parseInt(width))
					width = w;
			if(options.responsive[width])
				$.extend(options,options.responsive[width]);
		};
		$(sliders).each(function(i){
			init(this,i);
		});
		if(options.navigation)
			navigation();
		if(options.pagination)
			pagination();
		if(isPlaying)
			play();
	};
	
	$(this).each(function(){
		sliders.push(wrap($(this)));
	});
	
	initAll();
	
	$(window).resize(initAll);
	$(options.nextButton).click(function(){next();return false;});
	$(options.prevButton).click(function(){prev();return false;});
	$(options.playButton).click(function(){autoplay();return false;});
	$(options.stopButton).click(function(){
		stop();
		isPlaying = false;
		if(typeof(options.onStop()) === 'function')
			options.onStop();
		return false;
	});
	
	if(options.touchSupport)
		touchEvents();
	
	if(options.autoplay)
		autoplay();
	
	if(options.stopOnHover){
		$(this).mouseenter(function(){
			if(isPlaying)
				stop();
		});
		$(this).mouseleave(function(){
			if(isPlaying)
				play();
		});
	};
	
};}(jQuery));
