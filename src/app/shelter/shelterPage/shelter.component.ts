import { Component, Directive, Input, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { IMenu } from '../../shared/types/interfaces';
import { BcSharedService } from '../../shared/shared.service';
import { BcAuthService } from '../../shared/auth.service';
import { Subscription } from 'rxjs';
import { Enums } from '../../shared/types/enums';
import Routes = Enums.Routes;
@Directive({
    selector: 'a[bc-menu-element]',
    host: {
        '[class.active]': 'active'
    }
})
export class BcMenuElementStyler {
    @Input('bc-menu-element') active: boolean;
}

@Component({
    moduleId: module.id,
    selector: 'bc-shelter',
    templateUrl: 'shelter.component.html',
    styleUrls: ['shelter.component.scss']

})
export class BcShelter implements AfterViewInit {
    private authorization: boolean;

    appMenuElements: IMenu = {
        layers: [
            {
                layerName: "detail",
                elements: [
                    { name: "Dati geografici", icon: "map-signs", link: Routes.Routed_Component.geographic },
                    { name: "Servizi", icon: "home", link: Routes.Routed_Component.services },
                    { name: "Contatti e apertura", icon: "phone", link: Routes.Routed_Component.contacts },
                    { name: "Proprietà e custodia", icon: "user", link: Routes.Routed_Component.management },
                    { name: "Dati catastali", icon: "book", link: Routes.Routed_Component.catastal }
                ]
            }, {
                layerName: "document",
                elements: [
                    { name: "Documenti", icon: "file-pdf-o", link: Routes.Routed_Component.documents },
                    { name: "Immagini", icon: "picture-o", link: Routes.Routed_Component.images },
                ]
            }, {
                layerName: "economy",
                elements: [
                    { name: "Economia", icon: "certificate", link: Routes.Routed_Component.economy },
                    { name: "Richiesta contributi", icon: "eur", link: Routes.Routed_Component.contribution },
                    { name: "Fruizione", icon: "bar-chart", link: Routes.Routed_Component.use }
                ]
            }
        ]
    };

    constructor(private shared: BcSharedService, private authService: BcAuthService, private cd: ChangeDetectorRef) { }

    getLink(link: String): any {
        const outlet = this.shared.activeOutlet;
        let routerLink;
        if (outlet == Routes.Routed_Outlet.revision) {
            routerLink = [{ outlets: ({ 'revision': [link], 'content': null }) }];
        } else {
            routerLink = [{ outlets: ({ 'content': [link], 'revision': null }) }];
        }
        return routerLink;
    }

    isActiveLink(link: Routes.Routed_Component) {
        const component = this.shared.activeComponent;
        return (component == link)
    }

    getAuth() {
        return this.authorization;
    }

    ngAfterViewInit() {
        const permSub = this.authService.getUserProfile().subscribe(profile => {
            if (profile) {
                this.authorization = true;
            }
            if (permSub) {
                permSub.unsubscribe();
            }
            this.cd.detectChanges();
        });
    }
}
