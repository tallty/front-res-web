<script lang="ts">
import { AuthSessionApi } from '@/engines/login/apis/auth/session.api';
import { defineComponent, toRefs } from 'vue';

export default defineComponent({
  name: 'TaUserAvatarDropdown',
  props: {
    user: {
      type: Object,
      required: true,
    },
    showName: {
      type: Boolean,
      default: false,
    },
    avatarSize: {
      type: Number,
      default: 32,
    },
    whiteBackground: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['logout'],
  setup(props, { emit }) {
    const logout = async () => {
      emit('logout');
      await new AuthSessionApi().logout();
      // 使用 location 跳转来彻底清空所有 store
      window.location.href = process.env.VUE_APP_LOGIN_HREF || '/login';
    };

    return {
      ...toRefs(props),
      logout,
    };
  },
});
</script>

<template lang="pug">
.ta-user-avatar-dropdown
  a-popover(placement='bottomRight')
    template(#content)
      .templatex
        .line
          span.title 账号:
          span.text {{ user.name }}
        .but-set
          span.but
            router-link(to='/res/user/info') 个人设置
          span.but(@click='logout') 退出登录
    a-dropdown
      .user-info.flex.items-center.cursor-pointer
        a-button.avatar-dropdown-btn(type='link')
          TaAvatar(:user='user', :size='avatarSize', :class='whiteBackground ? "white-bg" : ""')
        span.ml-2.text-sm.font-medium(v-if='showName') {{ user.name }}
</template>

<style lang="stylus" scoped>
.ta-user-avatar-dropdown
  .templatex
    .line
      margin-bottom 12px
      .title
        color #999
        margin-right 8px
      .text
        color #333
    .but-set
      display flex
      gap 12px
      .but
        cursor pointer
        color #666
        &:hover
          color #1890ff
  .user-info
    display flex
    align-items center
    height 100%
    .avatar-dropdown-btn
      padding 0
      height auto
      line-height 1
    .white-bg
      :deep(.ant-avatar)
        background-color white
        border 1px solid white
        color #666
        font-weight 500
</style>
