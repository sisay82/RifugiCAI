import { NgModule } from '@angular/core';

import { BcContentModule } from './content/content.module';
import { BcBackdropModule } from './backdrop/backdrop.module';
import { BcIconModule } from './icon/icon.module';
import { BcAvatarModule } from './avatar/avatar.module';
import { BcButtonModule } from './button/button.module';
import { BcDividerModule } from './divider/divider.module';
import { BcNavbarModule } from './navbar/navbar.module';
import { BcListModule } from './list/list.module';
import { BcDetailsModule } from './details/details.module';
import { BcRevisionsModule } from './revisions/revisions.module';
import { BcMapModule } from './map/map.module';
import { BcMaskControllerModule } from './fixed_mask/mask-controller.module';
import { BcMenuModule } from './menu/menu.module';
// import { FilterService } from './services/filter.service';
// import { SorterService } from './services/sorter.service';
// import { TrackByService } from './services/trackby.service';

import { PipesModule } from './pipes/pipes.module';

const COMPONENTS_MODULES = [
    PipesModule,
    BcContentModule,
    BcBackdropModule,
    BcIconModule,
    BcAvatarModule,
    BcButtonModule,
    BcDividerModule,
    BcNavbarModule,
    BcListModule,
    BcDetailsModule,
    BcMapModule,
    BcRevisionsModule,
    BcMaskControllerModule,
    BcButtonModule,
    BcMenuModule
];

/*const PIPES_MODULES = [
    CapitalizePipe,
    TrimPipe,
    TitleCasePipe,
    PrefixPipe,
    ProcessDatePipe,
    TitleCaseLowPipe
];*/

// const SERVICES_MODULES = [
//     FilterService,
//     SorterService,
//     TrackByService
// ];

@NgModule({
    imports: COMPONENTS_MODULES,
    //declarations: PIPES_MODULES,
    // providers: SERVICES_MODULES,
    exports: [].concat(COMPONENTS_MODULES/*, PIPES_MODULES*/)
})
export class CoreModule { }