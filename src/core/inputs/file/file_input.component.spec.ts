import {
    TestBed,
    async
} from '@angular/core/testing';
import {
    BcFileInput,
    BcFileInputErrorStyler
} from './file_input.component';
import {
    By
} from '@angular/platform-browser';

interface IFakeFile {
    name: String;
    size: Number;
}

describe('BcSelectInput', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [BcFileInput, BcFileInputErrorStyler]
        }).compileComponents();
    }));

    it('Should not propagate changes if isDisabled', () => {
        const fixture = TestBed.createComponent(BcFileInput);
        const app = fixture.debugElement.componentInstance;
        app.isDisabled = true;
        fixture.detectChanges();
        expect(app.isDisabled).toBe(true);
        const oldVal = app.value;
        const fakeFile: IFakeFile = { name: "roba", size: 10 };
        app.onChange({
            target: {
                files: fakeFile
            }
        });
        expect(app.value).toBe(oldVal);
    });

    it('Should validate file names', () => {
        const fixture = TestBed.createComponent(BcFileInput);
        const app = fixture.debugElement.componentInstance;
        const fakeFile: IFakeFile = { name: "roba.txt", size: 10 };
        const customValidator = /(^t).*/g;
        expect(app.validate({ value: fakeFile })).toBe(null);
        app.validator = customValidator;
        expect(app.validator).toBe(customValidator);
        expect(app.validate({ value: fakeFile })).not.toBe(null);
        fakeFile.name = "troba.txt";
        expect(app.validate({ value: fakeFile })).toBe(null);
    });

    it('Should validate extensions', () => {
        const fixture = TestBed.createComponent(BcFileInput);
        const app = fixture.debugElement.componentInstance;
        const fakeFile: IFakeFile = { name: "roba.pdf", size: 10 };
        const types = ["txt"];
        expect(app.validate({ value: fakeFile })).toBe(null);
        app.types = types;
        expect(app.types).toBe(types);
        expect(app.validate({ value: fakeFile })).not.toBe(null);
        fakeFile.name = "troba.txt";
        expect(app.validate({ value: fakeFile })).toBe(null);
    });

    it('Should validate file size', () => {
        const fixture = TestBed.createComponent(BcFileInput);
        const app = fixture.debugElement.componentInstance;
        const fakeFile: IFakeFile = { name: "roba.pdf", size: 10 };
        expect(app.validate({ value: fakeFile })).toBe(null);
        app.sizeLimit = 5;
        expect(app.validate({ value: fakeFile })).not.toBe(null);
        fakeFile.size = 2;
        expect(app.validate({ value: fakeFile })).toBe(null);
    });
});
