import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcGeoRevision, KeysPipe } from './geo.component';
import { BcMapModule } from '../../map/map.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ReactiveFormsModule} from "@angular/forms"; 
import {BcButtonModule} from '../../button/button.module'
@NgModule({
    declarations: [BcGeoRevision,KeysPipe],
    exports: [BcGeoRevision],
    imports:[BcDividerModule,BcMapModule,CommonModule,FormsModule,ReactiveFormsModule,BcButtonModule]
})
export class BcGeoRevisionModule { }