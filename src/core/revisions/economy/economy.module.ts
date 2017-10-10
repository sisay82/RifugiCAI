import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcEconomyRevision,BcActiveTabStyler,BcDisableDivStyler } from './economy.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ReactiveFormsModule} from "@angular/forms"; 
import {BcButtonModule} from '../../button/button.module';
import {BcIconModule} from '../../icon/icon.module';
import {BcTextInputModule} from '../../inputs/text/text_input.module';
import {BcCheckboxInputModule} from '../../inputs/checkbox/checkbox_input.module';
import {BcSelectInputModule} from '../../inputs/select/select_input.module';
import { PipesModule } from '../../pipes/pipes.module';
import {BcListModule} from '../../list/list.module';

@NgModule({
    declarations: [BcEconomyRevision,BcActiveTabStyler,BcDisableDivStyler],
    exports: [BcEconomyRevision,BcActiveTabStyler,BcDisableDivStyler],
    imports:[PipesModule,BcCheckboxInputModule,BcListModule,BcIconModule,BcTextInputModule,BcSelectInputModule,BcDividerModule,CommonModule,FormsModule,ReactiveFormsModule,BcButtonModule]
})
export class BcEconomyRevisionModule { }
