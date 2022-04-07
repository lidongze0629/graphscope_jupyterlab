import { CommandRegistry } from '@lumino/commands';

import { ISignal } from '@lumino/signaling';

import { ITranslator } from '@jupyterlab/translation';

import { UseSignal } from '@jupyterlab/apputils';

import { showDialog, showErrorMessage, Dialog } from '@jupyterlab/apputils';

import { CodeCell, MarkdownCell } from '@jupyterlab/cells';

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

  export interface IState {}
}

/**
 * Base react component of graph operation widget.
 */
export class GraphOpComponent extends React.Component<
  GraphOpComponents.IProperties,
  GraphOpComponents.IState
> {
  constructor(props: GraphOpComponents.IProperties) {
    super(props);
  }

  _onCreateGraph(params: any): void {
    console.log("cg: ", params);

    const name = params.name;
    const directed = params.directed;
    const generate_eid = params.eid;
    const oid_type = params.oidType;

    const widget = this.props.widget;
    const code = widget.graphManager.generateCode(
      widget.meta["sess"], name, oid_type, directed, generate_eid
    );

    console.log(widget, widget.notebook)
    const cell = widget.notebook.activeCell;
    if (cell === null) {
      showDialog({
        title: 'WRANNING',
        body: 'No focused cell found.',
        buttons: [Dialog.okButton()]
      }).catch(e => console.log(e));
    }

    if (cell instanceof MarkdownCell) {
      cell.editor.replaceSelection('```' + '\n' + code + '\n```');
    } else if (cell instanceof CodeCell) {
      cell.editor.replaceSelection(code);
    }
  }

  _onCreateVertex(params: any): boolean {
    console.log('create vertex: ', params);

    try {
        this.props.widget.graphManager.addVertex(params);
    } catch (ex) {
        showErrorMessage(
            "Failed to create vertex",
            ex,
            [Dialog.cancelButton()]
        ).catch(e => console.log(e));
        return false;
    }
    return true;
  }

  _onEditVertex(params: any): boolean {
    console.log('ev: ', params);
    try {
        this.props.widget.graphManager.editVertex(params);
    } catch (ex) {
        showErrorMessage(
            "Failed to edit vertex",
            ex,
            [Dialog.cancelButton()]
        ).catch(e => console.log(e));
        return false;
    }
    return true;
  }

  _onCreateEdge(params: any): boolean {
    console.log('ce: ', params);

    try {
        this.props.widget.graphManager.addEdge(params);
    } catch (ex) {
        showErrorMessage(
            "Failed to create edge",
            ex,
            [Dialog.cancelButton()]
        ).catch(e => console.log(e));
        return false;
    }
    return true;
  }

  _onEditEdge(params: any): boolean {
    console.log('ee: ', params);

    try {
        this.props.widget.graphManager.editEdge(params);
    } catch (ex) {
        showErrorMessage(
            "Failed to edit edge",
            ex,
            [Dialog.cancelButton()]
        ).catch(e => console.log(e));
        return false;
    }
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
          );
        }}
      </UseSignal>
    );
  }
}
