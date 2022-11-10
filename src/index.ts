import axios from "axios";
import { TExecutionQTest, TTestLog, TRequestBody, QTestConfigType, TExecutionByDescriptionQTest, EntityReturnType } from "./types";
class QTestHelper {
    #baseUrl: string = '';
    #config: object = {};

    setConfig({ projectUrl, projectId, auth, version = "v3" }
        : QTestConfigType) {
        this.#baseUrl = `${projectUrl}/api/${version}/projects/${projectId}`;
        this.#config = {
            headers: {
                Authorization: auth,
            },
        };
    };

    #getTestCaseId = async (testCasePid: string) => {
        const response =
            await axios.get(this.#baseUrl + '/test-cases/' + testCasePid, this.#config);
        const { id, name } = response.data;
       // console.log(id, name);
        return { id, name };
    };

    #getTestRun = async (testCasePid: string|number, testSuiteId: string) => {
        try {
            const { id: testcaseId } = typeof testCasePid === 'string'
            ?
            (await this.#getTestCaseId(testCasePid)).id:
            testCasePid;

            const response =
                await axios.get(
                    this.#baseUrl + `/test-runs?parentId=${testSuiteId}
              &parentType=test-suite`,
                    this.#config);
            const { items, total } = response.data;
            if (total) {
                return items.find((r: { test_case: { id: any; }; }) =>
                    r.test_case.id === testcaseId)?.id || 0;
            }
            return 0;
        } catch (error) {
            console.log(error);
        }
    };

    #getTestCasesByDescription = async (description: string) => {
        const response =
            await axios.get(this.#baseUrl + '/test-cases?size=10000', this.#config);
        const testCases: EntityReturnType[] = response.data;
        return testCases.filter(testCase => testCase.name.toLowerCase() === description.toLowerCase())
    };

    #getModules = async () => {
        const response =
            await axios.get(this.#baseUrl + '/modules', this.#config);
        const modules: EntityReturnType[] = response.data;
        return modules;
    };
    #createModule = async (name: string) => {
        const payload = {
            name
        }
        const response =
            await axios.post(this.#baseUrl + '/modules', payload, this.#config);
        const module: EntityReturnType = response.data;
        return module;
    };

    #createTestCase = async (name: string, moduleId: number) => {
        const payload = {
            name,
            parent_id: moduleId
        }
        const response =
            await axios.post(this.#baseUrl + '/test-cases', payload, this.#config);
        const testCase: EntityReturnType = response.data;
        return testCase;
    };

    #getOrCreateModule = async (moduleName: string) => {
        const modules = await this.#getModules();
        let module = modules.find(m => m.name === moduleName);
        if (module) return module;
        return await this.#createModule(moduleName);
    }

    #createTestRun = async (testCasePid: string, testSuiteId: string) => {
        const { id, name } = await this.#getTestCaseId(testCasePid);
        const body = {
            parentId: testSuiteId,
            parentType: 'test-suite',
            name,
            order: 0,
            testCaseId: id,
            properties: [
            ],
            test_case: {
                id: id,
                order: 1,
                pid: testCasePid,
                name,
            },
        };
        const response = await axios.post(this.#baseUrl + '/test-runs', body, this.#config);
        const { id: trId } = response.data;
        return trId;
    };

    executeTestRun =
        async ({
            description,
            testCasePid,
            status,
            startTime,
            error = '',
            testSuiteId,
            screenshot = ""
        }: TExecutionQTest) => {


            console.log('*****test case:', testCasePid);
            const existing_test_run_id = await this.#getTestRun(testCasePid, testSuiteId);
            const trId = existing_test_run_id || await this.#createTestRun(testCasePid, testSuiteId);
            const exe_start_date = startTime;
            const actual_result = status === 'FAILED' ? error : 'As Expected';
            const test_step_logs: TTestLog =
                [
                    {
                        description,
                        expected_result: 'Should pass',
                        actual_result,
                        status
                    },
                ];
            const payload: TRequestBody =
            {
                status,
                exe_start_date,
                exe_end_date: new Date(),
                test_step_logs,
            };
            const attachments = (screenshot.length) && [{
                name: "Screenshot",
                content_type: "image/png",
                data: screenshot
            }]

            attachments && (Object.assign(payload, { attachments }));

            try {
                await axios.post(this.#baseUrl + '/test-runs/' + trId + '/auto-test-logs',
                    payload, this.#config);
                console.log('********QTest Updated************ for ', testCasePid);
            } catch (error) {
                console.log('Error while updating test run:', error);
            }
        };

    executeTestRunByName = async (
        {
            testName,
            status,
            startTime,
            error = '',
            testSuiteId,
            screenshot = "",
            errorOnDuplicate = false,
            tempModuleName = "Module created by Automation"
        }: TExecutionByDescriptionQTest
    ) => {
        // Find Test case Id
        const testCases = await this.#getTestCasesByDescription(testName);
        if (!testCases.length) {
            const module = await this.#getOrCreateModule(tempModuleName);
            var testCase = await this.#createTestCase(testName, module.id);
        }
        else if (testCases.length > 1 && errorOnDuplicate)
            throw new Error("Test case description is not unique");
        else {
            var testCase = testCases.slice(-1)[0];
        }

        await this.executeTestRun({
            description: testCase.name,
            testCasePid: testCase.id,
            status,
            startTime,
            error ,
            testSuiteId,
            screenshot 

        })
    }

}

export default new QTestHelper();