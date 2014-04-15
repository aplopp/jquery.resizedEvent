( function( $, window ){
	$.fn.resizedEvent = function( options ){
		var dataKey = 'resizedEvent';
		var that = this;
		var defaults = {
			breakpoints: { // these correspond to bootstrap's breakpoints
				lg : 1200,
				md : 992,
				sm : 768,
				xs : 480,
				xxs: 0
			},
			interval: 200
		};
		// if its already been initialized, then merge in any new options and halt
		if( this.data( dataKey ) ){
			var data = this.data( dataKey );
			data.settings = $.extend( data.settings, options );
			this.data( dataKey, data );
			return;
		// otherwise, merge options and do all initial setup.
		} else {
			var data = {};
			var settings = $.extend( defaults, options );
			data.settings = settings;
			this.data( dataKey, {
				settings: settings
			});
		}
		var last_width = false;
		var last_height = false;
		var last_breakpoint = false;
		var current_width = this.width();
		var current_height = this.height();
		var current_breakpoint = getBreakpoint();

		function updateBreakpoint(){
			for ( breakpoint in settings.breakpoints ){
				if ( current_width > settings.breakpoints[ breakpoint ] ){
					return breakpoint;
				}
			}
		}
		function getBreakpoint(){
			return current_breakpoint;
		}
		function getWidth(){
			return current_width ;
		}
		function breakpointHasChanged(){
			return last_breakpoint !== current_breakpoint ;
		}
		function horizontalHasChanged(){
			return last_width !== current_width ;
		}
		function verticalHasChanged(){
			return last_height !== current_height ;
		}
		this.on( 'resize', $.debounce( settings.interval, function(){
			last_width = current_width;
			current_width = that.width();
			last_height = current_height;
			current_height = that.height();
			last_breakpoint = current_breakpoint;
			current_breakpoint = updateBreakpoint();
			var changed = {
				w: horizontalHasChanged(),
				h: verticalHasChanged(),
				breakpoint: breakpointHasChanged(),
				from: {
					breakpoint: last_breakpoint,
					width: last_width,
				},
				to: {
					breakpoint: current_breakpoint,
					width: current_width
				}
			};
			if ( changed.h || changed.w ){ that.trigger( 'resized', changed ); }
			// convenience events
			if ( changed.w ){ that.trigger( 'resized-w', changed ); }
			if ( changed.h ){ that.trigger( 'resized-h', changed ); }
			if ( changed.breakpoint ){
				that.trigger( 'resized-breakpoint', changed );
				that.trigger( 'resized-from-' + changed.from.breakpoint, changed );
				that.trigger( 'resized-to-' + changed.to.breakpoint, changed );
				that.trigger( 'resized-' + changed.from.breakpoint + '-to-' + changed.to.breakpoint, changed );
			}
		} ));

		// handle for all non-window items
		if ( ! $.isWindow( this ) ){
			$(window).on( 'resize', $.throttle( settings.interval, function(){
				that.trigger( 'resize' );
			} ));
		}
		return this;
	}
}( jQuery, window ) );