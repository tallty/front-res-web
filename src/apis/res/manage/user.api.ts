import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResUser } from '../../../types/model';

export class ResManageUserApi extends MyApi<ResUser> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/manage',
      name: 'user',
      ...config,
    });
  }
}
