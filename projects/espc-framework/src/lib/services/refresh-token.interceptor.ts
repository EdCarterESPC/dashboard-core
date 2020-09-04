import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse,
    HttpClient
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of, ReplaySubject} from 'rxjs';
import {catchError, take, tap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {ConfigService} from './config.service';
import {SessionStorage} from 'ngx-webstorage';


@Injectable()
export class RefreshTokenInterceptor implements HttpInterceptor {

    @SessionStorage('jwt_refresh_token')
    refreshToken: string;

    private refreshUrl: string;

    private refreshTokenInProgress = false;

    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private router: Router, private config: ConfigService, private http: HttpClient) {
        config.config.pipe(take(1)).subscribe((c) => {
            this.refreshUrl = c.api.auth_service + 'api/refresh';
        });
    }

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(tap(o => {
        }), catchError((err) => {
            switch (err.status) {
                case 500:
                    // TODO global 500 error handling eg to an error page
                    break;
                case 400:
                case 401:
                case 403:
                    if (!this.partOfAuth(request.url)) {
                        if (this.refreshTokenInProgress) {
                            // return this.refreshTokenSubject
                            //     .filter(result => result !== null)
                            //     .take(1)
                            //     .switchMap(() => of(err)).asObservable();
                        }
                        else {
                            console.log('REFRESH INIT FOR ', request);
                            this.refreshTokenInProgress = true;
                            this.http.get(this.refreshUrl + '?token=' + this.refreshToken).subscribe((i) => {
                                this.refreshTokenInProgress = false;
                                console.log('REFRESH', i);
                            });
                        }
                    }
                    break;
            }
            return of(err);
        }));
    }

    private partOfAuth(url: string): boolean {
        return (/\/api\/login/.test(url) || /\/api\/refresh/.test(url));
    }


}
