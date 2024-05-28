/**
 * This code is a shrink adaptation from https://github.com/bahmutov/find-test-names
 */
// const config = require(process.cwd() + "/config.json");
const babel = require("@babel/parser");
const walk = require("acorn-walk");
const {
  isDescribe,
  isDescribeSkip,
  isIt,
  isItSkip,
  isItOnly,
} = require("./utils");

const getParam = (param, source, node) => {
  if (node.arguments.length < 2) {
    return;
  }

  if (node.arguments[1].type === "ObjectExpression") {
    // extract any possible param
    const paramValue = node.arguments[1].properties.find((node) => {
      return node.key.name === param;
    });
    if (paramValue) {
      if (paramValue.value.type === "ArrayExpression") {
        const paramValueText = source.slice(paramValue.start, paramValue.end);
        return eval(paramValueText);
      }
      if (paramValue.value.type === "ObjectExpression") {
        const paramValueText = source
          .slice(paramValue.start, paramValue.end)
          .replace(param + ":", "");
        let objConverted = {};
        eval("objConverted = " + paramValueText);
        return objConverted;
      } else if (paramValue.value.type === "Literal") {
        return [paramValue.value.value];
      }
    }
  }
};

const populateParamOptions = (toPopulate, source, node) => {
  const params = {};
  config?.params?.forEach((paramName) => {
    const paramValue = getParam(paramName, source, node);
    if (paramValue !== null && paramValue !== undefined) {
      toPopulate[paramName] = paramValue;
      params[paramName] = paramValue || [];
    }
  });
  return params;
};

// extracts the test name from the literal or template literal node
// if the test name is a variable, returns undefined
const extractTestName = (node) => {
  if (node.type === "TemplateLiteral") {
    return node.quasis.map((q) => q.value.cooked.trim()).join(" ");
  } else if (node.type === "Literal") {
    return node.value;
  } else {
    return undefined;
  }
};

const plugins = [
  "jsx",
  "estree", // To generate estree compatible AST
  "typescript",
];

function ignore(_node, _st, _c) { }

const base = walk.make({});

/**
 * The proxy ignores all AST nodes for which acorn has no base visitor.
 * This includes TypeScript specific nodes like TSInterfaceDeclaration,
 * but also babel-specific nodes like ClassPrivateProperty.
 *
 * Since describe / it are CallExpressions, ignoring nodes should not affect
 * the test name extraction.
 */
const proxy = new Proxy(base, {
  get: function (target, prop) {
    if (target[prop]) {
      return Reflect.get(...arguments);
    }

    return ignore;
  },
});

const getDescribe = (node, source, pending = false) => {
  const name = extractTestName(node.arguments[0]);
  const suiteInfo = {
    type: "suite",
    pending,
  };
  if (typeof name !== "undefined") {
    suiteInfo.name = name;
  }

  if (pending) {
    suiteInfo.pending = true;
  }

  if (!pending) {
    // the suite might be pending by the virtue of only having the name
    // example: describe("is pending")
    if (node.arguments.length === 1) {
      suiteInfo.pending = true;
    } else if (
      node.arguments.length === 2 &&
      node.arguments[1].type === "ObjectExpression"
    ) {
      // the suite has a name and a config object
      // but now callback, thus it is pending
      suiteInfo.pending = true;
    }
  }

  const params = populateParamOptions(suiteInfo, source, node);

  const suite = {
    name,
    ...params,
    pending: suiteInfo.pending,
    type: "suite",
    tests: [],
    suites: [],
    testCount: 0,
    suiteCount: 0,
  };
  return { suiteInfo, suite };
};

const getIt = (node, source, pending = false) => {
  const name = extractTestName(node.arguments[0]);
  const testInfo = {
    type: "test",
    pending,
  };
  if (typeof name !== "undefined") {
    testInfo.name = name;
  }

  if (!pending) {
    // the test might be pending by the virtue of only having the name
    // example: it("is pending")
    if (node.arguments.length === 1) {
      testInfo.pending = true;
    } else if (
      node.arguments.length === 2 &&
      node.arguments[1].type === "ObjectExpression"
    ) {
      // the test has a name and a config object
      // but now callback, thus it is pending
      testInfo.pending = true;
    }
  }

  const params = populateParamOptions(testInfo, source, node);

  const test = {
    name,
    ...params,
    pending: testInfo.pending,
    type: "test",
  };
  return { testInfo, test };
};

/**
 * This function returns a tree structure which contains the test and all of its new suite parents.
 *
 * Loops over the ancestor nodes of a it / it.skip node
 * until it finds an already known suite node or the top of the tree.
 *
 * It uses a suite cache by node to make sure no tests / suites are added twice.
 * It still has to walk the whole tree for every test in order to aggregate the suite / test counts.
 *
 * Technical details:
 *   acorn-walk does depth first traversal,
 *   i.e. walk.ancestor is called with the deepest node first, usually an "it",
 *   and a list of its ancestors. (other AST walkers traverse from the top)
 *
 *   Since the tree generation starts from it nodes, this function cannot find
 *   suites without tests.
 *   This is handled by getOrphanSuiteAncestorsForSuite
 *
 */
const getSuiteAncestorsForTest = (test, source, ancestors, nodes, fullSuiteNames ) => {
  let knownNode = false;
  let suiteBranches = [];
  let prevSuite;
  let directParentSuite = null;
  let suiteCount = 0;

  for (var i = ancestors.length - 1; i >= 0; i--) {
    const node = ancestors[i];
    const describe = isDescribe(node);
    const skip = isDescribeSkip(node);

    if (describe || skip) {
      let suite;

      knownNode = nodes.has(node.callee);

      if (knownNode) {
        suite = nodes.get(node.callee);
      } else {
        const result = getDescribe(node, source, skip);
        suite = result.suite;
        nodes.set(node.callee, suite);
      }

      if (prevSuite) {
        suiteCount++;
        suite.suites.push(prevSuite);
      }

      if (!directParentSuite) {
        // found this test's direct parent suite
        directParentSuite = suite;
      }

      suite.testCount++;
      suite.suiteCount += suiteCount;

      prevSuite = knownNode ? null : suite;
      suiteBranches.unshift(suite);
    }
  }

  // walked tree to the top
  if (suiteBranches.length) {
    // Compute the full names of suite and test, i.e. prepend all parent suite names
    const suiteNameWithParentSuiteNames = computeParentSuiteNames(
      suiteBranches,
      fullSuiteNames,
    );

    test.fullName = `${suiteNameWithParentSuiteNames} ${test.name}`;

    directParentSuite.tests.push(test);

    return {
      suite: !knownNode && prevSuite, // only return the suite if it hasn't been found before
      topLevelTest: false,
    };
  } else {
    // top level test
    test.fullName = test.name;
    return { suite: null, topLevelTest: true };
  }
};

/**
 * This function is used to find (nested) empty describes.
 *
 * Loops over the ancestor nodes of a describe / describe.skip node
 * and return a tree of unknown suites.
 *
 * It uses the same nodes cache as getSuiteAncestorsForTest to make sure
 * no suites are added twice / no unnecessary nodes are walked.
 */
const getOrphanSuiteAncestorsForSuite = (ancestors, source, nodes, fullSuiteNames) => {
  let prevSuite;
  let suiteBranches = [];
  let knownNode = false;
  let suiteCount = 0;

  for (var i = ancestors.length - 1; i >= 0; i--) {
    // in the first iteration the ancestor is identical to the node
    const ancestor = ancestors[i];

    const describe = isDescribe(ancestor);
    const skip = isDescribeSkip(ancestor);

    if (describe || skip) {
      if (nodes.has(ancestor.callee)) {
        if (i === 0) {
          // If the deepest node in the tree is known, we don't need to walk up
          break;
        }

        // Reached an already known suite
        knownNode = true;
        const suite = nodes.get(ancestor.callee);

        if (prevSuite) {
          // Add new child suite to suite
          suite.suites.push(prevSuite);
          prevSuite = null;
        }

        suite.suiteCount += suiteCount;
        suiteBranches.unshift(suite);
      } else {
        const { suite } = getDescribe(ancestor, source, skip);

        if (prevSuite) {
          suite.suites.push(prevSuite);
          suite.suiteCount += suiteCount;
        }

        suiteCount++;

        nodes.set(ancestor.callee, suite);
        prevSuite = knownNode ? null : suite;
        suiteBranches.unshift(suite);
      }
    }
  }

  computeParentSuiteNames(suiteBranches, fullSuiteNames);

  if (!knownNode) {
    // walked tree to the top and found new suite(s)
    return prevSuite;
  }

  return null;
};

/**
 * Compute the full names of suites in an array of branches, i.e. prepend all parent suite names
 */
function computeParentSuiteNames(suiteBranches, fullSuiteNames) {
  let suiteNameWithParentSuiteNames = "";

  suiteBranches.forEach((suite) => {
    suite.fullName = `${suiteNameWithParentSuiteNames} ${suite.name}`.trim();
    fullSuiteNames.add(suite.fullName);

    suiteNameWithParentSuiteNames = suite.fullName;
  });

  return suiteNameWithParentSuiteNames;
}

function countPendingTests(suite) {
  if (!suite.type === "suite") {
    throw new Error("Expected suite");
  }

  const pendingTestsN = suite.tests.reduce((count, test) => {
    if (test.type === "test" && test.pending) {
      return count + 1;
    }
    return count;
  }, 0);

  const pendingTestsInSuitesN = suite.suites.reduce((count, suite) => {
    const pending = countPendingTests(suite);
    suite.pendingTestCount = pending;
    return count + pending;
  }, 0);

  return pendingTestsN + pendingTestsInSuitesN;
}

/**
 * Looks at the tests and counts how many tests in each suite
 * are pending. The parent suites use the sum of the inner
 * suite counts.
 * Warning: modifies the input structure
 */
function countTests(structure) {
  let testCount = 0;
  let pendingTestCount = 0;
  structure.forEach((t) => {
    if (t.type === "suite") {
      testCount += t.testCount;
      const pending = countPendingTests(t);
      if (typeof pending !== "number") {
        console.error(t);
        throw new Error("Could not count pending tests");
      }
      t.pendingTestCount = pending;
      pendingTestCount += pending;
    } else {
      testCount += 1;
      if (t.pending) {
        pendingTestCount += 1;
      }
    }
  });
  return { testCount, pendingTestCount };
}

function getLeadingComment(ancestors) {
  if (ancestors.length > 1) {
    const a = ancestors[ancestors.length - 2];
    if (a.leadingComments && a.leadingComments.length) {
      // grab the last comment line
      const firstComment = a.leadingComments[a.leadingComments.length - 1];
      if (firstComment.type === "CommentLine") {
        const leadingComment = firstComment.value;
        if (leadingComment.trim()) {
          return leadingComment.trim();
        }
      }
    }
  }
}

/**
 * Returns all suite and test names found in the given JavaScript
 * source code (Mocha / Cypress syntax)
 * @param {string} source
 * @param {boolean} withStructure - return nested structure of suites and tests
 */
function getSpecInfo(source, withStructure) {
  // should we pass the ecma version here?
  let AST;
  try {
    AST = babel.parse(source, {
      plugins,
      sourceType: "script",
    }).program;
  } catch (e) {
    AST = babel.parse(source, {
      plugins,
      sourceType: "module",
    }).program;
  }

  const suiteNames = [];
  const testNames = [];
  // suite names with parent suite names prepended
  const fullSuiteNames = new Set();
  // test names with parent suite names prepended
  const fullTestNames = [];
  // mixed entries for describe and tests
  // each entry has name and possibly a list of params
  const tests = [];

  // Map of known nodes keyed: callee => value: suite
  let nodes = new Map();

  // Tree of describes and tests
  let structure = [];

  walk.ancestor(
    AST,
    {
      CallExpression(node, ancestors) {
        if (isDescribe(node)) {
          const { suiteInfo } = getDescribe(node, source);
          const suite = getOrphanSuiteAncestorsForSuite(
            ancestors,
            source,
            nodes,
            fullSuiteNames,
          );

          if (suite) {
            structure.push(suite);
          }

          suiteNames.push(suiteInfo.name);
          tests.push(suiteInfo);
        } else if (isDescribeSkip(node)) {
          const { suiteInfo } = getDescribe(node, source, true);

          const suite = getOrphanSuiteAncestorsForSuite(
            ancestors,
            source,
            nodes,
            fullSuiteNames,
          );

          if (suite) {
            structure.push(suite);
          }

          suiteNames.push(suiteInfo.name);
          tests.push(suiteInfo);
        } else if (isIt(node)) {
          const { testInfo, test } = getIt(node, source);
          const comment = getLeadingComment(ancestors);
          if (comment) {
            testInfo.comment = comment;
          }

          const { suite, topLevelTest } = getSuiteAncestorsForTest(
            test,
            source,
            ancestors,
            nodes,
            fullSuiteNames,
          );

          if (suite) {
            structure.push(suite);
          } else if (topLevelTest) {
            structure.push(test);
          }

          if (typeof testInfo.name !== "undefined") {
            testNames.push(testInfo.name);
            fullTestNames.push(test.fullName);
          }

          tests.push(testInfo);
        } else if (isItSkip(node)) {
          const { testInfo, test } = getIt(node, source, true);
          const comment = getLeadingComment(ancestors);
          if (comment) {
            testInfo.comment = comment;
          }

          const { suite, topLevelTest } = getSuiteAncestorsForTest(
            test,
            source,
            ancestors,
            nodes,
            fullSuiteNames,
          );

          if (suite) {
            structure.push(suite);
          } else if (topLevelTest) {
            structure.push(test);
          }

          if (typeof testInfo.name !== "undefined") {
            testNames.push(testInfo.name);
            fullTestNames.push(test.fullName);
          }

          tests.push(testInfo);
        } else if (isItOnly(node)) {
          const { testInfo, test } = getIt(node, source, false);
          testInfo.exclusive = true;
          test.exclusive = true;
          const comment = getLeadingComment(ancestors);
          if (comment) {
            testInfo.comment = comment;
          }

          const { suite, topLevelTest } = getSuiteAncestorsForTest(
            test,
            source,
            ancestors,
            nodes,
            fullSuiteNames,
          );

          if (suite) {
            structure.push(suite);
          } else if (topLevelTest) {
            structure.push(test);
          }

          if (typeof testInfo.name !== "undefined") {
            testNames.push(testInfo.name);
            fullTestNames.push(test.fullName);
          }

          tests.push(testInfo);
        }
      },
    },
    proxy,
  );

  const sortedSuiteNames = suiteNames.sort();
  const sortedTestNames = testNames.sort();
  const sortedFullTestNames = [...fullTestNames].sort();
  const sortedFullSuiteNames = [...fullSuiteNames].sort();
  const result = {
    suiteNames: sortedSuiteNames,
    testNames: sortedTestNames,
    tests,
    spec: structure[0],
  };

  if (withStructure) {
    const counts = countTests(structure);
    result.structure = structure;
    result.testCount = counts.testCount;
    result.pendingTestCount = counts.pendingTestCount;
    result.fullTestNames = sortedFullTestNames;
    result.fullSuiteNames = sortedFullSuiteNames;
  }

  return result;
}

module.exports = { getSpecInfo };
