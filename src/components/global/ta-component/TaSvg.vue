<script lang="ts">
import { defineComponent, toRefs, ref, watch } from 'vue';
import store from 'store';
import expirePlugin from 'store/plugins/expire';

store.addPlugin(expirePlugin);
// https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/tailwind-icons/solid/clipboard-list.svg

const TaSvg = defineComponent({
  name: 'TaSvg',
  components: {},
  props: {
    src: { type: String, required: true },
  },
  setup(props) {
    const localStr = ref('');

    const loadImage = async () => {
      localStr.value = await fetchSvg();
    };

    const fetchSvg = async () => {
      if (store.get(props.src) && typeof store.get(props.src) === 'string') {
        return store.get(props.src);
      }
      const res = await fetch(props.src);
      if (res.status === 200) {
        const result = await res.text();
        (store.set as any)(props.src, result, new Date().getTime() + 1000 * 60 * 60 * 24 * 7);
        return result;
      }
      return '';
    };

    watch(() => props.src, loadImage, { immediate: true });

    return {
      ...toRefs(props),
      localStr,
    };
  },
});

export default TaSvg;
</script>

<template lang="pug">
.ta-svg.flex.justify-center.items-center(v-html='localStr')
</template>

<style lang="stylus" scoped>
.ta-svg
  >>> svg
    color inherit !important
    path
      stroke currentColor
    // @apply h-full w-full
</style>
