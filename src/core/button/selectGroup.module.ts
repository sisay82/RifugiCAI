import { NgModule } from '@angular/core';
import { BcSelectGroup } from './selectGroup.component'
import {CommonModule} from '@angular/common';
import { BcButtonModule } from './button.module';
@NgModule({
    imports:[CommonModule,BcButtonModule],
    exports:[BcSelectGroup,BcButtonModule],
    declarations:[BcSelectGroup]
})
export class BcSelectGroupModule{
    
}