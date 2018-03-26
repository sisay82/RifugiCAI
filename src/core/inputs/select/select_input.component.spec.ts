import {
    TestBed,
    async
} from '@angular/core/testing';
import {
    BcSelectInput,
    BcSelectInputErrorStyler
} from './select_input.component';
import {
    By
} from '@angular/platform-browser';

describe('BcSelectInput', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [BcSelectInput, BcSelectInputErrorStyler]
        }).compileComponents();
    }));

    it('Should not propagate changes if isDisabled', () => {
        const fixture = TestBed.createComponent(BcSelectInput);
        const app = fixture.debugElement.componentInstance;
        app.isDisabled = true;
        fixture.detectChanges();
        expect(app.isDisabled).toBe(true);
        const oldVal = app.value;
        app.onChange({
            target: {
                value: "roba"
            }
        });
        expect(app.value).toBe(oldVal);
    });

    it('Should raise error if empty and required', () => {
        const fixture = TestBed.createComponent(BcSelectInput);
        const app = fixture.debugElement.componentInstance;
        app.displayError = true;
        app.onChange({
            target: {
                value: ""
            }
        });
        expect(app.required).toBe(false);
        expect(app.invalid).toBe(false);
        app.required = true;
        app.onChange({
            target: {
                value: ""
            }
        });
        expect(app.required).toBe(true);
        expect(app.invalid).toBe(true);
    });

    it('Should update current value if validator is correct', () => {
        const fixture = TestBed.createComponent(BcSelectInput);
        const app = fixture.debugElement.componentInstance;
        app.onChange({
            target: {
                value: "altraroba"
            }
        });
        expect(app.value).toBe("altraroba");
    });

    it('Should retreive availables enum names', () => {
        const fixture = TestBed.createComponent(BcSelectInput);
        const app = fixture.debugElement.componentInstance;
        expect(Array.isArray(app.getEnumNames())).toBe(true);
        expect(app.getEnumNames().length).toBe(0);
        const values = ["roba1", "roba2"];
        app.enumValues = values;
        expect(app.getEnumNames()).toBe(values);
        const enumKey = "Owner_Type";
        app.enumName = enumKey;
        const objValues = Object.keys(app.getEnumKeys()).map(k => app.getEnumKeys()[k]);
        const names: any[] = [];
        objValues.filter(v => typeof v === "string").forEach((val) => {
            names.push(val);
        });
        fixture.detectChanges();
        expect(app.getEnumNames().toString()).toBe(names.toString());
    });

    it('Should check current value', () => {
        const fixture = TestBed.createComponent(BcSelectInput);
        const app = fixture.debugElement.componentInstance;
        app.value = "roba";
        expect(app.checkEnumValue("roba")).toBe(true);
    });
});
