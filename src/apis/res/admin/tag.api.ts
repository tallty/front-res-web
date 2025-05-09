import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResTag } from '../../../types/model';

export class ResAdminTagApi extends MyApi<ResTag> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/admin',
      name: 'tag',
      ...config,
    });
  }
}
