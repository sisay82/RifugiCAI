import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import * as Interfaces from '../../shared/interfaces';
import { Enums } from '../../shared/enums';
@Injectable()
export class ShelterService{
     shelters:Interfaces.IShelter[]=[
        {name:"Shelter1",administrative:{key_collect:{name:'n1',phone:'2',mail:'m2'},shelter_code:1,contract_start_date:new Date(0,0,1),p_iva:'a1b2',contract_end_date:new Date(0,0,2),contract_duration:24,contract_fee:100,possession_title:'title',custody_type:Enums.Custody_Type.Diretta,custodian:'c1',owner:'ow1'},contacts:{fixed_phone:'11',mobile_phone:'12',mail_pec:'ep1',email_address:'m1',web_address:'w1',openings:[{opening_date:new Date(1,1,1),closure_date:new Date(1,1,2),opening_type:'t1'},{opening_date:new Date(1,2,1),closure_date:new Date(1,2,2),opening_type:'t2'}]},registry:{id:"id1",address:{via:"via",number:1,cap:1,city:"city1",collective:"Comune1",country:"Regione1",district:"Provincia1"}},geographic_data:{coordinates:{latitude:43.14,longitude:11.25}}},
        {name:"Shelter2",geographic_data:{coordinates:{latitude:43.4,longitude:11.5}},registry:{id:"id2",address:{via:"via",number:2,cap:2,city:"city2",collective:"Comune2",country:"Regione2",district:"Provincia2"}}},
        {name:"Shelter3",geographic_data:{coordinates:{latitude:43.14,longitude:11.42}}, registry:{id:"id3",address:{via:"via",number:3,cap:3,city:"city3",collective:"Comune3",country:"Regione3",district:"Provincia3"}}}
    ];

    services:Interfaces.IService[]=[
        {service_name:'Serv1',service_category:'cat1',description:'desc1',tags:[
                {key:'chiave1',value:'value1'},
                {key:'chiave2',value:'value2'}]
            ,options:['option1','option2']},
        {service_name:'Serv2',description:'desc1',tags:[
            {key:'chiave1',value:'value1'},
            ]},
        {service_name:'Serv3',service_category:'cat1',tags:[
            {key:'chiave1',value:'value1'},
            {key:'chiave2',value:'value2'},
            {key:'chiave3',value:'value3'}
            ]},
        {service_name:'Serv4',service_category:'cat1',description:'desc1',options:['option1','option2','option3']},
        {service_name:'Serv5',options:['option1','option2','option3']},
    ];

    getCadastralsByName(name:string):Interfaces.ICadastral{
        return {};
    }

    getAdminByName(name:string):Interfaces.IAdministrative{
        return this.shelters[0].administrative;
    }

    getHeaderByName(name:string):Interfaces.IRegistry{
        return this.shelters[0].registry;
    }

    getGeographicByName(name:string):Interfaces.IGeographic{
        return this.shelters[0].geographic_data;
    }

    getServByName(name:string):Interfaces.IService[]{
        return this.services;
    }

    getContactsByName(name:string):Interfaces.IContacts{
        return this.shelters[0].contacts;
    }

    /**
     * Return shelters in the area around @point
     * @param point
     */
    getShelters(point:L.LatLng,area:number):Interfaces.IShelter[]{
        return this.shelters;
    }

    /**
     * Return markers of shelters of the given country.
     * @param country
     */
    getConutryMarkers(country:string):Interfaces.IShelter[]{
        return this.shelters;
    }
}