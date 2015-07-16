((root, factory) ->
  if typeof define is 'function' and define.amd
    define ['exports'], (exports) ->
      root.bebop = factory root, exports

  else if typeof exports isnt 'undefined'
    factory root, exports
  else
    root.bebop = factory root, {}
)(self, (root, bebop) ->
  slice = [].slice
  doc = root.document
  docElem = doc.documentElement
  body = doc.body
  matchPolyFill = (selector) ->
    element = this
    matches = (element.document or element.ownerDocument).querySelectorAll selector
    i = 0
    i++ while matches[i] and matches[i] isnt element
    if matches[i] then true else false
  match = body.matches or
    body.webkitMatchesSelector or
    body.mozMatchesSelector or
    body.msMatchesSelector or
    body.oMatchesSelector or
    matchPolyFill

  func = 'f'
  obj = 'o'
  str = 's'
  undef = 'u'

  _is = (type, item) ->
    (typeof item)[0] is type

  inst = (klas, item) ->
    item instanceof klas

  uuid = (->
    counter = 0
    () ->
      counter++
      counter.toString 16
  )()

  extend = (target, src) ->
    for own key,value of src
      target[key] = value
    target

  extend bebop, {
    uuid: uuid,
    VERSION: '1.0.5'
  }


  Selector = {
    create: (markup) ->
      container = doc.createElement 'div'
      container.innerHTML = markup
      new Element container.childNodes[0]

    one: (selector, context) ->
      context = if inst bebop.Element, context then context._node else context
      if not selector
        return null
      else if _is str, selector
        node = (context or doc).querySelectorAll selector
        if not node.length
          return null
        return new Element node[0]
      else if selector and selector._node
        return selector
      else
        return new Element selector

    all: (selector, context) ->
      context = if inst bebop.Element, context then context._node else context
      new ElementList (context or doc).querySelectorAll selector
  }

  extend bebop, Selector

  oldBebop =
    $: root.$
    bebop: root.bebop


  noConflict = (deep) ->
    if deep
      root.bebop = oldBebop.bebop
    root.$ = oldBebop.$
    bebop

  extend bebop, {
    noConflict: noConflict
  }

  siblingFind = (node, method, criteria) ->
    siblingType = "#{method}Sibling"
    filter = null
    validItems = null

    if _is(str, criteria)
      validItems = Selector.all criteria, node.parentNode
      filter = (rawNode) ->
        found = false
        validItems.forEach((el) ->
          found = true if rawNode is el._node
        )
        found
    else if not criteria
      filter = () -> true
    else
      filter = (rawEl) ->
        criteria new Element rawEl

    while node
      node = node[siblingType]
      if node and node.nodeType is 1 and filter node
        break

    if node then new Element node else null

  _jsStyle = (name) ->
# will be rewritten if there ever comes something else
    if name is 'float' then 'cssFloat' else name

  nnm2obj = (nnm) -> # nnm = NamedNodeMap
    ret = {}
    ret[property.name] = property.value for property in nnm
    ret

  class Element
    constructor: (@_node) ->

    uuid: ->
      unless @_node.id
        @_node.id = "node_#{uuid()}"
      @_node.id

    region: ->
      region =
        width: @prop 'offsetWidth'
        height: @prop 'offsetHeight'

      box = @_node.getBoundingClientRect()
      clientTop = docElem.clientTop || body.clientTop || 0
      clientLeft = docElem.clientLeft || body.clientLeft || 0
      scrollTop = root.pageYOffset || docElem.scrollTop || body.scrollTop
      scrollLeft = root.pageXOffset || docElem.scrollLeft || body.scrollLeft
      region.top = box.top + scrollTop - clientTop
      region.left = box.left + scrollLeft - clientLeft
      region.bottom = region.top + region.height
      region.right = region.left + region.width

      region

    intersects: (other) ->
      me = @region()
      you = other.region()
      !(
        me.left > you.right || me.right < you.left || me.top > you.bottom || me.bottom < you.top ||
          you.left > me.right || you.right < me.left || you.top > me.bottom || you.bottom < me.top
      )

    ancestors: ->
      n = this._node
      anc = [n]
      anc.push n while n = n.parentNode
      new ElementList anc

    matches: (sel) ->
      if _is(str, sel)and @_node isnt doc
        return match.call @_node, sel
      @is sel

    is: (other) ->
      other = if inst bebop.Element, other then other else new Element other
      other._node is @_node

    closest: (sel) ->
      if 'closest' of @_node and _is str, sel
        result = @_node.closest sel
        return if result then new Element result else null
      ancestors = @ancestors()
      size = ancestors.size()
      i = 0
      while i < size
        item = ancestors.item(i)
        if item.matches sel
          return item
        i++
      null

    parent: ->
      new Element @_node.parentNode

    next: (filter) ->
      siblingFind @_node, 'next', filter

    prev: (filter) ->
      siblingFind @_node, 'previous', filter

    hasClass: (className) ->
      @_node.classList.contains className

    addClass: (className) ->
      @_node.classList.add className
      @

    removeClass: (className) ->
      @_node.classList.remove className
      @

    toggleClass: (className) ->
      @_node.classList.toggle className
      @

    data: (property, value) ->
      if _is undef, property
        att = @attr()
        return Object.keys(att).reduce((data, key)->
          if /^data\-/.test key
            data[key.replace /^data\-/, ''] = att[key]
          data
        , {})
      else if _is undef, value
        return @attr 'data-' + property
      else
        if _is func, value
          @attr 'data-' + property, value.call @, property
        else
          @attr 'data-' + property, value
        return @

    rmData: (property) ->
      @rmAttr 'data-' + property
      @

    prop: (property, value) ->
      if _is undef, property
        return null
      else if _is undef, value
        return @_node[property]
      else
        @_node[property] = value
        return @

    attr: (property, value) ->
      if _is undef, property
        return nnm2obj @_node.attributes
      else if _is undef,value
        return @_node.getAttribute property
      else
        @_node.setAttribute property, value
        return @

    hasAttr: (property) ->
      @_node.hasAttribute property

    rmAttr: (property) ->
      @_node.removeAttribute property
      @

    getStyle: (property) ->
      unless @hasAttr 'style'
        return null
      property = _jsStyle property
      if @_node.style[property] then @_node.style[property] else null

    removeStyle: (property) ->
      @removeStyles [property]

    removeStyles: (properties) ->
      if _is str, properties
        properties = [properties]
      for prop in properties
        prop = _jsStyle(prop)
        @_node.style[prop] = null
      @

    setStyle: (property, value) ->
      style = {}
      style[property] = value
      @setStyles style

    setStyles: (newStyles) ->
      unless @hasAttr 'style'
        @attr 'style', ''
      for own key,value of newStyles
        @_node.style[_jsStyle key] = value
      @
    computeCss: (styles) ->
      computedStyles = doc.defaultView.getComputedStyle @_node
      cssMap = {}

      if _is str, styles
        return computedStyles[styles]

      for style in styles
        cssMap[style] = computedStyles[style]

      cssMap

    serialize: ->
      ret = []
      for el in @_node.elements
        if el.disabled or el.type is 'submit' or el.type is 'image'
          continue
        if el.name and el.name.length
          if el.type is 'checkbox' or el.type is 'radio'
            if el.checked
              ret.push el.name + '=' + encodeURIComponent el.value
          else
            ret.push el.name + '=' + encodeURIComponent el.value
      ret.join('&')
    empty: ->
      @_node.innerHTML = ''
      @
    html: (html) ->
      if _is undef, html
        return @_node.innerHTML
      @_node.innerHTML = html
      @
    text: (text) ->
      if _is undef, text
        return @_node.innerText
      @_node.innerText = text
      @

    append: (node) ->
      if _is str, node
        node = Selector.create(node)._node
      else if inst bebop.Element, node
        node = node._node
      @_node.appendChild node
      @

    appendTo: (node) ->
      newParent = if inst bebop.Element, node then node else Selector.one node
      newParent.append @
      @

    prepend: (node) ->
      if _is str, node
        node = Selector.create(node)._node
      else if inst bebop.Element, node
        node = node._node
      child = @one '*'
      @_node.insertBefore node, if child and child._node then child._node else null
      @

    prependTo: (node) ->
      newParent = if inst bebop.Element, node then node else Selector.one node
      newParent.prepend @
      @

    insertBefore: (other) ->
      other = if inst bebop.Element, other then other else Selector.one other
      other._node.parentNode.insertBefore @_node, other._node
      @

    insertAfter: (other) ->
      other = if inst bebop.Element, other then other else Selector.one other
      sibl = other.next()
      node = if sibl then sibl._node else null
      other._node.parentNode.insertBefore @_node, node
      @
    after: (node) ->
      if _is str, node
        node = Selector.create node
      node.insertAfter @
      @
    before: (node) ->
      if _is str, node
        node = Selector.create node
      node.insertBefore this
      @

    remove: ->
      @_node.parentNode.removeChild @_node
      @

    one: (sel) ->
      Selector.one sel, @_node
    all: (sel) ->
      Selector.all sel, @_node

    click: ->
      evt = doc.createEvent 'MouseEvents'
      evt.initMouseEvent 'click', true, true, root, 0, 0, 0, 0, 0, false, false, false, false, 0, null
      !@_node.dispatchEvent evt

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
      evt = event

      for idx,cache of evt._cached
        for singleEvent in cache
          if @_node is singleEvent.obj._node and (!type or type is singleEvent.type)
            evt.off singleEvent.obj, singleEvent.type, singleEvent.raw
      if recurse
        this.all('*').forEach((el) ->
          el.purge type, callback, recurse
        )
    fire: (ev) ->
      event._eventData = slice.call arguments, 1
      customEvt = doc.createEvent 'UIEvents'
      customEvt.initEvent ev, true, false
      @_node.dispatchEvent customEvt
  bebop.Element = Element

  class ElementList
    constructor: (nodes) ->
      wrappedNodes = (new Element node for node in nodes)
      @nodes = wrappedNodes
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
        () =>
          for node in @nodes
            node[method].apply node, arguments
          @

      for _func in iteratedFunctions
        @[_func] = getIteratedCallback _func

    forEach: (callback) ->
      @nodes.forEach callback
    map: (callback) ->
      @nodes.map callback
    reduce: (callback, start) ->
      @nodes.reduce callback, start
    item: (index) ->
      if _is undef, index then null else @nodes[index]
    size: ->
      @nodes.length
    get: (index) ->
      all = @nodes.map (node) ->
        node._node
      unless _is undef, index then all[index] else all

  bebop.ElementList = ElementList

  class EventInstance
    constructor: (e) ->
      @_e = e
      @originalTarget = new Element e.target
      @target = new Element e.target

    pageX: ->
      @_e.pageX
    pageY: ->
      @_e.pageY
    code: ->
      @_e.keyCode
    stop: ->
      @.noBubble().noDefault()
    noDefault: ->
      @_e.preventDefault()
      @
    noBubble: ->
      @_e.stopPropagation()
      @

  class _Event
    constructor: ->
      @_cached = {}
      @_eventData = []
    _getEventCallback: (implementOn, ev, callback, selector, context, once) ->
      _uid = 'cb_' + uuid()
      callback.__uid = _uid
      stringy = _uid
      wrappedListener = (e) ->
        eventWrapper = new EventInstance e
        _eventWrapper = null
        selfCallee = arguments.callee
        returnControl = (wrapper) ->
          event._eventData.unshift wrapper
          callback.apply implementOn, event._eventData
          event._eventData = []
          if once
            implementOn.removeEventListener ev, selfCallee
        if selector
          implementOn.all(selector).forEach (userEl) ->
            _eventWrapper = new EventInstance e
            found = true
            html = Selector.one 'html'
            while userEl._node isnt _eventWrapper.target._node
              if _eventWrapper.target._node is html._node
                found = false
                break
              _eventWrapper.target = _eventWrapper.target.parent()
            if found
              returnControl _eventWrapper
          return
        returnControl eventWrapper
      @_cached[stringy] or= []
      @_cached[stringy].push {
        type: ev
        obj: implementOn
        fn: wrappedListener
        raw: callback
      }

      wrappedListener
    on: (implementOn, event, callback, selector, context, once) ->
      implementOn.addEventListener event, @_getEventCallback.apply @, arguments
      implementOn
    off: (implementOn, event, callback) ->
      unless callback
        throw new Error 'no callback defined'
      stringy = callback.__uid
      if @_cached[stringy]
        cache = @_cached[stringy]
        for singleEvent in cache
          if singleEvent.raw is callback
            implementOn.removeEventListener event, singleEvent.fn
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
        (if e.type is 'load' then root else doc)[rem](pre + e.type, init, false)
        if not done and (done = true)
          fn.call root, e.type

      if doc.readyState is 'complete'
        fn.call root, 'lazy'
      else
        doc[add](pre + 'DOMContentLoaded', init, false)
        doc[add](pre + 'readystatechange', init, false)
        root[add](pre + 'load', init, false)

  event = new _Event()
  bebop.ready = event.ready

  Promise = (->
    localPromise = (callback) ->
      handler = pendingHandler = (resolved, rejected, value) ->
        _then = null
        i = 0
        queue = pendingHandler.q
        if resolved isnt _is
          return Promise((resolve, reject) ->
            queue.push
              p: @
              r:resolve
              j:reject
              1:resolved
              0:rejected
            undef
          )
        if value and (_is(func, value) or _is obj, value)
          try
            _then = value.then
          catch reason
            rejected = 0
            value = reason
        if _is func, _then
          valueHandler = (resolved) ->
            (value) ->
              if _then
                _then = 0
                pendingHandler _is, resolved, value
          try
            rejected = valueHandler 0
            _then.call value, valueHandler(1), rejected
          catch reason
            rejected reason
        else
          handler = (Resolved, Rejected) ->
            candidate = Resolved = if rejected then Resolved else Rejected
            unless _is func, candidate
              return callback
            return Promise((resolve, reject) ->
              finalize @, resolve, reject, value, Resolved
            )
          while i < queue.length
            _then = queue[i++]
            resolved = _then[rejected]
            unless _is func, resolved
              candidate = if rejected then _then.r else _then.j
              candidate value
            else
              finalize _then.p, _then.r, _then.j, value, resolved
      handler.q = []
      callback.call(callback = {
        then: (resolved, rejected) ->
          handler resolved, rejected
        'catch': (rejected) ->
          handler 0, rejected
      },
        (value) -> handler(_is, 1, value),
        (reason) -> handler(_is, 0, reason) )
      callback

    finalize = (promise, resolve, reject, value, transform) ->
      setTimeout ->
        try
          value = transform value
          if value and (_is(obj, value) or _is func, value)
            transform = value.then
          unless _is func, transform
            resolve value
          else if value is promise
            reject TypeError()
          else
            transform.call value, resolve, reject
        catch err
          reject err
      , 0
    ResolvedPromise = (value) ->
      localPromise (resolve) ->
        resolve value

    localPromise.resolve = ResolvedPromise
    localPromise.reject = (reason) ->
        localPromise (resolve, reject) ->
            reject reason

    localPromise.all = (promises) ->
        localPromise (resolve, reject, count, values) ->
            values = []
            count = promises.length or resolve values
            promises.map (promise, index) ->
                ResolvedPromise(promise).then((value) ->
                  values[index] = value
                  --count or resolve values
                , reject)
    localPromise;
  )()

  bebop.Promise = Promise

  IO = ->
    xhr = ->
      (->
        for i in [0..3]
          try
            if i
              return new ActiveXObject([no, 'Msxml2' ,'Msxml3', 'Microsoft'][i] + '.XMLHTTP')
            else
              return new XMLHttpRequest()
          catch e
      )()
    cache = (->
      _cache = {}
      {
        has: (k) ->
          k of _cache
        set: (k, v) ->
          _cache[k] = v
        get: (k) ->
          _cache[k]
        del: (k) ->
          delete _cache[k]
      }
    )()

    ajax = (method, options) ->
      noData = /^\b(GET|HEAD)\b$/.test method
      req = null
      o = extend {
        data: {}
        head: {}
      }, options

      response = () ->
        res =
          url: req.responseURL or o.url
          status: req.status
        if o.type is 'json'
          try
            res.data = JSON.parse req.responseText
          catch
            res.data = req.responseText
        else if o.type is 'html'
          res.data = Selector.create req.responseText
        else
          res.data = req.responseText

        res

      run = ->
        new Promise (resolve, reject) ->
          req.onload = ->
            res = response()
            val =
              ok: true
              res: res
              req: req
            cache.set method+':'+o.url, val
            resolve val
          req.onerror = ->
            res = response()
            val =
              ok: false
              res: res
              req: req
            cache.set method+':'+o.url, val
            reject val
          req.send (if o.data and not noData then o.data else null )


      unless inst FormData, o.data
        o.data = Object.keys(o.data).map((key) ->
          key + '=' + o.data[key]
        ).join '&'

      if noData
        o.url += '?'+o.data

      if o.bust
        cache.del method+':'+o.url
      if cache.has method+':'+o.url
        return new Promise (resolve, reject) ->
          val = cache.get method+':'+o.url
          if val.ok then resolve val else reject val
      req = xhr()

      req.open method, o.url
      req.setRequestHeader 'X-Requested-With', 'bebop.io'

      unless noData
        req.setRequestHeader 'Content-Type', 'application/x-www-form-urlencoded'

      for key,head of o.head
        req.setRequestHeader key, head

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
          req.setRequestHeader 'Accept', '*/'.concat '*'
      run()

    @post = (options) ->
      ajax 'POST', options
    @get = (options) ->
      ajax 'GET', options
    @put = (options) ->
      ajax 'PUT', options
    @del = (options) ->
      ajax 'DELETE', options
    @head = (options) ->
      ajax 'HEAD', options
    @

  bebop.io = new IO()
  root.$ = bebop
  bebop
)
