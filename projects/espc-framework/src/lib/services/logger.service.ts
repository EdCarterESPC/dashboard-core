import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LoggerService {

    constructor() {
    }

    info(message: string): void {
        console.log('I: ', message);
    }

    debug(message: string): void {
        console.log('D: ', message);
    }

    error(message: string): void {
        console.log('E: ', message);
    }

    warn(message: string): void {
        console.log('W: ', message);
    }
}
