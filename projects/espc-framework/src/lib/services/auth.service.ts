import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, ReplaySubject} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {JwtHelperService} from '@auth0/angular-jwt';
import {SessionStorage} from 'ngx-webstorage';
import {LoginRequest} from '../model/LoginRequest';

import {LoginResponse} from '../model/LoginResponse';
import {take, tap} from 'rxjs/operators';
import {ConfigService} from './config.service';
import {Identity} from '../model/Identity';


@Injectable({
    providedIn: 'root'
})

export class AuthService implements CanActivate {

    @SessionStorage('jwt_token')
    JwtToken: string;

    @SessionStorage('jwt_refresh_token')
    RefreshToken: string;


    private decoded: any;

    private base: string;

    private userId: number;

    UserSubject: ReplaySubject<Identity> = new ReplaySubject<Identity>(1);

    constructor(
        private jwt: JwtHelperService,
        private router: Router,
        private config: ConfigService,
        private http: HttpClient) {

        /** check the jwt token adn reload user details if we're valid */
        this.decoded = this.jwt.decodeToken(this.JwtToken);

        config.config.pipe(take(1)).subscribe((c) => {
            this.base = c.api.auth_service;
            this.init();
        });
    }

    private init(): void {
        if (this.decoded && !this.jwt.isTokenExpired(this.JwtToken)) {
            this.userId = +(this.decoded.nameid);
            this.getMe();
        }

    }


    authenticate(request: LoginRequest, errorCallback) {
        this.http.post(this.base + 'api/login', request).subscribe((o: LoginResponse) => {
            this.JwtToken = o.accessToken;
            this.decoded = this.jwt.decodeToken(this.JwtToken);
            this.RefreshToken = o.refreshToken;
            this.userId = o.userId;
            this.getMe();
        }, errorCallback);
    }

    logout(): void {
        this.JwtToken = null;
        this.UserSubject.next(null);
    }


    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        const decodedToken = this.jwt.decodeToken(this.JwtToken);
        const isExpired = this.jwt.isTokenExpired(this.JwtToken);

        if (isExpired) {
            this.router.navigate(['/auth/login']);
        }
        return !isExpired;
    }

    getClaim(claim: string) : string {
        return this.decoded.claim;
    }

    claimExists(claimName: string, claimValue: string): boolean {
        const claimData = this.getClaim(claimName);
        if (claimData === undefined || claimData === null) { return false; }
        if (Array.isArray(claimData) && claimData.includes(claimValue)) { return true; }
        if (claimData === claimValue) { return true; }
        return false;
    }

    hasRole(role: string): boolean {
        const decodedToken = this.decoded; // this.jwt.decodeToken(this.JwtToken);
        return decodedToken && decodedToken['role'] && decodedToken['role'].find(i => i === role);
    }

    CurrentUser(): Observable<Identity> {
        return this.UserSubject.asObservable();
    }


    public updateMe(me: Identity): any {
        return this.http.put(`${this.base}api/users/${me.userId}`, me).pipe(tap(id => this.UserSubject.next(me)));
    }

    private getMe(): any {
        return this.http.get(this.base+ 'api/users/' + this.userId).subscribe((i: Identity) => {
            this.UserSubject.next(i);
        });
    }


}
