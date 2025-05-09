import { VObject } from '@/lib/vails';

export type {
  ResOrg,
  ResDepartment,
  ResMember,
  ResDuty,
  ResDutyGroup,
  ResUser,
  ResMemberIdentity,
  ResMembership,
} from '../model';
export interface ResBook {
  id: number;
}

export interface ResTag {
  id: number;
  org_id: number;
  name: string;
}
export interface ResTagsRelation {
  id: number;
  org_id: number;
  user_id: number;
  tag_id: number;
}
export interface ResOrgRequest {
  id: number;
  member_identity_id: number;
  org_member_identity_id: number;
  state: string;
  create_instance_id: number;
  create_instance_state: string;
  model_payload: VObject;
  org_payload: VObject;
  settle_in_form: VObject;
  org_member_id?: number;
  org_id?: number;
}
