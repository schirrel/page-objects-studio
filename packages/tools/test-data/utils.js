
const isDescribeName = (name) => name === 'describe' || name === 'context';

const isDescribe = (node) => node.type === 'CallExpression' && isDescribeName(node.callee.name);

const isCallAndMember = (node) => node.type === 'CallExpression' && node.callee.type === 'MemberExpression';
const isItOrSpecify = (name) => name === 'it' || name === 'specify';

const isDescribeSkip = (node) =>
  isCallAndMember(node) && isDescribeName(node.callee.object.name) && node.callee.property.name === 'skip';

const isIt = (node) => node.type === 'CallExpression' && isItOrSpecify(node.callee.name);

const isItSkip = (node) =>
  isCallAndMember(node) && isItOrSpecify(node.callee.object.name) && node.callee.property.name === 'skip';

const isItOnly = (node) =>
  isCallAndMember(node) && isItOrSpecify(node.callee.object.name) && node.callee.property.name === 'only';


module.exports = {
  isDescribeName,
  isDescribe,
  isDescribeSkip,
  isIt, 
  isItSkip,
  isItOnly,
  isCallAndMember,
  isItOrSpecify
}