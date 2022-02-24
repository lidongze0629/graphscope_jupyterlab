import { ReactWidget } from '@jupyterlab/apputils';

import { CommandRegistry } from '@lumino/commands';

import { ITranslator, nullTranslator } from '@jupyterlab/translation';

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

/**
 * Main area react component
 *
 * @return The react component
 */
function GSMainAreaComponent(props: {}) {
    const [counter, setCounter] = useState(0);

    console.log('access GSMainAreaComponent render');
    return (
        <>
            <div></div>
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

    dispose(): void {
        if (!this.isDisposed) {
            this.handler = null;
            super.dispose();
        }
    }

    protected onInspectorUpdate(
        sender: any, args: VariableInspector.IVariableInspectorUpdate
    ): void {
        // TODO
    }

    /**
     * Handle handler disposed signals.
     */
    protected onHandlerDisposed(sender: any, args: void): void {
        this.handler = null;
    }

    protected render(): JSX.Element {
        return (
            <GSMainAreaComponent/>
        );
    }

    private _handler: VariableInspector.IInspectable | null = null;
    protected translator: ITranslator;
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
