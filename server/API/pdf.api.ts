import { IShelterExtended } from '../tools/common';
import { OUT_DIR, MONTHS } from '../tools/constants';
import * as path from 'path';
import * as pdf from 'html-pdf';
import { countContributionFilesByShelter, insertNewFile } from './files.api';
import { Enums } from '../../src/app/shared/types/enums';
import Files_Enum = Enums.Files;

const titleSize = '24px';
const subtitleSize = '20px';
const bodySize = '18px';

function getContributionHtml(title: String, value: Number, rightTitle?: boolean): String {
    if (value == null) {
        value = 0;
    }
    if (rightTitle) {
        return '<div style="max-width:65%"><div align="right" style="font-weight:bold">' +
            title + ' (€): ' + value + '</div></div>';
    } else {
        return '<div style="max-width:65%"><div style="display:inline" align="left">' +
            title + '</div><div style="display:inline;float:right">(€): ' + value + '</div></div>';
    }
}

function createPdfFromHTMLDoc(document, footer): pdf.CreateResult {
    return pdf.create(document, {
        'directory': '/tmp',
        'border': {
            'top': '0.3in',
            'left': '0.6in',
            'bottom': '0.3in',
            'right': '0.6in',
        },
        'footer': {
            'contents': footer
        }
    });
}

function getPDFName(year: Number, type: Enums.Contribution_Type, num: Number): String {
    return year + '_' + type + '_' + num + '.pdf';
}

function getBufferFromPDF(fileIn: pdf.CreateResult): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
        fileIn.toBuffer(function (err, buff) {
            if (err) {
                reject(err);
            } else {
                resolve(buff);
            }
        });
    });
}

function writePDFtoMongo(fileIn: pdf.CreateResult, shelId: String, value: Number, year: Number, type: Enums.Contribution_Type, num: Number)
    : Promise<{ name: String, id: any }> {
    return new Promise<{ name: String, id: any }>((resolve, reject) => {
        getBufferFromPDF(fileIn)
            .then(buff => {
                const file = {
                    size: buff.length,
                    shelterId: shelId,
                    uploadDate: new Date(),
                    name: getPDFName(year, type, num),
                    data: buff,
                    contribution_type: type,
                    contentType: 'application/pdf',
                    type: Files_Enum.File_Type.contribution,
                    invoice_year: year,
                    value: value
                }
                return insertNewFile(<any>file);
            })
            .then(file => {
                resolve({ name: file.name, id: file._id });
            })
            .catch(e => {
                reject(e);
            });
    });
}

export function createContributionPDF(shelter: IShelterExtended): Promise<{ name: String, id: any }> {
    if (shelter && shelter.branch && shelter.contributions && shelter.contributions.data) {
        const contribution = shelter.contributions;
        const assestpath = path.join('file://' + OUT_DIR + '/assets/images/');

        const header = `<div style='text-align:center'>
        <div style='height:100px'><img style='max-width:100%;max-height:100%' src='` + assestpath + `logo_pdf.png' /></div>
        <div style='font-weight: bold;font-size:` + titleSize + `'>CLUB ALPINO ITALIANO</div>
        </div>`;

        let document = `<html><head></head><body>` + header + `
        <br/><div style='font-size:` + bodySize + `' align="right"><span style="text-align:left">
        Spett.<br/>Club Alpino Italiano<br/>Commissione rifugi<br/><span></div><br/><div style='font-weight: bold;font-size:`
            + titleSize + `'>Oggetto: Richiesta di contributi di tipo `
            + contribution.type + ` Rifugi</div><br/>
        <div style='font-weight: 400;font-size:`
            + titleSize + `'>Con la presente vi comunico che la Sezione di ` + shelter.branch + ` intende svolgere nel `
            + (<number>contribution.year + 1) + ` i lavori di manutenzione in seguito descritti,
        predisponendo un piano economico così suddiviso:</div><br/>`;

        document += '<div style="font-weight:400;font-size: ' + subtitleSize + '">'
        document += getContributionHtml('Lavori a corpo', contribution.data.handWorks);
        document += getContributionHtml('Lavori a misura', contribution.data.customizedWorks);
        document += getContributionHtml('Oneri di sicurezza', contribution.data.safetyCharges);
        document += getContributionHtml('Totale Lavori', contribution.data.totWorks, true);
        document += '<br/>';
        document += getContributionHtml('Spese per indagini, rilievi, ecc.', contribution.data.surveyorsCharges);
        document += getContributionHtml('Spese per allacciamenti a reti di distribuzione', contribution.data.connectionsCharges);
        document += getContributionHtml('Spese tecniche', contribution.data.technicalCharges);
        document += getContributionHtml('Spese di collaudo', contribution.data.testCharges);
        document += getContributionHtml('Tasse ed Oneri', contribution.data.taxes);
        document += getContributionHtml('Totale Spese', contribution.data.totCharges, true);
        document += '<br/>';
        if (contribution.data.IVAincluded) {
            document += '<div>IVA compresa poiché non recuperabile</div>';
        }
        document += getContributionHtml('Costo totale del progetto', contribution.data.totalProjectCost);
        document += getContributionHtml('Finanziamento esterno', contribution.data.externalFinancing);
        document += getContributionHtml('Autofinanziamento', contribution.data.selfFinancing);
        document += getContributionHtml('Scoperto', contribution.data.red);
        document += '</div><br/>'

        document += `<div style='font-size:`
            + titleSize + `'><div>Vi richiediamo un contributo di euro (€): `
            + contribution.value + `</div><br/>
        <div>Fiduciosi in un positivo accoglimento, con la presente ci è gradito porgere i nostri più cordiali saluti.</div>
        </div><br/><br/>`;

        const now = new Date(Date.now());
        document += `<div style='font-size:` + titleSize + `'><div style="display:inline" align="left">`
            + (now.getDay() + '/' + (MONTHS[now.getMonth()]) + '/' + now.getFullYear()) + `</div>
        <div style="display:inline;float:right"><div style='text-align:center'>Il Presidente della Sezione di `
            + shelter.branch + `</div></div></div>`;

        let footer = '';
        if (contribution.attachments && contribution.attachments.length > 0) {
            footer += '<div style="font-size: ' + subtitleSize + '"><div style="font-weight:bold">Allegati:<div>';
            contribution.attachments.forEach(file => {
                footer += '<div style="font-weight:400">' + file.name + '</div>';
            });
            footer += '</div>';
        }

        document += '</body></html>';

        const result = createPdfFromHTMLDoc(document, footer);

        return countContributionFilesByShelter(shelter._id)
            .then((num) => writePDFtoMongo(result, shelter._id, contribution.value, contribution.year, contribution.type, num))

    } else {
        return Promise.reject(new Error('Error contribution data'));
    }
}
