import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResTag } from '../../../types/model';

export class ResManageTagApi extends MyApi<ResTag> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/manage',
      name: 'tag',
      ...config,
    });
  }
}
