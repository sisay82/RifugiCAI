import {
    Component,
    Directive,
    ChangeDetectionStrategy,
    ViewEncapsulation
} from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'bc-content',
    templateUrl: 'content.component.html',
    styleUrls: ['content.component.scss'],
    host: {
        '[class.bc-content]': 'true',
        'role': 'content'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class BcContent {
    constructor() {
    }
}