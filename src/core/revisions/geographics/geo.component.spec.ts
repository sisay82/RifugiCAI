import {
    TestBed,
    async
} from '@angular/core/testing';
import {
    BcGeoRevisionComponent
} from './geo.component';
import {
    BcRevisionsService
} from '../revisions.service';
import {
    ShelterService
} from '../../../app/shelter/shelter.service';
import {
    BcTextInputModule
} from '../../inputs/text/text_input.module';
import {
    FormsModule
} from '@angular/forms';
import {
    ReactiveFormsModule
} from "@angular/forms";
import {
    BcSelectInputModule
} from '../../inputs/select/select_input.module';
import {
    HttpClientModule
} from '@angular/common/http';
import {
    BcAuthService
} from 'app/shared/auth.service';
import {
    BcSharedService
} from 'app/shared/shared.service';
import {
    RouterTestingModule
} from '@angular/router/testing';
import {
    Subject
} from 'rxjs/Subject';
import {
    Enums
} from 'app/shared/types/enums';
import {
    FakeAuthService,
    FakeRevisionService,
    FakeSharedService,
    FakeShelterService
} from '../shared/test_base';
import {
    Observable
} from 'rxjs/Observable';
import "rxjs/add/observable/of";

describe('BcGeoRevisionComponent', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [BcGeoRevisionComponent],
            providers: [{
                provide: ShelterService,
                useclass: FakeShelterService
            }, {
                provide: BcAuthService,
                useClass: FakeAuthService
            }, {
                provide: BcSharedService,
                useClass: FakeSharedService
            }, {
                provide: BcRevisionsService,
                useClass: FakeRevisionService
            }],
            imports: [HttpClientModule, RouterTestingModule, BcTextInputModule, FormsModule, ReactiveFormsModule, BcSelectInputModule]
        }).compileComponents();
    }));

    it("Should save on mask signal", function () {
        const fixture = TestBed.createComponent(BcGeoRevisionComponent);
        const app = fixture.debugElement.componentInstance;
        const fakeShared = TestBed.get(BcSharedService);
        const saveSpy = spyOn(fakeShared, "onMaskConfirmSave");
        fakeShared.maskSaveSubject.next();
        expect(saveSpy.calls.count()).toBe(1)
    });

    it("Should validate and save form", function () {
        const fixture = TestBed.createComponent(BcGeoRevisionComponent);
        const app = fixture.debugElement.componentInstance;
        const form = {
            valid: true,
            controls: {
                location: {
                    region: "Regione"
                },
                tags: {
                    controls: [
                        { key: "K1", value: "V1" },
                        { key: "K2", value: "V1" },
                    ]
                }
            }
        };
        const fakeShelter = new FakeShelterService();
        app.shelterService = fakeShelter;
        const saveSpy = spyOn(fakeShelter, "preventiveUpdateShelter").and.returnValue(Observable.of(true));
        app._id = "ID";
        app.name = "Nome";
        app.geoForm = form;
        app.save(true);
        expect(saveSpy.calls.count()).toBe(1);
        form.valid = false;
        app.geoForm = form;
        app.save(true);
        expect(saveSpy.calls.count()).toBe(1);
    });

    it("Should initialize form on load", function () {
        const fixture = TestBed.createComponent(BcGeoRevisionComponent);
        const app = fixture.debugElement.componentInstance;
        const geoData = {
            location: {
                region: "Regione"
            },
            tags:
                [
                    { key: "K1", value: "V1" },
                    { key: "K2", value: "V2" },
                ]

        };
        const shelter = {
            id: "ID",
            name: "Name",
            geoData: geoData
        };
        app.initForm(shelter);
        expect(app.name).toBe("Name");
        expect(app.data).toBe(geoData);
        expect(app.geoForm.controls.region.value).toBe("Regione");
        expect(app.geoForm.controls.tags.controls[0].controls.key.value).toBe("K1");
        expect(app.geoForm.controls.tags.controls[1].controls.value.value).toBe("V2");
    });
});
