import React, { useState, useEffect } from 'react';
import { Checkbox } from 'antd';
import { DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { EditableProTable } from '@ant-design/pro-table';

import { TableDataObj } from '../../interface';
// import './index.less';
import { handleBooleanData, buildProTableData } from './helper';

interface IPropertiesTableProps {
  mode?: 'edit' | 'view';
  type?: 'edge' | 'vertex';
  data?: TableDataObj[];
  setStatus?: (status: 'vertex' | 'edge') => void;
  index?: number;
  setPropertiesData?: (data: TableDataObj[]) => void;
  style?: React.CSSProperties;
}

const PropertiesTable: React.FunctionComponent<IPropertiesTableProps> = ({
  mode = 'view',
  type = 'vertex',
  data,
  setPropertiesData,
  style
}) => {
  const [dataSource, setDataSource] = useState<TableDataObj[]>(buildProTableData(data || []));
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    const data: TableDataObj[] = handleBooleanData(dataSource);
    setPropertiesData?.(data);
    setEditableRowKeys(data.map((item) => item.id));
  }, [dataSource]);

  const formItemProps = {
    rules: [{ required: true, message: '此项为必填项' }]
  };
  //@ts-ignore
  const CheckboxComponent: React.FC = ({ value, onChange }) => {
    return (
      <Checkbox
        disabled={mode === 'view'}
        defaultChecked={value}
        onChange={(e) => {
          onChange(e.target.checked);
        }}
      />
    );
  };

  const columns = React.useMemo(() => {
    const vertexColums = [
      {
        title: 'name',
        dataIndex: 'name',
        editable: mode === 'edit',
        ellipsis: true,
        formItemProps: formItemProps,
        width: 150
      },
      {
        title: 'type',
        dataIndex: 'type',
        width: 110,
        editable: mode === 'edit',
        valueType: 'select',
        valueEnum: {
          string: { text: 'String' },
          number: { text: 'Number' }
        }
        // formItemProps: formItemProps
      },
      {
        title: 'mapped to',
        dataIndex: 'mappedTo',
        ellipsis: true,
        editable: mode === 'edit',
        // formItemProps: formItemProps,
        width: 150
      },
      {
        title: 'default value',
        dataIndex: 'defaultValue',
        ellipsis: true,
        editable: mode === 'edit',
        // formItemProps: formItemProps,
        width: 150
      },
      {
        title: 'allow null',
        dataIndex: 'allowNull',
        width: 110,
        valueType: 'select',
        editable: mode === 'edit',
        valueEnum: {
          true: { text: 'True' },
          false: { text: 'False' }
        }
        // formItemProps: formItemProps
      },
      {
        title: 'primary key',
        dataIndex: 'primaryKey',
        width: 110,
        renderFormItem: () => <CheckboxComponent />
      },
      {
        title: 'index',
        dataIndex: 'index',
        width: 110,
        valueType: 'select',
        editable: mode === 'edit',
        valueEnum: {
          true: { text: 'True' },
          false: { text: 'False' }
        }
        // formItemProps: formItemProps
      },
      {
        title: 'comment',
        dataIndex: 'comment',
        ellipsis: true,
        editable: mode === 'edit',
        // formItemProps: formItemProps,
        width: 150
      },
      {
        title: 'operations',
        width: 100,
        valueType: 'option'
      }
    ];
    if (mode === 'view') {
      vertexColums.pop(); // graph页面不展示操作栏
    }
    if (type === 'edge') {
      vertexColums.splice(5, 1);
      return vertexColums;
    }
    return vertexColums;
  }, []);
  return (
    <EditableProTable
      style={style}
      className="properties-table"
      scroll={{ x: 960 }}
      rowKey="id"
      //@ts-ignore
      recordCreatorProps={
        mode === 'edit'
          ? {
              creatorButtonText: 'Add Property',
              newRecordType: 'dataSource',
              record: () => ({
                id: Date.now()
              })
            }
          : false
      }
      //@ts-ignore
      columns={columns}
      value={dataSource}
      onChange={setDataSource}
      editable={{
        type: 'multiple',
        editableKeys,
        actionRender: (row, config, defaultDoms) => {
          return [defaultDoms.delete];
        },
        deleteText: <DeleteOutlined />,
        deletePopconfirmMessage: 'Confirm delete?',
        onValuesChange: (record, recordList) => {
          setDataSource(recordList);
        },
        onChange: (key) => {
          key.filter((x) => x);
          setEditableRowKeys(key);
        }
      }}
      onSave={<CheckOutlined />}
      onDelete={<DeleteOutlined />}
    />
  );
};

export default PropertiesTable;
