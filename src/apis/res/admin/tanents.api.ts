import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResTanent } from '../../../model';

export class ResAdminTanentApi extends MyApi<ResTanent> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/admin',
      name: 'tanent',
      ...config,
    });
  }
}
