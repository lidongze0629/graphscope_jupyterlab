import { LabIcon } from '@jupyterlab/ui-components';

import graphscopeIconStr from '../style/graphscope.svg';


/**
 * CommandIDs
 */
export namespace CommandIDs {
    export const open = "gs-graph-schema:open";
}

/**
 * Icon
 */
const gsIcon = new LabIcon({ name: 'graphscope:icon', svgstr: graphscopeIconStr });
export { gsIcon };

/**
 * Palette Category
 */
const PALETTE_CATEGORY = "graphscope";
export { PALETTE_CATEGORY };

/**
 * Namespace
 */
const NAMESPACE = "graphscope";
export { NAMESPACE };