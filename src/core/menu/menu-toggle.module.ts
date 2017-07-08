import { NgModule, } from '@angular/core';
import { BcMenuToggle } from './menu-toggle.component';
import { CommonModule } from '@angular/common';
import {BcIconModule} from '../icon/icon.module';

@NgModule({
    imports:[BcIconModule,CommonModule],
    declarations: [BcMenuToggle],
    exports: [BcMenuToggle,CommonModule]
})
export class BcMenuToggleModule {
 
 }
