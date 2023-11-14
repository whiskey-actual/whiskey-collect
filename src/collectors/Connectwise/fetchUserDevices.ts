// imports
import { LogEngine } from 'whiskey-log';
import { CleanedDate, CleanedString } from 'whiskey-util'
import { callAPI } from './callAPI';
import { ConnectwiseDevice } from './connectwiseDevice';
import { AxiosInstance } from 'axios';

export async function fetchUserDevices(le:LogEngine, axiosInstance:AxiosInstance):Promise<ConnectwiseDevice[]> {
    le.logStack.push("fetchUserDevices")

    let output:ConnectwiseDevice[] = []

    try {

        const computers = await callAPI(le, axiosInstance, '/Computers?pagesize=10000&orderby=ComputerName asc')
        le.AddLogEntry(LogEngine.EntryType.Info, `.. ${computers.length} devices received; processing ..`)
        for(let i=0; i<computers.length; i++) {
            try {
                const o:ConnectwiseDevice = {
                    // mandatory
                    observedByConnectwise: true,
                    deviceName: computers[i].ComputerName.toString().trim(),
                    connectwiseID: computers[i].Id.toString().trim(),
                    // strings
                    connectwiseDeviceType: CleanedString(computers[i].Type),
                    connectwiseLocation: CleanedString(computers[i].Location.Name),
                    connectwiseClient: CleanedString(computers[i].Client.Name),
                    connectwiseOperatingSystem: CleanedString(computers[i].OperatingSystemName),
                    connectwiseOperatingSystemVersion: CleanedString(computers[i].OperatingSystemVersion),
                    connectwiseDomainName: CleanedString(computers[i].DomainName),
                    connectwiseAgentVersion: CleanedString(computers[i].RemoteAgentVersion),
                    connectwiseComment: CleanedString(computers[i].Comment),
                    connectwiseIpAddress: CleanedString(computers[i].LocalIPAddress),
                    connectwiseMacAddress: CleanedString(computers[i].MACAddress),
                    connectwiseLastUserName: CleanedString(computers[i].LastUserName),
                    connectwiseStatus: CleanedString(computers[i].Status),
                    connectwiseSerialNumber: CleanedString(computers[i].SerialNumber),
                    connectwiseManufacturer: CleanedString(computers[i].BiosManufacturer),
                    connectwiseModel: CleanedString(computers[i].Model),
                    connectwiseDescription: CleanedString(computers[i].Description),
                    // bigint
                    connectwiseTotalMemory: computers[i].TotalMemory,
                    connectwiseFreeMemory: computers[i].FreeMemory,
                    // datetimes
                    connectwiseLastObserved: CleanedDate(computers[i].RemoteAgentLastContact),
                    connectwiseWindowsUpdateDate: CleanedDate(computers[i].WindowsUpdateDate),
                    connectwiseAntivirusDefinitionDate: CleanedDate(computers[i].AntivirusDefinitionDate),
                    connectwiseFirstSeen: CleanedDate(computers[i].DateAdded),
                    connectwiseAssetDate: undefined
                }
                output.push(o)
            } catch (err) {
                le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
                console.debug(computers[i])
                throw(err)
            } 
        }
    
    } catch (ex) {
        le.AddLogEntry(LogEngine.EntryType.Error, `${ex}`)
        throw ex;
    } finally {
        le.AddLogEntry(LogEngine.EntryType.Info, 'done.')
        le.logStack.pop()
    }

return new Promise<ConnectwiseDevice[]>((resolve) => {resolve(output)})

}