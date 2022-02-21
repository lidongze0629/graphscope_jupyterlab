import { ReactWidget } from '@jupyterlab/apputils';

import { ITranslator, nullTranslator } from '@jupyterlab/translation';

import { LabIcon } from '@jupyterlab/ui-components';

import React from 'react';

/**
 * React component for GraphScope
 * 
 * @return The React component
 */
function GSComponent(props: {
    translator?: ITranslator;
}) {
    const translator = props.translator || nullTranslator;
    const trans = translator.load('jupyterlab');

    return (
        <>
            <div>
                <button
                    onClick={(): void => {
                        console.log(trans.__("click"));
                    }}
                >
                Graph Schema
                </button>
            </div>
        </>
    );
}

/**
 * GraphScope Widget
 */
export class GSWidget extends ReactWidget {
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

        this.addClass('jp-GSWidget');
    }

    protected render(): JSX.Element {
        return (
            <GSComponent
                translator={this.translator}
            />
        );
    }

    protected icon: LabIcon;
    protected translator: ITranslator;
}