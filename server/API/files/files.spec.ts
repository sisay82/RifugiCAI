import 'jasmine';
import { intersectFilesArray, mergeFiles } from './files.logic';
import { Enums } from '../../../src/app/shared/types/enums';

describe('Files LOGIC', () => {
    it('Should intersect files array', () => {
        const stagingArray = <any[]>[
            { type: Enums.Files.File_Type.image, _id: 1, new: true },
            { type: Enums.Files.File_Type.doc, _id: 2, new: true },
            { _doc: {}, type: Enums.Files.File_Type.contribution, _id: 3, toUpdate: true },
            { type: Enums.Files.File_Type.invoice, _id: 4, toRemove: true },
            { type: Enums.Files.File_Type.map, _id: 5 }
        ];
        const files = <any[]>[
            { _doc: {}, type: Enums.Files.File_Type.contribution, _id: 3 },
            { type: Enums.Files.File_Type.invoice, _id: 4 },
            { type: Enums.Files.File_Type.map, _id: 5 }
        ];
        const test = <any[]>[
            { type: Enums.Files.File_Type.image, _id: 1, new: true },
            { type: Enums.Files.File_Type.doc, _id: 2, new: true },
            { _doc: {}, type: Enums.Files.File_Type.contribution, _id: 3, toUpdate: true },
            { type: Enums.Files.File_Type.map, _id: 5 }
        ];
        intersectFilesArray(stagingArray, files)
            .forEach(obj => {
                const match = test.find(o => o._id === obj._id);
                expect(match).toBeTruthy();
                expect(match).toEqual(obj);
            })
    });

    it('Should merge files', () => {
        expect(mergeFiles(<any>{}, {})).toEqual(<any>{})
        expect(mergeFiles(
            <any>{ type: Enums.Files.File_Type.contribution, _id: "a" },
            { type: Enums.Files.File_Type.contribution, _id: "a", toUpdate: true }
        )).toEqual(
            <any>{ type: Enums.Files.File_Type.contribution, _id: "a" }
        );
        expect(mergeFiles(
            <any>{ _doc: { description: "A", _id: "a" }, _id: "a" },
            <any>{ _doc: { description: "B", _id: "b" }, description: "B", _id: "b", toUpdate: true }
        )).toEqual(
            <any>{ _doc: { description: "A", _id: "a" }, description: "B", _id: "a", toUpdate: true }
        );

    })
});
