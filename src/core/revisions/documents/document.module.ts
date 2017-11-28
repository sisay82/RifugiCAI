import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcDocRevision,BcDisableDivStyler } from './document.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BcFileInputModule } from '../../inputs/file/file_input.module';
import { BcTextInputModule } from '../../inputs/text/text_input.module';
import { BcSelectInputModule } from '../../inputs/select/select_input.module';
import {ReactiveFormsModule} from "@angular/forms"; 
import {BcIconModule} from '../../icon/icon.module';
import {BcButtonModule} from '../../button/button.module';
import { PipesModule } from '../../pipes/pipes.module';
import {BcTooltipModule} from '../../tooltip/tooltip.module';

@NgModule({
    declarations: [BcDocRevision,BcDisableDivStyler],
    exports: [BcDocRevision,BcDisableDivStyler],
    imports:[BcIconModule,BcTooltipModule,BcDividerModule,BcTextInputModule,BcSelectInputModule,CommonModule,FormsModule,ReactiveFormsModule,BcFileInputModule,BcButtonModule,PipesModule]
})
export class BcDocRevisionModule {
        
}
