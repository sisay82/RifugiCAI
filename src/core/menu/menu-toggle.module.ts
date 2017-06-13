import { NgModule, } from '@angular/core';

import { BcMenuToggle } from './menu-toggle.component';

import { CommonModule } from '@angular/common';

@NgModule({
    imports:[CommonModule],
    declarations: [BcMenuToggle],
    exports: [BcMenuToggle,CommonModule]
})
export class BcMenuToggleModule {
 
 }
