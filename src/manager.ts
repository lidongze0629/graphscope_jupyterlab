import { Token } from '@lumino/coreutils';

// import { INotebookTracker } from '@jupyterlab/notebook';

import { IVariableInspectorWidget } from './widget';

import { VariableInspector } from './variableinspector';

import { VariableInspectionHandler } from './handler';

export const IGSVariableManager = new Token<IGSVariableManager>(
    'jupyterlab_extension/graphscope:IGSVariableManager'
);

export interface IGSVariableManager {
    handler: VariableInspector.IInspectable | null;
    hasHandler(id: string): boolean;
    addHandler(handler: VariableInspector.IInspectable): void;
    getHandler(id: string): VariableInspectionHandler;
}

export class GSVariableManager implements IGSVariableManager {
    // get notebook(): INotebookTracker | null {
    //     return this._notebook;
    // }

    // set notebook(nb: INotebookTracker | null) {
    //     this._notebook = nb;
        // set 'panel.notebook' tracker whether it's disposed or not
        // this._panels.array.forEach(panel => {
        // });
    // }

    public hasHandler(id: string): boolean {
        if (this._handlers[id]) {
            return true;
        }
        return false;
    }

    public getHandler(id: string) {
        return this._handlers[id];
    }

    public addHandler(handler: VariableInspectionHandler): void {
        this._handlers[handler.id] = handler;
    }

    get handler(): VariableInspector.IInspectable {
        return this._handler;
    }

    set handler(handler: VariableInspector.IInspectable) {
        if (this._handler == handler) {
            return;
        }
        // remove subscriptions
        if (this._handler) {
            this._handler.disposed.disconnect(this._onHandlerDisposed, this);
        }
        
        // set handler
        this._handler = handler;

        // set handler to each registered panel
        for (let panel of this._panels.values()) {
            panel.handler = this._handler;
        }

        // subscribe to new handler
        if (this._handler) {
            this._handler.disposed.connect(this._onHandlerDisposed, this);
        }
    }

    public getPanel(id: string) {
        return this._panels.get(id);
    }

    public registePanel(panel: IVariableInspectorWidget): void {
        this._panels.set(panel.id, panel);
    }

    private _onHandlerDisposed(): void {
        this._handler = null;
    }

    // TODO (dongze): double check whether wrapper _notebook or not.
    // private _notebook: INotebookTracker | null;

    // private _panel: GSWidget = null;

    // each panel will hold current source handler which can interactive with kernel
    private _panels = new Map<string, IVariableInspectorWidget>();

    // current source handler
    private _handler: VariableInspector.IInspectable | null;
    // each handler is either for a console or a notebook kernel
    // if a new notebook is create, build a new handler for this notebook and
    // add to the 'handlers' collection.
    private _handlers: { [id: string]: VariableInspectionHandler } = {};
}