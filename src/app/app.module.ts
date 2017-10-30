import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';

import { CoreModule } from '../core/core.module';

import { AppComponent } from './app.component';

import { AppRoutingModule } from './app-routing.module';
import { ShelterModule } from './shelter/shelterPage/shelter.module';
import { ShelterListModule } from './shelter/shelterList/shelterList.module';
import { BcSharedService } from './shared/shared.service';
import { PageNotFoundModule } from "./pageNotFound/pageNotFound.module";

@NgModule({
    imports: [
        CoreModule,
        BrowserModule,
        ShelterListModule,
        ShelterModule,
        PageNotFoundModule,
        AppRoutingModule
    ],
    providers: [BcSharedService],
    declarations: [AppComponent],
    bootstrap: [AppComponent]
})
export class AppModule { }