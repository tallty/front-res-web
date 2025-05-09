import { provide, ComputedRef, inject, Ref, onMounted, onUnmounted, computed, ref } from 'vue';
import { merge } from 'lodash-es';
import dayjs, { Dayjs } from 'dayjs';
// import { JSX } from 'vue/jsx-runtime';

const KEY = 'TOAST_KEY';
let seq = 0;
const DEFAULT_DELAY = 3000;
let locked = false;

export interface toastInterface {
  id?: number;
  type?: 'error' | 'info' | 'warning';
  title: string;
  content: string | toastContentConfig[];
  delay?: number | null;
  image?: string;
  css?: Record<string, any>;
  buttonText?: string | Function;
  subButtonText?: string | Function;
  buttonCallback?: (closeFn: () => void, cancelFn: () => void) => void;
  subButtonCallback?: (closeFn: () => void, cancelFn: () => void) => void;
  _cancelTime?: Dayjs; // 取消时间
  callback?: () => void;
}

export interface toastContentConfig {
  text: string | ((record?: any) => any);
  type?: 'text' | 'link' | 'callback' | 'component'; // default: 'text'
  css?: string | object;
  link?: string;
  callback?: (closeFn: () => void, cancelFn: () => void) => void;
}

export const useToastProvide = () => {
  const toasts = ref<toastInterface[]>([]);
  provide(KEY, toasts);

  merge(toasts, {
    info: getInitToastsFn('info', toasts),
    error: getInitToastsFn('error', toasts),
    warning: getInitToastsFn('warning', toasts),
    deleteById: getDeleteToastFn(toasts),
    cancelById: getCancelToastFn(toasts),
    cleanUp: getCleanUpFn(toasts),
  });

  return { toasts };
};

const useToast = () => {
  const toasts = inject<
    Ref<toastInterface[]> & {
      info: (opts: toastInterface) => Promise<void>;
      error: (opts: toastInterface) => Promise<void>;
      warning: (opts: toastInterface) => Promise<void>;
      deleteById: (id: number) => void;
      cancelById: (id: number) => void;
      cleanUp: () => void;
    }
  >(KEY)!;

  return { toasts };
};

const getInitToastsFn = (type: 'error' | 'info' | 'warning', toasts: Ref<toastInterface[]>) => {
  return (opts: toastInterface) => {
    return new Promise<void>((resolve, reject) => {
      if (locked) return;
      locked = true;

      setTimeout(() => {
        locked = false;
      }, 1000);
      const id = seq++;

      toasts.value.push({ ...opts, type, id });

      if (opts.delay) {
        setTimeout(() => {
          getDeleteToastFn(toasts)(id);
        }, opts.delay || DEFAULT_DELAY);
      }

      const intervalId = setInterval(() => {
        const existsIndex = toasts.value.findIndex(toast => toast.id === id);

        if (existsIndex < 0) {
          // toast 消失，成功被删除
          clearInterval(intervalId);
          resolve();
        } else {
          // toast 存在，被取消，未被删除，检测到时间已到，删除，并 reject
          const existToast = toasts.value[existsIndex];
          if (existToast._cancelTime && dayjs().diff(existToast._cancelTime) > 0) {
            clearInterval(intervalId);
            toasts.value.splice(existsIndex, 1);
            reject();
          }
        }
      }, 500);
    });
  };
};

const getDeleteToastFn = (toasts: Ref<toastInterface[]>) => {
  return (id: number) => {
    const existsIndex = toasts.value.findIndex(toast => toast.id === id);
    if (existsIndex > -1) {
      toasts.value.splice(existsIndex, 1);
    }
  };
};

const getCancelToastFn = (toasts: Ref<toastInterface[]>) => {
  return (id: number) => {
    const existsIndex = toasts.value.findIndex(toast => toast.id === id);
    if (existsIndex > -1) {
      toasts.value.splice(existsIndex, 1, {
        ...toasts.value[existsIndex],
        _cancelTime: dayjs(),
      });
    }
  };
};

const getCleanUpFn = (toasts: Ref<toastInterface[]>) => {
  return () => {
    toasts.value = toasts.value.map(toast => ({
      ...toast,
      _cancelTime: dayjs(),
    }));
  };
};

export const useToastCard = (props: any, jumpRoute: (path: string) => void) => {
  const { toasts } = useToast();

  const onSubmit = () => {
    if (typeof props.toast.buttonCallback === 'function') {
      props.toast.buttonCallback(onClose, onCancel);
    } else {
      onClose();
    }
  };

  const onSubButtonSubmit = () => {
    if (typeof props.toast.subButtonCallback === 'function') {
      props.toast.subButtonCallback(onClose, onCancel);
    } else {
      // subButton 默认走 reject
      onCancel();
    }
  };

  const onClose = () => {
    toasts.deleteById(props.toast.id!);
  };

  const onCancel = () => {
    toasts.cancelById(props.toast.id!);
  };

  const time = ref(0);
  let intervalId: any = 0;

  onMounted(() => {
    if (props.toast.delay) {
      // 需要倒计时
      time.value = props.toast.delay;
      intervalId = setInterval(() => {
        if (time.value < 0) {
          onSubmit();
        }
        time.value -= 1000;
      }, 1000);
    }
  });

  onUnmounted(() => {
    clearInterval(intervalId);
  });

  const contentConfig = computed(() =>
    typeof props.toast.content === 'string'
      ? [{ text: props.toast.content, type: 'text' }]
      : props.toast.content,
  );

  const onContentCallback = (config: toastContentConfig) => {
    if (config.callback) {
      return config.callback(onClose, onCancel);
    } else if ((config.type === 'link' || config.type === 'component') && config.link) {
      jumpRoute(config.link);
      onCancel();
    }
  };

  const subButtonText = computed(() => {
    return typeof props.toast.subButtonText === 'function'
      ? props.toast.subButtonText(time.value)
      : props.toast.subButtonText;
  });

  const buttonText = computed(() => {
    return typeof props.toast.buttonText === 'function'
      ? props.toast.buttonText(time.value)
      : props.toast.buttonText;
  });

  return {
    onSubmit,
    onSubButtonSubmit,
    contentConfig,
    onContentCallback,
    onClose,
    onCancel,
    time,
    subButtonText,
    buttonText,
  };
};

export default useToast;
