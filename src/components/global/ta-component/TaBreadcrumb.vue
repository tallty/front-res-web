<script lang="ts">
import { defineComponent, PropType, toRefs } from 'vue';
import { useRouter } from 'vue-router';

export interface TaBreadcrumbInterface {
  label: string;
  route: string;
}

const TaBreadcrumb = defineComponent({
  name: 'TaBreadcrumb',
  props: {
    breadcrumbs: { type: Array as PropType<TaBreadcrumbInterface[]>, default: () => [] },
    emitRoute: { type: Boolean, default: () => false },
  },
  setup(props, { emit }) {
    const router = useRouter();

    const onClick = (breadcrumb: TaBreadcrumbInterface) => {
      if (props.emitRoute) {
        return emit('routeChange', breadcrumb.route);
      }
      router.push(breadcrumb.route);
    };

    return {
      ...toRefs(props),
      onClick,
    };
  },
});

export default TaBreadcrumb;
</script>

<template lang="pug">
.ta-breadcrumb
  a-breadcrumb
    a-breadcrumb-item(v-for='(breadcrumb, index) in breadcrumbs', :key='index')
      span(:class='{ clickable: index !== breadcrumbs.length - 1 }', @click='onClick(breadcrumb)')
        | {{ breadcrumb.label }}
</template>

<style lang="stylus" scoped>
.clickable
  cursor pointer
</style>
