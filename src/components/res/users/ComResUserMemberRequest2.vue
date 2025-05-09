<script lang="ts">
import { ref, defineComponent, toRefs, computed, reactive, watch, PropType, onMounted } from 'vue';
import { TaTemplateFormStepsStep } from '@/components/global/ta-component/ta-template-form-core/types';
import { VStore } from '@/lib/vails';
import { ResUserMemberIdentitiesApi } from '@/res-core/apis/res/user/member_identities.api';
import { ResUserMemberRequestsApi } from '@/res-core/apis/res/user/member_requests.api';
import ComBpmInstanceDetailDialog from '@/engines/bpm/components/ComBpmInstanceDetailDialog.vue';
import { message } from 'ant-design-vue';
import { AuthSessionApi } from '@/engines/login/apis/auth/session.api';

const ComResUserMemberRequest = defineComponent({
  name: 'ComResUserMemberRequest',
  components: {
    ComBpmInstanceDetailDialog,
  },
  props: {
    previousSteps: { type: Array as PropType<TaTemplateFormStepsStep[]>, default: () => [] },
    memberType: { type: String, required: true },
    memberRequestType: { type: String, required: false },
    memberIdentityFlag: { type: String, required: true },
    visible: { type: Boolean, default: false },
    formTitle: { type: String, default: '认证' },
  },
  setup(props, { emit }) {
    const formData = ref<any>({});
    const selectedInstanceId = ref(0);
    const visibleInstanceDetail = ref(false);
    const onlySave = ref(true);
    const draftId = ref();
    const localVisible = computed({
      get: () => props.visible,
      set: val => emit('update:visible', val),
    });

    watch(
      () => props.memberType,
      () => {
        formData.value = {
          model_payload: {},
        };
      },
      {
        immediate: true,
      },
    );

    const memberIdentityStore = new VStore(new ResUserMemberIdentitiesApi({}));
    const memberIdentity = ref<any>({});

    const fetchIdentities = () => {
      memberIdentityStore.index({ q: { member_type_eq: props.memberType } }).then((data: any) => {
        memberIdentity.value = data.records[0];
      });
    };

    const store = new VStore(new ResUserMemberRequestsApi({}));

    const initData = async () => {
      const { records } = await store.index({
        q: {
          member_identity_member_type_eq: props.memberType,
          s: 'id desc',
        },
        page: 1,
        per_page: 1,
      });

      // 获取最近一次认证申请记录
      if (records.length > 0) {
        const data: any = records[0];
        draftId.value = data?.id;
        formData.value = {
          model_payload: {
            ...(data.member?.model_payload || data.model_payload),
          },
        };

        if (['terminated'].includes(data.state)) {
          message.success('历史信息已加载');
        } else if (['draft'].includes(data.state)) {
          message.success('暂存信息已加载');
          onlySave.value = false;
        } else if (['processing'].includes(data.state)) {
          visibleInstanceDetail.value = !!data.create_instance_id;
          selectedInstanceId.value = data.create_instance_id;
        } else {
          message.success('信息已加载');
        }
      }
    };

    fetchIdentities();
    watch(
      () => localVisible.value,
      () => {
        if (localVisible.value) {
          initData();
        }
      },
    );

    const steps = computed<TaTemplateFormStepsStep[]>(() => {
      const _steps: any = props.previousSteps;

      memberIdentity.value.form?.setting?.confs?.forEach((_conf: any) => {
        _steps.push({ title: _conf.name, type: 'form', form: _conf.conf?.form });
      });

      return _steps;
    });

    const stepsRef = ref();

    const onComplete = () => {
      stepsRef.value?.validate().then(() => {
        if (onlySave.value) {
          store
            .create({
              ...formData.value,
              state: 'processing',
              member_identity_id: memberIdentity.value?.id,
              type: props.memberRequestType,
            })
            .then((res: any) => {
              handelSucess(res);
            });
        } else {
          store
            .update({
              ...formData.value,
              id: draftId.value,
              state: 'processing',
              type: props.memberRequestType,
            })
            .then((res: any) => {
              handelSucess(res);
            });
        }
      });
    };

    const onDraft = () => {
      const submitValue = {
        ...formData.value,
        member_identity_id: memberIdentity.value?.id,
        type: props.memberRequestType,
        state: 'draft',
      };

      if (onlySave.value) {
        store.create(submitValue as any).then(() => {
          message.success('暂存成功！');
        });
      } else {
        store
          .update({
            ...submitValue,
            id: draftId.value,
          })
          .then(() => {
            message.success('暂存成功！');
          });
      }
    };

    const onCancel = () => {
      localVisible.value = false;
    };

    const handelSucess = (res: any) => {
      emit('success');
      localVisible.value = false;
      if (res.create_instance_id) {
        selectedInstanceId.value = res.create_instance_id;
        visibleInstanceDetail.value = true;
      }
    };

    const onInstanceClose = () => {
      localVisible.value = false;
    };

    return {
      ...toRefs(props),
      steps,
      onCancel,
      onComplete,
      onDraft,
      onInstanceClose,

      stepsRef,
      formData,
      visibleInstanceDetail,
      selectedInstanceId,
      localVisible,
    };
  },
});
export default ComResUserMemberRequest;
</script>

<template lang="pug">
a-modal(
  v-model:visible='localVisible',
  :title='formTitle',
  width='100%',
  class='full-modal',
  :footer='null',
  @close='onCancel'
)
  TaTemplateFormSteps(
    ref="stepsRef"
    v-model:values='formData',
    :steps='steps',
    :clickable='false',
    @complete='onComplete',
    @cancel='onCancel',
  )
    template(#actions='{ current, actions }')
      slot(name='actions', :actions='slotActions')
        .step-actions.flex-shrink-0
          a-button.button(type='primary', @click='() => onComplete()') 提交
          //- a-button.button(type='primary', @click='() => onDraft()') 暂存
          a-button.button(@click='onCancel') 取消

ComBpmInstanceDetailDialog(
  v-if='visibleInstanceDetail',
  v-model:visible='visibleInstanceDetail',
  :instanceId='selectedInstanceId',
  @close='onInstanceClose',
)

</template>
<style lang="stylus">
.step-actions
  display flex
  justify-content flex-end
  border-top 1px solid #f0f0f0
  padding 12px
  .button
    margin-left 12px
</style>
