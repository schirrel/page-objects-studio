import { TestDriver } from "../../setup/TestTool";
import { LoginPageObjects } from "./pageObjects";

/**
 * Available actions to be performed at Login page
 */
export class LoginPage {
    /**
     * Perform login action
     * @param {string} username - username to login
     * @param {string}  password - password to login
     */
    static login(username: string, password: string) {
        TestDriver.open('/login.php');
        LoginPageObjects.inputEmail.setValue(username);
        LoginPageObjects.inputPassword.setValue(password);
        LoginPageObjects.buttonSubmit.click();
    }
}
