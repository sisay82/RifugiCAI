"use strict";
exports.__esModule = true;
var common_1 = require("../common");
var path = require("path");
var pdf = require("html-pdf");
var files_api_1 = require("./files.api");
var enums_1 = require("../../src/app/shared/types/enums");
var Files_Enum = enums_1.Enums.Files;
function getContributionHtml(title, value, rightTitle) {
    if (value == null)
        value = 0;
    if (rightTitle) {
        return "<div style='max-width:65%'><div align='right' style='font-weight:bold'>" + title + " (€): " + value + "</div></div>";
    }
    else {
        return "<div style='max-width:65%'><div style='display:inline' align='left'>" + title + "</div><div style='display:inline;float:right'>(€): " + value + "</div></div>";
    }
}
function createPDF(shelter) {
    if (shelter && shelter.branch && shelter.contributions && shelter.contributions.data) {
        var contribution_1 = shelter.contributions;
        var title_1 = "24px";
        var subtitle_1 = "20px";
        var body_1 = "18px";
        return new Promise(function (resolve, reject) {
            var assestpath = path.join("file://" + common_1.OUT_DIR + "/assets/images/");
            var header = "<div style=\"text-align:center\">\n            <div style=\"height:100px\"><img style=\"max-width:100%;max-height:100%\" src=\"" + assestpath + "logo_pdf.png\" /></div>\n            <div style=\"font-weight: bold;font-size:" + title_1 + "\">CLUB ALPINO ITALIANO</div>\n            </div>";
            var document = "<html><head></head><body>" + header + "\n            <br/><div style=\"font-size:" + body_1 + "\" align='right'><span style='text-align:left'>Spett.<br/>Club Alpino Italiano<br/>Commissione rifugi<br/><span></div><br/>\n            <div style=\"font-weight: bold;font-size:" + title_1 + "\">Oggetto: Richiesta di contributi di tipo " + contribution_1.type + " Rifugi</div><br/>\n            <div style=\"font-weight: 400;font-size:" + title_1 + "\">Con la presente vi comunico che la Sezione di " + shelter.branch + " intende svolgere nel \n            " + (contribution_1.year + 1) + " i lavori di manutenzione in seguito descritti,\n            predisponendo un piano economico cos\u00EC suddiviso:</div><br/>";
            document += "<div style='font-weight:400;font-size:" + subtitle_1 + "'>";
            document += getContributionHtml("Lavori a corpo", contribution_1.data.handWorks);
            document += getContributionHtml("Lavori a misura", contribution_1.data.customizedWorks);
            document += getContributionHtml("Oneri di sicurezza", contribution_1.data.safetyCharges);
            document += getContributionHtml("Totale Lavori", contribution_1.data.totWorks, true);
            document += "<br/>";
            document += getContributionHtml("Spese per indagini, rilievi, ecc.", contribution_1.data.surveyorsCharges);
            document += getContributionHtml("Spese per allacciamenti a reti di distribuzione", contribution_1.data.connectionsCharges);
            document += getContributionHtml("Spese tecniche", contribution_1.data.technicalCharges);
            document += getContributionHtml("Spese di collaudo", contribution_1.data.testCharges);
            document += getContributionHtml("Tasse ed Oneri", contribution_1.data.taxes);
            document += getContributionHtml("Totale Spese", contribution_1.data.totCharges, true);
            document += "<br/>";
            if (contribution_1.data.IVAincluded) {
                document += "<div>IVA compresa poiché non recuperabile</div>";
            }
            document += getContributionHtml("Costo totale del progetto", contribution_1.data.totalProjectCost);
            document += getContributionHtml("Finanziamento esterno", contribution_1.data.externalFinancing);
            document += getContributionHtml("Autofinanziamento", contribution_1.data.selfFinancing);
            document += getContributionHtml("Scoperto", contribution_1.data.red);
            document += "</div><br/>";
            document += "<div style=\"font-size:" + title_1 + "\"><div>Vi richiediamo un contributo di euro (\u20AC): " + contribution_1.value + "</div><br/>\n            <div>Fiduciosi in un positivo accoglimento, con la presente ci \u00E8 gradito porgere i nostri pi\u00F9 cordiali saluti.</div></div><br/><br/>";
            var now = new Date(Date.now());
            document += "<div style=\"font-size:" + title_1 + "\"><div style='display:inline' align='left'>" + (now.getDay() + "/" + (common_1.MONTHS[now.getMonth()]) + "/" + now.getFullYear()) + "</div>\n            <div style='display:inline;float:right'><div style=\"text-align:center\">Il Presidente della Sezione di " + shelter.branch + "</div></div></div>";
            var footer = "";
            if (contribution_1.attachments && contribution_1.attachments.length > 0) {
                footer += "<div style='font-size:" + subtitle_1 + "'><div style='font-weight:bold'>Allegati:<div>";
                contribution_1.attachments.forEach(function (file) {
                    footer += "<div style='font-weight:400'>" + file.name + "</div>";
                });
                footer += "</div>";
            }
            document += "</body></html>";
            var result = pdf.create(document, {
                "directory": "/tmp",
                "border": {
                    "top": "0.3in",
                    "left": "0.6in",
                    "bottom": "0.3in",
                    "right": "0.6in"
                },
                "footer": {
                    "contents": footer
                }
            });
            /*result.toFile("./doc.pdf",function(err,res){
                resolve(null);
            });*/
            result.toStream(function (err, res) {
                if (err) {
                    reject(err);
                }
                else {
                    files_api_1.countContributionFilesByShelter(shelter._id)
                        .then(function (num) {
                        var bufs = [];
                        num += 1;
                        res.on('data', function (d) { bufs.push(d); });
                        res.on("end", function () {
                            var buff = Buffer.concat(bufs);
                            var file = {
                                size: buff.length,
                                shelterId: shelter._id,
                                uploadDate: new Date(),
                                name: contribution_1.year + "_" + contribution_1.type + "_" + num + ".pdf",
                                data: buff,
                                contribution_type: contribution_1.type,
                                contentType: "application/pdf",
                                type: Files_Enum.File_Type.contribution,
                                invoice_year: contribution_1.year,
                                value: contribution_1.value
                            };
                            files_api_1.insertNewFile(file)
                                .then(function (f) {
                                resolve({ name: f.name, id: f._id });
                            })["catch"](function (err) {
                                reject(err);
                            });
                        });
                        res.on('error', function (err) {
                            reject(err);
                        });
                    })["catch"](function (err) {
                        reject(err);
                    });
                }
            });
        });
    }
    else {
        return new Promise(function (resolve, reject) {
            reject(new Error("Error contribution data"));
        });
    }
}
exports.createPDF = createPDF;
