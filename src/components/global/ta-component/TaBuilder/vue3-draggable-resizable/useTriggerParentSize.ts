import { ref, provide, watch, inject, Ref } from 'vue';
const TriggerMeasureparent_key = 'TriggerMeasureParent';

// 在完成最高层级父级渲染时，才触发s测量 parent 宽度

const provideTriggerMeasureParent = () => {
  const triggerMeasureParentFlag = ref(false);
  provide(TriggerMeasureparent_key, triggerMeasureParentFlag);
  return { triggerMeasureParentFlag };
};

const watchTriggerMeasureParent = (fn: () => void) => {
  const triggerMeasureParentFlag = inject<Ref<boolean> | null>(TriggerMeasureparent_key, null);
  watch(() => triggerMeasureParentFlag?.value, fn);
  return { triggerMeasureParentFlag };
};

export { provideTriggerMeasureParent, watchTriggerMeasureParent };
