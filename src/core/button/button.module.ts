import { NgModule } from '@angular/core';
import { BcButton,BcSelectButtonStyler } from './button.component'
import {CommonModule} from '@angular/common';
import { BcIconModule } from '../icon/icon.module';

@NgModule({
    imports:[CommonModule,BcIconModule],
    exports:[BcButton,BcSelectButtonStyler],
    declarations:[BcButton,BcSelectButtonStyler]
})
export class BcButtonModule{
    
}