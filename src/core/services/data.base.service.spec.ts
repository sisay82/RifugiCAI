import { BcDataBaseService } from './data.base.service';
import { Enums } from '../../../src/app/shared/types/enums';


describe('BcDataBaseService', () => {
    it('Should check if all types loading were been requested', () => {
        const service = new BcDataBaseService();
        expect(service.checkRequestedTypes([Enums.Files.File_Type.contribution, Enums.Files.File_Type.doc])).toBe(false);
        service.typesRequested = <any>Enums.Files.File_Type.contribution;
        expect(service.checkRequestedTypes([Enums.Files.File_Type.contribution, Enums.Files.File_Type.doc])).toBe(false);
        service.typesRequested = [Enums.Files.File_Type.contribution];
        expect(service.checkRequestedTypes([Enums.Files.File_Type.contribution, Enums.Files.File_Type.doc])).toBe(false);
        service.typesRequested = [Enums.Files.File_Type.contribution, Enums.Files.File_Type.doc];
        expect(service.checkRequestedTypes([Enums.Files.File_Type.contribution, Enums.Files.File_Type.doc])).toBe(true);
        service.typesRequested = [Enums.Files.File_Type.contribution, Enums.Files.File_Type.doc];
        expect(service.checkRequestedTypes([
            Enums.Files.File_Type.contribution,
            Enums.Files.File_Type.doc,
            Enums.Files.File_Type.image
        ])).toBe(false);
    });

    it('Should add type to the ones already requested', () => {
        const service = new BcDataBaseService();
        service.addTypeToRequested(Enums.Files.File_Type.doc)
        expect(service.typesRequested).toEqual([Enums.Files.File_Type.doc])
        service.addTypeToRequested(Enums.Files.File_Type.doc)
        expect(service.typesRequested).toEqual([Enums.Files.File_Type.doc])
        service.addTypeToRequested(Enums.Files.File_Type.image)
        expect(service.typesRequested).toEqual([Enums.Files.File_Type.doc, Enums.Files.File_Type.image])
    })
});
