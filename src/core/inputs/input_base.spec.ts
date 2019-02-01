import {
    TestBed,
    async
} from '@angular/core/testing';
import {
    BcBaseInput,
    parseDate,
    trimYear,
    createValidationFunction,
    CUSTOM_PATTERN_VALIDATORS,
    createLengthValidator,
    createValueValidator,
    hasRequiredValidator,
    createfileSizeValidator,
    FILE_SIZE_LIMIT,
    createFileNameValidator
} from './input_base';
import {
    By
} from '@angular/platform-browser';
import {
    Component
} from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
    template: ""
})
class FakeInputComponent extends BcBaseInput {
    validatorFn(c) { return null }
}

describe('BcInputBase', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [FakeInputComponent]
        }).compileComponents();
    }));

    it('Should be disabled if isDisabled', () => {
        const fixture = TestBed.createComponent(FakeInputComponent);
        const app = fixture.debugElement.componentInstance;
        app.isDisabled = true;
        fixture.detectChanges();
        expect(app.isDisabled).toBe(true);
        const oldValue = app.value;
        app.writeValue("roba");
        expect(app.value).toBe(oldValue);
        app.setDisabledState(false);
        fixture.detectChanges();
        app.writeValue("altraroba");
        expect(app.value).toBe("altraroba");
    });

    it('Should change value if enabled', () => {
        const fixture = TestBed.createComponent(FakeInputComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app.isDisabled).toBe(false);
        app.writeValue("roba");
        expect(app.value).toBe("roba");
        app.isDisabled = true;
        fixture.detectChanges();
        app.writeValue("altraroba");
        expect(app.value).toBe("roba");
    });

    it('Should show error if displayError is enabled and value is incorrect', () => {
        const fixture = TestBed.createComponent(FakeInputComponent);
        const app = fixture.debugElement.componentInstance;
        app.control = new FormControl(null, Validators.required);
        app.value = "";
        fixture.detectChanges();
        expect(app.displayError).toBe(false);
        expect(app.invalid).toBe(false);
        app.displayError = true;
        fixture.detectChanges();
        expect(app.displayError).toBe(true);
        expect(app.invalid).toBe(true);
    });

    it('Should set placeholder value', () => {
        const fixture = TestBed.createComponent(FakeInputComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app.placeholder).toBe("");
        app.placeholder = "roba"
        expect(app.placeholder).toBe("roba");
    });

    it('Should receive value if registered', () => {
        const fixture = TestBed.createComponent(FakeInputComponent);
        const app = fixture.debugElement.componentInstance;
        let updatedVal = "prima";
        app.registerOnChange((val) => { updatedVal = val });
        fixture.detectChanges();
        app.writeValue("dopo");
        expect(updatedVal).toBe("dopo");
    });

    describe('Date Parsing', () => {
        let fixture, app;
        beforeEach(() => {
            fixture = TestBed.createComponent(FakeInputComponent);
            app = fixture.debugElement.componentInstance;
        });

        it('Should parse only correct dates', () => {
            expect(parseDate("2-2-2").getSeconds()).toBe(new Date(2002, 1, 2).getSeconds());
            expect(parseDate("2/2/2").getSeconds()).toBe(new Date(2002, 1, 2).getSeconds());
            expect(parseDate("2-2/2")).toBe(null);
            expect(parseDate("2/2-2")).toBe(null);
            expect(parseDate(null)).toBe(null);
            expect(parseDate("")).toBe(null);
            expect(parseDate(undefined)).toBe(null);
            expect(parseDate("-1")).toBe(null);
            expect(parseDate("-a-3")).toBe(null);
        });

        it('Should parse dates with or without year', () => {
            expect(parseDate("2/2").getSeconds()).toBe(new Date(2002, 1, 2).getSeconds());
            expect(parseDate("2-2").getSeconds()).toBe(new Date(2002, 1, 2).getSeconds());
            expect(parseDate("2-2-1952").getSeconds()).toBe(new Date(1952, 1, 2).getSeconds());
            expect(parseDate("2/2/1952").getSeconds()).toBe(new Date(1952, 1, 2).getSeconds());
            expect(parseDate("2-2-52").getSeconds()).toBe(new Date(2052, 1, 2).getSeconds());
            expect(parseDate("2/2/52").getSeconds()).toBe(new Date(2052, 1, 2).getSeconds());
        });

        it('Should correct incorrect parameters', () => {
            expect(parseDate("222-2-5").getSeconds()).toBe(new Date(2005, 1, 222).getSeconds());
            expect(parseDate("222/2/5").getSeconds()).toBe(new Date(2005, 1, 222).getSeconds());
            expect(parseDate("22-222-5").getSeconds()).toBe(new Date(2005, 221, 22).getSeconds());
            expect(parseDate("22/222/5").getSeconds()).toBe(new Date(2005, 221, 22).getSeconds());
        });

        it('Should remove year with trim', () => {
            expect(trimYear(parseDate("2-2-2"))).toBe("2/2");
            expect(trimYear(parseDate("2/2/2"))).toBe("2/2");
            expect(trimYear(parseDate("2-2"))).toBe("2/2");
            expect(trimYear(parseDate("2/2"))).toBe("2/2");
            expect(trimYear(parseDate("-1"))).toBe(null);
        });
    });

});


describe('String validators', () => {
    const validator = Validators.pattern(CUSTOM_PATTERN_VALIDATORS.stringValidator);

    it('Should validate value if correct', () => {
        expect(validator(<any>{
            value: "robaASDE"
        })).toBe(null);
        expect(validator(<any>{
            value: "123crrs"
        })).toBe(null);
        expect(validator(<any>{
            value: 1234
        })).toBe(null);
        expect(validator(<any>{
            value: "roba_'24,/roba"
        })).toBe(null);
        expect(validator(<any>{})).toBe(null);
        expect(validator(<any>{
            value: "ro(ba_2.4,/)roba"
        })).toBe(null);
    });

    it('Should raise error if contains invalid characters', () => {
        expect(validator(<any>{
            value: "ro<E"
        })).not.toBe(null);
        expect(validator(<any>{
            value: "123cr>rs"
        })).not.toBe(null);
        expect(validator(<any>{
            value: "ro\\oba"
        })).not.toBe(null);
    });
});

describe('Length validator', () => {
    it('Should check for MAXLENGTH value if specified', () => {
        const validator = createLengthValidator(null, 4);
        expect(validator(<any>{
            value: "A b"
        })).toBe(null);
        expect(validator(<any>{
            value: "12"
        })).toBe(null);
        expect(validator(<any>{
            value: "1cr2"
        })).toBe(null);
        expect(validator(<any>{
            value: "avsdve"
        })).not.toBe(null);
    });

    it('Should check for MINLENGTH value if specified', () => {
        const validator = createLengthValidator(2);
        expect(validator(<any>{
            value: "rf"
        })).toBe(null);
        expect(validator(<any>{
            value: "104"
        })).toBe(null);
        expect(validator(<any>{
            value: "vfrswv"
        })).toBe(null);
        expect(validator(<any>{
            value: "a"
        })).not.toBe(null);
    });

    it('Should check for EXCEPT value if specified', () => {
        const validator = createLengthValidator(null, null, 1);
        expect(validator(<any>{
            value: "rf"
        })).toBe(null);
        expect(validator(<any>{
            value: "104"
        })).toBe(null);
        expect(validator(<any>{
            value: "vfrswv"
        })).toBe(null);
        expect(validator(<any>{
            value: "a"
        })).not.toBe(null);
    });

    it('Should check for MAXLENGTH, MINLENTH and EXCEPT value if specified', () => {
        const validator = createLengthValidator(2, 6, 4);
        expect(validator(<any>{
            value: "dd"
        })).toBe(null);
        expect(validator(<any>{
            value: "cfre"
        })).not.toBe(null);
        expect(validator(<any>{
            value: "ebvrtg"
        })).toBe(null);
        expect(validator(<any>{
            value: "a"
        })).not.toBe(null);
        expect(validator(<any>{
            value: "vfrasdetr"
        })).not.toBe(null);
    });
});


describe('Number validators', () => {
    const validator = Validators.pattern(CUSTOM_PATTERN_VALIDATORS.numberValidator);

    it('Should validate value if correct', () => {
        expect(validator(<any>{
            value: "321"
        })).toBe(null);
        expect(validator(<any>{
            value: 312
        })).toBe(null);
        expect(validator(<any>{})).toBe(null);
    });

    it('Should raise error if contains invalid characters', () => {
        expect(validator(<any>{
            value: "roE"
        })).not.toBe(null);
        expect(validator(<any>{
            value: "1.1.2"
        })).not.toBe(null);
    });
});

describe('Value validators', () => {
    it('Should check for MAX value if specified', () => {
        const validator = createValueValidator(null, 100);
        expect(validator(<any>{
            value: 10
        })).toBe(null);
        expect(validator(<any>{
            value: 100
        })).toBe(null);
        expect(validator(<any>{
            value: 101
        })).not.toBe(null);
    });

    it('Should check for MIN value if specified', () => {
        const validator = createValueValidator(10);
        expect(validator(<any>{
            value: 10
        })).toBe(null);
        expect(validator(<any>{
            value: 100
        })).toBe(null);
        expect(validator(<any>{
            value: 1
        })).not.toBe(null);
    });

    it('Should check for EXCEPT in value if specified', () => {
        const validator = createValueValidator(null, null, 10);
        expect(validator(<any>{
            value: 9
        })).toBe(null);
        expect(validator(<any>{
            value: 11
        })).toBe(null);
        expect(validator(<any>{
            value: 10
        })).not.toBe(null);
    });

    it('Should check for both MAX, MIN and EXCEPT value if specified', () => {
        const validator = createValueValidator(10, 100, 50);
        expect(validator(<any>{
            value: 10
        })).toBe(null);
        expect(validator(<any>{
            value: 100
        })).toBe(null);
        expect(validator(<any>{
            value: 50
        })).not.toBe(null);
        expect(validator(<any>{
            value: 101
        })).not.toBe(null);
        expect(validator(<any>{
            value: 1
        })).not.toBe(null);
    });
});

describe('Telephone validators', () => {
    const validator = Validators.pattern(CUSTOM_PATTERN_VALIDATORS.telephoneValidator);

    it('Should validate value if correct', () => {
        expect(validator(<any>{
            value: "321"
        })).toBe(null);
        expect(validator(<any>{
            value: 312
        })).toBe(null);
        expect(validator(<any>{
            value: "3214834534"
        })).toBe(null);
        expect(validator(<any>{
            value: "321 4834534"
        })).toBe(null);
        expect(validator(<any>{
            value: "+32 14834534"
        })).toBe(null);
        expect(validator(<any>{
            value: "+3214834534"
        })).toBe(null);
        expect(validator(<any>{
            value: "+32 14 834534"
        })).toBe(null);
        expect(validator(<any>{}))
            .toBe(null);
    });

    it('Should raise error if contains invalid characters', () => {
        expect(validator(<any>{
            value: "asdf1"
        })).not.toBe(null);
        expect(validator(<any>{
            value: 3.12
        })).not.toBe(null);
        expect(validator(<any>{
            value: "321 4 834534"
        })).not.toBe(null);
        expect(validator(<any>{
            value: "+32 14 8 34534"
        })).not.toBe(null);
        expect(validator(<any>{
            value: "+3 283 4534"
        })).not.toBe(null);
        expect(validator(<any>{
            value: "+328 3 4534"
        })).not.toBe(null);
    });
});

describe('Mail validators', () => {
    const validator = Validators.pattern(CUSTOM_PATTERN_VALIDATORS.mailValidator);

    it('Should validate value if correct', () => {
        expect(validator(<any>{
            value: "roba@roba.it"
        })).toBe(null);
        expect(validator(<any>{
            value: "a@b.c"
        })).toBe(null);
        expect(validator(<any>{
            value: "a.n.r43ear@b.c"
        })).toBe(null);
        expect(validator(<any>{
            value: "a@b.frwge4g.3q.c"
        })).toBe(null);
        expect(validator(<any>{})).toBe(null);
    });

    it('Should raise error if contains invalid characters', () => {
        expect(validator(<any>{
            value: "roE"
        })).not.toBe(null);
        expect(validator(<any>{
            value: 234
        })).not.toBe(null);
        expect(validator(<any>{
            value: "a@b"
        })).not.toBe(null);
        expect(validator(<any>{
            value: "a.b"
        })).not.toBe(null);
        expect(validator(<any>{
            value: "@"
        })).not.toBe(null);
        expect(validator(<any>{
            value: "."
        })).not.toBe(null);
    });
});

describe('URL validators', () => {
    const validator = Validators.pattern(CUSTOM_PATTERN_VALIDATORS.urlValidator);

    it('Should validate value if correct', () => {
        expect(validator(<any>{
            value: "roba.roba"
        })).toBe(null);
        expect(validator(<any>{
            value: "roba32.ro3ba.roba.roba"
        })).toBe(null);
        expect(validator(<any>{
            value: "ro43ba.roba/ro23ba/roba/roba"
        })).toBe(null);
        expect(validator(<any>{
            value: "www.roba.roba/?=r34tasfg&a=edrg"
        })).toBe(null);
        expect(validator(<any>{
            value: "roba.roba/?=r34tasfg&a=edrg"
        })).toBe(null);
        expect(validator(<any>{
            value: "https://www.roba.roba/?=r34tasfg&a=edrg"
        })).toBe(null);
        expect(validator(<any>{
            value: "https://roba.roba/?=r34tasfg&a=edrg"
        })).toBe(null);
        expect(validator(<any>{}))
            .toBe(null);
    });

    it('Should raise error if contains invalid characters', () => {
        expect(validator(<any>{
            value: "roba.ro4"
        })).not.toBe(null);
        expect(validator(<any>{
            value: "rba"
        })).not.toBe(null);
        expect(validator(<any>{
            value: ".btr"
        })).not.toBe(null);
        expect(validator(<any>{
            value: "http://rba"
        })).not.toBe(null);
        expect(validator(<any>{
            value: 123
        })).not.toBe(null);
    });
});

describe('DateWithoutYear validator', () => {
    const validator = Validators.pattern(CUSTOM_PATTERN_VALIDATORS.dateWithoutYearValidator);

    it('Should validate value if correct', () => {
        expect(validator(<any>{
            value: "23/2"
        })).toBe(null);
        expect(validator(<any>{})).toBe(null);
    });

    it('Should raise error if contains invalid characters', () => {
        expect(validator(<any>{
            value: "roE"
        })).not.toBe(null);
        expect(validator(<any>{
            value: 1.23
        })).not.toBe(null);
        expect(validator(<any>{
            value: "23/2/2"
        })).not.toBe(null);
        expect(validator(<any>{
            value: "402/2"
        })).not.toBe(null);
        expect(validator(<any>{
            value: "4/233"
        })).not.toBe(null);
    });
});

describe('ObjectID validator', () => {
    const validator = Validators.pattern(CUSTOM_PATTERN_VALIDATORS.objectID);

    it('Should validate value if correct', () => {
        expect(validator(<any>{
            value: "507f1f77bcf86cd799439011"
        })).toBe(null);
        expect(validator(<any>{
            value: "507f1F77BCf86cd799439011"
        })).toBe(null);
        expect(validator(<any>{})).toBe(null);
    });

    it('Should raise error if contains invalid characters', () => {
        expect(validator(<any>{
            value: "roE"
        })).not.toBe(null);
        expect(validator(<any>{
            value: 1.23
        })).not.toBe(null);
        expect(validator(<any>{
            value: "23/2/2"
        })).not.toBe(null);
        expect(validator(<any>{
            value: "507f439011"
        })).not.toBe(null);
        expect(validator(<any>{
            value: "507f1F77BCf86cd79aa3249439011"
        })).not.toBe(null);
    });
});

describe('File validators', () => {
    it('Should check default MAX value', () => {
        const validator = createfileSizeValidator();
        expect(validator(<any>{
            value: { size: FILE_SIZE_LIMIT - 1 }
        })).toBe(null);
        expect(validator(<any>{
            value: { size: 10 }
        })).toBe(null);
        expect(validator(<any>{
            value: { size: FILE_SIZE_LIMIT + 1 }
        })).not.toBe(null);
    });

    it('Should check custom MAX value if specified', () => {
        const validator = createfileSizeValidator(null, 100);
        expect(validator(<any>{
            value: { size: 99 }
        })).toBe(null);
        expect(validator(<any>{
            value: { size: 10 }
        })).toBe(null);
        expect(validator(<any>{
            value: { size: 101 }
        })).not.toBe(null);
    });

    it('Should check custom MAX value if specified', () => {
        const validator = createFileNameValidator(/^t/g);
        expect(validator(<any>{
            value: { name: "t.exe" }
        })).toBe(null);
        expect(validator(<any>{
            value: { name: "name.rob" }
        })).not.toBe(null);
    });
});

describe('Validators tools', () => {
    it('Should check if control has validator.required', () => {
        const check = hasRequiredValidator;
        const control = new FormControl(null);
        expect(check(control)).toBe(false);
        control.setValidators(Validators.required);
        expect(check(control)).toBe(true);
    });
});
