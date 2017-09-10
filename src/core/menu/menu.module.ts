import { NgModule, } from '@angular/core';
import {BrowserAnimationsModule}from '@angular/platform-browser/animations';
import { BcMenu,BcMenuElementStyler,BcDisabledMenuElementStyler } from './menu.component';
import { CommonModule } from '@angular/common';
import {BcIconModule} from '../icon/icon.module';
import { BcListModule } from '../list/list.module';
import {RouterModule } from '@angular/router';

@NgModule({
    imports:[RouterModule,BcListModule,BcIconModule,CommonModule,BrowserAnimationsModule],
    declarations: [BcMenu,BcMenuElementStyler,BcDisabledMenuElementStyler],
    exports: [BcMenu,CommonModule,BrowserAnimationsModule,BcMenuElementStyler,BcDisabledMenuElementStyler]
})
export class BcMenuModule {
 
 }
