import {Injectable } from '@angular/core'
import { Subject } from 'rxjs/Subject';
import { IShelter } from '../shared/types/interfaces';

@Injectable()
export class BcSharedService{
    activeOutlet:string;
    activeComponent:string;

    private displayErrorSource = new Subject<void>();
    displayError$ = this.displayErrorSource.asObservable();
    onDisplayError(){
        this.displayErrorSource.next();
    }

    private maskSaveSource = new Subject<any>();
    maskSave$ = this.maskSaveSource.asObservable();
    onMaskSave(shelter:any){
        this.maskSaveSource.next(shelter);
    }

    private toggleMenuSource = new Subject<void>();
    toggleMenu$ = this.toggleMenuSource.asObservable();
    onToggleMenu(){
        this.toggleMenuSource.next();
    }

    private maskInvalidSource = new Subject<void>();
    maskInvalid$ = this.maskInvalidSource.asObservable();
    onMaskInvalid(){
        this.maskInvalidSource.next();
    }

    private masValidSource = new Subject<void>();
    maskValid$ = this.masValidSource.asObservable();
    onMaskValid(){
        this.masValidSource.next();
    }

    private maskCancelSource = new Subject<void>();
    maskCancel$ = this.maskCancelSource.asObservable();
    onMaskCancel(){
        this.maskCancelSource.next();
    }

    private maskCancelConfirmSource = new Subject<void>();
    maskCancelConfirm$ = this.maskCancelConfirmSource.asObservable();
    onMaskConfirmCancel(){
        this.maskCancelConfirmSource.next();
    }

    private maskConfirmSaveSource = new Subject<string>();
    maskConfirmSave$ = this.maskConfirmSaveSource.asObservable();
    onMaskConfirmSave(component:string){
        this.maskConfirmSaveSource.next(component);
    }

    private activeOutletChangeSource = new Subject<string>();
    activeOutletChange$ = this.activeOutletChangeSource.asObservable();
    onActiveOutletChange(outlet:string){
        this.activeOutlet=outlet;
        this.activeOutletChangeSource.next(outlet);
    }

}

export class ServiceBase {
    pernottamento:{
        camerate:Number;
        cuccette:Number;
        cuccette_invernali:Number;
        tavolato:Number;
        posti_totali:Number;
        vendita_sacco_lenzuolo:String;
    };
    ristorazione:{
        ristorante:String;
        accesso_alla_cucina:String;
    };
    acqua:{
        acqua_in_rifugio:String;
        acqua_calda:String;
    };
    servizi_igenici:{
        docce:Number;
        WC_in_camera:Number;
        WC_uso_comune:Number;
    };
    elettricità:{
        elettricità:String;
        punti_ricarica_camere:Number;
        punti_ricarica_spazi_comuni:Number;
    };
    WIFI_e_GSM:{
        WIFI:String;
        segnale_GSM:String;
        gestore_telefonia_mobile:String;
    };
    accessibilità:{
        accessibilità_ai_disabili:String;
        accessibilità_macchina:String;
        accessibilità_animali_domestici:String;
        stanze_dedicate:Number;
    };
    servizi_aggiuntivi:{
        pagamento_POS:String;
        convenzioni:String;
        richiesta_di_rifornire_il_rifugio:String;
    };

    constructor(){
        this.pernottamento={
            camerate:0,
            cuccette:0,
            cuccette_invernali:0,
            tavolato:0,
            posti_totali:0,
            vendita_sacco_lenzuolo:""
        };
        this.ristorazione={
            ristorante:"",
            accesso_alla_cucina:""
        };
        this.acqua={
            acqua_calda:"",
            acqua_in_rifugio:""
        }
        this.servizi_igenici={
            docce:0,
            WC_in_camera:0,
            WC_uso_comune:0
        }
        this.elettricità={
            elettricità:"",
            punti_ricarica_camere:0,
            punti_ricarica_spazi_comuni:0
        };
        this.WIFI_e_GSM={
            WIFI:"",
            segnale_GSM:"",
            gestore_telefonia_mobile:""
        };
        this.accessibilità={
            accessibilità_ai_disabili:"",
            accessibilità_macchina:"",
            accessibilità_animali_domestici:"",
            stanze_dedicate:0
        };
        this.servizi_aggiuntivi={
            pagamento_POS:"",
            convenzioni:"",
            richiesta_di_rifornire_il_rifugio:""
        };
    }
}