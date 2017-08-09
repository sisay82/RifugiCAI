import { NgModule } from '@angular/core';

import { BcContentModule } from './content/content.module';
import { BcBackdropModule } from './backdrop/backdrop.module';
import { BcIconModule } from './icon/icon.module';
import { BcAvatarModule } from './avatar/avatar.module';
import { BcDividerModule } from './divider/divider.module';
import { BcNavbarModule } from './navbar/navbar.module';
import { BcListModule } from './list/list.module';
import { BcMenuModule } from './menu/menu.module';


// import { FilterService } from './services/filter.service';
// import { SorterService } from './services/sorter.service';
// import { TrackByService } from './services/trackby.service';

import { CapitalizePipe } from './pipes/capitalize.pipe';
import { TrimPipe } from './pipes/trim.pipe';

const COMPONENTS_MODULES = [
    BcContentModule,
    BcBackdropModule,
    BcIconModule,
    BcAvatarModule,
    BcDividerModule,
    BcNavbarModule,
    BcListModule,
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