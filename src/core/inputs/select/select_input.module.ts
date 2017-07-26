import { NgModule } from '@angular/core';
import { BcSelectInput} from './select_input.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ReactiveFormsModule} from "@angular/forms"; 
@NgModule({
    exports: [BcSelectInput],
    declarations: [BcSelectInput],
    imports:[CommonModule,ReactiveFormsModule]
})
export class BcSelectInputModule{

}