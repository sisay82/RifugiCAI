import { Injectable } from '@angular/core'
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { IShelter } from '../shared/types/interfaces';
import { Enums } from '../shared/types/enums';
import Routes = Enums.Routes;

@Injectable()
export class BcSharedService {
    activeOutlet: Routes.Routed_Outlet;
    activeComponent: Routes.Routed_Component;

    private displayErrorSource = new Subject<void>();
    displayError$ = this.displayErrorSource.asObservable();
    onDisplayError() {
        this.displayErrorSource.next();
    }

    private maskSaveSource = new Subject<any>();
    maskSave$ = this.maskSaveSource.asObservable();
    onMaskSave(shelter: any) {
        this.maskSaveSource.next(shelter);
    }

    private toggleMenuSource = new Subject<void>();
    toggleMenu$ = this.toggleMenuSource.asObservable();
    onToggleMenu() {
        this.toggleMenuSource.next();
    }

    private maskInvalidSource = new Subject<void>();
    maskInvalid$ = this.maskInvalidSource.asObservable();
    onMaskInvalid() {
        this.maskInvalidSource.next();
    }

    private masValidSource = new Subject<void>();
    maskValid$ = this.masValidSource.asObservable();
    onMaskValid() {
        this.masValidSource.next();
    }

    private maskCancelSource = new Subject<void>();
    maskCancel$ = this.maskCancelSource.asObservable();
    onMaskCancel() {
        this.maskCancelSource.next();
    }

    private maskCancelConfirmSource = new Subject<void>();
    maskCancelConfirm$ = this.maskCancelConfirmSource.asObservable();
    onMaskConfirmCancel() {
        this.maskCancelConfirmSource.next();
    }

    private maskConfirmSaveSource = new Subject<Routes.Routed_Component>();
    maskConfirmSave$ = this.maskConfirmSaveSource.asObservable();
    onMaskConfirmSave(component: Routes.Routed_Component) {
        this.maskConfirmSaveSource.next(component);
    }

    private activeOutletChangeSource = new Subject<Routes.Routed_Outlet>();
    activeOutletChange$ = this.activeOutletChangeSource.asObservable();
    onActiveOutletChange(outlet: Routes.Routed_Outlet) {
        this.activeOutlet = outlet;
        this.activeOutletChangeSource.next(outlet);
    }

    private sendMaskSaveSource = new Subject();
    sendMaskSave$ = this.sendMaskSaveSource.asObservable();
    onSendMaskSave() {
        this.sendMaskSaveSource.next();
    }

    private setDisableMaskSaveSource = new Subject<boolean>();
    disableMaskSave$ = this.setDisableMaskSaveSource.asObservable();
    onSetDisableMaskSave(val: boolean) {
        this.setDisableMaskSaveSource.next(val)
    }

}

export interface TagEntry {
    name: String,
    type: String,
    placeholder: String,
    initialValue: any
}

export interface ServiceEntry {
    serviceName: String,
    tags: TagEntry[]
}

export const serviceBaseList: ServiceEntry[] = [
    {
        serviceName: "pernottamento",
        tags: [
            { name: "camerate_da_4_posti", type: "number", placeholder: "Es: 8 (solo numeri)", initialValue: 0 },
            { name: "camerate_da_6_posti", type: "number", placeholder: "Es: 10 (solo numeri)", initialValue: 0 },
            { name: "posti_letto", type: "number", placeholder: "Es: 13 (solo numeri)", initialValue: 0 },
            { name: "posti_letto_invernali", type: "number", placeholder: "Es: 5 (solo numeri)", initialValue: 0 },
            { name: "tavolate", type: "number", placeholder: "Es: 6 (solo numeri)", initialValue: 0 },
            { name: "posti_totali", type: "number", placeholder: "Es: 23 (solo numeri)", initialValue: 0 },
            { name: "vendita_sacco_lenzuolo", type: "string", placeholder: "Sì/no, costi, tipologia ecc.", initialValue: "" },
        ]
    }, {
        serviceName: "ristorazione",
        tags: [
            { name: "ristorante", type: "string", placeholder: "Sì/no, orari, restrizioni ecc.", initialValue: "" },
            { name: "accesso_alla_cucina", type: "string", placeholder: "Sì/no, attrezzature presenti ecc.", initialValue: "" }
        ]
    }, {
        serviceName: "acqua",
        tags: [
            { name: "acqua_in_rifugio", type: "string", placeholder: "Sì/no", initialValue: "" },
            { name: "acqua_calda", type: "string", placeholder: "Sì/no", initialValue: "" },
        ]
    }, {
        serviceName: "servizi_igenici",
        tags: [
            { name: "docce", type: "number", placeholder: "Es: 4 (solo numeri)", initialValue: 0 },
            { name: "WC_in_camera", type: "number", placeholder: "Es: 0 (solo numeri)", initialValue: 0 },
            { name: "WC_uso_comune", type: "number", placeholder: "Es: 5 (solo numeri)", initialValue: 0 },
        ]
    }, {
        serviceName: "elettricità",
        tags: [
            { name: "elettricità", type: "string", placeholder: "Sì/no, tipo impianto", initialValue: "" },
            { name: "punti_ricarica_camere", type: "number", placeholder: "Es: 1 (solo numeri)", initialValue: 0 },
            { name: "punti_ricarica_spazi_comuni", type: "number", placeholder: "Es: 6 (solo numeri)", initialValue: 0 },
        ]
    }, {
        serviceName: "WIFI_e_GSM",
        tags: [
            { name: "WIFI", type: "string", placeholder: "Es: WIFI gratuito dalle 10 alle 22", initialValue: "" },
            { name: "segnale_GSM", type: "string", placeholder: "Es: Assente, E, 3G, 4G", initialValue: "" },
            {
                name: "gestore_telefonia_mobile", type: "string",
                placeholder: "Es: Tim, Vodafone, Wind, Coopvoce, Tre, Postemobile", initialValue: ""
            },
        ]
    }, {
        serviceName: "accessibilità",
        tags: [
            { name: "accessibilità_ai_disabili", type: "string", placeholder: "Sì/no, rampa di accesso ecc.", initialValue: "" },
            { name: "servizi_igienici_per_disabili", type: "string", placeholder: "Sì/no", initialValue: "" },
            { name: "accessibilità_famiglie_con_bambini", type: "string", placeholder: "Sì/no", initialValue: "" },
            { name: "accessibilità_macchina", type: "string", placeholder: "Sì/no", initialValue: "" },
            { name: "ammissibilità_animali_domestici", type: "string", placeholder: "Sì/no, limitazioni ecc.", initialValue: "" },
            { name: "stanze_dedicate", type: "number", placeholder: "Es: 1 (solo numeri)", initialValue: 0 },
        ]
    }, {
        serviceName: "servizi_aggiuntivi",
        tags: [
            { name: "pagamento_POS", type: "string", placeholder: "Sì/no", initialValue: "" },
            { name: "convenzioni", type: "string", placeholder: "Es: ANPI, soci ACI ecc.", initialValue: "" },
            { name: "richiesta_di_rifornire_il_rifugio", type: "string", placeholder: "Sì/no", initialValue: "" },
            { name: "presidio_culturale", type: "string", placeholder: "Sì/no", initialValue: "" },
            { name: "attività_culturali/corsi_specifici", type: "string", placeholder: "Sì/no", initialValue: "" },
        ]
    }
];
