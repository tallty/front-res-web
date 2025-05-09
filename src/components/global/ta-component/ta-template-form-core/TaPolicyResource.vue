<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import { TaPolicyProps } from './TaPolicy.vue';

const TaPolicyResource = defineComponent({
  name: 'TaPolicyResource',
  components: {},
  props: TaPolicyProps,
  setup(props) {
    return {
      ...toRefs(props),
    };
  },
});
export default TaPolicyResource;
</script>

<template lang="pug">
TaPolicy(v-bind='$props', mode='resource')
  slot
  template(#disabled)
    slot(name='disabled')
</template>

<style lang="stylus" scoped></style>
