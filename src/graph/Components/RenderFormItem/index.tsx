import * as React from 'react';
import { Form, Switch } from 'antd';

import { FormListObj } from '../../interface';
import InputComponent from '../InputComponent';
import SelectComponent from '../SelectComponent';
import Tips from '../Tips';
import ExtraParamsComponent from '../ExtraParamsComponent';

import './index.less';

interface IRenderFormItemProps {
  formList: FormListObj[];
}

const RenderFormItem: React.FunctionComponent<IRenderFormItemProps> = ({ formList }) => {
  const ItemLabel = (label: string, message?: string) => {
    return (
      <span>
        {label}
        {label && <Tips message={message || label} />}
      </span>
    );
  };

  const getComponentByType = (item: FormListObj) => {
    switch (item.type) {
      case 'select':
        return (
          <SelectComponent
            label={item.label}
            options={item.options || []}
            defaultValue={item.default}
          />
        );
      case 'input':
        return <InputComponent label={item.label} defaultValue={item.default} />;
      case 'formList':
        return <ExtraParamsComponent />;
      case 'switch':
        return <Switch defaultChecked={item.default} />;
    }
  };

  return (
    <>
      {formList.map((item) => {
        return (
          <Form.Item
            className="graph-form-item"
            label={ItemLabel(item.label)}
            name={item.value}
            colon={false}
            initialValue={item.default}
          >
            {getComponentByType(item)}
          </Form.Item>
        );
      })}
    </>
  );
};

export default RenderFormItem;
