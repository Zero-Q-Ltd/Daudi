export interface PageRules {
  name: string;
  url: string;
  functions: Array<Functions>;
  minlevel: number;
}

export interface Functions {
  name: string;
  description: string;
  minlevel: number;
}
