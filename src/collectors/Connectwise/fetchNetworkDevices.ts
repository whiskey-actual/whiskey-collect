// imports
import { LogEngine } from 'whiskey-log';
import { CleanedDate, CleanedString } from 'whiskey-util'
import { AxiosInstance } from 'axios'
import { ConnectwiseDevice } from './connectwiseDevice';
import { callAPI } from './callAPI'

export async function fetchNetworkDevices(le:LogEngine, axiosInstance:AxiosInstance):Promise<ConnectwiseDevice[]> {
    le.logStack.push("fetchNetworkDevices")

    let output:ConnectwiseDevice[] = []

    try {
        le.AddLogEntry(LogEngine.EntryType.Info, `.. querying network devices ..`)
        const networkDevices = await callAPI(le, axiosInstance, '/NetworkDevices?pagesize=10000&orderby=Name asc')
        le.AddLogEntry(LogEngine.EntryType.Info, `.. ${networkDevices.length} devices received.`)
        for(let i=0; i<networkDevices.length; i++) {
            try {
            const cwd:ConnectwiseDevice = {
                // mandatory
                observedByConnectwise: true,
                deviceName: networkDevices[i].Name.toString().trim(),
                connectwiseID: networkDevices[i].Id.toString().trim(),
                // strings
                connectwiseOperatingSystem: undefined,
                connectwiseOperatingSystemVersion: undefined,
                connectwiseAgentVersion: undefined,
                connectwiseAntivirusDefinitionDate: undefined,
                connectwiseDomainName: undefined,
                connectwiseFreeMemory: undefined,
                connectwiseLastUserName: undefined,
                connectwiseSerialNumber: undefined,
                connectwiseTotalMemory:undefined,
                connectwiseWindowsUpdateDate: undefined,
                connectwiseLocation: networkDevices[i].Location ? CleanedString(networkDevices[i].Location.Name) : undefined,
                connectwiseIpAddress:CleanedString(networkDevices[i].LocalIPAddress),
                connectwiseDeviceType:networkDevices[i].DeviceType ? CleanedString(networkDevices[i].DeviceType.Name) : undefined,
                connectwiseMacAddress:CleanedString(networkDevices[i].MACAddress),
                connectwiseStatus:CleanedString(networkDevices[i].Status),
                connectwiseComment:CleanedString(networkDevices[i].AlertMessage),
                connectwiseManufacturer:CleanedString(networkDevices[i].ManufacturerName),
                connectwiseModel:CleanedString(networkDevices[i].ModelName),
                connectwiseDescription:CleanedString(networkDevices[i].Description),
                connectwiseClient:networkDevices[i].Client ? CleanedString(networkDevices[i].Client.Name) : undefined,
                // dates
                connectwiseFirstSeen:CleanedDate(networkDevices[i].DateAdded),
                connectwiseAssetDate:CleanedDate(networkDevices[i].AssetDate),
                connectwiseLastObserved:CleanedDate(networkDevices[i].LastContact)
            }
            output.push(cwd)

            }  catch(err) {
            le.AddLogEntry(LogEngine.EntryType.Error, `error: ${err}`)
            console.debug(networkDevices[i])
            throw(err)
            }
        
        }
        le.AddLogEntry(LogEngine.EntryType.Info, `.. network objects created.`)


        } catch (ex) {
            le.AddLogEntry(LogEngine.EntryType.Error, `${ex}`)
            throw ex;
        } finally {
            le.AddLogEntry(LogEngine.EntryType.Info, 'done.')
            le.logStack.pop()
        }

    return new Promise<ConnectwiseDevice[]>((resolve) => {resolve(output)})

}