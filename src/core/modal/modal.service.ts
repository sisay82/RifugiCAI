import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class BcModalService {
    private openDialogSource = new Subject<boolean>();
    openDialog$ = this.openDialogSource.asObservable();
    onOpenDialog(message: string) {
        this.openDialogSource.next(
            window.confirm(message)
        );
    }
}
