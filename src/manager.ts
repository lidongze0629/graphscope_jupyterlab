import { Token } from '@lumino/coreutils';

import { GSWidget } from './widget';

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
    get panel(): GSWidget {
        return this._panel;
    }

    set panel(panel: GSWidget) {
        if (this._panel == panel) {
            return;
        }
        this._panel = panel;

        if (panel && !panel.handler) {
            panel.handler = this._handler;
        }
    }

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
        
        // set handler to the panel
        this._handler = handler;
        if (this._handler && !this._panel.isDisposed) {
            this.panel.handler = this._handler;
        } 

        // subscribe to new handler
        if (this._handler) {
            this._handler.disposed.connect(this._onHandlerDisposed, this);
        }
    }

    private _onHandlerDisposed(): void {
        this._handler = null;
    }

    // current source handler
    private _handler: VariableInspector.IInspectable | null;
    private _panel: GSWidget = null;
    // each handler is either for a console or a notebook kernel
    // if a new notebook is create, build a new handler for this notebook and
    // add to the 'handlers' collection.
    private _handlers: { [id: string]: VariableInspectionHandler } = {};
}