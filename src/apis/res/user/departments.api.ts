import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResDepartment } from '@/res-core/types/model';

export class ResUserDepartmentsApi extends MyApi<ResDepartment> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/user',
      name: 'department',
      ...config,
    });
  }
}
