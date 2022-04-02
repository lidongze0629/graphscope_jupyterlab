import * as React from 'react';
import { Select } from 'antd';

interface ISelectComponentProps {
  options?: { label: string; value: any }[];
  label?: string;
  onChange?: (value: string) => void;
  defaultValue?: string | boolean;
  size?: 'small' | 'middle';
}

const SelectComponent: React.FunctionComponent<ISelectComponentProps> = ({
  options,
  defaultValue,
  onChange,
  label = '',
  size = 'middle'
}) => {
  return (
    <Select
      options={options || []}
      placeholder={`please select ${label}`}
      defaultValue={defaultValue as string}
      onChange={onChange}
      size={size}
    />
  );
};

export default SelectComponent;
