// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'

import axios from "axios";
import * as msal from '@azure/msal-node'
import mssql from 'mssql'
import { DBEngine, UpdatePackage } from '../components/DBEngine';

export class AzureActiveDirectoryObject {
  // mandatory
  public readonly observedByAzureActiveDirectory:boolean=true;
  public readonly deviceName:string=''
  public readonly azureDeviceId:string=''
  // strings
  public readonly azureDisplayName:string=''
  public readonly azureId:string=''
  public readonly azureDeviceCategory:string=''
  public readonly azureDeviceMetadata:string=''
  public readonly azureDeviceOwnership:string=''
  public readonly azureDeviceVersion:string=''
  public readonly azureDomainName:string=''
  public readonly azureEnrollmentProfileType:string=''
  public readonly azureEnrollmentType:string=''
  public readonly azureExternalSourceName:string=''
  public readonly azureManagementType:string=''
  public readonly azureManufacturer:string=''
  public readonly azureMDMAppId:string=''
  public readonly azureModel:string=''
  public readonly azureOperatingSystem:string=''
  public readonly azureOperatingSystemVersion:string=''
  public readonly azureProfileType:string=''
  public readonly azureSourceType:string=''
  public readonly azureTrustType:string=''
  // dates
  public readonly azureDeletedDateTime:Date=Utilities.minimumJsonDate;
  public readonly azureApproximateLastSignInDateTime:Date=Utilities.minimumJsonDate;
  public readonly azureComplianceExpirationDateTime:Date=Utilities.minimumJsonDate;
  public readonly azureCreatedDateTime:Date=Utilities.minimumJsonDate;
  public readonly azureOnPremisesLastSyncDateTime:Date=Utilities.minimumJsonDate;
  public readonly azureRegistrationDateTime:Date=Utilities.minimumJsonDate;
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
  public readonly sprocName ='sp_add_azureActiveDirectory_device' 
  public readonly AzureActiveDirectoryObjects:AzureActiveDirectoryObject[]=[]

  public async fetch(TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<AzureActiveDirectoryObject[]> {
    this._le.logStack.push('fetch')
    let output:AzureActiveDirectoryObject[] = []

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
            azureDeviceId: deviceList[i].deviceId.toString().trim(),
            // strings
            azureDisplayName: Utilities.CleanedString(deviceList[i].displayName),
            azureId: Utilities.CleanedString(deviceList[i].id),
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

          output.push(aado)
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
    
    return new Promise<AzureActiveDirectoryObject[]>((resolve) => {resolve(output)})
  }

  public async persist() {
    this._le.logStack.push('persist')
    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'building requests ..')

    try {

      let upDevice:UpdatePackage = { tableName:"Device", idColumn:"DeviceID", UpdatePackageItems:[]}
      
      let upAzureActiveDirectoryDevice:UpdatePackage = { tableName:'DeviceAzureActiveDirectory', idColumn:"DeviceAzureActiveDirectoryID", UpdatePackageItems:[]}
      
      for(let i=0; i<this.AzureActiveDirectoryObjects.length; i++) {

        const DeviceID:number = await this._db.getID("Device", this.AzureActiveDirectoryObjects[i].deviceName, "deviceName")
        const DeviceAzureActiveDirectoryID:number = await this._db.getID("DeviceAzureActiveDirectory", this.AzureActiveDirectoryObjects[i].azureDeviceId, 'AzureDeviceID')
        upDevice.UpdatePackageItems.push({idValue:DeviceID, updateColumn:"DeviceAzureActiveDirectoryID", updateValue:DeviceAzureActiveDirectoryID, columnType:mssql.Int})

        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureDisplayName", updateValue:this.AzureActiveDirectoryObjects[i].azureDisplayName, columnType:mssql.VarChar(255) })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureId", updateValue:this.AzureActiveDirectoryObjects[i].azureId, columnType:mssql.VarChar(255) })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureDeviceCategory", updateValue:this.AzureActiveDirectoryObjects[i].azureDeviceCategory, columnType:mssql.VarChar(255) })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureDeviceMetadata", updateValue:this.AzureActiveDirectoryObjects[i].azureDeviceMetadata, columnType:mssql.VarChar(255) })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureDeviceOwnership", updateValue:this.AzureActiveDirectoryObjects[i].azureDeviceOwnership, columnType:mssql.VarChar(255) })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureDeviceVersion", updateValue:this.AzureActiveDirectoryObjects[i].azureDeviceVersion, columnType:mssql.VarChar(255) })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureDomainName", updateValue:this.AzureActiveDirectoryObjects[i].deviceName, columnType:mssql.VarChar(255) })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureEnrollmentProfileType", updateValue:this.AzureActiveDirectoryObjects[i].azureEnrollmentProfileType, columnType:mssql.VarChar(255) })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureEnrollmentType", updateValue:this.AzureActiveDirectoryObjects[i].azureEnrollmentType, columnType:mssql.VarChar(255) })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureExternalSourceName", updateValue:this.AzureActiveDirectoryObjects[i].azureExternalSourceName, columnType:mssql.VarChar(255) })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureManagementType", updateValue:this.AzureActiveDirectoryObjects[i].azureManagementType, columnType:mssql.VarChar(255) })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureManufacturer", updateValue:this.AzureActiveDirectoryObjects[i].azureManufacturer, columnType:mssql.VarChar(255) })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureMDMAppId", updateValue:this.AzureActiveDirectoryObjects[i].azureMDMAppId, columnType:mssql.VarChar(255) })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureModel", updateValue:this.AzureActiveDirectoryObjects[i].azureModel, columnType:mssql.VarChar(255) })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureOperatingSystem", updateValue:this.AzureActiveDirectoryObjects[i].azureOperatingSystem, columnType:mssql.VarChar(255) })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureOperatingSystemVersion", updateValue:this.AzureActiveDirectoryObjects[i].azureOperatingSystemVersion, columnType:mssql.VarChar(255) })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureProfileType", updateValue:this.AzureActiveDirectoryObjects[i].azureProfileType, columnType:mssql.VarChar(255) })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureSourceType", updateValue:this.AzureActiveDirectoryObjects[i].azureSourceType, columnType:mssql.VarChar(255) })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureTrustType", updateValue:this.AzureActiveDirectoryObjects[i].azureTrustType, columnType:mssql.VarChar(255) })
        // dates
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureDeletedDateTime", updateValue:this.AzureActiveDirectoryObjects[i].azureDeletedDateTime, columnType:mssql.DateTime2 })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureApproximateLastSignInDateTime", updateValue:this.AzureActiveDirectoryObjects[i].azureApproximateLastSignInDateTime, columnType:mssql.DateTime2 })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureComplianceExpirationDateTime", updateValue:this.AzureActiveDirectoryObjects[i].azureComplianceExpirationDateTime, columnType:mssql.DateTime2 })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureCreatedDateTime", updateValue:this.AzureActiveDirectoryObjects[i].azureCreatedDateTime, columnType:mssql.DateTime2 })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureOnPremisesLastSyncDateTime", updateValue:this.AzureActiveDirectoryObjects[i].azureOnPremisesLastSyncDateTime, columnType:mssql.DateTime2 })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureRegistrationDateTime", updateValue:this.AzureActiveDirectoryObjects[i].azureRegistrationDateTime, columnType:mssql.DateTime2 })
        // boolean
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureOnPremisesSyncEnabled", updateValue:this.AzureActiveDirectoryObjects[i].azureOnPremisesSyncEnabled, columnType:mssql.Bit })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureAccountEnabled", updateValue:this.AzureActiveDirectoryObjects[i].azureAccountEnabled, columnType:mssql.Bit })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureIsCompliant", updateValue:this.AzureActiveDirectoryObjects[i].azureIsCompliant, columnType:mssql.Bit })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureIsManaged", updateValue:this.AzureActiveDirectoryObjects[i].azureIsManaged, columnType:mssql.Bit })
        upAzureActiveDirectoryDevice.UpdatePackageItems.push({idValue: DeviceAzureActiveDirectoryID, updateColumn: "azureIsRooted", updateValue:this.AzureActiveDirectoryObjects[i].azureIsRooted, columnType:mssql.Bit })

        //const OperatingSystemID:number = await this._db.getID('OperatingSystem', this.ActiveDirectoryObjects[i].activeDirectoryOperatingSystem)

      }
      await this._db.performUpdates(upDevice, true)
      await this._db.performUpdates(upAzureActiveDirectoryDevice, true)
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, '.. done')

    } catch(err) {
      this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err);
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