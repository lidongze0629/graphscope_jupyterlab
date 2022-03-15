import { GSVariable } from './gsvariable';

/**
 * Manager class to operate graph schema.
 */
export class GraphManager {
  constructor(options: GraphManager.IOptions) {}

  addVertex(v: GSVariable.Vertex): void {
    if (this._vertices.has(v.label)) {
      throw new Error(`Vertex label ${v.label} exists in current graph.`);
    }
    this._vertices.set(v.label, v);
  }

  addEdge(ne: GSVariable.Edge): void {
    for (let [l, e] of this.edges) {
      if (
        ne.label === l &&
        ne.src_label === e.src_label &&
        ne.dst_label === e.dst_label
      ) {
        throw new Error(
          `Edge Label ${ne.label}(${ne.src_label} => ${ne.dst_label}) exists in current graph.`
        );
      }
    }
    this._edges.set(ne.label, ne);
  }

  get vertices(): Map<string, GSVariable.Vertex> {
    return this._vertices;
  }

  get edges(): Map<string, GSVariable.Edge> {
    return this._edges;
  }

  // mapping of vlabel => vertex
  private _vertices = new Map<string, GSVariable.Vertex>();
  // mapping of vlabel => edge
  private _edges = new Map<string, GSVariable.Edge>();
}

/**
 * GraphManager Options
 */
export namespace GraphManager {
  export interface IOptions {}
}
