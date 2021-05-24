$(function(){
	$('.header-slider').loopslider({
		visibleItems: 1
		,step: 1
		,autoplay: true
		,autoplayInterval:5000
		,slideDuration: 800
		,pagination: true
		,navigation: true
	});
	$('.parallax-slider').loopslider({
		visibleItems: 1
		,pagination: true
		,navigation: true
		,parallax: {
			e: '>*'
			,index: .8
		}
	});
	$('.slider').loopslider({
		autoplay: false
		,visibleItems: 4
		,step: 3
		,gap: 30
		,slideDuration: 600
		,easing: 'easeOutSine'
		,prevButton: '#prev'
		,nextButton: '#next'
		,stopButton: '#stop'
		,playButton: '#play'
		,stopOnHover: true
		,responsive: {
			480: {visibleItems: 1,step: 1}
			,760: {visibleItems: 3,step: 3}
			,1000: {visibleItems: 4,step: 3}}
		,onPlay: function(){
			$('#play').prop('disabled',true);
			$('#stop').prop('disabled',false);
			$.notify({message: 'start playing'},{type: 'success',delay: 3000,placement: {from: 'bottom',align: 'right'}});
		}
		,onStop: function(){
			$('#play').prop('disabled',false);
			$('#stop').prop('disabled',true);
			$.notify({message: 'stopped'},{type: 'danger',delay: 3000,placement: {from: 'bottom',align: 'right'}});
		}
		,onMove: function(i,$e,direction){
			$.notify({message: 'moved '+direction+': #'+i},{type: 'info',delay: 3000,placement: {from: 'bottom',align: 'right'}});
		}
	});
	
	
$(document).ready(function(){
    $("#NAV-Click").click(function(){
        $("#Nave-Open-bar").slideToggle("slow");
    });
});
	
$(document).ready(function(){
    $("#NAV-Click2").click(function(){
        $("#Nave-Open-bar2").slideToggle("slow");
    });
});
	
	
	
	
	
	
	
});



