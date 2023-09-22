// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'

import https from 'https'
import axios from 'axios'
import { ConnectwiseDevice } from '../Device';

export class Connectwise
{

  constructor(le:LogEngine) {
    this._le=le
  }
  private _le:LogEngine = new LogEngine([])

  public async fetch(baseURL:string, clientId:string, userName:string, password:string):Promise<ConnectwiseDevice[]> {
    this._le.AddLogEntry(LogEngine.Severity.Ok, 'initializing ..')
    let output:ConnectwiseDevice[]=[]

    try {

      // get the access token ..
      this._le.AddLogEntry(LogEngine.Severity.Ok, '.. getting access token ..')
      const httpsAgent = new https.Agent({ rejectUnauthorized: false})
      axios.defaults.httpsAgent=httpsAgent;
      const instance = axios.create({baseURL: baseURL, headers: {clientId: clientId}});
      const response = await instance.post('/apitoken', { UserName: userName, Password: password});
      const accessToken = response.data.AccessToken;
      instance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`
      this._le.AddLogEntry(LogEngine.Severity.Ok, `.. received accessToken ..`)

      // get computers ..
      this._le.AddLogEntry(LogEngine.Severity.Ok, `.. querying computers ..`)
      const queryComputers = await instance.get('/Computers?pagesize=10000&orderby=ComputerName asc')
      const computers = queryComputers.data
      this._le.AddLogEntry(LogEngine.Severity.Ok, `.. ${computers.length} devices received; processing ..`)
      for(let i=0; i<computers.length; i++) {
        try {
          // let q = new sql.Request()
          // .input('deviceName: Utilities.CleanedString(computers[i].ComputerName))
          // .input('connectwiseId: Utilities.CleanedString(computers[i].Id))
          // .input('connectwiseDeviceType: 'computer')
          // .input('connectwiseLocation: Utilities.CleanedString(computers[i].Location.Name))
          // .input('connectwiseClient: Utilities.CleanedString(computers[i].Client.Name))
          // .input('connectwiseOperatingSystem: Utilities.CleanedString(computers[i].OperatingSystemName))
          // .input('connectwiseOperatingSystemVersion: Utilities.CleanedString(computers[i].OperatingSystemVersion))
          // .input('connectwiseDomainName: Utilities.CleanedString(computers[i].DomainName))
          // .input('connectwiseAgentVersion: Utilities.CleanedString(computers[i].RemoteAgentVersion))
          // .input('connectwiseComment: Utilities.CleanedString(computers[i].Comment))
          // .input('connectwiseIpAddress: Utilities.CleanedString(computers[i].LocalIPAddress))
          // .input('connectwiseMacAddress: Utilities.CleanedString(computers[i].MACAddress))
          // .input('connectwiseLastUserName: Utilities.CleanedString(computers[i].LastUserName))
          // .input('connectwiseType: Utilities.CleanedString(computers[i].Type))
          // .input('connectwiseStatus: Utilities.CleanedString(computers[i].Status))
          // .input('connectwiseSerialNumber: Utilities.CleanedString(computers[i].SerialNumber))
          // .input('connectwiseBiosManufacturer: Utilities.CleanedString(computers[i].BiosManufacturer))
          // .input('connectwiseModel: Utilities.CleanedString(computers[i].Model))
          // .input('connectwiseDescription: Utilities.CleanedString(computers[i].Description))
          // // bigint
          // .input('connectwiseTotalMemory', sql.BigInt, computers[i].TotalMemory)
          // .input('connectwiseFreeMemory', sql.BigInt, computers[i].FreeMemory)
          // // datetimes
          // .input('connectwiseLastObserved', sql.DateTime2, Utilities.CleanedDate(computers[i].RemoteAgentLastContact))
          // .input('connectwiseWindowsUpdateDate', sql.DateTime2, Utilities.CleanedDate(computers[i].WindowsUpdateDate))
          // .input('connectwiseAntivirusDefinitionDate', sql.DateTime2, Utilities.CleanedDate(computers[i].AntivirusDefinitionDate))
          // .input('connectwiseFirstSeen', sql.DateTime2, Utilities.CleanedDate(computers[i].DateAdded))
          // output.sqlRequests.push(q)

          const d:ConnectwiseDevice = {
            // mandatory
            observedByConnectwise: true,
            deviceName: computers[i].ComputerName.toString().trim(),
            connectwiseId: computers[i].Id.toString().trim(),
            // strings
            connectwiseType: Utilities.CleanedString(computers[i].Type),
            connectwiseLocation: Utilities.CleanedString(computers[i].Location.Name),
            connectwiseClient: Utilities.CleanedString(computers[i].Client.Name),
            connectwiseOperatingSystem: Utilities.CleanedString(computers[i].OperatingSystemName),
            connectwiseOperatingSystemVersion: Utilities.CleanedString(computers[i].OperatingSystemVersion),
            connectwiseDomainName: Utilities.CleanedString(computers[i].DomainName),
            connectwiseAgentVersion: Utilities.CleanedString(computers[i].RemoteAgentVersion),
            connectwiseComment: Utilities.CleanedString(computers[i].Comment),
            connectwiseIpAddress: Utilities.CleanedString(computers[i].LocalIPAddress),
            connectwiseMacAddress: Utilities.CleanedString(computers[i].MACAddress),
            connectwiseLastUserName: Utilities.CleanedString(computers[i].LastUserName),
            connectwiseStatus: Utilities.CleanedString(computers[i].Status),
            connectwiseSerialNumber: Utilities.CleanedString(computers[i].SerialNumber),
            connectwiseBiosManufacturer: Utilities.CleanedString(computers[i].BiosManufacturer),
            connectwiseModel: Utilities.CleanedString(computers[i].Model),
            connectwiseDescription: Utilities.CleanedString(computers[i].Description),
            // bigint
            connectwiseTotalMemory: computers[i].TotalMemory,
            connectwiseFreeMemory: computers[i].FreeMemory,
            // datetimes
            connectwiseLastObserved: Utilities.CleanedDate(computers[i].RemoteAgentLastContact),
            connectwiseWindowsUpdateDate: Utilities.CleanedDate(computers[i].WindowsUpdateDate),
            connectwiseAntivirusDefinitionDate: Utilities.CleanedDate(computers[i].AntivirusDefinitionDate),
            connectwiseFirstSeen: Utilities.CleanedDate(computers[i].DateAdded)
          }
          output.push(d)
        }  catch(err) {
          this._le.AddLogEntry(LogEngine.Severity.Error, `error: ${err}`)
        }
      }

      this._le.AddLogEntry(LogEngine.Severity.Ok, `.. done; querying network devices ..`)
      const queryNetworkDevices = await instance.get('/NetworkDevices?pagesize=10000&orderby=Name asc')
      const networkDevices = queryNetworkDevices.data
      this._le.AddLogEntry(LogEngine.Severity.Ok, `.. ${networkDevices.length} devices received.`)
      for(let i=0; i<computers.length; i++) {
        try {
          // let q = new sql.Request()
          // .input('deviceName: Utilities.CleanedString(computers[i].ComputerName))
          // .input('connectwiseId: Utilities.CleanedString(computers[i].Id))
          // .input('connectwiseDeviceType: 'network')
          // .input('connectwiseLocation: Utilities.CleanedString(computers[i].Location.Name))
          // .input('connectwiseClient: Utilities.CleanedString(computers[i].Client.Name))
          // .input('connectwiseOperatingSystem: Utilities.CleanedString(computers[i].OperatingSystemName))
          // .input('connectwiseOperatingSystemVersion: Utilities.CleanedString(computers[i].OperatingSystemVersion))
          // .input('connectwiseDomainName: Utilities.CleanedString(computers[i].DomainName))
          // .input('connectwiseAgentVersion: Utilities.CleanedString(computers[i].RemoteAgentVersion))
          // .input('connectwiseComment: Utilities.CleanedString(computers[i].Comment))
          // .input('connectwiseIpAddress: Utilities.CleanedString(computers[i].LocalIPAddress))
          // .input('connectwiseMacAddress: Utilities.CleanedString(computers[i].MACAddress))
          // .input('connectwiseLastUserName: Utilities.CleanedString(computers[i].LastUserName))
          // .input('connectwiseType: Utilities.CleanedString(computers[i].Type))
          // .input('connectwiseStatus: Utilities.CleanedString(computers[i].Status))
          // .input('connectwiseSerialNumber: Utilities.CleanedString(computers[i].SerialNumber))
          // .input('connectwiseBiosManufacturer: Utilities.CleanedString(computers[i].BiosManufacturer))
          // .input('connectwiseModel: Utilities.CleanedString(computers[i].Model))
          // .input('connectwiseDescription: Utilities.CleanedString(computers[i].Description))
          // // bigint
          // .input('connectwiseTotalMemory', sql.BigInt, computers[i].TotalMemory)
          // .input('connectwiseFreeMemory', sql.BigInt, computers[i].FreeMemory)
          // // datetimes
          // .input('connectwiseFirstSeen', sql.DateTime2, Utilities.CleanedDate(computers[i].DateAdded))
          // .input('connectwiseLastObserved', sql.DateTime2, Utilities.CleanedDate(computers[i].RemoteAgentLastContact))
          // .input('connectwiseWindowsUpdateDate', sql.DateTime2, Utilities.CleanedDate(computers[i].WindowsUpdateDate))
          // .input('connectwiseAntivirusDefinitionDate', sql.DateTime2, Utilities.CleanedDate(computers[i].AntivirusDefinitionDate))
          // output.sqlRequests.push(q)

          const d:ConnectwiseDevice = {
            // mandatory
            observedByConnectwise: true,
            deviceName: computers[i].ComputerName.toString().trim(),
            connectwiseId: computers[i].Id.toString().trim(),
            // strings
            connectwiseType: Utilities.CleanedString(computers[i].Type),
            connectwiseLocation: Utilities.CleanedString(computers[i].Location.Name),
            connectwiseClient: Utilities.CleanedString(computers[i].Client.Name),
            connectwiseOperatingSystem: Utilities.CleanedString(computers[i].OperatingSystemName),
            connectwiseOperatingSystemVersion: Utilities.CleanedString(computers[i].OperatingSystemVersion),
            connectwiseDomainName: Utilities.CleanedString(computers[i].DomainName),
            connectwiseAgentVersion: Utilities.CleanedString(computers[i].RemoteAgentVersion),
            connectwiseComment: Utilities.CleanedString(computers[i].Comment),
            connectwiseIpAddress: Utilities.CleanedString(computers[i].LocalIPAddress),
            connectwiseMacAddress: Utilities.CleanedString(computers[i].MACAddress),
            connectwiseLastUserName: Utilities.CleanedString(computers[i].LastUserName),
            connectwiseStatus: Utilities.CleanedString(computers[i].Status),
            connectwiseSerialNumber: Utilities.CleanedString(computers[i].SerialNumber),
            connectwiseBiosManufacturer: Utilities.CleanedString(computers[i].BiosManufacturer),
            connectwiseModel: Utilities.CleanedString(computers[i].Model),
            connectwiseDescription: Utilities.CleanedString(computers[i].Description),
            // bigint
            connectwiseTotalMemory: computers[i].TotalMemory,
            connectwiseFreeMemory: computers[i].FreeMemory,
            // datetimes
            connectwiseLastObserved: Utilities.CleanedDate(computers[i].RemoteAgentLastContact),
            connectwiseWindowsUpdateDate: Utilities.CleanedDate(computers[i].WindowsUpdateDate),
            connectwiseAntivirusDefinitionDate: Utilities.CleanedDate(computers[i].AntivirusDefinitionDate),
            connectwiseFirstSeen: Utilities.CleanedDate(computers[i].DateAdded)
          }
          output.push(d)

        }  catch(err) {
          this._le.AddLogEntry(LogEngine.Severity.Error, `error: ${err}`)
        }
      }

    } catch(err) {
      this._le.AddLogEntry(LogEngine.Severity.Error, `error: ${err}`)
      throw(err)
    }

    return new Promise<ConnectwiseDevice[]>((resolve) => {resolve(output)})
  
  }
}
