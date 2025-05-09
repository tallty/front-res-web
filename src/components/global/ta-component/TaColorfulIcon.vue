<script lang="ts">
import { ref, defineComponent, toRefs, PropType, computed } from 'vue';
import { VObject } from '@/lib/vails/model';

export interface TaColorfulIconConfig {
  background: string;
  icon: string;
}

const limitSizeMapping: VObject = {
  normal: {
    width: '40px',
    size: '14px',
  },
  small: {
    width: '20px',
    size: '8px',
  },
  large: {
    width: '80px',
    size: '28px',
  },
};

const TaColorfulIcon = defineComponent({
  name: 'TaColorfulIcon',
  components: {},
  props: {
    config: { type: Object as PropType<TaColorfulIconConfig>, default: () => ({}) },
    size: { type: String as PropType<'normal' | 'large' | 'small'>, default: 'normal' },
  },
  setup(props) {
    const width = computed(() => limitSizeMapping[props.size]?.width);
    const background = computed(() => props.config.background || '');

    return {
      ...toRefs(props),
      limitSizeMapping,
      width,
      background,
    };
  },
});
export default TaColorfulIcon;
</script>

<template lang="pug">
.ta-colorful-icon.flex.justify-center.items-center(:style='{ background }')
  TaIcon(:type='config.icon', :size='limitSizeMapping[size]?.size')
</template>

<style lang="stylus" scoped>
.ta-colorful-icon
  flex-grow 0
  flex-shrink 0
  width v-bind(width)
  height v-bind(width)
  background $primary-color
  border-radius 4px
  color white
</style>
