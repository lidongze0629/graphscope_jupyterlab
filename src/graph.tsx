import { CommandRegistry } from '@lumino/commands';

import { ISignal } from '@lumino/signaling';

import { ITranslator } from '@jupyterlab/translation';

import { UseSignal } from '@jupyterlab/apputils';

import React from 'react';

import { GraphOpWidget } from './widget';

import GsNotebook from 'gs-notebook';


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

    _onCreateVertex(params: any): boolean {
        console.log("cv: ", params);
        return true;
    }

    _onEditVertex(params: any): boolean {
        console.log("ev: ", params);
        return true;
    }

    _onCreateEdge(params: any): boolean {
        console.log("ce: ", params);
        return true;
    }

    _onEditEdge(params: any): boolean {
        console.log("ee: ", params);
        return true;
    }


    render() {
        return (
            <UseSignal signal={this.props.signal}>
                {() => {
                    return (
                        <GsNotebook
                            onCreateGraph={this._onCreateGraph.bind(this)}
                            onCreateVertex={this._onCreateVertex.bind(this)}
                            onEditVertex={this._onEditVertex.bind(this)}
                            onCreateEdge={this._onCreateEdge.bind(this)}
                            onEditEdge={this._onEditEdge.bind(this)}
                        />
                    )
                }}
            </UseSignal>
        )
    }
}