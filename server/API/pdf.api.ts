import { IShelterExtended,OUT_DIR,MONTHS } from '../common'; 
import * as path from 'path';
import * as pdf from "html-pdf"
import {countContributionFilesByShelter,insertNewFile} from './files.api';
import { Enums } from "../../src/app/shared/types/enums";
import Files_Enum = Enums.Files;

function getContributionHtml(title:String,value:Number,rightTitle?:boolean):String{
    if(value==null) value=0;
    if(rightTitle){
        return "<div style='max-width:65%'><div align='right' style='font-weight:bold'>"+title+" (€): "+value+"</div></div>"        
    }else{
        return "<div style='max-width:65%'><div style='display:inline' align='left'>"+title+"</div><div style='display:inline;float:right'>(€): "+value+"</div></div>"        
    }
}

export function createPDF(shelter:IShelterExtended):Promise<{name:String,id:any}>{
    if(shelter&&shelter.branch&&shelter.contributions&&shelter.contributions.data){
        let contribution=shelter.contributions;
        const title="24px";
        const subtitle="20px";
        const body="18px";
        return new Promise<{name:String,id:any}>((resolve,reject)=>{
            let assestpath=path.join("file://"+OUT_DIR+"/assets/images/");

            let header = `<div style="text-align:center">
            <div style="height:100px"><img style="max-width:100%;max-height:100%" src="`+assestpath +`logo_pdf.png" /></div>
            <div style="font-weight: bold;font-size:`+title+`">CLUB ALPINO ITALIANO</div>
            </div>`;

            let document = `<html><head></head><body>`+header+`
            <br/><div style="font-size:`+body+`" align='right'><span style='text-align:left'>Spett.<br/>Club Alpino Italiano<br/>Commissione rifugi<br/><span></div><br/>
            <div style="font-weight: bold;font-size:`+title+`">Oggetto: Richiesta di contributi di tipo `+contribution.type+` Rifugi</div><br/>
            <div style="font-weight: 400;font-size:`+title+`">Con la presente vi comunico che la Sezione di `+shelter.branch+` intende svolgere nel 
            `+(<number>contribution.year+1)+` i lavori di manutenzione in seguito descritti,
            predisponendo un piano economico così suddiviso:</div><br/>`;

            document+="<div style='font-weight:400;font-size:"+subtitle+"'>"
            document+=getContributionHtml("Lavori a corpo",contribution.data.handWorks);
            document+=getContributionHtml("Lavori a misura",contribution.data.customizedWorks);
            document+=getContributionHtml("Oneri di sicurezza",contribution.data.safetyCharges);
            document+=getContributionHtml("Totale Lavori",contribution.data.totWorks,true);
            document+="<br/>";
            document+=getContributionHtml("Spese per indagini, rilievi, ecc.",contribution.data.surveyorsCharges);
            document+=getContributionHtml("Spese per allacciamenti a reti di distribuzione",contribution.data.connectionsCharges);
            document+=getContributionHtml("Spese tecniche",contribution.data.technicalCharges);
            document+=getContributionHtml("Spese di collaudo",contribution.data.testCharges);
            document+=getContributionHtml("Tasse ed Oneri",contribution.data.taxes);
            document+=getContributionHtml("Totale Spese",contribution.data.totCharges,true);
            document+="<br/>";
            if(contribution.data.IVAincluded){
                document+="<div>IVA compresa poiché non recuperabile</div>";
            }
            document+=getContributionHtml("Costo totale del progetto",contribution.data.totalProjectCost);
            document+=getContributionHtml("Finanziamento esterno",contribution.data.externalFinancing);
            document+=getContributionHtml("Autofinanziamento",contribution.data.selfFinancing);
            document+=getContributionHtml("Scoperto",contribution.data.red);
            document+="</div><br/>"
            
            document+=`<div style="font-size:`+title+`"><div>Vi richiediamo un contributo di euro (€): `+contribution.value+`</div><br/>
            <div>Fiduciosi in un positivo accoglimento, con la presente ci è gradito porgere i nostri più cordiali saluti.</div></div><br/><br/>`;

            let now=new Date(Date.now());
            document+=`<div style="font-size:`+title+`"><div style='display:inline' align='left'>`+(now.getDay()+"/"+(MONTHS[now.getMonth()])+"/"+now.getFullYear())+`</div>
            <div style='display:inline;float:right'><div style="text-align:center">Il Presidente della Sezione di `+shelter.branch+`</div></div></div>`;

            let footer="";
            if(contribution.attachments&&contribution.attachments.length>0){
                footer+="<div style='font-size:"+subtitle+"'><div style='font-weight:bold'>Allegati:<div>";
                contribution.attachments.forEach(file=>{
                    footer+="<div style='font-weight:400'>"+file.name+"</div>";
                });
                footer+="</div>";
            }

            document+="</body></html>";

            let result = pdf.create(document,{
                "directory": "/tmp",
                "border":{
                    "top":"0.3in",
                    "left":"0.6in",
                    "bottom":"0.3in",
                    "right":"0.6in",
                },
                "footer":{
                    "contents":footer
                }
            });

            /*result.toFile("./doc.pdf",function(err,res){
                resolve(null);
            });*/

            result.toStream(function(err,res){
                if(err){
                    reject(err);
                }else{
                    countContributionFilesByShelter(shelter._id)
                    .then(num=>{
                        var bufs = [];
                        num+=<any>1;
                        res.on('data', function(d){ bufs.push(d); });
                        res.on("end",()=>{
                            let buff = Buffer.concat(bufs);
                            let file={
                                size:buff.length,
                                shelterId:shelter._id,
                                uploadDate:new Date(),
                                name:contribution.year+"_"+contribution.type+"_"+num+".pdf",
                                data:buff,
                                contribution_type:contribution.type,
                                contentType:"application/pdf",
                                type:Files_Enum.File_Type.contribution,
                                invoice_year:contribution.year,
                                value:contribution.value
                            }
                            insertNewFile(<any>file)
                            .then(f=>{
                                resolve({name:f.name,id:f._id});
                            })
                            .catch(err=>{
                                reject(err);
                            });
                        });
                        res.on('error',function(err){
                            reject(err);
                        });
                    })
                    .catch(err=>{
                        reject(err);
                    });
                }
            });
        }); 
    }else{
        return new Promise((resolve,reject)=>{
            reject(new Error("Error contribution data"));
        });
    }
}