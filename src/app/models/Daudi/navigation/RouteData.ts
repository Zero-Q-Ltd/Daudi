export interface RouteData {
    description: string;
    configurable: boolean;
    level?: number;
}

/**
 * Small hack to take advantage of Linting
 */
export class RouteDataClass {
    data: RouteData;

    constructor(newdata: RouteData) {
        this.data = newdata;
    }
}
