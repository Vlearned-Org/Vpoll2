import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AppConfig } from '../api/appconfig';

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    config: AppConfig = {
        theme: 'lara-light-indigo',
        dark: false,
        inputStyle: 'outlined',
        ripple: true,
    };

    private configUpdate = new Subject<AppConfig>();

    configUpdate$ = this.configUpdate.asObservable();

    updateConfig(config: AppConfig) {
        this.config = config;
        this.configUpdate.next(config);
    }

    getConfig() {
        return this.config;
    }
}
