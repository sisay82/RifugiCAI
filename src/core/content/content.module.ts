import {NgModule} from '@angular/core';
import {BcContent} from './content.component';
import { BcContentHeader } from "./contentHeader/contentHeader.component";
import { BcContentFooter } from "./contentFooter/contentFooter.component";
import { BcContentSection } from "./contentSection/contentSection.component";

@NgModule({
  exports: [BcContent, BcContentHeader, BcContentSection, BcContentFooter],
  declarations: [BcContent, BcContentHeader, BcContentSection, BcContentFooter],
})
export class BcContentModule {}