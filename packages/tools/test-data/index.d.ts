declare namespace Cypress {
    interface SuiteConfigOverrides {
        [key: string]:
            | any
            | {
                  [key: string]: any;
              };
    }
    interface TestConfigOverrides {
        [key: string]:
            | any
            | {
                  [key: string]: any;
              };
    }
}
