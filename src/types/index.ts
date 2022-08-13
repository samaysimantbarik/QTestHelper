
export type TExecutionQTest = {
    description: string,
    testCasePid: string,
    status: TStatus,
    duration?: number,
    startTime: Date,
    failedStep?: string,
    error?: string,
    screenshot?: string,
    testSuiteId: string
}

export type TStatus = 'PASSED' | 'FAILED';

export type TTestLog = {
    description: string,
    expected_result: string,
    actual_result: string,
    status: TStatus,

}[]

export type TAttachments = {
    name: string,
    content_type: string,
    data: string
}[]
export type TRequestBody = {
    status: TStatus,
    exe_start_date: Date,
    exe_end_date: Date,
    test_step_logs?: TTestLog,
    attachments?: TAttachments | any
}

export type QTestConfigType = {
    projectUrl: string,
    projectId: string,
    auth: string,
    version?: string
}


