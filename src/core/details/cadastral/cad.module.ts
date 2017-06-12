import { NgModule } from '@angular/core';
import { BcDividerModule} from '../../divider/divider.module';
import { BcCadastral } from './cad.component';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [BcCadastral],
    exports: [BcCadastral],
    imports:[BcDividerModule,CommonModule]
})
export class BcCadastralModule { }
