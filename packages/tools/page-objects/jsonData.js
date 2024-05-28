const getClassData = (templateData) => {
    const classes = templateData.find(item => item.kind == 'class')
    if (classes) return classes;

    return templateData.shift();
}

const isFunctionScope = (item) => item.scope == 'instance' || item.scope == 'static';
const isFunctionKind = (item) => item.kind != 'constructor' && item.kind != 'class'


module.exports = {
    getClassData, isFunctionScope, isFunctionKind
}