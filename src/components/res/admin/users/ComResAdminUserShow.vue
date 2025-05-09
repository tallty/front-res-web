<script lang="ts">
import { ref, defineComponent, toRefs } from 'vue';
import ComResAdminUserApplication from './ComResAdminUserApplication.vue';
const componentName = defineComponent({
  name: 'ComResAdminUserShow',
  components: { ComResAdminUserApplication },
  props: {
    name: { type: String, default: '' },
  },
  setup(props) {
    let msg = ref('');
    const btnClick = () => {
      console.log('按钮点击事件');
    };
    const tabCallback = function () {
      console.log('回调');
    };
    return {
      ...toRefs(props),
      msg,
      btnClick,
      tabCallback,
    };
  },
});
export default componentName;
</script>

<template lang="pug">
.com-red-admin-user-show
  ComHeaderEdit(:title='name', rgIcon='redo', text='重置密码', @btnClick='btnClick')
  a-tabs(default-active-key='basicInfo', @change='tabCallback')
    a-tab-pane(key='basicInfo', tab='文章')
      | 文章
    a-tab-pane(key='moveInInfo', tab='应用')
      ComResAdminUserApplication
    a-tab-pane(key='project', tab='项目 ')
      | 项目
</template>

<style lang="stylus" scoped></style>
