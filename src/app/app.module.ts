import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { CoreModule } from '../core/core.module';

import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';
import { ShelterMapModule } from './shelter/shelterMap/shelterMap.module';
import { FormsModule } from '@angular/forms';
import { ShelterModule } from './shelter/shelterPage/shelter.module';
import { ShelterListModule } from './shelter/shelterList/shelterList.module';

@NgModule({
    imports: [
        BrowserModule,
        CoreModule,
        ShelterListModule,
        ShelterModule,
        ShelterMapModule,
        FormsModule,
        AppRoutingModule
    ],
    providers: [],
    declarations: [AppComponent],
    bootstrap: [AppComponent]
})
export class AppModule { }