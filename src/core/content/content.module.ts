import {NgModule} from '@angular/core';
import {BcContent} from './content.component';
import { BcContentHeader } from "./contentHeader/contentHeader.component";
import { BcContentFooter } from "./contentFooter/contentFooter.component";
import { BcContentSection } from "./contentSection/contentSection.component";
import { BcContentAside } from "./contentAside/contentAside.component";

@NgModule({
  exports: [BcContent, BcContentHeader, BcContentSection, BcContentAside, BcContentFooter],
  declarations: [BcContent, BcContentHeader, BcContentSection, BcContentAside, BcContentFooter],
})
export class BcContentModule {}