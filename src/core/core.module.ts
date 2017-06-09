import { NgModule } from '@angular/core';

import { BcAvatarModule } from './avatar/avatar.module';
import { BcDividerModule } from './divider/divider.module';
import { BcNavbarModule } from './navbar/navbar.module';
import { BcListModule } from './list/list.module';
import { BcMapModule } from './map/map.module';
import { BcButtonModule } from './button/button.module';
import { BcSelectGroupModule } from './button/selectGroup.module';
import { BcMaskModule } from './fixed_mask/mask.module';

// import { FilterService } from './services/filter.service';
// import { SorterService } from './services/sorter.service';
// import { TrackByService } from './services/trackby.service';

import { CapitalizePipe } from './pipes/capitalize.pipe';
import { TrimPipe } from './pipes/trim.pipe';

const COMPONENTS_MODULES = [
    BcAvatarModule,
    BcDividerModule,
    BcNavbarModule,
    BcListModule,
    BcMapModule,
    BcSelectGroupModule,
    BcMaskModule
];
const PIPES_MODULES = [
    CapitalizePipe,
    TrimPipe
];
// const SERVICES_MODULES = [
//     FilterService,
//     SorterService,
//     TrackByService
// ];

@NgModule({
    imports: COMPONENTS_MODULES,
    declarations: PIPES_MODULES,
    // providers: SERVICES_MODULES,
    exports: [].concat(COMPONENTS_MODULES, PIPES_MODULES)
})
export class CoreModule { }