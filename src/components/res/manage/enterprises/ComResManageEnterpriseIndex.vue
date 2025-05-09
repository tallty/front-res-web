<script lang="ts">
import { ResManageOrgApi } from '@/res-core/apis/res/manage/org.api';
import { VObject, VStore } from '@/lib/vails';
import { defineComponent, computed } from 'vue';
import { useRouter } from 'vue-router';

const ComResManageEnterpriseIndex = defineComponent({
  name: 'ComResManageEnterpriseIndex',
  props: {
    options: { type: Object, default: () => ({}) },
  },
  setup(props) {
    const store = new VStore(new ResManageOrgApi());

    const config = computed(() => ({
      recordName: '企业管理',
      store,
      mode: 'table',
      params: {
        q: {
          tanents_code_in: process.env.VUE_APP_TENENT_CODE,
        },
      },
      table: {
        scroll: { y: 'auto' },
        columns: [
          { dataIndex: 'name', title: '名称' },
          // { dataIndex: 'users_count', title: '人数' },
          { dataIndex: '', title: '操作' },
        ],
      },
    }));

    const router = useRouter();

    const onShow = (record: VObject) => {
      const params = {
        orgId: record.id,
        ...props.options,
      };

      const id = window.btoa(JSON.stringify(params));

      router.push({ path: `/res/manage/enterprises/${id}` });
    };

    return {
      config,
      onShow,
    };
  },
});

export default ComResManageEnterpriseIndex;
</script>

<template lang="pug">
.com-res-manage-enterprise-index.w-full.h-full
  TaIndexView(:config='config', @onShow='onShow')
    template(#bodyCell='{ text, record, index, column }')
      .primary-color.text-sm.cursor-pointer(
        v-if='column.title == "操作"',
        @click.stop='onShow(record)'
      ) 管理
</template>

<style lang="stylus" scoped>
.primary-color
  color: $primary-color
</style>
