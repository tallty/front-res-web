<script lang="ts">
import { merge } from 'lodash';
import { VStore } from '@/lib/vails';
import { PropType, defineComponent, ref, computed, toRefs } from 'vue';
import { TaTemplateFormItem } from '../ta-template-form-core/types';
import { TaIndexViewAction } from './ta-index-view-core/types';
import { Modal } from 'ant-design-vue';
import { VObject } from '../../../../lib/vails/model/index';
import useProcessFields from '@/components/global/ta-component/ta-template-form-core/useProcessFields';

const TaExportFile = defineComponent({
  name: 'TaExportFile',
  props: {
    store: { type: Object as PropType<VStore<any>>, required: true },
    template: { type: Object as PropType<TaTemplateFormItem>, default: undefined },
    temporaryQuery: { type: Object, default: () => ({}) },
    temporaryParams: { type: Object, default: () => ({}) },
    headerTitle: { type: String, default: '选择导出字段' },
    okText: { type: String, default: '确定' },
    cancelText: { type: String, default: '取消' },
    allText: { type: String, default: '全选' },
    action: { type: Object as PropType<TaIndexViewAction>, default: undefined },
    filename: { type: [String, Function], default: undefined },
    name: { type: String, default: '导出文件' },
  },
  setup(props) {
    const loading = ref(false);
    const visible = ref(false);
    const indeterminate = ref(true);
    const checkAll = ref(false);
    const headerOptions = ref<{ label: string; value: string }[]>([]);
    const selectedKeys = ref<string[]>([]);

    const { processField } = useProcessFields();

    const onHeaders = () => {
      if (loading.value) {
        return;
      }
      loading.value = true;
      headerOptions.value = [];
      processField(props.template!, {}, (item: TaTemplateFormItem) => {
        if (
          [
            'image',
            'file',
            'image_single',
            'video_single',
            'image_single_new',
            'image_picker',
            'video_single_new',
          ].includes(item.type!)
        ) {
          headerOptions.value.push({ label: item.name!, value: item.key! });
        }
      });
      loading.value = false;
      visible.value = true;
    };

    const onCancel = () => {
      visible.value = false;
    };

    const onConfirm = () => {
      if (loading.value) {
        return;
      }

      loading.value = true;
      const params = merge(
        {
          q: { ...props.store.query.value, ...props.temporaryQuery },
          sub_q: { ...props.store.subQuery.value },
        },
        props.store.api.params,
        props.temporaryParams,
      );
      props.store
        .sendCollectionAction({
          action: 'export_file',
          config: {
            params,
            data: { ...params, headers: selectedKeys.value, ta_template: props.template },
            responseType: 'arraybuffer',
          } as any,
        })
        .then(res => {
          loading.value = false;
          const url = window.URL.createObjectURL(
            new Blob([res.data as string], {
              type: 'octet/stream',
              // type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
          );
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          if (props.filename) {
            if (typeof props.filename === 'function') {
              a.download = `${props.filename()}.zip`;
            } else {
              a.download = `${props.filename}.zip`;
            }
          } else {
            a.download = `${new Date().getTime()}.zip`;
          }
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        })
        .catch(err => {
          loading.value = false;
          throw err;
        });
    };

    const onChange = (checkedList: string[]) => {
      indeterminate.value = !!checkedList.length && checkedList.length < headerOptions.value.length;
      checkAll.value = checkedList.length === headerOptions.value.length;
    };

    const onCheckAllChange = (e: any) => {
      selectedKeys.value = e.target.checked ? headerOptions.value.map(header => header.value) : [];
      indeterminate.value = false;
      checkAll.value = e.target.checked;
    };

    return {
      ...toRefs(props),
      loading,
      onHeaders,
      visible,
      onCancel,
      indeterminate,
      checkAll,
      onCheckAllChange,
      selectedKeys,
      onChange,
      onConfirm,
      headerOptions,
    };
  },
});

export default TaExportFile;
</script>

<template lang="pug">
.ta-export
  TaPopoverConfirm(
    v-if='action?.confirm',
    :title='action.label',
    :content='action.options?.confirmText || `您确认${action.label}这些${activeRecordName}吗？`',
    @confirm='onHeaders'
  )
    TaTextButton(:icon='loading ? "LoadingOutlined" : "ExportOutlined"')
      | {{ name }}
  TaTextButton(v-else, :icon='loading ? "LoadingOutlined" : "ExportOutlined"', @click='onHeaders')
    | {{ name }}
  TaNoPaddingModal(
    top='20vh',
    :title='headerTitle',
    :visible='visible',
    :width='960',
    :footer='null',
    @cancel='onCancel'
  )
    .flex.flex-col
      .flex-grow.py-4.px-6.flex
        a-checkbox.flex-shrink-0.mr-2(:indeterminate='indeterminate', :checked='checkAll', @change='onCheckAllChange') {{ allText }}
        a-checkbox-group.check-box-custom.flex-grow.w-0(
          v-model:value='selectedKeys',
          @change='onChange'
        )
          a-row(:gutter='20')
            a-col(:span='6', v-for='opt in headerOptions', :key='opt.value')
              a-checkbox(:value='opt.value') {{ opt.label }}
        //- template(#footer)
      .footer.flex-shrink-0
        a-button.button(size='large', @click='onCancel') {{ cancelText }}
        a-button(
          type='primary',
          size='large',
          :loading='loading',
          :disabled='selectedKeys.length === 0',
          @click='onConfirm'
        ) {{ okText }}
</template>

<style lang="stylus" scoped>
.ta-export
  cursor pointer
  display flex

.footer
  display flex
  justify-content flex-end
  padding 10px
  width 100%
  border-top 1px #e8e8e8 solid
  .button
    margin-right 10px
  button
    width 80px
</style>

<style lang="stylus">
.check-box-custom
  .ant-checkbox-wrapper
    width 100%
    .ant-checkbox
      @apply flex-shrink-0
    span:not(.ant-checkbox):not(.ant-checkbox-inner)
      @apply break-words whitespace-pre-wrap w-0 flex-grow
</style>
