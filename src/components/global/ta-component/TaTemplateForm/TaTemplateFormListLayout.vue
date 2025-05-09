<script lang="ts">
import { FormsResourceInfos } from '@/components/global/ta-component/ta-template-form-core/apis/forms/resource_infos';
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';
import { VStore } from '@/lib/vails';
import { VObject } from '@/lib/vails/model';
import { VRequestResponse } from '@/lib/vails/request';
import { merge } from 'lodash';
import { PropType, Ref, computed, defineComponent, ref, toRefs } from 'vue';
import draggable from 'vuedraggable';
import { TaTemplateFormRule } from '../../../../engines/bpm/bpm-core/ta-template-form-core/types';
import { useFormProvide } from '../ta-template-form-core/useForm';
import useFormField from '../ta-template-form-core/useFormField';
import useListLayout from '../ta-template-form-core/useListLayout';
import { useOptionsConfigInject } from '../ta-template-form-core/useOptionsConfig';
import { TaIndexImportHeader } from '../TaIndexView/types';

const TaTemplateFormListLayout = defineComponent({
  name: 'TaTemplateFormListLayout',
  components: {
    draggable,
  },
  props: {
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => [] },
    needLabel: { type: Boolean, default: true },
    needTableActions: { type: Boolean, default: true },
  },
  emits: ['create', 'update', 'delete'],
  setup(props, { emit }) {
    const { headerLabelStyle, isViewer } = useFormField(props);
    // emits: [create update delete]
    const {
      visible,
      records,
      form,
      onOk,
      onCreate,
      onUpdate,
      onDelete,
      onClear,
      fakeModel,
      emitUpdate,
      fakeRecord,
      disabled,
      hidden,
      cardTemplateAry,
      create,
    } = useListLayout(props, emit);

    const modalVisible = computed({
      get: () => visible.value && !props.item.options?.edit_directly,
      set: val => (visible.value = val),
    });

    // @ts-ignore
    const activeCardTemplate = computed<TaTemplateFormItem>(() => {
      const activeIndex = records.value.findIndex(
        (record: VObject) => record._id === fakeRecord.value.formData._id,
      );
      if (activeIndex !== -1) {
        return cardTemplateAry.value[activeIndex];
      }
      return props.item;
    });

    const { localOptionsConfig } = useOptionsConfigInject();

    const hexToRgb = (hex: string) => {
      return (
        'rgba(' +
        parseInt('0x' + hex.slice(1, 3)) +
        ',' +
        parseInt('0x' + hex.slice(3, 5)) +
        ',' +
        parseInt('0x' + hex.slice(5, 7)) +
        ', 0.5)'
      );
    };

    const backgroundColor = computed(() =>
      typeof localOptionsConfig.value?.theme === 'object' &&
      localOptionsConfig.value?.theme?.background?.color
        ? hexToRgb(localOptionsConfig.value.theme.background.color)
        : '',
    );

    const resourceInfoStore = new VStore(new FormsResourceInfos());
    const taImport = ref<any>(null);

    const onImport = () => {
      taImport.value.clickFileInput();
    };

    const onImportConfirm = (opts: {
      resetImport: () => void;
      uid: Ref<string>;
      resultHeaders: TaIndexImportHeader[];
    }) => {
      const headerNameToKeyMapping = opts.resultHeaders.reduce(
        (out: VObject, header: TaIndexImportHeader) => {
          out[header.name!] = header.key;
          return out;
        },
        {} as VObject,
      );
      const transRecord = (record: VObject) => {
        return Object.keys(record).reduce((out: VObject, name: string) => {
          out[headerNameToKeyMapping[name]] = record[name];
          return out;
        }, {});
      };
      resourceInfoStore
        .sendCollectionAction({
          action: 'excel',
          config: { params: { uid: opts.uid.value, page: 1, per_page: 999999 } },
        })
        .then((res: VRequestResponse) => {
          res.data.records.forEach((record: VObject) => {
            create(transRecord(record));
          });
          opts.resetImport();
        });
    };

    const formDisplay = computed(() => props.item.options?.display);

    const { valueKey } = useFormField(props);
    const formItemName = computed(() => valueKey.value.split('.'));
    const rules = computed(() => {
      // 如果字段隐藏且没有设置validateWhenHidden为true，则不验证
      if (hidden.value && !(props.item.options?.validateWhenHidden === true)) {
        return [];
      }

      const result = [];
      if (
        props.item.options?.required ||
        props.item.rules?.find((rule: TaTemplateFormRule) => rule.required)
      ) {
        result.push({
          validator: () => {
            if (Array.isArray(records.value) && records.value.length > 0) {
              return Promise.resolve();
            }
            return Promise.reject(`${props.item.name}至少填写一项`);
          },
          // message: `${props.item.name}至少填写一项`,
        });
      }

      if (typeof props.item.options?.min === 'number') {
        result.push({
          validator: () => {
            if (records.value.length < props.item.options!.min!) {
              return Promise.reject(`${props.item.name}至少填写${props.item.options?.min}项`);
            }
            return Promise.resolve();
          },
        });
      }

      if (typeof props.item.options?.max === 'number') {
        result.push({
          validator: () => {
            if (records.value.length > props.item.options!.max!) {
              return Promise.reject(`${props.item.name}最多填写${props.item.options?.max}项`);
            }
            return Promise.resolve();
          },
        });
      }

      return result;
    });

    return {
      ...toRefs(props),
      modalVisible,
      records,
      form,
      onOk,
      onCreate,
      onUpdate,
      onDelete,
      fakeModel,
      emitUpdate,
      fakeRecord,
      disabled,
      headerLabelStyle,
      isViewer,
      value: fakeRecord.value.formData,
      cardTemplateAry,
      activeCardTemplate,
      merge,
      hidden,
      backgroundColor,
      resourceInfoStore,
      taImport,
      onImport,
      onImportConfirm,
      onClear,
      formDisplay,
      formItemName,
      rules,
    };
  },
  created() {
    useFormProvide(this);
  },
});
export default TaTemplateFormListLayout;
</script>

<template lang="pug">
a-form-item.ta-template-form-list-layout(
  v-if='!hidden',
  :style='backgroundColor ? { "--background-color": backgroundColor } : {}',
  :class='{ "ta-template-form-list-layout-disabled": disabled }',
  :rules='rules',
  :name='formItemName'
)
  .list-actions.transition-all(v-if='!disabled', name='')
    .left
      //- TaTextButton.left(icon='DownloadOutlined', @click.stop='onExportTemplate')
        | 导出模板
      TaTextButton.right(
        v-if='!item.options?.disabled_actions?.import',
        icon='UploadOutlined',
        @click.stop='onImport'
      )
        | 导入数据
    .right
      TaPopoverConfirm(title='一键清空', content='您确认清空该部分数据吗？', @confirm='onClear')
        TaTextButton.right(icon='DeleteOutlined', v-show='records?.length !== 0') 一键清空
      TaTextButton.right(icon='DeleteOutlined', :disabled='true', v-show='records?.length === 0') 一键清空
  //- template(v-if='true')
  template(v-if='formDisplay === "table"')
    TaTemplateFormListLayoutTable(
      :records='records',
      :disabled='disabled',
      :templateAry='cardTemplateAry',
      :needTableActions='needTableActions',
      @update='onUpdate',
      @delete='onDelete'
    )
  template(v-else)
    draggable(item-key='_id', handle='.handle', :list='records')
      template(#item='{ element: record, index }')
        .viewer-card.relative
          .handle.transition-all.opacity-0.absolute.top-0.left-0.bg-white.flex.justify-center.items-center.cursor-move
            TaIcon.text-gray-700.h-8.w-5.pt-2(type='DragOutlined')
          .label(v-if='needLabel')
            .label-left
              TaIcon.label-icon(v-if='item.options?.icon', :type='item.options.icon')
              .label-text(:style='headerLabelStyle', :class='{ "viewer-label": isViewer }')
                | {{ item.name }}（{{ index + 1 }}）
            .label-right
              .label-delete(v-if='!disabled && !item.options?.disabled_actions?.destroy')
                TaIconTooltip.delete-icon(
                  v-if='!disabled && !item.options?.disabled_actions?.destroy',
                  icon='DeleteOutlined',
                  tips='删除',
                  @click.stop='onDelete(index)'
                )
          .card-label(v-if='typeof item.options?.cardLabel === "function"')
            | {{ item.options?.cardLabel(item.name, index) }}
          .card-box(@click='onUpdate(record)')
            template(v-if='item.options?.edit_directly && !isViewer')
              TaTemplateForm(
                v-model:modelValue='records[index]',
                :template='cardTemplateAry[index]',
                @update:modelValue='emitUpdate',
                :useDefaultTheme='false'
              )
            template(v-else)
              TaTemplateFormViewer(
                :template='{ ...cardTemplateAry[index], type: "layout" }',
                v-model:modelValue='records[index]',
                :useDefaultTheme='false'
              )

  .create-button(
    v-if='!disabled && !item.options?.disabled_actions?.create',
    :class='{ "flex-between": records?.length === 0 }',
    @click='onCreate'
  )
    .center ⊕ 添加{{ item.name }}
  a-modal(
    v-if='modalVisible',
    v-model:visible='modalVisible',
    @ok='onOk',
    width='800px',
    :z-index='1000'
  )
    TaTemplateForm(
      ref='form',
      v-model:modelValue='fakeRecord.formData',
      :template='activeCardTemplate',
      :registerSubForm='false',
      :useDefaultTheme='false'
    )
  TaImport.hidden(
    ref='taImport',
    :store='resourceInfoStore',
    :template='{ ...item, type: "layout" }',
    :onConfirmFunc='onImportConfirm'
  )
</template>

<style lang="stylus" scoped>
.hidden
  display none
.ta-template-form-list-layout
  width 100%
  padding 16px 24px
  background var(--background-color, rgba($primary-color, 0.1))
  margin-bottom 28px
  position relative
  .list-actions
    display flex
    justify-content space-between
    margin-bottom 10px
    opacity 0
    height 0
  &:hover
    .list-actions, .handle
      opacity 1
      height 1rem
    .handle
      left -1.25rem
  .viewer-card
    margin-bottom 10px
    background white
    padding 24px
    border-radius 4px
    .label
      width 100%
      color $primary-color
      margin-left 12px
      margin-bottom 21px
      display inline-block
      font-size 16px
      font-weight 500
      color $primary-color
      line-height 24px
      display flex
      justify-content space-between
      align-items center
      .label-left, .label-text
        flex-grow 1
        display flex
      .label-icon, .label-text
        margin-right 4px
    .label-right
      display flex
      justify-content flex-end
      flex-wrap nowrap
      .button
        margin-right 17px
      .label-delete
        width 36px
        height 24px
        background rgb(243, 244, 246)
        border-radius 12px
        display flex
        justify-content center
        align-items center
        .delete-icon
          color #A6A6A6
          display flex
          justify-content center
          align-items center
  >>> .ant-form-item
    margin-bottom 0
  .viewer
    margin-bottom 24px
.card-label
  padding 10px 20px
.card-box
  cursor pointer
  margin-bottom 10px
.create-button
  width 100%
  margin-bottom 10px
  border 1px solid $primary-color
  color rgba(0, 0, 0, 0.8)
  display flex
  align-items center
  justify-content center
  cursor pointer
  color $primary-color
  background white
  position relative
  .center
    padding 10px
.ta-template-form-list-layout-disabled
  padding 0
</style>
