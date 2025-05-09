import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResDepartment } from '../../../types/model';

export class ResManageDepartmentApi extends MyApi<ResDepartment> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/manage',
      name: 'department',
      ...config,
    });
  }
}
