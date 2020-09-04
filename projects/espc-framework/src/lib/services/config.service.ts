import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as _ from 'lodash';

@Injectable({
    providedIn: 'root'
})
export class ConfigOptions {
    version: string;
    config: any;
}

@Injectable({
    providedIn: 'root'
})
export class ConfigService
{
    // Private
    private _configSubject: BehaviorSubject<any>;
    private readonly _defaultConfig: any;

    /**
     * Constructor
     *
     * @param options
     */
    constructor(private options: ConfigOptions)
    {
        // Set the default config from the user provided config (from forRoot)
        this._defaultConfig = options;

        // Initialize the subscription for the service
        this._configSubject = new BehaviorSubject(_.cloneDeep(this._defaultConfig.config));

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Set and get the config
     */
    set config(value)
    {
        // Get the value from the behavior subject
        let config = this._configSubject.getValue();

        // Merge the new config
        config = _.merge({}, config, value);

        // Notify the observers
        this._configSubject.next(config);
    }

    get config(): any | Observable<any>
    {
        return this._configSubject.asObservable();
    }

}

