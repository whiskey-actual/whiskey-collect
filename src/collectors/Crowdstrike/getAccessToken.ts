import https from 'https'
import { AxiosInstance}from 'axios'
import { LogEngine } from "whiskey-log";

export async function getAccessToken(le:LogEngine, axiosInstance:AxiosInstance, clientId:string, clientSecret:string):Promise<string> {
    le.logStack.push("getAccessToken")
    let output:string

    try {
        le.AddLogEntry(LogEngine.EntryType.Info, 'getting access token ..')
        const response = await axiosInstance.post(`/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}`);
        output = response.data.access_token;
        le.AddLogEntry(LogEngine.EntryType.Success, `.. accessToken received.`)
    } catch (ex) {
        le.AddLogEntry(LogEngine.EntryType.Error, `${ex}`)
        throw ex;
    } finally {
        le.logStack.pop()
    }

    return new Promise<string>((resolve) => {resolve(output)})

}