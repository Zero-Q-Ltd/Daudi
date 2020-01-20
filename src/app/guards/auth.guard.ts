import {map, take, tap} from "rxjs/operators";
import {Injectable} from "@angular/core";
import {CanActivate, CanActivateChild, Router} from "@angular/router";
import {AngularFireAuth} from "@angular/fire/auth";
import {Observable} from "rxjs";


@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {
    public loader = true;

    constructor(private router: Router, private af: AngularFireAuth) {

    }

    canActivate(): Observable<boolean> {
        this.loader = true;
        return this.af.authState.pipe(
            take(1),
            map(authState => !!authState),
            tap(authenticated => {
                this.loader = false;

                if (!authenticated) {
                    this.router.navigate(["/admin/login"]);
                    return false;
                } else {
                    return true;
                }

            }));
    }

    canActivateChild(): Observable<boolean> {
        this.loader = true;
        return this.af.authState.pipe(
            take(1),
            map(authState => !!authState),
            tap(authenticated => {
                this.loader = false;

                if (!authenticated) {
                    this.router.navigate(["/admin/login"]);
                }
            }));
    }
}
