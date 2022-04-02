import * as React from 'react';
import { Input } from 'antd';

interface IInputComponentProps {
  label?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
  size?: 'small' | 'middle';
}

const InputComponent: React.FunctionComponent<IInputComponentProps> = ({
  label = '',
  defaultValue = '',
  size = 'middle',
  onChange,
}) => {
  return (
    <Input defaultValue={defaultValue} size={size}
      placeholder={`please entry ${label}`}
      onChange={(e) => onChange?.(e.target.value)}
    />
  )
};

export default InputComponent;
