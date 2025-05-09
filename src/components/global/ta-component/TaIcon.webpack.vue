<script lang="ts">
import { VObject } from '@/lib/vails/model';
import { computed, defineAsyncComponent, defineComponent, toRefs } from 'vue';
import TaSvg from './TaSvg.vue';
let TaIcon = null;

try {
  let components: VObject = {};
  let componentNames: string[] = [];
  const requireContext = require.context(
    '@ant-design/icons-vue/lib/icons/', //path to components folder which are resolved automatically
    true,
    /\.js$/i,
    'sync',
  );

  componentNames = requireContext.keys().map((file: string) => file.replace(/(^.\/)|(\.js$)/g, ''));

  componentNames.forEach(component => {
    //component represents the component name
    components[component] = defineAsyncComponent(
      () =>
        //import each component dynamically
        import(/* @vite-ignore */ `@ant-design/icons-vue/lib/icons/${component}.js`),
    );
  });

  TaIcon = defineComponent({
    name: 'TaIcon',
    props: {
      type: { type: String, required: true },
      color: { type: String, default: '' },
      size: { type: [Number, String], default: 14 },
    },
    components: { TaSvg, ...components },
    setup(props) {
      const comp = computed(() => (componentNames.includes(props.type) ? props.type : ''));
      return {
        comp,
        ...toRefs(props),
      };
    },
  });
} catch {
  TaIcon = {};
}

export default TaIcon;
</script>

<template lang="pug">
component(v-if='comp', :is='comp', :style='{ color: color, fontSize: typeof size === "string" ? size : `${size}px` }')
TaSvg(v-else-if='type', :src='`https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/tailwind-icons/${type}.svg`')
</template>

<style lang="stylus" scoped></style>
