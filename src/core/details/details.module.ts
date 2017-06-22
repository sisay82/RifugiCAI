import { NgModule } from '@angular/core';
import { DetailsRoutingModule } from './details-routing.module';
import { BcGeoModule } from './geographics/geo.module';
import { BcServModule } from './services/serv.module';
import { BcContactModule } from './contacts/contact.module';
import { BcDetails } from "./details.component";
import { RouterModule, Routes } from '@angular/router';
import { BcManageModule } from "./management/manage.module";
import { BcCadastralModule } from "./cadastral/cad.module";
import { HttpModule } from '@angular/http';

@NgModule({
    imports: [HttpModule,RouterModule,BcGeoModule,BcServModule,BcContactModule,BcCadastralModule,BcManageModule],
    declarations:[BcDetails],
    exports: [BcGeoModule,BcDetails]
})
export class BcDetailsModule { }
