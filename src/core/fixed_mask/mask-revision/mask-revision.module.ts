import { NgModule } from '@angular/core';
import { BcMaskRevision } from './mask-revision.component';
import { CommonModule } from '@angular/common';
import { BcDividerModule } from '../../divider/divider.module';
import { FormsModule } from '@angular/forms';
import {ReactiveFormsModule} from "@angular/forms"; 
import {BcIconModule} from '../../icon/icon.module';

@NgModule({
    exports: [BcMaskRevision],
    declarations: [BcMaskRevision],
    imports:[BcIconModule,CommonModule,BcDividerModule,FormsModule,ReactiveFormsModule]
})
export class BcMaskRevisionModule{

}