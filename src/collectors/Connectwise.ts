// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'

import https from 'https'
import axios from 'axios'
import { SqlRequestCollection } from "../database/SqlRequestCollection";
import sql from 'mssql'

export class Connectwise
{

  constructor(le:LogEngine) {
    this._le=le
  }
  private _le:LogEngine = new LogEngine([])

  public async fetch(baseURL:string, clientId:string, userName:string, password:string):Promise<SqlRequestCollection> {
   this._le.logStack.push('fetch')
    let output = new SqlRequestCollection("sp_add_Connectwise_device")
    this._le.AddLogEntry(LogEngine.Severity.Ok, 'initializing ..')

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
          let q = new sql.Request()
          .input('deviceName', sql.VarChar(255), Utilities.CleanedString(computers[i].ComputerName))
          .input('connectwiseId', sql.VarChar(255), Utilities.CleanedString(computers[i].Id))
          .input('connectwiseDeviceType', sql.VarChar(255), 'computer')
          .input('connectwiseLocation', sql.VarChar(255), Utilities.CleanedString(computers[i].Location.Name))
          .input('connectwiseClient', sql.VarChar(255), Utilities.CleanedString(computers[i].Client.Name))
          .input('connectwiseOperatingSystem', sql.VarChar(255), Utilities.CleanedString(computers[i].OperatingSystemName))
          .input('connectwiseOperatingSystemVersion', sql.VarChar(255), Utilities.CleanedString(computers[i].OperatingSystemVersion))
          .input('connectwiseDomainName', sql.VarChar(255), Utilities.CleanedString(computers[i].DomainName))
          .input('connectwiseAgentVersion', sql.VarChar(255), Utilities.CleanedString(computers[i].RemoteAgentVersion))
          .input('connectwiseComment', sql.VarChar(255), Utilities.CleanedString(computers[i].Comment))
          .input('connectwiseIpAddress', sql.VarChar(255), Utilities.CleanedString(computers[i].LocalIPAddress))
          .input('connectwiseMacAddress', sql.VarChar(255), Utilities.CleanedString(computers[i].MACAddress))
          .input('connectwiseLastUserName', sql.VarChar(255), Utilities.CleanedString(computers[i].LastUserName))
          .input('connectwiseType', sql.VarChar(255), Utilities.CleanedString(computers[i].Type))
          .input('connectwiseStatus', sql.VarChar(255), Utilities.CleanedString(computers[i].Status))
          .input('connectwiseSerialNumber', sql.VarChar(255), Utilities.CleanedString(computers[i].SerialNumber))
          .input('connectwiseBiosManufacturer', sql.VarChar(255), Utilities.CleanedString(computers[i].BiosManufacturer))
          .input('connectwiseModel', sql.VarChar(255), Utilities.CleanedString(computers[i].Model))
          .input('connectwiseDescription', sql.VarChar(255), Utilities.CleanedString(computers[i].Description))
          // bigint
          .input('connectwiseTotalMemory', sql.BigInt, computers[i].TotalMemory)
          .input('connectwiseFreeMemory', sql.BigInt, computers[i].FreeMemory)
          // datetimes
          .input('connectwiseLastObserved', sql.DateTime2, Utilities.CleanedDate(computers[i].RemoteAgentLastContact))
          .input('connectwiseWindowsUpdateDate', sql.DateTime2, Utilities.CleanedDate(computers[i].WindowsUpdateDate))
          .input('connectwiseAntivirusDefinitionDate', sql.DateTime2, Utilities.CleanedDate(computers[i].AntivirusDefinitionDate))
          .input('connectwiseFirstSeen', sql.DateTime2, Utilities.CleanedDate(computers[i].DateAdded))
          output.sqlRequests.push(q)
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
          let q = new sql.Request()
          .input('deviceName', sql.VarChar(255), Utilities.CleanedString(computers[i].ComputerName))
          .input('connectwiseId', sql.VarChar(255), Utilities.CleanedString(computers[i].Id))
          .input('connectwiseDeviceType', sql.VarChar(255), 'network')
          .input('connectwiseLocation', sql.VarChar(255), Utilities.CleanedString(computers[i].Location.Name))
          .input('connectwiseClient', sql.VarChar(255), Utilities.CleanedString(computers[i].Client.Name))
          .input('connectwiseOperatingSystem', sql.VarChar(255), Utilities.CleanedString(computers[i].OperatingSystemName))
          .input('connectwiseOperatingSystemVersion', sql.VarChar(255), Utilities.CleanedString(computers[i].OperatingSystemVersion))
          .input('connectwiseDomainName', sql.VarChar(255), Utilities.CleanedString(computers[i].DomainName))
          .input('connectwiseAgentVersion', sql.VarChar(255), Utilities.CleanedString(computers[i].RemoteAgentVersion))
          .input('connectwiseComment', sql.VarChar(255), Utilities.CleanedString(computers[i].Comment))
          .input('connectwiseIpAddress', sql.VarChar(255), Utilities.CleanedString(computers[i].LocalIPAddress))
          .input('connectwiseMacAddress', sql.VarChar(255), Utilities.CleanedString(computers[i].MACAddress))
          .input('connectwiseLastUserName', sql.VarChar(255), Utilities.CleanedString(computers[i].LastUserName))
          .input('connectwiseType', sql.VarChar(255), Utilities.CleanedString(computers[i].Type))
          .input('connectwiseStatus', sql.VarChar(255), Utilities.CleanedString(computers[i].Status))
          .input('connectwiseSerialNumber', sql.VarChar(255), Utilities.CleanedString(computers[i].SerialNumber))
          .input('connectwiseBiosManufacturer', sql.VarChar(255), Utilities.CleanedString(computers[i].BiosManufacturer))
          .input('connectwiseModel', sql.VarChar(255), Utilities.CleanedString(computers[i].Model))
          .input('connectwiseDescription', sql.VarChar(255), Utilities.CleanedString(computers[i].Description))
          // bigint
          .input('connectwiseTotalMemory', sql.BigInt, computers[i].TotalMemory)
          .input('connectwiseFreeMemory', sql.BigInt, computers[i].FreeMemory)
          // datetimes
          .input('connectwiseFirstSeen', sql.DateTime2, Utilities.CleanedDate(computers[i].DateAdded))
          .input('connectwiseLastObserved', sql.DateTime2, Utilities.CleanedDate(computers[i].RemoteAgentLastContact))
          .input('connectwiseWindowsUpdateDate', sql.DateTime2, Utilities.CleanedDate(computers[i].WindowsUpdateDate))
          .input('connectwiseAntivirusDefinitionDate', sql.DateTime2, Utilities.CleanedDate(computers[i].AntivirusDefinitionDate))
          output.sqlRequests.push(q)
        }  catch(err) {
          this._le.AddLogEntry(LogEngine.Severity.Error, `error: ${err}`)
        }
      }

    } catch(err) {
      this._le.AddLogEntry(LogEngine.Severity.Error, `error: ${err}`)
      throw(err)
    } finally {
     this._le.logStack.pop()
    }

    return new Promise<SqlRequestCollection>((resolve) => {resolve(output)})
  
  }
}
