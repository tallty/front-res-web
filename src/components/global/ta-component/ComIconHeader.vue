<script lang="ts">
import { defineComponent, toRefs } from 'vue';

export default defineComponent({
  name: 'ComIconHeader',
  components: {},
  props: {
    icon: { type: String, default: '' },
    title: { type: String, default: '' },
  },
  setup(props) {
    return {
      ...toRefs(props),
    };
  },
});
</script>

<template lang="pug">
.icon-header.flex.text-bold
  .icon
    TaIcon(v-if='icon', :type='icon')
  h3.title.text-black {{ title }}
</template>

<style lang="stylus" scoped>
.title
  margin-left 4px
  .icon
    display flex
    align-items center
</style>
