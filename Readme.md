
# QTestHelper

Module that helps update test case execution results in QTest.


## Installation
```
npm install qtest_integration
```

# How to use

In before hook, call the setConfig Method
```
import qTestHelper from 'qtest_integration';



    before(() => {
      qTestHelper.setConfig({
        projectUrl: EVIRONMENT_CONSTANTS.QTEST_URL,
        projectId: EVIRONMENT_CONSTANTS.QTEST_PROJECTID,
        auth: EVIRONMENT_CONSTANTS.QTEST_AUTH
      });
    })
```
In the after-each hook, call the executeTestRun command
```
 const payload =
        {
          description,   // Test case name
          testCasePid,   // Test case id, example 'TC-57'
          status,        // Valid value : PASSED | FAILED
          startTime,    // Start time
          error,        // Provide the error message if the status is FAILED [OPTIONAL]
          testSuiteId,   // Id of a test suite
          screenshot     // Base the base64 encoded string of screenshot [OPTIONAL]
        };

        await qTestHelper.executeTestRun(payload);

```

![Alt text](/assets/qTestHelper_scn1.png?raw=true "Ref1")
![Alt text](/assets/qTestHelper_scn2.png?raw=true "Ref2")