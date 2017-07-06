import { NgModule } from '@angular/core';
import { BcMaskRevision } from './mask-revision.component';
import { CommonModule } from '@angular/common';
import { BcDividerModule } from '../../divider/divider.module';
@NgModule({
    exports: [BcMaskRevision],
    declarations: [BcMaskRevision],
    imports:[CommonModule,BcDividerModule]
})
export class BcMaskRevisionModule{

}