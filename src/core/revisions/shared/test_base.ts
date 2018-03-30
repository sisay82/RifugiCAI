import { Subject } from "rxjs/Subject";
import { Enums } from "app/shared/types/enums";
import {
    Observable
} from 'rxjs/Observable';
import "rxjs/add/observable/of";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

export class FakeShelterService {
    preventiveUpdateShelter(shelter, section): Observable<boolean> {
        return Observable.of(true);
    }
}

export class FakeAuthService {
    checkUserPermission(): Observable<Enums.Auth_Permissions.User_Type> {
        return Observable.of(Enums.Auth_Permissions.User_Type.sectional);
    }
}

export class FakeSharedService {
    maskInvalidSubject = new Subject();
    maskInvalid$ = this.maskInvalidSubject.asObservable();

    maskValidSubject = new Subject();
    maskValid$ = this.maskValidSubject.asObservable();

    maskSaveSubject = new Subject();
    maskSave$ = this.maskSaveSubject.asObservable();

    onActiveOutletChange(outlet: Enums.Routes.Routed_Outlet) { }
    onMaskConfirmSave(component: Enums.Routes.Routed_Component) { }
}

export class FakeRevisionService {
    static fakePermissions = ["a"];

    childDisableSaveRequest = new Subject();
    childDisableSaveRequest$ = this.childDisableSaveRequest.asObservable();

    fatherReturnPermissions = new Subject();
    fatherReturnPermissions$ = this.fatherReturnPermissions.asObservable();

    onChildGetPermissions() {
        this.fatherReturnPermissions.next(FakeRevisionService.fakePermissions);
    }
    onChildDisableSaveAnswer() { }

    onChildSave(shelter, section) {

    }
}
