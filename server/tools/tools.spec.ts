import 'jasmine'
import { getPropertySafe } from './common'

describe('Common tools', () => {
    it('Should get property of object if exists', () => {
        expect(getPropertySafe({}, 'roba')).toBeNull()
        expect(getPropertySafe({
            roba: "stringa"
        }, 'roba')).toBe("stringa")
    });

});
