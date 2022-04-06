/**
 * Namespace of graphscope variable
 */
export namespace GSVariable {
  /**
   * Graph variable interface of graphscope.
   */
  export interface IAppOrGraphVariable {
    /**
     * Variable name of the application/graph.
     */
    name: string;
    /**
     * Type: graph or application
     */
    type: string;
    /**
     * State, loaded or unloaded.
     */
    state: string;
    /**
     * output of `__str__` in python class.
     */
    content: string;
  }

  /**
   * Session variable interface.
   */
  export interface ISessionVariable {
    /**
     * Variable name of the session.
     */
    name: string;
    /**
     * State, active、disconnected or closed.
     */
    state: string;
    /**
     * output of `__str__` in python class.
     */
    content: string;
    /**
     * Resource exists in this session.
     */
    items: IAppOrGraphVariable[];
  }

  /**
   * Extra params definition.
   */
  export interface IExtraParams {
    key: string;
    value: string;
  }

  /**
   * Property definition.
   */
  export interface IProperty {
    /**
     * Generated by web framework, do nothing.
     */
    id: Number;
    /**
     * Allow null or not.
     */
    allowNull: boolean;
    /**
     * Comment.
     */
    comment: string;
    /**
     * Default value, todo support Number.
     */
    defaultValue: string;
    /**
     * Index or not.
     */
    index: boolean;
    /**
     * The name which property mapped to.
     */
    mappedTo: string;
    /**
     * Property name.
     */
    name: string;
    /**
     * Property type.
     */
    type: string;
    /**
     * Primary key or not.
     */
    primaryKey: boolean;
  }

  /**
   * Vertex definition.
   */
  export interface IVertex {
    /**
     * Vertex label
     */
    label: string;
    /**
     * Data source, such as oss, hdfs, file, s3.
     */
    dataSource: string;
    /**
     * Location of data source.
     */
    location: string;
    /**
     * Whether the first line of file is header row.
     */
    headerRow: boolean;
    /**
     * Delimiter, such as '|', ','
     */
    delimiter: string;
    /**
     * Vid field.
     */
    idFiled: string;
    /**
     * Extra params switch for loader.
     */
    extraParamsSwitch: boolean;
    /**
     * Extra params for loader, used when extraParamsSwitch is true.
     */
    extraPrams: IExtraParams[];
    /**
     * Enable selectAllProperties.
     */
    selectAllProperties: boolean;
    /**
     * Properties
     */
    propertiesData: IProperty[];
  }

  /**
   * Edge definition.
   */
  export interface IEdge {
    /**
     * Edge label
     */
    label: string;
    /**
     * Data source, such as oss, hdfs, file, s3.
     */
    dataSource: string;
    /**
     * Location of data source.
     */
    location: string;
    /**
     * Whether the first line of file is header row.
     */
    headerRow: boolean;
    /**
     * Delimiter, such as '|', ','
     */
    delimiter: string;
    /**
     * Extra params switch for loader.
     */
    extraParamsSwitch: boolean;
    /**
     * Extra params for loader, used when extraParamsSwitch is true.
     */
    extraPrams: IExtraParams[];
    /**
     * Src field
     */
    srcField: string;
    /**
     * Source vertex label
     */
    srcLabel: string;
    /**
     * Dst field
     */
    dstField: string;
    /**
     * destination vertex label
     */
    dstLabel: string;
    /**
     * Enable selectAllProperties.
     */
    selectAllProperties: boolean;
    /**
     * Properties
     */
    propertiesData: IProperty[];
  }
}
