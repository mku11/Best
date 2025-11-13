/*
MIT License

Copyright (c) 2021 Max Kas

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// best.js should be called from best.setup.js only!

import { Controller } from './controller.js';
import { Expect } from './asserts.js';
import { } from './utils.js';

const WAIT_BETWEEN_CASES_MS = 200;

// user params globally accessible
window.PARAMS = {};

var testSuite;
var controller = new Controller();

// browser test runner somewhat compatible with jest
var beforeTest = {};
var afterTest = {};
var beforeTestSuite = {};
var afterTestSuite = {};

var testSuites = {};
var testCases = {};
var stopOnError = false;
var totalTestCases = 0;
var passedTestCases = 0;

// jest compatible functions
window.expect = function (actual) {
    return new Expect(actual);
}

window.it = async function (testCaseName, callback) {
    testCases[testSuite].push({
        testCaseName: testCaseName, callback: callback
    });
}

window.beforeEach = async function (callback) {
    beforeTest[testSuite] = callback;
}

window.afterEach = async function (callback) {
    afterTest[testSuite] = callback;
}

window.beforeAll = async function (callback) {
    beforeTestSuite[testSuite] = callback;
}

window.afterAll = async function (callback) {
    afterTestSuite[testSuite] = callback;
}

window.describe = async function (testSuite, callback) {
    testSuites[testSuite] = callback;
    detectTestCases(testSuite);
    controller.addTestSuite(testSuite);
}

// scheduler
async function submitNext(testSuite, testCaseNum, testCaseFilter) {
    if (testCaseNum >= testCases[testSuite].length) {
        if (testSuite in afterTestSuite)
            await afterTestSuite[testSuite]();
        console.log("Test suite complete: " + testSuite);
        console.log("Test cases passed: " + passedTestCases + "/" + totalTestCases);
        return;
    }
    let success = true;
    if (testCaseFilter === 'All' || testCaseFilter === testCases[testSuite][testCaseNum].testCaseName) {
        setAsyncTimeout(async function () {
            console.log("\nRunning test: " + testCases[testSuite][testCaseNum].testCaseName);
            if (testSuite in beforeTest)
                await beforeTest[testSuite]();
            let start, end;
            try {
                start = performance.now();
                await testCases[testSuite][testCaseNum].callback();
                end = performance.now();
            } catch (ex) {
                success = false;
                console.error(ex);
                if (ex.getCause && ex.getCause())
                    console.error(ex.getCause());
            }
            if (testSuite in afterTest)
                await afterTest[testSuite]();
            console.log("Test case: " + testCases[testSuite][testCaseNum].testCaseName
                + ", result: " + (success ? "PASS" : "FAILED")
                + ", time: " + Math.round(end - start) + " ms"
            );
            totalTestCases++;
            passedTestCases += success ? 1 : 0;
            if (success || !stopOnError)
                await submitNext(testSuite, testCaseNum + 1, testCaseFilter);
        }, WAIT_BETWEEN_CASES_MS);
    } else {
        await submitNext(testSuite, testCaseNum + 1, testCaseFilter);
    }
}

// test case detection
async function detectTestCases(testRunningSuite) {
    testSuite = testRunningSuite;
    let callback = testSuites[testSuite];
    testCases[testSuite] = [];
    await callback();
}

// execute test suite
async function executeTestSuite(testSuite, testCase) {
    controller.clearLog();
    passedTestCases = 0;
    totalTestCases = 0;
    try {
        if (testSuite in beforeTestSuite)
            await beforeTestSuite[testSuite]();
    } catch (ex) {
        console.error(ex);
    }
    await submitNext(testSuite, 0, testCase);
}

controller.setOnExecute((testSuite, testCase) => {
    executeTestSuite(testSuite, testCase);
});

controller.setOnTestSuiteChanged(() => {
    controller.updateTestCases(testCases);
});

// user function calls from best.setup.js
export async function addBestTestSuites(testSuitesList) {
    for (let testSuite of testSuitesList) {
        await import('../../../' + testSuite);
    }
    controller.updateTestCases(testCases);
}

export function addBestParameters(testParam) {
    for (let param of testParam) {
        if (param.type == 'list') {
            controller.addUserListParam(param.key, param.name, param.options, (key, value) => {
                window.PARAMS[key] = value;
            });
        }
        else if (param.type == 'directory') {
            controller.addUserDirectoryParam(param.key, param.name, param.value, (key, handle) => {
                window.PARAMS[key] = handle;
            });
        }
    }
}

export function addBestUserNotes(userNotesList) {
    for (let note of userNotesList)
        controller.addUserNote(note);
}