<script lang="ts">
import { defineComponent, PropType, toRefs } from 'vue';
import ComIconText from './ComIconText.vue';
import { TaBreadcrumbInterface } from './TaBreadcrumb.vue';

export default defineComponent({
  name: 'ComHeaderEdit',
  components: { ComIconText },
  props: {
    title: { type: String, default: '' },
    breadcrumbs: { type: Array as PropType<TaBreadcrumbInterface[]>, default: () => [] },
    isIndependent: { type: Boolean, default: false },
    icon: { type: String, default: '' },
    rgIcon: { type: String, default: 'edit' },
    text: { type: String, default: '' },
    color: { type: String, default: '$primary-color' },
  },
  setup(props) {
    return {
      ...toRefs(props),
    };
  },
});
</script>

<template lang="pug">
.header-edit.flex
  .left.flex.text-ellipsis
    slot(name='left')
      TaIcon.icon(:type='icon')
      slot(name='title')
        TaBreadcrumbWithTitle.breadcrumbs(v-if='breadcrumbs.length > 0', :breadcrumbs='breadcrumbs', :title='title')
        TaTitleHeader.title.text-ellipsis.text-black(v-else :title='title')
  .right.flex
    slot(name='right')
    .independent(v-if='isIndependent')
      ComIconText(:color='color', icon='FullscreenOutlined', text='独立窗口')
</template>

<style lang="stylus" scoped>
.left
  flex 1
  align-items center
  width auto
  .title
    flex 1
    font-size 16px
  .icon
    margin-right 4px
.right
  width auto
</style>
