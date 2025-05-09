import { Ref, WritableComputedRef } from 'vue';

export const loadingPromise = (
  loadingRef: Ref<boolean> | WritableComputedRef<boolean>,
  promise: Promise<any>
) => {
  // 搭配后端 430 status code 的 1秒验证
  loadingRef.value = true;
  return Promise.allSettled([timeoutPromise(1100), promise]).finally(() => {
    console.log('loading');

    loadingRef.value = false;
  });
};

export const timeoutPromise = (time: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log('/////timeout');

      resolve();
    }, time);
  });
};
