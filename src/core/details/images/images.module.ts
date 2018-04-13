import { NgModule } from '@angular/core';
import { BcDividerModule } from '../../divider/divider.module';
import { BcImg, BcResizeImgStyler } from './images.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BcFileInputModule } from '../../inputs/file/file_input.module';
import { ReactiveFormsModule } from "@angular/forms";
import { BcIconModule } from '../../icon/icon.module';
import { BcButtonModule } from '../../button/button.module';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
    declarations: [BcImg, BcResizeImgStyler],
    exports: [BcImg, BcResizeImgStyler],
    imports: [BcIconModule, BcDividerModule, CommonModule, FormsModule, ReactiveFormsModule, BcFileInputModule, BcButtonModule, PipesModule]
})
export class BcImgModule {

}
