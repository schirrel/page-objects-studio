
// const { writeFile, convertFileRegex2FileList } = require('../docs/utils/file');
const jsdoc2md = require('jsdoc-to-markdown');
// const { config } = require('../docs/utils/cli');
// const { log, error } = require('../console/log');
// const consoleUtils = require('../console/utils');
const fg = require('fast-glob');
const fs = require('fs');
const writeFile = (destination, template) => {
    try {
        fs.writeFileSync(destination, template)
    } catch (exception) {
        // in case of directory not created yet
        const directories = destination.split('/');
        directories.pop();
        const finalPath = directories.join('/');
        fs.mkdirSync(finalPath, { recursive: true });
        fs.writeFileSync(destination, template)
    }
}

const { getClassData, isFunctionScope, isFunctionKind } = require('./jsonData');
let finalJson = {}
let jsonArray = []

const convertFileRegex2FileList = (path) => fg.globSync(path, { dot: true })

const mountJson = (file) => {

    const templateData = jsdoc2md.getTemplateDataSync({
        files: file,
        'no-cache': true,
    })

    if (finalJson[templateData[0]?.id]) {
        error(`Duplicated ${templateData.id}`)
    } else {
        const classData = getClassData(templateData)
        const functions = templateData.filter(item => isFunctionScope(item) && isFunctionKind(item))

        finalJson[classData.longname] = {
            name: classData.longname,
            description: classData.description,
            functions
        }
        if (functions.length) {
            const name = classData.longname.indexOf('#') > -1 ? classData.longname.split('#').shift() : classData.longname;

            jsonArray.push({
                name,
                label: name,
                source: classData,
                description: classData.description,
                functions
            })
        }
    }

}



(function () {

    const allFiles = convertFileRegex2FileList('packages/example/dist/**/*.js');
    const filteredFiles = allFiles.filter(f => f.indexOf('/index') === -1 && f.indexOf('spec') === -1&& f.indexOf('/Test.js') === -1)

    for (const file of filteredFiles) {
        console.log(`📝 - Generating JSON for ${file}`);
        mountJson(file);

    }


    writeFile('packages/studio/data/actions.json', JSON.stringify(jsonArray))

})()