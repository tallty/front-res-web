import { computed, ref, nextTick, watch } from 'vue';

// props 里 需要 store， emit 有 update:loading + change
const useScrollLoading = (props: any, emit: any) => {
  const localLoading = computed({
    get: () => props.store.loading.value,
    set: (val: boolean) => emit('update:loading', val),
  });

  const finished = ref(false);

  watch(
    localLoading,
    () => {
      nextTick(() => {
        if (props.store.totalPages.value === 1) finished.value = true;
        if (
          !localLoading.value &&
          props.store.currentPage.value > props.store.totalPages.value
        ) {
          finished.value = true;
        } else {
          finished.value = false;
        }
      });
    },
    { immediate: true }
  );

  const loadMore = () => {
    if (!props.scrollLoading) return;
    if (localLoading.value) return;

    const page = props.store.currentPage.value + 1;
    if (props.store.currentPage.value >= props.store.totalPages.value) {
      finished.value = true;
    } else {
      finished.value = false;
      emit('change', page, {}, props.store.perPage.value, true);
    }
  };

  return {
    localLoading,
    finished,
    loadMore,
  };
};

export default useScrollLoading;
