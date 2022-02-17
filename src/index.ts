import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette } from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

import { ITranslator } from '@jupyterlab/translation';

import { LabIcon } from '@jupyterlab/ui-components';

import { Widget } from '@lumino/widgets';

import graphscopeIconStr from '../style/graphscope.svg';


const PALETTE_CATEGORY = 'GraphScope PALETTE'

/**
 *  GraphScope Custom Widget
 */
class GSWidget extends Widget {
  constructor() {
    super();
    // this.addClass('jp-example-view');
    this.id = 'graphscope-widget';
    this.title.label = 'GraphScope Jupyterlab';
    this.title.closable = true;
  }
}


namespace CommandIDs {
  export const open = "graphscope-launcher:open";
}

/**
 * Activate the JupyterLab extension.
 *
 * @param app Jupyter Font End
 * @param launcher Jupyter Launcher
 * @param translator Jupyter Translator
 * @param palette [Optional] Jupyter Commands Palette
 */
function activate(
  app: JupyterFrontEnd,
  launcher: ILauncher,
  translator: ITranslator,
  palette: ICommandPalette | null,
): void {
  console.log('Welcome to graphscope-jupyterlab extension!')

  const { commands, shell } = app;
  const trans = translator.load('jupyterlab');

  const command = CommandIDs.open;
  const icon = new LabIcon({
    name: 'launcher:icon',
    svgstr: graphscopeIconStr,
  });
 
  // Add launcher
  launcher.add({
    command,
    category: "Other",
  });

  // Add commands to registry
  commands.addCommand(command, {
    label: 'GraphScope',
    caption: 'GraphScope Jupyterlab Extension',
    icon: icon,
    execute: args => {
      const widget = new GSWidget();
      shell.add(widget, 'main', { activate: false, mode: 'split-right'});
    },
  });

  // Add the command to the palette
  if (palette) {
    palette.addItem({
      command,
      args: { isPalette: true },
      category: trans.__(PALETTE_CATEGORY),
    })
  }
}

/**
 * Initialization data for the graphscope-jupyterlab extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'graphscope-jupyterlab:plugin',
  autoStart: true,
  requires: [ILauncher, ITranslator],
  optional: [ICommandPalette],
  activate: activate
};

export default extension;
