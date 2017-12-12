"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constants_1 = require("../constants");
var path = require("path");
var pdf = require("html-pdf");
var files_api_1 = require("./files.api");
var enums_1 = require("../../src/app/shared/types/enums");
var Files_Enum = enums_1.Enums.Files;
var titleSize = '24px';
var subtitleSize = '20px';
var bodySize = '18px';
function getContributionHtml(title, value, rightTitle) {
    if (value == null) {
        value = 0;
    }
    if (rightTitle) {
        return '<div style="max-width:65%"><div align="right" style="font-weight:bold">' +
            title + ' (€): ' + value + '</div></div>';
    }
    else {
        return '<div style="max-width:65%"><div style="display:inline" align="left">' +
            title + '</div><div style="display:inline;float:right">(€): ' + value + '</div></div>';
    }
}
function createPdfFromHTMLDoc(document, footer) {
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
function getPDFName(year, type, num) {
    return year + '_' + type + '_' + num + '.pdf';
}
function writePDFtoMongo(fileIn, shelId, value, year, type, num) {
    return new Promise(function (resolve, reject) {
        fileIn.toStream(function (err, res) {
            if (err) {
                reject(err);
            }
            else {
                var bufs_1 = [];
                num += 1;
                res.on('data', function (d) { bufs_1.push(d); });
                res.on('end', function () {
                    var buff = Buffer.concat(bufs_1);
                    var file = {
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
                    };
                    files_api_1.insertNewFile(file)
                        .then(function (f) {
                        resolve({ name: f.name, id: f._id });
                    })
                        .catch(function (e) {
                        reject(e);
                    });
                });
                res.on('error', function (e) {
                    reject(e);
                });
            }
        });
    });
}
function createContributionPDF(shelter) {
    if (shelter && shelter.branch && shelter.contributions && shelter.contributions.data) {
        var contribution_1 = shelter.contributions;
        var assestpath = path.join('file://' + constants_1.OUT_DIR + '/assets/images/');
        var header = "<div style='text-align:center'>\n        <div style='height:100px'><img style='max-width:100%;max-height:100%' src='" + assestpath + "logo_pdf.png' /></div>\n        <div style='font-weight: bold;font-size:" + titleSize + "'>CLUB ALPINO ITALIANO</div>\n        </div>";
        var document_1 = "<html><head></head><body>" + header + "\n        <br/><div style='font-size:" + bodySize + "' align=\"right\"><span style=\"text-align:left\">\n        Spett.<br/>Club Alpino Italiano<br/>Commissione rifugi<br/><span></div><br/><div style='font-weight: bold;font-size:"
            + titleSize + "'>Oggetto: Richiesta di contributi di tipo "
            + contribution_1.type + " Rifugi</div><br/>\n        <div style='font-weight: 400;font-size:"
            + titleSize + "'>Con la presente vi comunico che la Sezione di " + shelter.branch + " intende svolgere nel "
            + (contribution_1.year + 1) + " i lavori di manutenzione in seguito descritti,\n        predisponendo un piano economico cos\u00EC suddiviso:</div><br/>";
        document_1 += '<div style="font-weight:400;font-size: ' + subtitleSize + '">';
        document_1 += getContributionHtml('Lavori a corpo', contribution_1.data.handWorks);
        document_1 += getContributionHtml('Lavori a misura', contribution_1.data.customizedWorks);
        document_1 += getContributionHtml('Oneri di sicurezza', contribution_1.data.safetyCharges);
        document_1 += getContributionHtml('Totale Lavori', contribution_1.data.totWorks, true);
        document_1 += '<br/>';
        document_1 += getContributionHtml('Spese per indagini, rilievi, ecc.', contribution_1.data.surveyorsCharges);
        document_1 += getContributionHtml('Spese per allacciamenti a reti di distribuzione', contribution_1.data.connectionsCharges);
        document_1 += getContributionHtml('Spese tecniche', contribution_1.data.technicalCharges);
        document_1 += getContributionHtml('Spese di collaudo', contribution_1.data.testCharges);
        document_1 += getContributionHtml('Tasse ed Oneri', contribution_1.data.taxes);
        document_1 += getContributionHtml('Totale Spese', contribution_1.data.totCharges, true);
        document_1 += '<br/>';
        if (contribution_1.data.IVAincluded) {
            document_1 += '<div>IVA compresa poiché non recuperabile</div>';
        }
        document_1 += getContributionHtml('Costo totale del progetto', contribution_1.data.totalProjectCost);
        document_1 += getContributionHtml('Finanziamento esterno', contribution_1.data.externalFinancing);
        document_1 += getContributionHtml('Autofinanziamento', contribution_1.data.selfFinancing);
        document_1 += getContributionHtml('Scoperto', contribution_1.data.red);
        document_1 += '</div><br/>';
        document_1 += "<div style='font-size:"
            + titleSize + "'><div>Vi richiediamo un contributo di euro (\u20AC): "
            + contribution_1.value + "</div><br/>\n        <div>Fiduciosi in un positivo accoglimento, con la presente ci \u00E8 gradito porgere i nostri pi\u00F9 cordiali saluti.</div>\n        </div><br/><br/>";
        var now = new Date(Date.now());
        document_1 += "<div style='font-size:" + titleSize + "'><div style=\"display:inline\" align=\"left\">"
            + (now.getDay() + '/' + (constants_1.MONTHS[now.getMonth()]) + '/' + now.getFullYear()) + "</div>\n        <div style=\"display:inline;float:right\"><div style='text-align:center'>Il Presidente della Sezione di "
            + shelter.branch + "</div></div></div>";
        var footer_1 = '';
        if (contribution_1.attachments && contribution_1.attachments.length > 0) {
            footer_1 += '<div style="font-size: ' + subtitleSize + '"><div style="font-weight:bold">Allegati:<div>';
            contribution_1.attachments.forEach(function (file) {
                footer_1 += '<div style="font-weight:400">' + file.name + '</div>';
            });
            footer_1 += '</div>';
        }
        document_1 += '</body></html>';
        var result_1 = createPdfFromHTMLDoc(document_1, footer_1);
        return files_api_1.countContributionFilesByShelter(shelter._id)
            .then(function (num) { return writePDFtoMongo(result_1, shelter._id, contribution_1.value, contribution_1.year, contribution_1.type, num); });
    }
    else {
        return Promise.reject(new Error('Error contribution data'));
    }
}
exports.createContributionPDF = createContributionPDF;
//# sourceMappingURL=pdf.api.js.map