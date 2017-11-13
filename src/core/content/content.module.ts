import {NgModule} from '@angular/core';
import {BcContent} from './content.component';
import { BcContentHeaderModule } from "./contentHeader/contentHeader.module";
import { BcContentFooterModule } from "./contentFooter/contentFooter.module";
import { BcContentSectionModule } from "./contentSection/contentSection.module";
import { BcContentAsideModule } from "./contentAside/contentAside.module";

@NgModule({
  imports:[BcContentHeaderModule,BcContentFooterModule,BcContentSectionModule,BcContentAsideModule],
  exports: [BcContent,BcContentHeaderModule,BcContentFooterModule,BcContentSectionModule,BcContentAsideModule],
  declarations: [BcContent/*, BcContentHeader, BcContentSection, BcContentAside, BcContentFooter*/],
})
export class BcContentModule {}