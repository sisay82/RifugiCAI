import {
    TestBed,
    async
} from '@angular/core/testing';
import {
    BcTextInput,
    BcTextInputErrorStyler,
    BcTextInputSingleLineDirective
} from './text_input.component';
import {
    createValidationFunction
} from '../input_base';
import {
    By
} from '@angular/platform-browser';

describe('BcTextInput', () => {
    beforeEach(async (() => {
        TestBed.configureTestingModule({
            declarations: [BcTextInput, BcTextInputErrorStyler, BcTextInputSingleLineDirective]
        }).compileComponents();
    }));

    describe("Common", () => {
        it('Should not propagate changes if isDisabled', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.isDisabled = true;
            fixture.detectChanges();
            expect(app.isDisabled).toBe(true);
            app.onKey({
                target: {
                    value: "roba"
                }
            });
            expect(app.value).toBe(null);
        });

        it('Should raise error if empty and required', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.required = true;
            expect(app.required).toBe(true);
            expect(app.validate()).not.toBe(null);
            expect(app.validate()).not.toBe(undefined);
            expect(app.validate({
                value: ""
            })).not.toBe(null);
            expect(app.validate({
                value: undefined
            })).not.toBe(null);
            expect(app.validate({
                value: null
            })).not.toBe(null);
        });

        it('Should update current value if validator is correct', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.validate({
                value: "roba"
            });
            expect(app.value).toBe("roba");
            app.onKey({
                target: {
                    value: "altraroba"
                }
            });
            expect(app.value).toBe("altraroba");
        });

        it('Should validate if empty and not required', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            expect(app.required).toBe(false);
            expect(app.validate()).toBe(null);
        });

        it('Should not update value if incorrect', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            expect(app.validate({
                value: "<>32"
            })).not.toBe(null);
            expect(app.value).toBe(null);
        });

    });

    it('Should remove year from date if required', () => {
        const fixture = TestBed.createComponent(BcTextInput);
        const app = fixture.debugElement.componentInstance;
        expect(app.processYear("2/2/2")).toBe("2/2");
        expect(app.processYear("2/2")).toBe("2/2");
        expect(app.processYear()).toBe("");
        expect(app.processYear("robe")).toBe("robe");
        expect(app.processYear("-1")).toBe("-1");
    });

    it('Should have default stringValidator as default', () => {
        const fixture = TestBed.createComponent(BcTextInput);
        const app = fixture.debugElement.componentInstance;
        expect(app._validator.toString()).toBe(createValidationFunction("stringValidator").toString());
    });

    it('Should be invalid if displayError is enabled and value is incorrect', () => {
        const fixture = TestBed.createComponent(BcTextInput);
        const app = fixture.debugElement.componentInstance;
        app.displayError = true;
        expect(app.validate({
            value: "<>32"
        })).not.toBe(null);
        expect(app.invalid).toBeTruthy();
    });

    it('Should not display error if disabled or value is correct', () => {
        const fixture = TestBed.createComponent(BcTextInput);
        const app = fixture.debugElement.componentInstance;
        const err = fixture.debugElement.query(By.css(".bc-alert"));
        expect(app.validate({
            value: "<>32"
        })).not.toBe(null);
        fixture.detectChanges();
        expect(err.nativeElement.hidden).toBeTruthy();
        app.displayError = true;
        app.enableBlock = true;
        expect(app.validate({
            value: "32"
        })).toBe(null);
        fixture.detectChanges();
        expect(err.nativeElement.hidden).toBeTruthy();
    });

    it('Should display error if enabled and value is incorrect', () => {
        const fixture = TestBed.createComponent(BcTextInput);
        const app = fixture.debugElement.componentInstance;
        const err = fixture.debugElement.query(By.css(".bc-alert"));
        app.displayError = true;
        app.enableBlock = true;
        expect(app.validate({
            value: "<>32"
        })).not.toBe(null);
        expect(app.invalid).toBe(true);
        fixture.detectChanges();
        expect(err.nativeElement.hidden).not.toBeTruthy()
    });


    describe('String validators', () => {
        it('Should validate value if correct', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            expect(app.validate({
                value: "robaASDE"
            })).toBe(null);
            expect(app.validate({
                value: "123crrs"
            })).toBe(null);
            expect(app.validate({
                value: 1234
            })).toBe(null);
            expect(app.validate({
                value: "roba_'24,/roba"
            })).toBe(null);
            expect(app.validate()).toBe(null);
            expect(app.validate({
                value: "ro(ba_2.4,/)roba"
            })).toBe(null);
        });

        it('Should raise error if contains invalid characters', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            expect(app.validate({
                value: "ro<E"
            })).not.toBe(null);
            expect(app.validate({
                value: "123cr>rs"
            })).not.toBe(null);
            expect(app.validate({
                value: "ro\\oba"
            })).not.toBe(null);
        });

        it('Should check for MAXLENGTH value if specified', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.maxLength = 4;
            expect(app.validate({
                value: "A b"
            })).toBe(null);
            expect(app.validate({
                value: "12"
            })).toBe(null);
            expect(app.validate({
                value: "1cr2"
            })).toBe(null);
            expect(app.validate({
                value: "avsdve"
            })).not.toBe(null);
        });

        it('Should check for MINLENGTH value if specified', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.minLength = 2;
            expect(app.validate({
                value: "rf"
            })).toBe(null);
            expect(app.validate({
                value: "104"
            })).toBe(null);
            expect(app.validate({
                value: "vfrswv"
            })).toBe(null);
            expect(app.validate({
                value: "a"
            })).not.toBe(null);
        });

        it('Should check for both MAXLENGTH and MINLENTH value if specified', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.minLength = 2;
            app.maxLength = 6;
            expect(app.validate({
                value: "dd"
            })).toBe(null);
            expect(app.validate({
                value: "cfre"
            })).toBe(null);
            expect(app.validate({
                value: "ebvrtg"
            })).toBe(null);
            expect(app.validate({
                value: "a"
            })).not.toBe(null);
            expect(app.validate({
                value: "vfrasdetr"
            })).not.toBe(null);
        });
    });

    describe('Number validators', () => {
        it('Should update current validator', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.validator = "numberValidator";
            expect(app._validator.toString()).toBe(createValidationFunction("numberValidator").toString());
        });

        it('Should validate value if correct', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.validator = "numberValidator";
            expect(app.validate({
                value: "321"
            })).toBe(null);
            expect(app.validate({
                value: 312
            })).toBe(null);
            expect(app.validate()).toBe(null);
        });

        it('Should raise error if contains invalid characters', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.validator = "numberValidator";
            expect(app.validate({
                value: "roE"
            })).not.toBe(null);
            expect(app.validate({
                value: "1.1.2"
            })).not.toBe(null);
        });

        it('Should check for MAX value if specified', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.validator = "numberValidator";
            app.maxValue = 100;
            expect(app.validate({
                value: 10
            })).toBe(null);
            expect(app.validate({
                value: 100
            })).toBe(null);
            expect(app.validate({
                value: 101
            })).not.toBe(null);
        });

        it('Should check for MIN value if specified', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.validator = "numberValidator";
            app.minValue = 10;
            expect(app.validate({
                value: 10
            })).toBe(null);
            expect(app.validate({
                value: 100
            })).toBe(null);
            expect(app.validate({
                value: 1
            })).not.toBe(null);
        });

        it('Should check for both MAX and MIN value if specified', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.validator = "numberValidator";
            app.minValue = 10;
            app.maxValue = 100;
            expect(app.validate({
                value: 10
            })).toBe(null);
            expect(app.validate({
                value: 100
            })).toBe(null);
            expect(app.validate({
                value: 50
            })).toBe(null);
            expect(app.validate({
                value: 101
            })).not.toBe(null);
            expect(app.validate({
                value: 1
            })).not.toBe(null);
        });

        it('Should check for exceptions in value if specified', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.validator = "numberValidator";
            app.except = 10;
            expect(app.validate({
                value: 9
            })).toBe(null);
            expect(app.validate({
                value: 11
            })).toBe(null);
            expect(app.validate({
                value: 10
            })).not.toBe(null);
        });
    });

    describe('Telephone validators', () => {
        it('Should update current validator', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.validator = "telephoneValidator";
            expect(app._validator.toString()).toBe(createValidationFunction("telephoneValidator").toString());
        });

        it('Should validate value if correct', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.validator = "telephoneValidator";
            expect(app.validate({
                value: "321"
            })).toBe(null);
            expect(app.validate({
                value: 312
            })).toBe(null);
            expect(app.validate({
                value: "3214834534"
            })).toBe(null);
            expect(app.validate({
                value: "321 4834534"
            })).toBe(null);
            expect(app.validate({
                value: "+32 14834534"
            })).toBe(null);
            expect(app.validate({
                value: "+3214834534"
            })).toBe(null);
            expect(app.validate({
                value: "+32 14 834534"
            })).toBe(null);
            expect(app.validate()).toBe(null);
        });

        it('Should raise error if contains invalid characters', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.validator = "telephoneValidator";
            expect(app.validate({
                value: "asdf1"
            })).not.toBe(null);
            expect(app.validate({
                value: 3.12
            })).not.toBe(null);
            expect(app.validate({
                value: "321 4 834534"
            })).not.toBe(null);
            expect(app.validate({
                value: "+32 14 8 34534"
            })).not.toBe(null);
            expect(app.validate({
                value: "+3 283 4534"
            })).not.toBe(null);
            expect(app.validate({
                value: "+328 3 4534"
            })).not.toBe(null);
        });
    });

    describe('Mail validators', () => {
        it('Should update current validator', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.validator = "mailValidator";
            expect(app._validator.toString()).toBe(createValidationFunction("mailValidator").toString());
        });

        it('Should validate value if correct', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.validator = "mailValidator";
            expect(app.validate({
                value: "roba@roba.it"
            })).toBe(null);
            expect(app.validate({
                value: "a@b.c"
            })).toBe(null);
            expect(app.validate({
                value: "a.n.r43ear@b.c"
            })).toBe(null);
            expect(app.validate({
                value: "a@b.frwge4g.3q.c"
            })).toBe(null);
            expect(app.validate()).toBe(null);
        });

        it('Should raise error if contains invalid characters', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.validator = "mailValidator";
            expect(app.validate({
                value: "roE"
            })).not.toBe(null);
            expect(app.validate({
                value: 234
            })).not.toBe(null);
            expect(app.validate({
                value: "a@b"
            })).not.toBe(null);
            expect(app.validate({
                value: "a.b"
            })).not.toBe(null);
            expect(app.validate({
                value: "@"
            })).not.toBe(null);
            expect(app.validate({
                value: "."
            })).not.toBe(null);
        });
    });

    describe('URL validators', () => {
        it('Should update current validator', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.validator = "urlValidator";
            expect(app._validator.toString()).toBe(createValidationFunction("urlValidator").toString());
        });

        it('Should validate value if correct', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.validator = "urlValidator";
            expect(app.validate({
                value: "roba.roba"
            })).toBe(null);
            expect(app.validate({
                value: "roba32.ro3ba.roba.roba"
            })).toBe(null);
            expect(app.validate({
                value: "ro43ba.roba/ro23ba/roba/roba"
            })).toBe(null);
            expect(app.validate({
                value: "www.roba.roba/?=r34tasfg&a=edrg"
            })).toBe(null);
            expect(app.validate({
                value: "roba.roba/?=r34tasfg&a=edrg"
            })).toBe(null);
            expect(app.validate({
                value: "https://www.roba.roba/?=r34tasfg&a=edrg"
            })).toBe(null);
            expect(app.validate({
                value: "https://roba.roba/?=r34tasfg&a=edrg"
            })).toBe(null);
            expect(app.validate()).toBe(null);
        });

        it('Should raise error if contains invalid characters', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.validator = "urlValidator";
            expect(app.validate({
                value: "roba.ro4"
            })).not.toBe(null);
            expect(app.validate({
                value: "rba"
            })).not.toBe(null);
            expect(app.validate({
                value: ".btr"
            })).not.toBe(null);
            expect(app.validate({
                value: "http://rba"
            })).not.toBe(null);
            expect(app.validate({
                value: 123
            })).not.toBe(null);
        });
    });

    describe('DateWithoutYear validator', () => {
        it('Should update current validator', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.validator = "dateWithoutYearValidator";
            expect(app._validator.toString()).toBe(createValidationFunction("dateWithoutYearValidator").toString());
        });

        it('Should validate value if correct', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.validator = "dateWithoutYearValidator";
            expect(app.validate({
                value: "23/2"
            })).toBe(null);
            expect(app.validate()).toBe(null);
        });

        it('Should raise error if contains invalid characters', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.validator = "dateWithoutYearValidator";
            expect(app.validate({
                value: "roE"
            })).not.toBe(null);
            expect(app.validate({
                value: 1.23
            })).not.toBe(null);
            expect(app.validate({
                value: "23/2/2"
            })).not.toBe(null);
            expect(app.validate({
                value: "402/2"
            })).not.toBe(null);
            expect(app.validate({
                value: "4/233"
            })).not.toBe(null);
        });
    });

    describe('ObjectID validator', () => {
        it('Should update current validator', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.validator = "objectID";
            expect(app._validator.toString()).toBe(createValidationFunction("objectID").toString());
        });

        it('Should validate value if correct', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.validator = "objectID";
            expect(app.validate({
                value: "507f1f77bcf86cd799439011"
            })).toBe(null);
            expect(app.validate({
                value: "507f1F77BCf86cd799439011"
            })).toBe(null);
            expect(app.validate()).toBe(null);
        });

        it('Should raise error if contains invalid characters', () => {
            const fixture = TestBed.createComponent(BcTextInput);
            const app = fixture.debugElement.componentInstance;
            app.validator = "objectID";
            expect(app.validate({
                value: "roE"
            })).not.toBe(null);
            expect(app.validate({
                value: 1.23
            })).not.toBe(null);
            expect(app.validate({
                value: "23/2/2"
            })).not.toBe(null);
            expect(app.validate({
                value: "507f439011"
            })).not.toBe(null);
            expect(app.validate({
                value: "507f1F77BCf86cd79aa3249439011"
            })).not.toBe(null);
        });
    });
});
