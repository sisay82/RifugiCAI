import {
    Component, Input, OnInit, OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Enums } from '../../../app/shared/types/enums';
import { ISubject, IManagement, IShelter } from '../../../app/shared/types/interfaces'
import { FormGroup, FormBuilder, FormControl, FormArray } from '@angular/forms';
import { ShelterService } from '../../../app/shelter/shelter.service'
import { BcRevisionsService } from '../revisions.service';
import { BcSharedService } from '../../../app/shared/shared.service';
import { Subscription } from 'rxjs/Subscription';
import { BcAuthService } from '../../../app/shared/auth.service';
import { RevisionBase } from '../shared/revision_base';
import { parseDate } from '../../inputs/input_base';

@Component({
    moduleId: module.id,
    selector: 'bc-management-revision',
    templateUrl: 'management.component.html',
    styleUrls: ['management.component.scss'],
    providers: [ShelterService]
})
export class BcManagementRevision extends RevisionBase implements OnDestroy{
    managForm: FormGroup;
    private newSubjectForm: FormGroup;
    private data: IManagement;
    private property: ISubject;
    private subjectChange = false;
    private hiddenSubject = true;
    constructor(shared: BcSharedService, authService: BcAuthService, shelterService: ShelterService, router: Router, _route: ActivatedRoute, private fb: FormBuilder, revisionService: BcRevisionsService) {
        super(shelterService, shared, revisionService, _route, router, authService);
        this.managForm = fb.group({
            rentType: [""],
            valuta: [""],
            reference: [""],
            pickupKey: [""],
            self_management: [""],
            subjects: fb.array([]),
            propName: [""],
            propTaxCode: [""],
            propFixedPhone: [""],
            propPec: [""],
            propEmail: [""],
            propWebSite: [""],
            propContract_start_date: [""],
            propContract_end_date: [""],
            propContract_duration: [""],
            propContract_fee: [""],
            propPossessionType: [""]
        });

        this.newSubjectForm = fb.group({
            newName: [""],
            newSurname: [""],
            newTaxCode: [""],
            newFixedPhone: [""],
            newMobilePhone: [""],
            newPec: [""],
            newMail: [""],
            newWebSite: [""],
            newType: [""],
            newContract_start_date: [""],
            newContract_end_date: [""],
            newContract_duration: [""],
            newContract_fee: [""],
            newPossessionType: [""]
        });

        this.formValidSub = this.managForm.statusChanges.subscribe((value) => {
            if (value == "VALID") {
                if (!this.maskError) {
                    this.displayError = false;
                }
            }
        });


        this.maskSaveSub = shared.maskSave$.subscribe(() => {
            if (!this.maskError && this.managForm.valid) {
                if (this.subjectChange || this.managForm.dirty) {
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

    getFormControls(controlName) {
        return (<FormGroup>this.managForm.controls[controlName]).controls;
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
        const control = <FormArray>this.managForm.controls['subjects'];
        control.removeAt(index);
    }

    addNewSubject() {
        this.subjectChange = true;
        if (this.newSubjectForm.valid) {
            const control = <FormArray>this.managForm.controls['subjects'];
            const subject: ISubject = {
                name: this.newSubjectForm.controls['newName'].value || null,
                surname: this.newSubjectForm.controls['newSurname'].value || null,
                taxCode: this.newSubjectForm.controls['newTaxCode'].value || null,
                fixedPhone: this.newSubjectForm.controls['newFixedPhone'].value || null,
                mobilePhone: this.newSubjectForm.controls['newMobilePhone'].value || null,
                pec: this.newSubjectForm.controls['newPec'].value || null,
                email: this.newSubjectForm.controls['newMail'].value || null,
                webSite: this.newSubjectForm.controls['newWebSite'].value || null,
                type: this.newSubjectForm.controls['newType'].value || null,
                contract_start_date: this.newSubjectForm.controls["newContract_start_date"].value ? (parseDate(this.newSubjectForm.controls["newContract_start_date"].value) || null) : null,
                contract_end_date: this.newSubjectForm.controls["newContract_end_date"].value ? (parseDate(this.newSubjectForm.controls["newContract_end_date"].value) || null) : null,
                contract_duration: this.newSubjectForm.controls["newContract_duration"].value || null,
                contract_fee: this.newSubjectForm.controls["newContract_fee"].value || null,
                possession_type: this.newSubjectForm.controls["newPossessionType"].value || null,
            }
            control.push(this.initSubject(subject));
            this.resetSubjectForm();
        } else {
            this.invalid = true;
        }
    }

    resetSubjectForm() {
        this.newSubjectForm = this.fb.group({
            newName: [""],
            newSurname: [""],
            newTaxCode: [""],
            newFixedPhone: [""],
            newMobilePhone: [""],
            newPec: [""],
            newMail: [""],
            newWebSite: [""],
            newType: [""],
            newContract_start_date: [""],
            newContract_end_date: [""],
            newContract_duration: [""],
            newContract_fee: [""],
            newPossessionType: [""]
        });
        this.toggleSubject();
    }

    initSubject(subject: ISubject) {
        return this.fb.group({
            name: [subject.name],
            surname: [subject.surname],
            taxCode: [subject.taxCode],
            fixedPhone: [subject.fixedPhone],
            mobilePhone: [subject.mobilePhone],
            pec: [subject.pec],
            email: [subject.email],
            webSite: [subject.webSite],
            type: [subject.type],
            contract_start_date: [subject.contract_start_date ? (new Date(subject.contract_start_date).toLocaleDateString()) : null],
            contract_end_date: [subject.contract_end_date ? (new Date(subject.contract_end_date).toLocaleDateString()) : null],
            contract_duration: [subject.contract_duration],
            contract_fee: [subject.contract_fee],
            possession_type: [subject.possession_type]
        });
    }

    save(confirm) {
        if (!confirm || this.managForm.valid) {
            const shelter: IShelter = { _id: this._id, name: this.name };

            const management: IManagement = {
                rentType: this.getControlValue(<FormGroup>this.managForm.controls.rentType),
                valuta: this.getControlValue(<FormGroup>this.managForm.controls.valuta),
                self_management: this.getControlValue(<FormGroup>this.managForm.controls.self_management),
                pickupKey: this.getControlValue(<FormGroup>this.managForm.controls.pickupKey),
                reference: this.getControlValue(<FormGroup>this.managForm.controls.reference)
            };

            const prop: ISubject = {
                name: this.getControlValue(<FormGroup>this.managForm.controls.propName),
                taxCode: this.getControlValue(<FormGroup>this.managForm.controls.propTaxCode),
                fixedPhone: this.getControlValue(<FormGroup>this.managForm.controls.propFixedPhone),
                pec: this.getControlValue(<FormGroup>this.managForm.controls.propPec),
                email: this.getControlValue(<FormGroup>this.managForm.controls.propEmail),
                contract_start_date: this.processFormDate(<FormGroup>this.managForm.controls["propContract_start_date"]),
                contract_end_date: this.processFormDate(<FormGroup>this.managForm.controls["propContract_end_date"]),
                contract_duration: this.getControlValue(<FormGroup>this.managForm.controls.propContract_duration),
                contract_fee: this.getControlValue(<FormGroup>this.managForm.controls.propContract_fee),
                possession_type: this.getControlValue(<FormGroup>this.managForm.controls.propPossessionType),
                webSite: this.processUrl(<FormGroup>this.managForm.controls.propWebSite),
                type: "Proprietario"
            }

            const control = <FormArray>this.managForm.controls['subjects'];
            const subjects: ISubject[] = [];
            subjects.push(prop);
            for (const c of control.controls) {
                const s = {
                    name: this.getControlValue(<FormGroup>(<FormGroup>c).controls.name),
                    surname: this.getControlValue(<FormGroup>(<FormGroup>c).controls.surname),
                    taxCode: this.getControlValue(<FormGroup>(<FormGroup>c).controls.taxCode),
                    fixedPhone: this.getControlValue(<FormGroup>(<FormGroup>c).controls.fixedPhone),
                    mobilePhone: this.getControlValue(<FormGroup>(<FormGroup>c).controls.mobilePhone),
                    pec: this.getControlValue(<FormGroup>(<FormGroup>c).controls.pec),
                    email: this.getControlValue(<FormGroup>(<FormGroup>c).controls.email),
                    webSite: this.processUrl(<FormGroup>(<FormGroup>c).controls.webSite),
                    type: this.getControlValue(<FormGroup>(<FormGroup>c).controls.type),
                    contract_start_date: this.processFormDate(<FormGroup>(<FormGroup>c).controls.contract_start_date),
                    contract_end_date: this.processFormDate(<FormGroup>(<FormGroup>c).controls.contract_end_date),
                    contract_duration: this.getControlValue(<FormGroup>(<FormGroup>c).controls.contract_duration),
                    contract_fee: this.getControlValue(<FormGroup>(<FormGroup>c).controls.contract_fee),
                    possession_type: this.getControlValue(<FormGroup>(<FormGroup>c).controls.possession_type),
                }

                subjects.push(s);
            }
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

        if (this.data != undefined) {
            for (const prop in this.data) {
                if (this.data.hasOwnProperty(prop)) {
                    if (this.managForm.contains(prop)) {
                        if (prop.indexOf("date") == -1) {
                            this.managForm.controls[prop].setValue(this.data[prop]);
                        } else {
                            this.managForm.controls[prop].setValue(this.data[prop] ? (new Date(this.data[prop]).toLocaleDateString() || null) : null);
                        }
                    }
                }
            }
            if (this.data.subject != undefined) {
                const control = <FormArray>this.managForm.controls['subjects'];
                for (const subj of this.data.subject) {
                    if (subj.type != undefined && subj.type.toLowerCase().indexOf("proprietario") > -1) {
                        this.property = subj;
                        this.managForm.controls["propName"].setValue(subj.name);
                        this.managForm.controls["propTaxCode"].setValue(subj.taxCode);
                        this.managForm.controls["propFixedPhone"].setValue(subj.fixedPhone);
                        this.managForm.controls["propPec"].setValue(subj.pec);
                        this.managForm.controls["propEmail"].setValue(subj.email);
                        this.managForm.controls["propWebSite"].setValue(subj.webSite);
                        this.managForm.controls["propContract_start_date"].setValue(subj.contract_start_date ? (new Date(subj.contract_start_date).toLocaleDateString()) : null);
                        this.managForm.controls["propContract_end_date"].setValue(subj.contract_end_date ? (new Date(subj.contract_end_date).toLocaleDateString()) : null);
                        this.managForm.controls["propContract_duration"].setValue(subj.contract_duration);
                        this.managForm.controls["propContract_fee"].setValue(subj.contract_fee);
                        this.managForm.controls["propPossessionType"].setValue(subj.possession_type);
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
        if (this.permissionSub != undefined) {
            this.permissionSub.unsubscribe();
        }
        if (this.maskSaveSub != undefined) {
            this.maskSaveSub.unsubscribe();
        }
        if (this.maskInvalidSub != undefined) {
            this.maskInvalidSub.unsubscribe();
        }
        if (this.maskValidSub != undefined) {
            this.maskValidSub.unsubscribe();
        }
    }

    getManagement(id): Promise<IShelter> {
        return new Promise<IShelter>((resolve, reject) => {
            const revSub = this.revisionService.load$.subscribe(shelter => {
                if (shelter != null && shelter.management != undefined) {
                    if (revSub != undefined) {
                        revSub.unsubscribe();
                    }
                    resolve(shelter);
                } else {
                    const managSub = this.shelterService.getShelterSection(id, "management").subscribe(shelter => {
                        if (shelter.management == undefined) { shelter.management = { subject: [] as [ISubject] }; }
                        this.revisionService.onChildSave(shelter, "management");
                        if (managSub != undefined) {
                            managSub.unsubscribe();
                        }
                        if (revSub != undefined) {
                            revSub.unsubscribe();
                        }
                        resolve(shelter);
                    });
                }
            });
            this.revisionService.onChildLoadRequest("management");
        });
    }

    init(shelId) {
        this.getManagement(shelId)
            .then(shelter => {
                this.initForm(shelter);
            });
    }
}
