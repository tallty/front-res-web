<script lang="ts">
import { defineComponent, reactive, ref, toRefs } from 'vue';
const componentName = defineComponent({
  name: 'ComResAdminUserApplication',
  components: {},
  props: {
    value: { type: String, default: 'copy' },
  },
  setup(props) {
    const template = {
      type: 'layout',
      options: {},
      model: {},
      key: 'layout_1618996492047',
      model_key: 'layout_1618996492047',
      fields: [
        {
          name: '字段名',
          type: 'input',
          rules: [],
          model: { attr_type: 'string' },
          options: { span: 12 },
          key: 'input_1618996493698',
          model_key: 'input_1618996493698',
          fields: [],
        },
        {
          name: '字段名',
          type: 'input',
          rules: [],
          model: { attr_type: 'string' },
          options: { span: 12 },
          key: 'input_1618996494193',
          model_key: 'input_1618996494193',
          fields: [],
        },
      ],
    };
    let msg = ref('');
    const btnClick = () => {
      console.log('个人编辑');
      readonly.value = !readonly.value;
    };
    const initBtnClick = () => {
      console.log('基本编辑');
      initReadonly.value = !initReadonly.value;
    };
    const record = {
      formData: reactive({
        input_1618996494193: '内容1',
        input_1618996493698: '内容2',
      }),
    };
    const readonly = ref(true);
    const initReadonly = ref(true);

    return {
      ...toRefs(props),
      msg,
      btnClick,
      initBtnClick,
      template,
      record,
      readonly,
      initReadonly,
    };
  },
});
export default componentName;
</script>

<template lang="pug">
.com-res-admin-user-application
  .item.border_bottom
    ComHeaderEdit(
      title='基本信息',
      :text='initReadonly ? "编辑" : "保存"',
      :isIndependent='false',
      @btnClick='initBtnClick'
    )
    TaTemplateFormViewer(:template='template', :record='record', v-if='initReadonly')
    TaTemplateForm(v-if='!initReadonly', :template='template', :record='record')
  .item
    ComHeaderEdit(
      title='个人信息',
      text='编辑',
      :text='readonly ? "编辑" : "保存"',
      :isIndependent='false',
      @btnClick='btnClick'
    )
    TaTemplateFormViewer(:template='template', :record='record', v-if='readonly')
    TaTemplateForm(v-if='!readonly', :template='template', :record='record')
</template>

<style lang="stylus" scoped>
.item
  // margin 10px 0
  padding 10px
  >>> h3
    font-size 14px
.border_bottom
  border-bottom 1px solid #E5E5E5
</style>
