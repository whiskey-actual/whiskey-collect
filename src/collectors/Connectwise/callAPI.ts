import { LogEngine } from "whiskey-log";
import {AxiosInstance} from 'axios'

export async function callAPI(le:LogEngine, axiosInstance:AxiosInstance, apiEndpoint:string):Promise<any> {
    le.logStack.push("callAPI")
    let output:any
    try {
        le.AddLogEntry(LogEngine.EntryType.Info, `fetching API: ${apiEndpoint}`)
        const response = await axiosInstance.get(apiEndpoint)
        output = response.data
        le.AddLogEntry(LogEngine.EntryType.Success, `.. API call successful.`)
    } catch (ex) {
        le.AddLogEntry(LogEngine.EntryType.Error, `${ex}`)
        throw ex;
    } finally {
        le.logStack.pop()
    }
    
    return new Promise<any>((resolve) => {resolve(output)})

}