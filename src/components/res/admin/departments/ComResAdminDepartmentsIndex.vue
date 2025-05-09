<script lang="ts">
import { ResAdminDepartmentsApi } from '@/res-core/apis/res/admin/departments.api';
import { ResAdminDepartmentIdentitiesApi } from '@/res-core/apis/res/admin/department_identities.api';
import { defineComponent } from 'vue';
import { VStore } from '@/lib/vails';
import { VObject } from '@/lib/vails/model';
import { departmentTemplate, departmentIdentityTemplate } from './template';

const ComResAdminMembersIndex = defineComponent({
  name: 'ComResAdminDepartmentsIndex',
  components: {},
  setup() {
    const identityStore = new VStore(new ResAdminDepartmentIdentitiesApi());
    const store = new VStore(
      new ResAdminDepartmentsApi({
        parents: [
          {
            type: 'orgs',
            id: 1,
          },
        ],
      }),
    );

    const btnStyle = (record: VObject) => {
      let style = {
        color: '',
        borderColor: '',
        background: '',
      };
      if (record.color) {
        style = {
          color: '#fff',
          borderColor: record.color,
          background: record.color,
        };
      }
      return style;
    };

    return {
      identityStore,
      store,
      btnStyle,
      departmentTemplate,
      departmentIdentityTemplate,
    };
  },
});

export default ComResAdminMembersIndex;
</script>

<template lang="pug">
.com-res-admin-members-index
  ComIdentityEditor(
    recordName='部门'
    :store='store'
    :recordTemplate='departmentTemplate'
    identityName='类型'
    :identityStore='identityStore'
    :identityTemplate='departmentIdentityTemplate'
    recordForeignKey="department_identity_id"
  )
    template(#default)
      a-table-column(:autoHeight='true' title='id' data-index='id')
      a-table-column(:autoHeight='true' title='name' data-index='name')

    template(#identity='{ record, isActive, actions }')
      .card(:class="isActive === true ? 'active-card' : ''")
        .left
          .icon-box
            ComTypeLabel.type(
              :style="btnStyle(record)"
              :label="record.department_type"
              v-if="record.department_type"
            )
          .name {{ record.name }}
        .right
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
        ComIconText(
          :text="record.name || '全部'"
        )
</template>

<style lang="stylus" scoped>
.com-res-admin-members-index
  height 100%
  width 100%
  flex 1
.card
  height 38px
  width 100%
  padding 0 40px
  display flex
  align-items center
  justify-content space-between
  font-size 14px
  font-family PingFangSC-Regular, PingFang SC
  font-weight 400
  color #262626
  cursor pointer
  .left
    display flex
    align-items center
    .icon-box
      margin-right 6px
      color #83C6EF
      font-size 16px
  .right
    display none
    .icon
      margin-right 5px
  &:hover
    .right
      display flex
.active-card
  background #E3F7FF
.card:hover
  background #E3F7FF

.active-title
  display flex
  align-items center
  font-size 20px
  font-family PingFangSC-Regular, PingFang SC
  font-weight 400
  color #595959
  .text
    .name
      margin-right 6px
  .icon-box
    margin-right 6px
    color #83C6EF
    font-size 22px
</style>
