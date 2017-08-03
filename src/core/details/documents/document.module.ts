import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcDoc,FormatSizePipe } from './document.component';
import { CommonModule } from '@angular/common';
import { BcFileInputModule } from '../../inputs/file/file_input.module';
import {BcIconModule} from '../../icon/icon.module';
import {BcButtonModule} from '../../button/button.module';

@NgModule({
    declarations: [BcDoc,FormatSizePipe],
    exports: [BcDoc,FormatSizePipe],
    imports:[BcIconModule,BcDividerModule,CommonModule,BcFileInputModule,BcButtonModule]
})
export class BcDocModule {
        
}
