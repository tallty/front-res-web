<script lang="ts">
import { ref, defineComponent, toRefs, PropType, onMounted, nextTick } from 'vue';
import { computed } from '@vue/reactivity';
import { DataFormFormSettingInterface } from '../ta-template-form-core/data_form/types';
// import TaTemplateFormDesigner from '@/components/global/ta-component/TaTemplateForm/designer/TaTemplateFormDesigner.vue';
import { getDataFormModelSettingTemplate } from './template';
import useKey from '../TaTemplateForm/designer/useKey';
import { cloneDeep, merge, omit, mergeWith } from 'lodash';
import { VObject, VModel } from '../../../../lib/vails/model/index';
import { TaTemplateFormItem, TaTemplateFormSelect } from '../ta-template-form-core/types';
import { FormSetting } from '../ta-template-form-core/data_form/form_setting';
import { TaTemplateFormItemValidate } from '../TaTemplateForm/designer/TaTemplateFormItemValidate';
import { uniqBy } from 'lodash-es';

const TaFormSettingDesigner = defineComponent({
  name: 'TaFormSettingDesigner',
  components: {},
  props: {
    value: {
      type: Object as PropType<DataFormFormSettingInterface>,
      default: undefined,
    },
    item: {
      type: Object as PropType<TaTemplateFormItem>,
      default: () => ({}),
    },
    title: { type: String, default: '表单配置' },
    dataFormOptions: { type: Array as PropType<TaTemplateFormSelect[]>, default: undefined },
  },
  setup(props, { emit }) {
    const localValue = computed({
      get: () => props.value,
      set: value => {
        emit('update:value', value);
      },
    });

    const activeIndex = ref(0);
    const visibleEdit = ref(false);
    const onEditFormSetting = () => {
      visibleEdit.value = true;
    };

    const loading = ref(true);

    const { generateKey } = useKey();

    onMounted(() => {
      if (!localValue.value?.setting?.confs) {
        localValue.value = {
          setting: {
            type: 'copy',
            confs: [{ conf: { type: 'copy', form: {} }, seq: generateKey({}) }],
          },
        };
      }

      nextTick(() => {
        loading.value = false;
      });
    });

    const onAddDataFormConf = () => {
      localValue.value?.setting?.confs?.push({
        seq: generateKey({}),
        conf: {
          type: 'copy',
          form: {},
        },
      });
      loading.value = true;
      activeIndex.value = (localValue.value?.setting.confs.length || 1) - 1;
      nextTick(() => (loading.value = false));
    };

    const onDeleteDataFormConf = (index: number) => {
      const result = localValue.value!;
      result.setting.confs.splice(index, 1);
      localValue.value = result;
    };

    const disabled = computed(() =>
      ['model_setting', 'template'].includes(localValue.value!.setting?.type),
    );

    const formSettingTemplate = computed(() => {
      return getDataFormModelSettingTemplate(localValue.value, {
        dataFormOptions: uniqBy(
          [
            ...(props.value ? new FormSetting(props.value).getDataFormOptions(props.title) : []),
            ...(props.dataFormOptions || props.item.options?.data_form_options || []),
          ],
          (opts: TaTemplateFormSelect) => opts.value,
        ),
      });
    });

    const withoutSettingValue = computed({
      get: () => ({
        ...localValue.value,
        setting: {
          ...(localValue.value?.setting || {}),
          confs: undefined,
        },
      }),
      set: (val: VObject) => {
        mergeWith(
          localValue.value,
          {
            ...val,
            setting: omit(val.setting, ['confs']),
          },
          VModel.mergeWithCustomizer,
        );
      },
    });

    const validate = () => {
      const promises: Promise<void>[] = [];
      (localValue.value?.setting?.confs || []).forEach((conf: any) => {
        if (conf.conf.type === 'copy') {
          promises.push(TaTemplateFormItemValidate(conf.conf.form));
        }
      });
      return Promise.all(promises);
    };

    return {
      ...toRefs(props),
      localValue,
      activeIndex,
      onEditFormSetting,
      visibleEdit,
      onAddDataFormConf,
      onDeleteDataFormConf,
      formSettingTemplate,
      disabled,
      loading,
      withoutSettingValue,
      validate,
    };
  },
});
export default TaFormSettingDesigner;
</script>

<template lang="pug">
.ta-form-setting-designer.flex.flex-col.w-full(v-if='localValue?.setting && !loading')
  .flex-shrink-0.w-full.py-2-px-4.bg-white
    .flex.flex-between.items-center.space-x-6
      .space-x-2.flex.items-center.overflow-auto
        .shadow.flex-shrink-0.w-14.h-14.flex.justify-center.items-center.rounded-lg.cursor-pointer(
          @click='onEditFormSetting'
        )
          TaIcon(type='AppstoreOutlined', size='20px')

        template(v-if='!disabled')
          TaDataFormConfCard.cursor-pointer(
            v-for='(conf, index) in localValue.setting.confs',
            v-model:value='localValue.setting.confs[index]',
            :disabled='disabled',
            @delete='onDeleteDataFormConf(index)',
            @click='() => activeIndex = index'
          )

          .shadow.flex-shrink-0.w-14.h-14.flex.justify-center.items-center.rounded-lg.cursor-pointer(
            @click='onAddDataFormConf'
          )
            TaIcon(type='PlusOutlined', size='20px')
      .extra-options.space-x-2.flex.items-center
        ComPerfUnitDefineConnectionsField(v-model:value='localValue')
  .w-full.flex-grow.h-0(v-if='!disabled')
    template(v-if='localValue.setting.confs[activeIndex]?.conf?.type == "copy"')
      TaTemplateFormDesigner(
        v-if='!disabled',
        :key='activeIndex',
        v-model:value='localValue.setting.confs[activeIndex].conf.form'
      )
      TaTemplateFormViewer(
        v-else,
        :template='localValue.setting.confs[activeIndex].conf.form',
        :modelValue='{}'
      )

    TaFormSettingModelSettingConf(
      v-else-if='localValue.setting.confs[activeIndex]?.conf?.type == "model_setting"'
      :value='localValue.setting.confs[activeIndex].conf'
    )

    //- TaFormSettingFormsTemplateConf(
    //-   v-else-if='localValue.setting.confs[activeIndex]?.conf?.type == "template"'
    //-   :value='localValue.setting.confs[activeIndex].conf'
    //- )

    .w-full.h-full.text-gray-500.flex.items-center.justify-center(v-else)
      | 请在上方创建表单配置项

  TaNoPaddingModal(
    v-model:visible='visibleEdit',
    title='表单配置',
    :footer='null',
    :rounded='true',
    width='70vw'
  )
    TaTemplateForm(
      v-model:visible='visibleEdit',
      v-model:modelValue='withoutSettingValue',
      :template='formSettingTemplate'
    )
</template>

<style lang="stylus" scoped></style>
