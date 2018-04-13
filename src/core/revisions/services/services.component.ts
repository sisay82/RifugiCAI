import {
    Component, Input, OnInit, trigger, state, style, transition, animate, OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IShelter, IService, ITag } from '../../../app/shared/types/interfaces';
import { FormGroup, FormBuilder, FormControl, FormArray, Validators } from '@angular/forms';
import { ShelterService } from '../../../app/shelter/shelter.service';
import { BcRevisionsService } from '../revisions.service';
import { Animations } from './serviceAnimation';
import { BcSharedService, ServiceBase, ServicePlaceholders } from '../../../app/shared/shared.service';
import { Enums } from '../../../app/shared/types/enums';
import { Subscription } from 'rxjs/Subscription';
import { BcAuthService } from '../../../app/shared/auth.service';
import { RevisionBase } from '../shared/revision_base';
import { CUSTOM_PATTERN_VALIDATORS } from '../../inputs/input_base';

@Component({
    moduleId: module.id,
    selector: 'bc-serv-revision',
    templateUrl: 'services.component.html',
    styleUrls: ['services.component.scss'],
    providers: [ShelterService],
    animations: [Animations.slideInOut]
})
export class BcServRevisionComponent extends RevisionBase implements OnDestroy {
    servForm: FormGroup;
    private newServiceForm: FormGroup;
    private newTagForm: FormGroup;
    private serviceToRemove: String[] = [];
    private serviceList: IService[] = [];
    private currentServiceTag = -1;
    private serviceHidden = true;
    private invalidTag = false;
    private invalidService = false;
    private newServiceAdded = false;
    private newTagHidden = true;
    private serviceListChange = false;
    private placeholders: ServicePlaceholders;
    constructor(shared: BcSharedService,
        shelterService: ShelterService,
        authService: BcAuthService,
        router: Router,
        _route: ActivatedRoute,
        private fb: FormBuilder,
        revisionService: BcRevisionsService) {
        super(shelterService, shared, revisionService, _route, router, authService);
        this.placeholders = new ServicePlaceholders()
        this.servForm = fb.group({
            services: fb.array([])
        });

        this.newServiceForm = fb.group({
            newServiceName: ["Nome Nuovo Servizio", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            newServiceDescription: ["Descrizione Nuovo Servizio", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            newServiceCategory: ["Nuova categoria", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            newServiceTags: fb.array([]),
            newServiceTagKey: ["Informazione", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            newServiceTagValue: ["Valore", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)]
        });

        this.newTagForm = fb.group({
            newTagKey: ["Informazione", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            newTagValue: ["Valore", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
        });

        this.formValidSub = this.servForm.statusChanges.subscribe((value) => {
            if (value === "VALID") {
                if (!this.maskError) {
                    this.displayError = false;
                }
            }
        });

        this.maskSaveSub = shared.maskSave$.subscribe(() => {
            if (!this.maskError && this.servForm.valid) {
                if (this.serviceListChange || this.servForm.dirty) {
                    this.disableSave = true;
                    this.save(true);
                } else {
                    this.shared.onMaskConfirmSave(Enums.Routes.Routed_Component.services);
                }
            } else {
                this.abortSave();
            }
        });

        shared.activeComponent = Enums.Routes.Routed_Component.services;
    }

    getFormControls(controlName) {
        return (<FormGroup>this.servForm.get(controlName)).controls;
    }

    getControl(control: FormGroup, controlName) {
        return control.get(controlName);
    }

    getFormControlsByControl(control: FormGroup, controlName) {
        return (<FormGroup>this.getControl(control, controlName)).controls;
    }

    checkValidForm() {
        return this.servForm.valid;
    }

    toggleNewTag() {
        this.newTagHidden = !this.newTagHidden;
    }

    isNewTagHidden() {
        return this.newTagHidden;
    }

    toggleTag(serviceIndex: number): void {
        if (this.currentServiceTag === serviceIndex) {
            this.currentServiceTag = -1;
        } else {
            this.currentServiceTag = serviceIndex;
        }
    }

    isHiddenTag(serviceIndex): boolean {
        return !(this.currentServiceTag === serviceIndex);
    }

    toggleNewService(): void {
        this.serviceHidden = !this.serviceHidden;
    }

    isHiddenNewService(): boolean {
        return this.serviceHidden;
    }

    removeService(serviceIndex) {
        this.serviceListChange = true;
        const services = <FormArray>this.servForm.get('services');
        if (this.serviceList[serviceIndex]) {
            const service = this.serviceList[serviceIndex];
            if (service) {
                if (!this.serviceToRemove) {
                    this.serviceToRemove = [];
                }
                this.serviceToRemove.push(service._id);
            }
        }
        services.removeAt(serviceIndex);
    }

    addNewService() {
        this.serviceListChange = true;
        this.newServiceAdded = true;

        if (this.newServiceForm.valid) {
            const control = (<FormArray>this.servForm.get('services'));

            const service: IService = {
                name: this.newServiceForm.get('newServiceName').value || null,
                category: this.newServiceForm.get('newServiceCategory').value,
                description: this.newServiceForm.get('newServiceDescription').value || null
            }
            const tags: any = [];

            for (const tag of (<FormArray>this.newServiceForm.get('newServiceTags')).controls) {
                const t = <FormGroup>tag
                tags.push({ key: t.get('key').value, value: t.get('value').value });
            }
            service.tags = tags;
            const currentService: FormGroup = <FormGroup>control.controls.find(ser =>
                ser.value.category.toLowerCase().indexOf(this.newServiceForm.get('newServiceCategory').value.toLowerCase()) > -1);

            if (currentService) {
                for (const tag of tags) {
                    const currentTag: FormGroup = <FormGroup>(<FormArray>currentService.get('tags')).controls.find(t =>
                        t.value.key.toLowerCase().indexOf(tag.key.toLowerCase()) > -1);
                    if (currentTag == null) {
                        (<FormArray>currentService.get('tags')).push(this.initTag(tag.key, tag.value));
                    }
                }
            } else {
                control.push(this.initService({ category: service.category, tags: tags }));
            }
            this.resetServiceForm();
        } else {
            this.invalidService = true;
        }

    }

    resetServiceForm() {
        this.newServiceForm = this.fb.group({
            newServiceName: ["Nome Nuovo Servizio", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            newServiceDescription: ["Descrizione Nuovo Servizio", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            newServiceCategory: ["Nuova categoria", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            newServiceTags: this.fb.array([]),
            newServiceTagKey: ["Informazione", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            newServiceTagValue: ["Valore", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)]
        });
        this.toggleNewService();
    }

    initService(service: IService) {
        const group: FormGroup = this.fb.group({
            id: [service._id],
            category: [service.category],
            tags: this.fb.array([])
        });
        for (const tag of service.tags) {
            (<FormArray>group.get('tags')).push(this.initTag(tag.key, tag.value, tag.type));
        }

        return group;
    }

    removeTag(serviceIndex: number, tagIndex: number) {
        this.serviceListChange = true;
        const control = <FormGroup>(<FormArray>this.servForm.get('services')).at(serviceIndex);
        const tags = <FormArray>control.get('tags');
        if (tags.length === 1) {
            this.removeService(serviceIndex);
        } else {
            tags.removeAt(tagIndex);
        }
    }

    resetTagForm(serviceIndex) {
        if (serviceIndex > -1) {
            this.newTagForm = this.fb.group({
                newTagKey: ["Informazione", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
                newTagValue: ["Valore", Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
            });
            this.toggleTag(serviceIndex);
        } else {
            this.newServiceForm.get('newServiceTagKey').setValue("Informazione");
            this.newServiceForm.get('newServiceTagValue').setValue("Valore");

            this.toggleNewTag();
        }
    }

    removeNewTag(tagIndex: number) {
        const control = <FormArray>this.newServiceForm.get('newServiceTags');
        control.removeAt(tagIndex);
    }

    addNewTag(serviceIndex: number) {
        this.serviceListChange = true;
        const service = <FormGroup>(<FormArray>this.servForm.get('services')).at(serviceIndex);
        if (this.newTagForm.valid) {
            const control = <FormArray>service.get('tags');
            for (const c of control.controls) {
                if (c.value.key.toLowerCase().indexOf(this.newTagForm.get("newTagKey").value.toLowerCase()) > -1) {
                    this.invalidTag = true;
                    return;
                }
            }
            control.push(this.initTag(this.newTagForm.get("newTagKey").value, this.newTagForm.get("newTagValue").value));
            this.resetTagForm(serviceIndex);
        } else {
            this.invalidTag = true;
        }
    }

    addNewServiceTag() {
        if (this.newServiceForm.get('newServiceTagKey').valid && this.newServiceForm.get('newServiceTagValue').valid) {
            const control = <FormArray>this.newServiceForm.get('newServiceTags');
            for (const c of control.controls) {
                if (c.value.key.toLowerCase().indexOf(this.newServiceForm.get("newServiceTagKey").value.toLowerCase()) > -1) {
                    this.invalidService = true;
                    return;
                }
            }
            control.push(
                this.initTag(this.newServiceForm.get("newServiceTagKey").value,
                    this.newServiceForm.get("newServiceTagValue").value)
            );
            this.resetTagForm(-1);
        } else {
            this.invalidService = true;
        }
    }

    initTag(key: String, value: String, type?: String) {
        if (type) {
            return this.fb.group({
                key: [key, Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
                value: [value, Validators.pattern(CUSTOM_PATTERN_VALIDATORS[this.getValidator(type)])],
                type: type
            });
        } else {
            return this.fb.group({
                key: [key, Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator)],
                value: [value, Validators.pattern(CUSTOM_PATTERN_VALIDATORS[this.getValidator(type)])]
            });
        }
    }

    save(confirm) {
        if (!confirm || this.servForm.valid) {
            const shelter: any = { _id: this._id, name: this.name };
            const services: IService[] = []

            for (const s of (<FormArray>this.servForm.get('services')).controls) {
                const serv = <FormGroup>s;
                const service: IService = {
                    name: serv.value.name,
                    category: serv.value.category,
                    description: serv.value.description,
                };
                if (serv.value.id) {
                    service._id = serv.value.id;
                }
                const tags: ITag[] = this.getFormArrayValues(<FormArray>serv.get('tags')).filter(val => val.key && val.value);
                service.tags = tags as [ITag];
                services.push(service);
            }

            if (this.serviceToRemove) {
                this.serviceToRemove.forEach(service => {
                    services.push({ _id: service });
                });
            }
            delete (this.serviceToRemove);

            shelter.services = services;
            if (!this.newServiceAdded) {
                this.revisionService.onChildSave(shelter, "services");
            } else {
                this.revisionService.onChildDelete("services");
            }

            this.processSavePromise(shelter, "services")
                .then(() => {
                    this.displayError = false;
                    if (confirm) {
                        this.shared.onMaskConfirmSave(Enums.Routes.Routed_Component.services);
                    }
                })
                .catch(err => {
                    console.log(err);
                    this.abortSave();
                });

        } else {
            this.abortSave();
        }
    }

    getValidator(value) {
        switch (value) {
            case ("number"): {
                return "numberValidator";
            };
            case ("string"): {
                return "stringValidator";
            };
            default: {
                return "stringValidator";
            }
        }
    }

    uglifyString(str: String): string {
        return str.replace(/(\s)/g, "_");
    }

    decapitalize(str: String): string {
        return str.charAt(0).toLowerCase() + str.slice(1);
    }

    getPlaceholder(category, name) {
        category = this.uglifyString(category);
        name = this.uglifyString(name);

        if (this.placeholders.service[category.toLowerCase()]) {
            category = category.toLowerCase();
        } else if (this.placeholders.service[this.decapitalize(category)]) {
            category = this.decapitalize(category);
        } else if (!this.placeholders.service[category]) {
            return "";
        }

        if (this.placeholders.service[category][name.toLowerCase()]) {
            name = name.toLowerCase();
        } else if (this.placeholders.service[category][this.decapitalize(name)]) {
            name = this.decapitalize(name);
        } else if (!this.placeholders.service[category][name]) {
            return "";
        }

        return this.placeholders.service[category][name];

    }

    initForm(shelter: IShelter) {
        this.name = shelter.name;
        const serviceList = new ServiceBase();
        for (const category of Object.getOwnPropertyNames(serviceList)) {
            const s: IService = {};
            s.name = s.category = category;
            s.tags = [] as [ITag];
            const serv = shelter.services.find(obj => obj.category && obj.category === category);
            for (const service of Object.getOwnPropertyNames(serviceList[category])) {
                const tag = { key: service, value: null, type: typeof (serviceList[category][service]) };
                if (serv) {
                    s._id = serv._id;
                    const t = serv.tags.find(obj => obj.key === tag.key);
                    if (t && t.value !== "") {
                        tag.value = t.value;
                    }
                } else {
                    this.serviceListChange = true;
                }
                s.tags.push(tag);
            }
            this.serviceList.push(s);
            (<FormArray>this.servForm.get('services')).push(this.initService(s));
        }
        const servRemove: IService[] = shelter.services.filter(obj => {
            if (obj._id) {
                for (const serv of this.serviceList) {
                    if (serv._id) {
                        if (serv._id.toLowerCase().indexOf(obj._id.toString()) > -1) {
                            return false;
                        }
                    }
                }
            }

            return true;
        });

        servRemove.forEach(val => {
            if (!this.serviceToRemove) {
                this.serviceToRemove = [val._id];
            } else {
                this.serviceToRemove.push(val._id);
            }
        });
    }

    ngOnDestroy() {
        if (this.serviceListChange || this.servForm.dirty) {
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
        this.getData(shelId, "services")
            .then(shelter => {
                this.initForm(shelter);
            });
    }

    getEmptyObjData(section) {
        return [];
    }
}
