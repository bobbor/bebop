(function() {
  var hasProp = {}.hasOwnProperty;

  (function(root, factory) {
    if (typeof define === 'function' && define.amd) {
      return define(['exports'], function(exports) {
        return root.bebop = factory(root, exports);
      });
    } else if (typeof exports !== 'undefined') {
      return factory(root, exports);
    } else {
      return root.bebop = factory(root, {});
    }
  })(self, function(root, bebop) {
    var Element, ElementList, EventInstance, IO, Promise, Selector, _Event, _is, _jsStyle, body, doc, docElem, event, extend, func, inst, match, matchPolyFill, nnm2obj, noConflict, obj, oldBebop, siblingFind, slice, str, undef, uuid;
    slice = [].slice;
    doc = root.document;
    docElem = doc.documentElement;
    body = doc.body;
    matchPolyFill = function(selector) {
      var element, i, matches;
      element = this;
      matches = (element.document || element.ownerDocument).querySelectorAll(selector);
      i = 0;
      while (matches[i] && matches[i] !== element) {
        i++;
      }
      if (matches[i]) {
        return true;
      } else {
        return false;
      }
    };
    match = body.matches || body.webkitMatchesSelector || body.mozMatchesSelector || body.msMatchesSelector || body.oMatchesSelector || matchPolyFill;
    func = 'f';
    obj = 'o';
    str = 's';
    undef = 'u';
    _is = function(type, item) {
      return (typeof item)[0] === type;
    };
    inst = function(klas, item) {
      return item instanceof klas;
    };
    uuid = (function() {
      var counter;
      counter = 0;
      return function() {
        counter++;
        return counter.toString(16);
      };
    })();
    extend = function(target, src) {
      var key, value;
      for (key in src) {
        if (!hasProp.call(src, key)) continue;
        value = src[key];
        target[key] = value;
      }
      return target;
    };
    extend(bebop, {
      uuid: uuid,
      VERSION: '1.0.5'
    });
    Selector = {
      create: function(markup) {
        var container;
        container = doc.createElement('div');
        container.innerHTML = markup;
        return new Element(container.childNodes[0]);
      },
      one: function(selector, context) {
        var node;
        context = inst(bebop.Element, context) ? context._node : context;
        if (!selector) {
          return null;
        } else if (_is(str, selector)) {
          node = (context || doc).querySelectorAll(selector);
          if (!node.length) {
            return null;
          }
          return new Element(node[0]);
        } else if (selector && selector._node) {
          return selector;
        } else {
          return new Element(selector);
        }
      },
      all: function(selector, context) {
        context = inst(bebop.Element, context) ? context._node : context;
        return new ElementList((context || doc).querySelectorAll(selector));
      }
    };
    extend(bebop, Selector);
    oldBebop = {
      $: root.$,
      bebop: root.bebop
    };
    noConflict = function(deep) {
      if (deep) {
        root.bebop = oldBebop.bebop;
      }
      root.$ = oldBebop.$;
      return bebop;
    };
    extend(bebop, {
      noConflict: noConflict
    });
    siblingFind = function(node, method, criteria) {
      var filter, siblingType, validItems;
      siblingType = method + "Sibling";
      filter = null;
      validItems = null;
      if (_is(str, criteria)) {
        validItems = Selector.all(criteria, node.parentNode);
        filter = function(rawNode) {
          var found;
          found = false;
          validItems.forEach(function(el) {
            if (rawNode === el._node) {
              return found = true;
            }
          });
          return found;
        };
      } else if (!criteria) {
        filter = function() {
          return true;
        };
      } else {
        filter = function(rawEl) {
          return criteria(new Element(rawEl));
        };
      }
      while (node) {
        node = node[siblingType];
        if (node && node.nodeType === 1 && filter(node)) {
          break;
        }
      }
      if (node) {
        return new Element(node);
      } else {
        return null;
      }
    };
    _jsStyle = function(name) {
      if (name === 'float') {
        return 'cssFloat';
      } else {
        return name;
      }
    };
    nnm2obj = function(nnm) {
      var j, len, property, ret;
      ret = {};
      for (j = 0, len = nnm.length; j < len; j++) {
        property = nnm[j];
        ret[property.name] = property.value;
      }
      return ret;
    };
    Element = (function() {
      function Element(_node) {
        this._node = _node;
      }

      Element.prototype.uuid = function() {
        if (!this._node.id) {
          this._node.id = "node_" + (uuid());
        }
        return this._node.id;
      };

      Element.prototype.region = function() {
        var box, clientLeft, clientTop, region, scrollLeft, scrollTop;
        region = {
          width: this.prop('offsetWidth'),
          height: this.prop('offsetHeight')
        };
        box = this._node.getBoundingClientRect();
        clientTop = docElem.clientTop || body.clientTop || 0;
        clientLeft = docElem.clientLeft || body.clientLeft || 0;
        scrollTop = root.pageYOffset || docElem.scrollTop || body.scrollTop;
        scrollLeft = root.pageXOffset || docElem.scrollLeft || body.scrollLeft;
        region.top = box.top + scrollTop - clientTop;
        region.left = box.left + scrollLeft - clientLeft;
        region.bottom = region.top + region.height;
        region.right = region.left + region.width;
        return region;
      };

      Element.prototype.intersects = function(other) {
        var me, you;
        me = this.region();
        you = other.region();
        return !(me.left > you.right || me.right < you.left || me.top > you.bottom || me.bottom < you.top || you.left > me.right || you.right < me.left || you.top > me.bottom || you.bottom < me.top);
      };

      Element.prototype.ancestors = function() {
        var anc, n;
        n = this._node;
        anc = [n];
        while (n = n.parentNode) {
          anc.push(n);
        }
        return new ElementList(anc);
      };

      Element.prototype.matches = function(sel) {
        if (_is(str, sel) && this._node !== doc) {
          return match.call(this._node, sel);
        }
        return this.is(sel);
      };

      Element.prototype.is = function(other) {
        other = inst(bebop.Element, other) ? other : new Element(other);
        return other._node === this._node;
      };

      Element.prototype.closest = function(sel) {
        var ancestors, i, item, result, size;
        if ('closest' in this._node && _is(str, sel)) {
          result = this._node.closest(sel);
          if (result) {
            return new Element(result);
          } else {
            return null;
          }
        }
        ancestors = this.ancestors();
        size = ancestors.size();
        i = 0;
        while (i < size) {
          item = ancestors.item(i);
          if (item.matches(sel)) {
            return item;
          }
          i++;
        }
        return null;
      };

      Element.prototype.parent = function() {
        return new Element(this._node.parentNode);
      };

      Element.prototype.next = function(filter) {
        return siblingFind(this._node, 'next', filter);
      };

      Element.prototype.prev = function(filter) {
        return siblingFind(this._node, 'previous', filter);
      };

      Element.prototype.hasClass = function(className) {
        return this._node.classList.contains(className);
      };

      Element.prototype.addClass = function(className) {
        this._node.classList.add(className);
        return this;
      };

      Element.prototype.removeClass = function(className) {
        this._node.classList.remove(className);
        return this;
      };

      Element.prototype.toggleClass = function(className) {
        this._node.classList.toggle(className);
        return this;
      };

      Element.prototype.data = function(property, value) {
        var att;
        if (_is(undef, property)) {
          att = this.attr();
          return Object.keys(att).reduce(function(data, key) {
            if (/^data\-/.test(key)) {
              data[key.replace(/^data\-/, '')] = att[key];
            }
            return data;
          }, {});
        } else if (_is(undef, value)) {
          return this.attr('data-' + property);
        } else {
          if (_is(func, value)) {
            this.attr('data-' + property, value.call(this, property));
          } else {
            this.attr('data-' + property, value);
          }
          return this;
        }
      };

      Element.prototype.rmData = function(property) {
        this.rmAttr('data-' + property);
        return this;
      };

      Element.prototype.prop = function(property, value) {
        if (_is(undef, property)) {
          return null;
        } else if (_is(undef, value)) {
          return this._node[property];
        } else {
          this._node[property] = value;
          return this;
        }
      };

      Element.prototype.attr = function(property, value) {
        if (_is(undef, property)) {
          return nnm2obj(this._node.attributes);
        } else if (_is(undef, value)) {
          return this._node.getAttribute(property);
        } else {
          this._node.setAttribute(property, value);
          return this;
        }
      };

      Element.prototype.hasAttr = function(property) {
        return this._node.hasAttribute(property);
      };

      Element.prototype.rmAttr = function(property) {
        this._node.removeAttribute(property);
        return this;
      };

      Element.prototype.getStyle = function(property) {
        if (!this.hasAttr('style')) {
          return null;
        }
        property = _jsStyle(property);
        if (this._node.style[property]) {
          return this._node.style[property];
        } else {
          return null;
        }
      };

      Element.prototype.removeStyle = function(property) {
        return this.removeStyles([property]);
      };

      Element.prototype.removeStyles = function(properties) {
        var j, len, prop;
        if (_is(str, properties)) {
          properties = [properties];
        }
        for (j = 0, len = properties.length; j < len; j++) {
          prop = properties[j];
          prop = _jsStyle(prop);
          this._node.style[prop] = null;
        }
        return this;
      };

      Element.prototype.setStyle = function(property, value) {
        var style;
        style = {};
        style[property] = value;
        return this.setStyles(style);
      };

      Element.prototype.setStyles = function(newStyles) {
        var key, value;
        if (!this.hasAttr('style')) {
          this.attr('style', '');
        }
        for (key in newStyles) {
          if (!hasProp.call(newStyles, key)) continue;
          value = newStyles[key];
          this._node.style[_jsStyle(key)] = value;
        }
        return this;
      };

      Element.prototype.computeCss = function(styles) {
        var computedStyles, cssMap, j, len, style;
        computedStyles = doc.defaultView.getComputedStyle(this._node);
        cssMap = {};
        if (_is(str, styles)) {
          return computedStyles[styles];
        }
        for (j = 0, len = styles.length; j < len; j++) {
          style = styles[j];
          cssMap[style] = computedStyles[style];
        }
        return cssMap;
      };

      Element.prototype.serialize = function() {
        var el, j, len, ref, ret;
        ret = [];
        ref = this._node.elements;
        for (j = 0, len = ref.length; j < len; j++) {
          el = ref[j];
          if (el.disabled || el.type === 'submit' || el.type === 'image') {
            continue;
          }
          if (el.name && el.name.length) {
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
      };

      Element.prototype.empty = function() {
        this._node.innerHTML = '';
        return this;
      };

      Element.prototype.html = function(html) {
        if (_is(undef, html)) {
          return this._node.innerHTML;
        }
        this._node.innerHTML = html;
        return this;
      };

      Element.prototype.text = function(text) {
        if (_is(undef, text)) {
          return this._node.innerText;
        }
        this._node.innerText = text;
        return this;
      };

      Element.prototype.append = function(node) {
        if (_is(str, node)) {
          node = Selector.create(node)._node;
        } else if (inst(bebop.Element, node)) {
          node = node._node;
        }
        this._node.appendChild(node);
        return this;
      };

      Element.prototype.appendTo = function(node) {
        var newParent;
        newParent = inst(bebop.Element, node) ? node : Selector.one(node);
        newParent.append(this);
        return this;
      };

      Element.prototype.prepend = function(node) {
        var child;
        if (_is(str, node)) {
          node = Selector.create(node)._node;
        } else if (inst(bebop.Element, node)) {
          node = node._node;
        }
        child = this.one('*');
        this._node.insertBefore(node, child && child._node ? child._node : null);
        return this;
      };

      Element.prototype.prependTo = function(node) {
        var newParent;
        newParent = inst(bebop.Element, node) ? node : Selector.one(node);
        newParent.prepend(this);
        return this;
      };

      Element.prototype.insertBefore = function(other) {
        other = inst(bebop.Element, other) ? other : Selector.one(other);
        other._node.parentNode.insertBefore(this._node, other._node);
        return this;
      };

      Element.prototype.insertAfter = function(other) {
        var node, sibl;
        other = inst(bebop.Element, other) ? other : Selector.one(other);
        sibl = other.next();
        node = sibl ? sibl._node : null;
        other._node.parentNode.insertBefore(this._node, node);
        return this;
      };

      Element.prototype.after = function(node) {
        if (_is(str, node)) {
          node = Selector.create(node);
        }
        node.insertAfter(this);
        return this;
      };

      Element.prototype.before = function(node) {
        if (_is(str, node)) {
          node = Selector.create(node);
        }
        node.insertBefore(this);
        return this;
      };

      Element.prototype.remove = function() {
        this._node.parentNode.removeChild(this._node);
        return this;
      };

      Element.prototype.one = function(sel) {
        return Selector.one(sel, this._node);
      };

      Element.prototype.all = function(sel) {
        return Selector.all(sel, this._node);
      };

      Element.prototype.click = function() {
        var evt;
        evt = doc.createEvent('MouseEvents');
        evt.initMouseEvent('click', true, true, root, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        return !this._node.dispatchEvent(evt);
      };

      Element.prototype.addEventListener = function(ev, fn) {
        return this._node.addEventListener(ev, fn, false);
      };

      Element.prototype.removeEventListener = function(ev, fn) {
        return this._node.removeEventListener(ev, fn, false);
      };

      Element.prototype.on = function(ev, fn, selector, context) {
        return event.on(this, ev, fn, selector, context);
      };

      Element.prototype.once = function(ev, fn, selector, context) {
        return event.on(this, ev, fn, selector, context, true);
      };

      Element.prototype.off = function(ev, fn) {
        return event.off(this, ev, fn);
      };

      Element.prototype.purge = function(type, callback, recurse) {
        var cache, evt, idx, j, len, ref, singleEvent;
        evt = event;
        ref = evt._cached;
        for (idx in ref) {
          cache = ref[idx];
          for (j = 0, len = cache.length; j < len; j++) {
            singleEvent = cache[j];
            if (this._node === singleEvent.obj._node && (!type || type === singleEvent.type)) {
              evt.off(singleEvent.obj, singleEvent.type, singleEvent.raw);
            }
          }
        }
        if (recurse) {
          return this.all('*').forEach(function(el) {
            return el.purge(type, callback, recurse);
          });
        }
      };

      Element.prototype.fire = function(ev) {
        var customEvt;
        event._eventData = slice.call(arguments, 1);
        customEvt = doc.createEvent('UIEvents');
        customEvt.initEvent(ev, true, false);
        return this._node.dispatchEvent(customEvt);
      };

      return Element;

    })();
    bebop.Element = Element;
    ElementList = (function() {
      function ElementList(nodes) {
        var _func, getIteratedCallback, iteratedFunctions, j, len, node, wrappedNodes;
        wrappedNodes = (function() {
          var j, len, results;
          results = [];
          for (j = 0, len = nodes.length; j < len; j++) {
            node = nodes[j];
            results.push(new Element(node));
          }
          return results;
        })();
        this.nodes = wrappedNodes;
        iteratedFunctions = ['remove', 'addClass', 'removeClass', 'toggleClass', 'prop', 'attr', 'setStyle', 'setStyles', 'removeStyle', 'removeStyles'];
        getIteratedCallback = (function(_this) {
          return function(method) {
            return function() {
              var j, len, ref;
              ref = _this.nodes;
              for (j = 0, len = ref.length; j < len; j++) {
                node = ref[j];
                node[method].apply(node, arguments);
              }
              return _this;
            };
          };
        })(this);
        for (j = 0, len = iteratedFunctions.length; j < len; j++) {
          _func = iteratedFunctions[j];
          this[_func] = getIteratedCallback(_func);
        }
      }

      ElementList.prototype.forEach = function(callback) {
        return this.nodes.forEach(callback);
      };

      ElementList.prototype.map = function(callback) {
        return this.nodes.map(callback);
      };

      ElementList.prototype.reduce = function(callback, start) {
        return this.nodes.reduce(callback, start);
      };

      ElementList.prototype.item = function(index) {
        if (_is(undef, index)) {
          return null;
        } else {
          return this.nodes[index];
        }
      };

      ElementList.prototype.size = function() {
        return this.nodes.length;
      };

      ElementList.prototype.get = function(index) {
        var all;
        all = this.nodes.map(function(node) {
          return node._node;
        });
        if (!_is(undef, index)) {
          return all[index];
        } else {
          return all;
        }
      };

      return ElementList;

    })();
    bebop.ElementList = ElementList;
    EventInstance = (function() {
      function EventInstance(e) {
        this._e = e;
        this.originalTarget = new Element(e.target);
        this.target = new Element(e.target);
      }

      EventInstance.prototype.pageX = function() {
        return this._e.pageX;
      };

      EventInstance.prototype.pageY = function() {
        return this._e.pageY;
      };

      EventInstance.prototype.code = function() {
        return this._e.keyCode;
      };

      EventInstance.prototype.stop = function() {
        return this.noBubble().noDefault();
      };

      EventInstance.prototype.noDefault = function() {
        this._e.preventDefault();
        return this;
      };

      EventInstance.prototype.noBubble = function() {
        this._e.stopPropagation();
        return this;
      };

      return EventInstance;

    })();
    _Event = (function() {
      function _Event() {
        this._cached = {};
        this._eventData = [];
      }

      _Event.prototype._getEventCallback = function(implementOn, ev, callback, selector, context, once) {
        var _uid, base, stringy, wrappedListener;
        _uid = 'cb_' + uuid();
        callback.__uid = _uid;
        stringy = _uid;
        wrappedListener = function(e) {
          var _eventWrapper, eventWrapper, returnControl, selfCallee;
          eventWrapper = new EventInstance(e);
          _eventWrapper = null;
          selfCallee = arguments.callee;
          returnControl = function(wrapper) {
            event._eventData.unshift(wrapper);
            callback.apply(implementOn, event._eventData);
            event._eventData = [];
            if (once) {
              return implementOn.removeEventListener(ev, selfCallee);
            }
          };
          if (selector) {
            implementOn.all(selector).forEach(function(userEl) {
              var found, html;
              _eventWrapper = new EventInstance(e);
              found = true;
              html = Selector.one('html');
              while (userEl._node !== _eventWrapper.target._node) {
                if (_eventWrapper.target._node === html._node) {
                  found = false;
                  break;
                }
                _eventWrapper.target = _eventWrapper.target.parent();
              }
              if (found) {
                return returnControl(_eventWrapper);
              }
            });
            return;
          }
          return returnControl(eventWrapper);
        };
        (base = this._cached)[stringy] || (base[stringy] = []);
        this._cached[stringy].push({
          type: ev,
          obj: implementOn,
          fn: wrappedListener,
          raw: callback
        });
        return wrappedListener;
      };

      _Event.prototype.on = function(implementOn, event, callback, selector, context, once) {
        implementOn.addEventListener(event, this._getEventCallback.apply(this, arguments));
        return implementOn;
      };

      _Event.prototype.off = function(implementOn, event, callback) {
        var cache, j, len, results, singleEvent, stringy;
        if (!callback) {
          throw new Error('no callback defined');
        }
        stringy = callback.__uid;
        if (this._cached[stringy]) {
          cache = this._cached[stringy];
          results = [];
          for (j = 0, len = cache.length; j < len; j++) {
            singleEvent = cache[j];
            if (singleEvent.raw === callback) {
              results.push(implementOn.removeEventListener(event, singleEvent.fn));
            } else {
              results.push(void 0);
            }
          }
          return results;
        } else {
          throw new Error('no such callback');
        }
      };

      _Event.prototype.ready = function(fn) {
        var add, done, init, pre, rem;
        done = false;
        add = doc.attachEvent ? 'attachEvent' : 'addEventListener';
        rem = doc.attachEvent ? 'detachEvent' : 'removeEventListener';
        pre = doc.attachEvent ? 'on' : '';
        init = function(e) {
          if (e.type === 'readystatechange' && doc.readyState !== 'complete') {
            return;
          }
          (e.type === 'load' ? root : doc)[rem](pre + e.type, init, false);
          if (!done && (done = true)) {
            return fn.call(root, e.type);
          }
        };
        if (doc.readyState === 'complete') {
          return fn.call(root, 'lazy');
        } else {
          doc[add](pre + 'DOMContentLoaded', init, false);
          doc[add](pre + 'readystatechange', init, false);
          return root[add](pre + 'load', init, false);
        }
      };

      return _Event;

    })();
    event = new _Event();
    bebop.ready = event.ready;
    Promise = (function() {
      var ResolvedPromise, finalize, localPromise;
      localPromise = function(callback) {
        var handler, pendingHandler;
        handler = pendingHandler = function(resolved, rejected, value) {
          var _then, candidate, i, queue, reason, results, valueHandler;
          _then = null;
          i = 0;
          queue = pendingHandler.q;
          if (resolved !== _is) {
            return Promise(function(resolve, reject) {
              queue.push({
                p: this,
                r: resolve,
                j: reject,
                1: resolved,
                0: rejected
              });
              return undef;
            });
          }
          if (value && (_is(func, value) || _is(obj, value))) {
            try {
              _then = value.then;
            } catch (_error) {
              reason = _error;
              rejected = 0;
              value = reason;
            }
          }
          if (_is(func, _then)) {
            valueHandler = function(resolved) {
              return function(value) {
                if (_then) {
                  _then = 0;
                  return pendingHandler(_is, resolved, value);
                }
              };
            };
            try {
              rejected = valueHandler(0);
              return _then.call(value, valueHandler(1), rejected);
            } catch (_error) {
              reason = _error;
              return rejected(reason);
            }
          } else {
            handler = function(Resolved, Rejected) {
              var candidate;
              candidate = Resolved = rejected ? Resolved : Rejected;
              if (!_is(func, candidate)) {
                return callback;
              }
              return Promise(function(resolve, reject) {
                return finalize(this, resolve, reject, value, Resolved);
              });
            };
            results = [];
            while (i < queue.length) {
              _then = queue[i++];
              resolved = _then[rejected];
              if (!_is(func, resolved)) {
                candidate = rejected ? _then.r : _then.j;
                results.push(candidate(value));
              } else {
                results.push(finalize(_then.p, _then.r, _then.j, value, resolved));
              }
            }
            return results;
          }
        };
        handler.q = [];
        callback.call(callback = {
          then: function(resolved, rejected) {
            return handler(resolved, rejected);
          },
          'catch': function(rejected) {
            return handler(0, rejected);
          }
        }, function(value) {
          return handler(_is, 1, value);
        }, function(reason) {
          return handler(_is, 0, reason);
        });
        return callback;
      };
      finalize = function(promise, resolve, reject, value, transform) {
        return setTimeout(function() {
          var err;
          try {
            value = transform(value);
            if (value && (_is(obj, value) || _is(func, value))) {
              transform = value.then;
            }
            if (!_is(func, transform)) {
              return resolve(value);
            } else if (value === promise) {
              return reject(TypeError());
            } else {
              return transform.call(value, resolve, reject);
            }
          } catch (_error) {
            err = _error;
            return reject(err);
          }
        }, 0);
      };
      ResolvedPromise = function(value) {
        return localPromise(function(resolve) {
          return resolve(value);
        });
      };
      localPromise.resolve = ResolvedPromise;
      localPromise.reject = function(reason) {
        return localPromise(function(resolve, reject) {
          return reject(reason);
        });
      };
      localPromise.all = function(promises) {
        return localPromise(function(resolve, reject, count, values) {
          values = [];
          count = promises.length || resolve(values);
          return promises.map(function(promise, index) {
            return ResolvedPromise(promise).then(function(value) {
              values[index] = value;
              return --count || resolve(values);
            }, reject);
          });
        });
      };
      return localPromise;
    })();
    bebop.Promise = Promise;
    IO = function() {
      var ajax, cache, xhr;
      xhr = function() {
        return (function() {
          var e, i, j;
          for (i = j = 0; j <= 3; i = ++j) {
            try {
              if (i) {
                return new ActiveXObject([false, 'Msxml2', 'Msxml3', 'Microsoft'][i] + '.XMLHTTP');
              } else {
                return new XMLHttpRequest();
              }
            } catch (_error) {
              e = _error;
            }
          }
        })();
      };
      cache = (function() {
        var _cache;
        _cache = {};
        return {
          has: function(k) {
            return k in _cache;
          },
          set: function(k, v) {
            return _cache[k] = v;
          },
          get: function(k) {
            return _cache[k];
          },
          del: function(k) {
            return delete _cache[k];
          }
        };
      })();
      ajax = function(method, options) {
        var head, key, noData, o, ref, req, response, run;
        noData = /^\b(GET|HEAD)\b$/.test(method);
        req = null;
        o = extend({
          data: {},
          head: {}
        }, options);
        response = function() {
          var res;
          res = {
            url: req.responseURL || o.url,
            status: req.status
          };
          if (o.type === 'json') {
            try {
              res.data = JSON.parse(req.responseText);
            } catch (_error) {
              res.data = req.responseText;
            }
          } else if (o.type === 'html') {
            res.data = Selector.create(req.responseText);
          } else {
            res.data = req.responseText;
          }
          return res;
        };
        run = function() {
          return new Promise(function(resolve, reject) {
            req.onload = function() {
              var res, val;
              res = response();
              val = {
                ok: true,
                res: res,
                req: req
              };
              cache.set(method + ':' + o.url, val);
              return resolve(val);
            };
            req.onerror = function() {
              var res, val;
              res = response();
              val = {
                ok: false,
                res: res,
                req: req
              };
              cache.set(method + ':' + o.url, val);
              return reject(val);
            };
            return req.send((o.data && !noData ? o.data : null));
          });
        };
        if (!inst(FormData, o.data)) {
          o.data = Object.keys(o.data).map(function(key) {
            return key + '=' + o.data[key];
          }).join('&');
        }
        if (noData) {
          o.url += '?' + o.data;
        }
        if (o.bust) {
          cache.del(method + ':' + o.url);
        }
        if (cache.has(method + ':' + o.url)) {
          return new Promise(function(resolve, reject) {
            var val;
            val = cache.get(method + ':' + o.url);
            if (val.ok) {
              return resolve(val);
            } else {
              return reject(val);
            }
          });
        }
        req = xhr();
        req.open(method, o.url);
        req.setRequestHeader('X-Requested-With', 'bebop.io');
        if (!noData) {
          req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        ref = o.head;
        for (key in ref) {
          head = ref[key];
          req.setRequestHeader(key, head);
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
        }
        return run();
      };
      this.post = function(options) {
        return ajax('POST', options);
      };
      this.get = function(options) {
        return ajax('GET', options);
      };
      this.put = function(options) {
        return ajax('PUT', options);
      };
      this.del = function(options) {
        return ajax('DELETE', options);
      };
      this.head = function(options) {
        return ajax('HEAD', options);
      };
      return this;
    };
    bebop.io = new IO();
    root.$ = bebop;
    return bebop;
  });

}).call(this);
