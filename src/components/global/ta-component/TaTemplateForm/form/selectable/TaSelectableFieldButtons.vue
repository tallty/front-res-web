<script lang="ts">
import { defineComponent, toRefs, PropType } from 'vue';
import { VObject } from '@/lib/vails/model';
import { useI18n } from 'vue-i18n';

const TaSelectableFieldButtons = defineComponent({
  name: 'TaSelectableFieldButtons',
  components: {},
  props: {
    localValue: { type: Array as PropType<VObject[]>, default: () => [] },
  },
  emits: ['open', 'import', 'export'],
  setup(props, { emit }) {
    const onOpen = () => {
      emit('open');
    };

    const onImport = () => {
      emit('import');
    };

    const onExport = () => {
      emit('export');
    };

    const { t } = useI18n();

    return {
      ...toRefs(props),
      onOpen,
      onImport,
      onExport,
      t,
    };
  },
});
export default TaSelectableFieldButtons;
</script>

<template lang="pug">
.ta-selectable-field-buttons
  a-button.button(@click='onOpen' type='primary' ghost)
    TaIcon.relative.bottom-1(type='PlusOutlined')
    | {{ (localValue || []).length > 0 ? t('taComponent.Api.edit') : t('taComponent.Api.choose') }}

  slot(name='extra')
  //- a-button.button(@click='onImport') 导入
  //- a-button.button(@click='onExport') 导出
</template>

<style lang="stylus" scoped>
.ta-selectable-field-buttons
  display flex
  .button
    margin-right 10px
</style>
