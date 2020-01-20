import {Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA} from "@angular/material";
import {FlatTreeControl} from "@angular/cdk/tree";
import {MatTreeFlatDataSource, MatTreeFlattener} from "@angular/material/tree";
import {Observable, of as observableOf, ReplaySubject} from "rxjs";


export class ColNode {
    children: ColNode[];
    nodename: string;
    nodevalue: any;
    selected: boolean;
}

/** Flat node with expandable and level information */
export class ColFlatNode {
    constructor(
        public expandable: boolean,
        public nodename: string,
        public level: number,
        public nodevalue: any) {
    }
}

@Component({
    selector: "app-columns-customizer",
    templateUrl: "./columns-customizer.component.html",
    styleUrls: ["./columns-customizer.component.scss"]

})
export class ColumnsCustomizerComponent implements OnInit, OnDestroy {
    columnheaders;
    treebuild = {};

    treeControl = {};
    treeFlattener: MatTreeFlattener<ColNode, ColFlatNode>;
    comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

    constructor(@Inject(MAT_DIALOG_DATA) public columns: Object) {
        this.columnheaders = Object.keys(this.columns);
        this.treeFlattener = new MatTreeFlattener(this.transformer, this._getLevel,
            this._isExpandable, this._getChildren);

        this.columnheaders.forEach((header, index) => {
            this.treeControl[header] = new FlatTreeControl<ColFlatNode>(this._getLevel, this._isExpandable);
            this.treebuild[header] = new MatTreeFlatDataSource(this.treeControl[header], this.treeFlattener);
            this.treebuild[header].selected = false;
            this.treebuild[header].data = this.buildObjectTree(JSON.parse(JSON.stringify(this.columns[header])), 0);
        });
    }

    ngOnDestroy(): void {
        this.comopnentDestroyed.next(true);
        this.comopnentDestroyed.complete();
    }

    buildObjectTree(obj: { [key: string]: any }, level: number): ColNode[] {
        if (!obj || typeof obj !== "object") {
            return [];
        } else {
            return Object.keys(obj).reduce<ColNode[]>((accumulator, key) => {
                const value = obj[key];
                const node = new ColNode();
                node.nodename = key;
                node.selected = false;

                if (value != null) {
                    if (typeof value === "object") {
                        node.children = this.buildObjectTree(value, level + 1);
                    } else {
                        node.nodevalue = value;
                    }
                }

                return accumulator.concat(node);
            }, []);
        }
    }

    /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
    togglenodeselection(node: ColFlatNode, header): void {
        this.checkAllParentsSelection(node, header);
    }

    /* Checks all the parents when a leaf node is selected/unselected */
    checkAllParentsSelection(node: ColFlatNode, header): void {
        let parent: ColFlatNode | null = this.getParentNode(node, header);
        while (parent) {
            this.checkRootNodeSelection(parent, header);
            parent = this.getParentNode(parent, header);
        }
    }

    /** Check root node checked state and change it accordingly */
    checkRootNodeSelection(node: ColFlatNode, header): void {
        const nodeSelected = this.treeControl[header].selected;
        const descendants = this.treeControl[header].getDescendants(node);
        const descAllSelected = descendants.every(child =>
            child.selected
        );
        if (nodeSelected && !descAllSelected) {
            this.treeControl[header].selected = !this.treeControl[header].selected;

        } else if (!nodeSelected && descAllSelected) {

        }
        this.treeControl[header].selected = !this.treeControl[header].selected;

    }

    /* Get the parent node of a node */
    getParentNode(node: ColFlatNode, header): ColFlatNode | null {
        const currentLevel = this.getLevel(node);
        if (currentLevel < 1) {
            return null;
        }

        const startIndex = this.treeControl[header].dataNodes.indexOf(node) - 1;

        for (let i = startIndex; i >= 0; i--) {
            const currentNode = this.treeControl[header].dataNodes[i];

            if (this.getLevel(currentNode) < currentLevel) {
                return currentNode;
            }
        }
        return null;
    }

    getLevel = (node: ColFlatNode) => node.level;


    descendantsAllSelected(node: ColFlatNode, header): boolean {
        const descendants = this.treeControl[header].getDescendants(node);
        const descAllSelected = descendants.every(child =>
            child.selected
        );
        return descAllSelected;
    }

    /** Whether part of the descendants are selected */
    descendantsPartiallySelected(node: ColFlatNode, header): boolean {
        const descendants = this.treeControl[header].getDescendants(node);
        const result = descendants.some(child => child.selected);
        return result && !this.descendantsAllSelected(node, header);
    }

    transformer = (node: ColNode, level: number) => {
        return new ColFlatNode(!!node.children, node.nodename, level, node.nodevalue);
    };

    hasChild = (_: number, _nodeData: ColFlatNode) => _nodeData.expandable;

    ngOnInit() {
    }

    showresult() {
        console.log(this.treebuild);
    }

    private _getLevel = (node: ColFlatNode) => node.level;

    private _isExpandable = (node: ColFlatNode) => node.expandable;

    private _getChildren = (node: ColNode): Observable<ColNode[]> => observableOf(node.children);

}
