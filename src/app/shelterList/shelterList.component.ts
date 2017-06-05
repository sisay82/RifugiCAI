import { Component, OnInit } from '@angular/core';
import {IButton} from '../../shared/interfaces';

@Component({
    moduleId: module.id,
    selector: 'bc-shelters-List',
    templateUrl: 'shelterList.component.html',
    styleUrls: ['shelterList.component.scss']
})
export class BcShelterList {
    list_view_button:IButton={ref:'#',icon:'fa fa-th-list',text:'Lista',enabled:true,dark_theme:false};
    map_view_button:IButton={ref:'map',icon:'fa fa-map-marker',text:'Mappa',enabled:true,dark_theme:false};

    filterText: string = "";
    filteredShelter: any[] = [];

    rifugiSample: any[] = [{
        name: "Sassolungo/Giuliani Reginaldo",
        municipality: "Selva di Val Gardena",
        province: "Bolzano",
        region: "Trentino-Alto Adige"
    }, {
        name: "Torrani Maria Vittoria",
        municipality: "Zoldo Alto",
        province: "Belluno",
        region: "Veneto"
    }, {
        name: "Sigot Mario",
        municipality: "Exilles",
        province: "Torino",
        region: "Piemonte"
    }, {
        name: "Taveggia Angelo",
        municipality: "Chiesa Valmalenco",
        province: "Sondrio",
        region: "Lombardia"
    }, {
        name: "Pelino Cesare Mario",
        municipality: "Pacentro",
        province: "Aquila",
        region: "Abruzzo"
    }, {
        name: "Zilioni Tito",
        municipality: "Arquata del Tronto",
        province: "Ascoli Piceno",
        region: "Marche"
    }, {
        name: "Cavarero Franco",
        municipality: "Ormea",
        province: "Cuneo",
        region: "Piemonte"
    }, {
        name: "Casarotto Renato",
        municipality: "Linguaglossa",
        province: "Catania",
        region: "Sicilia"
    }, {
        name: "CAI Tarvisio",
        municipality: "Tarvisio",
        province: "Udine",
        region: "Friuli-Venezia Giulia"
    }, {
        name: "CAI Alatri",
        municipality: "Guarcino",
        province: "Frosinone",
        region: "Lazio"
    }, {
        name: "Grandinetti Leone",
        municipality: "Zagarise",
        province: "Catanzaro",
        region: "Calabria"
    }, {
        name: "Lago Nero",
        municipality: "Abetone",
        province: "Pistoia",
        region: "Toscana"
    }, {
        name: "Casale Ghezzi",
        municipality: "Norcia",
        province: "Perugia",
        region: "Umbria"
    }, {
        name: "Allavena Franco",
        municipality: "Pigna",
        province: "Imperia",
        region: "Liguria"
    }, {
        name: "Forte dei Marmi",
        municipality: "Stazzema",
        province: "Lucca",
        region: "Toscana"
    }];

    ngOnInit() {
        this.filterText = "";
        this.filteredShelter = this.rifugiSample;
    }

    filterChanged(event: any) {
        var data = this.filterText;
        if (data && this.rifugiSample) {

            const props = ['name', 'municipality', 'province', 'region'];
            this.filteredShelter = this.rifugiSample.filter((item: any) => {
                let match = false;
                for (let prop of props) {
                    if (item[prop].toString().toUpperCase().indexOf(data.toUpperCase()) > -1) {
                        match = true;
                        break;
                    }
                };
                return match;
            });
        }
        else {
            this.filteredShelter = this.rifugiSample;
        }
    }
}