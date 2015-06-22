((root, factory) ->
  if define?
    define ['exports'], (exports) ->
      root.bebop = factory root, exports
  else if exports?
    factory root, exports
  else
    root.bebop = factory root, {})(this, (root, bebop) ->
  doc = root.document;
  docElem = doc.documentElement;
  body = doc.body;

  match = body.matches or
    body.webkitMatchesSelector or
    body.mozMatchesSelector or
    body.msMatchesSelector or
    body.oMatchesSelector or (selector) ->
      matches = (@document or @ownerDocument).querySelectorAll selector
      i = 0
      while matches[i] && matches[i] isnt @
        i++
      !!matches[i]

  func = 'f'
  obj = 'o'
  str = 's'
  num = 'n'
  undef = 'u'

  isit = (type, item) ->
    (typeof item)[0] is type

  inst = (klas, item) ->
    item instanceof klas

  siblingFind = (node, method, criteria) ->
    siblingType = "#{method}Sibling"
    filter
    validItems
    if isit(str, criteria)
      validItems = Selector.all criteria, node.parentNode
      filter = (rawNode) ->
        found = false
        validItems.forEach((el) ->
          if rawNode is el._node
            found = true
        )
        found
    else if !criteria
      filter = () ->
        true
    else
      filter = (rawEl) ->
        criteria new Element rawEl

    while node
      node = node[siblingType]
      if node and node.nodeType is 1 and filter node
        break

    if node then new Element(node) else null

  _jsStyle = (name) ->
    lookupMap = {
      float: 'cssFloat'
    }
    if lookupMap[name]
      name = lookupMap[name]
    name;

  NNM2Obj = (nnm) ->
    l = nnm.length
    ret = {}

    while l--
      ret[nnm[l].name] = nnm[l].value
    ret

  uuid = (() ->
    counter = 0;
    () ->
      counter++
      counter.toString(16))()

  Selector = {
    create: (markup) ->
      container = doc.createElement 'div'
      container.innerHTML = markup
      new Element container.childNodes[0]

    one: (sel, context) ->
      context = if inst DOM.Element, context then context._node else context
      if sel is null
        null
      if isit str, sel
        node = (context or doc).querySelectorAll(sel)
        if node.length?
          null
        new Element node[0]
      else if sel._node?
        sel
      else
        new Element sel

    all: (selector, context) ->
      context = if inst(DOM.Element, context) then context._node else context
      new ElementList (context or doc).querySelectorAll selector
  }

  VERSION = '1.0.5';

  class Element
    constructor: (@_node) ->

    uuid: () ->
      if !@_node.id
        @_node.id = "node_#{uuid()}"
      @_node.id

    ancestors: () ->
      anc = [];
      n = @_node;
      do
        anc.push n
      while n = n.parentNode
      new ElementList(anc)

    matches: (sel) ->
      if isit str, sel and @_node isnt doc
        match.call @_node, sel
      else
        this.is sel

    is: (other) ->
      other = if (other instanceof Element) then other else new Element(other)
      other._node is @_node

    closest: (sel) ->
      if 'closest' in @_node && isit str, sel
        result = @_node.closest sel
        if result then new Element(result) else null

      ancestors = @ancestors()
      for i in ancestors.size()
        item = ancestors.item i
        if item.matches sel
          item
      null

    parent: () ->
      new Element @_node.parentNode

    next: (filter) ->
      siblingFind @_node, 'next', filter

    prev: (filter) ->
      siblingFind @_node, 'previous', filter

    hasClass: (className) ->
      @_node.classList.contains className

    addClass: (className) ->
      @_node.classList.add className

    removeClass: (className) ->
      @_node.classList.remove className

    toggleClass: (className) ->
      @_node.classList.toggle className

    data: (property, val) ->
      if isit undef, property
        att = @attr()
        Object.keys(att).reduce((data, key) ->
          if /^data\-/.test key
            data[key.replace /^data\-/, ''] = att[key]
          data
        )
      else if isit undef, val
        @_node.getAttribute "data-#{property}"
      else
        if not isit func, val
          @_node.setAttribute "data-#{property}"
        @_node.setAttribute "data-#{property}", val @_node, property

    rmData: (property) ->
      @rmAttr "data-#{property}"

    prop: (property, value) ->
      if isit undef, property
        null
      else if isit undef, value
        if property is 'parentNode'
          @parent()
        @_node[property]
      else
        @_node[property] = value

    attr: (property, value) ->
      if isit undef, property
        NNM2Obj @_node.attributes
      else if isit undef, value
        @_node.getAttribute property
      else
        @_node.setAttribute property, value

    hasAttr: (property) ->
      @_node.hasAttribute property

    rmAttr: (property) ->
      @_node.removeAttribute property

    getStyle: (property) ->
      if not @hasAttr 'style'
        null

      property = _jsStyle property
      matchedStyle = @_node.style[property]

      if matchedStyle
        matchedStyle
      else
        null

    removeStyle: (property) ->
      @removeStyles property

    removeStyles: (props) ->
      if isit str, props
        props = [props]
      for prop in props
        @_node.style[_jsStyle prop] = null

    setStyle: (property, value) ->
      newStyle = {}
      newStyle[property] = value
      @setStyles(newStyle)

    setStyles: (newStyles) ->
      if not @hasAttr 'style'
        @attr 'style', ''
      for val,key in newStyles
        styleKey = _jsStyle(key);
        @_node.style[styleKey] = val

    computeCss: (styles) ->
      computedStyles = doc.defaultView.getComputedStyle @_node
      cssMap = {}

      if isit str, styles
        computedStyles[styles]
      for style in styles
        cssMap[style] = computedStyles[style];

      cssMap


    serialize: () ->
      ret = []
      els = @_node.elements
      for el in els
        if el.disabled or el.type in ['submit', 'image']
          continue
        if el.name && el.name.length > 0
          if el.type in ['checkbox', 'radio']
            if el.checked
              ret.push "#{el.name}=#{encodeURIComponent el.value}"
          else
            ret.push "#{el.name}=#{encodeURIComponent el.value}"
      ret.join('&')

    empty: () ->
      @_node.innerHTML = ''

    html: (html) ->
      if isit undef, html
        @_node.innerHTML
      else
        @_node.innerHTML = html

    text: (text) ->
      if isit undef, text
        @_node.textContent
      else
        @_node.textContent = text

    append: (node) ->
      if isit str, node
        node = Selector.create(node)._node
      else if node instanceof Element
        node = node._node

      @_node.appendChild node

    appendTo: (node) ->
      newParent = if (node instanceof Element) then node else Selector.one node
      newParent.append @

    prepend: (node) ->
      if isit str, node
        node = Selector.create(node)._node
      else
        if node instanceof Element
          node = node._node
      child = @one '*'
      @_node.insertBefore(node, (child && child._node ? child._node : null))

    prependTo: (node) ->
      newParent = (node instanceof Element) ? node : Selector.one(node)
      newParent.prepend @

    insertBefore: (other) ->
      other = (other instanceof Element) ? other : Selector.one(other)
      other._node.parentNode.insertBefore @_node, other._node

    insertAfter: (other) ->
      other = (other instanceof Element) ? other : Selector.one(other);
      sibl = other.next();
      other._node.parentNode.insertBefore(@_node, sibl ? sibl._node : null);

    after: (node) ->
      if isit str, node
        node = Selector.create(node)
      node.insertAfter @

    before: (node) ->
      if isit str, node
        node = Selector.create node
      node.insertBefore @

    remove: () ->
      @_node.parentNode.removeChild @_node

    one: (sel) ->
      Selector.one sel, @_node

    all: (sel) ->
      Selector.all sel, @_node

    click: () ->
      evt = doc.createEvent 'MouseEvents'
      evt.initMouseEvent 'click', true, true, root, 0, 0, 0, 0, 0, false, false, false, false, 0, null
      not @_node.dispatchEvent evt

    addEventListener: (ev, fn) ->
      @_node.addEventListener ev, fn, false

    removeEventListener: (ev, fn) ->
      @_node.removeEventListener ev, fn, false

    on: (ev, fn, selector, context) ->
      event.on @, ev, fn, selector, context

    once: (ev, fn, selector, context) ->
      event.on @, ev, fn, selector, context, true

    off: (ev, fn) ->
      event.off @, ev, fn

    purge: (type, callback, recurse) ->
      evt = event;

      for cache in evt._cached
        for thisEvt in cache
          if @_node is thisEvt.obj._node and (!type or type is thisEvt.type)
            evt.off thisEvt.obj, thisEvt.type, thisEvt.raw

      if recurse
        @all('*').forEach((el)->
          el.purge type, callback, recurse
        )

    fire: (ev) ->
      event._eventData = arguments[1..]
      customEvt = doc.createEvent 'UIEvents'
      customEvt.initEvent ev, true, false
      @_node.dispatchEvent customEvt


  class ElementList
    constructor: (nodes) ->
      wrappedNodes = []
      for node in nodes
        wrappedNodes.push new Element(node)
      @nodes = wrappedNodes;

      iteratedFunctions = [
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
      ]

      getIteratedCallback = (method) =>
        () ->
          for node in @nodes
            node[method].apply(node, arguments);
        @

      for func in iteratedFunctions
        this[func] = getIteratedCallback func

    forEach: (callback) ->
      @nodes.forEach callback

    map: (callback) ->
      @nodes.map callback

    reduce: (callback, starter) ->
      @nodes.reduce callback, starter

    item: (index) ->
      if isit undef, index then null else @nodes[index]

    size: () ->
      @nodes.length

    get: (index) ->
      all = @nodes.map (node) ->
        node._node;

      if not isit undef index
        all[index]
      all


  class EventInstance
    constructor: (@e)->
      @originalTarget = new Element @e.target
      @target = new Element @e.target

    pageX: () ->
      @e.pageX
    pageY: () ->
      @e.pageY
    code: () ->
      @e.keyCode
    stop: () ->
      @noBubble().noDefault()
    noDefault: () ->
      @e.preventDefault
      @
    noBubble: () ->
      @e.stopPropagation()
      @

  class DOMEvent
    constructor: () ->
      @_cached = {}
      @_eventData = []

    _getEventCallback: (implementOn, ev, callback, selector, context, once) ->
      _uid = "cb_#{uuid()}"
      callback.__uid = _uid;
      self = this
      stringy = _uid

      wrappedListener = (e) ->
        eventWrapper = new EventInstance(e)
        selfCallee = arguments.callee
        returnControl = (wrapper) ->
          event._eventData.unshift wrapper
          callback.apply implementOn, event._eventData
          event._eventData = [];
          implementOn.removeEventListener(ev, selfCallee) if once

        if selector
          implementOn.all(selector).forEach((userEl) ->
            _eventWrapper = new EventInstance(e);
            found = true
            html = Selector.one('html');
            while userEl._node isnt _eventWrapper.target._node
              if _eventWrapper.target._node is html._node
                found = false
                break
              _eventWrapper.target = _eventWrapper.target.parent()
            returnControl(_eventWrapper) if found
          )
        else
          returnControl eventWrapper

      self._cached[stringy] or= [];
      self._cached[stringy].push({
        type: ev,
        obj: implementOn,
        fn: wrappedListener,
        raw: callback
      });
      wrappedListener

    on: (implementOn, event, callback, selector, context, once) ->
      implementOn.addEventListener event, @_getEventCallback.apply @, arguments
      implementOn

    off: (implementOn, event, callback) ->
      if not callback
        throw new Error 'no callback defined'
      stringy = callback.__uid;
      if @_cached[stringy]
        for cache in @_cached[stringy]
          if cache.raw is callback
            implementOn.removeEventListener event, cache.fn
      else
        throw new Error 'no such callback'

    ready: (fn) ->
      done = false
      add = if doc.attachEvent then 'attachEvent' else 'addEventListener'
      rem = if doc.attachEvent then 'detachEvent' else 'removeEventListener'
      pre = if doc.attachEvent then 'on' else ''
      init = (e) ->
        if e.type is 'readystatechange' and doc.readyState isnt 'complete'
          return
        (e.type is 'load' ? root : doc)[rem](pre + e.type, init, false);
        if not done and (done = true)
          fn.call root, e.type
      if doc.readyState is 'complete'
        fn.call root, 'lazy'
      else
        doc[add](pre + 'DOMContentLoaded', init, false);
        doc[add](pre + 'readystatechange', init, false);
        root[add](pre + 'load', init, false)

  event = new DOMEvent();


  Promise = (() ->
    localPromise = (callback, handler) ->
      handler = pendingHandler (resolved, rejected, value, queue, _then, i) ->
        queue = pendingHandler.q;

        if resolved isnt isit
          Promise((resolve, reject) ->
            queue.push({p: this, r: resolve, j: reject, 1: resolved, 0: rejected})
          )

        if value && isit unc, value | isit obj, value
          try
            _then = value.then;
          catch(reason)
            rejected = 0
            value = reason

        if isit func, _then
          valueHandler (resolved) ->
            (value) ->
              if _then
                _then = 0
                pendingHandler(isit, resolved, value)
          try
            _then.call(value, valueHandler(1), rejected = valueHandler(0));
          catch reason
            rejected(reason)
        else
          handler = (Resolved, Rejected) ->
            if !isit func, (Resolved = rejected ? Resolved : Rejected)
              callback
            Promise((resolve, reject) ->
              finalize(this, resolve, reject, value, Resolved)
            )
          i = 0;
          while i < queue.length
            _then = queue[i++];
            if !isit(func, resolved = _then[rejected])
              (rejected ? _then.r : _then.j)(value)
            else
              finalize(_then.p, _then.r, _then.j, value, resolved)

      handler.q = []
      callback.call(callback = {
        then: (resolved, rejected) ->
          handler resolved, rejected
        'catch': (rejected) ->
          handler 0, rejected
      }, (value) ->
        handler isit, 1, value
      , (reason) ->
        handler isit, 0, reason
      )
      callback

    finalize = (promise, resolve, reject, value, transform) ->
      setTimeout (() ->
        try
          value = transform(value);
          transform = value && (isit(obj, value) | isit(func, value)) && value.then;
          if !isit func, transform
            resolve(value);
          else if value is promise
            reject TypeError()
          else
            transform.call value, resolve, reject
        catch error
          reject(error)

      ), 0

    localPromise.resolve = ResolvedPromise;

    ResolvedPromise = (value) ->
      localPromise((resolve) ->
        resolve(value)
      )

    localPromise.reject = (reason) ->
      localPromise((resolve, reject) ->
        reject(reason)
      )

    localPromise.all = (promises) ->
      localPromise((resolve, reject, count, values) ->
        values = []
        count = promises.length || resolve(values)
        promises.map((promise, index) ->
          ResolvedPromise(promise).then(((value) ->
            values[index] = value
            --count || resolve(values)
          ), reject)
        )
      )
    localPromise
  )()

  IO () ->
    xhr = () ->
      ((a) ->
        for a in [0..4]
          try
            if a then new ActiveXObject([no, 'Msxml2', 'Msxml3', 'Microsoft'][a] + '.XMLHTTP') else new XMLHttpRequest
      )()
    cache = (() ->
      _cache = {}
      {
        has: (k) ->
          (k in _cache)

        set: (k, v) ->
          _cache[k] = v

        get: (k) ->
          _cache[k]

        del: (k) ->
          delete _cache[k]
      }
    )()

    ajax = (method, options) ->
      noData = /^\b(GET|HEAD)\b$/.test(method)
      o = extend({
        data: {}, head: {}
        }, options)

      response = () ->
        res = {
          url: req.responseURL || o.url,
          status: req.status
        }

        if o.type is 'json'
          try
            res.data = JSON.parse(req.responseText)
          catch ex
            res.data = req.responseText
        else if o.type is 'html'
          res.data = Selector.create(req.responseText);
        else
          res.data = req.responseText
        res

      run = () ->
        new Promise((resolve, reject) ->
          req.onload = () ->
            res = response();
            cache.set(o.url, {ok: true, res: res, req: req});
            resolve({res: res, req: req});

          req.onerror = () ->
            res = response();
            cache.set(o.url, {ok: false, res: res, req: req});
            reject({res: res, req: req});

          req.send(o.data && !noData ? o.data : null);
        )
      if o.bust
        cache.del o.url

      if cache.has o.url
        new Promise((resolve, reject) ->
          val = cache.get(options.url);
          if val.ok
            resolve({res: val.res, req: val.req})
          else
            reject({res: val.res, req: val.req})
        )
      req = xhr();

      if !inst(FormData, o.data)
        o.data = Object.keys(o.data).map((key) ->
          return key + '=' + o.data[key];
        ).join('&');

      if noData
        o.url += '?' + o.data

      req.open(method, o.url)
      req.setRequestHeader('X-Requested-With', 'dom.io')

      if !noData
        req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')

      for header,key in o.head
        req.setRequestHeader(key, header)

      switch o.type
        when 'json'
          req.setRequestHeader 'Accept', 'application/json, text/javascript'
        when 'html'
          req.setRequestHeader 'Accept', 'text/html'
        when 'xml'
          req.setRequestHeader 'Accept', 'application/xml, text/xml'
        when 'text'
          req.setRequestHeader 'Accept', 'text/plain'
        else
          req.setRequestHeader 'Accept', '*/*'

    }
    run()


  {
    uuid: uuid,
    VERSION: VERSION,
    Selector: Selector,
    ElementList: ElementList,
    ready: event.ready
  }
)
