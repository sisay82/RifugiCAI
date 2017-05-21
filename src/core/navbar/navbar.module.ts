import {NgModule} from '@angular/core';
import {BcNavbar, BcNavbarRow} from './navbar.component';


@NgModule({
  exports: [BcNavbar, BcNavbarRow],
  declarations: [BcNavbar, BcNavbarRow],
})
export class BcNavbarModule {}