import * as React from 'react';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from "@ant-design/icons";

interface ITipsProps {
  message: string;
}

const Tips: React.FunctionComponent<ITipsProps> = ({
  message,
}) => {
  return (
    <Tooltip title={message}>
      <QuestionCircleOutlined style={{ marginLeft: '8px', opacity: 0.5 }} />
    </Tooltip>
  );
};

export default Tips;
