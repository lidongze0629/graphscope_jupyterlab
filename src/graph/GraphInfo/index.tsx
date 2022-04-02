import React, { useEffect } from 'react';
import { Form, FormInstance } from 'antd';

import { booleanOptions, typeOptions } from '../constant';
import RenderFormItem from '../Components/RenderFormItem';
import { FormListObj, GraphBasicInfoObj } from '../interface';

interface IGraphInfoProps {
  initialValues?: GraphBasicInfoObj;
  setFormRef: (form: FormInstance) => void;
}

const GraphInfo: React.FunctionComponent<IGraphInfoProps> = ({ initialValues, setFormRef }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    setFormRef(form);
  }, [form]);

  const formList: FormListObj[] = [
    { label: 'Name', value: 'name', type: 'input', default: initialValues?.name },
    {
      label: 'OID Type',
      value: 'oidType',
      type: 'select',
      options: typeOptions,
      default: initialValues?.oidType
    },
    {
      label: 'Directed',
      value: 'directed',
      type: 'select',
      options: booleanOptions,
      default: initialValues?.directed
    },
    {
      label: 'Generate EID',
      value: 'eid',
      type: 'select',
      options: booleanOptions,
      default: initialValues?.eid
    }
  ];

  return (
    <Form form={form} layout="horizontal" labelCol={{ span: 4 }} initialValues={initialValues}>
      <RenderFormItem formList={formList} />
    </Form>
  );
};

export default GraphInfo;
