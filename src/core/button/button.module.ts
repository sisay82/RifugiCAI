import { NgModule } from '@angular/core';
import { BcButton } from './button.component'
import {CommonModule} from '@angular/common';

@NgModule({
    imports:[CommonModule],
    exports:[BcButton],
    declarations:[BcButton]
})
export class BcButtonModule{
    
}