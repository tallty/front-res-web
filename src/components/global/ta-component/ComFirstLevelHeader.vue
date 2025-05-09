<script lang="ts">
import { ref, defineComponent, toRefs } from 'vue';
const componentName = defineComponent({
  name: 'ComFirstLevelHeader',
  props: {
    title: { type: String, default: '' },
    rightBtnArr: { type: Array, default: () => [] },
  },
  components: {},
  setup(props) {
    let msg = ref('');
    return {
      ...toRefs(props),
      msg,
    };
  },
});
export default componentName;
</script>

<template lang="pug">
.com-first-level-header
  .title-box.flex-between.flex_1
    ComIconText.all.flex_1(:text='title', fontColor='#000')
    .btn-box
      ComIconText(
        v-for='item in rightBtnArr',
        :text='item.text',
        :icon='item.icon',
        :size='item.size',
        :fontWeight='item.fontWeight',
        :color='item.color',
        :fontColor='item.fontColor',
        @click='item.click'
      )
</template>

<style lang="stylus" scoped>
.com-first-level-header
  height 54px
  display flex
  align-items center
  background #fff
.btn-box
  display flex
</style>
