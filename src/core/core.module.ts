import { NgModule } from '@angular/core';

import { BcContentModule } from './content/content.module';
import { BcAvatarModule } from './avatar/avatar.module';
import { BcDividerModule } from './divider/divider.module';
import { BcNavbarModule } from './navbar/navbar.module';
import { BcListModule } from './list/list.module';
import { BcDetailsModule } from './details/details.module';
import { BcRevisionsModule } from './revisions/revisions.module';
import { BcMapModule } from './map/map.module';
import { BcMaskControllerModule } from './fixed_mask/mask-controller.module';
import { BcButtonModule } from './button/button.module';
import { BcSelectGroupModule } from './button/selectGroup.module';
import { BcMenuModule } from './menu/menu.module';
// import { FilterService } from './services/filter.service';
// import { SorterService } from './services/sorter.service';
// import { TrackByService } from './services/trackby.service';

import { CapitalizePipe } from './pipes/capitalize.pipe';
import { TrimPipe } from './pipes/trim.pipe';

const COMPONENTS_MODULES = [
    BcContentModule,
    BcAvatarModule,
    BcDividerModule,
    BcNavbarModule,
    BcListModule,
    BcDetailsModule,
    BcMapModule,
    BcRevisionsModule,
    BcMaskControllerModule,
    BcButtonModule,
    BcSelectGroupModule,
    BcMenuModule
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