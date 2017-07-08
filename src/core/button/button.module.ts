import { NgModule } from '@angular/core';
import { BcButton } from './button.component'
import {CommonModule} from '@angular/common';
import {BcIconModule} from '../icon/icon.module';

@NgModule({
    imports:[BcIconModule,CommonModule],
    exports:[BcButton],
    declarations:[BcButton]
})
export class BcButtonModule{
    
}