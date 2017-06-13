import { NgModule, } from '@angular/core';
import {BrowserAnimationsModule}from '@angular/platform-browser/animations';

import { BcMenuToggle } from './menu-toggle.component';
import { BcMenu } from './menu.component';
import { BcMenuLayerModule } from './menu-layer.module'

import { CommonModule } from '@angular/common';

@NgModule({
    imports:[BcMenuLayerModule,CommonModule,BrowserAnimationsModule],
    declarations: [BcMenu,BcMenuToggle],
    exports: [BcMenu,BcMenuToggle,BcMenuLayerModule,CommonModule,BrowserAnimationsModule]
})
export class BcMenuModule {
 
 }
