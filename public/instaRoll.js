var instaRoll = (function () {
'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var fetchJsonp = createCommonjsModule(function (module, exports) {
(function (global, factory) {
  if (typeof undefined === 'function' && undefined.amd) {
    undefined(['exports', 'module'], factory);
  } else {
    factory(exports, module);
  }
})(commonjsGlobal, function (exports, module) {
  'use strict';

  var defaultOptions = {
    timeout: 5000,
    jsonpCallback: 'callback',
    jsonpCallbackFunction: null
  };

  function generateCallbackFunction() {
    return 'jsonp_' + Date.now() + '_' + Math.ceil(Math.random() * 100000);
  }

  // Known issue: Will throw 'Uncaught ReferenceError: callback_*** is not defined'
  // error if request timeout
  function clearFunction(functionName) {
    // IE8 throws an exception when you try to delete a property on window
    // http://stackoverflow.com/a/1824228/751089
    try {
      delete window[functionName];
    } catch (e) {
      window[functionName] = undefined;
    }
  }

  function removeScript(scriptId) {
    var script = document.getElementById(scriptId);
    document.getElementsByTagName('head')[0].removeChild(script);
  }

  function fetchJsonp(_url) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    // to avoid param reassign
    var url = _url;
    var timeout = options.timeout || defaultOptions.timeout;
    var jsonpCallback = options.jsonpCallback || defaultOptions.jsonpCallback;

    var timeoutId = undefined;

    return new Promise(function (resolve, reject) {
      var callbackFunction = options.jsonpCallbackFunction || generateCallbackFunction();
      var scriptId = jsonpCallback + '_' + callbackFunction;

      window[callbackFunction] = function (response) {
        resolve({
          ok: true,
          // keep consistent with fetch API
          json: function json() {
            return Promise.resolve(response);
          }
        });

        if (timeoutId) clearTimeout(timeoutId);

        removeScript(scriptId);

        clearFunction(callbackFunction);
      };

      // Check if the user set their own params, and if not add a ? to start a list of params
      url += url.indexOf('?') === -1 ? '?' : '&';

      var jsonpScript = document.createElement('script');
      jsonpScript.setAttribute('src', '' + url + jsonpCallback + '=' + callbackFunction);
      if (options.charset) {
        jsonpScript.setAttribute('charset', options.charset);
      }
      jsonpScript.id = scriptId;
      document.getElementsByTagName('head')[0].appendChild(jsonpScript);

      timeoutId = setTimeout(function () {
        reject(new Error('JSONP request to ' + _url + ' timed out'));

        clearFunction(callbackFunction);
        removeScript(scriptId);
      }, timeout);
    });
  }

  // export as global function
  /*
  let local;
  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof self !== 'undefined') {
    local = self;
  } else {
    try {
      local = Function('return this')();
    } catch (e) {
      throw new Error('polyfill failed because global object is unavailable in this environment');
    }
  }
  local.fetchJsonp = fetchJsonp;
  */

  module.exports = fetchJsonp;
});
});

console.log(fetchJsonp);

function getImages(accessToken) {
    var myInit = {
        method: 'GET',
        mode: 'no-cors',
        dataType: 'jsonp'
    };

    return fetchJsonp('https://api.instagram.com/v1/users/self/media/recent/?access_token=' + accessToken, myInit).then(function (result) {
        return result.json();
    });
}

function toThumbnails(dataItem) {
    var image = dataItem.images.standard_resolution;
    return {
        url: image.url,
        active: false,
        height: image.height
    };
}

function assign ( target ) {
	for ( var i = 1; i < arguments.length; i += 1 ) {
		var source = arguments[i];
		for ( var k in source ) target[k] = source[k];
	}

	return target;
}

function appendNode ( node, target ) {
	target.appendChild( node );
}

function insertNode ( node, target, anchor ) {
	target.insertBefore( node, anchor );
}

function detachNode ( node ) {
	node.parentNode.removeChild( node );
}

function destroyEach ( iterations, detach, start ) {
	for ( var i = start; i < iterations.length; i += 1 ) {
		if ( iterations[i] ) iterations[i].destroy( detach );
	}
}

function createElement ( name ) {
	return document.createElement( name );
}

function setAttribute ( node, attribute, value ) {
	node.setAttribute( attribute, value );
}

var transitionManager = {
	running: false,
	transitions: [],

	add: function ( transition ) {
		transitionManager.transitions.push( transition );

		if ( !this.running ) {
			this.running = true;
			this.next();
		}
	},

	next: function () {
		transitionManager.running = false;

		var now = window.performance.now();
		var i = transitionManager.transitions.length;

		while ( i-- ) {
			var transition = transitionManager.transitions[i];

			if ( transition.program && now >= transition.program.end ) {
				transition.done();
			}

			if ( transition.pending && now >= transition.pending.start ) {
				transition.start( transition.pending );
			}

			if ( transition.running ) {
				transition.update( now );
				transitionManager.running = true;
			} else if ( !transition.pending ) {
				transitionManager.transitions.splice( i, 1 );
			}
		}

		if ( transitionManager.running ) {
			requestAnimationFrame( transitionManager.next );
		}
	}
};

function differs ( a, b ) {
	return ( a !== b ) || ( a && ( typeof a === 'object' ) || ( typeof a === 'function' ) );
}

function dispatchObservers ( component, group, newState, oldState ) {
	for ( var key in group ) {
		if ( !( key in newState ) ) continue;

		var newValue = newState[ key ];
		var oldValue = oldState[ key ];

		if ( differs( newValue, oldValue ) ) {
			var callbacks = group[ key ];
			if ( !callbacks ) continue;

			for ( var i = 0; i < callbacks.length; i += 1 ) {
				var callback = callbacks[i];
				if ( callback.__calling ) continue;

				callback.__calling = true;
				callback.call( component, newValue, oldValue );
				callback.__calling = false;
			}
		}
	}
}

function get ( key ) {
	return key ? this._state[ key ] : this._state;
}

function fire ( eventName, data ) {
	var handlers = eventName in this._handlers && this._handlers[ eventName ].slice();
	if ( !handlers ) return;

	for ( var i = 0; i < handlers.length; i += 1 ) {
		handlers[i].call( this, data );
	}
}

function observe ( key, callback, options ) {
	var group = ( options && options.defer ) ? this._observers.post : this._observers.pre;

	( group[ key ] || ( group[ key ] = [] ) ).push( callback );

	if ( !options || options.init !== false ) {
		callback.__calling = true;
		callback.call( this, this._state[ key ] );
		callback.__calling = false;
	}

	return {
		cancel: function () {
			var index = group[ key ].indexOf( callback );
			if ( ~index ) group[ key ].splice( index, 1 );
		}
	};
}

function on ( eventName, handler ) {
	if ( eventName === 'teardown' ) return this.on( 'destroy', handler );

	var handlers = this._handlers[ eventName ] || ( this._handlers[ eventName ] = [] );
	handlers.push( handler );

	return {
		cancel: function () {
			var index = handlers.indexOf( handler );
			if ( ~index ) handlers.splice( index, 1 );
		}
	};
}

function set ( newState ) {
	this._set( assign( {}, newState ) );
	this._root._flush();
}

function _flush () {
	if ( !this._renderHooks ) return;

	while ( this._renderHooks.length ) {
		this._renderHooks.pop()();
	}
}

var proto = {
	get: get,
	fire: fire,
	observe: observe,
	on: on,
	set: set,
	_flush: _flush
};

var template = function () {
	var template = {
		helpers: {
			isImageActive: isImageActive,
			topPosition: topPosition
		}
	};

	var containerHeight = 640;

	function isImageActive(isImageActive) {
		if (isImageActive) return 'insta__image--active';
		return '';
	}

	function topPosition(imageHeight) {
		var init = (containerHeight - imageHeight) / 2;
		var position = Math.max(0, init);
		return position + 'px';
	}

	return template;
}();

function add_css() {
	var style = createElement('style');
	style.id = "svelte-4169665004-style";
	style.textContent = "\n  [svelte-4169665004].insta, [svelte-4169665004] .insta {\n      height: 640px;\n      width: 100%;\n      max-width: 640px;\n      overflow: hidden;\n      position: relative;\n      margin: 0 auto;\n  }\n  [svelte-4169665004].insta__image, [svelte-4169665004] .insta__image {\n      position: absolute;\n      top: 0;\n      left: 0;\n      opacity: 0;\n      transition: opacity 1s;\n      width: 100%;\n  }\n  [svelte-4169665004].insta__image--active, [svelte-4169665004] .insta__image--active {\n      opacity: 1;\n  }\n";
	appendNode(style, document.head);
}

function create_main_fragment(state, component) {
	var div = createElement('div');
	setAttribute(div, 'svelte-4169665004', '');
	div.className = "insta";
	var each_block_value = state.images;

	var each_block_iterations = [];

	for (var i = 0; i < each_block_value.length; i += 1) {
		each_block_iterations[i] = create_each_block(state, each_block_value, each_block_value[i], i, component);
		each_block_iterations[i].mount(div, null);
	}

	return {
		mount: function mount(target, anchor) {
			insertNode(div, target, anchor);
		},

		update: function update(changed, state) {
			var each_block_value = state.images;

			if ('images' in changed) {
				for (var i = 0; i < each_block_value.length; i += 1) {
					if (each_block_iterations[i]) {
						each_block_iterations[i].update(changed, state, each_block_value, each_block_value[i], i);
					} else {
						each_block_iterations[i] = create_each_block(state, each_block_value, each_block_value[i], i, component);
						each_block_iterations[i].mount(div, null);
					}
				}

				destroyEach(each_block_iterations, true, each_block_value.length);
				each_block_iterations.length = each_block_value.length;
			}
		},

		destroy: function destroy(detach) {
			destroyEach(each_block_iterations, false, 0);

			if (detach) {
				detachNode(div);
			}
		}
	};
}

function create_each_block(state, each_block_value, imgSrc, imgSrc_index, component) {
	var img_src_value, img_class_value, img_style_value;

	var img = createElement('img');
	img.src = img_src_value = imgSrc.url;
	img.className = img_class_value = "insta__image " + template.helpers.isImageActive(imgSrc.active);
	img.style.cssText = img_style_value = "top: " + template.helpers.topPosition(imgSrc.height);

	return {
		mount: function mount(target, anchor) {
			insertNode(img, target, anchor);
		},

		update: function update(changed, state, each_block_value, imgSrc, imgSrc_index) {
			if (img_src_value !== (img_src_value = imgSrc.url)) {
				img.src = img_src_value;
			}

			if (img_class_value !== (img_class_value = "insta__image " + template.helpers.isImageActive(imgSrc.active))) {
				img.className = img_class_value;
			}

			if (img_style_value !== (img_style_value = "top: " + template.helpers.topPosition(imgSrc.height))) {
				img.style.cssText = img_style_value;
			}
		},

		destroy: function destroy(detach) {
			if (detach) {
				detachNode(img);
			}
		}
	};
}

function Hw(options) {
	options = options || {};
	this._state = options.data || {};

	this._observers = {
		pre: Object.create(null),
		post: Object.create(null)
	};

	this._handlers = Object.create(null);

	this._root = options._root || this;
	this._yield = options._yield;

	this._torndown = false;
	if (!document.getElementById("svelte-4169665004-style")) add_css();

	this._fragment = create_main_fragment(this._state, this);
	if (options.target) this._fragment.mount(options.target, null);
}

assign(Hw.prototype, proto);

Hw.prototype._set = function _set(newState) {
	var oldState = this._state;
	this._state = assign({}, oldState, newState);
	dispatchObservers(this, this._observers.pre, newState, oldState);
	this._fragment.update(newState, this._state);
	dispatchObservers(this, this._observers.post, newState, oldState);
};

Hw.prototype.teardown = Hw.prototype.destroy = function destroy(detach) {
	this.fire('destroy');

	this._fragment.destroy(detach !== false);
	this._fragment = null;

	this._state = {};
	this._torndown = true;
};

function start(config) {
    var c = config || {};
    var accessToken = c.ACCESS_TOKEN || '';
    var wait = c.wait || 1000;
    return Promise.resolve().then(function () {
        return getImages(accessToken);
    }).then(function (r) {
        return r.data.map(toThumbnails);
    }).then(preload).then(function (t) {
        return switchImage$$1(t, 1, wait);
    }).catch(function (err) {
        console.error(err);
        app.set({ name: 'error' });
    });
}

var app = new Hw({
    target: document.querySelector('#instaRoll'),
    data: {
        imgSrc: '',
        images: [],
        currentImage: ''
    }
});

function preload(images) {
    setImage(images.slice(0, 2), 0);
    return images;
}

function switchImage$$1(images, count, wait) {
    setTimeout(function () {
        setImage(images, count);
        switchImage$$1(images, (count + 1) % 20, wait);
    }, wait);
}

function setImage(images, count) {
    images[count].active = true;
    app.set({
        images: images
    });
    images[count].active = false;
}

return start;

}());
