import { ReactWidget } from '@jupyterlab/apputils';

import { CommandRegistry } from '@lumino/commands';

import { ITranslator, nullTranslator } from '@jupyterlab/translation';

import { CommandIDs, gsIcon, PALETTE_CATEGORY, NAMESPACE } from './common';

import { Widget } from '@lumino/widgets';

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
export class GSWidget extends Widget {
    /**
     * Constructs a new GSWidget.
     */
    constructor(translator?: ITranslator) {
        super();

        this.translator = translator || nullTranslator;

        this.id = "gs-mainarea-widget";
        this.title.icon = gsIcon;
        this.title.closable = true;
    }

    protected translator: ITranslator;
}

/**
 * GraphScope Sidebar Widget
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
            <GSComponent
                commands={this.commands}
                translator={this.translator}
            />
        );
    }

    protected commands: CommandRegistry;
    protected translator: ITranslator;
}
