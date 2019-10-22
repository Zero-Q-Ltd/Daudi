import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog, MatSnackBar, MatTreeNestedDataSource } from "@angular/material";
import { FormControl } from "@angular/forms";
import { NestedTreeControl } from "@angular/cdk/tree";
import { emptyorder } from "../../models/Order";
import { emptytruck } from "../../models/Truck";
import { ColNode } from "../../models/ColNode";
import { ReplaySubject } from "rxjs";


@Component({
  selector: "app-archive",
  templateUrl: "./archive.component.html",
  styleUrls: ["./archive.component.scss"]
})
export class ArchiveComponent implements OnInit, OnDestroy {
  position = "above";

  minDate = new Date(2017, 8, 26);
  maxDate = new Date();

  date = new FormControl(new Date());
  searchinit: boolean = false;

  dataobject = {};
  treeControl = new NestedTreeControl<ColNode>(node => node.children);
  treedataSource = new MatTreeNestedDataSource<ColNode>();
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  constructor(private dialog: MatDialog,
    private snackBar: MatSnackBar) {
    this.changedatamodel(0);
  }

  initvalues() {
    this.treedataSource.data = this.buildObjectTree(this.dataobject, 0);
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
            node.searchvalue = value;
          }
        }
        return accumulator.concat(node);
      }, []);
    }
  }

  hasChild = (_: number, node: ColNode) => !!node.children && node.children.length > 0;

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.comopnentDestroyed.complete();
  }

  toggleselection() {

  }

  changedatamodel(index: number) {
    switch (index) {
      case 0:
        this.dataobject = { ...emptyorder };
        this.initvalues();
        break;
      case 1:
        this.dataobject = { ...emptytruck };
        this.initvalues();
        break;
    }
  }

  search() {
    console.log(this.treeControl);
    console.log(this.treedataSource);

    this.searchinit = false;

    setTimeout(() => {
      this.searchinit = true;
      return;
    }, 700);
  }

}
