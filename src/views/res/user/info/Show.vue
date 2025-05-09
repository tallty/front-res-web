<script lang="ts">
import { AuthSessionApi } from '@/engines/login/apis/auth/session.api';
import { GET_INFO } from '@/engines/login/store/user/actions';
import { SoaAuthAuthPasswordApi } from '@/res-core/apis/soa_auth/auth/password.api';
import store from '@/store';
import { message } from 'ant-design-vue';
import { computed, defineComponent, reactive, ref, toRefs } from 'vue';
import { useRoute } from 'vue-router';
import { ResUserInfoApi } from '@/res-core/apis/res/user/info.api';

const ResUserInfoShow = defineComponent({
  name: 'ResUserInfoShow',
  components: {},
  props: {
    showMobile: { type: Boolean, default: true },
    MobileEdit: { type: Boolean, default: true },
    background: { type: String, default: () => '#F7F7F7' },
  },
  setup(props) {
    const route = useRoute();
    const info = computed(() => store.state.user.currentUser);

    const editing = ref(false);
    const editInfo = reactive<{ [key: string]: string | any }>({
      mobile: '',
      email: '',
      name: '',
      avatar: {
        files: [],
      },
    });

    // 当前密码
    const currentPassword = ref('');
    // 新密码
    const newPassword = ref('');
    // 验证密码
    const verifyPassword = ref('');

    const isSubmit = computed(() => {
      if (
        newPassword.value === verifyPassword.value &&
        newPassword.value !== '' &&
        currentPassword.value !== ''
      ) {
        return true;
      } else {
        return false;
      }
    });

    const submit = () => {
      if (!isSubmit.value) return message.error('请检查密码');
      const reg =
        /((^(?=.*[a-z])(?=.*[A-Z])(?=.*\W)[\da-zA-Z\W]{8,16}$)|(^(?=.*\d)(?=.*[A-Z])(?=.*\W)[\da-zA-Z\W]{8,16}$)|(^(?=.*\d)(?=.*[a-z])(?=.*\W)[\da-zA-Z\W]{8,16}$)|(^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[\da-zA-Z\W]{8,}$))/;
      // const phoneReg = /^1[3456789]\d{9}$/;
      // if (!phoneReg.test(editInfo.mobile) && props.MobileEdit) {
      //   return message.error('请输入正确的手机号');
      // }

      if (!reg.test(newPassword.value)) {
        message.error('密码长度不小于8位,密码必须由大小写字母、数字、特殊字符三种以上组合');
      } else {
        new SoaAuthAuthPasswordApi({ encrypt: true, wrapParams: false })
          .update({
            old_password: currentPassword.value,
            new_password: newPassword.value,
          })
          .then(() => {
            message.success('修改密码成功');
            if (route.query?.login_again === 'true') {
              message.success('请重新登录');
              logout();
            }
          });
      }
    };

    const onEdit = () => {
      editInfo.mobile = info.value.mobile;
      editInfo.email = info.value.email;
      editInfo.name = info.value.name;
      editInfo.avatar.files = info.value.avatar?.files;
      editing.value = true;
    };

    const checkEmail = (v: string) => {
      const reg = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
      return reg.test(v);
    };

    const validaEmail = (v: string) => {
      if (checkEmail(v)) {
        return true;
      } else {
        message.error('请填写正确的邮箱号');
        return false;
      }
    };

    const checkPhone = (v: string) => {
      const reg = /^1[3456789]\d{9}$/;
      const reg2 = /^0\d{2,3}-?\d{7,8}$/;
      return reg.test(v) || reg2.test(v);
    };
    const validaPhone = (v: string) => {
      if (v && v.length === 11) {
        if (checkPhone(v)) {
          return true;
        }
        message.error('请填写正确的手机号');
        return false;
      } else {
        message.error('请填写正确的手机号');
        return false;
      }
    };

    const onUpdate = () => {
      let res = true;
      if (editInfo.email) {
        res = validaEmail(editInfo.email);
      }
      if (!res) return;
      if (props.MobileEdit && editing) {
        res = validaPhone(editInfo.mobile);
      }
      if (!res) return;
      new ResUserInfoApi()
        .update(editInfo)
        .then(() => {
          message.success('修改成功');
          store.dispatch(`user/${GET_INFO}`);
          editing.value = false;
        })
        .catch(() => {
          message.error('修改失败');
        });
    };
    const logout = async () => {
      await new AuthSessionApi().logout();
      // 使用 location 跳转来彻底清空所有 store
      window.location.href = process.env?.VUE_APP_LOGIN_HREF || '/login';
    };
    const stateClick = () => {
      console.log('stateClick', store.state.user);
    };

    const passChange = (e: Event) => {
      const value = (e.target as HTMLInputElement).value
        .trim()
        .replace(/[\u4e00-\u9fa5]|(^\s+)|(\s+$)/gi, '')
        .replace(/[ ]/g, '');
      newPassword.value = value;
    };
    const passVerChange = (e: Event) => {
      const value = (e.target as HTMLInputElement).value
        .trim()
        .replace(/[\u4e00-\u9fa5]|(^\s+)|(\s+$)/gi, '')
        .replace(/[ ]/g, '');
      verifyPassword.value = value;
    };

    const phoneChange = (e: Event) => {
      const value = (e.target as HTMLInputElement).value.trim().replace(/[^\d]/g, '');
      editInfo.mobile = value;
    };

    const emailChange = (e: Event) => {
      const value = (e.target as HTMLInputElement).value
        .trim()
        .replace(/[\u4e00-\u9fa5]|(^\s+)|(\s+$)/gi, '')
        .replace(/[ ]/g, '');
      editInfo.email = value;
    };

    return {
      ...toRefs(props),
      submit,
      stateClick,
      logout,
      info,
      currentPassword,
      newPassword,
      verifyPassword,
      isSubmit,
      editing,
      editInfo,
      onEdit,
      onUpdate,

      passVerChange,
      passChange,
      phoneChange,
      emailChange,
    };
  },
});
export default ResUserInfoShow;
</script>

<template lang="pug">
.user-info
  .left-box(@click='stateClick')
    .user-avatar.item-card.flex
      TaAvatar(:user='info', :size='60')
      .info
        .account {{ info.account }}
        .mobile {{ info.mobile || '暂无号码' }}
    .write-off-box.item-card
      .write-header 个人资料
      .write-off.cursor-pointer(@click='logout') 注销登录
  .right-box.h-full.overflow-y-auto
    .information-box.item-card
      .flex.items-center.justify-between
        .item-card-header 个人资料
        .flex.items-center.justify-center(v-if='editing')
          .ml-4
            a-button(type='primary', @click='onUpdate') 确定
          .ml-4
            a-button(@click='() => (editing = false)') 取消
        .flex.items-center.justify-center.cursor-pointer(v-else, @click='onEdit')
          TaIcon(type='EditOutlined', :size='20', class='!text-gray-400')
      .form-item.flex
        .label.flex.items-center 头像
        TaAvatar(:user='info', :size='100' v-if='!editing')
        .w-40.h-40(v-else)
          TaImageSingleUploader(v-model:value='editInfo.avatar.files')
        //- .update-btn 更换头像
      .form-item.flex
        .label.flex.items-center 姓名
        template(v-if='editing')
          a-input.input-box.input-read(v-model:value='editInfo.name', style='color: #000' :maxLength='20')
        template(v-else)
          .input-box.input-read {{ info.name || '暂无' }}
      .form-item.flex
        .label.flex.items-center 邮箱
        template(v-if='editing')
          a-input.input-box.input-read(
            :value='editInfo.email',
            style='color: #000'
            @change='emailChange'
            :maxLength='320'
          )
        template(v-else)
          .input-box.input-read {{ info.email || '暂无' }}
      .form-item.flex(v-if='showMobile')
        .label.flex.items-center 手机号
        template(v-if='MobileEdit && editing')
          a-input.input-box.input-read(
            :value='editInfo.mobile',
            style='color: #000'
            @change='phoneChange'
            :maxLength='11'
          )
        template(v-else)
          .input-box.input-read {{ info.mobile || '暂无号码' }}
    .password-box.item-card
      .item-card-header 密码
      .form-item.flex.items-center
        .label.flex.items-center 当前密码
        a-input-password.input-box.input-write(
          type='password',
          v-model:value='currentPassword',
          placeholder='请输入当前密码'
        )

      .form-item.flex
        .label.flex.items-center 新密码
        a-input-password.input-box.input-write(
          type='password',
          v-model:value='newPassword',
          placeholder='请输入新密码'
          @input='passChange',
          :maxLength='20'
        )
      .form-item.flex
        .label.flex.items-center 验证密码
        a-input-password.input-box.input-write(
          type='password',
          v-model:value='verifyPassword',
          placeholder='请输入验证密码'
          @input='passVerChange',
          :maxLength='20'
        )
      .submit-btn(@click='submit', :class='isSubmit ? "change-submit-btn" : ""') 保存
</template>

<style lang="stylus" scoped>
input:focus
  outline none
.user-info
  display flex
  align-items flex-start
  justify-content center
  background v-bind(background)
  padding-top 20px
  .user-avatar
    padding 19px 31px
  .item-card
    margin-bottom 20px
    width 100%
    background #fff
    border-radius 4px
    min-height 40px
    .info
      margin-left 16px
      .account
        color #262626
        font-size 18px
        margin-bottom 8px
        line-height 20px
        font-weight 600
      .mobile
        font-size 14px
        color #8c8c8c
        line-height 20px
  .write-off-box
    .write-header
      font-size 18px
      padding 13px 20px
      color #262626
      font-weight 600
      border-bottom 1px solid #E5E5E5
    .write-off
      font-size 18px
      padding 13px 20px
      color #8c8c8c
      font-weight 600
  .left-box
    margin-right 20px
    width 300px
  .right-box
    width 640px
    .information-box
      padding 14px 20px
      .item-card-header
        font-size 18px
        color #262626
        font-weight 600
      .form-item
        margin-bottom 20px
        .input-read
          width 300px
          font-size 14px
          color #bfbfbf
          font-width 600
          padding 12px 8px
          background #FFFFFF
          border-radius 8px
          border 1px solid #D9D9D9
        .label
          width 106px
          color #8c8c8c
          font-size 14px
          font-weight 600
        .update-btn
          border 1px solid #3da8f5
          border-radius 8px
          padding 8px 15px
          color #3DA8F5
          font-size 14px
          margin-left 69px
          font-weight 600px
    .password-box
      padding 14px 20px
      .item-card-header
        font-size 18px
        font-weight 600
        color #262626
      .form-item
        margin 20px 0
        .label
          width 106px
          font-size 14px
          font-weight 600
          color #8C8C8C
        .input-box
          width 300px
          padding 12px 8px
          font-size 14px
          font-width 600
          color #595959
          background #FFFFFF
          border-radius 8px
          border 1px solid #D9D9D9
// 保存按钮
.submit-btn
  width 120px
  margin 0 auto
  height 40px
  border-radius 4px
  background #e5e5e5
  color #fff
  font-size 14px
  line-height 40px
  text-align center
.change-submit-btn
  background #3DA8F5
  cursor pointer
</style>
