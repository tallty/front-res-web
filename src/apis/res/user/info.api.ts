import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResUser } from '@/res-core/model';

export class ResUserInfoApi extends MyApi<ResUser> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/user',
      name: 'info',
      paramsKey: 'user',
      mode: 'single',
      ...config,
    });
  }
}
