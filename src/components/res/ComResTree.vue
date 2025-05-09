<script lang="ts">
import { ref, defineComponent, toRefs } from 'vue';
import { VModel } from '@/lib/vails';

export interface ComResTreeData {
  id: number;
  label: string;
  record?: VModel;
  iconType?: string;
  children: ComResTreeData[];
}

const ComResTree = defineComponent({
  name: 'ComResTree',
  components: {},
  props: {
    level: { type: Number, default: 0 },
    data: {
      type: Object,
      default: () => ({
        id: -1,
        label: '内容',
        iconType: 'user',
        children: [],
      }),
    },
  },
  emits: ['click', 'edit'],
  setup(props, { emit }) {
    let son = ref([]);
    const activeKey = ref([]);

    const onClick = (data: ComResTreeData, level: number) => {
      emit('click', data, level);
    };

    const editId = (id: number) => {
      emit('edit', id);
    };

    return {
      ...toRefs(props),
      son,
      onClick,
      editId,
      activeKey,
    };
  },
});
export default ComResTree;
</script>

<template lang="pug">
.out-box
  .tree-box
    a-collapse(v-model:activeKey='activeKey')
      a-collapse-panel(:key='String(data.id)', :show-arrow='false')
        template(#header)
          .card-box(@click='onClick(data, level)', :style='{ paddingLeft: level * 15 + "px" }')
            .switch
              TaIcon.icon(
                type='CaretDownOutlined',
                v-if='data.children && data.children.length > 0'
              )
              .empty-icon(v-else)
            .type
              TaIcon.icon(type='UserOutlined', v-if='data.iconType === "user"')
            .label {{ data.label }}
            .edit(@click='editId(data.id)')
              TaIcon.icon(type='FormOutlined', v-if='data.iconType === "user"')
        ComResTree(
          v-for='item in data.children',
          :data='item',
          :level='level + 1',
          @click='onClick'
        )
</template>

<style lang="stylus" scoped>
.out-box
  // width 256px
  >>> .ant-collapse
    .ant-collapse-item
      .ant-collapse-header
        padding 0
  >>>.ant-collapse-content
    .ant-collapse-content-box
      padding 0
  >>>.ant-collapse
    border none
    .ant-collapse-item
      border  none
  >>> .ant-collapse-content
    border none
.tree-box
  width 100%
  // height 38px
  >>> .card-box
    width 100%
    padding 0 15px
    display flex
    height 38px
    align-items center
    background #fff
    .switch
      margin-right 10px
      cursor pointer
      .empty-icon
        width 14px
      .icon
        color #A6A6A6
    .type
      margin-right 6px
      .icon
        color #83C6EF
    .label
      font-size 14px
      font-weight 400
      color: #383838
    .edit
      margin-left auto
      display none
      cursor pointer
      .icon
        color #83C6EF
  >>> .card-box:hover
    background #F7F7F7
    .edit
      display block
</style>
