import {Metadata} from '../universal/Metadata';
import {AdminLevel} from './AdminLevel';

export interface AdminType {
  name: string;
  description: string;
  levels: Array<AdminLevel>;
  metadata: Metadata;
}

export interface NewAdminType {
  level: number;
  name: string;
  description: string;
  levels: Array<AdminLevel>;
}
