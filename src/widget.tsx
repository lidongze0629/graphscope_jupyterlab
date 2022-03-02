import { ReactWidget, UseSignal } from '@jupyterlab/apputils';

import { CommandRegistry } from '@lumino/commands';

import { ITranslator, nullTranslator } from '@jupyterlab/translation';

import { ISignal, Signal } from '@lumino/signaling';

import { INotebookTracker } from '@jupyterlab/notebook';

import { CodeCell, MarkdownCell } from '@jupyterlab/cells';

import React from 'react';

import { gsIcon } from './common';

import { IVariableInspector, VariableInspector } from './variableinspector';


/**
 * Sidebar react component
 * 
 * @return The react component
 */
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

        this._payload = args.payload;
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

    get payload(): VariableInspector.IVariable[] {
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
        );
    }

    protected commands: CommandRegistry;
    protected translator: ITranslator;

    private _payload: VariableInspector.IVariable[] = [];
    private _runningChanged = new Signal<this, void>(this);
}
