import {InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import {LoggerService} from './services/logger.service';
import {ConfigService, ConfigOptions} from './services/config.service';

export let FOR_ROOT_OPTIONS_TOKEN = new InjectionToken<ModuleOptions>('forRoot() ConfigService configuration');

@NgModule()
export class EspcFrameworkModule {

  static forRoot(options?: ModuleOptions): ModuleWithProviders<EspcFrameworkModule> {
    return {
      ngModule: EspcFrameworkModule,
      providers: [
        {provide: FOR_ROOT_OPTIONS_TOKEN, useValue: options},
        LoggerService,
        ConfigService,
        { provide: ConfigOptions, useFactory: provideConfigOptionsFromGenericObject, deps: [FOR_ROOT_OPTIONS_TOKEN]}
      ]
    };
  }
}

// empty type to allow for AOT compilation
export interface ModuleOptions {

}

export function provideConfigOptionsFromGenericObject(options?: any): ConfigOptions {
  const myServiceOptions = new ConfigOptions();
  myServiceOptions.version = '0.0.1';
  myServiceOptions.config = options;

  return (myServiceOptions);
}


