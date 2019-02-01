import 'jasmine'
import { getPropertySafe, intersectArray, removeDuplicate } from './common'

describe('Common tools', () => {
    it('Should get property of object if exists', () => {
        expect(getPropertySafe({}, 'roba')).toBeNull()
        expect(getPropertySafe({
            roba: "stringa"
        }, 'roba')).toBe("stringa")
    });

    it('Should intersect arrays', () => {
        expect(intersectArray([1, 2], [2, 3])).toEqual([2]);
        expect(intersectArray(["A", 2, "B", { a: "A" }], ["B", "D", 2, { a: "A" }, "e"])).toEqual(["B", 2]);
    });

    it('Should get duplicates between arrays', () => {
        expect(removeDuplicate([1, 2], [2, 3])).toEqual([1]);
        expect(removeDuplicate(["A", 2, "B", "b", "e"], ["B", "D", "e"])).toEqual(["A", 2, "b"]);
    });
});
