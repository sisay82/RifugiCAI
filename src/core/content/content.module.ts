import {NgModule} from '@angular/core';
import {BcContent} from './content.component';
/*
import { BcContentHeader } from "./contentHeader/contentHeader.component";
import { BcContentFooter } from "./contentFooter/contentFooter.component";
import { BcContentSection } from "./contentSection/contentSection.component";
import { BcContentAside } from "./contentAside/contentAside.component";
*/
import { BcContentHeaderModule } from "./contentHeader/contentHeader.module";
import { BcContentFooterModule } from "./contentFooter/contentFooter.module";
import { BcContentSectionModule } from "./contentSection/contentSection.module";
import { BcContentAsideModule } from "./contentAside/contentAside.module";

@NgModule({
  imports:[BcContentHeaderModule,BcContentFooterModule,BcContentSectionModule,BcContentAsideModule],
  exports: [BcContent,BcContentHeaderModule,BcContentFooterModule,BcContentSectionModule,BcContentAsideModule
    /*, BcContentHeader, BcContentSection, BcContentAside, BcContentFooter*/],
  declarations: [BcContent/*, BcContentHeader, BcContentSection, BcContentAside, BcContentFooter*/],
})
export class BcContentModule {}