export interface TableDataObj {
  id: number;
  name: string;
  type: string;
  mappedTo: string;
  defaultValue?: string;
  allowNull: boolean;
  primaryKey?: boolean;
  index: boolean;
  comment?: string;
}
export interface VerticesObj {
  label: string;
  dataSource: 'local' | 'online';
  location?: string;
  headerRow?: boolean;
  delimiter?: boolean;
  extraParamsSwitch?: boolean;
  extraParams?: { key: string; value: string }[];
  idFiled?: string;
  selectAllProperties?: boolean;
  propertiesData?: TableDataObj[];
}
export interface EdgesObj {
  label: string;
  dataSource: 'local' | 'online';
  location?: string;
  headerRow?: boolean;
  delimiter?: boolean;
  extraParamsSwitch?: boolean;
  extraParams?: { key: string; value: string }[];
  srcLabel: string;
  srcField: string;
  dstLabel: string;
  dstField: string;
  selectAllProperties?: boolean;
  propertiesData?: TableDataObj[];
}
export interface FormListObj {
  label: string;
  value: string;
  type: 'input' | 'select' | 'formList' | 'switch';
  options?: { label: string; value: string | boolean }[];
  default?: any;
}
export interface GraphBasicInfoObj {
  name: string;
  oidType: string;
  directed: boolean;
  eid: boolean;
}
