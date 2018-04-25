import { IShelterExtended } from '../tools/common';
import { OUT_DIR, MONTHS } from '../tools/constants';
import * as path from 'path';
// import * as pdf from 'html-pdf';
import { countContributionFilesByShelter, insertNewFile } from './files.api';
import { Enums } from '../../src/app/shared/types/enums';
import Files_Enum = Enums.Files;
import { IFile } from '../../src/app/shared/types/interfaces';
import * as printer from 'pdfmake/src/printer';
import { TDocumentDefinitions } from 'pdfmake/build/pdfmake';

const titleSize = 16;
const subtitleSize = 10;
const bodySize = 13;
const contentSize = 11;

const imageFilePath = path.join('file://' + OUT_DIR + '/assets/images/');
const assetsPath = path.join(OUT_DIR + '/assets/');
const fontDescriptors = {
    Roboto: {
        normal: path.join(assetsPath, 'fonts/Roboto/Roboto-Regular.ttf'),
        bold: path.join(assetsPath, 'fonts/Roboto/Roboto-Medium.ttf'),
        italics: path.join(assetsPath, 'fonts/Roboto/Roboto-Italic.ttf'),
        bolditalics: path.join(assetsPath, 'fonts/Roboto/Roboto-MediumItalic.ttf')
    }

};
const pdfPrinter = new printer(fontDescriptors);

function getPDFContributionName(year: Number, type: Enums.Contribution_Type, num: Number): String {
    return year + '_' + type + '_' + num + '.pdf';
}

function createPdf(docDescriptor): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
        const doc = pdfPrinter.createPdfKitDocument(docDescriptor);

        const chunks = [];
        doc.on('data', function (chunk) {
            chunks.push(chunk);
        });
        doc.on('error', function (e) {
            reject(e);
        });
        doc.on('end', function () {
            resolve(Buffer.concat(chunks))
        });
        doc.end();
    });
}

function getEntry(entry, value, titleRight?) {
    if (titleRight) {
        return {
            columns: [
                " ",
                " ",
                {
                    text: [
                        entry,
                        { text: "(€): " + (value || 0) }
                    ],
                    margin: [6, 0, 0, 0]
                }
            ], style: 'table',
            bold: true
        }
    } else {
        return {
            columns: [
                entry,
                " ",
                " ",
                " ",
                "(€): " + (value || 0)
            ], style: 'table'
        }
    }
}

function getLineBreak() {
    return { text: " " };
}

export function createContributionPDF(shelter: IShelterExtended): Promise<{ name: String, id: any }> {
    if (shelter && shelter.branch && shelter.contributions && shelter.contributions.data) {
        const contribution = shelter.contributions;
        const now = new Date(Date.now());
        const docDescriptor: TDocumentDefinitions = {
            content: [
                { image: path.join(assetsPath, "images/logo_pdf.png"), fit: [100, 100], alignment: 'center' },
                { text: "CLUB ALPINO ITALIANO", style: 'header', alignment: 'center' },
                getLineBreak(),
                { text: "Spett.", style: 'subHeader' },
                { text: "Club Alpino Italiano", style: 'subHeader' },
                { text: "Commissione rifugi", style: 'subHeader' },
                getLineBreak(),
                {
                    text: "Oggetto: Richiesta di contributi di tipo " + contribution.type + " Rifugi",
                    style: 'body',
                    bold: true
                },
                getLineBreak(),
                {
                    text: `Con la presente vi comunico che la Sezione di `
                        + shelter.branch + ` intende svolgere nel ` + (<number>contribution.year + 1)
                        + ` i lavori di manutenzione in seguito descritti, predisponendo un piano economico così suddiviso:`,
                    fontSize: bodySize
                },
                getLineBreak(),
                getEntry("Lavori a corpo", contribution.data.handWorks),
                getEntry("Lavori a misura", contribution.data.customizedWorks),
                getEntry("Oneri di sicurezza", contribution.data.safetyCharges),
                getEntry("Totale Lavori", contribution.data.totWorks, true),
                getLineBreak(),
                getEntry("Spese per indagini, rilievi, ecc.", contribution.data.surveyorsCharges),
                getEntry("Spese per allacciamenti a reti di distribuzione", contribution.data.connectionsCharges),
                getEntry("Spese tecniche", contribution.data.technicalCharges),
                getEntry("Spese di collaudo", contribution.data.testCharges),
                getEntry("Tasse ed Oneri", contribution.data.taxes),
                getEntry("Totale Spese", contribution.data.totCharges, true),
                getLineBreak(),
                contribution.data.IVAincluded ? {
                    text: "IVA compresa poiché non recuperabile",
                    style: 'table'
                } : null,
                getEntry("Costo totale del progetto", contribution.data.totalProjectCost),
                getEntry("Finanziamento esterno", contribution.data.externalFinancing),
                getEntry("Autofinanziamento", contribution.data.selfFinancing),
                getEntry("Scoperto", contribution.data.red),
                getLineBreak(),
                { text: "Vi richiediamo un contributo di euro (€): " + contribution.value, fontSize: bodySize },
                getLineBreak(),
                {
                    text: "Fiduciosi in un positivo accoglimento, con la presente ci è gradito porgere i nostri più cordiali saluti.",
                    fontSize: bodySize
                },
                getLineBreak(),
                {
                    columns: [
                        (now.getDay() + '/' + (MONTHS[now.getMonth()]) + '/' + now.getFullYear()),
                        {
                            text: "Il Presidente della Sezione di " + shelter.branch,
                            alignment: 'right'
                        }
                    ], fontSize: bodySize
                }
            ],
            styles: {
                header: {
                    bold: true,
                    fontSize: titleSize
                },
                subHeader: {
                    alignment: 'right',
                    fontSize: subtitleSize
                },
                body: {
                    fontSize: bodySize
                },
                table: {
                    fontSize: contentSize
                }
            }
        }
        if (contribution.attachments && contribution.attachments.length > 0) {
            docDescriptor.content.push(getLineBreak());
            docDescriptor.content.push({
                text: "Allegati:",
                fontSize: contentSize,
                bold: true
            });
            contribution.attachments.forEach(file => {
                docDescriptor.content.push({
                    text: file.name, fontSize: contentSize
                });
            });
        }

        const f: IFile = {
            shelterId: shelter._id,
            uploadDate: new Date(),
            contribution_type: contribution.type,
            contentType: 'application/pdf',
            type: Files_Enum.File_Type.contribution,
            invoice_year: contribution.year,
        }

        return Promise.all([
            createPdf(docDescriptor),
            countContributionFilesByShelter(shelter._id)
        ])
            .then(values => {
                const num = values["1"];
                const buff = values["0"];
                f.name = getPDFContributionName(contribution.year, contribution.type, num);
                f.value = num;
                f.size = buff.length;
                f.data = buff
                return insertNewFile(<any>f);
            })
            .then(file => {
                return Promise.resolve({ name: file.name, id: file._id });
            })
            .catch(err => Promise.reject(err))
    } else {
        return Promise.reject(new Error('Error contribution data'));
    }
}
