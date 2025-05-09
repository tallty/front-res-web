import { ComputedRef, ref, Ref } from 'vue';

const landingStyle = ref({});
const activeRelated: Ref<any> = ref(null);

const useDraggableLanding = (enable?: ComputedRef<boolean>) => {
  // const onMove = () => {

  const onMove = (evt: any) => {
    if (enable?.value) {
      if (evt.related !== activeRelated.value && activeRelated.value) {
        activeRelated.value.style.background = 'none';
      }
      activeRelated.value = evt.related;
      evt.related.style.background = '#EFF3FD';
    }

    return true;
  };

  const onDragEnd = (e: any) => {
    activeRelated.value.style.background = 'none';
  };

  return {
    landingStyle,
    onMove,
    onDragEnd,
  };
};

export default useDraggableLanding;
