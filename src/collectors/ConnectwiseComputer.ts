// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'

import https from 'https'
import axios from 'axios'
import mssql from 'mssql'
import { DBEngine, TableUpdate, RowUpdate, ColumnUpdate } from '../components/DBEngine';

export class ConnectwiseComputerObject {
  // mandatory
  public readonly observedByConnectwise:boolean=true
  public readonly deviceName:string=''
  public readonly connectwiseID:string=''
  
  public readonly connectwiseType:string|undefined=undefined
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
  public readonly connectwiseBiosManufacturer:string|undefined=undefined
  public readonly connectwiseModel:string|undefined=undefined
  public readonly connectwiseDescription:string|undefined=undefined
  // bitint
  public readonly connectwiseTotalMemory:number|undefined=undefined
  public readonly connectwiseFreeMemory:number|undefined=undefined
  public readonly connectwiseLastObserved:Date|undefined=undefined
  public readonly connectwiseWindowsUpdateDate:Date|undefined=undefined
  public readonly connectwiseAntivirusDefinitionDate:Date|undefined=undefined
  public readonly connectwiseFirstSeen:Date|undefined=undefined
}

export class ConnectwiseComputer
{

  constructor(le:LogEngine, db:DBEngine) {
    this._le=le
    this._db=db
  }
  private _le:LogEngine
  private _db:DBEngine
  public readonly ConnectwiseComputerObjects:ConnectwiseComputerObject[]=[]

  public async fetch(baseURL:string, clientId:string, userName:string, password:string):Promise<void> {
    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, '-- INITIALIZE --')

    try {

      // get the access token ..
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, '.. getting access token ..')
      const httpsAgent = new https.Agent({ rejectUnauthorized: false})
      axios.defaults.httpsAgent=httpsAgent;
      const instance = axios.create({baseURL: baseURL, headers: {clientId: clientId}});
      const response = await instance.post('/apitoken', { UserName: userName, Password: password});
      const accessToken = response.data.AccessToken;
      instance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. received accessToken ..`)

      // get computers ..
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `.. querying computers ..`)
      const queryComputers = await instance.get('/Computers?pagesize=10000&orderby=ComputerName asc')
      const computers = queryComputers.data
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. ${computers.length} devices received; processing ..`)
      for(let i=0; i<computers.length; i++) {
        try {

          const o:ConnectwiseComputerObject = {
            // mandatory
            observedByConnectwise: true,
            deviceName: computers[i].ComputerName.toString().trim(),
            connectwiseID: computers[i].Id.toString().trim(),
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
          this.ConnectwiseComputerObjects.push(o)
        } catch (err) {
          this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
          console.debug(computers[i])
          throw(err)
        } 
      }
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. computer objects created.`)


    } catch (ex) {
      this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${ex}`)
      throw ex;
    } finally {
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, 'done.')
      this._le.logStack.pop()
    }
    
    return new Promise<void>((resolve) => {resolve()})

  }

  public async persist() {

    this._le.logStack.push('persist')
    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'building requests ..')

    try {
      
      let tuDevice:TableUpdate = new TableUpdate('Device', 'DeviceID')
      let tuConnectwiseComputer:TableUpdate = new TableUpdate('DeviceConnectwiseComputer', 'DeviceConnectwiseComputerID')
      
      for(let i=0; i<this.ConnectwiseComputerObjects.length; i++) {
        
        const DeviceID:number = await this._db.getID("Device", this.ConnectwiseComputerObjects[i].deviceName, "deviceName")
        const DeviceConnectwiseComputerID:number = await this._db.getID("DeviceConnectwiseComputer", this.ConnectwiseComputerObjects[i].connectwiseID, 'ConnectwiseID')

        // update the device table to add the corresponding DeviceConnectwiseID ..
        let ruDevice = new RowUpdate(DeviceID)
        ruDevice.updateName=this.ConnectwiseComputerObjects[i].deviceName
        ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceConnectwiseComputerID", mssql.Int, DeviceConnectwiseComputerID))
        tuDevice.RowUpdates.push(ruDevice)

        // update the DeviceConnectwise table values ..
        let ruConnectwiseComputer = new RowUpdate(DeviceConnectwiseComputerID)
        ruConnectwiseComputer.updateName=this.ConnectwiseComputerObjects[i].deviceName
        // strings
        ruConnectwiseComputer.ColumnUpdates.push(new ColumnUpdate("connectwiseType", mssql.VarChar(255), this.ConnectwiseComputerObjects[i].connectwiseType))
        ruConnectwiseComputer.ColumnUpdates.push(new ColumnUpdate("connectwiseLocation", mssql.VarChar(255), this.ConnectwiseComputerObjects[i].connectwiseLocation))
        ruConnectwiseComputer.ColumnUpdates.push(new ColumnUpdate("connectwiseClient", mssql.VarChar(255), this.ConnectwiseComputerObjects[i].connectwiseClient))
        ruConnectwiseComputer.ColumnUpdates.push(new ColumnUpdate("connectwiseOperatingSystem", mssql.VarChar(255), this.ConnectwiseComputerObjects[i].connectwiseOperatingSystem))
        ruConnectwiseComputer.ColumnUpdates.push(new ColumnUpdate("connectwiseOperatingSystemVersion", mssql.VarChar(255), this.ConnectwiseComputerObjects[i].connectwiseOperatingSystemVersion))
        ruConnectwiseComputer.ColumnUpdates.push(new ColumnUpdate("connectwiseDomainName", mssql.VarChar(255), this.ConnectwiseComputerObjects[i].connectwiseDomainName))
        ruConnectwiseComputer.ColumnUpdates.push(new ColumnUpdate("connectwiseAgentVersion", mssql.VarChar(255), this.ConnectwiseComputerObjects[i].connectwiseAgentVersion))
        ruConnectwiseComputer.ColumnUpdates.push(new ColumnUpdate("connectwiseComment", mssql.VarChar(255), this.ConnectwiseComputerObjects[i].connectwiseComment))
        ruConnectwiseComputer.ColumnUpdates.push(new ColumnUpdate("connectwiseIpAddress", mssql.VarChar(255), this.ConnectwiseComputerObjects[i].connectwiseIpAddress))
        ruConnectwiseComputer.ColumnUpdates.push(new ColumnUpdate("connectwiseMacAddress", mssql.VarChar(255), this.ConnectwiseComputerObjects[i].connectwiseMacAddress))
        ruConnectwiseComputer.ColumnUpdates.push(new ColumnUpdate("connectwiseLastUserName", mssql.VarChar(255), this.ConnectwiseComputerObjects[i].connectwiseLastUserName))
        ruConnectwiseComputer.ColumnUpdates.push(new ColumnUpdate("connectwiseStatus", mssql.VarChar(255), this.ConnectwiseComputerObjects[i].connectwiseStatus))
        ruConnectwiseComputer.ColumnUpdates.push(new ColumnUpdate("connectwiseSerialNumber", mssql.VarChar(255), this.ConnectwiseComputerObjects[i].connectwiseSerialNumber))
        ruConnectwiseComputer.ColumnUpdates.push(new ColumnUpdate("connectwiseBiosManufacturer", mssql.VarChar(255), this.ConnectwiseComputerObjects[i].connectwiseBiosManufacturer))
        ruConnectwiseComputer.ColumnUpdates.push(new ColumnUpdate("connectwiseModel", mssql.VarChar(255), this.ConnectwiseComputerObjects[i].connectwiseModel))
        ruConnectwiseComputer.ColumnUpdates.push(new ColumnUpdate("connectwiseDescription", mssql.VarChar(255), this.ConnectwiseComputerObjects[i].connectwiseDescription))
        // bigint
        ruConnectwiseComputer.ColumnUpdates.push(new ColumnUpdate("connectwiseTotalMemory", mssql.BigInt, this.ConnectwiseComputerObjects[i].connectwiseTotalMemory))
        ruConnectwiseComputer.ColumnUpdates.push(new ColumnUpdate("connectwiseFreeMemory", mssql.BigInt, this.ConnectwiseComputerObjects[i].connectwiseFreeMemory))
        // dates
        ruConnectwiseComputer.ColumnUpdates.push(new ColumnUpdate("connectwiseLastObserved", mssql.DateTime2, this.ConnectwiseComputerObjects[i].connectwiseLastObserved))
        ruConnectwiseComputer.ColumnUpdates.push(new ColumnUpdate("connectwiseWindowsUpdateDate", mssql.DateTime2, this.ConnectwiseComputerObjects[i].connectwiseWindowsUpdateDate))
        ruConnectwiseComputer.ColumnUpdates.push(new ColumnUpdate("connectwiseAntivirusDefinitionDate", mssql.DateTime2, this.ConnectwiseComputerObjects[i].connectwiseAntivirusDefinitionDate))
        ruConnectwiseComputer.ColumnUpdates.push(new ColumnUpdate("connectwiseFirstSeen", mssql.DateTime2, this.ConnectwiseComputerObjects[i].connectwiseFirstSeen))
        
        tuConnectwiseComputer.RowUpdates.push(ruConnectwiseComputer)

      }

      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'executing ..')
      await this._db.updateTable(tuDevice, true)
      await this._db.updateTable(tuConnectwiseComputer, true)
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, '.. done')

    } catch(err) {
      this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err);
    } finally {
      this._le.logStack.pop()
    }

  }

}