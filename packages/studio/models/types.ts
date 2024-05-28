export interface Action {
    _id?:string;
    name: string;
    label: string;
    source: Source;
    functions?: (FunctionsEntity)[] | null;
    description?: string | null;
  }
  export interface Source {
    id: string;
    longname: string;
    name: string;
    kind: string;
    scope: string;
    memberof?: string | null;
    meta: Meta;
    order: number;
    description?: string | null;
    type?: GeneralNamingItem | null;
  }
  export interface Meta {
    lineno: number;
    filename: string;
    path: string;
  }
  export interface GeneralNamingItem {
    names?: (string)[] | null;
  }
  export interface FunctionsEntity {
    id: string;
    longname: string;
    name: string;
    kind: string;
    scope: string;
    description: string;
    memberof: string;
    params?: (ParamsEntity | null)[] | null;
    examples?: (string)[] | null;
    meta: Meta;
    order: number;
    returns?: (ReturnsEntity)[] | null;
    type?: GeneralNamingItem | null;
    readonly?: boolean | null;
  }
  export interface ParamsEntity {
    type?: GeneralNamingItem[];
    description?: string;
    name: string;
  }
  export interface ReturnsEntity {
    type: GeneralNamingItem;
    description: string;
  }
  export interface Param {
    name: string;
    type?: GeneralNamingItem[]
  }