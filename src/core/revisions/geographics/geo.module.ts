import {
    NgModule
} from '@angular/core';
import {
    BcDividerModule
} from '../../divider/divider.module';
import {
    BcGeoRevisionComponent
} from './geo.component';
import {
    BcMapModule
} from '../../map/map.module';
import {
    CommonModule
} from '@angular/common';
import {
    FormsModule
} from '@angular/forms';
import {
    ReactiveFormsModule
} from "@angular/forms";
import {
    BcButtonModule
} from '../../button/button.module';
import {
    BcIconModule
} from '../../icon/icon.module';
import {
    BcTextInputModule
} from '../../inputs/text/text_input.module';
import {
    BcCheckboxInputModule
} from '../../inputs/checkbox/checkbox_input.module';
import {
    BcSelectInputModule
} from '../../inputs/select/select_input.module';

@NgModule({
    declarations: [BcGeoRevisionComponent],
    exports: [BcGeoRevisionComponent],
    imports: [
        BcCheckboxInputModule,
        BcIconModule,
        BcTextInputModule,
        BcSelectInputModule,
        BcDividerModule,
        BcMapModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        BcButtonModule
    ]
})
export class BcGeoRevisionComponentModule {}
