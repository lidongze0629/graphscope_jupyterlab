import {
  ReactWidget,
  UseSignal,
  ToolbarButtonComponent
} from '@jupyterlab/apputils';

import { CommandRegistry } from '@lumino/commands';

import { showDialog, Dialog } from '@jupyterlab/apputils';

import { ITranslator, nullTranslator } from '@jupyterlab/translation';

import { ISignal, Signal } from '@lumino/signaling';

import { CommandIDs } from './common';

// import { INotebookTracker } from '@jupyterlab/notebook';

// import { CodeCell, MarkdownCell } from '@jupyterlab/cells';

import {
  caretDownIcon,
  caretRightIcon,
  searchIcon,
  addIcon,
  editIcon,
  closeIcon,
  Collapse,
} from '@jupyterlab/ui-components';

import React from 'react';

import { gsIcon } from './common';

import { IVariableInspector, VariableInspector } from './variableinspector';

import 'bootstrap/dist/css/bootstrap.css';

/**
 * Icons with custom styling bound.
 */
const caretDownIconStyled = caretDownIcon.bindprops({
  height: 'auto',
  width: '20px'
});
const caretRightIconStyled = caretRightIcon.bindprops({
  height: 'auto',
  width: '20px'
});


/**
 * Namespace of graphscope variable
 */
export namespace GSVariable {
  /**
   * Graph variable interface of graphscope.
   */
  export interface GSAppOrGraphVariable {
    /**
     * Variable name of the application/graph.
     */
    name: string;
    /**
     * Type: graph or application
     */
    type: string;
    /**
     * State, loaded or unloaded.
     */
    state: string;
    /**
     * output of `__str__` in python class.
     */
    content: string;
  }

  /**
   * Session variable interface of graphscope.
   */
  export interface GSSessionVariable {
    /**
     * Variable name of the session.
     */
    name: string;
    /**
     * State, active、disconnected or closed.
     */
    state: string;
    /**
     * output of `__str__` in python class.
     */
    content: string;
    /**
     * Resource exists in this session.
     */
    items: GSAppOrGraphVariable[];
  }
}


/**
 * The namespace for collapsible section statics.
 */
export namespace CollapsibleSection {
  /**
   * React properties for collapsible section component.
   */
  export interface IProperties {
    /**
     * The header string for section list.
     */
    header: string;

    /**
     * Whether the view will be expanded or collapsed initially, defaults to open.
     */
    isOpen?: boolean;

    /**
     * Handle collapse event.
     */
    onCollapse?: (isOpen: boolean) => void;

    /**
     * Any additional elements to add to the header.
     */
    headerElements?: React.ReactNode;

    /**
     * Tooltip for collapsible section
     */
    tooltip?: string;

    /**
     * If true, the section will be collapsed and will not respond
     * to open or close actions.
     */
    disabled?: boolean;

    /**
     * If true, the section will be opened if not disabled.
     */
    forceOpen?: boolean;
  }

  /**
   * React state for collapsible section component.
   */
  export interface IState {
    /**
     * Whether the section is expanded or collapsed.
     */
    isOpen: boolean;
  }
}


export class CollapsibleSection extends React.Component<
  CollapsibleSection.IProperties,
  CollapsibleSection.IState
> {
  constructor(props: CollapsibleSection.IProperties) {
    super(props);
    this.state = {
      isOpen: props.isOpen ? true : false
    };
  }

  /**
   * Render the collapsible section using the virtual DOM.
   */
  render(): React.ReactNode {
    let icon = this.state.isOpen ? caretDownIconStyled : caretRightIconStyled;
    let isOpen = this.state.isOpen;
    let className = 'jp-gsSidebar-section-headerText';

    if (this.props.disabled) {
      icon = caretRightIconStyled;
      isOpen = false;
      className = 'jp-gsSidebar-section-headerTextDisabled';
    }

    return (
      <>
        <div className="jp-gsSidebar-section-header">
          <ToolbarButtonComponent
            icon={icon}
            onClick={this.handleCollapse.bind(this)}
          />
          <span
            className={className}
            onContextMenu={this.onContextMenu.bind(this)}
            onClick={this.handleClick.bind(this)}
            title={this.props.tooltip}
          >
            {this.props.header}
          </span>
          {!this.props.disabled && this.props.headerElements}
        </div>
        <Collapse isOpen={isOpen}>{this.props.children}</Collapse>
      </>
    );
  }

  handleCollapse(): void {
    this.setState(
      {
        isOpen: !this.state.isOpen
      },
      () => {
        if (this.props.onCollapse) {
          this.props.onCollapse(this.state.isOpen);
        }
      }
    );
  }

  handleClick(): void {
    // no-op
  }

  onContextMenu(): void {
    // no-op
  }

  UNSAFE_componentWillReceiveProps(
    nextProps: CollapsibleSection.IProperties
  ): void {
    if (nextProps.forceOpen) {
      this.setState({ isOpen: true });
    }
  }
}


/**
 * Main area react component
 *
 * @return The react component
 */
/*
function GSMainAreaComponent(props: {
  widget: GSWidget;
  signal: ISignal<GSWidget, void>;
}) {
  return (
    <>
      <div>
        <UseSignal signal={props.signal}>
          {() => {
            return <ListView payload={props.widget.payload} />;
          }}
        </UseSignal>
        <input type="text" id="example"></input>
        <button
          onClick={(): void => {
            let a = (document.getElementById('example') as HTMLInputElement)
              .value;
            props.widget.tempMethodForInsertCodeIntoNotebookCell(a);
          }}
        >
          Insert code into cell
        </button>
      </div>
    </>
  );
}
*/

/**
 * The namespace for gs graph builder.
 */
namespace GSGraphBuilderComponents {
  export interface IProperties { }

  export interface IVertexProperties { }

  export interface IVertexState {
    label: string;

    location: string;

    oid_type: string;

    properties: IVertexProperties[];
  }
}


class GSVertexBuilderComponent extends React.Component<
  GSGraphBuilderComponents.IProperties, GSGraphBuilderComponents.IVertexState> {
  constructor(props: GSGraphBuilderComponents.IProperties) {
    super(props);

    this.state = {
      label: "",
      oid_type: "",
      location: "",
      properties: []
    }
  }

  handleChange(event: any): void {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    console.log(name, value, target);

    if (name === 'label') {
      this.setState({ label: value });
    } else if (name === 'oid_type') {
      console.log("set oid_type: ", value);
      this.setState({ oid_type: value });
    } else if (name === 'location') {
      this.setState({ location: value });
    } else if (name === 'property') {
      // todo
    }
  }

  addVertex(): void {
    console.log(this.state);
  }

  render(): React.ReactNode {
    return (
      <div className='jp-gsGraphOp-section-build-vertex'>
        <label>
          Label:
          <input
            name='label'
            type='text'
            value={this.state.label}
            onChange={this.handleChange.bind(this)}
          />
        </label>
        <br />
        <label>
          OID Type:
          <select name='oid_type' value={this.state.oid_type} onChange={this.handleChange.bind(this)}>
            <option value="string">String</option>
            <option value="int">Int64</option>
          </select>
        </label>
        <br />
        <label>
          Location:
          <input
            name='location'
            type='text'
            value={this.state.location}
            onChange={this.handleChange.bind(this)}
          />
        </label>
        <br />
        <ToolbarButtonComponent
            icon={addIcon}
            onClick={this.addVertex.bind(this)}
        />
      </div>
    )
  }
}


/**
 * The namespace for graphscope graph schema operation component statics.
 */
export namespace GSGraphOpComponents {
  /**
   * React properties for graphscope sidebar component.
   */
  export interface IProperties {
    /**
     * Command Registry.
     */
    commands: CommandRegistry

    /**
     * The graphscope graph operation widget.
     */
    widget: GSGraphOpWidget;

    /**
     * Signal to render dom tree.
     */
    signal: ISignal<GSGraphOpWidget, void>;

    /**
     *  Jupyterlab translator.
     */
    translator?: ITranslator;
  };

  export interface IState {};
}


/**
 * React component of graph operation widget.
 */
class GSGraphOpComponent extends React.Component<
  GSGraphOpComponents.IProperties, GSGraphOpComponents.IState> {
  constructor(props: GSGraphOpComponents.IProperties) {
    super(props);
  }

  render() {
    const trans = this.props.translator.load('jupyterlab');

    return (
      <UseSignal signal={this.props.signal}>
        {() => {
          return (
            <>
              <div className='jp-gsGraphOp-content'>

                {/* vertex list */}
                <div className='jp-gsGraphOp-section-header'>
                  <span className='jp-gsGraphOp-section-headerText'>
                    Vertex List
                  </span>

                  <ToolbarButtonComponent
                    icon={addIcon}
                    onClick={() => { console.log('click event: create a new session.'); }}
                    tooltip={trans.__('create vertex')}
                  />
                </div>
                <div className='jp-gsGraphOp-section-content'>
                  <GSVertexBuilderComponent
                  />

                  <table className='jp-gsGraphOp-section-table'>
                    <tr>
                      <th>Label</th>
                      <th>Operations</th>
                    </tr>
                    <tr>
                      <td>person</td>
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
                    <tr>
                      <td>software</td>
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
                  </table>
                </div>
                {/* vertex list end */}

                {/* edge list */}
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
                  <table className='jp-gsGraphOp-section-table'>
                    <tr>
                      <th>Label</th>
                      <th>Src Label</th>
                      <th>Dst Label</th>
                      <th>Operations</th>
                    </tr>
                    <tr>
                      <td>knows</td>
                      <td>person</td>
                      <td>person</td>
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
                    <tr>
                      <td>create</td>
                      <td>person</td>
                      <td>software</td>
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
                  </table>
                </div>
                {/* edge list end */}

                {/* code view */}
                <div className='jp-gsGraphOp-section-header'>
                  <span className='jp-gsGraphOp-section-headerText'>
                    Code View
                  </span>
                </div>
                <div className='jp-gsGraphOp-section-content'>
                  <div className='jp-gsGraphOp-codeview'>
                    <pre id='codeview'>
                      def function():
                      pass
                    </pre>
                  </div>
                  <ToolbarButtonComponent
                    label={'Insert'}
                    onClick={() => { console.log('click event: insert code'); }}
                    tooltip={trans.__('insert code into notebook cell')}
                  />
                </div>
              </div>
            </>
          )
        }}
      </UseSignal>
    )
  }
}


/**
 * The widget for operate graph.
 */
export class GSGraphOpWidget extends ReactWidget {
  /**
   * Constructs a new GSGraphOpWidget.
   */
  constructor(meta: { [name: string]: any }, commands: CommandRegistry, translator?: ITranslator) {
    super();
    this.commands = commands;
    this.translator = translator || nullTranslator;
    this._meta = meta;

    const trans = this.translator.load('jupyterlab');
    this.id = trans.__('gs-graphop-widget');
    this.title.label = trans.__('Graph Schema ' + '(' + this._meta['sess'] + ')');
    this.title.icon = gsIcon;
    this.title.closable = true;
  }

  get meta(): { [name: string]: any } {
    return this._meta;
  }

  get runnningChanged(): ISignal<GSGraphOpWidget, void> {
    return this._runningChanged;
  }

  render() {
    return (
      <GSGraphOpComponent
        commands={this.commands}
        translator={this.translator}
        widget={this}
        signal={this._runningChanged}
      />
    )
  }

  public translator: ITranslator;
  protected commands: CommandRegistry;

  // current meta info: {
  //  'session': <session_variable_name>
  // }
  private _meta: { [name: string]: any } = {};
  private _runningChanged = new Signal<this, void>(this);
}


/**
 * Abstract class for variable inspector.
 *
 * Any widget inherits this class could interactive with the kernel.
 */
export abstract class IVariableInspectorWidget
  extends ReactWidget
  implements IVariableInspector {
  set handler(handler: VariableInspector.IInspectable | null) {
    if (this._handler == handler) {
      return;
    }
    // remove old subscriptions
    if (this._handler) {
      this._handler.inspected.disconnect(this.onInspectorUpdate, this);
      this._handler.disposed.disconnect(this.onHandlerDisposed, this);
    }
    this._handler = handler;
    // subscriptions
    if (this._handler) {
      this._handler.inspected.connect(this.onInspectorUpdate, this);
      this._handler.disposed.connect(this.onHandlerDisposed, this);
      this._handler.performInspection();
    }
  }

  get handler(): VariableInspector.IInspectable | null {
    return this._handler;
  }

  protected abstract onInspectorUpdate(
    sender: any,
    args: VariableInspector.IVariableInspectorUpdate
  ): void;

  protected abstract onHandlerDisposed(sender: any, args: void): void;

  private _handler: VariableInspector.IInspectable | null = null;
}


/**
 * The namespace for graphscope sidebar component statics.
 */
export namespace GSSidebarComponents {
  /**
   * React properties for graphscope sidebar component.
   */
  export interface IProperties {
    /**
     * Command Registry.
     */
    commands: CommandRegistry

    /**
     * The graphscope sidebar widget.
     */
    widget: GSSidebarWidget;

    /**
     * Signal to render dom tree.
     */
    signal: ISignal<GSSidebarWidget, void>;

    /**
     *  Jupyterlab translator.
     */
    translator?: ITranslator;
  };

  export interface IState { };
}


function SectionItem(props: { translator: ITranslator, item: GSVariable.GSAppOrGraphVariable }) {
  const trans = props.translator.load('jupyterlab');

  let className = 'jp-gsSidebar-sectionItemLabel';

  const state = props.item.state;
  if (state !== 'True') {
    className = 'jp-gsSidebar-sectionItemDisabled';
  }

  return (
    <li className='jp-gsSidebar-sectionItem'>
      <span
        className={className}
        title={"graphscope " + props.item.type}
        onClick={() => { console.log('click event: click on ', props.item.name) }}
      >
        {props.item.name}
      </span>
      <ToolbarButtonComponent
        className="jp-gsSidebar-sectionItemShutdown"
        icon={searchIcon}
        onClick={() => {
          showDialog({
            title: trans.__(props.item.name),
            body: trans.__(props.item.content),
            buttons: [Dialog.okButton()]
          }).catch(e => console.log(e));
        }}
        tooltip="detail"
      />
    </li>
  )
}


function SectionListView(props: { translator: ITranslator, items: GSVariable.GSAppOrGraphVariable[] }) {
  return (
    <div className='jp-gsSidebar-section-content'>
      <ul className='jp-gsSidebar-sectionList'>
        {props.items.map((item, i) => {
          return (
            <SectionItem
              translator={props.translator}
              item={item}
            />
          );
        })}
      </ul>
    </div>
  )
}


/**
 * React component of sidebar.
 */
class GSSidebarComponent extends React.Component<
  GSSidebarComponents.IProperties, GSSidebarComponents.IState> {
  constructor(props: GSSidebarComponents.IProperties) {
    super(props);
  }

  render() {
    const trans = this.props.translator.load('jupyterlab');

    return (
      <>
        <div className='jp-gsSidebar-header'>
          <span className='jp-gsSidebar-headerText'>
            List of Resources
          </span>
          <ToolbarButtonComponent
            icon={addIcon}
            onClick={() => { console.log('click event: create a new session.'); }}
            tooltip={trans.__('Create a new session')}
          />
        </div>

        <UseSignal signal={this.props.signal}>
          {() => {
            const elements: React.ReactElement<any>[] = [];
            const contents: any[] = [];

            this.props.widget.payload.map((sess, i) => {
              let disabled: boolean = false;
              if (sess.state === 'closed' || sess.state === 'disconnected') {
                disabled = true;
              }

              contents.push(
                <CollapsibleSection
                  key={trans.__('session section')}
                  header={trans.__(sess.name)}
                  tooltip={sess.content}
                  isOpen={true}
                  disabled={disabled}
                  headerElements={
                    <ToolbarButtonComponent
                      icon={addIcon}
                      onClick={() => { this.props.commands.execute(CommandIDs.open, { sess: sess.name }); }}
                      tooltip='Create a new graph'
                    />
                  }
                >
                  <SectionListView
                    translator={this.props.translator}
                    items={sess.items}
                  />
                </CollapsibleSection>
              )
            })

            elements.push(
              <div className='jp-gsSidebar-content'>
                {contents}
              </div>
            )

            return elements;
          }}
        </UseSignal>
      </>
    )
  }
}


/**
 * The widget for graphscope sidebar.
 */
export class GSSidebarWidget extends IVariableInspectorWidget {
  /**
   * Constructs a new GSSideBarWidget.
   */
  constructor(commands: CommandRegistry, translator?: ITranslator) {
    super();
    this.commands = commands;
    this.translator = translator || nullTranslator;

    const trans = this.translator.load('jupyterlab');

    this.id = trans.__('gs-sidebar-widget');
    this.title.caption = trans.__('GraphScope Jypyterlab Extension');
    this.title.icon = gsIcon;
    this.title.closable = true;

    this.addClass('.jp-gsSidebar-widget');
  }

  dispose(): void {
    if (!this.isDisposed) {
      this.handler = null;
      super.dispose();
    }
  }

  /**
   * Handle variable update signals.
   */
  protected onInspectorUpdate(
    sender: any,
    args: VariableInspector.IVariableInspectorUpdate
  ): void {
    if (!this.isAttached) {
      return;
    }

    let sessions = new Map<string, GSVariable.GSSessionVariable>();

    // handle `session`
    args.payload.forEach(v => {
      if (v.type === 'session') {
        sessions.set(v.props.session_id, { name: v.name, content: v.content, state: v.props.state, items: [] });
      }
    });

    // handle `graph`
    args.payload.forEach(v => {
      if (v.type === 'graph') {
        let session_id = v.props.session_id;
        if (sessions.has(session_id)) {
          let session = sessions.get(session_id);
          session.items.push({ name: v.name, content: v.content, type: "graph", state: v.props.state });
        }
      }
    });

    this._payload = [];
    for (let value of sessions.values()) {
      this._payload.push(value);
    }

    this._runningChanged.emit(void 0);
  }

  /**
   * Handle handler disposed signals.
   */
  protected onHandlerDisposed(sender: any, args: void): void {
    this.handler = null;
  }

  get runningChanged(): ISignal<GSSidebarWidget, void> {
    return this._runningChanged;
  }

  get payload(): GSVariable.GSSessionVariable[] {
    return this._payload;
  }

  protected render(): JSX.Element {
    return (
      <GSSidebarComponent
        commands={this.commands}
        translator={this.translator}
        widget={this}
        signal={this._runningChanged}
      />
    );
  }

  public translator: ITranslator;
  protected commands: CommandRegistry;

  private _payload: GSVariable.GSSessionVariable[] = [];
  private _runningChanged = new Signal<this, void>(this);
}
