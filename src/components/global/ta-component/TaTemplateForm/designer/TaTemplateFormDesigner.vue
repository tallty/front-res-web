<script lang="ts">
import {
  ref,
  defineComponent,
  toRefs,
  PropType,
  computed,
  provide,
  watch,
  Ref,
  reactive,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from 'vue';
import TaTemplateFormDesignerNormalLayout from './TaTemplateFormDesignerNormalLayout.vue';
import widgets, { widgetsGroup } from './widgets';
import draggable from 'vuedraggable';
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';
import { useActiveFieldKey } from './useActiveField';
import useKey from './useKey';
import useDraggableLanding from './useDraggableLanding';
import useOptionsConfig from '@/components/global/ta-component/ta-template-form-core/useOptionsConfig';
import { useFormProvide } from '../../ta-template-form-core/useForm';
import useProcessFields from '../../ta-template-form-core/useProcessFields';
import { cloneDeep } from 'lodash';
import { useRoute } from 'vue-router';
import { useContextProvide } from '../../ta-template-form-core/useContext';
import { useAccessibilityProvide } from '../../ta-template-form-core/useAccessibility';
import defaultTheme from '../defaultTheme';
import useSystemClipboard from './useImportExportDesignerConfig';
import { VObject } from '../../../../../lib/vails/model/index';
import { TaTemplateFormItemValidators } from './validators';
import { Modal } from 'ant-design-vue';
import { TaTemplateFormItemValidate } from './TaTemplateFormItemValidate';

let uuid = 0;

const TaTemplateFormDesigner = defineComponent({
  name: 'TaTemplateFormDesigner',
  components: {
    TaTemplateFormDesignerNormalLayout,
    draggable,
  },
  props: {
    value: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const seq = `TaTemplateFormDesigner-${uuid++}`;
    const copyId = `copy-button-${seq}`;

    // @ts-ignore
    const activeField: Ref<TaTemplateFormItem> = ref({
      type: 'layout',
      options: {},
      model: {},
      fields: [],
    } as TaTemplateFormItem);

    const formData = reactive({});
    const item = computed({
      get: () => props.value,
      set: val => {
        emit('update:value', val);
      },
    });

    watch(
      item,
      (val1: TaTemplateFormItem, val2?: TaTemplateFormItem) => {
        if (val1?.key && val2 === undefined) {
          // immediate 时，初始化 activeField
          activeField.value = item.value;
        }
      },
      { immediate: true, deep: true },
    );

    const loading = ref(true);

    // watch(
    //   () => true,
    //   () => {
    //     item.value.options ||= {};
    //   },
    //   { immediate: true },
    // );

    onMounted(() => {
      setTimeout(() => {
        let initValue = cloneDeep(item.value);
        if (!initValue) {
          initValue = {};
        }
        if (!initValue.fields) {
          initValue.type = 'container_layout';

          initValue = freshKeys(initValue);
          initValue.fields = [
            {
              key: `TaTemplateFormDesignerKey-${uuid++}`,
              type: 'layout',
              fields: [],
              options: {},
              model: {},
            },
          ];
        }

        initValue.options ||= {
          label: {},
          disabled_actions: {},
          theme: { card: {}, background: {}, form: {} },
        };

        initValue.options.theme ||= { card: {}, background: {}, form: {} };
        initValue.options.label ||= {};

        initValue.model = {
          create_default_value: {
            ...(item.value?.model?.create_default_value || {}),
          },
          update_default_value: {
            ...(item.value?.model?.update_default_value || {}),
          },
        };

        initValue.type = 'container_layout';

        item.value = initValue;
        nextTick(() => {
          loading.value = false;
        });
      });
    });

    provide(useActiveFieldKey, activeField);
    // provide('formData', formData);
    provide('template', item);
    provide('isViewer', false);

    const { freshKeys } = useKey();

    const onWidgetClick = (field: TaTemplateFormItem) => {
      if (item.value.fields) {
        const result = freshKeys(field);
        const fields = item.value.fields;
        fields.push(result);
        item.value = { ...item.value, fields };
        activeField.value = result;
      }
    };

    // draggable clone 回调，clone 方法的返回值
    const onWidgetClone = (val: TaTemplateFormItem) => {
      return freshKeys(val);
    };

    const { onMove, onDragEnd } = useDraggableLanding(computed(() => true));

    const optionsReactive = computed(() => props.value.options);
    useOptionsConfig(optionsReactive);

    const visible = ref(false);

    const onPreview = () => {
      visible.value = true;
    };

    const visibleData = ref(false);

    const onShowData = () => (visibleData.value = true);

    const { processField, getValue } = useProcessFields();

    const updateDefaultValue = () => {
      processField(item.value, {}, field => {
        if (!field.options) {
          field.options = {};
        }
        field.options.defaultValue = getValue(field, formData);
      });
      visible.value = false;
      return Promise.resolve();
    };

    const fakeModel = computed(() => ({ formData, save: updateDefaultValue }));

    const route = useRoute();
    const value = computed(() => fakeModel.value.formData);
    useContextProvide(value, route);

    useAccessibilityProvide(ref([]));

    const configTabs = [
      { key: 'normal', label: '普通配置' },
      { key: 'global', label: '全局配置' },
      { key: 'index', label: '（旧）列表页配置' },
      { key: 'columns', label: '（新）列表页配置' },
      { key: 'actions', label: '操作' },
      { key: 'layout', label: '样式' },
      { key: 'searcher', label: '搜索框' },
    ];
    const activeTabKey = ref('normal');

    const background = computed(
      () =>
        (typeof item.value?.options?.theme === 'object' &&
          item.value?.options?.theme?.background?.color) ||
        defaultTheme.value?.background?.color ||
        'rgb(243, 244, 246)',
    );

    const activeWidgetsKey = ref(Object.keys(widgetsGroup)[0]);
    const widgetButtons = computed(() =>
      Object.keys(widgetsGroup).map(key => ({
        key,
        label: key,
        callback: () => {
          activeWidgetsKey.value = key;
        },
      })),
    );

    const { copyToClipboard, pasteFormClipboardAsync } = useSystemClipboard();

    const pasteStringValidator = (str: string) => {
      let result = true;
      try {
        JSON.parse(str);
      } catch {
        result = false;
      }
      return result;
    };

    const onPasteFromClipboard = () => {
      pasteFormClipboardAsync(pasteStringValidator).then((str: string) => {
        item.value = JSON.parse(str);
      });
    };

    copyToClipboard(`#${copyId}`, () => JSON.stringify(item.value));

    const moveableHandle = ref<any>(null);
    const resizableContent = ref<any>(null);
    let isResizing = false;

    const onMouseDown = (e: any) => {
      e.preventDefault();
      isResizing = true;
    };

    const onMouseMove = (e: any) => {
      if (!isResizing || !resizableContent.value) return;

      const newWidth =
        resizableContent.value.getBoundingClientRect().left -
        e.clientX +
        resizableContent.value.getBoundingClientRect().width;

      resizableContent.value.style.width = `${newWidth}px`;
    };

    const onMouseUp = () => {
      isResizing = false;
    };

    onMounted(() => {
      if (moveableHandle.value && resizableContent.value) {
        isResizing = false;

        moveableHandle.value.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      }
    });

    onBeforeUnmount(() => {
      moveableHandle.value.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    });

    const onAddNormalLayout = () => {
      item.value?.fields?.push({
        key: `TaTemplateFormDesignerKey-${uuid++}`,
        type: 'layout',
        fields: [],
        options: {},
        model: {},
      });
    };

    const validate = () => {
      return TaTemplateFormItemValidate(item.value);
    };

    return {
      ...toRefs(props),
      item,
      widgets,
      onWidgetClone,
      onWidgetClick,
      onMove,
      onDragEnd,
      activeField,
      visible,
      onPreview,
      visibleData,
      onShowData,
      formData,
      fakeModel,
      record: fakeModel,
      configTabs,
      activeTabKey,
      background,
      widgetButtons,
      widgetsGroup,
      activeWidgetsKey,
      copyToClipboard,
      onPasteFromClipboard,
      copyId,
      moveableHandle,
      resizableContent,
      onAddNormalLayout,
      loading,
      validate,
    };
  },
  created() {
    useFormProvide(this);
  },
});
export default TaTemplateFormDesigner;
</script>

<template lang="pug">
.ta-template-form-designer(v-if='item && !loading')
  //- h1.w-100 {{ item }}
  .forms
    TaCapsuleMultiButton.widget-button(
      :activeKey='activeWidgetsKey',
      :buttons='widgetButtons',
      :shadow='true'
    )
    .widget-groups
      .widget-group(v-for='(group, title) in widgetsGroup[activeWidgetsKey]')
        .widget-group-title {{ title }}
        TaDraggable.widgets(
          :list='group',
          :clone='onWidgetClone',
          item-key='key',
          :group='{ name: "widgets", pull: "clone", put: false }',
          ghost-class='ghost-class',
          :sort='false',
          :move='onMove',
          @end='onDragEnd'
        )
          template(#item='{ element }')
            .widget(@click='onWidgetClick(element)')
              TaIcon.icon(v-if='element.icon', :type='element.icon')
              | {{ element.name }}
  .canvas
    a-form.canvas-form
      TaTemplateFormDesignerNormalLayout.canvas-layout(
        v-model:item='item',
        :top='true',
        @addSecondNormalLayout='onAddNormalLayout',
      )
  .config.flex.w-full.overflow-y-auto.overflow-x-hidden(ref='resizableContent')
    .line-container.h-full.py-2.px-1.flex.flex-col
      .line.h-0.flex-grow.w-1.bg-gray-200.rounded.cursor-move(
        ref='moveableHandle'
      )
    .content.h-full.w-0.flex-grow.flex.flex-col
      .buttons.space-x-2.overflow-x.flex.w-full
        TaTextButton.flex-shrink-0(@click='onPreview') 预览
        TaTextButton.flex-shrink-0(@click='onShowData') 查看JSON
        TaTextButton.flex-shrink-0(:id='copyId') 复制到剪切板
        //- input#designer-value(:value='JSON.stringify(item)')
        TaTextButton.flex-shrink-0(@click='onPasteFromClipboard') 粘贴自剪切板
        TaJsonImportExport(v-model:value='item')

      TaTab.w-full(v-model:value='activeTabKey', :tabs='configTabs')
      .flex-grow.h-0
        TaTemplateFormDesignerConfig.w-full(
          v-if='activeTabKey === "normal"',
          v-model:value='activeField',
          :template='item',
          :payload='value'
        )
        TaTemplateFormDesignerGlobalConfig.w-full(v-if='activeTabKey === "global"', v-model:value='item')
        TaTemplateFormDesignerIndexAttributesConfig.w-full(
          v-if='activeTabKey === "index"',
          v-model:value='item.index_attributes',
          :item='item'
        )
        TaTemplateFormDesignerColumnAttributesConfig.w-full(
          v-if='activeTabKey === "columns"',
          v-model:value='item.column_attributes',
          :item='item'
        )
        TaTemplateFormDesignerActionConfig.w-full(
          v-if='activeTabKey === "actions"',
          v-model:value='item.actions',
        )
        TaTemplateFormDesignerStyleConfig.w-full(
          v-if='activeTabKey === "layout"',
          v-model:value='item.options'
        )
        TaTemplateFormDesignerSearcherConfig.w-full(
          v-if='activeTabKey === "searcher"',
          v-model:value='item.options'
        )


  TaTemplateFormDialog(
    v-if='visible',
    v-model:visible='visible',
    :template='item',
    :record='fakeModel',
    :skipValidate='true'
  )
  a-modal(v-model:visible='visibleData', :width='1100')
    //- | {{ item }}
    TaJsonEditor(v-if='visibleData', v-model:value='item')
</template>

<style lang="stylus" scoped>
.line-container
  .line
    opacity 0
    transition opacity 0.1s linear
  &:hover
    .line
      opacity 1
.hidden
  display none
.ta-template-form-designer
  width 100%
  height 100%
  display flex
  // justify-content space-around
  .forms
    display flex
    flex-direction column
    height 100%
    padding 0 12px
    .widget-button
      margin 20px 0
    .widget-groups
      overflow-y scroll
      height 100%
      .widget-group-title
        font-size 14px
        font-weight 600
        color #262626
        margin-bottom 8px
      .widget-group
        margin-bottom 20px
      .widgets
        display grid
        flex-wrap wrap
        width 265px
        grid-template-columns 1fr 1fr
        grid-gap 12px
        .widget
          font-size 14px
          padding 12px 14px
          color #808080
          background #F9FAFC
          cursor pointer
          color rgba(38, 38, 38, 0.85)
          .icon
            margin-right 6px
            color #A6A6A6
          &:hover
            // border 1px $primary-color dashed
            color $primary-color
  .canvas
    // border 1px solid #808080
    flex-grow 1
    width 0
    height 100%
    overflow auto
    background v-bind(background)
    .canvas-form
      height 100%
  .config
    width 400px
.ghost-class
  // display
  width 100%
  background #EFF3FD
  color rgba(89, 89, 89, 0.65)
  border 1px solid white
  display flex
  justify-content center
  align-items center
  border-radius 12px
  min-height 100px
</style>
