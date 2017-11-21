import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { CoreModule } from '../core/core.module';

import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';
import { ShelterMapModule } from './shelter/shelterMap/shelterMap.module';
import { FormsModule } from '@angular/forms';
import { ShelterModule } from './shelter/shelterPage/shelter.module';
import { ShelterListModule } from './shelter/shelterList/shelterList.module';
import { BcSharedService } from './shared/shared.service';
import { PageNotFoundModule } from "./pageNotFound/pageNotFound.module";
import { BcAccessDeniedModule } from './accessDenied/access-denied.module';

@NgModule({
    imports: [
        CoreModule,
        BrowserModule,
        ShelterListModule,
        ShelterModule,
        ShelterMapModule,
        FormsModule,
        PageNotFoundModule,
        AppRoutingModule,
        BcAccessDeniedModule
    ],
    providers: [BcSharedService],
    declarations: [AppComponent],
    bootstrap: [AppComponent]
})
export class AppModule { }