import { GSVariable } from './gsvariable';

/**
 * Manager class to operate graph schema.
 */
export class GraphManager {
  constructor(options: GraphManager.IOptions) {}

  generateCode(sess: string): string {
    let code = `
from graphscope.framework.loader import Loader
    `;

    // vertices
    code += `
_vertices = {
    `;
    if (this._vertices.size > 0) {
      for (let [l, v] of this._vertices) {
        code += `
    "${l}": (
        ${this._generate_loader(v.location, v.header_row, v.delimiter)},
        ${this._generate_property_list(v.properties)},
        "${v.vid_field}"
    ),
        `;
      }
    }
    code += `
}
    `;

    // edges
    code += `
_edges = {
    `;
    if (this._edges.size > 0) {
      for (let [l, edges] of this._edges) {
        code += `
    "${l}": [`;
        // handel sub label
        for (let e of edges) {
          code += `
        (
            ${this._generate_loader(e.location, e.header_row, e.delimiter)},
            ${this._generate_property_list(e.properties)},
            ("${e.src_field}", "${e.src_label}"),
            ("${e.dst_field}", "${e.dst_label}"),
        ),
          `;
        }
        code += `
    ],
        `;
      }
    }
    code += `
}
    `;

    // session load from
    code += `
g = ${sess}.load_from(_edges, _vertices, directed=True, generate_eid=True)`;
    return code;
  }

  addVertex(v: GSVariable.Vertex): void {
    if (this._vertices.has(v.label)) {
      throw new Error(`Vertex label ${v.label} exists in current graph.`);
    }
    this._vertices.set(v.label, v);
  }

  addEdge(ne: GSVariable.Edge): void {
    if (this._edges.has(ne.label)) {
      for (let e of this._edges.get(ne.label)) {
        if (ne.src_label === e.src_label && ne.dst_label === e.dst_label) {
          throw new Error(
            `Edge Label ${ne.label}(${ne.src_label} => ${ne.dst_label}) exists in current graph.`
          );
        }
      }
      this._edges.get(ne.label).push(ne);
    } else {
      this._edges.set(ne.label, [ne]);
    }
  }

  get vertices(): Map<string, GSVariable.Vertex> {
    return this._vertices;
  }

  get edges(): Map<string, GSVariable.Edge[]> {
    return this._edges;
  }

  _generate_property_list(properties: [string, string][]): string {
    let py_property_list = '[';
    properties.forEach(p => {
      // p: (property name, property type)
      if (p[1] === 'null') {
        py_property_list += `'${p[0]}', `;
      } else {
        py_property_list += `('${p[0]}', '${p[1]}'), `;
      }
    });
    py_property_list += ']';
    return py_property_list;
  }

  _generate_loader(
    location: string,
    header_row: boolean,
    delimiter: string
  ): string {
    const py_header_row = header_row ? 'True' : 'False';
    return `Loader('${location}', header_row=${py_header_row}, delimiter='${delimiter}')`;
  }

  // mapping of vlabel => vertex
  private _vertices = new Map<string, GSVariable.Vertex>();
  // mapping of elabel => edges, which has different sub label
  private _edges = new Map<string, GSVariable.Edge[]>();
}

/**
 * GraphManager Options
 */
export namespace GraphManager {
  export interface IOptions {}
}
