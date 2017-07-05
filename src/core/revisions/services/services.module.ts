import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcServRevision } from './services.component';
import { BcMapModule } from '../../map/map.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ReactiveFormsModule} from "@angular/forms"; 
import {BcButtonModule} from '../../button/button.module'
import {BrowserAnimationsModule}from '@angular/platform-browser/animations';

@NgModule({
    declarations: [BcServRevision],
    exports: [BcServRevision,BrowserAnimationsModule],
    imports:[BrowserAnimationsModule,BcDividerModule,BcMapModule,CommonModule,FormsModule,ReactiveFormsModule,BcButtonModule]
})
export class BcServRevisionModule { }
