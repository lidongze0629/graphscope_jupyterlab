import React, { useEffect } from 'react';
import { Form, Card, Button } from 'antd';
import { useImmer } from 'use-immer';

import { FormListObj, VerticesObj } from '../interface';
import { Status } from '../../graph';
import { CardHeader } from '../Edge';
import { booleanOptions, dataSourceOptions, delimiterOptions } from '../constant';
import RenderFormItem from '../Components/RenderFormItem';
import PropertiesTable from '../Components/PropertiesTable';

interface IVertexProps {
  initialValues?: VerticesObj;
  setStatus: (status: Status) => void;
  setVertexList: (data: VerticesObj, index?: number) => void;
  index?: number;
  onCreateVertex?: (params: VerticesObj) => boolean;
  onEditVertex?: (params: VerticesObj) => boolean;
}

const Vertex: React.FunctionComponent<IVertexProps> = ({
  initialValues,
  setStatus,
  setVertexList,
  index,
  onEditVertex,
  onCreateVertex
}) => {
  const [form] = Form.useForm();
  const localList: FormListObj[] = [
    { label: 'Label', value: 'label', type: 'input', default: initialValues?.label },
    {
      label: 'Data Source',
      value: 'dataSource',
      type: 'select',
      options: dataSourceOptions,
      default: initialValues?.dataSource
    },
    { label: 'Location', value: 'location', type: 'input', default: initialValues?.location },
    {
      label: 'Header Row',
      value: 'headerRow',
      type: 'select',
      options: booleanOptions,
      default: initialValues?.headerRow
    },
    {
      label: 'Delimiter',
      value: 'delimiter',
      type: 'select',
      options: delimiterOptions,
      default: initialValues?.delimiter
    },
    {
      label: 'Extra Params',
      value: 'extraParamsSwitch',
      type: 'switch',
      default: initialValues?.extraParamsSwitch
    },
    { label: '', value: 'extraParams', type: 'formList', default: initialValues?.extraParams },
    { label: 'ID Filed', value: 'idFiled', type: 'input', default: initialValues?.idFiled },
    {
      label: 'Select all Properties',
      value: 'selectAllProperties',
      type: 'switch',
      default: initialValues?.selectAllProperties
    }
  ];
  const [state, updateState] = useImmer({
    formList: localList,
    propertiesData: initialValues?.propertiesData || [],
    vertexBasicInfo: initialValues
  });
  // 一开始触发一次布局，作为初始化
  useEffect(() => {
    if (!initialValues) return;
    if (form) form.setFieldsValue(initialValues);
    onValuesChange({} as VerticesObj, initialValues);
  }, [initialValues, form]);

  // 节点创建完成
  const onFinish = () => {
    const basicInfo = form.getFieldsValue();
    const params = { ...basicInfo, propertiesData: state.propertiesData || [] };
    if (index !== undefined && onEditVertex && !onEditVertex(params)) return;
    if (index === undefined && onCreateVertex && !onCreateVertex(params)) return;
    setVertexList(params, index);
    setStatus('list');
  };
  const onValuesChange = (changedValue: VerticesObj, allValue: VerticesObj) => {
    const tempList = localList.concat([]);
    if (changedValue.dataSource === 'online' || allValue.dataSource === 'online') {
      tempList.splice(3, 2);
    }
    if (allValue.extraParamsSwitch !== undefined && !allValue.extraParamsSwitch) {
      const index = tempList.findIndex((item) => item.value === 'extraParams');
      tempList.splice(index, 1);
    }
    updateState((draft) => {
      draft.formList = tempList;
      draft.vertexBasicInfo = allValue;
    });
    // 默认不选中，用户自行填写properties，如果选中的话业务逻辑默认所有属性，因此会干掉propertiesData
    if (changedValue.selectAllProperties && state.propertiesData.length !== 0) {
      updateState((draft) => {
        draft.propertiesData = [];
      });
    }
  };

  return (
    <Card
      className="vertex"
      title={CardHeader(setStatus, 'vertex', index)}
      style={{ border: 'none' }}
    >
      <Form
        form={form}
        layout="horizontal"
        onValuesChange={onValuesChange}
        labelCol={{ span: 4 }}
        initialValues={initialValues}
      >
        <RenderFormItem formList={state.formList} />
      </Form>
      {!state.vertexBasicInfo?.selectAllProperties && (
        <PropertiesTable
          style={{ marginLeft: '16.7%' }}
          mode="edit"
          type="vertex"
          data={state.propertiesData || []}
          setPropertiesData={(data) => {
            updateState((draft) => {
              draft.propertiesData = data;
            });
          }}
        />
      )}
      <Button
        type="primary"
        htmlType="submit"
        onClick={onFinish}
        style={{ position: 'absolute', left: '50%', marginLeft: '-60px' }}
      >
        {index !== undefined ? 'Edit' : 'Create'} Vertex
      </Button>
    </Card>
  );
};

export default Vertex;
