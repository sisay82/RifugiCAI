import { NgModule } from '@angular/core';
import { BcCheckboxInput} from './checkbox_input.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ReactiveFormsModule} from "@angular/forms"; 
@NgModule({
    exports: [BcCheckboxInput],
    declarations: [BcCheckboxInput],
    imports:[CommonModule,ReactiveFormsModule]
})
export class BcCheckboxInputModule{

}