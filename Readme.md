
# QTestHelper

Module that helps update test case execution results in QTest.


## Installation
```
npm install qtest_integration
```

## How to use

### In before hook, call the setConfig Method
```
import qTestHelper from 'qtest_integration';



    before(() => {
      qTestHelper.setConfig({
        projectUrl , // Project url
        projectId,  // Project Id,
        auth       // Bearer Token
      });
    })
```
![Alt text](https://github.com/samaysimantbarik/QTestHelper/blob/master/assets/qTestHelper_scn0.png "Project configs")

### In the after-each hook, call the executeTestRun command
```
 const payload =
        {
          description,   // Test case name
          testCasePid,   // Test case id, example 'TC-57'
          status,        // Valid value : PASSED | FAILED
          startTime,    // Start time
          error,        // Provide the error message if the status is FAILED [OPTIONAL]
          testSuiteId,   // Id of a test suite
          screenshot     // Provide the base64 encoded string of screenshot [OPTIONAL]
        };

        await qTestHelper.executeTestRun(payload);

```

![Alt text](https://github.com/samaysimantbarik/QTestHelper/blob/master/assets/qTestHelper_scn1.png "Ref1")
![Alt text](https://github.com/samaysimantbarik/QTestHelper/blob/master/assets/qTestHelper_scn2.png "Ref2")