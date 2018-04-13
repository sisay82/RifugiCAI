import {
    TestBed,
    async
} from '@angular/core/testing';
import {
    BcBaseInput,
    parseDate,
    trimYear,
    createValidationFunction
} from './input_base';
import {
    By
} from '@angular/platform-browser';
import {
    Component
} from '@angular/core';

@Component({
    template: ""
})
class FakeInputComponent extends BcBaseInput { }

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
        app.required = true;
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
        app.registerOnChange((val) => { updatedVal = val});
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
