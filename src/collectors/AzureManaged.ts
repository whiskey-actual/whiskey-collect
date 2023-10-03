// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'

import axios from "axios";
import * as msal from '@azure/msal-node'
import mssql from 'mssql'
import { DBEngine, ColumnValuePair, TableUpdate, RowUpdate, ColumnUpdate } from '../components/DBEngine';

export class AzureManagedObject {
  public readonly observedByAzureMDM:boolean = true
  public readonly deviceName: string=''
  public readonly azureManagedId: string=''
  // strings
  public readonly azureManagedDeviceName:string|undefined=undefined
  public readonly azureManagedUserId:string|undefined=undefined
  public readonly azureManagedDeviceOwnerType:string|undefined=undefined
  public readonly azureManagedOperatingSystem:string|undefined=undefined
  public readonly azureManagedComplianceState:string|undefined=undefined
  public readonly azureManagedJailBroken:string|undefined=undefined
  public readonly azureManagedManagementAgent:string|undefined=undefined
  public readonly azureManagedOperatingSystemVersion:string|undefined=undefined
  public readonly azureManagedEASDeviceID:string|undefined=undefined
  public readonly azureManagedDeviceEnrollmentType:string|undefined=undefined
  public readonly azureManagedActivationLockBypassCode:string|undefined=undefined
  public readonly azureManagedEmailAddress:string|undefined=undefined
  public readonly azureManagedAzureADDeviceID:string|undefined=undefined
  public readonly azureManagedDeviceRegistrationState:string|undefined=undefined
  public readonly azureManagedDeviceCategoryDisplayName:string|undefined=undefined
  public readonly azureManagedExchangeAccessState:string|undefined=undefined
  public readonly azureManagedExchangeAccessStateReason:string|undefined=undefined
  public readonly azureManagedRemoteAssistanceSessionUrl:string|undefined=undefined
  public readonly azureManagedRemoteAssistanceErrorDetails:string|undefined=undefined
  public readonly azureManagedUserPrincipalName:string|undefined=undefined
  public readonly azureManagedModel:string|undefined=undefined
  public readonly azureManagedManufacturer:string|undefined=undefined
  public readonly azureManagedIMEI:string|undefined=undefined
  public readonly azureManagedSerialNumber:string|undefined=undefined
  public readonly azureManagedPhoneNumber:string|undefined=undefined
  public readonly azureManagedAndroidSecurityPatchLevel:string|undefined=undefined
  public readonly azureManagedUserDisplayName:string|undefined=undefined
  public readonly azureManagedConfigurationManagerClientEnabledFeatures:string|undefined=undefined
  public readonly azureManagedWiFiMACAddress:string|undefined=undefined
  public readonly azureManagedDeviceHealthAttestationState:string|undefined=undefined
  public readonly azureManagedSubscriberCarrier:string|undefined=undefined
  public readonly azureManagedMEID:string|undefined=undefined
  public readonly azureManagedPartnerReportedThreatState:string|undefined=undefined
  public readonly azureManagedRequireUserEnrollmentApproval:string|undefined=undefined
  public readonly azureManagedICCID:string|undefined=undefined
  public readonly azureManagedUDID:string|undefined=undefined
  public readonly azureManagedNotes:string|undefined=undefined
  public readonly azureManagedEthernetMacAddress:string|undefined=undefined
  // numbers
  public readonly azureManagedPhysicalMemoryInBytes:number|undefined=0
  public readonly azureManagedTotalStorageSpaceInBytes:number|undefined=undefined
  public readonly azureManagedFreeStorageSpaceInBytes:number|undefined=undefined
  // dates
  public readonly azureManagedEnrolledDateTime:Date|undefined=undefined;
  public readonly azureManagedLastSyncDateTime:Date|undefined=undefined;
  public readonly azureManagedEASActivationDateTime:Date|undefined=undefined;
  public readonly azureManagedExchangeLastSuccessfulSyncDateTime:Date|undefined=undefined;
  public readonly azureManagedComplianceGracePeriodExpirationDateTime:Date|undefined=undefined;
  public readonly azureManagedManagementCertificateExpirationDateTime:Date|undefined=undefined;
  // boolean
  public readonly azureManagedIsEASActivated:boolean=false
  public readonly azureManagedIsAzureADRegistered:boolean=false
  public readonly azureManagedIsSupervised:boolean=false
  public readonly azureManagedIsEncrypted:boolean=false
}

export class AzureManaged {

  constructor(le:LogEngine, db:DBEngine) {
    this._le=le
    this._db=db
  }
  private _le:LogEngine
  private _db:DBEngine
  public readonly AzureManagedObjects:AzureManagedObject[]=[]

  public async fetch(TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<void> {
    this._le.logStack.push('fetch')

    try {

      const authResponse = await this.getToken(TENANT_ID, AAD_ENDPOINT, GRAPH_ENDPOINT, CLIENT_ID, CLIENT_SECRET)
      const accessToken = authResponse.accessToken;

      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, 'fetching devices ..')
      
      const deviceList = await this.getData(accessToken, `${GRAPH_ENDPOINT}/v1.0/deviceManagement/managedDevices`)
      
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. received ${deviceList.length} devices; processing ..`)

      for(let i=0; i<deviceList.length; i++) {

        try {

          const amo:AzureManagedObject = {
            observedByAzureMDM: true,
            deviceName: deviceList[i].deviceName.toString().trim(),
            azureManagedId: deviceList[i].id.toString().trim(),
            // strings
            azureManagedDeviceName: Utilities.CleanedString(deviceList[i].azureManagedDeviceName),
            azureManagedUserId: Utilities.CleanedString(deviceList[i].userId),
            azureManagedDeviceOwnerType: Utilities.CleanedString(deviceList[i].managedDeviceOwnerType),
            azureManagedOperatingSystem: Utilities.CleanedString(deviceList[i].operatingSystem),
            azureManagedComplianceState: Utilities.CleanedString(deviceList[i].complianceState),
            azureManagedJailBroken: Utilities.CleanedString(deviceList[i].jailBroken),
            azureManagedManagementAgent: Utilities.CleanedString(deviceList[i].managementAgent),
            azureManagedOperatingSystemVersion: Utilities.CleanedString(deviceList[i].osVersion),
            azureManagedEASDeviceID: Utilities.CleanedString(deviceList[i].easDeviceId),
            azureManagedDeviceEnrollmentType: Utilities.CleanedString(deviceList[i].deviceEnrollmentType),
            azureManagedActivationLockBypassCode: Utilities.CleanedString(deviceList[i].activationLockBypassCode),
            azureManagedEmailAddress: Utilities.CleanedString(deviceList[i].emailAddress),
            azureManagedAzureADDeviceID: Utilities.CleanedString(deviceList[i].azureADDeviceID),
            azureManagedDeviceRegistrationState: Utilities.CleanedString(deviceList[i].deviceRegistrationState),
            azureManagedDeviceCategoryDisplayName: Utilities.CleanedString(deviceList[i].deviceCategoryDisplayName),
            azureManagedExchangeAccessState: Utilities.CleanedString(deviceList[i].exchangeAccessState),
            azureManagedExchangeAccessStateReason: Utilities.CleanedString(deviceList[i].accessStateReason),
            azureManagedRemoteAssistanceSessionUrl: Utilities.CleanedString(deviceList[i].remoteAssistanceSessionUrl),
            azureManagedRemoteAssistanceErrorDetails: Utilities.CleanedString(deviceList[i].remoteAssistanceErrorDetails),
            azureManagedUserPrincipalName: Utilities.CleanedString(deviceList[i].userPrincipalName),
            azureManagedModel: Utilities.CleanedString(deviceList[i].model),
            azureManagedManufacturer: Utilities.CleanedString(deviceList[i].manufacturer),
            azureManagedIMEI: Utilities.CleanedString(deviceList[i].imei),
            azureManagedSerialNumber: Utilities.CleanedString(deviceList[i].serialNumber),
            azureManagedPhoneNumber: Utilities.CleanedString(deviceList[i].phoneNumber),
            azureManagedAndroidSecurityPatchLevel: Utilities.CleanedString(deviceList[i].securityPatchLevel),
            azureManagedUserDisplayName: Utilities.CleanedString(deviceList[i].userDisplayName),
            azureManagedConfigurationManagerClientEnabledFeatures: Utilities.CleanedString(deviceList[i].configurationManagerClientEnabledFeatures),
            azureManagedWiFiMACAddress: Utilities.CleanedString(deviceList[i].wifiMacAddress),
            azureManagedDeviceHealthAttestationState: Utilities.CleanedString(deviceList[i].deviceHealthAttestationState),
            azureManagedSubscriberCarrier: Utilities.CleanedString(deviceList[i].subscriberCarrier),
            azureManagedMEID: Utilities.CleanedString(deviceList[i].meid),
            azureManagedPartnerReportedThreatState: Utilities.CleanedString(deviceList[i].partnerReportedThreatState),
            azureManagedRequireUserEnrollmentApproval: Utilities.CleanedString(deviceList[i].requireUserEnrollmentApproval),
            azureManagedICCID: Utilities.CleanedString(deviceList[i].iccid),
            azureManagedUDID: Utilities.CleanedString(deviceList[i].udid),
            azureManagedNotes: Utilities.CleanedString(deviceList[i].notes),
            azureManagedEthernetMacAddress: Utilities.CleanedString(deviceList[i].ethernetMacAddress),
            // numbers
            azureManagedPhysicalMemoryInBytes: Number(Utilities.CleanedString(deviceList[i].physicalMemoryInBytes)),
            azureManagedTotalStorageSpaceInBytes: Number(Utilities.CleanedString(deviceList[i].totalStorageSpaceInBytes)),
            azureManagedFreeStorageSpaceInBytes: Number(Utilities.CleanedString(deviceList[i].freeStorageSpaceInBytes)),
            // dates
            azureManagedEnrolledDateTime: Utilities.CleanedDate(deviceList[i].enrolledDateTime),
            azureManagedLastSyncDateTime: Utilities.CleanedDate(deviceList[i].lastSyncDateTime),
            azureManagedEASActivationDateTime: Utilities.CleanedDate(deviceList[i].easActivationDateTime),
            azureManagedExchangeLastSuccessfulSyncDateTime: Utilities.CleanedDate(deviceList[i].exchangeLastSuccessfulSyncDateTime),
            azureManagedComplianceGracePeriodExpirationDateTime: Utilities.CleanedDate(deviceList[i].complianceGracePeriodExpirationDateTime),
            azureManagedManagementCertificateExpirationDateTime: Utilities.CleanedDate(deviceList[i].managementCertificateExpirationDateTime),
            // boolean
            azureManagedIsEASActivated: deviceList[i].easActivated,
            azureManagedIsAzureADRegistered: deviceList[i].azureADRegistered,
            azureManagedIsSupervised: deviceList[i].isSupervised,
            azureManagedIsEncrypted: deviceList[i].isEncrypted
          }

          this.AzureManagedObjects.push(amo)
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

     
      
      for(let i=0; i<this.AzureManagedObjects.length; i++) {

        let tuDevice:TableUpdate = new TableUpdate('Device', 'DeviceID')
        let tuAzureManaged:TableUpdate = new TableUpdate('DeviceAzureManaged', 'DeviceAzureManagedID')
        
        const DeviceID:number = await this._db.getID("Device", [new ColumnValuePair("deviceName", this.AzureManagedObjects[i].deviceName)], true)
        const DeviceAzureManagedID:number = await this._db.getID("DeviceAzureManaged", [new ColumnValuePair('AzureManagedID', this.AzureManagedObjects[i].azureManagedId)], true)

        // update the device table to add the corresponding DeviceAzureActiveDirectoryID ..
        let ruDevice = new RowUpdate(DeviceID)
        ruDevice.updateName=this.AzureManagedObjects[i].deviceName
        ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureManagedID", mssql.Int, DeviceAzureManagedID))
        tuDevice.RowUpdates.push(ruDevice)
        await this._db.updateTable(tuDevice, true)
 
        // update the DeviceActiveDirectory table values ..
        let ruAzureManaged = new RowUpdate(DeviceAzureManagedID)
        ruAzureManaged.updateName=this.AzureManagedObjects[i].deviceName
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedDeviceName", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedDeviceName))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedUserId", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedUserId))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedDeviceOwnerType", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedDeviceOwnerType))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedOperatingSystem", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedOperatingSystem))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedComplianceState", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedComplianceState))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedJailBroken", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedJailBroken))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedManagementAgent", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedManagementAgent))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedOperatingSystemVersion", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedOperatingSystemVersion))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedEASDeviceID", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedEASDeviceID))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedDeviceEnrollmentType", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedDeviceEnrollmentType))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedActivationLockBypassCode", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedActivationLockBypassCode))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedEmailAddress", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedEmailAddress))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedAzureADDeviceID", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedAzureADDeviceID))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedDeviceRegistrationState", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedDeviceRegistrationState))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedDeviceCategoryDisplayName", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedDeviceCategoryDisplayName))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedExchangeAccessState", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedExchangeAccessState))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedExchangeAccessStateReason", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedExchangeAccessStateReason))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedRemoteAssistanceSessionUrl", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedRemoteAssistanceSessionUrl))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedRemoteAssistanceErrorDetails", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedRemoteAssistanceErrorDetails))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedUserPrincipalName", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedUserPrincipalName))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedModel", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedModel))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedManufacturer", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedManufacturer))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedIMEI", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedIMEI))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedSerialNumber", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedSerialNumber))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedPhoneNumber", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedPhoneNumber))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedAndroidSecurityPatchLevel", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedAndroidSecurityPatchLevel))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedUserDisplayName", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedUserDisplayName))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedConfigurationManagerClientEnabledFeatures", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedConfigurationManagerClientEnabledFeatures))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedWiFiMACAddress", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedWiFiMACAddress))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedDeviceHealthAttestationState", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedDeviceHealthAttestationState))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedSubscriberCarrier", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedSubscriberCarrier))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedMEID", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedMEID))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedPartnerReportedThreatState", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedPartnerReportedThreatState))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedRequireUserEnrollmentApproval", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedRequireUserEnrollmentApproval))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedICCID", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedICCID))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedUDID", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedUDID))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedNotes", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedNotes))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedEthernetMacAddress", mssql.VarChar(255), this.AzureManagedObjects[i].azureManagedEthernetMacAddress))
        // bigint
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedPhysicalMemoryInBytes", mssql.BigInt, this.AzureManagedObjects[i].azureManagedPhysicalMemoryInBytes))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedTotalStorageSpaceInBytes", mssql.BigInt, this.AzureManagedObjects[i].azureManagedTotalStorageSpaceInBytes))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedFreeStorageSpaceInBytes", mssql.BigInt, this.AzureManagedObjects[i].azureManagedFreeStorageSpaceInBytes))
        // datetime
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedEnrolledDateTime", mssql.DateTime2, this.AzureManagedObjects[i].azureManagedEnrolledDateTime))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedLastSyncDateTime", mssql.DateTime2, this.AzureManagedObjects[i].azureManagedLastSyncDateTime))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedEASActivationDateTime", mssql.DateTime2, this.AzureManagedObjects[i].azureManagedEASActivationDateTime))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedExchangeLastSuccessfulSyncDateTime", mssql.DateTime2, this.AzureManagedObjects[i].azureManagedExchangeLastSuccessfulSyncDateTime))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedComplianceGracePeriodExpirationDateTime", mssql.DateTime2, this.AzureManagedObjects[i].azureManagedComplianceGracePeriodExpirationDateTime))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedManagementCertificateExpirationDateTime", mssql.DateTime2, this.AzureManagedObjects[i].azureManagedManagementCertificateExpirationDateTime))
        // bit
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedIsEASActivated", mssql.Bit, this.AzureManagedObjects[i].azureManagedIsEASActivated))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedIsAzureADRegistered", mssql.Bit, this.AzureManagedObjects[i].azureManagedIsAzureADRegistered))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedIsSupervised", mssql.Bit, this.AzureManagedObjects[i].azureManagedIsSupervised))
        ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedIsEncrypted", mssql.Bit, this.AzureManagedObjects[i].azureManagedIsEncrypted))
        tuAzureManaged.RowUpdates.push(ruAzureManaged)

        await this._db.updateTable(tuAzureManaged, true)

      }
    
    } catch(err) {
      this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err);
    } finally {
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, '.. done')
      this._le.logStack.pop()
    }
  }


  private async getToken(TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<msal.AuthenticationResult> {
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