import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { RegionData } from '@/components/global/ta-component/ta-template-form-core/types/model';

export class RegionCommonRegionsApi extends MyApi<RegionData> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/region/common',
      name: 'region',
      ...config,
    });
  }
}
