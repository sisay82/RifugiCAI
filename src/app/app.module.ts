import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { CoreModule } from '../core/core.module';

import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';
import { ShelterModule } from './shelter/shelterPage/shelter.module';
import { ShelterListModule } from './shelter/shelterList/shelterList.module';

@NgModule({
    imports: [
        BrowserModule,
        CoreModule,
        ShelterListModule,
        ShelterModule,
        AppRoutingModule,
    ],
    providers: [],
    declarations: [AppComponent],
    bootstrap: [AppComponent]
})
export class AppModule { }