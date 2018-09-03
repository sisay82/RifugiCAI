import 'jasmine';
import { intersectFilesArray } from './files.logic';
import { Enums } from '../../../src/app/shared/types/enums';

describe('Files LOGIC', () => {
    it('Should intersect files array', () => {
        const stagingArray = <any[]>[
            { type: Enums.Files.File_Type.image, _id: 1, new: true },
            { type: Enums.Files.File_Type.doc, _id: 2, new: true },
            { type: Enums.Files.File_Type.contribution, _id: 3, toUpdate: true },
            { type: Enums.Files.File_Type.invoice, _id: 4, toRemove: true },
            { type: Enums.Files.File_Type.map, _id: 5 }
        ];
        const files = <any[]>[
            { type: Enums.Files.File_Type.contribution, _id: 3 },
            { type: Enums.Files.File_Type.invoice, _id: 4 },
            { type: Enums.Files.File_Type.map, _id: 5 }
        ];
        const test = <any[]>[
            { type: Enums.Files.File_Type.image, _id: 1, new: true },
            { type: Enums.Files.File_Type.doc, _id: 2, new: true },
            { type: Enums.Files.File_Type.contribution, _id: 3, toUpdate: true },
            { type: Enums.Files.File_Type.map, _id: 5 }
        ];
        intersectFilesArray(stagingArray, files)
        .forEach(obj => {
            const match = test.find(o => o._id === obj._id);
            expect(match).toBeTruthy();
            expect(match).toEqual(obj);
        })
    });
});
