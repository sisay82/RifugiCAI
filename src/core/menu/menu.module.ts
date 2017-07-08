import { NgModule, } from '@angular/core';
import {BrowserAnimationsModule}from '@angular/platform-browser/animations';
import { BcMenu } from './menu.component';
import { BcMenuLayerModule } from './menu-layer.module'
import { CommonModule } from '@angular/common';
import {BcIconModule} from '../icon/icon.module';

@NgModule({
    imports:[BcIconModule,BcMenuLayerModule,CommonModule,BrowserAnimationsModule],
    declarations: [BcMenu],
    exports: [BcMenu,BcMenuLayerModule,CommonModule,BrowserAnimationsModule]
})
export class BcMenuModule {
 
 }
