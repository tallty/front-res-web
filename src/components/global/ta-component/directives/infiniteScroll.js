const ctx = '@@InfiniteScroll';

const throttle = function (fn, delay) {
  var now, lastExec, timer, context, args; //eslint-disable-line

  var execute = function () {
    fn.apply(context, args);
    lastExec = now;
  };

  return function () {
    context = this;
    args = arguments;

    now = Date.now();

    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    if (lastExec) {
      var diff = delay - (now - lastExec);
      if (diff < 0) {
        execute();
      } else {
        timer = setTimeout(() => {
          execute();
        }, diff);
      }
    } else {
      execute();
    }
  };
};

var getScrollTop = function (element) {
  if (element === window) {
    return Math.max(window.pageYOffset || 0, document.documentElement.scrollTop);
  }

  return element.scrollTop;
};

var getComputedStyle = document.defaultView.getComputedStyle;

var getScrollEventTarget = function (element) {
  var currentNode = element;
  // bugfix, see http://w3help.org/zh-cn/causes/SD9013 and http://stackoverflow.com/questions/17016740/onscroll-function-is-not-working-for-chrome
  while (
    currentNode &&
    currentNode.tagName !== 'HTML' &&
    currentNode.tagName !== 'BODY' &&
    currentNode.nodeType === 1
  ) {
    var overflowY = getComputedStyle(currentNode).overflowY;
    if (overflowY === 'scroll' || overflowY === 'auto') {
      return currentNode;
    }
    currentNode = currentNode.parentNode;
  }
  return window;
};

var getVisibleHeight = function (element) {
  if (element === window) {
    return document.documentElement.clientHeight;
  }

  return element.clientHeight;
};

var getElementTop = function (element) {
  if (element === window) {
    return getScrollTop(window);
  }
  return element.getBoundingClientRect().top + getScrollTop(window);
};

var isAttached = function (element) {
  var currentNode = element.parentNode;
  while (currentNode) {
    if (currentNode.tagName === 'HTML') {
      return true;
    }
    if (currentNode.nodeType === 11) {
      return false;
    }
    currentNode = currentNode.parentNode;
  }
  return false;
};

var doBind = function () {
  if (this.binded) return; // eslint-disable-line
  this.binded = true;

  var _this = this; // eslint-disable-line
  var element = this.el;

  var throttleDelayExpr = element.getAttribute('infinite-scroll-throttle-delay');
  var throttleDelay = 200;
  if (throttleDelayExpr) {
    throttleDelay = Number(_this.vm[throttleDelayExpr] || throttleDelayExpr);
    if (isNaN(throttleDelay) || throttleDelay < 0) {
      throttleDelay = 200;
    }
  }
  _this.throttleDelay = throttleDelay;

  _this.scrollEventTarget = getScrollEventTarget(element);
  _this.scrollListener = throttle(doCheck.bind(_this), _this.throttleDelay);
  _this.scrollEventTarget.addEventListener('scroll', _this.scrollListener);

  var disabledExpr = element.getAttribute('infinite-scroll-disabled');
  var disabled = false;

  if (disabledExpr) {
    _this.vm.$watch(disabledExpr, function (value) {
      _this.disabled = value;
      if (!value && _this.immediateCheck) {
        setTimeout(() => {
          doCheck.call(_this);
        });
      }
    });
    disabled = Boolean(_this.vm[disabledExpr]);
  }
  _this.disabled = disabled;

  var distanceExpr = element.getAttribute('infinite-scroll-distance');
  var distance = 0;
  if (distanceExpr) {
    distance = Number(_this.vm[distanceExpr] || distanceExpr);
    if (isNaN(distance)) {
      distance = 0;
    }
  }
  _this.distance = distance;

  var immediateCheckExpr = element.getAttribute('infinite-scroll-immediate-check');
  var immediateCheck = true;
  if (immediateCheckExpr) {
    immediateCheck = Boolean(_this.vm[immediateCheckExpr]);
  }
  _this.immediateCheck = immediateCheck;

  if (immediateCheck) {
    setTimeout(() => {
      doCheck.call(_this);
    });
  }

  var eventName = element.getAttribute('infinite-scroll-listen-for-event');
  if (eventName) {
    _this.vm.$on(eventName, function () {
      setTimeout(() => {
        doCheck.call(_this);
      });
    });
  }
};

var doCheck = function (force) {
  var scrollEventTarget = this.scrollEventTarget;
  var element = this.el;
  var distance = this.distance;

  if (force !== true && this.disabled) return; //eslint-disable-line
  var viewportScrollTop = getScrollTop(scrollEventTarget);
  var viewportBottom = viewportScrollTop + getVisibleHeight(scrollEventTarget);

  var shouldTrigger = false;

  if (scrollEventTarget === element) {
    shouldTrigger = scrollEventTarget.scrollHeight - viewportBottom <= distance;
  } else {
    var elementBottom =
      getElementTop(element) -
      getElementTop(scrollEventTarget) +
      element.offsetHeight +
      viewportScrollTop;

    shouldTrigger = viewportBottom + distance >= elementBottom;
  }

  if (shouldTrigger && this.expression) {
    this.expression();
  }
};

// var myInstance = null;

var infiniteScrollDirective = {
  mounted(el, binding, vnode) {
    el[ctx] = {
      el,
      vm: binding.instance,
      expression: binding.value,
    };
    // const myInstance = el[ctx];
    var args = arguments;

    el[ctx].vm.$nextTick(function () {
      if (isAttached(el)) {
        doBind.call(el[ctx], args);
      }

      el[ctx].bindTryCount = 0;

      var tryBind = function () {
        if (el[ctx].bindTryCount > 10) return; //eslint-disable-line
        el[ctx].bindTryCount++;
        if (isAttached(el)) {
          doBind.call(el[ctx], args);
        } else {
          setTimeout(tryBind, 50);
        }
      };

      tryBind();
    });
  },
};

export default infiniteScrollDirective;
