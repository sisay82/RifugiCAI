import { NgModule } from '@angular/core';
import { BcContributionRevision } from './contributions.component';
import { CommonModule } from '@angular/common';
import { BcDividerModule} from '../../divider/divider.module';
import { FormsModule } from '@angular/forms';
import {ReactiveFormsModule} from "@angular/forms"; 
import {BcTextInputModule} from '../../inputs/text/text_input.module';
import { PipesModule } from '../../pipes/pipes.module';
import {BcListModule} from '../../list/list.module';
import {BcIconModule} from '../../icon/icon.module';
import {BcCheckboxInputModule} from '../../inputs/checkbox/checkbox_input.module';
import {BcSelectInputModule} from '../../inputs/select/select_input.module';
import {BcButtonModule} from '../../button/button.module';
import {BcTooltipModule} from '../../tooltip/tooltip.module';

@NgModule({
    declarations: [BcContributionRevision],
    exports: [BcContributionRevision],
    imports:[BcTextInputModule,BcTooltipModule,BcDividerModule,BcSelectInputModule,BcButtonModule,BcCheckboxInputModule,BcIconModule,BcListModule,PipesModule,CommonModule,FormsModule,ReactiveFormsModule]
})
export class BcContributionRevisionModule { }
