<script lang="ts">
import { ref, defineComponent, toRefs } from 'vue';

const TaBuilderDesignerFlexContainer = defineComponent({
  name: 'TaBuilderDesignerFlexContainer',
  components: {},
  props: {},
  setup(props) {
    return {
      ...toRefs(props),
    };
  },
});
export default TaBuilderDesignerFlexContainer;
</script>

<template lang="pug">
.ta-builder-designer-flex-container.flex
  slot
</template>
<style lang="stylus" scoped></style>

<style lang="stylus">
.ta-builder-designer-flex-container > .ta-layer > .vdr-container
  position relative
  top unset
  left unset
  right unset
  bottom unset
</style>
