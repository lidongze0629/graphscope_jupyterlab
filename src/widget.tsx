import { ReactWidget, UseSignal } from '@jupyterlab/apputils';

import { CommandRegistry } from '@lumino/commands';

import { ITranslator, nullTranslator } from '@jupyterlab/translation';

import { ISignal, Signal } from '@lumino/signaling';

import { INotebookTracker, Notebook } from '@jupyterlab/notebook';

import React from 'react';

import { CommandIDs, gsIcon } from './common';

import { IVariableInspector, VariableInspector } from './variableinspector';


/**
 * Sidebar react component
 * 
 * @return The react component
 */
function GSSideBarComponent(props: {
    commands: CommandRegistry,
    translator?: ITranslator;
}) {
    const commands = props.commands;
    const translator = props.translator || nullTranslator;
    const trans = translator.load('jupyterlab');

    return (
        <>
            <div>
                <button
                    onClick={(): void => {
                        commands.execute(trans.__(CommandIDs.open));
                    }}
                >
                Graph Schema
                </button>
            </div>
        </>
    );
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

                <button
                    onClick={(): void => {
                        props.widget.tempMethodForInsertCodeIntoNotebookCell("import graphscope");
                    }}
                >
                    Insert code into cell
                </button>
            </div>
        </>
    )
}

/**
 * Main area widget
 */
export class GSWidget extends ReactWidget implements IVariableInspector {
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
        const notebookWidget = this._notebook.currentWidget;
        let notebookCell = (notebookWidget.content as Notebook).activeCell;
        const notebookCellEditor = notebookCell.editor;
        notebookCellEditor.replaceSelection(code);
    }

    get handler() : VariableInspector.IInspectable | null {
        return this._handler;
    }

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

    private _handler: VariableInspector.IInspectable | null = null;
    private _notebook: INotebookTracker | null = null;
    protected translator: ITranslator;

    private _payload: VariableInspector.IVariable[] = []
    private _runningChanged = new Signal<this, void>(this);
}

/**
 * Sidebar widget
 */
export class GSSideBarWidget extends ReactWidget {
    /**
     * Constructs a new GSSideBarWidget.
     */
    constructor(commands: CommandRegistry, translator?: ITranslator) {
        super();
        this.commands = commands;
        this.translator = translator || nullTranslator;

        this.id = "GraphScope SideBar Widget";
        this.title.icon = gsIcon;
        this.title.closable = true;

        this.addClass('jp-GSWidget');
    }

    protected render(): JSX.Element {
        return (
            <GSSideBarComponent
                commands={this.commands}
                translator={this.translator}
            />
        );
    }

    protected commands: CommandRegistry;
    protected translator: ITranslator;
}
