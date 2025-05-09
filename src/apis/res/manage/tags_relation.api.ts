import { VApiConfig } from '@/lib/vails/api';
import { MyApi } from '@/apis/MyApi';
import { ResTagsRelation } from '../../../types/model';

export class ResManageTagsRelationApi extends MyApi<ResTagsRelation> {
  constructor(config?: VApiConfig) {
    super({
      namespace: '/res/manage',
      name: 'tags_relation',
      ...config,
    });
  }
}
