<script lang="ts">
import { ref, defineComponent, toRefs, computed } from 'vue';
import { normalLayoutTemplate } from './designer/normalLayoutTemplate';
import { VStore } from '@/lib/vails';
import { ComUserThemeApi } from './designer/apis/com/user/theme.api';
import { ComTheme } from '@/engines/com/types/model';
import FileServer from '@/components/global/ta-component/file/file';
import { merge } from 'lodash';

const TaTemplateFormDesignerNormalLayoutThemeChest = defineComponent({
  name: 'TaTemplateFormDesignerNormalLayoutThemeChest',
  components: {},
  props: {
    visible: { type: Boolean, default: false },
    options: { type: Object, required: true },
  },
  setup(props, { emit }) {
    const localVisible = computed({
      get: () => props.visible,
      set: val => emit('update:visible', val),
    });

    const localOptions = computed({
      get: () => props.options,
      set: val => emit('update:options', val),
    });

    const activeKey = ref('template');

    const store = new VStore(
      new ComUserThemeApi({
        params: { q: { model_flag: 'form' } },
      }),
    );

    const config = computed(() => ({
      store,
      pagination: {
        hideOnSinglePage: true,
      },
    }));

    const fileServer = new FileServer();
    const getImage = (record: ComTheme) => {
      if (record.model_payload?.value?.card?.image) {
        return fileServer.getCDNUrl(record.model_payload.value.card.image[0]);
      }
    };

    const onSelectTheme = (record: ComTheme) => {
      merge(localOptions.value.theme, record.model_payload.value);
    };

    return {
      ...toRefs(props),
      localVisible,
      localOptions,
      normalLayoutTemplate,
      activeKey,
      config,
      getImage,
      onSelectTheme,
    };
  },
});
export default TaTemplateFormDesignerNormalLayoutThemeChest;
</script>

<template lang="pug">
a-drawer(
  v-model:visible='localVisible',
  :mask='false'
  @close='() => localVisible = false'
)
  .ta-template-form-designer-normal-layout-theme-chest(v-if='localOptions')
    .shell
      .switch
        .left(@click='() => activeKey = "template"') 主题样式
        .right(@click='() => activeKey = "custom"') 自定义
      TaIndexView.template(
        v-show='activeKey === "template"',
        :config='config',
        @onShow='onSelectTheme'
      )
        template(#card='{ record }')
          .theme
            img.image(:src='getImage(record)')
            .title {{ record.name }}
      .custom(v-show='activeKey === "custom"')
        TaTemplateForm(
          v-model:modelValue='localOptions',
          :template='normalLayoutTemplate'
        )
</template>

<style lang="stylus" scoped>
.ta-template-form-designer-normal-layout-theme-chest
  display flex
  justify-content center
  .shell
    width 100%
    .switch
      width 100%
      height 32px
      background #FFFFFF
      box-shadow 0px 0px 3px 2px #EFF3FD
      border-radius 16px
      padding 2px
      display flex
      align-items center
      justify-content center
      margin-bottom 16px
      .left, .right
        display flex
        align-items center
        justify-content center
        flex-grow 1
      .left
        border-right 1px solid #EFF3FD
    .template
      display flex
      flex-direction column
  .theme
    padding 4px
    width 100%
    height 90px
    background #FFFFFF
    box-shadow 0px 4px 10px 0px rgba(12, 31, 80, 0.08)
    border-radius 4px
    margin-bottom 12px
    cursor pointer
    .image
      width 100%
      height 52px
    .title
      display flex
      justify-content center
      align-items center
      color rgba(38, 38, 38, 0.85)
</style>
