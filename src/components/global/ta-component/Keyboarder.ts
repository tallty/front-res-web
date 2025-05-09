interface KeyboarderCallbackItem {
  type: 'once' | 'persistent';
  callback: () => void;
}
type extraKeyType = 'ctrl' | 'command' | 'shift' | 'alt';

const KEY_SPLIT = '@';

export class Keyboarder {
  callbackMap: Record<string, KeyboarderCallbackItem[]> = {};

  getCallbackMapKey(key: string, extraKeys: extraKeyType[]) {
    const code = Keyboarder.key2codeMap[key];
    return [code, ...[...extraKeys].sort()].join(KEY_SPLIT);
  }

  addCallback(
    type: 'once' | 'persistent',
    key: string,
    extraKeys: extraKeyType[],
    callback: () => void,
  ) {
    const callbackKey = this.getCallbackMapKey(key, extraKeys);
    if (!this.callbackMap[callbackKey]) this.callbackMap[callbackKey] = [];
    this.callbackMap[callbackKey].push({ type, callback });
  }

  once(key: string, extraKeys: extraKeyType[], callback: () => void) {
    this.addCallback('once', key, extraKeys, callback);
  }

  persistent(key: string, extraKeys: extraKeyType[], callback: () => void) {
    this.addCallback('persistent', key, extraKeys, callback);
  }

  // persistentTimerIdMap: Record<string, any> = {};
  // persistentTrigger(key: string, callback: () => void) {
  //   let times = 0;
  //   this.persistentTimerIdMap[key] = setTimeout(() => {
  //     callback();
  //     times++;
  //   }, Math.max(500 - 2 * times - times ** 2, 100));
  // }

  execute = (event: any) => {
    // event.preventDefault();
    const key = [
      event.keyCode,
      ...[
        event.ctrlKey && 'ctrl',
        event.altKey && 'alt',
        event.shiftKey && 'shift',
        event.metaKey && 'command',
      ]
        .sort()
        .filter(i => i),
    ].join(KEY_SPLIT);

    (this.callbackMap[key] || []).forEach((item: KeyboarderCallbackItem) => {
      if (item.type === 'once') {
        item.callback();
      } else if (item.type === 'persistent') {
        item.callback();
        // this.persistentTrigger(key, item.callback);
      }
    });
  };

  connect() {
    document.addEventListener('keydown', this.execute.bind(this));
    // document.addEventListener('keyup', this.execute.bind(this));
  }

  disconnect() {
    document.removeEventListener('keydown', this.execute.bind(this));
  }

  static key2codeMap: Record<string, number> = {
    tab: 9,
    enter: 13,
    space: 32,
    f1: 112,
    f2: 113,
    f3: 114,
    f4: 115,
    f5: 116,
    f6: 117,
    f7: 118,
    f8: 119,
    f9: 120,
    f10: 121,
    f11: 122,
    f12: 123,
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
    '0': 48,
    '1': 49,
    '2': 50,
    '3': 51,
    '4': 52,
    '5': 53,
    '6': 54,
    '7': 55,
    '8': 56,
    '9': 57,
    'left arrow': 37,
    'up arrow': 38,
    'right arrow': 39,
    'down arrow': 40,
    'decimal point': 110,
    'semi-colon': 186,
    'equal sign': 187,
    comma: 188,
    dash: 189,
    period: 190,
    'forward slash': 191,
    'grave accent': 192,
    'open bracket': 219,
    'back slash': 220,
    'close bracket': 221,
    'single quote': 222,
    'numpad 0': 96,
    'numpad 1': 97,
    'numpad 2': 98,
    'numpad 3': 99,
    'numpad 4': 100,
    'numpad 5': 101,
    'numpad 6': 102,
    'numpad 7': 103,
    'numpad 8': 104,
    'numpad 9': 105,
    shift: 16,
    ctrl: 17,
    alt: 18,
    'caps lock': 20,
    backspace: 8,
    delete: 46,
    escape: 27,
    'Windows Key': 91,
    'Left command': 91,
    'right window key': 92,
    'Windows Menu': 93,
    multiply: 106,
    add: 107,
    subtract: 109,
    divide: 111,
  };
}
