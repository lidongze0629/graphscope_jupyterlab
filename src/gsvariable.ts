/**
 * Namespace of graphscope variable
 */
 export namespace GSVariable {
    /**
     * Graph variable interface of graphscope.
     */
    export interface GSAppOrGraphVariable {
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
     * Session variable interface of graphscope.
     */
    export interface GSSessionVariable {
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
      items: GSAppOrGraphVariable[];
    }
  
    /**
     * Vertex definition.
     */
    export interface Vertex {
      /**
       * Vertex label
       */
      label: string;
      /**
       * Location of data source, such as oss, hdfs, file, s3.
       */
      location: string;
      /**
       * Whether the first line of file is header row.
       */
      header_row: boolean;
      /**
       * Delimiter, such as '|', ','
       */
      delimiter: string;
      /**
       * Properties, a list of tuple
       * [['property1', 'int64'], ['property2', 'string']]
       */
      properties: [string, string][];
      /**
       * Vid field.
       */
      vid_field: string;
    }

    /**
     * Edge definition.
     */
    export interface Edge {
        /**
         * Edge label
         */
        label: string;
        /**
         * Location of data source, such as oss, hdfs, file, s3.
         */
        location: string;
        /**
         * Whether the first line of file is header row.
         */
        header_row: boolean;
        /**
         * Delimiter, such as '|', ','
         */
        delimiter: string;
        /**
         * Properties, a list of tuple
         * [['property1', 'int64'], ['property2', 'string']]
         */
        properties: [string, string][];
        /**
         * Src field
         */
        src_field: string;
        /**
         * Source vertex label
         */
        src_label: string;
        /**
         * Dst field
         */
        dst_field: string;
        /**
         * destination vertex label
         */
        dst_label: string;
    }
  }