import {
  ILabShell,
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette,
  // MainAreaWidget,
  // WidgetTracker,
} from '@jupyterlab/apputils';

import { ILauncher } from '@jupyterlab/launcher';

import { ITranslator } from '@jupyterlab/translation';

import { LabIcon } from '@jupyterlab/ui-components';

// import { Panel, Widget } from '@lumino/widgets';

// import { reactIcon } from '@jupyterlab/ui-components';

import graphscopeIconStr from '../style/graphscope.svg';

import { GSWidget } from './widget';

// const PALETTE_CATEGORY = 'GraphScope PALETTE'

// namespace CommandIDs {
  // export const open = "graphscope-launcher:open";
// }

/**
 * Initialization data for the graphscope-jupyterlab extension.
 */
 const extension: JupyterFrontEndPlugin<void> = {
  id: 'graphscope-jupyterlab:plugin',
  autoStart: true,
  requires: [ILauncher, ITranslator, ILayoutRestorer],
  optional: [ICommandPalette, ILabShell],
  activate: activate
};

export default extension;

/**
 * Activate the JupyterLab extension.
 *
 * @param app Jupyter Font End
 * @param launcher Jupyter Launcher
 * @param translator Jupyter Translator
 * @param restorer Jupyter LayoutRestorer
 * @param palette [Optional] Jupyter Commands Palette
 * @param labShell [Optional] Jupyter ILabShell
 */
function activate(
  app: JupyterFrontEnd,
  launcher: ILauncher,
  translator: ITranslator,
  restorer: ILayoutRestorer,
  palette: ICommandPalette | null,
  labShell: ILabShell | null,
): void {
  const { shell } = app;

  // icon
  const icon = new LabIcon({ name: 'launcher:icon', svgstr: graphscopeIconStr });
  const gsWidget = new GSWidget(icon, translator);

  // add left sidebar with rank 501
  // rank(501-899): reserved for third-party extensions.
  shell.add(gsWidget, 'left', { rank: 501 });

  /*
  const { commands, shell } = app;
  const trans = translator.load('jupyterlab');

  const command = CommandIDs.open;
  const namespace = "graphscope"
  const icon = new LabIcon({
    name: 'launcher:icon',
    svgstr: graphscopeIconStr,
  });

  let widget : MainAreaWidget<GSWidget>;
 
  // Add launcher
  launcher.add({
    command,
    category: "Other",
  });

  // Add left sidebar
  let w  = new Panel();
  w.id = 'xxxx';
  w.title.icon = icon;
  w.title.closable = true;
  shell.add(w, 'left');

  // Add commands to registry
  commands.addCommand(command, {
    label: 'GraphScope',
    caption: 'GraphScope Jupyterlab Extension',
    icon: icon,
    execute: args => {
      if (!widget || widget.isDisposed) {
        // Create a new widget if one does not exist
        // or if the previous one was disposed after closing the panel
        const content = new GSWidget();
        widget = new MainAreaWidget({content});
      }
      if (!tracker.has(widget)) {
        tracker.add(widget);
      }
      if (!widget.isAttached) {
        // Attach the widget to the main area if it's not there
        shell.add(widget, 'main', { activate: false, mode: 'split-right'});
      }
      shell.activateById(widget.id);
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

  // Track and restore the widget state
  let tracker = new WidgetTracker<MainAreaWidget<GSWidget>>({
    namespace: namespace
  });
  restorer.restore(tracker, {
    command,
    name: () => namespace
  });
  */
}
