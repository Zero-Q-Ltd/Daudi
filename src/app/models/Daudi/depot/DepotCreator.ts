import {Meta} from "../universal/Meta";

export interface DepotCreator extends Meta {
    /**
     * gives information about the OMC that creted the depot and the admin
     */
    omcId: string;
}
