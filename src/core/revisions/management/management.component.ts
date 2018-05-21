import {
    Component, Input, OnInit, OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Enums } from '../../../app/shared/types/enums';
import { ISubject, IManagement, IShelter } from '../../../app/shared/types/interfaces'
import { FormGroup, FormBuilder, FormControl, FormArray, Validators } from '@angular/forms';
import { ShelterService } from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';
import { BcSharedService } from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs';
import { BcAuthService } from '../../../app/shared/auth.service';
import { RevisionBase } from '../shared/revision_base';
import { parseDate, CUSTOM_PATTERN_VALIDATORS, customDateValidator } from '../../inputs/input_base';

@Component({
    moduleId: module.id,
    selector: 'bc-management-revision',
    templateUrl: 'management.component.html',
    styleUrls: ['management.component.scss'],
    providers: [ShelterService]
})
export class BcManagementRevision extends RevisionBase implements OnDestroy {
    managForm: FormGroup;
    private newSubjectForm: FormGroup;
    ownerSubjectForm: FormGroup;
    private property: ISubject;
    private subjectChange = false;
    private hiddenSubject = true;
    constructor(shared: BcSharedService,
        authService: BcAuthService,
        shelterService: ShelterService,
        router: Router,
        _route: ActivatedRoute,
        private fb: FormBuilder,
        revisionService: BcRevisionsService) {
        super(shelterService, shared, revisionService, _route, router, authService);
        this.managForm = fb.group({
            rentType: [""],
            valuta: [""],
            reference: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            pickupKey: [""],
            self_management: [""],
            subjects: fb.array([]),
        });

        this.ownerSubjectForm = this.getSubjectForm();

        this.newSubjectForm = this.getSubjectForm();

        this.formValidSub = this.managForm.statusChanges.subscribe((value) => {
            if (value === "VALID") {
                if (!this.maskError) {
                    this.displayError = false;
                }
            }
        });


        this.maskSaveSub = shared.maskSave$.subscribe(() => {
            if (!this.maskError && this.managForm.valid) {
                if (this.subjectChange || this.managForm.dirty || this.ownerSubjectForm.dirty) {
                    this.disableSave = true;
                    this.save(true);
                } else {
                    this.shared.onMaskConfirmSave(Enums.Routes.Routed_Component.management);
                }
            } else {
                this.abortSave();
            }
        });

        shared.activeComponent = Enums.Routes.Routed_Component.management;
    }

    getSubjectForm() {
        return this.fb.group({
            name: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            surname: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            taxCode: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.numberValidator)],
            fixedPhone: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.telephoneValidator)],
            mobilePhone: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.telephoneValidator)],
            pec: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.mailValidator)],
            email: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.mailValidator)],
            webSite: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.urlValidator)],
            type: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            contract_start_date: ["", customDateValidator],
            contract_end_date: ["", customDateValidator],
            contract_duration: [""],
            contract_fee: ["", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.numberValidator)],
            possession_type: [""]
        });
    }

    getFormControls(controlName) {
        return (<FormGroup>this.managForm.get(controlName)).controls;
    }

    checkValidForm() {
        return this.managForm.valid;
    }


    isHiddenSubject() {
        return this.hiddenSubject;
    }

    toggleSubject() {
        this.hiddenSubject = !this.hiddenSubject;
    }

    removeSubject(index) {
        this.subjectChange = true;
        const control = <FormArray>this.managForm.get('subjects');
        control.removeAt(index);
    }

    addNewSubject() {
        this.subjectChange = true;
        if (this.newSubjectForm.valid) {
            const control = <FormArray>this.managForm.get('subjects');
            const subject: ISubject = this.getFormValues(this.newSubjectForm);
            subject.contract_start_date = subject.contract_start_date ?
                (parseDate(this.newSubjectForm.get("contract_start_date").value) || null) : null;
            subject.contract_end_date = subject.contract_end_date ?
                (parseDate(this.newSubjectForm.get("contract_start_date").value) || null) : null;
            control.push(this.initSubject(subject));
            this.resetSubjectForm();
        } else {
            this.invalid = true;
        }
    }

    resetSubjectForm() {
        this.newSubjectForm = this.getSubjectForm();
        this.toggleSubject();
    }

    initSubject(subject: ISubject) {
        return this.fb.group({
            name: [subject.name, Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            surname: [subject.surname, Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            taxCode: [subject.taxCode, Validators.pattern(CUSTOM_PATTERN_VALIDATORS.numberValidator)],
            fixedPhone: [subject.fixedPhone, Validators.pattern(CUSTOM_PATTERN_VALIDATORS.telephoneValidator)],
            mobilePhone: [subject.mobilePhone, Validators.pattern(CUSTOM_PATTERN_VALIDATORS.telephoneValidator)],
            pec: [subject.pec, Validators.pattern(CUSTOM_PATTERN_VALIDATORS.mailValidator)],
            email: [subject.email, Validators.pattern(CUSTOM_PATTERN_VALIDATORS.mailValidator)],
            webSite: [subject.webSite, Validators.pattern(CUSTOM_PATTERN_VALIDATORS.urlValidator)],
            type: [subject.type, Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            contract_start_date: [subject.contract_start_date ? (new Date(subject.contract_start_date).toLocaleDateString()) : null,
                customDateValidator],
            contract_end_date: [subject.contract_end_date ? (new Date(subject.contract_end_date).toLocaleDateString()) : null,
                customDateValidator],
            contract_duration: [subject.contract_duration],
            contract_fee: [subject.contract_fee, Validators.pattern(CUSTOM_PATTERN_VALIDATORS.numberValidator)],
            possession_type: [subject.possession_type]
        });
    }

    save(confirm) {
        if (!confirm || (this.managForm.valid && this.ownerSubjectForm.valid)) {
            const shelter: IShelter = { _id: this._id, name: this.name };

            const management: IManagement = this.getFormValues(this.managForm);
            const prop: ISubject = this.getFormValues(this.ownerSubjectForm);
            prop.type = "Proprietario";
            const control = <FormArray>this.managForm.get('subjects');
            const subjects: ISubject[] = this.getFormArrayValues(control);
            subjects.push(prop);
            shelter.management = management
            shelter.management.subject = subjects as [ISubject];
            this.processSavePromise(shelter, "management")
                .then(() => {
                    this.displayError = false;
                    if (confirm) {
                        this.shared.onMaskConfirmSave(Enums.Routes.Routed_Component.management);
                    }
                })
                .catch(err => {
                    this.abortSave();
                    console.log(err);
                });
        } else {
            this.abortSave();
        }
    }

    initForm(shelter) {
        this.name = shelter.name;
        this.data = shelter.management;

        if (shelter.management) {
            for (const prop in shelter.management) {
                if (shelter.management.hasOwnProperty(prop)) {
                    if (this.managForm.contains(prop)) {
                        if (prop.indexOf("date") === -1) {
                            this.managForm.get(prop).setValue(shelter.management[prop]);
                        } else {
                            this.managForm.get(prop).setValue(shelter.management[prop] ?
                                (new Date(shelter.management[prop]).toLocaleDateString() || null) : null);
                        }
                    }
                }
            }
            if (shelter.management.subject) {
                const control = <FormArray>this.managForm.get('subjects');
                for (const subj of shelter.management.subject) {
                    if (subj.type && subj.type.toLowerCase().indexOf("proprietario") > -1) {
                        this.property = subj;
                        // this.ownerSubjectForm.setValue(this.initSubject(subj));

                        for (const contr in subj) {
                            if (this.ownerSubjectForm.contains(contr)) {
                                this.ownerSubjectForm.get(contr).setValue(subj[contr]);
                            }
                        }
                    } else {
                        control.push(this.initSubject(subj));
                    }
                }
            }
        }
    }

    ngOnDestroy() {
        if (this.subjectChange || this.managForm.dirty) {
            if (!this.disableSave) { this.save(false); }
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

    getEmptyObjData(section) {
        return { subject: [] as [ISubject] };
    }

    init(shelId) {
        this.getData(shelId, "management")
            .then(shelter => {
                this.initForm(shelter);
            })
    }
}
