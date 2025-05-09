import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResTagsRelation } from '../../../types/model';

export class ResAdminTagsRelationApi extends MyApi<ResTagsRelation> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/admin',
      name: 'tags_relation',
      ...config,
    });
  }
}
