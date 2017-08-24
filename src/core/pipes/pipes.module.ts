
import { NgModule } from '@angular/core';

import { CapitalizePipe } from './capitalize.pipe';
import { TrimPipe } from './trim.pipe';
import { PrefixPipe } from './prefix.pipe';
import { TitleCasePipe,TitleCaseLowPipe } from './titlecase.pipe';
import { ProcessDatePipe } from './processdate.pipe';

@NgModule({
    imports: [],
    declarations: [CapitalizePipe,TrimPipe,PrefixPipe,TitleCaseLowPipe,TitleCasePipe,ProcessDatePipe],
    exports: [CapitalizePipe,TrimPipe,PrefixPipe,TitleCaseLowPipe,TitleCasePipe,ProcessDatePipe]
})
export class PipesModule { }