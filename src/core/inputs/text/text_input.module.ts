import { NgModule } from '@angular/core';
import { BcTextInput, BcTextInputErrorStyler, BcTextInputSingleLineDirective } from './text_input.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from "@angular/forms";
@NgModule({
    exports: [BcTextInput, BcTextInputErrorStyler, BcTextInputSingleLineDirective],
    declarations: [BcTextInput, BcTextInputErrorStyler, BcTextInputSingleLineDirective],
    imports: [CommonModule, ReactiveFormsModule]
})
export class BcTextInputModule {

}
