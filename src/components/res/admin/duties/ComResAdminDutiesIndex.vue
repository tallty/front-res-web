<script lang="ts">
import { defineComponent, ref, Ref, onMounted, computed } from 'vue';
import { VStore, VModel } from '@/lib/vails';
import { ResAdminDutyGroupsApi } from '@/res-core/apis/res/admin/duty_groups.api';
import { ResAdminDutiesApi } from '@/res-core/apis/res/admin/duties.api';
import { ResDuty, ResDutyGroup, ResMembership } from '@/res-core/model';
import { ResAdminMembershipsApi } from '@/res-core/apis/res/admin/memberships.api';
import ComDutyTreeList from '@/components/res/admin/duties/ComDutyTreeList.vue';
import useAutoTemplateForm from '@/components/global/ta-component/ta-template-form-core/useAutoTemplateForm';
import { dutyGroupTemplate, dutyTemplateFunc, dutyMembershipTemplate } from './template';

const ComResAdminDutiesIndex = defineComponent({
  name: 'ComResAdminDutiesIndex',
  components: {
    ComDutyTreeList,
  },
  setup() {
    const dutyGroupStore = new VStore<ResDutyGroup>(new ResAdminDutyGroupsApi());
    const dutyStore = new VStore<ResDuty>(new ResAdminDutiesApi());
    const membershipStore = new VStore<ResMembership>(new ResAdminMembershipsApi());

    const editor = ref(null);

    const editDutyGroupRecord: Ref<VModel<ResDutyGroup> | null> = ref(null);
    const visibleForm = ref(false);

    onMounted(() => {
      dutyGroupStore.index({ per_page: 999999 });
    });

    const onClickDuty = (duty: VModel<ResDuty> & ResDuty) => {
      (editor.value as any).activeIdentity = duty;
      membershipStore.api = new ResAdminMembershipsApi({
        parents: [
          {
            type: 'duties',
            id: duty.id,
          },
        ],
      });
      membershipStore.index();
    };

    const onCreateDutyGroup = () => {
      editDutyGroupRecord.value = dutyGroupStore.new();
      visibleForm.value = true;
    };

    const onEditGroup = (dutyGroup: ResDuty) => {
      editDutyGroupRecord.value = new VModel(dutyGroup, dutyGroupStore);
      visibleForm.value = true;
    };

    const dutyTemplate = computed(() => {
      const dutyGroupOptions = dutyGroupStore.records.value.map((dutyGroup: ResDutyGroup) => ({
        label: dutyGroup.name,
        value: dutyGroup.id,
      }));
      return dutyTemplateFunc(dutyGroupOptions);
    });

    return {
      dutyGroupStore,
      dutyStore,
      membershipStore,
      dutyGroupTemplate,
      dutyTemplate,
      editor,
      onClickDuty,
      onEditGroup,
      onCreateDutyGroup,
      editDutyGroupRecord,
      visibleForm,
      dutyMembershipTemplate,
    };
  },
});

export default ComResAdminDutiesIndex;
</script>

<template lang="pug">
.com-res-admin-duties-index
  ComIdentityEditor(
    ref='editor',
    recordName='成员',
    :store='membershipStore',
    :recordTemplate='dutyMembershipTemplate',
    identityName='角色',
    :identityStore='dutyStore',
    :identityTemplate='dutyTemplate',
    recordForeignKey='duty_id',
    parentType='duties',
    :actions='null',
  )
    template(#actions)
      TaRoundButton.add-button(@click='onCreateDutyGroup') 新增角色组

    template(#left-custom)
      ComDutyTreeList(
        :dutyStore='dutyStore',
        :dutyGroupStore='dutyGroupStore',
        :dutyTemplate='dutyTemplate',
        :dutyGroupTemplate='dutyGroupTemplate',
        @clickDuty='onClickDuty'
      )
    template(#right-header='{ record }')
      .active-title
        .icon-box
          TaIcon(type='UserOutlined')
        .text
          | {{ record.name }}
          | {{ membershipStore.totalCount.value >= 0 ? `（${membershipStore.totalCount.value}人）` : ''}}

  TaTemplateFormDialog(
    v-model:visible='visibleForm',
    :template='dutyGroupTemplate',
    :record='editDutyGroupRecord'
  )
</template>

<style lang="stylus" scoped>
.com-res-admin-duties-index
  height 100%
  width 100%
  flex 1
  .add-button
    background $primary-color
    color white
    width 200px
    margin-right 10px
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
