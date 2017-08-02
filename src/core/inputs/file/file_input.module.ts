import { NgModule } from '@angular/core';
import { BcFileInput, BcFileInputErrorStyler } from './file_input.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ReactiveFormsModule} from "@angular/forms"; 

@NgModule({
    exports: [BcFileInput,BcFileInputErrorStyler],
    declarations: [BcFileInput,BcFileInputErrorStyler],
    imports:[CommonModule,ReactiveFormsModule]
})
export class BcFileInputModule{

}