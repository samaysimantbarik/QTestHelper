import axios from "axios";
import { TExecutionQTest, TTestLog, TRequestBody, QTestConfigType } from "./types";
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
        console.log(id, name);
        return { id, name };
    };

    #getTestRun = async (testCasePid: string, testSuiteId: string) => {
        try {
            const { id: testcaseId } = await this.#getTestCaseId(testCasePid);
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
}

export default new QTestHelper();