"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var enums_1 = require("./enums");
var Schema;
(function (Schema) {
    Schema.locationSchema = new mongoose.Schema({
        region: String,
        province: String,
        municipality: String,
        locality: String,
        ownerRegion: { type: enums_1.Enums.Auth_Permissions.Region_Code },
        regional_commission: String,
        authorityJurisdiction: String,
        altitude: Number,
        latitude: Number,
        longitude: Number,
        massif: String,
        valley: String,
        ski_area: String,
        protected_area: String,
        site: String
    });
    Schema.tagSchema = new mongoose.Schema({
        key: { type: String, required: true },
        value: String
    });
    Schema.geographicSchema = new mongoose.Schema({
        location: { type: Schema.locationSchema },
        tags: [Schema.tagSchema]
    });
    Schema.serviceSchema = new mongoose.Schema({
        name: String,
        category: String,
        description: String,
        tags: [Schema.tagSchema]
    });
    Schema.openingaSchema = new mongoose.Schema({
        startDate: Date,
        endDate: Date,
        type: String
    });
    Schema.contactsSchema = new mongoose.Schema({
        name: String,
        role: String,
        fixedPhone: String,
        mobilePhone: String,
        mailPec: String,
        prenotation_link: String,
        emailAddress: String,
        webAddress: String,
    });
    Schema.subjectSchema = new mongoose.Schema({
        name: String,
        surname: String,
        taxCode: String,
        fixedPhone: String,
        mobilePhone: String,
        pec: String,
        email: String,
        webSite: String,
        type: String,
        contract_start_date: Date,
        contract_end_date: Date,
        contract_duration: String,
        contract_fee: Number,
        possession_type: { type: enums_1.Enums.Possession_Type },
    });
    Schema.managementSchema = new mongoose.Schema({
        reference: String,
        webSite: String,
        valuta: { type: String, default: "Euro" },
        pickupKey: Boolean,
        self_management: Boolean,
        rentType: { type: enums_1.Enums.Custody_Type },
        subject: [Schema.subjectSchema]
    });
    Schema.catastalSchema = new mongoose.Schema({
        buildingRegulation: Boolean,
        buildYear: String,
        rebuildYear: String,
        class: String,
        code: String,
        typologicalCoherence: { type: enums_1.Enums.Typo_consistency },
        matericalCoherence: Boolean,
        cityPlanRegulation: Boolean,
        mainBody: String,
        secondaryBody: String,
        fireRegulation: { type: enums_1.Enums.Fire_Regulation_Type },
        ISO14001: Boolean
    });
    Schema.energySchema = new mongoose.Schema({
        class: { type: enums_1.Enums.Energy_Class_Type },
        energy: Number,
        greenCertification: Boolean,
        powerGenerator: Boolean,
        photovoltaic: Boolean,
        heating_type: { type: enums_1.Enums.Heating_Type },
        sourceType: { type: enums_1.Enums.Source_Type },
        sourceName: String
    });
    Schema.drainSchema = new mongoose.Schema({
        type: { type: enums_1.Enums.Drain_Type },
        regulation: Boolean,
        oilSeparator: Boolean,
        water_certification: Boolean,
        recycling: Boolean,
        water_type: { type: enums_1.Enums.Water_Type },
        water_availability: { type: enums_1.Enums.Water_Availability },
        droughts: { type: enums_1.Enums.Seasons }
    });
    Schema.economySchema = new mongoose.Schema({
        year: { type: Number, required: true },
        confirm: Boolean,
        accepted: Boolean
    });
    Schema.useSchema = new mongoose.Schema({
        year: { type: Number, required: true },
        stay_count_associate: Number,
        stay_count_reciprocity: Number,
        stay_count: Number,
        transit_count_associate: Number,
        transit_count_reciprocity: Number,
        transit_count: Number
    });
    Schema.fileRefSchema = new mongoose.Schema({
        name: { type: String, required: true },
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Files',
            required: true
        }
    });
    Schema.contributionData = new mongoose.Schema({
        handWorks: Number,
        customizedWorks: Number,
        safetyCharges: Number,
        totWorks: Number,
        surveyorsCharges: Number,
        connectionsCharges: Number,
        technicalCharges: Number,
        testCharges: Number,
        taxes: Number,
        totCharges: Number,
        IVAincluded: Boolean,
        totalProjectCost: Number,
        externalFinancing: Number,
        selfFinancing: Number,
        red: Number
    });
    Schema.contributionSchema = new mongoose.Schema({
        year: { type: Number, required: true },
        data: { type: Schema.contributionData },
        attachments: [Schema.fileRefSchema],
        value: Number,
        accepted: Boolean,
        type: { type: enums_1.Enums.Contribution_Type }
    });
    Schema.shelterSchema = new mongoose.Schema({
        name: String,
        alias: String,
        idCai: String,
        type: { type: enums_1.Enums.Shelter_Type },
        branch: String,
        owner: String,
        regional_type: { type: enums_1.Enums.Regional_Type },
        category: { type: enums_1.Enums.Shelter_Category },
        insertDate: { type: Date, default: Date.now },
        updateDate: { type: Date, default: new Date(Date.now()) },
        geoData: { type: Schema.geographicSchema },
        services: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Services'
            }],
        contacts: { type: Schema.contactsSchema },
        openingTime: [Schema.openingaSchema],
        management: { type: Schema.managementSchema },
        catastal: { type: Schema.catastalSchema },
        energy: { type: Schema.energySchema },
        drain: { type: Schema.drainSchema },
        economy: [Schema.economySchema],
        use: [Schema.useSchema],
        contributions: { type: Schema.contributionSchema }
    });
    Schema.fileSchema = new mongoose.Schema({
        size: Number,
        shelterId: { type: mongoose.Schema.Types.ObjectId },
        uploadDate: { type: Date, default: new Date(Date.now()) },
        md5: String,
        name: String,
        data: Buffer,
        contribution_type: { type: enums_1.Enums.Contribution_Type },
        invoice_year: Number,
        invoice_tax: Number,
        invoice_confirmed: Boolean,
        invoice_type: { type: enums_1.Enums.Invoice_Type },
        contentType: String,
        type: { type: enums_1.Enums.Files.File_Type },
        description: String,
        value: Number
    });
})(Schema = exports.Schema || (exports.Schema = {}));
//# sourceMappingURL=schema.js.map