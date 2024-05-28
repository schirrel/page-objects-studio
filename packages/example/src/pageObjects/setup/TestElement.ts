/**
 * Object Wrapper for the testing library
 *
 * @class TestElement
 * @typedef {TestElement}
 */
export class TestElement {
    /**
     * The element selector
     * @type {string}
     */
    selector: string;
    /**
     * The element itself
     * @type {HTMLElement}
     */
    element: HTMLElement;
    /**
     * Creates an instance of TestElement.
     * @constructor
     * @param {string} selector - the selector used to retrieve the object (in real framework/libs)
     */
    constructor(selector: string) {
        this.selector = selector;
        this.element = document.createElement("div");
    }
    /**
     * Set a value to the element
     * @param {string} value - value to be set at input or text area
     * @example
     * TestDriver.get('#InputId').setValue('my@email.com');
     */
    setValue(value: string) {
        (this.element as HTMLInputElement).value = value;
    }
    /**
     * Check the value of the element is equals as expected 
     * @param {string} value - value to be at input or text area
     * @example
     * TestDriver.get('#InputId').equals('my@email.com');
     */
    equals(value: string) {
        return (this.element as HTMLInputElement).value == value;
    }

    /**
     * Clicks on the element
     * @example
     * TestDriver.get('[type="submit"]').click();
     */
    click() {
        this.element.click();
    }
    /**
     * Check if the elements exists
     * @returns {boolean} - if the element exists based on style's display (mock)
     * @example
     * if(TestDriver.get('#InputId').exists()) { }
     */
    exists() {
        return this.element.style.display !== "none";
    }
}
