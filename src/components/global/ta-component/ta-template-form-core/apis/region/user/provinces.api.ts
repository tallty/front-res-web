import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { RegionData } from '@/components/global/ta-component/ta-template-form-core/types/model';

export class RegionUserProvincesApi extends MyApi<RegionData> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/region/user',
      name: 'province',
      ...config,
    });
  }
}
