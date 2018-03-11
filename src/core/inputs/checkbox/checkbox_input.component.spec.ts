import {
    TestBed,
    async
} from '@angular/core/testing';
import {
    BcCheckboxInput
} from './checkbox_input.component';
import {
    By
} from '@angular/platform-browser';

describe('BcSelectInput', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [BcCheckboxInput]
        }).compileComponents();
    }));

    it('Should not propagate changes if isDisabled', () => {
        const fixture = TestBed.createComponent(BcCheckboxInput);
        const app = fixture.debugElement.componentInstance;
        app.isDisabled = true;
        fixture.detectChanges();
        expect(app.isDisabled).toBe(true);
        const oldVal = app.value;
        app.onChange({
            target: {
                value: true
            }
        });
        expect(app.value).toBe(oldVal);
    });

    it('Should check if box is checked', () => {
        const fixture = TestBed.createComponent(BcCheckboxInput);
        const app = fixture.debugElement.componentInstance;
        app.onChange({
            target: {
                checked: true
            }
        });
        expect(app.value).toBe(true);
        expect(app.isChecked()).toBe(true);
        app.onChange({
            target: {
                checked: false
            }
        });
        expect(app.value).toBe(false);
        expect(app.isChecked()).toBe(false);
        app.onChange({
            target: {
                checked: "true"
            }
        });
        expect(app.value).toBe(true);
        expect(app.isChecked()).toBe(true);
        app.onChange({
            target: {
                checked: "false"
            }
        });
        expect(app.value).toBe(false);
        expect(app.isChecked()).toBe(false);
    });
});
