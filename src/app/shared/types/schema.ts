import * as mongoose from 'mongoose';
import { Enums } from './enums';

export namespace Schema {
    export const locationSchema = new mongoose.Schema({
        region: String,
        province: String,
        municipality: String,
        locality: String,
        ownerRegion: { type: Enums.Auth_Permissions.Region_Code },
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

    export const tagSchema = new mongoose.Schema({
        key: { type: String, required: true },
        value: String
    });

    export const geographicSchema = new mongoose.Schema({
        location: { type: locationSchema },
        tags: [tagSchema]
    });

    export const serviceSchema = new mongoose.Schema({
        name: String,
        category: String,
        description: String,
        tags: [tagSchema]
    });

    export const openingaSchema = new mongoose.Schema({
        startDate: Date,
        endDate: Date,
        type: String
    });

    export const contactsSchema = new mongoose.Schema({
        name: String,
        role: String,
        fixedPhone: String,
        mobilePhone: String,
        mailPec: String,
        prenotation_link: String,
        emailAddress: String,
        webAddress: String,
    });

    export const subjectSchema = new mongoose.Schema({
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
        possession_type: { type: Enums.Possession_Type },
    });

    export const managementSchema = new mongoose.Schema({
        reference: String,
        webSite: String,
        valuta: { type: String, default: "Euro" },
        pickupKey: Boolean,
        self_management: Boolean,
        rentType: { type: Enums.Custody_Type },
        subject: [subjectSchema]
    });

    export const catastalSchema = new mongoose.Schema({
        buildingRegulation: Boolean,
        buildYear: String,
        rebuildYear: String,
        class: String,
        code: String,
        typologicalCoherence: { type: Enums.Typo_consistency },
        matericalCoherence: Boolean,
        cityPlanRegulation: Boolean,
        mainBody: String,
        secondaryBody: String,
        fireRegulation: { type: Enums.Fire_Regulation_Type },
        ISO14001: Boolean
    });

    export const energySchema = new mongoose.Schema({
        class: { type: Enums.Energy_Class_Type },
        energy: Number,
        greenCertification: Boolean,
        powerGenerator: Boolean,
        photovoltaic: Boolean,
        heating_type: { type: Enums.Heating_Type },
        sourceType: { type: Enums.Source_Type },
        sourceName: String
    });

    export const drainSchema = new mongoose.Schema({
        type: { type: Enums.Drain_Type },
        regulation: Boolean,
        oilSeparator: Boolean,
        water_certification: Boolean,
        recycling: Boolean,
        water_type: { type: Enums.Water_Type },
        water_availability: { type: Enums.Water_Availability },
        droughts: { type: Enums.Seasons }
    });

    export const economySchema = new mongoose.Schema({
        year: { type: Number, required: true },
        confirm: Boolean,
        accepted: Boolean
    });

    export const useSchema = new mongoose.Schema({
        year: { type: Number, required: true },
        stay_count_associate: Number,
        stay_count_reciprocity: Number,
        stay_count: Number,
        transit_count_associate: Number,
        transit_count_reciprocity: Number,
        transit_count: Number
    });

    export const fileRefSchema = new mongoose.Schema({
        name: { type: String, required: true },
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Files',
            required: true
        }
    });

    export const contributionData = new mongoose.Schema({
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

    export const contributionSchema = new mongoose.Schema({
        year: { type: Number, required: true },
        data: { type: contributionData },
        attachments: [fileRefSchema],
        value: Number,
        accepted: Boolean,
        type: { type: Enums.Contribution_Type }
    });

    export const shelterSchema = new mongoose.Schema({
        name: String,
        alias: String,
        idCai: String,
        type: { type: Enums.Shelter_Type },
        branch: String,
        owner: String,
        status: String,
        regional_type: { type: Enums.Regional_Type },
        category: { type: Enums.Shelter_Category },
        insertDate: { type: Date, default: Date.now },
        updateDate: { type: Date, default: new Date(Date.now()) },
        updateSubject: { type: Enums.Auth_Permissions.User_Type, required: true },

        geoData: { type: geographicSchema },
        services: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Services'
        }],
        contacts: { type: contactsSchema },
        openingTime: [openingaSchema],
        management: { type: managementSchema },
        catastal: { type: catastalSchema },
        energy: { type: energySchema },
        drain: { type: drainSchema },
        economy: [economySchema],
        use: [useSchema],
        contributions: { type: contributionSchema }
    });

    export const fileSchema = new mongoose.Schema({
        size: Number,
        shelterId: { type: mongoose.Schema.Types.ObjectId },
        uploadDate: { type: Date, default: new Date(Date.now()) },
        md5: String,
        name: String,
        data: Buffer,
        contribution_type: { type: Enums.Contribution_Type },
        invoice_year: Number,
        invoice_tax: Number,
        invoice_confirmed: Boolean,
        invoice_type: { type: Enums.Invoice_Type },
        contentType: String,
        type: { type: Enums.Files.File_Type },
        description: String,
        value: Number
    });
}
