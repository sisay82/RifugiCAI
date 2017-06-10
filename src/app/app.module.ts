import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { CoreModule } from '../core/core.module';

import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';
import { ShelterListModule } from './shelterList/shelterList.module';

@NgModule({
    imports: [
        BrowserModule,
        CoreModule,
        ShelterListModule,
      /*  AppRoutingModule,*/
    ],
    providers: [],
    declarations: [AppComponent],
    bootstrap: [AppComponent]
})
export class AppModule { }