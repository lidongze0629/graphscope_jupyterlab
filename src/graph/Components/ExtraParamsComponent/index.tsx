import * as React from 'react';
import { Form, Button, Space, Input } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

interface IExtraParamsComponentProps {
  initialValue?: { key: string; value: string }[];
}

const ExtraParamsComponent: React.FunctionComponent<IExtraParamsComponentProps> = ({
  initialValue
}) => {
  return (
    <Form.List name="extraParams" initialValue={initialValue}>
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }) => (
            <Space key={key} style={{ display: 'flex' }} align="baseline">
              <Form.Item
                style={{ marginBottom: '12px' }}
                {...restField}
                name={[name, 'key']}
                rules={[{ required: true, message: 'Missing key' }]}
              >
                <Input placeholder="please input key" />
              </Form.Item>
              <Form.Item
                style={{ marginBottom: '12px' }}
                {...restField}
                name={[name, 'value']}
                rules={[{ required: true, message: 'Missing alue' }]}
              >
                <Input placeholder="please input value" />
              </Form.Item>
              <MinusCircleOutlined onClick={() => remove(name)} />
            </Space>
          ))}
          <Form.Item>
            <Button type="link" onClick={() => add()} block icon={<PlusOutlined />}>
              Add Params
            </Button>
          </Form.Item>
        </>
      )}
    </Form.List>
  );
};

export default ExtraParamsComponent;
