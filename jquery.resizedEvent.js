/*
 * jQuery throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function(b,c){var $=b.jQuery||b.Cowboy||(b.Cowboy={}),a;$.throttle=a=function(e,f,j,i){var h,d=0;if(typeof f!=="boolean"){i=j;j=f;f=c}function g(){var o=this,m=+new Date()-d,n=arguments;function l(){d=+new Date();j.apply(o,n)}function k(){h=c}if(i&&!h){l()}h&&clearTimeout(h);if(i===c&&m>e){l()}else{if(f!==true){h=setTimeout(i?k:l,i===c?e-m:e)}}}if($.guid){g.guid=j.guid=j.guid||$.guid++}return g};$.debounce=function(d,e,f){return f===c?a(d,e,false):a(d,f,e!==false)}})(this);

// once the throttle debounce plugin is loaded...
( function( $, window ){
	var $window = $(window);
	var id = 0;
	var datakey = 'resizedevent';
	var defaults = {
		interval: 200 // throttle speed of resized event
	};
	function ResizingElement( $el, args ){
		this.$el = $el;
		this.id = ++id;

		this.settings = $.extend({}, defaults, args );
		
		this._currentWidth = this._prevWidth = this.getWidth();
		this._currentHeight = this._prevHeight = this.getHeight();
		if ( $el[0] !== window ){
			$window.resizedEvent();
			$window.on( 'resized.resizedEvent-'+this.id, this.handleResize.bind(this));
		} else {
			$window.on( 'resize.resizedEvent', $.throttle( this.settings.interval, false, this.handleResize.bind(this) ));
		}
	}

	ResizingElement.prototype.getWidth = function(){
		return this.$el.outerWidth();
	};
	ResizingElement.prototype.getHeight = function(){
		return this.$el.outerHeight();
	};
	ResizingElement.prototype.widthHasChanged = function(){
		return this._prevWidth !== this._currentWidth;
	};
	ResizingElement.prototype.heightHasChanged = function(){
		return this._prevHeight !== this._currentHeight;
	};
	ResizingElement.prototype.handleResize = function(){
		this._prevWidth = this._currentWidth;
		this._prevHeight = this._currentHeight;
		this._currentWidth = this.getWidth();
		this._currentHeight = this.getHeight();
		this.triggerEvents();
	}
	ResizingElement.prototype.triggerEvents = function(){
		if ( this.widthHasChanged() || this.heightHasChanged() ){
			this.$el.triggerHandler('resized', {
				from: {w: this._prevWidth, h: this._prevHeight},
				to: {w: this._currentWidth, h: this._currentHeight}
			});
			if ( this.widthHasChanged() ){
				this.$el.triggerHandler('resized-w', {
					from: this._prevWidth,
					to: this._currentWidth
				});
			}
			if ( this.heightHasChanged() ){
				this.$el.triggerHandler('resized-h', {
					from: this._prevHeight,
					to: this._currentHeight
				});
			}
		}
	}
	ResizingElement.prototype.destroy = function(){
		if ( this.$el[0] === window ){
			$window.unbind('resize.resizedEvent' );
		} else {
			$window.unbind('resized.resizedEvent-'+this.id);
		}
		return true;
	}
	var apiMethods = {
		update: function($el, args){
			return $el.data(datakey).handleResize();
		},
		destroy: function($el, args){
			var instance = $el.data(datakey);
			if ( ! instance ) return true;

			instance.destroy();
			return $el.data(datakey, null);
		}
	};
	function callMethod( $el, methodName, args ){
		var data;
		if ( !apiMethods.hasOwnProperty( methodName ) ){
			console.warn( 'resizedEvent() has no method "'+methodName+'"');
			return false;
		}
		apiMethods[methodName]($el, args);
		return true;
	}
	$.fn.resizedEvent = function(args, methodArgs){
		if ( typeof( args ) === 'string' ){
			var methodName = args;
			this.each( function(){
				return callMethod($(this), methodName, methodArgs);
			});
			return true;
		}
		this.each( function(){
			var $el = $(this);
			// if its already been initialized, then merge in any new options and halt
			if( $el.data( datakey ) ){
				if ( args ){
					$el.data( datakey ).settings = $.extend({}, $el.data( datakey ).settings, args );
				}
			} else {
				$el.data( datakey, new ResizingElement($(this), args) );
			}
			var w = $el.data( datakey ).getWidth();
			var h = $el.data( datakey ).getHeight();
			setTimeout( function(){
				$el.triggerHandler('resized-init', [{
					from: {w: w, h: h},
					to: {w: w, h: h}
				}]);
			}, 1 );
		});
		return this;
	}
}( jQuery, window ) );
