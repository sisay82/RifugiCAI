import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcContactsRevision } from './contacts.component';
import { BcMapModule } from '../../map/map.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ReactiveFormsModule} from "@angular/forms"; 
import {BcButtonModule} from '../../button/button.module';
import {BcIconModule} from '../../icon/icon.module';
import {BcTextInputModule} from '../../inputs/text/text_input.module';

@NgModule({
    declarations: [BcContactsRevision],
    exports: [BcContactsRevision],
    imports:[BcTextInputModule,BcIconModule,BcDividerModule,BcMapModule,CommonModule,FormsModule,ReactiveFormsModule,BcButtonModule]
})
export class BcContactsRevisionModule { }
