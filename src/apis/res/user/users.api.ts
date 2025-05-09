import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResUser } from '@/res-core/model';

export class ResUserUsersApi extends MyApi<ResUser> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/user',
      name: 'user',
      actions: [{ name: 'search', method: 'post', on: 'collection' }],
      ...config,
    });
  }
}
