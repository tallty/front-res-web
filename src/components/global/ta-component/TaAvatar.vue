<script lang="ts">
import FileServer from '@/components/global/ta-component/file/servers';
import { computed, defineComponent, toRefs } from 'vue';

const TaAvatar = defineComponent({
  name: 'TaAvatar',
  props: {
    // 通过 user 对象和 nameProp 来显示
    user: { type: Object, default: () => null },
    nameProp: { type: String, default: () => 'name' },
    // 直接显示用户名字和头像
    nameOfUser: { type: String, default: () => null },
    userAvatarUrl: { type: String, default: () => null },
    size: { type: Number, default: () => 32 },
  },
  setup(props) {
    const fileServer = new FileServer();

    // const imageUrl = computed(() =>
    //   props.user?.avatar?.files?.[0]
    //     ? typeof props.user.avatar === 'string'
    //       ? props.user.avatar
    //       : fileServer.getThumbnailUrl(props.user.avatar.files[0], 100)
    //     : undefined,
    // );
    const imageUrl = computed(() => {
      if (props.user?.avatar) {
        return props.user?.avatar?.files?.[0]
          ? typeof props.user.avatar === 'string'
            ? props.user.avatar
            : fileServer.getThumbnailUrl(props.user.avatar.files[0], 100)
          : undefined;
      } else {
        return props.userAvatarUrl;
      }
    });

    const calcShowString = (name?: string) => {
      if (name) {
        return name.split('').slice(-2).join('');
      }
      return undefined;
    };

    const mobile = computed(() =>
      (props.user?.mobile || props.user?.account || '').split().splice(-1, 2).join(''),
    );

    return {
      ...toRefs(props),
      calcShowString,
      imageUrl,
      mobile,
    };
  },
});
export default TaAvatar;
</script>

<template lang="pug">
.ta-avatar
  a-avatar(:size='size', :src='imageUrl', :class='imageUrl ? "" : "avatar"')
    template(v-if='user')
      | {{ calcShowString(user[nameProp]) || mobile }}
    template(v-else-if='nameOfUser')
      | {{ calcShowString(nameOfUser) }}
</template>

<style lang="stylus" scoped>
.ta-avatar
  display inline-block
  .avatar
    background-color $primary-color
    color #fff
</style>
