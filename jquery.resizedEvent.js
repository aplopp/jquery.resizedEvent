( function( $, window ){
	var $window = $(window);
	var id = 0;
	$.fn.resizedEvent = function( options ){
		var that = this;
		var dataKey = 'resizedEvent';

		var defaults = {
			breakpoints: { // these correspond to bootstrap's breakpoints by default
				lg : 1200,
				md : 992,
				sm : 768,
				xs : 480,
				xxs: 0
			},
			interval: 100 // throttle speed of resized event
		};
		this.each( function(){
			id++;
			var $el = $(this);
			// if its already been initialized, then merge in any new options and halt
			if( $el.data( dataKey ) ){
				var data = $el.data( dataKey );
				data.settings = $.extend( data.settings, options );
				$el.data( dataKey, data );
				return $el;
			// otherwise, merge options and do all initial setup.
			} else {
				var data = {
					id: id
				};
				var settings = $.extend( defaults, options );
				data.settings = settings;
				$el.data( dataKey, {
					settings: settings
				});
			}
			var last_width = false;
			var last_height = false;
			var last_breakpoint = false;
			var current_width = $el.outerWidth();
			var current_height = $el.outerHeight();
			var current_breakpoint = getBreakpoint();

			function getBreakpoint(){
				for ( breakpoint in settings.breakpoints ){
					if ( current_width > settings.breakpoints[ breakpoint ] ){
						return breakpoint;
					}
				}
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

			var handlePossibleResize = function(){
				last_width = current_width;
				last_height = current_height;
				last_breakpoint = current_breakpoint;
				current_width = that.outerWidth();
				current_height = that.outerHeight();
				current_breakpoint = getBreakpoint();
				var info = {
					breakpoint: current_breakpoint,
					h: current_height,
					w: current_width,
					from: {
						breakpoint: last_breakpoint,
						h: last_height,
						w: last_width,
					},
					changed: {
						w: horizontalHasChanged(),
						h: verticalHasChanged(),
						breakpoint: breakpointHasChanged()
					}
				};
				if ( info.changed.h || info.changed.w ){
					$el.triggerHandler( 'resized', info );
					if ( info.changed.w ){ $el.triggerHandler( 'resized-w', info ); }
					if ( info.changed.h ){ $el.triggerHandler( 'resized-h', info ); }
				}
			}
			$window.unbind( 'resize.el-'+data.id );
			$window.on( 'resize.el-'+data.id, $.throttle( settings.interval, handlePossibleResize ));
		});
		// $window.on( 'load', handlePossibleResize );
		return this;
	}
}( jQuery, window ) );