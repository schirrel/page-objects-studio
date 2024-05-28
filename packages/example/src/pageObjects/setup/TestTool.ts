/*
 * This is a mock test tool to simulate this working with any framework you like( Wdio, Cypress, Seleniun or whatever)
 */

import { TestElement } from "./TestElement";

/**
 * The fake Library for E2E testing
 * @export
 * @class TestDriver
 * @typedef {TestDriver}
 */
export class TestDriver {
    /**
     * Open the page by url
     * @static
     * @param {string} url - the url to be opened
     * @example
     * TestDriver.open('www.google.com');
     */
    static open(url: string) {}
    /**
     * Get the element from the web page based on the css selector
     * @static
     * @param {string} selector - a valid css query
     * @returns {TestElement} - The element found on the page
     * @example
     * TestDriver.get('#InputId');
     * TestDriver.get('.btn');
     * TestDriver.get('[type="submit"]');
     */
    static get(selector: string): TestElement {
        return new TestElement(selector);
    }    
}
