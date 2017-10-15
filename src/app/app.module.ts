import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';

import { CoreModule } from '../core/core.module';

import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';
import { ShelterListModule } from './shelter/shelterList/shelterList.module';
import { ShelteMapModule } from './shelter/shelterMap/shelterMap.module';

@NgModule({
    imports: [
        BrowserModule,
        CoreModule,
        ShelterListModule,
        ShelteMapModule,
        AppRoutingModule,
        HttpModule
    ],
    providers: [],
    declarations: [AppComponent],
    bootstrap: [AppComponent]
})
export class AppModule { }