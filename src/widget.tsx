import { ReactWidget, UseSignal, ToolbarButtonComponent } from '@jupyterlab/apputils';

import { CommandRegistry } from '@lumino/commands';

import { ITranslator, nullTranslator } from '@jupyterlab/translation';

import { ISignal, Signal } from '@lumino/signaling';

import { INotebookTracker } from '@jupyterlab/notebook';

import { CodeCell, MarkdownCell } from '@jupyterlab/cells';

import { caretDownIcon, caretRightIcon, Collapse } from '@jupyterlab/ui-components';

import React from 'react';

import { gsIcon } from './common';

import { IVariableInspector, VariableInspector } from './variableinspector';

import '@grapecity/wijmo.styles/wijmo.css';

import 'bootstrap/dist/css/bootstrap.css';

// import * as wjNav from '@grapecity/wijmo.react.nav';

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

export function getData() {
    return [
        {
            header: 'Electronics', img: 'resources/electronics.png', items: [
                { header: 'Trimmers/Shavers' },
                { header: 'Tablets' },
                {
                    header: 'Phones', img: 'resources/phones.png', items: [
                        { header: 'Apple' },
                        { header: 'Motorola', newItem: true },
                        { header: 'Nokia' },
                        { header: 'Samsung' }
                    ]
                },
                { header: 'Speakers', newItem: true },
                { header: 'Monitors' }
            ]
        },
        {
            header: 'Toys', img: 'resources/toys.png', items: [
                { header: 'Shopkins' },
                { header: 'Train Sets' },
                { header: 'Science Kit', newItem: true },
                { header: 'Play-Doh' },
                { header: 'Crayola' }
            ]
        },
        {
            header: 'Home', img: 'resources/home.png', items: [
                { header: 'Coffee Maker' },
                { header: 'Breadmaker', newItem: true },
                { header: 'Solar Panel', newItem: true },
                { header: 'Work Table' },
                { header: 'Propane Grill' }
            ]
        }
    ];
}

interface GSGraphVariable {
    header: string
}

interface GSSessionVariable {
    header: string,
    items: GSGraphVariable[],
}

/**
 *
 */
export class CollapsibleSection extends React.Component<
    CollapsibleSection.IProperties,
    CollapsibleSection.IState
> {
    constructor(props: CollapsibleSection.IProperties) {
        super(props);
        this.state = {
            isOpen: props.isOpen ? true : false
        }
    }

    /**
     * Render the collapsible section using the virtual DOM.
     */
    render(): React.ReactNode {
        let icon = this.state.isOpen ? caretDownIconStyled : caretRightIconStyled;
        let isOpen = this.state.isOpen;
        let className = 'jp-gs-section-headerText';

        if (this.props.disabled) {
            icon = caretRightIconStyled;
            isOpen = false;
            className = 'jp-gs-section-headerTextDisabled ';
        }

        return (
            <>
                <div className="jp-gs-section-header">
                    <ToolbarButtonComponent
                        icon={icon}
                        onClick={this.handleCollapse.bind(this)}
                    />
                    <span className={className} onContextMenu={this.onContextMenu.bind(this)}>{this.props.header}</span>
                    {!this.props.disabled && this.props.headerElements}
                </div>
                <Collapse isOpen={isOpen}>{this.props.children}</Collapse>
            </>
        );
    }

    handleCollapse() : void {
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



interface IProperties {
    commands: CommandRegistry,
    translator?: ITranslator;
    widget: GSSideBarWidget,
    signal: ISignal<GSSideBarWidget, void>,
}

interface IState {
    data: any,
    msg: string,
}


class GSSideBarComponent extends React.Component<IProperties, IState> {
    constructor(props: IProperties) {
        super(props);
    }

    render() {
        return (
            <div className="jp-GSSideBarContents">
                <div className="jp-stack-panel-header">
                    <span>List of Resources</span>
                </div>

                <UseSignal signal={this.props.signal}>
                {() => {
                    const elements: React.ReactElement<any>[] = [];
                    // content of session and graph
                    const content: any[] = [];
                    content.push(
                        <CollapsibleSection
                            header='Default Session'
                            isOpen={true}
                            disabled={false}
                        >
                            <div className='jp-gs-section-content'>
                                <div>
                                    g1
                                </div>
                                <div>
                                    g2
                                </div>
                            </div>
                        </CollapsibleSection>
                    )
                    content.push(
                        <CollapsibleSection
                            header='Session1'
                            isOpen={false}
                            disabled={false}
                        >
                        </CollapsibleSection>
                    )
                    content.push(
                        <CollapsibleSection
                            header='Session2'
                            isOpen={false}
                            disabled={true}
                        >
                        <div>headerElements</div>
                        </CollapsibleSection>
                    )
                    elements.push(
                        <div key="content" className='jp-gs-sidebar-content'>
                            {content}
                        </div>
                    );
                    return elements;
                    // return (
                    //     <div className="container-fluid">
                    //         <wjNav.TreeView itemsSource={ this.props.widget.payload } displayMemberPath="header" childItemsPath="items" itemClicked={this.onItemClicked.bind(this)}></wjNav.TreeView>
                    //     </div>
                    // )
                }}
                </UseSignal>

            </div>
        );
    }

    public onItemClicked(s: any, e: any) {
        console.log(s.selectedItem.header);
    }
}

/**
 * Sidebar react component
 * 
 * @return The react component
 */
/*
function GSSideBarComponent(props: {
    commands: CommandRegistry,
    translator?: ITranslator;
    widget: GSSideBarWidget,
    signal: ISignal<GSSideBarWidget, void>,
}) {
    // const commands = props.commands;
    // const translator = props.translator || nullTranslator;
    // const trans = translator.load('jupyterlab');
    return (
        <>
            <div>
                <UseSignal signal={props.signal}>
                    {() => {
                        return (
                        <ListView
                            payload={props.widget.payload}
                        />
                        )
                    }}
                </UseSignal>
            </div>
        </>
    )
}
**/

function Item(props: {
    name: string,
    type: string,
    content: string
}) {
    return (
        <li>
            <span>
                {props.name} {props.type} {props.content}
            </span>
        </li>
    )
}


function ListView(props: {
    payload: VariableInspector.IVariable[],
}) {
    return (
        <ul>
            {props.payload.map((variable, i) => {
                return (
                    <Item
                        name={variable.name}
                        type={variable.type}
                        content={variable.content}
                    />
                )
            })}
        </ul>
    );
}

/**
 * Main area react component
 *
 * @return The react component
 */
function GSMainAreaComponent(props: {
    widget: GSWidget,
    signal: ISignal<GSWidget, void>,
}) {
    return (
        <>
            <div>
                <UseSignal signal={props.signal}>
                    {() => {
                        return (
                        <ListView
                            payload={props.widget.payload}
                        />
                        )
                    }}
                </UseSignal>
                <input type="text" id="example">
                </input>
                <button
                    onClick={(): void => {
                        let a = (document.getElementById("example") as HTMLInputElement).value;
                        props.widget.tempMethodForInsertCodeIntoNotebookCell(a);
                    }}
                >
                    Insert code into cell
                </button>
            </div>
        </>
    )
}


export abstract class IVariableInspectorWidget extends ReactWidget implements IVariableInspector {
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

    get handler() : VariableInspector.IInspectable | null {
        return this._handler;
    }

    protected abstract onInspectorUpdate(sender: any, args: VariableInspector.IVariableInspectorUpdate): void;

    protected abstract onHandlerDisposed(sender: any, args: void): void;

    private _handler: VariableInspector.IInspectable | null = null;
}


/**
 * Main area widget
 */
export class GSWidget extends IVariableInspectorWidget {
    constructor(translator?: ITranslator) {
        super();

        this.id = "gs-mainarea-widget";
        this.title.icon = gsIcon;
        this.title.closable = true;

        this.translator = translator || nullTranslator;
    }

    tempMethodForInsertCodeIntoNotebookCell(code: string): void {
        let cell = this._notebook.activeCell;
        if (cell === null) {
            return;
        }
        if (cell instanceof MarkdownCell) {
            cell.editor.replaceSelection('```' + '\n' + code + '\n```');
        } else if(cell instanceof CodeCell) {
            cell.editor.replaceSelection(code);
        }
    }

    get notebook(): INotebookTracker | null {
        return this._notebook;
    }

    set notebook(nb: INotebookTracker | null) {
        this._notebook = nb;
    }

    dispose(): void {
        if (!this.isDisposed) {
            this.handler = null;
            super.dispose();
        }
    }

    protected onInspectorUpdate(
        sender: any, args: VariableInspector.IVariableInspectorUpdate
    ): void {
        if (!this.isAttached) {
            return;
        }

        // const title = args.title;
        this._payload = args.payload;
        this._runningChanged.emit(void 0);
    }

    /**
     * Handle handler disposed signals.
     */
    protected onHandlerDisposed(sender: any, args: void): void {
        this.handler = null;
    }

    get payload(): VariableInspector.IVariable[] {
        return this._payload;
    }

    get runningChanged(): ISignal<GSWidget, void> {
        return this._runningChanged;
    }

    protected render(): JSX.Element {
        return (
            <GSMainAreaComponent
                widget={this}
                signal={this._runningChanged}
            />
        );
    }

    private _notebook: INotebookTracker | null = null;
    protected translator: ITranslator;

    private _payload: VariableInspector.IVariable[] = []
    private _runningChanged = new Signal<this, void>(this);
}

/**
 * Sidebar widget
 */
export class GSSideBarWidget extends IVariableInspectorWidget {
    /**
     * Constructs a new GSSideBarWidget.
     */
    constructor(commands: CommandRegistry, translator?: ITranslator) {
        super();
        this.commands = commands;
        this.translator = translator || nullTranslator;

        this.id = "gs-sidebar-widget";
        this.title.caption = "GraphScope Jypyterlab Extension";
        this.title.icon = gsIcon;
        this.title.closable = true;

        this.addClass('jp-GSWidget');
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
        sender: any, args: VariableInspector.IVariableInspectorUpdate
    ): void {
        if (!this.isAttached) {
            return;
        }

        let sessions = new Map<string, GSSessionVariable>();

        // handle `session`
        args.payload.forEach(v => {
            if (v.type === "session") {
                sessions.set(v.props.session_id, { "header": v.name, "items": [] });
            }
        });

        // handle `graph`
        args.payload.forEach(v => {
            if (v.type === "graph") {
                let session_id = v.props.session_id;
                if (!sessions.has(session_id)) {
                    sessions.set(session_id, { "header": "Default Session", items: []});
                }
                let session = sessions.get(session_id);
                session.items.push({ header: v.name });
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

    get runningChanged(): ISignal<GSSideBarWidget, void> {
        return this._runningChanged;
    }

    get payload() {
        return this._payload;
    }

    protected render(): JSX.Element {
        return (
            <GSSideBarComponent
                commands={this.commands}
                translator={this.translator}
                widget={this}
                signal={this._runningChanged}
            />
        )

    }

    protected commands: CommandRegistry;
    protected translator: ITranslator;

    private _payload: any;
    // private _payload: VariableInspector.IVariable[] = [];
    private _runningChanged = new Signal<this, void>(this);
}
