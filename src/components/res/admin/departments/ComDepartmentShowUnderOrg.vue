<script lang="ts">
import { ref, defineComponent, toRefs } from 'vue';

const ComDepartmentShowUnderOrg = defineComponent({
  name: 'ComDepartmentShowUnderOrg',
  components: {},
  props: {
    department: { type: Object, required: true },
  },
  setup(props) {
    return {
      ...toRefs(props),
    };
  },
});
export default ComDepartmentShowUnderOrg;
</script>

<template lang="pug">
.com-department-show-under-org
  h3 1{{ department.name  }}
</template>

<style lang="stylus" scoped></style>
