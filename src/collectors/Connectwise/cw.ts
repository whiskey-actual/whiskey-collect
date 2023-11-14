// imports
import { LogEngine } from 'whiskey-log';
import { CleanedDate, CleanedString } from 'whiskey-util'

import https from 'https'
import axios from 'axios'
import mssql from 'mssql'
import { DBEngine } from 'whiskey-sql';
import { RowUpdate } from 'whiskey-sql/lib/components/RowUpdate';
import { ColumnUpdate } from 'whiskey-sql/lib/components/ColumnUpdate';
import { ColumnValuePair } from "whiskey-sql/lib/components/columnValuePair"

export class ConnectwiseObject {
  // mandatory
  public readonly observedByConnectwise:boolean=true
  public readonly deviceName:string=''
  public readonly connectwiseID:string=''
  
  public readonly connectwiseDeviceType:string|undefined=undefined
  public readonly connectwiseLocation:string|undefined=undefined
  public readonly connectwiseClient:string|undefined=undefined
  public readonly connectwiseOperatingSystem:string|undefined=undefined
  public readonly connectwiseOperatingSystemVersion:string|undefined=undefined
  public readonly connectwiseDomainName:string|undefined=undefined
  public readonly connectwiseAgentVersion:string|undefined=undefined
  public readonly connectwiseComment:string|undefined=undefined
  public readonly connectwiseIpAddress:string|undefined=undefined
  public readonly connectwiseMacAddress:string|undefined=undefined
  public readonly connectwiseLastUserName:string|undefined=undefined
  public readonly connectwiseStatus:string|undefined=undefined
  public readonly connectwiseSerialNumber:string|undefined=undefined
  public readonly connectwiseManufacturer:string|undefined=undefined
  public readonly connectwiseModel:string|undefined=undefined
  public readonly connectwiseDescription:string|undefined=undefined
  // bitint
  public readonly connectwiseTotalMemory:number|undefined=undefined
  public readonly connectwiseFreeMemory:number|undefined=undefined
  // dates
  public readonly connectwiseFirstSeen:Date|undefined=undefined
  public readonly connectwiseLastObserved:Date|undefined=undefined
  public readonly connectwiseWindowsUpdateDate:Date|undefined=undefined
  public readonly connectwiseAntivirusDefinitionDate:Date|undefined=undefined
  public readonly connectwiseAssetDate:Date|undefined=undefined
}

export class Connectwise
{

  constructor(le:LogEngine, db:DBEngine) {
    this.le=le
    this.db=db
  }
  private le:LogEngine
  private db:DBEngine
  public readonly ConnectwiseObjects:ConnectwiseObject[]=[]

  public async fetch(baseURL:string, clientId:string, userName:string, password:string):Promise<void> {
    this.le.logStack.push("fetch")

    try {

      // get the access token ..
      this.le.AddLogEntry(LogEngine.EntryType.Info, '.. getting access token ..')
      const httpsAgent = new https.Agent({ rejectUnauthorized: false})
      axios.defaults.httpsAgent=httpsAgent;
      const instance = axios.create({baseURL: baseURL, headers: {clientId: clientId}});
      const response = await instance.post('/apitoken', { UserName: userName, Password: password});
      const accessToken = response.data.AccessToken;
      instance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`
      this.le.AddLogEntry(LogEngine.EntryType.Info, `.. received accessToken ..`)

      // get computers ..
      this.le.AddLogEntry(LogEngine.EntryType.Info, `.. querying computers ..`)
      const queryComputers = await instance.get('/Computers?pagesize=10000&orderby=ComputerName asc')
      const computers = queryComputers.data
      this.le.AddLogEntry(LogEngine.EntryType.Info, `.. ${computers.length} devices received; processing ..`)
      for(let i=0; i<computers.length; i++) {
        try {

          const o:ConnectwiseObject = {
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
          this.ConnectwiseObjects.push(o)
        } catch (err) {
          this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          console.debug(computers[i])
          throw(err)
        } 
      }
      this.le.AddLogEntry(LogEngine.EntryType.Info, `.. computer objects created.`)

      // get network devices
      this.le.AddLogEntry(LogEngine.EntryType.Info, `.. querying network devices ..`)
      const queryNetworkDevices = await instance.get('/NetworkDevices?pagesize=10000&orderby=Name asc')
      const networkDevices = queryNetworkDevices.data
      this.le.AddLogEntry(LogEngine.EntryType.Info, `.. ${networkDevices.length} devices received.`)
      for(let i=0; i<networkDevices.length; i++) {
          try {
            const o:ConnectwiseObject = {
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
            this.ConnectwiseObjects.push(o)

          }  catch(err) {
            this.le.AddLogEntry(LogEngine.EntryType.Error, `error: ${err}`)
            console.debug(networkDevices[i])
            throw(err)
          }
          
      }
      this.le.AddLogEntry(LogEngine.EntryType.Info, `.. network objects created.`)


    } catch (ex) {
      this.le.AddLogEntry(LogEngine.EntryType.Error, `${ex}`)
      throw ex;
    } finally {
      this.le.AddLogEntry(LogEngine.EntryType.Info, 'done.')
      this.le.logStack.pop()
    }
    
    return new Promise<void>((resolve) => {resolve()})

  }

  public async persist() {

    this.le.logStack.push('persist')
    this.le.AddLogEntry(LogEngine.EntryType.Info, 'building requests ..')

    try {
      
      for(let i=0; i<this.ConnectwiseObjects.length; i++) {

        const DeviceID:number = await this.db.getID("Device", [new ColumnValuePair("deviceName", this.ConnectwiseObjects[i].deviceName, mssql.VarChar(255))], true)

        // update the DeviceConnectwise table values ..
        let ruConnectwise = new RowUpdate(DeviceID)
        ruConnectwise.updateName=this.ConnectwiseObjects[i].deviceName
        // strings
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseDeviceType", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseDeviceType))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseLocation", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseLocation))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseClient", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseClient))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseDomainName", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseDomainName))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseAgentVersion", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseAgentVersion))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseComment", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseComment))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseIpAddress", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseIpAddress))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseMacAddress", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseMacAddress))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseLastUserName", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseLastUserName))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseStatus", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseStatus))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseSerialNumber", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseSerialNumber))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseManufacturer", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseManufacturer))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseModel", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseModel))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseDescription", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseDescription))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseOperatingSystem", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseOperatingSystem))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseOperatingSystemVersion", mssql.VarChar(255), this.ConnectwiseObjects[i].connectwiseOperatingSystemVersion))
        // bigint
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseTotalMemory", mssql.BigInt, this.ConnectwiseObjects[i].connectwiseTotalMemory))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseFreeMemory", mssql.BigInt, this.ConnectwiseObjects[i].connectwiseFreeMemory, false))
        // dates
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseLastObserved", mssql.DateTime2, this.ConnectwiseObjects[i].connectwiseLastObserved))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseWindowsUpdateDate", mssql.DateTime2, this.ConnectwiseObjects[i].connectwiseWindowsUpdateDate))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseAntivirusDefinitionDate", mssql.DateTime2, this.ConnectwiseObjects[i].connectwiseAntivirusDefinitionDate))
        ruConnectwise.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseFirstSeen", mssql.DateTime2, this.ConnectwiseObjects[i].connectwiseFirstSeen))

        await this.db.updateTable('Device', 'DeviceID', [ruConnectwise])

      }

    } catch(err) {
      this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
      throw(err);
    } finally {
      this.le.AddLogEntry(LogEngine.EntryType.Info, '.. done')
      this.le.logStack.pop()
    }

  }

}