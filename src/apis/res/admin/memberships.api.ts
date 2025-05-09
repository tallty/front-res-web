import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResMembership } from '@/res-core/model';

export class ResAdminMembershipsApi extends MyApi<ResMembership> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/admin',
      name: 'membership',
      actions: [{ name: 'batch_destroy', method: 'delete', on: 'collection' }],
      mode: 'shallow',
      ...config,
    });
  }
}
