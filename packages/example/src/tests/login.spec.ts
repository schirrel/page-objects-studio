import { DialogActions } from "../pageObjects/components/Dialog/DialogAction";
import { LoginPage } from "../pageObjects/pages/login/pageActions";
import { describe, it } from "../pageObjects/setup/Test";

describe("Login Page", {}, () => {
    it("login success", {}, () => {
        LoginPage.login("user@email.com", "password");
        DialogActions.haveTitle("Welcome");
    });

    it("login failed", {}, () => {
        LoginPage.login("user@email.com", "password");
        DialogActions.haveTitle("Wrong credentials");
    });
});
