// modify from vue-click-outside
import { DirectiveBinding } from 'vue';

function validate(binding: any) {
  if (typeof binding.value !== 'function') {
    console.warn(
      '[Vue-click-outside:] provided expression',
      binding.expression,
      'is not a function.',
    );
    return false;
  }

  return true;
}

function isServer(vNode: any) {
  return typeof vNode.componentInstance !== 'undefined' && vNode.componentInstance.$isServer;
}

const directive = {
  mounted: function (el: any, binding: DirectiveBinding<any>, vNode: any) {
    if (!validate(binding)) return;

    // Define Handler and cache it on the element
    function handler(e: any) {
      const elements = e.path || (e.composedPath && e.composedPath());
      elements && elements.length > 0 && elements.unshift(e.target);

      if (el.contains(e.target)) return;

      el.__vueClickOutside__.callback(e);
    }

    // add Event Listeners
    el.__vueClickOutside__ = {
      handler: handler,
      callback: binding.value,
    };
    const clickHandler = 'ontouchstart' in document.documentElement ? 'touchstart' : 'click';
    !isServer(vNode) && document.addEventListener(clickHandler, handler);
  },

  update: function (el: any, binding: any) {
    if (validate(binding)) el.__vueClickOutside__.callback = binding.value;
  },

  unMounted: function (el: any, binding: any, vNode: any) {
    // Remove Event Listeners
    const clickHandler = 'ontouchstart' in document.documentElement ? 'touchstart' : 'click';
    !isServer(vNode) &&
      el.__vueClickOutside__ &&
      document.removeEventListener(clickHandler, el.__vueClickOutside__.handler);
    delete el.__vueClickOutside__;
  },
};

export default directive;
