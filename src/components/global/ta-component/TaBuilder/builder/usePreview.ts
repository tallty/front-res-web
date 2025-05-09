import { ref, provide, inject, Ref, reactive, nextTick } from 'vue';
import { TaBuilderEvent } from '../types';
import { useScreenDataFetchCollectionInject } from './useScreenDataFetchCollection';
import { VObject } from '@/lib/vails/model/index';
import { merge } from 'lodash';
import { useRouter } from 'vue-router';
import { TaFile } from '../../file/servers';

const TaBuilderPreviewMetaKey = 'TaBuilderPreviewMeta';

export interface TaBuilderPreviewMeta {
  pageSettingIdHistory: string[];
  visibleMap: Record<string, boolean>;
  limitSizeMap: Record<string, { attribute?: 'width' | 'height'; value?: number }>;
  offsetTopMap: Record<string, string | undefined>;
  contextMap: Record<string, VObject>;
  previewAttachments: TaFile[];
  visibleFilePreview: boolean;
}

export const provideTaBuilderPreview = () => {
  const previewMeta = reactive<TaBuilderPreviewMeta>({
    pageSettingIdHistory: [],
    visibleMap: {},
    limitSizeMap: {},
    offsetTopMap: {},
    contextMap: {},
    previewAttachments: [],
    visibleFilePreview: false,
  });

  provide(TaBuilderPreviewMetaKey, previewMeta);

  return { previewMeta };
};

export const injectTaBuilderPreview = () => {
  const previewMeta = inject<TaBuilderPreviewMeta | null>(TaBuilderPreviewMetaKey, null);

  return { previewMeta };
};

export const usePreviewClickable = (props: any) => {
  const { setScreenData, getScreenData } = useScreenDataFetchCollectionInject(props);
  const { previewMeta } = injectTaBuilderPreview();
  const router = useRouter();

  const onClick = (
    event: TaBuilderEvent,
    context: VObject = {},
    eventExtra: TaBuilderEvent = {},
  ) => {
    const eventResult = merge({}, event, {
      page_setting_id: eventExtra.page_setting_id,
      url: eventExtra.url,
      attachments: eventExtra.attachments,
      mode: eventExtra.mode,
    });

    let url = context.url || eventResult.url;
    if (
      !url?.startsWith('http') &&
      process.env.VUE_APP_PUBLIC_PATH &&
      eventResult.mode !== 'route'
    ) {
      const publicPath = process.env.VUE_APP_PUBLIC_PATH.split('/')
        .filter((i: string | undefined) => i)
        .join('/');
      url = publicPath ? `/${publicPath}${url}` : `${url}`;
    }

    if (previewMeta && eventResult.mode === 'page_setting' && eventResult.page_setting_id) {
      previewMeta.limitSizeMap[String(eventResult.page_setting_id)] = {
        attribute: eventResult.limit_size_attribute,
        value: eventResult.limit_size_value,
      };

      previewMeta.offsetTopMap[String(eventResult.page_setting_id)] = eventResult.offset_top;
      const lastPageContext = getScreenData(eventResult, '');
      // 阻止冒泡多次赋值
      if (!previewMeta.visibleMap[String(eventResult.page_setting_id)]) {
        console.log('跳转传值:', merge({}, context, lastPageContext));

        previewMeta.contextMap[String(eventResult.page_setting_id)] = merge(
          {},
          context,
          lastPageContext,
        );
      }

      previewMeta.visibleMap[String(eventResult.page_setting_id)] = true;
      previewMeta.pageSettingIdHistory.push(String(eventResult.page_setting_id));

      console.log(previewMeta.pageSettingIdHistory, 'previewMeta.pageSettingIdHistory');
    } else if (eventResult.mode === 'href' && url) {
      eventResult.location_href ? (location.href = url) : window.open(url);
    } else if (eventResult.mode === 'route' && url) {
      router.push(url);
    } else if (eventResult.mode === 'change_value' && eventResult.key) {
      setScreenData(eventResult.key, eventResult.value);
    } else if (eventResult.mode === 'close' && previewMeta) {
      const id = previewMeta.pageSettingIdHistory[previewMeta.pageSettingIdHistory.length - 1];
      previewMeta.visibleMap[String(id)] = false;
      previewMeta.pageSettingIdHistory.pop();
    } else if (eventResult.mode === 'file' && previewMeta) {
      previewMeta.previewAttachments = eventResult.attachments || [];
      previewMeta.visibleFilePreview = true;
    }
  };

  return {
    onClick,
    previewMeta,
  };
};
