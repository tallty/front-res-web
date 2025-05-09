import { MyApi } from '@/apis/MyApi';
import { VApiConfig } from '@/lib/vails/api';
import { RegionData } from '../../../../../ta-template-form-core/types/model';

export class RegionUserAreasApi extends MyApi<RegionData> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/region/user',
      name: 'area',
      ...config,
    });
  }
}
