<script lang="ts">
import { ResAdminOrgsApi } from '@/res-core/apis/res/admin/orgs.api';
import { ResAdminOrgIdentitiesApi } from '@/res-core/apis/res/admin/org_identities.api';
import { defineComponent } from 'vue';
import { VStore } from '@/lib/vails';
import { orgIdentityTemplate, orgTemplate } from './template';
import { ResOrgModel } from '@/res-core/models/res/org';

const ComResAdminOrgIdentitiesIndex = defineComponent({
  name: 'ComResAdminOrgIdentitiesIndex',
  components: {},
  setup() {
    const identityStore = new VStore(new ResAdminOrgIdentitiesApi());
    const store = new VStore(
      new ResAdminOrgsApi({ params: { q: { s: ['position asc'] } } }),
      ResOrgModel,
    );
    const extraConfig = {
      detail: { mode: 'route' },
      searcherSimpleOptions: [
        { label: '名称', key: 'name', type: 'string' },
        { label: '简称', key: 'short_name', type: 'string' },
      ],
    };

    return {
      identityStore,
      store,
      orgTemplate,
      orgIdentityTemplate,
      extraConfig,
    };
  },
});

export default ComResAdminOrgIdentitiesIndex;
</script>

<template lang="pug">
.com-res-admin-orgs-index
  ComIdentityEditor(
    recordName='组织',
    :store='store',
    recordTemplate='org',
    identityName='类型',
    :identityStore='identityStore',
    :identityTemplate='orgIdentityTemplate',
    recordForeignKey='org_identity_id',
    :extraConfig='extraConfig',
    :draggable='true'
  )
    template(#default)
      a-table-column(:autoHeight='true' title='名称', data-index='name')
      a-table-column(:autoHeight='true' title='简称', data-index='short_name')
      a-table-column(:autoHeight='true' title='类型', data-index='type')
      a-table-column(:autoHeight='true' title='标识', data-index='code')
      a-table-column(:autoHeight='true' title='路径', data-index='ancestryPath')
      a-table-column(:autoHeight='true' title='子组织数', data-index='children_count')
    template(#identity='{ record, isActive, actions }')
      .card.rounded-lg.border-gray-200.border.border-solid.py-2.px-4.mb-2(
        :class='isActive === true ? "active-card" : ""'
      )
        .flex.items-center
          .text-base.font-semibold.text-gray-900.mr-3.name {{ record.name }}
          .text-xs.font-normal.text-gray-500 {{ record.org_type }}
        .flex.justify-between
          .mt-2.text-xs.font-normal.text-gray-500 数量 {{ record.orgs_count }}
          .action.justify-around.space-x-2.bg-white
            TaIcon.icon(v-if='record.id', type='EditOutlined', @click='actions.onEdit(record)')
            TaPopoverConfirm(
              v-if='record.id',
              title='删除',
              content='您确认删除该吗',
              @confirm='actions.onDelete(record)'
            )
              TaIcon(v-if='record.id', type='DeleteOutlined', @click.stop='')
    template(#right-header='{ record }')
      .active-title
        ComIconText(:text='record.name || "全部"')
</template>

<style lang="stylus" scoped>
.com-res-admin-orgs-index
  height 100%
  width 100%
  flex 1
.active-card
  background #EBF5FF
  color #3F83F8 !important
.action
  display none
  background-color transparent
.card:hover .action
  display block
</style>
