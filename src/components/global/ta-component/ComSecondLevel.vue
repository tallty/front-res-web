<script lang="ts">
import { ref, defineComponent, toRefs } from 'vue';
const componentName = defineComponent({
  name: 'ComSecondLevel',
  components: {},
  props: {
    title: { type: String, default: '' },
    rightBtnArr: { type: Array, default: () => [] },
    tabs: { type: Array, default: () => [] },
  },
  setup(props, { emit }) {
    let msg = ref('');
    const tabCallback = () => {
      emit('tabCallback');
    };
    const getGridStyle = (grid: any) => {
      let style: any = {};
      let gridTemplateColumns = '';
      grid.forEach((item: any) => {
        let unit = 'fr';
        if (item.unit) {
          unit = item.unit;
        }
        gridTemplateColumns = gridTemplateColumns + item.col + unit + ' ';
      });
      style.gridTemplateColumns = gridTemplateColumns;
      return style;
    };
    return {
      ...toRefs(props),
      getGridStyle,
      msg,
      tabCallback,
    };
  },
});
export default componentName;
</script>

<template lang="pug">
.com-secound-level
  .header-box
    //- .crumbs 一级菜单
    ComFirstLevelHeader(:rightBtnArr='rightBtnArr', :title='title')
    //- .grid-box
  a-tabs(default-active-key='basic', @change='tabCallback')
    a-tab-pane(v-for='item in tabs', :key='item.key', :tab='item.tab')
      .secound-main
        .slot.padding_24(v-if='item.template', :style='item.style')
          slot(:name='item.template')
        .grid-box(:style='getGridStyle(item.grid)', v-if='item.type === "grid"')
          .gird-item.padding_24(v-for='grid in item.grid')
            slot(:name='grid.template')
        .half-box.padding_24(v-if='item.type === "half"')
          slot(name='half')
        .vertical-box(v-if='item.type === "vertical"')
          .vertical-item(
            :class='verticalIndex + 1 >= item.vertical.length ? "nome-margin" : ""',
            v-for='(vertical, verticalIndex) in item.vertical'
          )
            slot(:name='vertical.template')
</template>

<style lang="stylus" scoped>
.com-secound-level
  width 100%
  .header-box
    margin 0 24px
  >>> .ant-tabs-bar
    margin 0
  >>> .ant-tabs-nav-scroll
    margin 0 24px
.secound-main
  padding 24px
  background #E8E8E8
  min-height calc(100vh - 230px)
//  插槽
.slot
  background #fff
  min-height calc(100vh - 230px)
// grid 布局
.grid-box
  display grid
  grid-gap 16px
  .gird-item
    background #fff
    min-height calc(100vh - 230px)
// 一半
.half-box
  width 50%
  background #fff
  min-height calc(100vh - 230px)
  margin 0 auto
// 垂直
.vertical-box
  min-height calc(100vh - 230px)
  display flex
  flex-direction column
  .vertical-item
    width 100%
    background #fff
    height 100%
    margin-bottom 16px
    padding 24px
  .nome-margin
    flex 1
    margin 0
    // height 100%

.padding_24
  padding 24px
</style>
