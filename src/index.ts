import { ILabShell, ILayoutRestorer, JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';

import { ICommandPalette, WidgetTracker } from '@jupyterlab/apputils';

import { ITranslator } from '@jupyterlab/translation';

import { CommandIDs, gsIcon, PALETTE_CATEGORY, NAMESPACE } from './common';

import { GSVariableManager, IGSVariableManager } from './manager';

import { GSWidget, GSSideBarWidget } from './widget';

/**
 * A service providing variable inspection.
 */
const variableinspector: JupyterFrontEndPlugin<IGSVariableManager> = {
  id: '@grgraphscope-jupyterlab:plugin',
  autoStart: true,
  requires: [ILabShell, ILayoutRestorer, ITranslator],
  optional: [ICommandPalette],
  provides: IGSVariableManager,
  activate: (
    app: JupyterFrontEnd,
    labShell: ILabShell,
    restorer: ILayoutRestorer,
    translator: ITranslator,
    palette: ICommandPalette | null,
  ): IGSVariableManager => {
    const { commands } = app;
    const command = CommandIDs.open;
    // track and restore the widget state
    const tracker = new WidgetTracker<GSWidget>({ namespace: NAMESPACE });

    const manager = new GSVariableManager();

    /**
     * create and track a new inspector.
     */
    function newPanel(): GSWidget {
      const panel = new GSWidget();
      panel.disposed.connect(() => {
        if (manager.panel == panel) {
          manager.panel = null;
        }
      });

      // track the panel
      tracker.add(panel);

      return panel;
    }

    // enable state restoration
    restorer.restore(tracker, {
      command,
      args: () => null,
      name: () => NAMESPACE,
    })

    // register command to command system
    commands.addCommand(command, {
      label: 'GraphScope',
      caption: 'GraphScope Jupyterlab Extension',
      icon: gsIcon,
      execute: args => {
        if (!manager.panel || manager.panel.isDisposed) {
          manager.panel = newPanel();
        }
        if (!manager.panel.isAttached) {
          labShell.add(manager.panel, 'main', { mode: 'split-right' });
        }
        if (manager.handler) {
          manager.handler.performInspection();
        }
        labShell.activateById(manager.panel.id);
      },
    });
  
    // add the command to the palette
    if (palette) {
      palette.addItem({
        command,
        args: { isPalette: true },
        category: PALETTE_CATEGORY,
      })
    }

    return manager;
  },
};