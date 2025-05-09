<script lang="ts">
import {
  FormItemSize,
  TaTemplateFormItem,
} from '@/components/global/ta-component/ta-template-form-core/types';
import { VObject } from '@/lib/vails/model';
import { PropType, computed, defineComponent, onMounted, toRefs } from 'vue';
import { normalLayoutTemplate } from './normalLayoutTemplate';
import useFormDesignerMitt from './useFormDesignerMitt';
import widgets from './widgets';

const TaTemplateFormDesignerConfig = defineComponent({
  name: 'TaTemplateFormDesignerConfig',
  components: {},
  props: {
    value: { type: Object as PropType<TaTemplateFormItem>, required: true },
    template: { type: Object as PropType<TaTemplateFormItem>, required: true },
    payload: { type: Object as PropType<VObject>, required: true },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const field = computed({
      get: () => {
        return props.value;
      },
      set: val => emit('update:value', val),
    });

    const haveModelKey = computed(
      () => !['layout', 'condition', 'container_layout'].includes(field.value.type!),
    );
    const isLayout = computed(() =>
      ['layout', 'condition', 'list', 'key_layout', 'container_layout'].includes(field.value.type!),
    );

    const activeFormType = computed(
      () => widgets.find(widget => widget.type === field.value.type)?.name,
    );

    const arrayModelKey = computed({
      get: () => {
        if (typeof field.value.model_key === 'string') {
          const val = JSON.parse(field.value.model_key);
          return new Proxy(val, {
            get: (target, key) => {
              return target[key];
            },
            set: (target, key, value) => {
              target[key] = value;
              field.value.model_key = JSON.stringify(target);
              return true;
            },
          });
        }
        return field.value.model_key;
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      set: (_val: unknown) => {
        // field.value.model_key = val;
      },
    });

    const { emitter } = useFormDesignerMitt();

    const summaryChange = (event: any) => {
      // summaryChange: 更改是否显示在列表页，传出 是与否 与 编辑对象本身，更新 index_attributes
      emitter.emit('summaryChange', { item: field.value, remove: !event.target.checked });
    };
    const switchOptions = [{ label: '开关', value: 'switch' }];

    const selectOptions = [
      { label: '单选框', value: 'radio' },
      { label: '多选框', value: 'checkbox' },
      { label: '下拉选择', value: 'select' },
    ];

    const apiFieldOptions = [
      { label: 'API ID数组', value: 'api' },
      { label: 'API ID', value: 'api_single' },
      { label: 'API store 数组', value: 'api_store' },
      { label: 'API store 单对象', value: 'api_single_store' },
    ];

    const layoutOptions = [
      { label: '普通布局', value: 'layout' },
      { label: '容器布局', value: 'container_layout' },
    ];

    const customFormTypeMapping = {
      select: selectOptions,
      radio: selectOptions,
      checkbox: selectOptions,
      switch: switchOptions,
      api: apiFieldOptions,
      api_single: apiFieldOptions,
      api_store: apiFieldOptions,
      api_single_store: apiFieldOptions,
      layout: layoutOptions,
      container_layout: layoutOptions,
    };

    onMounted(() => {
      const defaultSize = (process.env?.VUE_APP_FORM_SIZE ?? 'regular') as FormItemSize;
      // 尺寸默认值
      if (field.value?.options) {
        field.value.options.size = field.value.options?.size ?? defaultSize;
      }
    });

    return {
      ...toRefs(props),
      field,
      haveModelKey,
      isLayout,
      activeFormType,
      summaryChange,
      customFormTypeMapping,
      normalLayoutTemplate,
      selectOptions,
      apiFieldOptions,
      arrayModelKey,
      switchOptions,
    };
  },
});
export default TaTemplateFormDesignerConfig;
</script>

<template lang="pug">
.ta-template-form-designer-config.h-full.w-full.p-2
  .config-header
    | 表单设置 -
    template(v-if='customFormTypeMapping[field.type]')
      a-select.select(:options='customFormTypeMapping[field.type]', v-model:value='field.type')
    template(v-else) {{ activeFormType || '未选择' }}
  .config-content
    .form(v-if='activeFormType')
      .form-item
        .form-item-label 标题
        a-textarea(v-model:value='field.name', placeholder='请输入标题')
      .form-item
        TaTemplateFormDesignerSpanConfig(v-model:value='field')
      .form-item(v-if='haveModelKey')
        .form-item-label 关键字
        template(v-if='value.options?.props?.model_key?.type === "array"')
          a-input(
            v-for='(k, index) in new Array(value.options?.props?.model_key?.length || 1)',
            v-model:value='arrayModelKey[index]',
            :placeholder='`请输入表单关键字 ${index + 1}`'
          )
        template(
          v-else-if='Array.isArray(value.model_key_configuration) && value.model_key_configuration.length > 0'
        )
          TaTemplateFormDesignerModelKeyConfigurationConfig(
            v-model:value='field.model_key_configuration'
          )
        template(v-else)
          a-input(v-model:value='field.model_key', placeholder='请输入表单关键字')
      .form-item
        .form-item-label 组件尺寸
        a-radio-group(v-model:value='field.options.size', name='sizeGroup')
          a-radio(value='large') large
          a-radio(value='regular') Default
          a-radio(value='small') Small
      .form-item
        .form-item-label 锚点
        a-switch(v-model:checked='field.options.anchor')
      .form-item(v-if='field.model')
        a-checkbox(v-model:checked='field.model.summary') 工作流 summary
      template(v-if='!isLayout')
        .form-item
          .form-item-label 提示
          a-input(v-model:value='field.options.placeholder', placeholder='请输入表单提示')
        .form-item
          .form-item-label i 图标注释
          a-textarea(v-model:value='field.options.info', placeholder='请输入 i 图标注释')
        template(v-if='field.type === "input"')
          .form-item
            a-checkbox(v-model:checked='field.options.cached') 启用历史记录
          .form-item
            .form-item-label 输入框前缀图标
            a-input(v-model:value='field.options.prefixIcon', placeholder='请输入TaIcon图标名')
          .form-item
            a-checkbox(v-model:checked='field.options.sendCodeBth') 是否启用短信验证码按钮（小程序）
        .form-item(v-if='field.type === "dynamic_component"')
          .form-item-label 动态组件名
          a-input(v-model:value='field.options.dynamic_component', placeholder='请输入动态组件名')
          .form-item-label 动态组件参数
          TaJsonEditor(v-model:value='field.options.props', placeholder='请输入动态组件名参数')
        .form-item(v-if='field.type === "slot"')
          .form-item-label 插槽名
          a-input(v-model:value='field.options.dynamic_component', placeholder='请输入插槽名')
        template(
          v-if='field.type === "number" || field.type === "percent" || field.type === "number_range"'
        )
          .form-item
            .form-item-label 数字精度
            a-input-number(
              v-model:value='field.options.precision',
              placeholder='请输入数字精度',
              :precision='0'
            )
          .form-item
            .form-item-label 最大值
            a-input-number(v-model:value='field.options.max', placeholder='请输入数字最大值')
          .form-item
            .form-item-label 最小值
            a-input-number(v-model:value='field.options.min', placeholder='请输入数字最小值')
          .form-item
            .form-item-label 大写数字
            a-switch(v-model:checked='field.options.amount_to_chinese')
          .form-item
            .form-item-label 手机端负数按钮
            a-switch(v-model:checked='field.options.negative_button')
          .form-item
            .form-item-label 手机端千分位显示
            a-switch(v-model:checked='field.options.thousand_separator')
          .form-item
            .form-item-label 前缀
            a-input(v-model:value='field.options.prefix', placeholder='请输入前缀')

        template(
          v-if='field.type.includes("image") || field.type.includes("video") || field.type.includes("file")'
        )
          .form-item
            .form-item-label 文件大小限制
            a-input-number(
              v-model:value='field.options.fileSize',
              placeholder='单位: MB',
              :precision='0',
              addon-after='MB',
              style='width: 55%'
            )
          .form-item
            .form-item-label 上传文件类型
            a-input(v-model:value='field.options.accept', placeholder='允许上传的文件类型')
          .form-item
            .form-item-label 文件上传最大数量
            a-input-number(
              v-model:value='field.options.file_max_count',
              :min='0',
              :precision='0',
              style='width: 55%'
            )

        template(v-if='field.type === "input" || field.type === "textarea"')
          .form-item
            .form-item-label 最小长度
            a-input-number(
              v-model:value='field.options.minLength',
              placeholder='请输入最小长度',
              :precision='0',
              style='width: 50%'
            )
        template(
          v-if='field.type === "input" || field.type === "number" || field.type === "textarea"'
        )
          .form-item
            .form-item-label 最大长度
            a-input-number(
              v-model:value='field.options.maxLength',
              placeholder='请输入最大长度',
              :precision='0',
              style='width: 50%'
            )
        template(v-if='field.type === "evaluate"')
          .form-item
            .form-item-label 评价图标
            a-input(v-model:value='field.options.evaluate_icon', placeholder='请输入 TaIcon 图标')
          .form-item
            .form-item-label 评价分值步长
            a-input-number(
              v-model:value='field.options.step',
              placeholder='请输入步长',
              :defaultValue='1'
            )
          .form-item
            .form-item-label 评价图标个数
            a-input-number(
              v-model:value='field.options.length',
              placeholder='请输入图标个数',
              :defaultValue='5'
            )
          .form-item
            .form-item-label 评价图标颜色
            TaColorInput(v-model:value='field.options.color')
        template(v-if='field.type === "region_id"')
          .form-item
            .form-item-label 选择级数（默认3级）
            a-input-number(v-model:value='field.options.depth')
        template(v-if='field.type === "region" || field.type === "region_id"')
          .form-item
            a-checkbox(v-model:checked='field.model.region_change_on_select') 允许点击选择任意级数
        .form-item
          a-checkbox(v-model:checked='field.model.summary', @change='summaryChange') 显示在列表页
        .form-item
          a-checkbox(v-model:checked='field.options.formHidden') 在表单隐藏
        .form-item
          a-checkbox(v-model:checked='field.options.viewHidden') 在详情隐藏
        .form-item
          a-checkbox(v-model:checked='field.options.formDisabled') 在表单不可编辑
        .form-item
          .form-item-label 图标
          a-input(v-model:value='field.options.icon', placeholder='请输入 antd2x 图标名')
        .form-item
          .form-item-label 单位
          a-input(v-model:value='field.options.unit', placeholder='请输入输入框右侧单位')
        .form-item(v-if='field.options.multiple !== undefined')
          a-checkbox(v-model:checked='field.options.multiple') 多选
      template(v-if='field.type === "list" || !isLayout')
        .form-item
          .form-item-label 验证
          TaTemplateFormDesignerRulesConfig(
            v-model:value='field.rules',
            :defaultErrorMessage='`请填写正确的${field.name}`',
            :attrType='field.model?.attr_type'
          )
        .form-item
          a-checkbox(v-model:checked='field.options.validateWhenHidden') 隐藏时是否仍然验证
      template(v-if='field.type === "list"')
        .form-item
          .form-item-label 最大数量
          a-input-number(v-model:value='field.options.max', placeholder='请输入最大数量')
        .form-item
          .form-item-label 最小数量
          a-input-number(v-model:value='field.options.min', placeholder='请输入最小数量')
      template(v-if='field.type === "label" && field.options.label')
        .form-item
          .form-item-label 标签宽度
          a-input-number(v-model:value='field.options.label.width', placeholder='请输入标签宽度')
        .form-item
          .form-item-label 标签高度
          a-input-number(v-model:value='field.options.label.height', placeholder='请输入标签高度')
        .form-item
          .form-item-label 标签字体大小
          a-input-number(v-model:value='field.options.label.font_size', placeholder='请输入标签字体大小')
        .form-item
          .form-item-label 标签背景颜色
          a-input(v-model:value='field.options.label.background_color', placeholder='请输入标签背景颜色')
        .form-item
          .form-item-label padding
          .flex
            | 上：
            a-input-number(v-model:value='field.options.label.padding_top')
            | 右：
            a-input-number(v-model:value='field.options.label.padding_right')
          .flex
            | 下：
            a-input-number(v-model:value='field.options.label.padding_bottom')
            | 左：
            a-input-number(v-model:value='field.options.label.padding_left')

      template(v-if='selectOptions.map(opt => opt.value).includes(field.type)')
        .form-item
          .form-item-label 选项
          TaTemplateFormDesignerSelectConfig(v-model:value='field.options')
      template(v-if='switchOptions.map(opt => opt.value).includes(field.type)')
        .form-item
          .form-item-label 选项
          TaTemplateFormDesignerSelectConfig(
            v-model:value='field.options',
            :importable='false',
            :addable='false',
            :initialValue='[ { label: "", value: "" }, { label: "", value: "" }, ]'
          )
      template(v-if='field.type === "layout" || field.type === "container_layout"')
        .form-item
          .form-item-label 标题设置
          TaTemplateFormDesignerLabelConfig(v-model:value='field.options')
        .form-item(v-if='field.options')
          a-checkbox(v-model:checked='field.options.collapse') 是否折叠
          a-checkbox(
            v-if='field.options?.collapse',
            v-model:checked='field.options.collapse_default_open'
          ) 是否默认展开
          a-checkbox(
            v-if='field.options?.collapse',
            v-model:checked='field.options.collapse_stats'
          ) 是否显示统计数字
        TaTemplateForm(v-model:modelValue='field.options', :template='normalLayoutTemplate')
      template(v-if='field.type === "condition"')
        .form-item
          .form-item-label 条件
          TaTemplateFormDesignerConditionsConfig(v-model:value='field.conditions')
      template(
        v-if='[...selectOptions, ...apiFieldOptions].map(opt => opt.value).includes(field.type)'
      )
        .form-item
          .form-item-label API 选择器配置
          TaTemplateFormDesignerApiConfig(v-model:value='field.options')
      template(v-if='["date"].includes(field.type)')
        .form-item
          .form-item-label 开始时间【e.g. this.dayjs().add(7, 'day')】
          a-input(v-model:value='field.options.start_time')
        .form-item
          .form-item-label 结束时间【e.g. this.dayjs().add(7, 'day')】
          a-input(v-model:value='field.options.end_time')

      template(v-if='field.type === "list" || field.type === "nested_attributes"')
        .form-item
          p
            a-checkbox(v-model:checked='field.options.edit_directly') 直接编辑
        .form-item
          p
            a-radio-group(v-model:value='field.options.display')
              a-radio(value='normal') 普通
              a-radio(value='table') 表格
              a-radio(value='tab') 标签页（手机）
        .form-item(v-if='field.options.disabled_actions')
          p
            a-checkbox(v-model:checked='field.options.disabled_actions.create') 禁用创建
          p
            a-checkbox(v-model:checked='field.options.disabled_actions.update') 禁用编辑
          p
            a-checkbox(v-model:checked='field.options.disabled_actions.destroy') 禁用删除
          p
            a-checkbox(v-model:checked='field.options.disabled_actions.import') 禁用导入
      .form-item
        .form-item-label ditto
        a-input(v-model:value='field.options.ditto')
      template(v-if='field.type === "list" || !isLayout')
        TaTemplateFormDesignerDefaultValueConfig(
          v-model:value='field',
          v-model:template='template'
        )
      template(v-if='field.type === "content"')
        p
          a-checkbox(v-model:checked='field.options.use_normal_text') 不使用富文本
        p
          a-checkbox(v-model:checked='field.options.hide_text') 禁用文字
        p
          a-checkbox(v-model:checked='field.options.hide_image') 禁用图片
        p
          a-checkbox(v-model:checked='field.options.hide_video') 禁用视频
        p
          a-checkbox(v-model:checked='field.options.hide_audio') 禁用音频
        p
          a-checkbox(v-model:checked='field.options.hide_file') 禁用文件
        template(v-if='!field.options.hide_image')
          .form-item
            .form-item-label 图片大小限制(默认上限10兆)
            a-input-number(
              v-model:value='field.options.image_fileSize',
              placeholder='单位: MB',
              :precision='0',
              addon-after='MB',
              style='width: 55%'
            )
        template(v-if='!field.options.hide_video')
          .form-item
            .form-item-label 视频大小限制(默认上限10兆)
            a-input-number(
              v-model:value='field.options.video_fileSize',
              placeholder='单位: MB',
              :precision='0',
              addon-after='MB',
              style='width: 55%'
            )
        template(v-if='!field.options.hide_audio')
          .form-item
            .form-item-label 音频大小限制(默认上限10兆)
            a-input-number(
              v-model:value='field.options.audio_fileSize',
              placeholder='单位: MB',
              :precision='0',
              addon-after='MB',
              style='width: 55%'
            )
        template(v-if='!field.options.hide_file')
          .form-item
            .form-item-label 文件大小限制(默认上限10兆)
            a-input-number(
              v-model:value='field.options.file_fileSize',
              placeholder='单位: MB',
              :precision='0',
              addon-after='MB',
              style='width: 55%'
            )
      template(v-if='field.type.includes("image") || field.type.includes("video")')
        .form-item
          .form-item-label 宽高比
          a-input-number(v-model:value='field.options.aspect_ratio')
      template(v-if='field.type.includes("image")')
        .form-item
          .form-item-label 预置图片
          TaImageUploader(v-model:value='field.options.preset_files')
      template(v-if='field.type.includes("image_picker")')
        .form-item
          .form-item-label 图片宽度
          a-input-number(v-model:value='field.options.width')
        .form-item
          .form-item-label 图片高度
          a-input-number(v-model:value='field.options.height')
      template(v-if='field.type.includes("polymorphic")')
        .form-item
          .form-item-label 多态关键字
          a-input(v-model:value='field.options.polymorphic_key')
        .form-item
          .form-item-label 多态选择器 Tabs
          TaJsonEditor(v-model:value='field.options.nested_attributes_polymorphic_tabs')
        .form-item
          .form-item-label attrs
          TaTagField(v-model:value='field.options.attrs')
      template(v-if='field.type.includes("computed")')
        .form-item
          .form-item-label 计算代码(JS)
          a-textarea(v-model:value='field.options.computedFunc')

      template(v-if='field.type.includes("polymorphic")')
        .form-item
          .form-item-label 路由数组
          TaTagField(v-model:value='field.options.paths')
</template>

<style lang="stylus" scoped>
.ta-template-form-designer-config
  overflow auto
  background #fff
  transition all 1s cubic-bezier(0.645, 0.045, 0.355, 1)
  .flex
    align-items center
    display flex
  .config-header
    font-weight 400
    font-size 14px
    line-height 25px
    .select
      width 150px
  .config-content
    width 100%
    .form
      width 100%
      .form-item
        margin-top 20px
        width 100%
        .form-item-label
          margin-bottom 8px
          color #808080
          font-weight 400
          font-size 14px
          line-height 20px
</style>
