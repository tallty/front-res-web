<script lang="ts">
import { defineComponent, toRefs, computed } from 'vue';
import { state } from '../../../engines/tofu/components/useAutoMenu';

const TaEmpty = defineComponent({
  name: 'TaEmpty',
  props: {
    desc: { type: String, default: '' },
    tips: { type: String, default: '' },
    type: { type: String, default: '' },
    emptyKey: { type: String, default: '暂无数据' },
  },
  setup(props) {
    const key = computed(() => {
      return props.emptyKey || '暂无数据';
    });
    const state = {
      '404': {
        name: '404',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/404.png',
      },
      暂无积分: {
        name: '暂无积分',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E6%9A%82%E6%97%A0%E7%A7%AF%E5%88%86.png',
      },
      '500服务器错误': {
        name: '500服务器错误',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/500%E6%9C%8D%E5%8A%A1%E5%99%A8%E9%94%99%E8%AF%AF.png',
      },
      暂无视频: {
        name: '暂无视频',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E6%9A%82%E6%97%A0%E8%A7%86%E9%A2%91.png',
      },
      加载失败: {
        name: '加载失败',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E5%8A%A0%E8%BD%BD%E5%A4%B1%E8%B4%A5.png',
      },
      暂无认证: {
        name: '暂无认证',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E6%9A%82%E6%97%A0%E8%AE%A4%E8%AF%81.png',
      },
      打卡失败: {
        name: '打卡失败',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E6%89%93%E5%8D%A1%E5%A4%B1%E8%B4%A5.png',
      },
      暂无课程: {
        name: '暂无课程',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E6%9A%82%E6%97%A0%E8%AF%BE%E7%A8%8B.png',
      },
      暂无关注: {
        name: '暂无关注',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E6%9A%82%E6%97%A0%E5%85%B3%E6%B3%A8.png',
      },
      暂无跟帖: {
        name: '暂无跟帖',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E6%9A%82%E6%97%A0%E8%B7%9F%E5%B8%96.png',
      },
      暂无地址: {
        name: '暂无地址',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E6%9A%82%E6%97%A0%E5%9C%B0%E5%9D%80.png',
      },
      暂无通知: {
        name: '暂无通知',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E6%9A%82%E6%97%A0%E9%80%9A%E7%9F%A5.png',
      },
      暂无排名: {
        name: '暂无排名',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E6%9A%82%E6%97%A0%E6%8E%92%E5%90%8D.png',
      },
      查无记录: {
        name: '查无记录',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E6%9F%A5%E6%97%A0%E8%AE%B0%E5%BD%95.png',
      },
      暂无收益: {
        name: '暂无收益',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E6%9A%82%E6%97%A0%E6%94%B6%E7%9B%8A.png',
      },
      网络断开: {
        name: '网络断开',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E7%BD%91%E7%BB%9C%E6%96%AD%E5%BC%80.png',
      },
      暂无收藏: {
        name: '暂无收藏',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E6%9A%82%E6%97%A0%E6%94%B6%E8%97%8F.png',
      },
      未添加收藏: {
        name: '未添加收藏',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E6%9C%AA%E6%B7%BB%E5%8A%A0%E6%94%B6%E8%97%8F.png',
      },
      暂无数据: {
        name: '暂无数据',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E6%9A%82%E6%97%A0%E6%95%B0%E6%8D%AE.png',
      },
      系统更新中: {
        name: '系统更新中',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E7%B3%BB%E7%BB%9F%E6%9B%B4%E6%96%B0%E4%B8%AD.png',
      },
      暂无文件: {
        name: '暂无文件',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E6%9A%82%E6%97%A0%E6%96%87%E4%BB%B6.png',
      },
      系统维和中: {
        name: '系统维和中',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E7%B3%BB%E7%BB%9F%E7%BB%B4%E5%92%8C%E4%B8%AD.png',
      },
      暂无新闻: {
        name: '暂无新闻',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E6%9A%82%E6%97%A0%E6%96%B0%E9%97%BB.png',
      },
      暂无交易记录: {
        name: '暂无交易记录',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E6%9A%82%E6%97%A0%E4%BA%A4%E6%98%93%E8%AE%B0%E5%BD%95.png',
      },
      暂无更新: {
        name: '暂无更新',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E6%9A%82%E6%97%A0%E6%9B%B4%E6%96%B0.png',
      },
      暂无搜索结果: {
        name: '暂无搜索结果',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E6%9A%82%E6%97%A0%E6%90%9C%E7%B4%A2%E7%BB%93%E6%9E%9C.png',
      },
      暂无权限: {
        name: '暂无权限',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E6%9A%82%E6%97%A0%E6%9D%83%E9%99%90.png',
      },
      暂无收藏文件: {
        name: '暂无收藏文件',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E6%9A%82%E6%97%A0%E6%94%B6%E8%97%8F%E6%96%87%E4%BB%B6.png',
      },
      暂无标签: {
        name: '暂无标签',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E6%9A%82%E6%97%A0%E6%A0%87%E7%AD%BE.png',
      },
      页面出现错误: {
        name: '页面出现错误',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E9%A1%B5%E9%9D%A2%E5%87%BA%E7%8E%B0%E9%94%99%E8%AF%AF.png',
      },
      暂无活动: {
        name: '暂无活动',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E6%9A%82%E6%97%A0%E6%B4%BB%E5%8A%A8.png',
      },
      加载失败休息一下: {
        name: '加载失败休息一下',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E5%8A%A0%E8%BD%BD%E5%A4%B1%E8%B4%A5%E4%BC%91%E6%81%AF%E4%B8%80%E4%B8%8B.png',
      },
      暂无礼品: {
        name: '暂无礼品',
        url:
          'https://stiei-obs2.obs.cn-east-2.myhuaweicloud.com/icon/%E7%BC%BA%E7%9C%81%E9%A1%B5%E6%8F%92%E5%9B%BE/%E6%9A%82%E6%97%A0%E7%A4%BC%E5%93%81.png',
      },
    };

    return {
      ...toRefs(props),
      state,
      key,
    };
  },
});

export default TaEmpty;
</script>

<template lang="pug">
.empty-placeholder.flex-center
  .shell
    img(:src='state[key].url', width='80', height='80')
    .desc {{ desc || state[key].name }}
    .tips {{ tips }}
    .action
      slot
</template>

<style lang="stylus" scoped>
.empty-placeholder
  padding 40px 0px
  width 100%
  text-align center
  line-height 1
  .shell
    display flex
    justify-content center
    align-items center
    flex-direction column
  img
    margin-bottom 10px
  .desc
    margin-bottom 12px
    color #808080
    font-weight 500
    font-size 16px
  .tips
    margin-bottom 22px
    color #A6A6A6
    font-size 14px
  .action
    button
      min-width 100px
      height 40px
</style>
