import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { CoreModule } from '../core/core.module';

import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';
import { ShelterListModule } from './shelterList/shelterList.module';
import { BcMenuToggleModule } from '../core/menu/menu-toggle.module'

@NgModule({
    imports: [
        BrowserModule,
        CoreModule,
        ShelterListModule,
        AppRoutingModule,
        BcMenuToggleModule
    ],
    providers: [],
    declarations: [AppComponent],
    bootstrap: [AppComponent]
})
export class AppModule { }