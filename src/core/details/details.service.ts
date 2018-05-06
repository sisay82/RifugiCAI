import { Injectable } from '@angular/core'
import { Subject } from 'rxjs';
import { IShelter, IFile } from '../../app/shared/types/interfaces';

@Injectable()
export class BcDetailsService {
    private childSaveSource = new Subject<{ shelter: IShelter, section: string }>();
    save$ = this.childSaveSource.asObservable();

    private childLoadSource = new Subject<IShelter>();
    load$ = this.childLoadSource.asObservable();

    private childLoadRequestSource = new Subject<string>();
    loadRequest$ = this.childLoadRequestSource.asObservable();

    private childSaveFilesSource = new Subject<IFile[]>();
    saveFiles$ = this.childSaveFilesSource.asObservable();

    private childLoadFilesSource = new Subject<IFile[]>();
    loadFiles$ = this.childLoadFilesSource.asObservable();

    private childLoadFilesSourceRequest = new Subject<any[]>();
    loadFilesRequest$ = this.childLoadFilesSourceRequest.asObservable();

    onChildSave(shelter: IShelter, section: string) {
        this.childSaveSource.next({ shelter: shelter, section: section });
    }

    onChildLoadRequest(section: string) {
        this.childLoadRequestSource.next(section);
    }

    onChildLoad(shelter: IShelter) {
        this.childLoadSource.next(shelter);
    }

    onChildSaveFiles(files: IFile[]) {
        this.childSaveFilesSource.next(files);
    }

    onChildLoadFiles(files: IFile[]) {
        this.childLoadFilesSource.next(files);
    }

    onChildLoadFilesRequest(types: any[]) {
        this.childLoadFilesSourceRequest.next(types);
    }

}
