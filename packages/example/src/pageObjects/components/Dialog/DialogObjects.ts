import { DialogObjects } from "./DialogObject";

/**
 * Available actions to be performed on the Dialog Component
 * @export
 * @class DialogActions
 * @typedef {DialogActions}
 */
export class DialogActions {
    /**
     * Description placeholder
     *
     * @static
     */
    static confirm() {
        DialogObjects.primaryButton.click();
    }
    /**
     * Description placeholder
     *
     * @static
     */
    static close() {
        if (DialogObjects.secondarySubmit.exists()) {
            DialogObjects.secondarySubmit.click();
        }
        DialogObjects.closeButton.click();
    }
    /**
     * Check if dialog have a specific title
     * @static
     * @param {string} titleToCompare - title we are expecting the dialog to have
     */
    static haveTitle(titleToCompare: string) {
        DialogObjects.title.equals(titleToCompare);
    }
}
