import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette } from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

import { ITranslator } from '@jupyterlab/translation';

import { LabIcon } from '@jupyterlab/ui-components';

import graphscopeIconStr from '../style/graphscope.svg';


const PALETTE_CATEGORY = 'GraphScope PALETTE'

namespace CommandIDs {
  export const create = "graphscope-launcher:create";
}

/**
 * 
 */
function create() : void {
  console.log("execute the launcher create comnand.");
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

  const { commands } = app;
  
  const icon = new LabIcon({
    name: 'launcher:icon',
    svgstr: graphscopeIconStr,
  });
  const trans = translator.load('jupyterlab');

  // Add launcher
  launcher.add({
    command: CommandIDs.create,
    category: "Other",
  });

  // Add commands to registry
  commands.addCommand(CommandIDs.create, {
    label: 'GraphScope',
    caption: 'GraphScope Jupyterlab Extension',
    icon: icon,
    execute: create,
  });

  // Add the command to the palette
  if (palette) {
    palette.addItem({
      command: trans.__(CommandIDs.create),
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
