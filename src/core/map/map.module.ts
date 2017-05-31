import { NgModule } from '@angular/core';
import { BcMap } from './map.component';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';

@NgModule({
    imports:[CommonModule,HttpModule],
    declarations:[BcMap],
    exports:[BcMap]
})
export class BcMapModule{

}