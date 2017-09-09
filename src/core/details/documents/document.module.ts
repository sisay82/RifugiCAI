import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcDoc } from './document.component';
import { CommonModule } from '@angular/common';
import { BcFileInputModule } from '../../inputs/file/file_input.module';
import {BcIconModule} from '../../icon/icon.module';
import {BcButtonModule} from '../../button/button.module';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
    declarations: [BcDoc],
    exports: [BcDoc],
    imports:[BcIconModule,BcDividerModule,CommonModule,BcFileInputModule,BcButtonModule,PipesModule]
})
export class BcDocModule {
        
}
