export interface PageRule {
  name: string;
  urlsegment: string;
  functions: Array<Functions>;
  minlevel: number;
}

export interface Functions {
  name: string;
  description: string;
  minlevel: number;
}

