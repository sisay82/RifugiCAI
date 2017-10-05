import { NgModule } from '@angular/core';
import { BcContributionRevision } from './contributions.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ReactiveFormsModule} from "@angular/forms"; 
import {BcTextInputModule} from '../../inputs/text/text_input.module';

@NgModule({
    declarations: [BcContributionRevision],
    exports: [BcContributionRevision],
    imports:[BcTextInputModule,CommonModule,FormsModule,ReactiveFormsModule]
})
export class BcContributionRevisionModule { }
