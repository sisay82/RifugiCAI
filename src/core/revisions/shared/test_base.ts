import {
    Subject,
    Observable,
    of as obsOf
} from "rxjs";
import { Enums } from "app/shared/types/enums";



export class FakeShelterService {
    preventiveUpdateShelter(shelter, section): Observable<boolean> {
        return obsOf(true);
    }
}

export class FakeAuthService {
    checkUserPermission(): Observable<Enums.Auth_Permissions.User_Type> {
        return obsOf(Enums.Auth_Permissions.User_Type.sectional);
    }

    isCentralUser(...param) {
        return obsOf(true);
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
