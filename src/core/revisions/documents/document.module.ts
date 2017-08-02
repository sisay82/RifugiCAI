import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcDocRevision,FormatSizePipe } from './document.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BcFileInputModule } from '../../inputs/file/file_input.module';
import {ReactiveFormsModule} from "@angular/forms"; 
import {BcIconModule} from '../../icon/icon.module';
import {BcButtonModule} from '../../button/button.module';

@NgModule({
    declarations: [BcDocRevision,FormatSizePipe],
    exports: [BcDocRevision,FormatSizePipe],
    imports:[BcIconModule,BcDividerModule,CommonModule,FormsModule,ReactiveFormsModule,BcFileInputModule,BcButtonModule]
})
export class BcDocRevisionModule {
        
}
