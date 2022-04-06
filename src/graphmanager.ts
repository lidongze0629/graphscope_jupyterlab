import { GSVariable } from './gsvariable';

/**
 * Manager class to operate graph schema.
 */
export class GraphManager {
  constructor(options: GraphManager.IOptions) {}

  generateCode(sess: string, name: string, oid_type: string, directed: boolean, generate_eid: boolean): string {
    let code = `
from graphscope.framework.loader import Loader
    `;

    // vertices
    code += `
${name}_vertices = {
    `;
    if (this._vertices.size > 0) {
      for (const [l, v] of this._vertices) {
        code += `
    "${l}": (
        ${this._generate_loader(v.location, v.headerRow, v.delimiter)},
        ${this._generate_property_list(v.propertiesData)},
        "${v.idFiled}"
    ),
        `;
      }
    }
    code += `
}
    `;

    // edges
    code += `
${name}_edges = {
    `;
    if (this._edges.size > 0) {
      for (const [l, edges] of this._edges) {
        code += `
    "${l}": [`;
        // handel sub label
        for (const e of edges) {
          code += `
        (
            ${this._generate_loader(e.location, e.headerRow, e.delimiter)},
            ${this._generate_property_list(e.propertiesData)},
            ("${e.srcField}", "${e.srcLabel}"),
            ("${e.dstField}", "${e.dstLabel}"),
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
${name} = ${sess}.load_from(${name}_edges, ${name}_vertices, oid_type=${oid_type}, directed=${directed}, generate_eid=${generate_eid})`;
    return code;
  }

  addVertex(v: GSVariable.IVertex): void {
    if (this._vertices.has(v.label)) {
      throw new Error(`Vertex label ${v.label} exists in current graph.`);
    }
    this._vertices.set(v.label, v);
  }

  editVertex(v: GSVariable.IVertex): void {
    this._vertices.set(v.label, v);
  }

  addEdge(ne: GSVariable.IEdge): void {
    if (this._edges.has(ne.label)) {
      for (const e of this._edges.get(ne.label)) {
        if (ne.srcLabel === e.srcLabel && ne.dstLabel=== e.dstLabel) {
          throw new Error(
            `Edge Label ${ne.label}(${ne.srcLabel} => ${ne.dstLabel}) exists in current graph.`
          );
        }
      }
      this._edges.get(ne.label).push(ne);
    } else {
      this._edges.set(ne.label, [ne]);
    }
  }

  editEdge(ne: GSVariable.IEdge): void {
    let edges = this._edges.get(ne.label);
    // get sub label edge
    let oe: GSVariable.IEdge;
    for (const e of edges) {
      if (ne.srcLabel === e.srcLabel && ne.dstLabel=== e.dstLabel) {
        oe = e;
      }
    }
    const index = edges.indexOf(oe);
    edges[index] = ne;
  }

  get vertices(): Map<string, GSVariable.IVertex> {
    return this._vertices;
  }

  get edges(): Map<string, GSVariable.IEdge[]> {
    return this._edges;
  }

  _generate_property_list(properties: GSVariable.IProperty[]): string {
    let py_property_list = '[';
    properties.forEach(p => {
      if (p.type === 'auto') {
        py_property_list += `'${p.name}', `;
      } else {
        py_property_list += `('${p.name}', '${p.type}'), `;
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
  private _vertices = new Map<string, GSVariable.IVertex>();
  // mapping of elabel => edges, which has different sub label
  private _edges = new Map<string, GSVariable.IEdge[]>();
}

/**
 * GraphManager Options
 */
export namespace GraphManager {
  export interface IOptions {}
}
