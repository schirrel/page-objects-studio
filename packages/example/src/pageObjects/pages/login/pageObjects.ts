import { TestElement } from "../../setup/TestElement";
import { TestDriver } from "../../setup/TestTool";


/**
 * UI Elements dictionary for the Login Page
 *
 * @export
 * @class LoginPageObjects
 * @typedef {LoginPageObjects}
 */
export class LoginPageObjects {

    /**
     * The Email input
     * @static
     * @readonly
     * @type {TestElement} - the element that represents the input on the page
     */
    static get inputEmail(): TestElement {
        return TestDriver.get('#email')
    }
    /**
     * The password input
     * @static
     * @readonly
     * @type {TestElement} - the element that represents the input on the page
     */
    static get inputPassword(): TestElement {
        return TestDriver.get('.i-password')
    }
    /**
     * The login button
     * @static
     * @readonly
     * @type {TestElement} - the element that represents the button on the page
     */
    static get buttonSubmit(): TestElement {
        return TestDriver.get('[button="submit"]')
    }
}