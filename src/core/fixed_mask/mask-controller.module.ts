import { NgModule } from '@angular/core';
import { BcMaskController } from './mask-controller.component';
import { BcMaskDetailModule  } from './mask-detail/mask-detail.module';
import { BcMaskRevisionModule } from './mask-revision/mask-revision.module';
import { CommonModule } from '@angular/common';
@NgModule({
    exports: [BcMaskController],
    declarations: [BcMaskController],
    imports:[CommonModule,BcMaskDetailModule,BcMaskRevisionModule]
})
export class BcMaskControllerModule{

}