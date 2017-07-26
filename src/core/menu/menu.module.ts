import { NgModule, } from '@angular/core';
import {BrowserAnimationsModule}from '@angular/platform-browser/animations';
import { BcMenu,BcMenuElementStyler} from './menu.component';
import { CommonModule } from '@angular/common';
import {BcIconModule} from '../icon/icon.module';
import { BcListModule } from '../list/list.module';
import {RouterModule } from '@angular/router';

@NgModule({
    imports:[RouterModule,BcListModule,BcIconModule,CommonModule,BrowserAnimationsModule],
    declarations: [BcMenu,BcMenuElementStyler],
    exports: [BcMenu,CommonModule,BrowserAnimationsModule,BcMenuElementStyler]
})
export class BcMenuModule {
 
 }
