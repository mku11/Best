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

// ui.js script should be called from best.js only!
import { Logger } from './logger.js';

export class Controller {

    logReport = document.getElementById("test-log");
    testSuiteList = document.getElementById("test-suite");
    testCaseList = document.getElementById("test-case");
    userTestParams = document.getElementById("user-params-container");
    userNotes = document.getElementById("user-notes-container");
    execute = document.getElementById("execute");
    logger = new Logger();

    constructor() {
        this.logger.redirectLog(
            (msg) => { this.logReport.value += msg }, true,
            (msg) => { this.logReport.value += msg; }, true
        );
        this.testCaseList.onchange = (event) => sessionStorage.setItem(this.testCaseList.id, this.testCaseList.value);
    }

    setOnTestSuiteChanged(callback) {
        this.testSuiteList.onchange = (event) => {
            this.testCaseList.value = sessionStorage.getItem(this.testCaseList.id) || this.testCaseList.value;
            if (!this.testCaseList.value)
                this.testCaseList.value = "All";
            sessionStorage.setItem(this.testSuiteList.id, this.testSuiteList.value);
            callback();
        }
    }

    addTestSuite(testSuite) {
        var el = document.createElement('option');
        el.value = testSuite;
        el.innerHTML = testSuite;
        this.testSuiteList.appendChild(el);
        this.testSuiteList.value = sessionStorage.getItem(this.testSuiteList.id) || this.testSuiteList.value;
    }

    addTestCaseToList(testCaseName) {
        var option = document.createElement('option');
        option.value = testCaseName;
        option.innerHTML = testCaseName;
        this.testCaseList.appendChild(option);
    }

    updateTestCases(testCases) {
        this.testCaseList.innerHTML = '';
        this.addTestCaseToList("All");
        for (let testCase of testCases[this.testSuiteList.value]) {
            this.addTestCaseToList(testCase["testCaseName"]);
        }
        this.testCaseList.value = sessionStorage.getItem(this.testCaseList.id) || this.testCaseList.value;
        if (this.testCaseList.value === "")
            this.testCaseList.value = "All";
    }

    setOnExecute(callback) {
        this.execute.onclick = async () => {
            await callback(this.testSuiteList.value, this.testCaseList.value);
        }
    }

    clearLog() {
        this.logReport.value = "";
    }

    addUserNote(note) {
        var el = document.createElement('span');
        el.innerText = note;
        this.userNotes.appendChild(el);
        this.userNotes.appendChild(document.createElement('br'));
    }

    addUserListParam(key, name, options, callback) {
        var div = document.createElement('div');
        div.classList.add("param-container");

        var label = document.createElement('label');
        label.classList.add("param-label");
        label.htmlFor = key;
        label.innerText = name;

        var select = document.createElement('select');
        select.id = key;
        select.classList.add("test-param-option");
        let selected;
        for (let option of options) {
            var el = document.createElement('option');
            el.value = option.value;
            el.innerHTML = option.name;
            if (option.default)
                selected = el.value;
            select.appendChild(el);
        }
        if (selected != undefined)
            select.value = selected;
        select.value = sessionStorage.getItem(select.id) || select.value;

        select.onchange = (e) => {
            sessionStorage.setItem(select.id, select.value);
            callback(key, select.value);
        }
        div.appendChild(label);
        div.appendChild(select);
        this.userTestParams.appendChild(div);
        callback(key, select.value);
    }

    addUserDirectoryParam(key, name, value, callback) {
        var div = document.createElement('div');
        div.classList.add("param-container");

        var label = document.createElement('label');
        label.classList.add("param-label");
        label.htmlFor = key;
        label.innerText = name;

        var btn = document.createElement('button');
        btn.id = key;
        btn.innerText = value;
        btn.classList.add("test-param-option");
        btn.onclick = async () => {
            let dirHandle = await showDirectoryPicker({ id: 1, mode: "readwrite", multiple: false });
            callback(key, dirHandle);
        };

        div.appendChild(label);
        div.appendChild(btn);
        this.userTestParams.appendChild(div);
    }
}