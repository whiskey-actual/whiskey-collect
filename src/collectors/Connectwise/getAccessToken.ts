import https from 'https'
import { AxiosInstance}from 'axios'
import { LogEngine } from "whiskey-log";

export async function getAccessToken(le:LogEngine, axiosInstance:AxiosInstance, username:string, password:string):Promise<string> {
    le.logStack.push("getAccessToken")
    let output:string

    try {
        le.AddLogEntry(LogEngine.EntryType.Info, 'getting access token ..')
        const response = await axiosInstance.post('/apitoken', { UserName: username, Password: password});
        output = response.data.AccessToken;
        le.AddLogEntry(LogEngine.EntryType.Success, `.. accessToken received.`)
    } catch (ex) {
        le.AddLogEntry(LogEngine.EntryType.Error, `${ex}`)
        throw ex;
    } finally {
        le.logStack.pop()
    }

    return new Promise<string>((resolve) => {resolve(output)})

}