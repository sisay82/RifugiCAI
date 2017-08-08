import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcImgRevision,FormatSizePipe } from './images.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BcFileInputModule } from '../../inputs/file/file_input.module';
import { BcTextInputModule } from '../../inputs/text/text_input.module';
import {ReactiveFormsModule} from "@angular/forms"; 
import {BcIconModule} from '../../icon/icon.module';
import {BcButtonModule} from '../../button/button.module';

@NgModule({
    declarations: [BcImgRevision,FormatSizePipe],
    exports: [BcImgRevision,FormatSizePipe],
    imports:[BcIconModule,BcTextInputModule,BcDividerModule,CommonModule,FormsModule,ReactiveFormsModule,BcFileInputModule,BcButtonModule]
})
export class BcImgRevisionModule {
        
}
