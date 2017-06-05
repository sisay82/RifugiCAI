import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { CoreModule } from '../core/core.module';

import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';
import { ShelterListModule } from './shelterList/shelterList.module';
import { ShelterMapModule } from './shelterMap/shelterMap.module';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        BrowserModule,
        CoreModule,
        ShelterListModule,
        ShelterMapModule,
        FormsModule,
        AppRoutingModule,
    ],
    providers: [],
    declarations: [AppComponent],
    bootstrap: [AppComponent]
})
export class AppModule { }