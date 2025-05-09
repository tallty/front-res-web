<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import { TaPolicyProps } from './TaPolicy.vue';

const TaPolicyResources = defineComponent({
  name: 'TaPolicyResources',
  components: {},
  props: TaPolicyProps,
  setup(props) {
    return {
      ...toRefs(props),
    };
  },
});
export default TaPolicyResources;
</script>

<template lang="pug">
TaPolicy(v-bind='$props', mode='resources')
  slot
  template(#disabled)
    slot(name='disabled')
</template>

<style lang="stylus" scoped></style>
