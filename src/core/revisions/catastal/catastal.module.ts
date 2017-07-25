import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcCatastalRevision } from './catastal.component';
import { BcMapModule } from '../../map/map.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ReactiveFormsModule} from "@angular/forms"; 
import {BcButtonModule} from '../../button/button.module';
import {BcTextInputModule} from '../../inputs/text/text_input.module';

@NgModule({
    declarations: [BcCatastalRevision],
    exports: [BcCatastalRevision],
    imports:[BcTextInputModule,BcDividerModule,BcMapModule,CommonModule,FormsModule,ReactiveFormsModule,BcButtonModule]
})
export class BcCatastalRevisionModule { }
