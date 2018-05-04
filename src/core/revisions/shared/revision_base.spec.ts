import {
    TestBed,
    async,
    inject
} from '@angular/core/testing';
import {
    Component
} from '@angular/core';
import { RevisionBase } from './revision_base';
import { BcRevisionsService } from '../revisions.service';
import {
    ShelterService
} from '../../../app/shelter/shelter.service';
import {
    BcTextInputModule
} from '../../inputs/text/text_input.module';
import {
    FormsModule, FormGroup
} from '@angular/forms';
import {
    ReactiveFormsModule
} from "@angular/forms";
import {
    BcSelectInputModule
} from '../../inputs/select/select_input.module';
import { HttpClientModule } from '@angular/common/http';
import { BcAuthService } from 'app/shared/auth.service';
import { BcSharedService } from 'app/shared/shared.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs/Subject';
import { Enums } from 'app/shared/types/enums';
import { ActivatedRoute, Router } from '@angular/router';
import {
    FakeAuthService,
    FakeRevisionService,
    FakeSharedService,
    FakeShelterService
} from './test_base';
import {
    Observable
} from 'rxjs/Observable';
import "rxjs/add/observable/of";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { IShelter } from 'app/shared/types/interfaces';

export class FakeRouter {
    navigateByUrl() { }
}

export class FakeActivatedRoute {
    wrongString = "stringaDiErrore";
    correctString = "507f1f77bcf86cd799439011";

    parent = {
        params: Observable.of({ id: this.wrongString })
    }
}
const fakeActivatedRoute = new FakeActivatedRoute();

@Component({
    template: ""
})
class FakeRevisionComponent extends RevisionBase {
    protected initForm(shelter: IShelter) { }
    getEmptyObjData() {
        return {};
    }
    constructor(
        shelterService: ShelterService,
        shared: BcSharedService,
        revisionService: BcRevisionsService,
        _route: ActivatedRoute,
        router: Router,
        authService: BcAuthService
    ) {
        super(shelterService, shared, revisionService, _route, router, authService);
    }
    protected init(shelID: String) { }
    protected checkValidForm() {
        return true;
    }
    protected save(confirm: any) { }
}

describe('RevisionBase', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FakeRevisionComponent],
            providers: [{
                provide: ShelterService,
                useClass: FakeShelterService
            }, {
                provide: BcAuthService,
                useClass: FakeAuthService
            }, {
                provide: BcSharedService,
                useClass: FakeSharedService
            }, {
                provide: BcRevisionsService,
                useClass: FakeRevisionService
            }, {
                provide: Router,
                useClass: FakeRouter
            }, {
                provide: ActivatedRoute,
                useValue: fakeActivatedRoute
            }],
            imports: [HttpClientModule, BcTextInputModule, FormsModule, ReactiveFormsModule, BcSelectInputModule]
        }).compileComponents();
    }));

    it("Should sense mask error signals", function () {
        const fixture = TestBed.createComponent(FakeRevisionComponent);
        const app = fixture.debugElement.componentInstance;
        const fakeShared: FakeSharedService = TestBed.get(BcSharedService);
        expect(app.maskError).toBeFalsy();
        fakeShared.maskInvalidSubject.next();
        expect(app.maskError).toBeTruthy();
        fakeShared.maskValidSubject.next();
        expect(app.maskError).toBeFalsy();
    });

    it("Should disable save if requester", function () {
        const fixture = TestBed.createComponent(FakeRevisionComponent);
        const app = fixture.debugElement.componentInstance;
        const fakeRevision: FakeRevisionService = TestBed.get(BcRevisionsService);
        const spy = spyOn(fakeRevision, "onChildDisableSaveAnswer");
        expect(app.disableSave).toBeFalsy();
        fakeRevision.childDisableSaveRequest.next();
        expect(app.disableSave).toBeTruthy();
        expect(spy.calls.count()).toBe(1);
    });

    it("Should detect incorrect objectId strings", function (done) {
        const fixture = TestBed.createComponent(FakeRevisionComponent);
        const app = fixture.debugElement.componentInstance;
        app.getRoute()
            .then(() => {
                expect("String should be wrong").toBeUndefined()
                done()
            })
            .catch((err) => {
                done();
                fakeActivatedRoute.parent.params = Observable.of({ id: fakeActivatedRoute.correctString });
                return app.getRoute();
            })
            .then(() => done())
            .catch((err) => {
                expect("String should be correct").toBeUndefined()
                done();
            });
    });

    it("Should gather permissions", function (done) {
        const fixture = TestBed.createComponent(FakeRevisionComponent);
        const app = fixture.debugElement.componentInstance;
        app.getPermission()
            .then((permissions) => {
                expect(permissions.toString()).toBe(FakeRevisionService.fakePermissions.toString());
                done()
            })
            .catch((err) => {
                expect("Err" + err).toBeUndefined();
                done();
            });
    });

    it("Should check user permissions", function () {
        const fixture = TestBed.createComponent(FakeRevisionComponent);
        const app = fixture.debugElement.componentInstance;
        app.getUserPermission();
        expect(app.userRole).toBe(Enums.Auth_Permissions.User_Type.sectional);
    });

    it("Should check menu section permissions", function () {
        const fixture = TestBed.createComponent(FakeRevisionComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app.MENU_SECTION).toBe(Enums.MenuSection.detail);
        expect(app.checkPermission([Enums.MenuSection.detail])).toBe(true);
        app.MENU_SECTION = Enums.MenuSection.document;
        expect(app.checkPermission([Enums.MenuSection.detail])).toBe(false);
    });

    it("Should process url", function () {
        const fixture = TestBed.createComponent(FakeRevisionComponent);
        const app = fixture.debugElement.componentInstance;
        const testURL = "http://google.it";
        expect(app.processUrl({ value: testURL, valid: true })).toBe(testURL);
        expect(app.processUrl({ value: "google.it", valid: true })).toBe(testURL);
    });

    it("Should check if value is valid before getting", function () {
        const fixture = TestBed.createComponent(FakeRevisionComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app.getControlValue({ value: "Val" })).toBeFalsy();
        expect(app.getControlValue({ value: "Val", valid: false })).toBeFalsy();
        expect(app.getControlValue({ value: "Val", valid: true })).toBe("Val");
    });

    it("Should check and get multiple values", function () {
        const fixture = TestBed.createComponent(FakeRevisionComponent);
        const app = fixture.debugElement.componentInstance;
        const controls = {
            contr1: { value: "VAL", valid: true },
            contr2: { value: "VAL2", valid: true }
        };
        expect(JSON.stringify(app.getFormValues({ controls: controls }))).toBe(JSON.stringify({ contr1: "VAL", contr2: "VAL2" }));
        controls["contr3"] = { value: "VAL3" };
        expect(JSON.stringify(app.getFormValues({ controls: controls })))
            .toBe(JSON.stringify({ contr1: "VAL", contr2: "VAL2", contr3: null }));

    });

    it("Should check and get array values", function () {
        const fixture = TestBed.createComponent(FakeRevisionComponent);
        const app = fixture.debugElement.componentInstance;
        const controls: any[] = [
            { controls: { contr1: { value: "VAL", valid: true } } },
            { controls: { contr2: { value: "VAL2", valid: true }, contr1: { value: "VAL" } } }
        ];
        expect(JSON.stringify(app.getFormArrayValues({ controls: controls })))
            .toBe(JSON.stringify([{ contr1: "VAL" }, { contr2: "VAL2", contr1: null }]));

        controls.push({ controls: { contr1: { value: "VAL", valid: true }, contr3: { value: "VAL", valid: false } } });
        expect(JSON.stringify(app.getFormArrayValues({ controls: controls })))
            .toBe(JSON.stringify([{ contr1: "VAL" }, { contr2: "VAL2", contr1: null }, { contr1: "VAL", contr3: null }]));

    });

    it("Should process dates", function () {
        const fixture = TestBed.createComponent(FakeRevisionComponent);
        const app = fixture.debugElement.componentInstance;
        const date = new Date("1/1/11");
        expect(app.processFormDate({ value: "1/1/11" })).toBeFalsy();
        expect(app.processFormDate({ value: "1/1/11", valid: false })).toBeFalsy();
        expect(app.processFormDate({ value: "1/1/11", valid: true }).toString()).toBe(date.toString());
        expect(app.processFormDate({ value: "ROBAstrana", valid: true })).toBe(null);
        expect(app.processSimpleDate("1/1/11").toString()).toBe(date.toString());
        expect(app.processSimpleDate("ROBAstrana")).toBe(null);
    });

});
