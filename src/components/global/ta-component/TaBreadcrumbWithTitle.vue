<script lang="ts">
import { defineComponent, PropType, toRefs } from 'vue';
import { useRouter } from 'vue-router';

export interface TaBreadcrumbInterface {
  label: string;
  route: string;
}

const TaBreadcrumbWithTitle = defineComponent({
  name: 'TaBreadcrumbWithTitle',
  props: {
    breadcrumbs: { type: Array as PropType<TaBreadcrumbInterface[]>, default: () => [] },
    title: { type: String, default: '' },
  },
  setup(props) {
    const router = useRouter();

    const onClick = (breadcrumb: TaBreadcrumbInterface) => {
      router.push(breadcrumb.route);
    };

    return {
      ...toRefs(props),
      onClick,
    };
  },
});

export default TaBreadcrumbWithTitle;
</script>

<template lang="pug">
.ta-breadcrumb
  a-breadcrumb
    a-breadcrumb-item(v-for='(breadcrumb, index) in breadcrumbs', :key='index')
      span(class='clickable', @click='onClick(breadcrumb)')
        | {{ breadcrumb.label }}
    a-breadcrumb-item(key='title_key')
      span.breadcrumb-with-title-header
        | {{ title }}
</template>

<style lang="stylus" scoped>
.a-breadcrumb
  height 48px
.clickable
  cursor pointer
.breadcrumb-with-title-header
  color #383838
  font-weight 500
  font-size 18px
</style>
