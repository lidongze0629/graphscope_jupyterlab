/**
 * Languages Model
 */
export namespace Languages {
    export type LanguageModel = {
        initScript: string;
        queryCommand: string;
        // deleteCommand: string;
    };
}

/** 
 * Code template for languages, only support python3 kernel now.
 */
export abstract class Languages {
    /**
     * Init script for ipython(python3) kernel
     */
    static py_init_script = `
import json
import sys

from IPython import get_ipython
from IPython.core.magics.namespace import NamespaceMagics


_gs_jupyterlab_nms = NamespaceMagics()
_gs_jupyterlab_Jupyter = get_ipython()
_gs_jupyterlab_nms.shell = _gs_jupyterlab_Jupyter.kernel.shell


def _gs_jupyterlab_getcontentof(x):
    content = str(x)
    if len(content) > 500:
        return content[:500] + " ..."
    else:
        return content

# inspect all variables and select 'graphscope.Graph' in current kernel 
def _gs_jupyterlab_inspect_variable():
    def check(v):
        try:    
            obj = eval(v)
            return True
        except:
            return False

    values = _gs_jupyterlab_nms.who_ls()
    # TODO(dongze) select variable which instanceof 'graphscope.Graph'
    variable_dict_list = [
        {
            'name': _v,
            'type': "todo",
            'content': str(_gs_jupyterlab_getcontentof(eval(_v)))
        }
        for _v in values if check(_v)
    ]
    return json.dumps(variable_dict_list)

def _gs_jupyterlab_delete_variable(x):
    exec("del %s" % x, globals())
`;

    /**
     * Select scripts according to the different languages.
     */
    static scripts: { [lang: string]: Languages.LanguageModel } = {
        python3: {
            initScript: Languages.py_init_script,
            queryCommand: '_gs_jupyterlab_inspect_variable()',
            // deleteCommand: '_gs_jupyterlab_delete_variable',
        },
        python2: {
            initScript: Languages.py_init_script,
            queryCommand: '_gs_jupyterlab_inspect_variable()',
            // deleteCommand: '_gs_jupyterlab_delete_variable',
        },
        python: {
            initScript: Languages.py_init_script,
            queryCommand: '_gs_jupyterlab_inspect_variable()',
            // deleteCommand: '_gs_jupyterlab_delete_variable',
        }
    };

    public static getScript(lang: string): Promise<Languages.LanguageModel> {
        return new Promise((resolve, reject) => {
            if (lang in Languages.scripts) {
                resolve(Languages.scripts[lang]);
            } else {
                reject('Language ' + lang + ' not supported yet!');
            }
        });
    }
}