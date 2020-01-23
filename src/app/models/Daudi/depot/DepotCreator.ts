import { DaudiMeta } from '../universal/Meta';

export interface DepotCreator extends DaudiMeta {
    /**
     * gives information about the OMC that creted the depot and the admin
     */
    omcId: string;
}
