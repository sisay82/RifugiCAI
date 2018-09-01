import {
    TestBed,
    async
} from '@angular/core/testing';
import {
    BcContactsRevision
} from './contacts.component';
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
    Subject,
    Observable,
    of as obsOf
} from 'rxjs';
import {
    Enums
} from 'app/shared/types/enums';
import {
    FakeAuthService,
    FakeRevisionService,
    FakeSharedService,
    FakeShelterService
} from '../shared/test_base';
import { BcDividerModule } from '../../divider/divider.module';
import { BcIconModule } from '../../icon/icon.module';

describe('BcContactRevisionComponent', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [BcContactsRevision],
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
            imports: [HttpClientModule,
                BcDividerModule,
                BcIconModule,
                RouterTestingModule,
                BcTextInputModule,
                FormsModule,
                ReactiveFormsModule,
                BcSelectInputModule]
        }).compileComponents();
    }));

    describe('OpeningForm', () => {
        it('Should validate opening type input', () => {
            const fixture = TestBed.createComponent(BcContactsRevision);
            const app = fixture.debugElement.componentInstance;
            expect(app.newOpeningForm.controls.newOpeningType.valid).toBe(true);
            app.newOpeningForm.controls.newOpeningType.setValue('<>');
            expect(app.newOpeningForm.controls.newOpeningType.valid).toBe(false);
        });

        it('Should check for unique opening type', () => {
            const fixture = TestBed.createComponent(BcContactsRevision);
            const app = fixture.debugElement.componentInstance;
            app.initForm({
                openingTime: [{
                    startDate: '1/1/02',
                    endDate: '2/2/02',
                    type: 'a'
                }]
            })
            expect(app.newOpeningForm.controls.newOpeningType.valid).toBe(true);
            app.newOpeningForm.controls.newOpeningType.setValue('a');
            expect(app.newOpeningForm.controls.newOpeningType.valid).toBe(false);
        });
    });

});
