import { NgModule, } from '@angular/core';
import {BrowserAnimationsModule}from '@angular/platform-browser/animations';
import { BcMenu } from './menu.component';
import { CommonModule } from '@angular/common';
import {BcIconModule} from '../icon/icon.module';
import { BcListModule } from '../list/list.module';

@NgModule({
    imports:[BcListModule,BcIconModule,CommonModule,BrowserAnimationsModule],
    declarations: [BcMenu],
    exports: [BcMenu,CommonModule,BrowserAnimationsModule]
})
export class BcMenuModule {
 
 }
