import {
  ILabShell,
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

// import { ICommandPalette, WidgetTracker } from '@jupyterlab/apputils';

import { ICommandPalette, showDialog, Dialog } from '@jupyterlab/apputils';

import { ITranslator } from '@jupyterlab/translation';

import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';

// import { CommandIDs, gsIcon, PALETTE_CATEGORY, NAMESPACE } from './common';

import { GSVariableManager, IGSVariableManager } from './manager';

import { GSSideBarWidget } from './widget';

import { VariableInspectionHandler } from './handler';

import { buildIcon } from '@jupyterlab/ui-components';

import { KernelConnector } from './kernelconnector';

import { Languages } from './scripts';

/**
 * A service providing variable inspection.
 */
const variableinspector: JupyterFrontEndPlugin<IGSVariableManager> = {
  id: '@graphscope/variableinspector',
  autoStart: true,
  requires: [ILabShell, ITranslator],
  optional: [ICommandPalette, ILayoutRestorer],
  provides: IGSVariableManager,
  activate: (
    app: JupyterFrontEnd,
    labShell: ILabShell,
    translator: ITranslator,
    palette: ICommandPalette | null,
    restorer: ILayoutRestorer | null
  ): IGSVariableManager => {
    const { commands } = app;

    // context menu
    app.commands.addCommand('jlab-examples/context-menu:open', {
      label: 'Example',
      caption: 'Example context menu button for graphscope resource',
      icon: buildIcon,
      execute: () => {
        showDialog({
          title: 'title',
          body: 'body',
          buttons: [Dialog.okButton()]
        }).catch(e => console.log(e));
      }
    });

    const manager = new GSVariableManager();

    // add left sidebar with rank 501
    // rank(501-899): reserved for third-party extensions.
    const gsSideBarWidget = new GSSideBarWidget(commands);
    labShell.add(gsSideBarWidget, 'left', { rank: 501 });

    if (restorer) {
      // Add the sidebar to the application restorer
      restorer.add(gsSideBarWidget, '@graphscope/sidebar:plugin');
    }

    manager.registePanel(gsSideBarWidget);
    return manager;
  }
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
    labShell: ILabShell
  ): void => {
    const handlers: { [id: string]: Promise<VariableInspectionHandler> } = {};

    /**
     * Subcribes to the creation of new notebooks.
     *
     * If a new notebook is created, build a new handler for the notebook
     * and add a promise for a instanced handler to the 'handlers' collection.
     */
    notebooks.widgetAdded.connect((sender, nbPanel: NotebookPanel) => {
      handlers[nbPanel.id] = new Promise((resolve, reject) => {
        const session_context = nbPanel.sessionContext;
        const connector = new KernelConnector({ session_context });

        const script: Promise<Languages.LanguageModel> = connector.ready.then(
          () => {
            return connector.kernelLanguage.then(lang => {
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
            queryCommand: model.queryCommand
          };

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
      const widget = args.newValue;
      if (!widget || !notebooks.has(widget)) {
        return;
      }

      const future = handlers[widget.id];
      // set current widget as new handler of manager
      future.then((new_handler: VariableInspectionHandler) => {
        if (new_handler) {
          manager.handler = new_handler;
          manager.handler.performInspection();
          // set notebook tracker
          // manager.notebook = notebooks;
        }
      });
    });

    // add to notebook context menu
    // app.contextMenu.addItem({
    // command: CommandIDs.open,
    // selector: '.jp-Notebook',
    // });
  }
};

/**
 * Expose the plugins as default.
 */
const plugins: JupyterFrontEndPlugin<any>[] = [variableinspector, notebooks];
export default plugins;
