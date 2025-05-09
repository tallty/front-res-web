<script lang="ts">
import { ref, defineComponent, toRefs, computed } from 'vue';

const TaChart = defineComponent({
  name: 'TaChart',
  components: {},
  props: {
    config: { type: Object, default: () => ({}) },
  },
  setup(props) {
    return {
      ...toRefs(props),
    };
  },
});
export default TaChart;
</script>

<template lang="pug">
.ta-chart
</template>

<style lang="stylus" scoped>
// .ta-chart
</style>
