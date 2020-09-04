import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import * as _ from 'lodash';

import {NavigationEnd, NavigationStart, Router} from '@angular/router';
import {filter} from 'rxjs/operators';
import {NavigationEvent} from '../model/NavigationEvent';
import {NavigationItem} from '../model/NavigationItem';

@Injectable({
    providedIn: 'root'
})
export class NavigationService {
    onItemCollapsed: Subject<any>;
    onItemCollapseToggled: Subject<any>;

    onNavigation: Subject<NavigationEvent>;

    // Private
    private _onNavContentChanged: BehaviorSubject<any>;
    private _onNavItemAdded: BehaviorSubject<any>;
    private _onNavItemUpdated: BehaviorSubject<any>;
    private _onNavItemRemoved: BehaviorSubject<any>;
    private _onNavigationInvoked: BehaviorSubject<any>;
    private _onHeadlineChanged: BehaviorSubject<any>;
    private _currentNavigationKey: string;
    private _registry: { [key: string]: any } = {};

    /**
     *  CurrentNavigationTitle is the content of the header, when it's not a property address.
     */
    private _currentNavTitle: string;

    public get CurrentNavigationTitle(): string { return this._currentNavTitle; }
    public set CurrentNavigationTitle(ni: string) {
        this._currentNavTitle = ni;
        this._onHeadlineChanged.next(ni);
    }


    /**
     * Constructor
     */
    constructor(private router: Router) {
        // Set the defaults
        this.onItemCollapsed = new Subject();
        this.onItemCollapseToggled = new Subject();

        this.onNavigation = new Subject<NavigationEvent>();

        // Set the private defaults
        this._currentNavigationKey = null;
        this._onNavContentChanged = new BehaviorSubject(null);
        this._onNavItemAdded = new BehaviorSubject(null);
        this._onNavItemUpdated = new BehaviorSubject(null);
        this._onNavItemRemoved = new BehaviorSubject(null);
        this._onNavigationInvoked = new BehaviorSubject(null);
        this._onHeadlineChanged = new BehaviorSubject(null);
        this.router.events
            .pipe(filter(event => event instanceof NavigationStart ))
            .subscribe((event) => {
                // this is called when the router starts to navigate,
                // we can use it to clear any incidental chrome that's
                //this._currentNavTitle = '';
                //this._onHeadlineChanged.next(this._currentNavTitle);
            });

        this.router.events
            .pipe(filter(event => event instanceof NavigationEnd ))
            .subscribe((event) => {
                this._onNavigationInvoked.next(null);
            });

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get onHeadlineChanged
     *
     * @returns {Observable<any>}
     */
    get onHeadlineChanged(): Observable<any> {
        return this._onHeadlineChanged.asObservable();
    }

    /**
     * Get onNavigationInvoked
     *
     * @returns {Observable<any>}
     */
    get onNavigationInvoked(): Observable<any> {
        return this._onNavigationInvoked.asObservable();
    }

    /**
     * Get onNavigationChanged
     *
     * @returns {Observable<any>}
     */
    get onNavContentChanged(): Observable<any> {
        return this._onNavContentChanged.asObservable();
    }

    /**
     * Get onNavigationItemAdded
     *
     * @returns {Observable<any>}
     */
    get onNavItemAdded(): Observable<any> {
        return this._onNavItemAdded.asObservable();
    }

    /**
     * Get onNavigationItemUpdated
     *
     * @returns {Observable<any>}
     */
    get onNavItemUpdated(): Observable<any> {
        return this._onNavItemUpdated.asObservable();
    }

    /**
     * Get onNavigationItemRemoved
     *
     * @returns {Observable<any>}
     */
    get onNavItemRemoved(): Observable<any> {
        return this._onNavItemRemoved.asObservable();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register the given navigation
     * with the given key
     *
     * @param key
     * @param navigation
     */
    registerNavigation(key, navigation): void {
        // Check if the key already being used
        if (this._registry[key]) {
            console.error(`The navigation with the key '${key}' already exists. Either unregister it first or use a unique key.`);
            return;
        }

        // Add to the registry
        this._registry[key] = navigation;

        // Notify the subject
        // this._onNavContentRegistered.next([key, navigation]);
    }

    /**
     * Unregister the navigation from the registry
     * @param key
     */
    unregisterNavigation(key): void {
        // Check if the navigation exists
        if (!this._registry[key]) {
            console.warn(`The navigation with the key '${key}' doesn't exist in the registry.`);
        }

        // Unregister the sidebar
        delete this._registry[key];
    }

    /**
     * Get navigation from registry by key
     *
     * @param key
     * @returns {any}
     */
    getNavigation(key): any {
        // Check if the navigation exists
        if (!this._registry[key]) {
            console.warn(`The navigation with the key '${key}' doesn't exist in the registry.`);

            return;
        }

        // Return the sidebar
        return this._registry[key];
    }

    /**
     * Get flattened navigation array
     *
     * @param navigation
     * @param flatNavigation
     * @returns {any[]}
     */
    getFlatNavigation(navigation, flatNavigation: NavigationItem[] = []): any {
        for (const item of navigation) {
            if (item.type === 'item') {
                flatNavigation.push(item);

                continue;
            }

            if (item.type === 'collapsable' || item.type === 'group') {
                if (item.children) {
                    this.getFlatNavigation(item.children, flatNavigation);
                }
            }
        }

        return flatNavigation;
    }

    /**
     * Get navigation item by id from the
     * current navigation
     *
     * @param id
     * @param {any} navigation
     * @returns {any | boolean}
     */
    getNavigationItem(id, navigation = null): any | boolean {
        if (!navigation) {
            navigation = this.getCurrentNavigation();
        }

        for (const item of navigation) {
            if (item.id === id) {
                return item;
            }

            if (item.children) {
                const childItem = this.getNavigationItem(id, item.children);

                if (childItem) {
                    return childItem;
                }
            }
        }

        return false;
    }

    /**
     * Get the parent of the navigation item
     * with the id
     *
     * @param id
     * @param {any} navigation
     * @param parent
     */
    getNavigationItemParent(id, navigation = null, parent = null): any {
        if (!navigation) {
            navigation = this.getCurrentNavigation();
            parent = navigation;
        }

        for (const item of navigation) {
            if (item.id === id) {
                return parent;
            }

            if (item.children) {
                const childItem = this.getNavigationItemParent(id, item.children, item);

                if (childItem) {
                    return childItem;
                }
            }
        }

        return false;
    }



    /**
     * Get the current navigation
     *
     * @returns {any}
     */
    getCurrentNavigation(): any {
        if (!this._currentNavigationKey) {
            console.warn(`The current navigation is not set.`);
            return;
        }
        return this.getNavigation(this._currentNavigationKey);
    }

    /**
     * Set the navigation with the key
     * as the current navigation
     *
     * @param key
     */
    setCurrentNavigation(key): void {
        // Check if the sidebar exists
        if (!this._registry[key]) {
            console.warn(`The navigation with the key '${key}' doesn't exist in the registry.`);

            return;
        }

        // Set the current navigation key
        this._currentNavigationKey = key;

        // Notify the subject
        this._onNavContentChanged.next(key);
    }

    /**
     * Add a navigation item to the specified location
     *
     * @param item
     * @param id
     */
    addNavigationItem(item, id): void {
        // Get the current navigation
        const navigation: any[] = this.getCurrentNavigation();

        // Add to the end of the navigation
        if (id === 'end') {
            navigation.push(item);

            // Trigger the observable
            this._onNavItemAdded.next(true);

            return;
        }

        // Add to the start of the navigation
        if (id === 'start') {
            navigation.unshift(item);

            // Trigger the observable
            this._onNavItemAdded.next(true);

            return;
        }

        // Add it to a specific location
        const parent: any = this.getNavigationItem(id);

        if (parent) {
            // Check if parent has a children entry,
            // and add it if it doesn't
            if (!parent.children) {
                parent.children = [];
            }

            // Add the item
            parent.children.push(item);
        }

        // Trigger the observable
        this._onNavItemAdded.next(true);
    }

    /**
     * Update navigation item with the given id
     *
     * @param id
     * @param properties
     */
    updateNavigationItem(id, properties): void {
        // Get the navigation item
        const navigationItem = this.getNavigationItem(id);

        // If there is no navigation with the give id, return
        if (!navigationItem) {
            return;
        }

        console.log('merge', navigationItem, properties);
        // Merge the navigation properties
        _.merge(navigationItem, properties);

        // Trigger the observable
        this._onNavItemUpdated.next(true);
    }

    /**
     * Remove navigation item with the given id
     *
     * @param id
     */
    removeNavigationItem(id): void {
        const item = this.getNavigationItem(id);

        // Return, if there is not such an item
        if (!item) {
            return;
        }

        // Get the parent of the item
        let parent = this.getNavigationItemParent(id);

        // This check is required because of the first level
        // of the navigation, since the first level is not
        // inside the 'children' array
        parent = parent.children || parent;

        // Remove the item
        parent.splice(parent.indexOf(item), 1);

        // Trigger the observable
        this._onNavItemRemoved.next(true);
    }

}


