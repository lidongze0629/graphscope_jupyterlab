import React from 'react';

import { UseSignal } from '@jupyterlab/apputils';

import { CommandRegistry } from '@lumino/commands';

import { ITranslator } from '@jupyterlab/translation';

import { ISignal } from '@lumino/signaling';

import { GraphOpWidget } from './widget';

import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

import { Button, Card, FormInstance } from 'antd';

import { useImmer } from 'use-immer';

import GraphInfo from './graph/GraphInfo';

import Edge from './graph/Edge';

import Vertex from './graph/Vertex';

import PropertiesTable from './graph/Components/PropertiesTable';

import { EdgesObj, GraphBasicInfoObj, VerticesObj } from './graph/interface';
  

export type Status = 'list' | 'edge' | 'vertex';
interface StateInterface {
  edgeList: EdgesObj[];
  vertexList: VerticesObj[];
  status: Status;
  editValue: EdgesObj | VerticesObj;
  graphBaiscInfo: GraphBasicInfoObj;
  currentEditIndex: number | undefined;
}
interface IGraphInterface {
  /** 创建图的回调，返回boolean或不返回，true为创建成功，false为创建失败 */
  onCreateGraph?: (
    params: GraphBasicInfoObj & { edgeList: EdgesObj[] } & { vertexList: VerticesObj[] }
  ) => boolean | void;
  /** 创建节点的回调，返回true创建成功，保存入图里面，返回false创建失败，不跳转会graph页面 */
  onCreateVertex?: (params: VerticesObj) => boolean;
  /** 创建边的回调，返回true创建成功，保存入图里面，返回false创建失败，不跳转会graph页面 */
  onCreateEdge?: (params: EdgesObj) => boolean;
  /** 编辑节点的回调，返回true创建成功，保存入图里面，返回false创建失败，不跳转会graph页面 */
  onEditVertex?: (params: VerticesObj) => boolean;
  /** 编辑边的回调，返回true创建成功，保存入图里面，返回false创建失败，不跳转会graph页面 */
  onEditEdge?: (params: EdgesObj) => boolean;
}

const ReactComponent: React.FunctionComponent<IGraphInterface> = ({
  onCreateGraph,
  onCreateEdge,
  onCreateVertex,
  onEditEdge,
  onEditVertex
}) => {
  const [formRef, setFormRef] = React.useState<FormInstance>();

  const [state, updateState] = useImmer<StateInterface>({
    edgeList: [],
    vertexList: [],
    status: 'list',
    editValue: {
      dataSource: 'local',
      extraParamsSwitch: true,
      selectAllProperties: false
    } as EdgesObj | VerticesObj,
    graphBaiscInfo: {} as GraphBasicInfoObj,
    currentEditIndex: undefined
  });
  // 创建图
  const createGraph = () => {
    const basicInfo = formRef?.getFieldsValue();
    const params = {
      ...basicInfo,
      vertexList: state.vertexList,
      edgeList: state.edgeList
    };
    if (onCreateGraph) {
      onCreateGraph(params);
    }
  };
  const setStatus = (status: Status) => {
    updateState((draft: any) => {
      draft.status = status;
    });
  };
  const renderTitle = (title: string, name: Status) => {
    return (
      <>
        <span style={{ marginRight: '20px' }}>{title}</span>
        <Button
          type="link"
          onClick={() => {
            updateState((draft: any) => {
              draft.graphBaiscInfo = formRef?.getFieldsValue();
              draft.editValue = {
                dataSource: 'local',
                extraParamsSwitch: true,
                selectAllProperties: false
              } as EdgesObj;
              draft.currentEditIndex = undefined;
            });
            setStatus(name);
          }}
        >
          <PlusOutlined />
          create a new {name}
        </Button>
      </>
    );
  };
  const renderInnerTitle = (
    data: VerticesObj & EdgesObj,
    index: number,
    type: 'vertex' | 'edge'
  ) => {
    const array = [
      { label: 'label', value: data.label },
      { label: 'src_label', value: data?.srcLabel },
      { label: 'dst_label', value: data?.dstLabel },
      { label: 'location', value: data.location }
    ].filter((item) => item.value);
    return (
      <>
        {array.map((item) => {
          return (
            <span style={{ marginRight: '8px' }}>
              {item.label} = "{item.value}"
            </span>
          );
        })}
        <Button
          style={{ float: 'right' }}
          type="link"
          size="small"
          onClick={() => {
            updateState((draft: any) => {
              draft.editValue = type === 'vertex' ? state.vertexList[index] : state.edgeList[index];
              draft.currentEditIndex = index;
            });
            setStatus(type);
          }}
        >
          <EditOutlined />
        </Button>
        <Button
          style={{ float: 'right' }}
          type="link"
          size="small"
          onClick={() => {
            if (type === 'vertex') {
              updateState((draft: any) => {
                draft.vertexList.splice(index, 1);
              });
            } else {
              updateState((draft: any) => {
                draft.edgeList.splice(index, 1);
              });
            }
          }}
        >
          <DeleteOutlined />
        </Button>
      </>
    );
  };

  return (
    <div className="graph">
      {state.status === 'list' && (
        <div className="graphList">
          <Card title="Graph">
            <GraphInfo setFormRef={setFormRef} initialValues={state.graphBaiscInfo} />
          </Card>
          <Card title={renderTitle('Vertices', 'vertex')}>
            {state.vertexList.map((item: any, index: any) => {
              return (
                <Card
                  type="inner"
                  title={renderInnerTitle(item as VerticesObj & EdgesObj, index, 'vertex')}
                >
                  {(item.propertiesData?.length && (
                    <PropertiesTable
                      index={index}
                      mode="view"
                      type="vertex"
                      data={item.propertiesData || []}
                    />
                  )) ||
                    null}
                </Card>
              );
            })}
          </Card>
          <Card title={renderTitle('Edge', 'edge')}>
            {state.edgeList.map((item: any, index: any) => {
              return (
                <Card type="inner" title={renderInnerTitle(item, index, 'edge')}>
                  {(item.propertiesData?.length && (
                    <PropertiesTable
                      index={index}
                      mode="view"
                      type="edge"
                      data={item.propertiesData || []}
                    />
                  )) ||
                    null}
                </Card>
              );
            })}
          </Card>
          <Button type="primary" htmlType="submit" onClick={createGraph} className="submitBtn">
            Generate Code
          </Button>
        </div>
      )}
      {state.status === 'edge' && (
        <Edge
          setStatus={setStatus}
          vertexLabelList={state.vertexList
            .map((item: any) => item.label)
            .filter((item: any) => item)
            .map((item: any) => {
              return { label: item, value: item };
            })}
          initialValues={state.editValue as EdgesObj}
          index={state.currentEditIndex}
          setEdgeList={(data: EdgesObj, index?: number) => {
            updateState((draft: any) => {
              if (index !== undefined) {
                draft.edgeList.splice(index, 1, data);
              } else {
                draft.edgeList.push(data);
              }
            });
          }}
          onCreateEdge={onCreateEdge}
          onEditEdge={onEditEdge}
        />
      )}
      {state.status === 'vertex' && (
        <Vertex
          setStatus={setStatus}
          index={state.currentEditIndex}
          initialValues={state.editValue}
          setVertexList={(data: VerticesObj, index?: number) => {
            updateState((draft: any) => {
              if (index !== undefined) {
                draft.vertexList.splice(index, 1, data);
              } else {
                draft.vertexList.push(data);
              }
            });
          }}
          onCreateVertex={onCreateVertex}
          onEditVertex={onEditVertex}
        />
      )}
    </div>
  );
};


/**
 * The namespace for graph schema operation component statics.
 */
export namespace GraphOpComponents {
    export interface IProperties {
        /**
         * Command Registry.
         */
        commands: CommandRegistry;

        /**
         * Graph operation widget.
         */
        widget: GraphOpWidget;

        /**
         * Signal to render dom tree.
         */
        signal: ISignal<GraphOpWidget, void>;

        /**
         * Jupyterlab translator.
         */
        translator?: ITranslator;
    }

    export interface IState { }
}


/**
 * Base react component of graph operation widget.
 */
export class GraphOpComponent extends React.Component<
    GraphOpComponents.IProperties, GraphOpComponents.IState> {
    constructor(props: GraphOpComponents.IProperties) {
        super(props);
    }

    _onCreateGraph(params: any): void {
        console.log("cg: ", params); 
    }

    render() {
        return (
            <UseSignal signal={this.props.signal}>
                {() => {
                    return (
                        <ReactComponent
                            onCreateGraph={this._onCreateGraph.bind(this)}
                        />
                    )
                }}
            </UseSignal>
        )
    }
}


/*
namespace GSGraphBuilderComponents {
    export interface IProperties {
      component: GSGraphOpComponent;
      translator?: ITranslator;
    }
  
    export interface IState { }
  

    export interface IVertexState {
  
      properties: IVertexProperties[];
    }

  }
  
  
  class GSGraphOpGraphBuilderComponent extends React.Component<
    GSGraphBuilderComponents.IProperties, GSGraphBuilderComponents.IState> {
    constructor(props: GSGraphBuilderComponents.IProperties) {
      super(props);
    }
  
    createVertex(): void {
      const vertex: GSVariable.Vertex = {
        label: 'comment',
        location: '/Users/lidongze/alibaba/gstest/ldbc_sample/comment_0_0.csv',
        header_row: true,
        delimiter: '|',
        properties: [
          ["creationDate", "null"], ["locationIP", "null"], ["browserUsed", 'null'], ["content", 'null'], ["length", 'null']
        ],
        vid_field: 'id'
      };
  
      this.props.component.createVertex(vertex);
    }
  
    createEdge(): void {
      const edge: GSVariable.Edge = {
        label: 'replyOf',
        location: '/Users/lidongze/alibaba/gstest/ldbc_sample/comment_replyOf_comment_0_0.csv',
        header_row: true,
        delimiter: '|',
        properties: [],
        src_field: 'Comment.id',
        src_label: 'comment',
        dst_field: 'Comment.id.1',
        dst_label: 'comment',
      }
  
      this.props.component.createEdge(edge);
    }
  
  
    render(): React.ReactNode {
      return (
        <>
          <div className='jp-gsGraphOp-content'>
            <ToolbarButtonComponent
              label={'Create Vertex'}
              onClick={this.createVertex.bind(this)}
            />
          </div>
          <div className='jp-gsGraphOp-content'>
            <ToolbarButtonComponent
              label={'Create Edge'}
              onClick={this.createEdge.bind(this)}
            />
          </div>
        </>
      )
    }
  }
  
  
  export namespace GSGraphOpDisplayComponents {
    export interface IProperties {
 
       * The GSGraphOpComponents

      component: GSGraphOpComponent;

       * The graphscope graph operation widget.

      widget: GSGraphOpWidget;

       *  Jupyterlab translator.

      translator?: ITranslator;
    }
    export interface IState { }
  }
  
  
  class GSGraphOpDisplayComponent extends React.Component<
    GSGraphOpDisplayComponents.IProperties, GSGraphOpDisplayComponents.IState> {
    constructor(props: GSGraphOpDisplayComponents.IProperties) {
      super(props);
    }
  
    insertCode(): void {
      const trans = this.props.translator.load('jupyterlab');
  
      const widget = this.props.widget;
      const code = widget.graphManager.generateCode(widget.meta["sess"]);
  
      const cell = widget.notebook.activeCell;
      if (cell === null) {
        showDialog({
          title: trans.__('WRANNING'),
          body: trans.__('No focused cell found.'),
          buttons: [Dialog.okButton()]
        }).catch(e => console.log(e));
      }
  
      if (cell instanceof MarkdownCell) {
        cell.editor.replaceSelection('```' + '\n' + code + '\n```');
      } else if (cell instanceof CodeCell) {
        cell.editor.replaceSelection(code);
      }
    }
  
    _render_vertex_table() {
      const trans = this.props.translator.load('jupyterlab');
  
      const elements: React.ReactElement<any>[] = [];
      const contents: any[] = [];
  
      for (let vlabel of this.props.widget.graphManager.vertices.keys()) {
        contents.push(
          <tr>
            <td>{vlabel}</td>
            <td>
              <ToolbarButtonComponent
                icon={editIcon}
                onClick={() => { console.log(''); }}
                tooltip={trans.__('edit')}
              />
              <ToolbarButtonComponent
                icon={closeIcon}
                onClick={() => { console.log(''); }}
                tooltip={trans.__('delete')}
              />
            </td>
          </tr>
        )
      }
  
      elements.push(
        <table className='jp-gsGraphOp-section-table'>
          <tr>
            <th>Label</th>
            <th>Operations</th>
          </tr>
          {contents}
        </table>
      )
  
      return elements;
    }
  
    _render_edge_table() {
      const trans = this.props.translator.load('jupyterlab');
  
      const elements: React.ReactElement<any>[] = [];
      const contents: any[] = [];
  
      for (let [elabel, edges] of this.props.widget.graphManager.edges) {
        for (let e of edges) {
          contents.push(
            <tr>
              <td>{elabel}</td>
              <td>{e.src_label}</td>
              <td>{e.dst_label}</td>
              <td>
                <ToolbarButtonComponent
                  icon={editIcon}
                  onClick={() => { console.log(''); }}
                  tooltip={trans.__('edit')}
                />
                <ToolbarButtonComponent
                  icon={closeIcon}
                  onClick={() => { console.log(''); }}
                  tooltip={trans.__('delete')}
                />
              </td>
            </tr>
          )
        }
      }
  
      elements.push(
        <table className='jp-gsGraphOp-section-table'>
          <tr>
            <th>Label</th>
            <th>Src Label</th>
            <th>Dst Label</th>
            <th>Operations</th>
          </tr>
          {contents}
        </table>
      )
  
      return elements;
    }
  
    render(): React.ReactNode {
      const trans = this.props.translator.load('jupyterlab')
  
      return (
        <>
          <div className='jp-gsGraphOp-content'>

            <div className='jp-gsGraphOp-section-header'>
              <span className='jp-gsGraphOp-section-headerText'>
                Vertex List
              </span>
  
              <ToolbarButtonComponent
                icon={addIcon}
                onClick={() => {
                  this.props.component.setState({ currentWidget: GSGraphOpComponents.OptionalWidgets.addVertexWidget })
                }}
                tooltip={trans.__('create vertex')}
              />
            </div>
            <div className='jp-gsGraphOp-section-content'>
              {this._render_vertex_table()}
            </div>

  

            <div className='jp-gsGraphOp-section-header'>
              <span className='jp-gsGraphOp-section-headerText'>
                Edge List
              </span>
  
              <ToolbarButtonComponent
                icon={addIcon}
                onClick={() => { console.log('click event: create a new session.'); }}
                tooltip={trans.__('create edge')}
              />
            </div>
            <div className='jp-gsGraphOp-section-content'>
              {this._render_edge_table()}
            </div>

  

            <div className='jp-gsGraphOp-section-header'>
              <span className='jp-gsGraphOp-section-headerText'>
                Code View
              </span>
            </div>
            <div className='jp-gsGraphOp-section-content'>
              <ToolbarButtonComponent
                label={'Insert'}
                onClick={this.insertCode.bind(this)}
                tooltip={trans.__('insert code into notebook cell')}
              />
            </div>
          </div>
        </>
      )
    }
  
  
  }


 * The namespace for graphscope graph schema operation component statics.

 export namespace GSGraphOpComponents {

    export enum OptionalWidgets {
      displayWidget,
      addVertexWidget,
      addEdgeWidget,
    }
  

          * React properties for graphscope sidebar component.
  
    export interface IProperties {

       * Command Registry.
  
      commands: CommandRegistry
  

       * The graphscope graph operation widget.
    
      widget: GSGraphOpWidget;
  

       * Signal to render dom tree.

      signal: ISignal<GSGraphOpWidget, void>;
  
 
       *  Jupyterlab translator.

      translator?: ITranslator;
    };
  
    export interface IState {
      currentWidget: OptionalWidgets;
    };
  }


 * Base react component of graph operation widget.

 export class GSGraphOpComponent extends React.Component<
 GSGraphOpComponents.IProperties, GSGraphOpComponents.IState> {
 constructor(props: GSGraphOpComponents.IProperties) {
   super(props);

   this.state = {
     currentWidget: GSGraphOpComponents.OptionalWidgets.displayWidget
   }
 }

 createVertex(vertex: GSVariable.Vertex): void {
   try {
     this.props.widget.graphManager.addVertex(vertex);
   } catch (ex) {
     console.log('catch exception in createVertex: ', ex);
   }
   this.setState({ currentWidget: GSGraphOpComponents.OptionalWidgets.displayWidget });
 }

 createEdge(edge: GSVariable.Edge): void {
   try {
     this.props.widget.graphManager.addEdge(edge);
   } catch (ex) {
     console.log('catch exception in createEdge: ', ex);
   }
   this.setState({ currentWidget: GSGraphOpComponents.OptionalWidgets.displayWidget });
 }

 render() {
   return (
     <UseSignal signal={this.props.signal}>
       {() => {
         if (this.state.currentWidget === GSGraphOpComponents.OptionalWidgets.displayWidget) {
           return <GSGraphOpDisplayComponent
             translator={this.props.translator}
             component={this}
             widget={this.props.widget}
           />
         } else if (
           this.state.currentWidget === GSGraphOpComponents.OptionalWidgets.addVertexWidget ||
           this.state.currentWidget === GSGraphOpComponents.OptionalWidgets.addEdgeWidget
         ) {
           return <GSGraphOpGraphBuilderComponent
             translator={this.props.translator}
             component={this}
           />
         }
       }}
     </UseSignal>
   )
 }
}
*/