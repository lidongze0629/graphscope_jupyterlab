import { Token } from '@lumino/coreutils';

import { GSWidget } from './widget';


export const IGSVariableManager = new Token<IGSVariableManager>(
    'jupyterlab_extension/graphscope:IGSVariableManager'
);

export interface IGSVariableManager {

}

export class GSVariableManager implements IGSVariableManager {
    private _panel: GSWidget = null;

    get panel(): GSWidget {
        return this._panel;
    }

    set panel(panel: GSWidget) {
        if (this._panel == panel) {
            return;
        }
        this._panel = panel;

        // if (panel && !panel.handler) {
        //     panel.handler = this._handler;
        // }
    }
}