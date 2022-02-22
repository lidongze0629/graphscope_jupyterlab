import { ReactWidget } from '@jupyterlab/apputils';

import { CommandRegistry } from '@lumino/commands';

import { ITranslator, nullTranslator } from '@jupyterlab/translation';

import { LabIcon } from '@jupyterlab/ui-components';

import { StackedPanel } from '@lumino/widgets';

import React from 'react';

/**
 * React component for GraphScope
 * 
 * @return The React component
 */
function GSComponent(props: {
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
                        console.log(trans.__(CommandIDs.open));
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
 * GraphScope Main Area Widget
 */
export class GSWidget extends StackedPanel {
    /**
     * Constructs a new GSWidget.
     */
    constructor(icon: LabIcon, translator?: ITranslator) {
        super();

        this.icon = icon;
        this.translator = translator || nullTranslator;

        this.id = "GraphScope Widget";
        this.title.icon = icon;
        this.title.closable = true;
    }

    protected icon: LabIcon;
    protected translator: ITranslator;
}

/**
 * GraphScope Sidebar Widget
 */
export class GSSideBarWidget extends ReactWidget {
    /**
     * Constructs a new GSSideBarWidget.
     */
    constructor(commands: CommandRegistry, icon: LabIcon, translator?: ITranslator) {
        super();
        this.commands = commands;
        this.icon = icon;
        this.translator = translator || nullTranslator;

        this.id = "GraphScope SideBar Widget";
        this.title.icon = icon;
        this.title.closable = true;

        this.addClass('jp-GSWidget');
    }

    protected render(): JSX.Element {
        return (
            <GSComponent
                commands={this.commands}
                translator={this.translator}
            />
        );
    }

    protected commands: CommandRegistry;
    protected icon: LabIcon;
    protected translator: ITranslator;
}

export namespace CommandIDs {
    export const open = "gs-graph-schema:open";
}
