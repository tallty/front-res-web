export interface RegionData {
  id: string;
  ancestry?: string;
  name: string;
  depth?: number;
  path_info: { id: number; name: string; type: string }[];
}
