<script lang="ts">
import { ResAdminOrgsApi } from '@/res-core/apis/res/admin/orgs.api';
import { ResAdminOrgIdentitiesApi } from '@/res-core/apis/res/admin/org_identities.api';
import { defineComponent } from 'vue';
import { VStore } from '@/lib/vails';
import { TaTemplateFormItem } from '@/components/global/ta-component/ta-template-form-core/types';

const ComResAdminOrgIdentitiesIndex = defineComponent({
  name: 'ComResAdminOrgIdentitiesIndex',
  components: {},
  setup() {
    const identityStore = new VStore(new ResAdminOrgIdentitiesApi());
    const store = new VStore(new ResAdminOrgsApi());
    const identityTemplate: TaTemplateFormItem = {
      type: 'layout',
      model: {},
      key: 'layout_1618807985123',
      model_key: 'layout_1618807985123',
      fields: [
        {
          name: '身份名称',
          type: 'input',
          rules: [{ rule_type: 'required', required: true, message: '请填写正确的名称' }],
          model: { attr_type: 'string' },
          options: { span: 24 },
          key: 'input_1618807986762',
          model_key: 'name',
          fields: [],
        },
      ],
    };

    const recordTemplate: TaTemplateFormItem = {
      type: 'layout',
      model: {},
      key: 'layout_1618809898830',
      model_key: 'layout_1618809898830',
      fields: [
        {
          name: 'user_id',
          type: 'input',
          rules: [],
          model: { attr_type: 'string' },
          options: { span: 24 },
          key: 'input_1618809901385',
          model_key: 'user_id',
          fields: [],
        },
      ],
    };
    return {
      identityStore,
      store,
      identityTemplate,
      recordTemplate,
    };
  },
});

export default ComResAdminOrgIdentitiesIndex;
</script>

<template lang="pug">
.com-res-admin-org-identities-index
  ComIdentityEditor(
    recordName='成员'
    :store='store'
    :recordTemplate='recordTemplate'
    identityName='身份'
    :identityStore='identityStore'
    :identityTemplate='identityTemplate'
  )
    template(#default)
      a-table-column(:autoHeight='true' title='id' data-index='id')
      a-table-column(:autoHeight='true' title='user_id' data-index='user_id')

    template(#identity='{ record, isActive }')
      .card(:class="isActive === true ? 'active-card' : ''")
        .icon-box
          TaIcon(type="UserOutlined")
        .name {{ record.name }}
    template(#right-header='{ record }')
      .active-title
        .icon-box
          TaIcon(type="UserOutlined")
        .text {{ record.name }}（{{ store.totalCount.value }}人）
</template>

<style lang="stylus" scoped>
.com-res-admin-org-identities-index
  height 100%
  width 100%
  flex 1
.card
  height 38px
  width 100%
  padding 0 40px
  display flex
  align-items center
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #262626;
  cursor pointer
  .icon-box
    margin-right 6px
    color #83C6EF
    font-size 16px
.active-card
  background #E3F7FF
.card:hover
  background #E3F7FF

.active-title
  display flex
  align-items center
  font-size: 20px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #595959;
  .icon-box
    margin-right 6px
    color #83C6EF
    font-size 22px
</style>
