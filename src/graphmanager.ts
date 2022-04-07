import { GSVariable } from './gsvariable';

/**
 * Manager class to operate graph schema.
 */
export class GraphManager {
  constructor(options: GraphManager.IOptions) {}

  generateCode(sess: string, name: string, oid_type: string, directed: boolean, generate_eid: boolean): string {
    const py_directed = directed ? 'True' : 'False';
    const py_generate_eid = generate_eid ? 'True' : 'False';

    let code = `
from graphscope.framework.loader import Loader
    `;

    // vertices
    code += `
${name}_vertices = {
    `;
    if (this._vertices.size > 0) {
      for (const [l, v] of this._vertices) {
        let idField = v.idFiled;
        if (isNaN(Number(idField))) {
          idField = `"${idField}"`;
        }
        code += `
    "${l}": (
        ${this._generate_loader(v.location, v.headerRow, v.delimiter, v.extraPrams)},
        ${this._generate_property_list(v.propertiesData)},
        ${idField}
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
          let srcIdField = e.srcField;
          let dstIdField = e.dstField;
          if (isNaN(Number(srcIdField))) {
            srcIdField = `"${srcIdField}"`;
          }
          if (isNaN(Number(dstIdField))) {
            dstIdField = `"${dstIdField}"`;
          }
          code += `
        (
            ${this._generate_loader(e.location, e.headerRow, e.delimiter, e.extraPrams)},
            ${this._generate_property_list(e.propertiesData)},
            (${srcIdField}, "${e.srcLabel}"),
            (${dstIdField}, "${e.dstLabel}"),
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
${name} = ${sess}.load_from(${name}_edges, ${name}_vertices, oid_type="${oid_type}", directed=${py_directed}, generate_eid=${py_generate_eid})`;
    return code;
  }

  addVertex(v: GSVariable.IVertex): void {
    if (this._vertices.has(v.label)) {
      throw new Error(`Vertex label '${v.label}' exists in current graph.`);
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
            `Edge Label '${ne.label}(${ne.srcLabel} => ${ne.dstLabel})' exists in current graph.`
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
    delimiter: string,
    extraPrams: GSVariable.IExtraParams[],
  ): string {
    const py_header_row = header_row ? 'True' : 'False';
    let loader = 'Loader(';
    loader += `${location} header_row=${py_header_row}, delimiter='${delimiter}`;
    for (const p of extraPrams) {
      if (p.key !== undefined && p.value !== undefined) {
        loader += `, ${p.key}="${p.value}"`;
      }
    }
    loader += ')';
    return loader;
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
