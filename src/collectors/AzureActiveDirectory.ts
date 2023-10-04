// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'

import axios from "axios";
import * as msal from '@azure/msal-node'
import mssql from 'mssql'
import { DBEngine, ColumnValuePair, TableUpdate, RowUpdate, ColumnUpdate } from '../components/DBEngine';

export class AzureActiveDirectoryObject {
  // mandatory
  public readonly observedByAzureActiveDirectory:boolean=true;
  public readonly deviceName:string=''
  public readonly azureId:string=''
  
  // strings
  public readonly azureDeviceId:string|undefined=undefined
  public readonly azureDeviceCategory:string|undefined=undefined
  public readonly azureDeviceMetadata:string|undefined=undefined
  public readonly azureDeviceOwnership:string|undefined=undefined
  public readonly azureDeviceVersion:string|undefined=undefined
  public readonly azureDomainName:string|undefined=undefined
  public readonly azureEnrollmentProfileType:string|undefined=undefined
  public readonly azureEnrollmentType:string|undefined=undefined
  public readonly azureExternalSourceName:string|undefined=undefined
  public readonly azureManagementType:string|undefined=undefined
  public readonly azureManufacturer:string|undefined=undefined
  public readonly azureMDMAppId:string|undefined=undefined
  public readonly azureModel:string|undefined=undefined
  public readonly azureOperatingSystem:string|undefined=undefined
  public readonly azureOperatingSystemVersion:string|undefined=undefined
  public readonly azureProfileType:string|undefined=undefined
  public readonly azureSourceType:string|undefined=undefined
  public readonly azureTrustType:string|undefined=undefined
  // dates
  public readonly azureDeletedDateTime:Date|undefined=undefined;
  public readonly azureApproximateLastSignInDateTime:Date|undefined=undefined;
  public readonly azureComplianceExpirationDateTime:Date|undefined=undefined;
  public readonly azureCreatedDateTime:Date|undefined=undefined
  public readonly azureOnPremisesLastSyncDateTime:Date|undefined=undefined
  public readonly azureRegistrationDateTime:Date|undefined=undefined
  // booleans
  public readonly azureOnPremisesSyncEnabled:boolean=false;
  public readonly azureAccountEnabled:boolean=false;
  public readonly azureIsCompliant:boolean=false;
  public readonly azureIsManaged:boolean=false;
  public readonly azureIsRooted:boolean=false;
}

export class AzureActiveDirectory {

  constructor(le:LogEngine, db:DBEngine) {
    this._le=le
    this._db=db
  }
  private _le:LogEngine
  private _db:DBEngine
  public readonly AzureActiveDirectoryObjects:AzureActiveDirectoryObject[]=[]

  public async fetch(TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<void> {
    this._le.logStack.push('fetch')

    try {

      const authResponse = await this.getToken(AAD_ENDPOINT, GRAPH_ENDPOINT, TENANT_ID, CLIENT_ID, CLIENT_SECRET);
      const accessToken = authResponse.accessToken;
    
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `fetching devices ..`)

      const deviceList = await this.getData(accessToken, `${GRAPH_ENDPOINT}/v1.0/devices`)

      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. received ${deviceList.length} devices; creating objects ..`)

      for(let i=0; i<deviceList.length; i++) {

        try {
          const aado:AzureActiveDirectoryObject = {
            // mandatory
            observedByAzureActiveDirectory: true,
            deviceName: deviceList[i].displayName.toString().trim(),
            azureId: deviceList[i].id.toString().trim(),
            
            // strings
            azureDeviceId: Utilities.CleanedString(deviceList[i].deviceId),
            azureDeviceCategory: Utilities.CleanedString(deviceList[i].deviceCategory),
            azureDeviceMetadata: Utilities.CleanedString(deviceList[i].deviceMetadata),
            azureDeviceOwnership: Utilities.CleanedString(deviceList[i].deviceOwnership),
            azureDeviceVersion: Utilities.CleanedString(deviceList[i].deviceVersion),
            azureDomainName: Utilities.CleanedString(deviceList[i].domainName),
            azureEnrollmentProfileType: Utilities.CleanedString(deviceList[i].enrollmentProfileType),
            azureEnrollmentType: Utilities.CleanedString(deviceList[i].enrollmentType),
            azureExternalSourceName: Utilities.CleanedString(deviceList[i].externalSourceName),
            azureManagementType: Utilities.CleanedString(deviceList[i].managementType),
            azureManufacturer: Utilities.CleanedString(deviceList[i].manufacturer),
            azureMDMAppId: Utilities.CleanedString(deviceList[i].mdmAppId),
            azureModel: Utilities.CleanedString(deviceList[i].model),
            azureOperatingSystem: Utilities.CleanedString(deviceList[i].operaingSystem),
            azureOperatingSystemVersion: Utilities.CleanedString(deviceList[i].operatingSystemVersion),
            azureProfileType: Utilities.CleanedString(deviceList[i].profileType),
            azureSourceType: Utilities.CleanedString(deviceList[i].sourceType),
            azureTrustType: Utilities.CleanedString(deviceList[i].trustType),
            // dates
            azureDeletedDateTime: Utilities.CleanedDate(deviceList[i].deletedDateTime),
            azureApproximateLastSignInDateTime: Utilities.CleanedDate(deviceList[i].approximateLastSignInDateTime),
            azureComplianceExpirationDateTime: Utilities.CleanedDate(deviceList[i].complianceExpirationDateTime),
            azureCreatedDateTime: Utilities.CleanedDate(deviceList[i].createdDateTime),
            azureOnPremisesLastSyncDateTime: Utilities.CleanedDate(deviceList[i].onPremisesLastSyncDateTime),
            azureRegistrationDateTime: Utilities.CleanedDate(deviceList[i].registrationDateTime),
            // booleans
            azureOnPremisesSyncEnabled: deviceList[i].onPremisesSyncEnabled ? deviceList[i].onPremisesSyncEnabled : false,
            azureAccountEnabled: deviceList[i].accountEnabled ? deviceList[i].accountEnabled : false,
            azureIsCompliant: deviceList[i].isCompliant ? deviceList[i].isCompliant : false,
            azureIsManaged: deviceList[i].isManaged ? deviceList[i].isManaged : false,
            azureIsRooted: deviceList[i].isRooted ? deviceList[i].isRooted : false,
          }

          this.AzureActiveDirectoryObjects.push(aado)
        } catch (err) {
          this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
          throw(err)
        }
      }

      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, '.. objects created.')

    } catch(err) {
      this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err)
    } finally {
      this._le.logStack.pop()
    }
    
    return new Promise<void>((resolve) => {resolve()})
  }

  public async persist() {
    this._le.logStack.push('persist')
    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'building requests ..')

    try {

      for(let i=0; i<this.AzureActiveDirectoryObjects.length; i++) {

        console.debug(this.AzureActiveDirectoryObjects[i])

        let tuDevice:TableUpdate = new TableUpdate('Device', 'DeviceID')
        let tuAzureActiveDirectory:TableUpdate = new TableUpdate('DeviceAzureActiveDirectory', 'DeviceAzureActiveDirectoryID')
        
        const DeviceID:number = await this._db.getID("Device", [new ColumnValuePair("deviceName", this.AzureActiveDirectoryObjects[i].deviceName, mssql.VarChar(255))], true)
        const DeviceAzureActiveDirectoryID:number = await this._db.getID("DeviceAzureActiveDirectory", [new ColumnValuePair('AzureID', this.AzureActiveDirectoryObjects[i].azureId, mssql.VarChar(255))], true)

        // update the device table to add the corresponding DeviceAzureActiveDirectoryID ..
        let ruDevice = new RowUpdate(DeviceID)
        ruDevice.updateName=this.AzureActiveDirectoryObjects[i].deviceName
        ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryID", mssql.Int, DeviceAzureActiveDirectoryID))
        tuDevice.RowUpdates.push(ruDevice)

        // update the DeviceActiveDirectory table values ..
        let ruAzureActiveDirectory = new RowUpdate(DeviceAzureActiveDirectoryID)
        ruAzureActiveDirectory.updateName=this.AzureActiveDirectoryObjects[i].deviceName
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureDeviceCategory", mssql.VarChar(255), this.AzureActiveDirectoryObjects[i].azureDeviceCategory))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureDeviceMetadata", mssql.VarChar(255), this.AzureActiveDirectoryObjects[i].azureDeviceMetadata))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureDeviceOwnership", mssql.VarChar(255), this.AzureActiveDirectoryObjects[i].azureDeviceOwnership))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureDeviceVersion", mssql.VarChar(255), this.AzureActiveDirectoryObjects[i].azureDeviceVersion))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureDomainName", mssql.VarChar(255), this.AzureActiveDirectoryObjects[i].azureDomainName))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureEnrollmentProfileType", mssql.VarChar(255), this.AzureActiveDirectoryObjects[i].azureEnrollmentProfileType))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureEnrollmentType", mssql.VarChar(255), this.AzureActiveDirectoryObjects[i].azureEnrollmentType))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureExternalSourceName", mssql.VarChar(255), this.AzureActiveDirectoryObjects[i].azureExternalSourceName))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureManagementType", mssql.VarChar(255), this.AzureActiveDirectoryObjects[i].azureManagementType))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureManufacturer", mssql.VarChar(255), this.AzureActiveDirectoryObjects[i].azureManufacturer))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureMDMAppId", mssql.VarChar(255), this.AzureActiveDirectoryObjects[i].azureMDMAppId))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureModel", mssql.VarChar(255), this.AzureActiveDirectoryObjects[i].azureModel))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureOperatingSystem", mssql.VarChar(255), this.AzureActiveDirectoryObjects[i].azureOperatingSystem))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureOperatingSystemVersion", mssql.VarChar(255), this.AzureActiveDirectoryObjects[i].azureOperatingSystemVersion))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureProfileType", mssql.VarChar(255), this.AzureActiveDirectoryObjects[i].azureProfileType))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureSourceType", mssql.VarChar(255), this.AzureActiveDirectoryObjects[i].azureSourceType))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureTrustType", mssql.VarChar(255), this.AzureActiveDirectoryObjects[i].azureTrustType))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureDeletedDateTime", mssql.DateTime2, this.AzureActiveDirectoryObjects[i].azureDeletedDateTime))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureApproximateLastSignInDateTime", mssql.DateTime2, this.AzureActiveDirectoryObjects[i].azureApproximateLastSignInDateTime))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureComplianceExpirationDateTime", mssql.DateTime2, this.AzureActiveDirectoryObjects[i].azureComplianceExpirationDateTime))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureCreatedDateTime", mssql.DateTime2, this.AzureActiveDirectoryObjects[i].azureCreatedDateTime))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureOnPremisesLastSyncDateTime", mssql.DateTime2, this.AzureActiveDirectoryObjects[i].azureOnPremisesLastSyncDateTime))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureRegistrationDateTime", mssql.DateTime2, this.AzureActiveDirectoryObjects[i].azureRegistrationDateTime))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureOnPremisesSyncEnabled", mssql.Bit, this.AzureActiveDirectoryObjects[i].azureOnPremisesSyncEnabled))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureAccountEnabled", mssql.Bit, this.AzureActiveDirectoryObjects[i].azureAccountEnabled))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureIsCompliant", mssql.Bit, this.AzureActiveDirectoryObjects[i].azureIsCompliant))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureIsManaged", mssql.Bit, this.AzureActiveDirectoryObjects[i].azureIsManaged))
        ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureIsRooted", mssql.Bit, this.AzureActiveDirectoryObjects[i].azureIsRooted))
        tuAzureActiveDirectory.RowUpdates.push(ruAzureActiveDirectory)

        await this._db.updateTable(tuDevice, true)
        await this._db.updateTable(tuAzureActiveDirectory, true)

       }
      
    } catch(err) {
      this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err);
    } finally {
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'done')
      this._le.logStack.pop()
    }

  }


  private async getToken(AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, TENANT_ID:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<msal.AuthenticationResult> {
    this._le.logStack.push("getToken")
    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'getting access token.. ')

    let output:msal.AuthenticationResult

    try {

      const msalConfig:msal.Configuration = {
        auth: {
          clientId: CLIENT_ID,
          authority: `${AAD_ENDPOINT}/${TENANT_ID}`,
          clientSecret: CLIENT_SECRET
        }
      }
  
      const tokenRequest:msal.ClientCredentialRequest = { scopes: [`${GRAPH_ENDPOINT}/.default`]}
  
      const cca:msal.ConfidentialClientApplication = new msal.ConfidentialClientApplication(msalConfig);
  
  
      const result:msal.AuthenticationResult|null =  await cca.acquireTokenByClientCredential(tokenRequest)
  
      if(result!=null) {
        this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, '.. access token acquired.')
        output = result
      }
      else {
        throw('error getting token')
      }

    } catch(err) {
      this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err)
    } finally {
      this._le.logStack.pop()
    }

    return new Promise<msal.AuthenticationResult>((resolve) => {resolve(output)})

  }

  private async callAPI(accessToken:string, endpoint:string):Promise<any> {
    this._le.logStack.push('callAPI')
    let output:any = undefined
   
    try {
      const options = { headers: { Authorization: `Bearer ${accessToken}`}}
      const response = await axios.get(endpoint, options)
      output = response.data
    } catch (err) {
      this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err)
    } finally {
      this._le.logStack.pop();
    }

    return new Promise<any>((resolve) => {resolve(output)})

  }

  private async getData(accesstoken:string, uri:string):Promise<any> {
    this._le.logStack.push('getData')
    var output:any = []
   
    try {

       const response = await this.callAPI(accesstoken, uri);
       for(const value of response.value) {
        output.push(value)
       }

       var nextLink = response['@odata.nextLink']
       while(nextLink) {
        const nextPage = await this.callAPI(accesstoken, nextLink)
        nextLink = nextPage['@odata.nextLink']

        for(const value of nextPage.value) {
          output.push(value)
        }
       }
    } catch (err) {
      this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err)
    } finally {
      this._le.logStack.pop()
    }
   
    return new Promise<any>((resolve) => {resolve(output)})

  }
}