<script lang="ts">
import { defineComponent, ref, PropType, watch, computed, toRefs } from 'vue';
import { TaTemplateFormRule, TaTemplateFormItem } from '../../ta-template-form-core/types';

/**
 * 地址选择器
 * { lat: '', lon: '', address: '', name: '' },
 */

interface mapInfo {
  lat: number;
  lon: number;
  address: string;
  name: string;
}

interface ILocation {
  lat: number;
  lng: number;
}

const TaMapField = defineComponent({
  name: 'TaMapField',
  props: {
    value: { type: Object as PropType<mapInfo>, default: () => ({}) },
    item: { type: Object as PropType<TaTemplateFormItem>, default: () => ({}) },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { emit }) {
    const formData = ref({
      // name: '',
      address: '',
      lat: 0,
      lon: 0,
    });

    const maps: any = (window as any).qq.maps;
    const visible = ref(false);
    const map = ref<any>({});
    const marker = ref<any>({});
    const geocoder = ref<any>({});
    const keyword = ref('');

    const canSubmit = computed(() => {
      const { address, lat, lon } = formData.value;
      return lat && lon && address;
    });

    watch(
      () => props.value,
      () => {
        formData.value = { ...props.value };
      },
      { deep: true, immediate: true },
    );

    const openSelector = () => {
      if (props.disabled) {
        return;
      }
      visible.value = true;
      formData.value = { ...props.value };
      setTimeout(() => {
        initMap();
      }, 50);
    };

    const initMap = () => {
      let lat = 39.80857;
      let lon = 116.611879;
      if (props.value.lat) {
        lat = props.value.lat;
        lon = props.value.lon;
      }
      const center = new maps.LatLng(lat, lon);

      map.value = new maps.Map(document.getElementById('map'), {
        center,
        zoom: 13,
      });
      updateMarker(center);
      maps.event.addListener(map.value, 'click', (res: any) => {
        searchLocation(res.latLng);
      });
      geocoder.value = new maps.Geocoder({
        complete: (result: any) => {
          const { address, location } = result.detail;
          map.value.setCenter(location);
          updateMarker(location);
          formData.value.address = address;
          formData.value.lat = location.lat;
          formData.value.lon = location.lng;
        },
      });
    };

    const searchAddress = () => {
      geocoder.value.getLocation(keyword.value);
    };

    const searchLocation = (pos: ILocation) => {
      geocoder.value.getAddress(pos);
    };

    const updateMarker = (center: ILocation) => {
      if (marker.value && marker.value.setMap) {
        marker.value.setMap(null);
      }
      marker.value = new maps.Marker({
        position: center,
        map: map.value,
        animation: maps.MarkerAnimation.BOUNCE,
      });
    };

    const confirm = () => {
      if (canSubmit.value) {
        emit('update:value', formData.value);
        visible.value = false;
      }
    };

    const onClear = () => {
      emit('update:value', {
        address: '',
        lat: 0,
        lon: 0,
      });
    };

    const validate = () => {
      return new Promise<void>((resolve, reject) => {
        if (
          (props.item.rules || []).filter((rule: TaTemplateFormRule) => rule.required).length === 0
        )
          return resolve();
        if (props.value.address && props.value.lon && props.value.lat) {
          resolve();
        } else {
          reject('请选择地点');
        }
      });
    };

    return {
      ...toRefs(props),
      canSubmit,
      confirm,
      openSelector,
      searchAddress,
      searchLocation,
      updateMarker,
      formData,
      keyword,
      visible,
      onClear,
      validate,
    };
  },
});

export default TaMapField;
</script>

<template lang="pug">
.ta-map-field
  .clear(v-if='value?.address')
    TaPopoverConfirm(@confirm='onClear', title='清除地址信息')
      TaIcon(type='CloseCircleOutlined', style='font-size: 16px; line-height: 20px; color: #fff')
  .field(@click='openSelector')
    div 地址：{{ value?.address }}
  a-modal(v-model:visible='visible', width='960px')
    template(#title)
      .map-header
        strong 地址选择器
        a-input-search.searcher(
          v-model:value='keyword',
          placeholder='搜索地点',
          enterButton,
          @search='searchAddress',
          @keyup.enter='searchAddress'
        )
    #map
    template(#footer)
      .map-footer
        //- a-input.input(size="large" placeholder="位置名称" v-model:value="formData.name")
        a-input.input(size='large', placeholder='位置详细地址或描述', v-model:value='formData.address')
        a-button(type='primary', size='large', @click='confirm', :disabled='!canSubmit')
          | 确定
</template>

<style lang="stylus" scoped>
.ta-map-field
  position relative
  .clear
    width 36px
    height 36px
    display flex
    justify-content center
    align-items center
    cursor pointer
    background $primary-color
    border-radius 0px 0px 0px 100%
    padding 0px 0px 5px 5px
    position absolute
    top 0px
    right 0px
  .field
    color #808080
    font-weight 400
    font-size 14px
    background rgba(255,255,255,1)
    border-radius 3px
    border 1px solid rgba(229,229,229,1)
    width 100%
    padding 8px 14px
    &:hover
      border-color $primary-color
      cursor pointer
    .icon
      font-size 16px

.map-header
  display flex
  justify-content space-between
  align-items center
  padding-right 40px
  margin -4px 0
  .searcher
    width 300px
.map-footer
  width 100%
  justify-content space-between
  align-items center
  display flex
  .input
    margin-right 20px
#map
  height 70vh
  width 100%
</style>
