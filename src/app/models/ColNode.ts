import {dateQuerybuild} from "./Queryparams";

export class ColNode {
  children: ColNode[];
  nodename: string;
  selected: boolean;
  searchvalue: string | number | dateQuerybuild;
}
