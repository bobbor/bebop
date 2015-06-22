/*globals define */
(function (root, factory) {
  // backbone like definition for different environments
  /* istanbul ignore else */
  if (typeof define === 'function' && define.amd) {
    define(['exports'], function (exports) {
      root.bebop = factory(root, exports);
    });
  } else if (typeof exports !== 'undefined') {
    factory(root, exports);
  } else {
    root.bebop = factory(root, {});
  }

}(self, function (root, bebop) {
  var hasOwn = {}.hasOwnProperty;
  var slice = [].slice;
  var doc = root.document;
  var docElem = doc.documentElement;
  var body = doc.body;
  // polyfill for match.
  /* istanbul ignore next  */
  var match = body.matches || body.webkitMatchesSelector || body.mozMatchesSelector || body.msMatchesSelector ||
    body.oMatchesSelector || function (selector) {
      var element = this;
      var matches = (element.document || element.ownerDocument).querySelectorAll(selector);
      var i = 0;
      while (matches[i] && matches[i] !== element) {
        i++;
      }
      return matches[i] ? true : false;
    };
  var func = 'f', obj = 'o', str = 's', num = 'n', undef = 'u';

  function is(type, item) {
    return (typeof item)[0] === type;
  }

  function inst(klas, item) {
    return item instanceof klas;
  }

  bebop.VERSION = '1.0.5';

  var uuid = bebop.uuid = (function () {
    var counter = 0;
    return function () {
      counter++;
      return counter.toString(16);
    };
  }());

  var extend = function () {
    var hasOwn = {}.hasOwnProperty;
    var args = Array.prototype.slice.call(arguments);
    var target = args.shift(), src;
    if (args.length > 1) {
      src = extend.apply(this, args);
    } else {
      src = args[0];
    }
    for (var prop in src) {
      if (hasOwn.call(src, prop)) {
        target[prop] = src[prop];
      }
    }
    return target;
  };

  var Selector = {
    create: function (markup) {
      var container = doc.createElement('div');
      container.innerHTML = markup;
      return new Element(container.childNodes[0]);
    },
    one: function (sel, context) {
      context = inst(bebop.Element, context) ? context._node : context;
      if (sel === null) {
        return null;
      }
      if (is(str, sel)) {
        var node = (context || doc).querySelectorAll(sel);
        if (node.length === 0) {
          return null;
        }
        return new Element(node[0]);
      } else if (sel && sel._node) {
        return sel;
      } else {
        return new Element(sel);
      }
    },
    all: function (selector, context) {
      context = inst(bebop.Element, context) ? context._node : context;
      return new ElementList((context || doc).querySelectorAll(selector));
    }
  };

  extend(bebop, Selector);
  var oldBebop = {
    $: root.$,
    bebop: root.bebop
  };

  var noConflict = function (deep) {
    if (deep) {
      root.bebop = oldBebop.bebop;
    }
    root.$ = oldBebop.$;
    return bebop
  };

  extend(bebop, {noConflict: noConflict});

  var Element = bebop.Element = function (node) {
    this._node = node;
  };

  function siblingFind(node, method, criteria) {
    var siblingType = method + 'Sibling',
      filter,
      validItems;
    if (typeof criteria === 'string') {
      validItems = Selector.all(criteria, node.parentNode);
      filter = function (rawNode) {
        var found = false;
        validItems.forEach(function (el) {
          if (rawNode === el._node) {
            found = true;
          }
        });
        return found;
      };
      // Default the filter to return true
    } else if (!criteria) {
      filter = function () {
        return true;
      };
    } else {
      filter = function (rawEl) {
        return criteria(new Element(rawEl));
      };
    }
    while (node) {
      node = node[siblingType];
      if (node && node.nodeType === 1 && filter(node)) {
        break;
      }
    }

    return node ? new Element(node) : null;
  }

  function _jsStyle(name) {
    var lookupMap = {
      float: 'cssFloat'
    };
    if (lookupMap[name]) {
      name = lookupMap[name];
    }
    return name;
  }

  function NNM2Obj(nnm) {
    var l = nnm.length, ret = {};
    while (l--) {
      ret[nnm[l].name] = nnm[l].value;
    }
    return ret;
  }

  extend(Element.prototype, {
    uuid: function () {
      if (!this._node.id) {
        this._node.id = 'node_' + uuid();
      }
      return this._node.id;
    },
    // traversal foo
    ancestors: function () {
      var anc = [];
      var n = this._node;
      do {
        anc.push(n);
      } while (n = n.parentNode);
      return new ElementList(anc);
    },
    matches: function (sel) {
      if (is(str, sel) && this._node !== doc) {
        return match.call(this._node, sel);
      } else {
        return this.is(sel);
      }
    },
    is: function (other) {
      other = (other instanceof Element) ? other : new Element(other);
      return other._node === this._node;
    },
    closest: function (sel) {
      /*istanbul ignore next */
      if ('closest' in this._node && is(str, sel)) {
        var result = this._node.closest(sel);
        return result ? new Element(result) : null;
      }
      var ancestors = this.ancestors(), item;
      for (var i = 0; i < ancestors.size(); i++) {
        item = ancestors.item(i);
        if (item.matches(sel)) {
          return item;
        }
      }
      return null;
    },
    parent: function () {
      return new Element(this._node.parentNode);
    },
    next: function (filter) {
      return siblingFind(this._node, 'next', filter);
    },
    prev: function (filter) {
      return siblingFind(this._node, 'previous', filter);
    },
    // attribute and property foo
    hasClass: function (className) {
      return this._node.classList.contains(className);
    },
    addClass: function (className) {
      this._node.classList.add(className);
      return this;
    },
    removeClass: function (className) {
      return this._node.classList.remove(className);
    },
    toggleClass: function (className) {
      return this._node.classList.toggle(className);
    },
    data: function (property, val) {
      if (is(undef, property)) {
        var att = this.attr();
        return Object.keys(att).reduce(function (data, key) {
          if (/^data\-/.test(key)) {
            data[key.replace(/^data\-/, '')] = att[key];
          }
          return data;
        }, {});
      } else if (is(undef, val)) {
        return this._node.getAttribute('data-' + property);
      } else {
        if (!is(func, val)) {
          this._node.setAttribute('data-' + property, val);
          return this;
        }
      }
    },
    rmData: function (property) {
      this.rmAttr('data-' + property);
      return this;
    },
    prop: function (property, value) {
      if (is(undef, property)) {
        return null;
      } else if (is(undef, value)) {
        if (property === 'parentNode') {
          return this.parent();
        }
        return this._node[property];
      } else {
        this._node[property] = value;
        return this;
      }
    },
    attr: function (property, value) {
      if (is(undef, property)) {
        return NNM2Obj(this._node.attributes);
      } else if (is(undef, value)) {
        return this._node.getAttribute(property);
      } else {
        this._node.setAttribute(property, value);
        return this;
      }
    },
    hasAttr: function (property) {
      return this._node.hasAttribute(property);
    },
    rmAttr: function (property) {
      this._node.removeAttribute(property);
      return this;
    },
    // css foo
    getStyle: function (property) {
      if (!this.hasAttr('style')) {
        return null;
      }
      property = _jsStyle(property);
      var matchedStyle = this._node.style[property];
      if (matchedStyle) {
        return matchedStyle;
      } else {
        return null;
      }
    },
    removeStyle: function (property) {
      return this.removeStyles(property);
    },
    removeStyles: function (props) {
      // Default properties to an array
      if (typeof props === 'string') {
        props = [props];
      }
      var i, propsLen = props.length, prop;

      for (i = 0; i < propsLen; i += 1) {
        prop = _jsStyle(props[i]);
        this._node.style[prop] = null;
      }
      return this;
    },
    setStyle: function (property, value) {
      var newStyle = {};
      newStyle[property] = value;
      return this.setStyles(newStyle);
    },
    setStyles: function (newStyles) {
      if (!this.hasAttr('style')) {
        this.attr('style', '');
      }
      for (var i in newStyles) {
        if (hasOwn.call(newStyles, i)) {
          var styleKey = _jsStyle(i);
          this._node.style[styleKey] = newStyles[i];
        }
      }
      return this;
    },
    computeCss: function (styles) {
      var computedStyles = doc.defaultView.getComputedStyle(this._node), i, eachStyle, cssMap = {};
      // String case, just return the correct style
      if (typeof styles === 'string') {
        return computedStyles[styles];
      }
      for (i = 0; eachStyle = styles[i]; i++) {
        cssMap[eachStyle] = computedStyles[eachStyle];
      }
      return cssMap;
    },
    // extended info foo
    serialize: function () {
      var ret = [], els = this._node.elements;
      for (var i = 0, el; el = els[i]; i++) {
        if (el.disabled || el.type === 'submit' || el.type === 'image') {
          continue;
        }
        if (el.name && el.name.length > 0) {
          if (el.type === 'checkbox' || el.type === 'radio') {
            if (el.checked) {
              ret.push(el.name + '=' + encodeURIComponent(el.value));
            }
          } else {
            ret.push(el.name + '=' + encodeURIComponent(el.value));
          }
        }
      }
      return ret.join('&');
    },
    // content foo
    empty: function () {
      this._node.innerHTML = '';
      return this;
    },
    html: function (html) {
      if (is(undef, html)) {
        return this._node.innerHTML;
      } else {
        this._node.innerHTML = html;
        return this;
      }
    },
    text: function (text) {
      if (is(undef, text)) {
        return this._node.textContent;
      } else {
        this._node.textContent = text;
        return text;
      }
    },
    append: function (node) {
      if (is(str, node)) {
        node = Selector.create(node)._node;
      } else if (node instanceof Element) {
        node = node._node;
      }
      this._node.appendChild(node);
      return this;
    },
    appendTo: function (node) {
      var newParent = (node instanceof Element) ? node : Selector.one(node);
      newParent.append(this);
      return this;
    },
    prepend: function (node) {
      if (is(str, node)) {
        node = Selector.create(node)._node;
      } else {
        if (node instanceof Element) {
          node = node._node;
        }
      }
      var child = this.one('*');
      this._node.insertBefore(node, (child && child._node ? child._node : null));
      return this;
    },
    prependTo: function (node) {
      var newParent = (node instanceof Element) ? node : Selector.one(node);
      newParent.prepend(this);
      return this;
    },
    insertBefore: function (other) {
      other = (other instanceof Element) ? other : Selector.one(other);
      other._node.parentNode.insertBefore(this._node, other._node);
      return this;
    },
    insertAfter: function (other) {
      other = (other instanceof Element) ? other : Selector.one(other);
      var sibl = other.next();
      other._node.parentNode.insertBefore(this._node, sibl ? sibl._node : null);
      return this;
    },
    after: function (node) {
      if (is(str, node)) {
        node = Selector.create(node);
      }
      node.insertAfter(this);
      return this;
    },
    before: function (node) {
      if (is(str, node)) {
        node = Selector.create(node);
      }
      node.insertBefore(this);
      return this;
    },
    remove: function () {
      this._node.parentNode.removeChild(this._node);
      return this;
    },
    // selector proxy foo
    one: function (sel) {
      return Selector.one(sel, this._node);
    },
    all: function (sel) {
      return Selector.all(sel, this._node);
    },
    // event shit
    click: function () {
      var evt = doc.createEvent('MouseEvents');
      evt.initMouseEvent('click', true, true, root, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      return !this._node.dispatchEvent(evt);
    },
    addEventListener: function (ev, fn) {
      return this._node.addEventListener(ev, fn, false);
    },
    removeEventListener: function (ev, fn) {
      return this._node.removeEventListener(ev, fn, false);
    },
    on: function (ev, fn, selector, context) {
      return event.on(this, ev, fn, selector, context);
    },
    once: function (ev, fn, selector, context) {
      return event.on(this, ev, fn, selector, context, true);
    },
    off: function (ev, fn) {
      return event.off(this, ev, fn);
    },
    purge: function (type, callback, recurse) {
      var evt = event;

      for (var i in evt._cached) {
        for (var j = 0, numCbs = evt._cached[i].length; j < numCbs; j++) {
          var thisEvt = evt._cached[i][j];
          if (this._node === thisEvt.obj._node && (!type || type === thisEvt.type)) {
            evt.off(thisEvt.obj, thisEvt.type, thisEvt.raw);
          }
        }
      }
      if (recurse) {
        this.all('*').forEach(function (el) {
          el.purge(type, callback, recurse);
        });
      }
    },
    fire: function (ev) {
      event._eventData = slice.call(arguments, 1);
      var customEvt = doc.createEvent('UIEvents');
      customEvt.initEvent(ev, true, false);
      this._node.dispatchEvent(customEvt);
    }
  });

  var ElementList = bebop.ElementList = function (nodes) {
    var i, j;
    var node;
    var func;
    var wrappedNodes = [];

    for (i = 0; node = nodes[i]; i++) {
      wrappedNodes.push(new Element(node));
    }
    this.nodes = wrappedNodes;

    var iteratedFunctions = [
        'remove',
        'addClass',
        'removeClass',
        'toggleClass',
        'prop',
        'attr',
        'setStyle',
        'setStyles',
        'removeStyle',
        'removeStyles'
      ],

      mythis = this;

    function getIteratedCallback(method) {
      return function () {
        for (j = 0; node = mythis.nodes[j]; j++) {
          node[method].apply(node, arguments);
        }
        return mythis;
      };
    }

    for (i = 0; func = iteratedFunctions[i]; i++) {
      this[func] = getIteratedCallback(func);
    }
  };

  extend(ElementList.prototype, {
    forEach: function (callback) {
      return this.nodes.forEach(callback);
    },
    map: function (callback) {
      return this.nodes.map(callback);
    },
    reduce: function (callback, starter) {
      return this.nodes.reduce(callback, starter);
    },
    item: function (index) {
      return is(undef, index) ? null : this.nodes[index];
    },
    size: function () {
      return this.nodes.length;
    },
    get: function (index) {
      var all = this.nodes.map(function (node) {
        return node._node;
      });
      if ('undefined' !== typeof index) {
        return all[index];
      }
      return all;
    }
  });

  function EventInstance(e, attrs) {

    this._e = e;
    //noinspection JSUnresolvedVariable
    this.originalTarget = new Element(e.target);
    //noinspection JSUnresolvedVariable
    this.target = new Element(e.target);
  }

  EventInstance.prototype = {
    pageX: function () {
      //noinspection JSUnresolvedVariable
      return this._e.pageX;
    },
    pageY: function () {
      //noinspection JSUnresolvedVariable
      return this._e.pageY;
    },
    code: function () {
      //noinspection JSUnresolvedVariable
      return this._e.keyCode;
    },
    stop: function () {
      return this.noBubble().noDefault();
    },
    noDefault: function () {
      //noinspection JSUnresolvedFunction
      this._e.preventDefault();
      return this;
    },
    noBubble: function () {
      //noinspection JSUnresolvedFunction
      this._e.stopPropagation();
      return this;
    }
  };

  function DOMEvent() {
    this._cached = {};
    this._eventData = [];
  }

  DOMEvent.prototype = {
    _getEventCallback: function (implementOn, ev, callback, selector, context, once) {
      var _uid = 'cb_' + uuid();
      callback.__uid = _uid;
      var self = this,
        stringy = _uid,
        wrappedListener = function (e) {
          var eventWrapper = new EventInstance(e),
            _eventWrapper,
            selfCallee = arguments.callee,
            returnControl = function (wrapper) {
              // Call the callback
              // Prepend the wrapped event onto the argument list so we can expect what arguments we get
              event._eventData.unshift(wrapper);
              callback.apply(implementOn, event._eventData);
              event._eventData = [];
              if (once) {
                implementOn.removeEventListener(ev, selfCallee);
              }
            };
          if (selector) {
            implementOn.all(selector).forEach(function (userEl) {
              _eventWrapper = new EventInstance(e);
              var found = true, html = Selector.one('html');
              while (userEl._node !== _eventWrapper.target._node) {
                if (_eventWrapper.target._node === html._node) {
                  found = false;
                  break;
                }
                _eventWrapper.target = _eventWrapper.target.parent();
              }
              if (found) {
                returnControl(_eventWrapper);
              }
            });
            return;
          }
          returnControl(eventWrapper);
        };

      // Push the callback onto the cached string
      self._cached[stringy] = self._cached[stringy] || [];
      self._cached[stringy].push({
        type: ev,
        obj: implementOn,
        fn: wrappedListener,
        raw: callback
      });

      return wrappedListener;
    },
    on: function (implementOn, event, callback, selector, context, once) {
      implementOn.addEventListener(event, this._getEventCallback.apply(this, arguments));
      return implementOn;
    },
    off: function (implementOn, event, callback) {
      var stringy;
      var i;
      var numCbs;
      if (!callback) {
        throw new Error('no callback defined');
      }
      stringy = callback.__uid;
      if (this._cached[stringy]) {
        // Iteratre through the cached callbacks and remove the correct one based on reference
        for (i = 0, numCbs = this._cached[stringy].length; i < numCbs; i++) {
          if (this._cached[stringy][i].raw === callback) {
            implementOn.removeEventListener(event, this._cached[stringy][i].fn);
          }
        }
      } else {
        throw new Error('no such callback');
      }
    },
    ready: function (fn) {
      var done = false, top = true,
        add = doc.attachEvent ? 'attachEvent' : 'addEventListener', rem = doc.attachEvent ? 'detachEvent'
          : 'removeEventListener', pre = doc.attachEvent ? 'on' : '',
        init = function (e) {
          if (e.type === 'readystatechange' && doc.readyState !== 'complete') {
            return;
          }
          (e.type === 'load' ? root : doc)[rem](pre + e.type, init, false);
          if (!done && (done = true)) {
            fn.call(root, e.type);
          }
        };
      if (doc.readyState === 'complete') {
        fn.call(root, 'lazy');
      } else {
        doc[add](pre + 'DOMContentLoaded', init, false);
        doc[add](pre + 'readystatechange', init, false);
        root[add](pre + 'load', init, false);
      }
    }
  };
  var event = new DOMEvent();
  bebop.ready = event.ready;

  /*
   * the following code for an implementation of the Promises/A+ spec was taken from:
   * https://github.com/RubenVerborgh/promiscuous
   * it is assumed that this code is working, so it will not be tested
   */
  /*istanbul ignore next */
  var Promise = bebop.Promise = (function () {
    var localPromise = function (callback, handler) {
      handler = function pendingHandler(resolved, rejected, value, queue, then, i) {
        queue = pendingHandler.q;

        // Case 1) handle a .then(resolved, rejected) call
        if (resolved !== is) {
          return Promise(function (resolve, reject) {
            queue.push({p: this, r: resolve, j: reject, 1: resolved, 0: rejected});
          });
        }

        // Case 2) handle a resolve or reject call
        // (`resolved` === `is` acts as a sentinel)
        // The actual function signature is
        // .re[ject|solve](<is>, success, value)

        // Check if the value is a promise and try to obtain its `then` method
        if (value && (is(func, value) | is(obj, value))) {
          try {
            then = value.then;
          }
          catch (reason) {
            rejected = 0;
            value = reason;
          }
        }
        // If the value is a promise, take over its state
        if (is(func, then)) {
          function valueHandler(resolved) {
            return function (value) {
              then && (then = 0, pendingHandler(is, resolved, value));
            };
          }

          try {
            then.call(value, valueHandler(1), rejected = valueHandler(0));
          }
          catch (reason) {
            rejected(reason);
          }
        }
        // The value is not a promise; handle resolve/reject
        else {
          // Replace this handler with a finalized resolved/rejected handler
          handler = function (Resolved, Rejected) {
            // If the Resolved or Rejected parameter is not a function,
            // return the original promise (now stored in the `callback` variable)
            if (!is(func, (Resolved = rejected ? Resolved : Rejected))) {
              return callback;
            }
            // Otherwise, return a finalized promise, transforming the value with the function
            return Promise(function (resolve, reject) {
              finalize(this, resolve, reject, value, Resolved);
            });
          };
          // Resolve/reject pending callbacks
          i = 0;
          while (i < queue.length) {
            then = queue[i++];
            // If no callback, just resolve/reject the promise
            if (!is(func, resolved = then[rejected])) {
              (rejected ? then.r : then.j)(value);
            }// Otherwise, resolve/reject the promise with the result of the callback
            else {
              finalize(then.p, then.r, then.j, value, resolved);
            }
          }
        }
      };
      // The queue of pending callbacks; garbage-collected when handler is resolved/rejected
      handler.q = [];

      // Create and return the promise (reusing the callback variable)
      callback.call(callback = {
          then: function (resolved, rejected) {
            return handler(resolved, rejected);
          },
          'catch': function (rejected) {
            return handler(0, rejected);
          }
        },
        function (value) {
          handler(is, 1, value);
        },
        function (reason) {
          handler(is, 0, reason);
        });
      return callback;
    };
    // Finalizes the promise by resolving/rejecting it with the transformed value
    function finalize(promise, resolve, reject, value, transform) {
      setTimeout(function () {
        try {
          // Transform the value through and check whether it's a promise
          value = transform(value);
          transform = value && (is(obj, value) | is(func, value)) && value.then;
          // Return the result if it's not a promise
          if (!is(func, transform)) {
            resolve(value);
          }// If it's a promise, make sure it's not circular
          else if (value === promise) {
            reject(TypeError());
          }// Take over the promise's state
          else {
            transform.call(value, resolve, reject);
          }
        }
        catch (error) {
          reject(error);
        }
      }, 0);
    }

    // Creates a resolved promise
    localPromise.resolve = ResolvedPromise;
    function ResolvedPromise(value) {
      return localPromise(function (resolve) {
        resolve(value);
      });
    }

    // Creates a rejected promise
    localPromise.reject = function (reason) {
      return localPromise(function (resolve, reject) {
        reject(reason);
      });
    };

    // Transforms an array of promises into a promise for an array
    localPromise.all = function (promises) {
      return localPromise(function (resolve, reject, count, values) {
        // Array of collected values
        values = [];
        // Resolve immediately if there are no promises
        count = promises.length || resolve(values);
        // Transform all elements (`map` is shorter than `forEach`)
        promises.map(function (promise, index) {
          ResolvedPromise(promise).then(
            // Store the value and resolve if it was the last
            function (value) {
              values[index] = value;
              --count || resolve(values);
            },
            // Reject if one element fails
            reject);
        });
      });
    };
    return localPromise;
  }());

  function IO() {
    function xhr() {
      return function (a) {
        for (a = 0; a < 4; a++) {
          try {
            return a ? new ActiveXObject([, 'Msxml2', 'Msxml3', 'Microsoft'][a] + '.XMLHTTP') : new XMLHttpRequest;
          } catch (e) {
          }
        }
      }();
    }

    var cache = (function () {
      var _cache = {};
      return {
        has: function (k) {
          return (k in _cache);
        },
        set: function (k, v) {
          _cache[k] = v
        },
        get: function (k) {
          return _cache[k];
        },
        del: function (k) {
          return delete _cache[k];
        }
      };
    }());

    function ajax(method, options) {
      var noData = /^\b(GET|HEAD)\b$/.test(method),
        req,
        o = extend({
          data: {}, head: {}
        }, options)
        ;

      function response() {
        var res = {
          url: req.responseURL || o.url,
          status: req.status
        };
        if (o.type === 'json') {
          try {
            res.data = JSON.parse(req.responseText);
          } catch (ex) {
            res.data = req.responseText;
          }
        } else if (o.type === 'html') {
          // no need for try catch. create has undefined-node if creation fails
          res.data = Selector.create(req.responseText);
        } else {
          res.data = req.responseText;
        }
        return res;
      }

      function run() {
        return new Promise(function (resolve, reject) {
          req.onload = function () {
            var res = response();
            cache.set(o.url, {ok: true, res: res, req: req});
            resolve({res: res, req: req});
          };
          req.onerror = function () {
            var res = response();
            cache.set(o.url, {ok: false, res: res, req: req});
            reject({res: res, req: req});
          };
          req.send(o.data && !noData ? o.data : null);
        });
      }

      if (o.bust) {
        cache.del(o.url)
      }
      if (cache.has(o.url)) {
        return new Promise(function (resolve, reject) {
          var val = cache.get(options.url);
          if (val.ok) {
            resolve({res: val.res, req: val.req});
          } else {
            reject({res: val.res, req: val.req});
          }
        });
      }
      req = xhr();

      if (!inst(FormData, o.data)) {
        o.data = Object.keys(o.data).map(function (key) {
          return key + '=' + o.data[key];
        }).join('&');
      }
      if (noData) {
        o.url += '?' + o.data;
      }
      req.open(method, o.url);
      req.setRequestHeader('X-Requested-With', 'bebop.io');

      if (!noData) {
        req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      }

      for (var prop in o.head) {
        req.setRequestHeader(prop, o.head[prop]);
      }
      switch (o.type) {
        case 'json':
          req.setRequestHeader('Accept', 'application/json, text/javascript');
          break;
        case 'html':
          req.setRequestHeader('Accept', 'text/html');
          break;
        case 'xml':
          req.setRequestHeader('Accept', 'application/xml, text/xml');
          break;
        case 'text':
          req.setRequestHeader('Accept', 'text/plain');
          break;
        default:
          req.setRequestHeader('Accept', '*/'.concat('*'));
          break;
      }

      return run();
    }

    this.post = function (options) {
      return ajax('POST', options);
    };
    this.get = function (options) {
      return ajax('GET', options);
    };
    this.put = function (options) {
      return ajax('PUT', options);
    };
    this.del = function (options) {
      return ajax('DELETE', options);
    };
    this.head = function (options) {
      return ajax('HEAD', options);
    };
  }

  bebop.io = new IO();
  root.$ = bebop;
  return bebop;
}));
