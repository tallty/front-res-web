<script lang="ts">
import { ref, defineComponent, toRefs, computed, reactive, watch, PropType, onMounted } from 'vue';
import { TaTemplateFormStepsStep } from '@/components/global/ta-component/ta-template-form-core/types';
import { VStore } from '@/lib/vails';
import { useRouter } from 'vue-router';
import { ResUserMemberIdentitiesApi } from '@/res-core/apis/res/user/member_identities.api';
import { ResUserMemberRequestsApi } from '@/res-core/apis/res/user/member_requests.api';
import ComBpmInstanceDetailDialog from '@/engines/bpm/components/ComBpmInstanceDetailDialog.vue';
import { message } from 'ant-design-vue';

const ComResUserMemberRequest = defineComponent({
  name: 'ComResUserMemberRequest',
  components: {
    ComBpmInstanceDetailDialog,
  },
  props: {
    previousSteps: { type: Array as PropType<TaTemplateFormStepsStep[]>, default: () => [] },
    memberType: { type: String, default: 'ExpertMember' },
    memberRequestType: { type: String, default: 'ExpertMemberRequest' },
    memberIdentityFlag: { type: String, required: true },
    visible: { type: Boolean, default: false },
    bpmPath: { type: String, default: '/account/instance' },
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
          onlySave.value = data.tanent?.code !== process.env.VUE_APP_TENENT_CODE;
        } else if (['processing'].includes(data.state)) {
          visibleInstanceDetail.value = !!data.create_instance_id;
          selectedInstanceId.value = data.create_instance_id;
        } else {
          message.success('信息已加载');
          if (props.memberType === 'ExpertMember') {
            // 2024.03.28最近一次认证时间在这之前的弹窗
            const createdAt = new Date(data.created_at);
            const comparisonDate = new Date('2024-03-27T00:00:00');

            if (createdAt < comparisonDate) localVisible.value = true;
          }
        }
      } else {
        // 没有认证过弹窗
        if (props.memberType === 'ExpertMember') localVisible.value = true;
      }
    };

    fetchIdentities();
    initData();

    const steps = computed<TaTemplateFormStepsStep[]>(() => {
      const _steps: any = props.previousSteps;

      memberIdentity.value.form?.setting?.confs?.forEach((_conf: any) => {
        _steps.push({ title: _conf.name, type: 'form', form: _conf.conf?.form });
      });

      return _steps;
    });

    const stepsRef = ref();
    const loading = ref(true);

    const router = useRouter();
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
            .then(() => {
              handelSucess();
            });
        } else {
          store
            .update({
              ...formData.value,
              id: draftId.value,
              state: 'processing',
              type: props.memberRequestType,
            })
            .then(() => {
              handelSucess();
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
          initData();
          message.success('暂存成功！');
        });
      } else {
        store
          .update({
            ...submitValue,
            id: draftId.value,
          })
          .then(() => {
            initData();
            message.success('暂存成功！');
          });
      }
    };

    const onCancel = () => {
      router.back();
    };

    const onInstanceClose = () => {
      visibleInstanceDetail.value = false;
      router.push(props.bpmPath);
    };

    const handelSucess = () => {
      emit('success');
      initData();
    };

    onMounted(() => {
      loading.value = false;
    });

    const handleOk = () => {
      localVisible.value = false;
    };

    const handleCancel = () => {
      router.push('/home');
    };

    const App_type = process.env.VUE_APP_APP_TYPE;

    return {
      ...toRefs(props),
      steps,
      onCancel,
      onComplete,
      onDraft,
      loading,
      stepsRef,
      formData,
      visibleInstanceDetail,
      selectedInstanceId,
      onInstanceClose,
      localVisible,
      handleOk,
      handleCancel,
      App_type,
    };
  },
});
export default ComResUserMemberRequest;
</script>

<template lang="pug">
a-spin(:spinning='loading')
  .com-res-user-member-request.w-full.h-full
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
            a-button.button(type='primary', @click='() => onDraft()') 暂存
            a-button.button(@click='onCancel') 取消
    ComBpmInstanceDetailDialog(
      v-if='visibleInstanceDetail',
      :visible='visibleInstanceDetail',
      :instanceId='selectedInstanceId',
      @close='onInstanceClose',
    )

  TaNoPaddingModal.flex.flex-col.text-gray-900(
    v-model:visible='localVisible',
    :width=1000,
    :height=700,
    :title='"关于征集产业智库专家的通知"',
    :maskClosable='false',
    @cancel='handleCancel',
  )
    slot
      div(style="padding: 24px !important")
        <p>各有关单位：</p>
        <p>&nbsp;&nbsp;&nbsp;&nbsp;为加强产业专家智库建设，充分发挥行业专家在产业领域的咨询决策作用，更好地服务于重点产业高质量发展，我司拟建立产业智库，并面向社会公开征集各领域专家。现将有关事项通知如下：</p>
        <p>一、征集重点</p>
        <p>（一）征集范围</p>
        <p>高校院所、行业协会和企事业单位等。</p>
        <p>（二）重点领域</p>
        <p>新一代信息技术产业、生物医药产业、新材料产业、高端装备制造产业、节能环保产业、新能源产业，以及战略性新兴产业涉及的其他急需紧缺或关键技术领域；</p>
        <p>从事技术转移、战略管理、财务管理、资本运作等领域。</p>
        <p>二、专家条件</p>
        <p>（一）具备良好的职业道德和敬业精神，能够科学严谨、客观公正、廉洁自律、遵纪守法地履行职责，积极、独立地开展相关工作。</p>
        <p>（二）研究开发类专家原则上应具有副高级（含）以上职称，或作为项目（课题）负责人承担过国家或省部级科技计划项目（课题），或是国家或省部级科技奖励获得者。研究成果突出的优秀青年学者、港澳台专家、外籍专家，高校科研院所、科技型上市公司、国家高新技术企业、技术先进型服务企业、外资研发中心的技术骨干，可适当放宽条件。</p>
        <p>（三）产业管理类专家应当是科技型上市公司、国家高新技术企业、技术先进型服务企业、国家大学科技园、国家科技企业孵化器、全国性或全市性行业协会学会、天使投资或创业投资机构、科技服务机构的高级管理人员。具有丰富企业管理、创业实践或科技服务经验，或对成果转化、产业发展有突出贡献的人员，可适当放宽条件。</p>
        <p>（四）财务审计类专家应当是熟悉科技经费管理的高级会计师、高级审计师、高级经济师、注册会计师及企事业单位或其它社会组织中从事科研经费管理工作的中高级管理人员。</p>
        <p>（五）其他专家包括熟悉科技管理的法学专家、律师事务所合伙人、知识产权事务所合伙人，具有丰富科技行政管理或决策咨询经验的人员，银行、证券公司、保险公司等金融机构的高级管理人员，具有丰富科普工作经验或对科普创作有突出贡献的人员等。</p>
        <p>三、入库方式</p>
        <p>专家入库采取线上方式进行，登录InnoMatch全球技术供需对接平台（网址：www.innomatch.net）进行网上注册及申请，在线填报专家信息，经管理中心审核后入库。</p>
        <p>四、征集时间</p>
        <p>专家征集采用常年受理申请和分批审核的方式进行。</p>
        <p>五、联系方式</p>
        template(v-if='App_type !== "INNOMATCH"')
          div
            <p>相关咨询：国家技术转移东部中心 021-35363288</p>
            <p>地址：上海市杨浦区国权北路1688弄湾谷科技园A8栋10楼 国家技术转移东部中心 </p>
        template(v-if='App_type === "INNOMATCH"')
          div
            p 咨询请添加InnoMatch小助手，或拨打电话021-33286615
            img.w-30.h-30(src='https://innomatch.oss-cn-shanghai.aliyuncs.com/xiaozhushou.pic.jpg')
    template(#footer)
      .flex-center.h-12
        a-button.footer-button(@click='handleCancel') 返回首页
        a-button.footer-button(type='primary', @click='handleOk') 开始填写

</template>
<style lang="stylus">
.ant-spin-container, .ant-spin-nested-loading
  height 100%
.footer-button
  margin-left 1.25rem !important
  height 2.5rem
  @apply rounded-lg px-6 py-2 text-base

.step-actions
  display flex
  justify-content flex-end
  border-top 1px solid #f0f0f0
  padding 12px
  // margin 0 -24px -12px -24px
  .button
    margin-left 12px
</style>
