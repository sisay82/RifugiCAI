import { NgModule } from '@angular/core';
import { BcMaskRevision,BcDisableStyler } from './mask-revision.component';
import { CommonModule } from '@angular/common';
import { BcDividerModule } from '../../divider/divider.module';
import { FormsModule } from '@angular/forms';
import {ReactiveFormsModule} from "@angular/forms"; 
import {BcIconModule} from '../../icon/icon.module';
import {BcTextInputModule} from '../../inputs/text/text_input.module';
import {BcSelectInputModule} from '../../inputs/select/select_input.module';
import {BcTooltipModule} from '../../tooltip/tooltip.module';

@NgModule({
    exports: [BcMaskRevision,BcDisableStyler],
    declarations: [BcMaskRevision,BcDisableStyler],
    imports:[BcSelectInputModule,BcTooltipModule,BcTextInputModule,BcIconModule,CommonModule,BcDividerModule,FormsModule,ReactiveFormsModule]
})
export class BcMaskRevisionModule{

}