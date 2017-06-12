import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { IMarker, IShelter,IService } from '../../shared/interfaces';

@Injectable()
export class ShelterService{
     shelters:IShelter[]=[
        {id:"id1",name:"Shelter1",registry:{address:{via:"via",number:1,cap:1,city:"city1",collective:"Comune1",country:"Regione1",district:"Provincia1"}},geographic_data:{coordinates:{latitude:43.14,longitude:11.25}}},
        {id:"id2",name:"Shelter2",geographic_data:{coordinates:{latitude:43.4,longitude:11.5}},registry:{address:{via:"via",number:2,cap:2,city:"city2",collective:"Comune2",country:"Regione2",district:"Provincia2"}}},
        {id:"id3",name:"Shelter3",geographic_data:{coordinates:{latitude:43.14,longitude:11.42}}, registry:{address:{via:"via",number:3,cap:3,city:"city3",collective:"Comune3",country:"Regione3",district:"Provincia3"}}}
    ];

    services:IService[]=[
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

    getByName(name:string):IShelter{
        return this.shelters[0];
    }


    getServByName(name:string):IService[]{
        return this.services;
    }

    /**
     * Return shelters in the area around @point
     * @param point
     */
    getShelters(point:L.LatLng,area:number):IShelter[]{
        return this.shelters;
    }

    /**
     * Return markers of shelters of the given country.
     * @param country
     */
    getConutryMarkers(country:string):IShelter[]{
        return this.shelters;
    }
}