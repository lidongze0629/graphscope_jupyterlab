import { TableDataObj } from '../../interface';

const booleanVariableList = ['allowNull', 'index']; // 这两个变量值为boolean

// 字符串转化为boolean, proTable大坑，下拉select无法给boolean作为value
const handleBooleanData = (data: TableDataObj[]) => {
  return data.map((item) => {
    let tempItem: any = { ...item };
    Object.keys(item).map((inner) => {
      if (booleanVariableList.includes(inner)) {
        tempItem[inner] = tempItem[inner] === 'true';
      }
    });
    return tempItem;
  });
};
// boolean转化为字符串'true' 'false', 增加id作为rowKey
const buildProTableData = (data: TableDataObj[]) => {
  return data.map((item, index) => {
    let tempItem: any = { ...item };
    Object.keys(tempItem).map((inner) => {
      if (booleanVariableList.includes(inner)) {
        tempItem[inner] =
          tempItem[inner] === undefined ? tempItem[inner] : tempItem[inner].toString();
      }
    });
    if (!tempItem.id) tempItem.id = index;
    return tempItem;
  });
};

export { handleBooleanData, buildProTableData };
