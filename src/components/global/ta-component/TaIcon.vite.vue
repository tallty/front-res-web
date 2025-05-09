<script lang="ts">
import { computed, defineComponent, toRefs } from 'vue';
import * as allIcon from '@ant-design/icons-vue';
import TaSvg from './TaSvg.vue';

let componentNames: string[] = [];
const path = '../../../../node_modules/@ant-design/icons-vue/lib/icons/';
const requireContext = import.meta.glob<{ default: unknown[] }>(
  './../../../../node_modules/@ant-design/icons-vue/lib/icons/*.js',
);

componentNames = Object.keys(requireContext).map((file: string) =>
  file.replace(/(^.\/)|(\.js$)/g, '').replace(path, ''),
);

const TaIcon = defineComponent({
  name: 'TaIcon',
  props: {
    type: { type: String, required: true },
    color: { type: String, default: '' },
    size: { type: Number, default: 14 },
  },
  components: { ...allIcon, TaSvg },
  setup(props) {
    const comp = computed(() => (componentNames.includes(props.type) ? props.type : ''));
    return {
      comp,
      ...toRefs(props),
    };
  },
});
export default TaIcon;
</script>

<template lang="pug">
component(v-if='comp', :is='comp', :style='{ color: color, fontSize: `${size}px` }')
TaSvg(v-else-if='type', :src='`https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/tailwind-icons/${type}.svg`')
</template>

<style lang="stylus" scoped></style>
