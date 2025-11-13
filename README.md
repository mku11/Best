# Best
Best is a Jest semi-compatible test runner for the Browser.  
You can run your Jest test cases directly on the web browser with optional UI parameters.  
Published under MIT License  

## Features
* Test Suites and Cases selection
* User defined test parameters (drop down list, local directory selection)
* Console redirection to UI
* Reporting with summary, status, and timing

## Example

1. Import the Best module  
Similar to Jest we use a best.setup.js file to setup Best  
```
// best.setup.js
import { addBestParameters, addBestTestSuites, addBestUserNotes } from '../best/assets/js/best.js';
```

2. Add the test suites with respect to the location of the best directory  
Example of a project file structure:  
```
project
-- best
   -- assets
      -- js
         best.js
      -- css
         main.js
   index.html
-- test
   -- test-suite1
      test_cases1.test.js
      test_cases2.test.js
   -- test-suite2
      test_cases3.test.js
      test_cases4.test.js
   best.setup.js
```

```
// best.setup.js
await addBestTestSuites([
    './test/test-suite1/test_cases1.test.js',
    './test/test-suite1/test_cases2.test.js',
    './test/test-suite2/test_cases3.test.js',
    './test/test_suite2/test_cases4.test.js'
]);
```

3. Add user notes for the footer (optional)
```
// best.setup.js
addBestUserNotes([
    '* Test Note 1',
	'* Test Note 2',
]);
```

4. Set your test parameters for the UI (optional)  
Test parameter description:  
key: Unique id for the parameter, it could be any string  
name: The text for the UI parameter  
type: list, directory  
	list: A drop down list with options  
		options: Options that will appear under the drop down list  
			name: The unique name of the option  
			value: The value of the option that can be selected by the user  
	directory: A select button if you use local files to do your testing  
		value: The text of the button.  
To retrieve the selected values see the next step.  

```
// best.setup.js
addBestParameters([
    {
        type: 'list', key: "TEST_MODE", name: "Test Mode", options: [
            { name: 'Local', value: 'Local', default: true },
            { name: 'Remote', value: 'Http' }
        ]
    },
    {
        type: 'list', key: "TEST_THREADS", name: "Threads", options: [
            { name: '1', value: 1, default: true },
            { name: '2', value: 2 },
            { name: '4', value: 4 }
        ]
    },
    {
        type: 'directory', key: "TEST_DIR", name: "Test Folder", value: "Select"
    },
]);
```

// 5. You can write your test cases as you would normally do for Jest
```
// test_cases1.test.js
describe('test_cases1', () => {
	// The most common Jest hooks are supported
	beforeAll(async () => { ... });
    afterAll(async () => { ... });
	beforeEach(async () => { ... });
	afterEach(async () => { ... });
	
	// Jest test case
    it('shouldRunTestCase', async () => {
		// To access the UI parameters you can use the global PARAMS object:
		let testMode = PARAMS['TEST_MODE']; // should be 'Local' or 'Http'
		let testThreads = PARAMS['TEST_THREADS']; // should be '1', '2', or '4'
		// To access the file Handle for a 'directory' type:
		let dirHandle = PARAMS['TEST_DIR'];        
		
		// The most common Jest assertions are supported:
		expect(...).toBe();
		expect(...).toBeTruthy();
		expect(...).toBeFalsy();
		expect(...).toBeDefined();
    });
```