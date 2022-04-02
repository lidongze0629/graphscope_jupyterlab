import React, { useEffect } from 'react';
import { Button, Card, Form } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { useImmer } from 'use-immer';

import { EdgesObj, FormListObj, TableDataObj } from '../interface';
import RenderFormItem from '../Components/RenderFormItem';
import { Status } from '../../graph';
import { booleanOptions, dataSourceOptions, delimiterOptions } from '../constant';
import PropertiesTable from '../Components/PropertiesTable';
import './index.less';

interface IEdgeProps {
  initialValues?: EdgesObj;
  setStatus: (status: Status) => void;
  setEdgeList: (data: EdgesObj, index?: number) => void;
  index?: number;
  onCreateEdge?: (params: EdgesObj) => boolean;
  onEditEdge?: (params: EdgesObj) => boolean;
  vertexLabelList?: { label: string; value: string }[];
}

export const CardHeader = (
  setStatus: (status: Status) => void,
  status: 'edge' | 'vertex',
  index?: number
) => {
  return (
    <>
      <Button onClick={() => setStatus('list')} type="link">
        <LeftOutlined />
        back
      </Button>
      {index !== undefined ? 'Edit' : 'create'} a new {status}
    </>
  );
};

const Edge: React.FunctionComponent<IEdgeProps> = ({
  initialValues,
  setStatus,
  setEdgeList,
  index,
  onCreateEdge,
  onEditEdge,
  vertexLabelList
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
    {
      label: 'Src Label',
      value: 'srcLabel',
      type: 'select',
      default: initialValues?.srcLabel,
      options: vertexLabelList || []
    },
    { label: 'Src Field', value: 'srcField', type: 'input', default: initialValues?.srcField },
    {
      label: 'Dst Label',
      value: 'dstLabel',
      type: 'select',
      default: initialValues?.dstLabel,
      options: vertexLabelList || []
    },
    { label: 'Dst Field', value: 'dstField', type: 'input', default: initialValues?.dstField },
    {
      label: 'Select all Properties',
      value: 'selectAllProperties',
      type: 'switch',
      default: initialValues?.selectAllProperties
    }
  ];
  const [state, updateState] = useImmer<{
    formList: FormListObj[];
    propertiesData: TableDataObj[];
    edgeBasicInfo: EdgesObj;
  }>({
    formList: localList,
    propertiesData: initialValues?.propertiesData || [],
    edgeBasicInfo: initialValues || ({} as EdgesObj)
  });
  // 一开始触发一次布局，作为初始化
  useEffect(() => {
    if (!initialValues) return;
    if (form) form.setFieldsValue(initialValues);
    onValuesChange({} as EdgesObj, initialValues);
  }, [initialValues, form]);

  // 节点创建完成
  const onFinish = () => {
    const params = { ...state.edgeBasicInfo, propertiesData: state.propertiesData || [] };
    if (index !== undefined && onEditEdge && !onEditEdge(params)) return;
    if (index === undefined && onCreateEdge && !onCreateEdge(params)) return;
    setEdgeList(params, index);
    setStatus('list');
  };
  const onValuesChange = (changedValue: EdgesObj, allValue: EdgesObj) => {
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
      draft.edgeBasicInfo = allValue;
    });
    if (changedValue.selectAllProperties && state.propertiesData.length !== 0) {
      updateState((draft) => {
        draft.propertiesData = [];
      });
    }
  };
  return (
    <Card className="adge" title={CardHeader(setStatus, 'edge', index)} style={{ border: 'none' }}>
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 4 }}
        onValuesChange={onValuesChange}
        initialValues={initialValues}
      >
        <RenderFormItem formList={state.formList} />
      </Form>
      {!state.edgeBasicInfo.selectAllProperties && (
        <PropertiesTable
          style={{ marginLeft: '16.7%' }}
          mode="edit"
          type="edge"
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
        {index !== undefined ? 'Edit' : 'Create'} Edge
      </Button>
    </Card>
  );
};

export default Edge;
