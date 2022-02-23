import { ILabShell, ILayoutRestorer, JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application';

import { ICommandPalette, WidgetTracker } from '@jupyterlab/apputils';

import { ITranslator } from '@jupyterlab/translation';

import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';

import { CommandIDs, gsIcon, PALETTE_CATEGORY, NAMESPACE } from './common';

import { GSVariableManager, IGSVariableManager } from './manager';

import { GSWidget, GSSideBarWidget } from './widget';

import { VariableInspectionHandler } from './handler';

import { KernelConnector } from './kernelconnector';
import { Languages } from './scripts';

/**
 * A service providing variable inspection.
 */
const variableinspector: JupyterFrontEndPlugin<IGSVariableManager> = {
  id: '@graphscope/variableinspector',
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

    // add left sidebar with rank 501
    // rank(501-899): reserved for third-party extensions.
    const gsSideBarWidget = new GSSideBarWidget(commands);
    labShell.add(gsSideBarWidget, 'left', { rank: 501 });

    return manager;
  },
};

/**
 * An extension that registers notebooks for gs variable inspection.
 */
const notebooks: JupyterFrontEndPlugin<void> = {
  id: '@grgraphscope/plugin:notebooks',
  autoStart: true,
  requires: [IGSVariableManager, INotebookTracker, ILabShell],
  activate: (
    app: JupyterFrontEnd,
    manager: IGSVariableManager,
    notebooks: INotebookTracker,
    labShell: ILabShell,
  ): void => {
      const handlers: { [id: string]: Promise<VariableInspectionHandler> } = {};

      /**
       * Subcribes to the creation of new notebooks.
       * 
       * If a new notebook is created, build a new handler for the notebook
       * and add a promise for a instanced handler to the 'handlers' collection.
       */
      notebooks.widgetAdded.connect((sender, nbPanel: NotebookPanel) => {
        console.log("create a new notebook.")

        handlers[nbPanel.id] = new Promise((resolve, reject) => {
          const session_context = nbPanel.sessionContext;
          const connector = new KernelConnector({ session_context });

          const script: Promise<Languages.LanguageModel> = connector.ready.then(
            () => {
              return connector.kernelLanguage.then((lang) => {
                return Languages.getScript(lang);
              });
            }
          );

          script.then((model: Languages.LanguageModel) => {
            const options: VariableInspectionHandler.IOptions = {
              // Use the session path as an identifier.
              id: session_context.path,
              connector: connector,
              initScript: model.initScript,
              queryCommand: model.queryCommand,
            }

            const handler = new VariableInspectionHandler(options);
            manager.addHandler(handler);
            nbPanel.disposed.connect(() => {
              delete handlers[nbPanel.id];
              handler.dispose();
            });

            handler.ready.then(() => {
              resolve(handler);
            });

            // error handle
            script.catch((rlt: string) => {
              reject(rlt);
            });
          });
        });
      });

      /**
       * If focus window changes, checks whether new focus widget is a notebook.
       * 
       * In that case, retrieves the handler associated to the notebook after it has
       * been initialized and updates the manager with it.
       */
      labShell.currentChanged.connect((sender, args) => {
        console.log("notebook changed")

        const widget = args.newValue;
        if (!widget || ! notebooks.has(widget)) {
          return;
        }

        const future = handlers[widget.id];
        // set current widget as new handler of manager
        future.then((new_handler: VariableInspectionHandler) => {
          if (new_handler) {
            manager.handler = new_handler;
            manager.handler.performInspection();
          }
        });
      });

      // add to notebook context menu
      app.contextMenu.addItem({
        command: CommandIDs.open,
        selector: '.jp-Notebook',
      });
  },
};

/**
 * Expose the plugins as default.
 */
const plugins: JupyterFrontEndPlugin<any>[] = [
  variableinspector,
  notebooks,
];
export default plugins;
