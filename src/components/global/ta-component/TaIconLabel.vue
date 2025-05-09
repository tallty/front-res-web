<script lang="ts">
import { defineComponent, toRefs } from 'vue';

const TaIconLabel = defineComponent({
  name: 'TaIconLabel',
  components: {},
  props: {
    label: { type: String, default: '' },
    icon: { type: String, default: 'alert-circle' },
    size: { type: String, default: '24' },
    color: { type: String, default: '' },
    fontColor: { type: String, default: '' },
    desc: { type: String, default: '' },
  },
  emits: ['click'],
  setup(props, { emit }) {
    const iconLabelClick = () => {
      emit('click');
    };

    const defaultColor = '#8C8C8C';

    return {
      ...toRefs(props),
      iconLabelClick,
      defaultColor,
    };
  },
});

export default TaIconLabel;
</script>

<template lang="pug">
.com-icon-label(@click='iconLabelClick')
  a-tooltip
    template(#title)
      .tip {{ desc || label }}
    TaIcon(:type='icon', :size='size', :color='color || defaultColor')
    .label(:style='{ color: fontColor || color || defaultColor }') {{ label }}
</template>

<style lang="stylus">
.com-icon-label
  text-align center
  display inline-block
  .label
    font-size 14px
</style>
