<script lang="ts">
import { defineComponent, toRefs, computed } from 'vue';
import useCondition from '../../ta-template-form-core/useCondition';
import { TaBuilderProp, propIsSlotProp } from '../types';
import { useScreenDataFetchCollectionInject } from './useScreenDataFetchCollection';

const TaConditionLayer = defineComponent({
  name: 'TaConditionLayer',
  components: {},
  props: {
    componentSchema: { type: Object, default: () => ({}) },
  },
  setup(props) {
    const { dataResult } = useScreenDataFetchCollectionInject({});

    const enableSlots = computed(() => {
      return Object.keys(props.componentSchema.props)
        .filter((key: string) => {
          const prop: TaBuilderProp = props.componentSchema.props[key];
          const { checkCondition } = useCondition({}, {}, dataResult?.value || {});
          // console.log(dataResult?.value, 'dataResult');

          return (
            propIsSlotProp(prop) && checkCondition({ ...prop.condition, type: 'complex' } || {})
          );
        })
        .map((key: string) => ({ key, ...props.componentSchema.props[key] }));
    });
    return {
      ...toRefs(props),
      enableSlots,
    };
  },
});
export default TaConditionLayer;
</script>

<template lang="pug">
.ta-builder-condition-layer.w-full.h-full
  //- h1 enableSlots {{ enableSlots}}
  template(v-for='slot in enableSlots')
    slot(:name='slot.key')
</template>

<style lang="stylus" scoped></style>
