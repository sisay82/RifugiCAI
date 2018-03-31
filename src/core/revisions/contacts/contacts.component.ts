import {
    Component,
    Input,
    OnInit,
    OnDestroy
} from '@angular/core';
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import {
    IOpening,
    IContacts,
    IShelter
} from '../../../app/shared/types/interfaces'
import {
    Enums
} from '../../../app/shared/types/enums'
import {
    FormGroup,
    FormBuilder,
    FormControl,
    FormArray
} from '@angular/forms';
import {
    ShelterService
} from '../../../app/shelter/shelter.service'
import {
    BcRevisionsService
} from '../revisions.service';
import {
    BcSharedService
} from '../../../app/shared/shared.service';
import {
    Subscription
} from 'rxjs/Subscription';
import {
    BcAuthService
} from '../../../app/shared/auth.service';
import {
    trimYear,
    parseDate
} from '../../inputs/input_base';
import {
    RevisionBase
} from '../shared/revision_base';

@Component({
    moduleId: module.id,
    selector: 'bc-contacts-revision',
    templateUrl: 'contacts.component.html',
    styleUrls: ['contacts.component.scss'],
    providers: [ShelterService]
})
export class BcContactsRevision extends RevisionBase implements OnDestroy {
    contactForm: FormGroup;
    private newOpeningForm: FormGroup;
    /*private contacts: IContacts;
    private openings: IOpening[];*/
    private openingChange = false;
    private hiddenOpening = true;
    constructor(shared: BcSharedService,
        shelterService: ShelterService,
        authService: BcAuthService,
        router: Router,
        _route: ActivatedRoute,
        private fb: FormBuilder,
        revisionService: BcRevisionsService) {
        super(shelterService, shared, revisionService, _route, router, authService);
        this.contactForm = fb.group({
            fixedPhone: [""],
            mobilePhone: [""],
            role: [""],
            emailAddress: [""],
            prenotation_link: [""],
            webAddress: [""],
            openingTime: fb.array([])
        });

        this.newOpeningForm = fb.group({
            newOpeningStartDate: [""],
            newOpeningEndDate: [""],
            newOpeningType: [""]
        });

        this.formValidSub = this.contactForm.statusChanges.subscribe((value) => {
            if (value === "VALID") {
                if (!this.maskError) {
                    this.displayError = false;
                }
            }
        });

        this.maskSaveSub = shared.maskSave$.subscribe(() => {
            if (!this.maskError && this.contactForm.valid) {
                if (this.openingChange || this.contactForm.dirty) {
                    this.disableSave = true;
                    this.save(true);
                } else {
                    this.shared.onMaskConfirmSave(Enums.Routes.Routed_Component.contacts);
                }
            } else {
                this.abortSave();
            }
        });

        shared.activeComponent = Enums.Routes.Routed_Component.contacts;
    }

    getFormControls(controlName) {
        return (<FormGroup>this.contactForm.controls[controlName]).controls;
    }

    checkValidForm() {
        return this.contactForm.valid;
    }

    toggleOpenings() {
        this.hiddenOpening = !this.hiddenOpening;
    }

    isHiddenOpenings() {
        return this.hiddenOpening;
    }

    removeOpening(index) {
        this.openingChange = true;
        const control = <FormArray>this.contactForm.controls['openingTime'];
        control.removeAt(index);
    }

    addNewOpening() {
        this.openingChange = true;
        if (this.newOpeningForm.controls['newOpeningStartDate'].valid
            && this.newOpeningForm.controls['newOpeningEndDate'].valid
            && this.newOpeningForm.controls['newOpeningType'].valid) {
            let startDate;
            let endDate;
            if (this.newOpeningForm.controls['newOpeningStartDate'].value != null
                && this.newOpeningForm.controls['newOpeningStartDate'].value !== ""
                && this.newOpeningForm.controls['newOpeningEndDate'].value != null
                && this.newOpeningForm.controls['newOpeningEndDate'].value !== "") {
                startDate = parseDate(this.newOpeningForm.controls['newOpeningStartDate'].value);
                endDate = parseDate(this.newOpeningForm.controls['newOpeningEndDate'].value);
            } else {
                startDate = null;
                endDate = null;
            }
            this.invalid = false;
            const control = <FormArray>this.contactForm.controls['openingTime'];
            const opening: IOpening = {
                startDate: startDate,
                endDate: endDate,
                type: this.newOpeningForm.controls['newOpeningType'].value
            }
            control.push(this.initOpening(opening));
            this.resetOpeningForm();
        } else {
            this.invalid = true;
        }
    }

    resetOpeningForm() {
        this.newOpeningForm = this.fb.group({
            newOpeningStartDate: [""],
            newOpeningEndDate: [""],
            newOpeningType: [""]
        });
        this.toggleOpenings();
    }

    initOpening(opening: IOpening) {
        return this.fb.group({
            startDate: [trimYear(opening.startDate)],
            endDate: [trimYear(opening.endDate)],
            type: [opening.type]
        });
    }

    save(confirm) {
        if (!confirm || this.contactForm.valid) {
            const shelter: any = {
                _id: this._id,
                name: this.name
            };

            const contacts: IContacts = this.getFormValues(this.contactForm);
            const op = this.getFormArrayValues(<FormArray>this.contactForm.controls.openingTime);
            const openings = op.map(val => {
                if (val) {
                    if (val.startDate) {
                        val.startDate = this.processSimpleDate(val.startDate);
                    }
                    if (val.endDate) {
                        val.endDate = this.processSimpleDate(val.endDate);
                    }
                }
                return val;
            });

            shelter.openingTime = openings;
            shelter.contacts = contacts;
            this.processSavePromise(shelter, "openingTime")
                .then(() => this.processSavePromise(shelter, "contacts"))
                .then(() => {
                    this.displayError = false;
                    if (confirm) {
                        this.shared.onMaskConfirmSave(Enums.Routes.Routed_Component.contacts);
                    }
                })
                .catch((err) => {
                    this.abortSave();
                    console.log(err);
                });
        } else {
            this.abortSave();
        }

    }

    initForm(shelter) {
        this.data["contacts"] = shelter.contacts;
        this.data["openingTime"] = shelter.openingTime;
        if (this.data.contacts) {
            for (const prop in this.data.contacts) {
                if (this.data.contacts.hasOwnProperty(prop)) {
                    if (this.contactForm.contains(prop)) {
                        this.contactForm.controls[prop].setValue(this.data.contacts[prop]);
                    }
                }
            }
        }
        if (this.data.openingTime) {
            const control = <FormArray>this.contactForm.controls['openingTime'];
            for (const opening of this.data.openingTime) {
                control.push(this.initOpening(opening));
            }
        }
    }

    ngOnDestroy() {
        if (this.openingChange || this.contactForm.dirty) {
            if (!this.disableSave) {
                this.save(false);
            }
        }
        if (this.permissionSub) {
            this.permissionSub.unsubscribe();
        }
        if (this.maskSaveSub) {
            this.maskSaveSub.unsubscribe();
        }
        if (this.maskInvalidSub) {
            this.maskInvalidSub.unsubscribe();
        }
        if (this.maskValidSub) {
            this.maskValidSub.unsubscribe();
        }
    }

    init(shelId) {
        Promise.all([
            this.getData(shelId, "contacts"),
            this.getData(shelId, "openingTime")
        ])
            .then(values => {
                const shelter = Object.assign({}, ...values);
                this.initForm(shelter);
            });
    }

    getEmptyObjData(section) {
        if (section === "openingTime") {
            return [];
        } else {
            return {};
        }
    }
}
