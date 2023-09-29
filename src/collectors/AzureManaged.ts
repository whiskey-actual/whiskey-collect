// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'

import axios from "axios";
import * as msal from '@azure/msal-node'
import mssql from 'mssql'
  import { DBEngine } from '../components/DBEngine';

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

      // let upDevice:UpdatePackage = { objectName:'', tableName:"Device", idColumn:"DeviceID", UpdatePackageItems:[]}
      // let upAzureManagedDevice:UpdatePackage = { objectName:'', tableName:'DeviceAzureManaged', idColumn:"DeviceAzureManagedID", UpdatePackageItems:[]}
      
      // for(let i=0; i<this.AzureManagedObjects.length; i++) {

      //   const DeviceID:number = await this._db.getID("Device", this.AzureManagedObjects[i].deviceName, "deviceName")
      //   const DeviceAzureManagedID:number = await this._db.getID("DeviceAzureManaged", this.AzureManagedObjects[i].azureManagedId, 'AzureManagedID')
        
      //   upDevice.objectName = this.AzureManagedObjects[i].deviceName
      //   upDevice.UpdatePackageItems.push({idValue:DeviceID, updateColumn:"DeviceAzureManagedID", updateValue:DeviceAzureManagedID, columnType:mssql.Int})

      //   upAzureManagedDevice.objectName=this.AzureManagedObjects[i].deviceName

      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedDeviceName", updateValue:this.AzureManagedObjects[i].azureManagedDeviceName, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedUserId", updateValue:this.AzureManagedObjects[i].azureManagedUserId, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedDeviceOwnerType", updateValue:this.AzureManagedObjects[i].azureManagedDeviceOwnerType, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedOperatingSystem", updateValue:this.AzureManagedObjects[i].azureManagedOperatingSystem, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedComplianceState", updateValue:this.AzureManagedObjects[i].azureManagedComplianceState, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedJailBroken", updateValue:this.AzureManagedObjects[i].azureManagedJailBroken, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedManagementAgent", updateValue:this.AzureManagedObjects[i].azureManagedManagementAgent, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedOperatingSystemVersion", updateValue:this.AzureManagedObjects[i].azureManagedOperatingSystemVersion, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedEASDeviceID", updateValue:this.AzureManagedObjects[i].azureManagedEASDeviceID, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedDeviceEnrollmentType", updateValue:this.AzureManagedObjects[i].azureManagedDeviceEnrollmentType, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedActivationLockBypassCode", updateValue:this.AzureManagedObjects[i].azureManagedActivationLockBypassCode, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedEmailAddress", updateValue:this.AzureManagedObjects[i].azureManagedEmailAddress, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedAzureADDeviceID", updateValue:this.AzureManagedObjects[i].azureManagedAzureADDeviceID, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedDeviceRegistrationState", updateValue:this.AzureManagedObjects[i].azureManagedDeviceRegistrationState, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedDeviceCategoryDisplayName", updateValue:this.AzureManagedObjects[i].azureManagedDeviceCategoryDisplayName, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedExchangeAccessState", updateValue:this.AzureManagedObjects[i].azureManagedExchangeAccessState, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedExchangeAccessStateReason", updateValue:this.AzureManagedObjects[i].azureManagedExchangeAccessStateReason, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedRemoteAssistanceSessionUrl", updateValue:this.AzureManagedObjects[i].azureManagedRemoteAssistanceSessionUrl, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedRemoteAssistanceErrorDetails", updateValue:this.AzureManagedObjects[i].azureManagedRemoteAssistanceErrorDetails, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedUserPrincipalName", updateValue:this.AzureManagedObjects[i].azureManagedUserPrincipalName, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedModel", updateValue:this.AzureManagedObjects[i].azureManagedModel, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedManufacturer", updateValue:this.AzureManagedObjects[i].azureManagedManufacturer, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedIMEI", updateValue:this.AzureManagedObjects[i].azureManagedIMEI, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedSerialNumber", updateValue:this.AzureManagedObjects[i].azureManagedSerialNumber, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedPhoneNumber", updateValue:this.AzureManagedObjects[i].azureManagedPhoneNumber, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedAndroidSecurityPatchLevel", updateValue:this.AzureManagedObjects[i].azureManagedAndroidSecurityPatchLevel, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedUserDisplayName", updateValue:this.AzureManagedObjects[i].azureManagedUserDisplayName, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedConfigurationManagerClientEnabledFeatures", updateValue:this.AzureManagedObjects[i].azureManagedConfigurationManagerClientEnabledFeatures, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedWiFiMACAddress", updateValue:this.AzureManagedObjects[i].azureManagedWiFiMACAddress, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedDeviceHealthAttestationState", updateValue:this.AzureManagedObjects[i].azureManagedDeviceHealthAttestationState, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedSubscriberCarrier", updateValue:this.AzureManagedObjects[i].azureManagedSubscriberCarrier, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedMEID", updateValue:this.AzureManagedObjects[i].azureManagedMEID, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedPartnerReportedThreatState", updateValue:this.AzureManagedObjects[i].azureManagedPartnerReportedThreatState, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedRequireUserEnrollmentApproval", updateValue:this.AzureManagedObjects[i].azureManagedRequireUserEnrollmentApproval, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedICCID", updateValue:this.AzureManagedObjects[i].azureManagedICCID, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedUDID", updateValue:this.AzureManagedObjects[i].azureManagedUDID, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedNotes", updateValue:this.AzureManagedObjects[i].azureManagedNotes, columnType:mssql.VarChar(255) })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedEthernetMacAddress", updateValue:this.AzureManagedObjects[i].azureManagedEthernetMacAddress, columnType:mssql.VarChar(255) })
      //   // numbers
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedPhysicalMemoryInBytes", updateValue:this.AzureManagedObjects[i].azureManagedPhysicalMemoryInBytes, columnType:mssql.BigInt })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedTotalStorageSpaceInBytes", updateValue:this.AzureManagedObjects[i].azureManagedTotalStorageSpaceInBytes, columnType:mssql.BigInt })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedFreeStorageSpaceInBytes", updateValue:this.AzureManagedObjects[i].azureManagedFreeStorageSpaceInBytes, columnType:mssql.BigInt })
      //   // datetime
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedEnrolledDateTime", updateValue:this.AzureManagedObjects[i].azureManagedEnrolledDateTime, columnType:mssql.DateTime2 })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedLastSyncDateTime", updateValue:this.AzureManagedObjects[i].azureManagedLastSyncDateTime, columnType:mssql.DateTime2 })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedEASActivationDateTime", updateValue:this.AzureManagedObjects[i].azureManagedEASActivationDateTime, columnType:mssql.DateTime2 })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedExchangeLastSuccessfulSyncDateTime", updateValue:this.AzureManagedObjects[i].azureManagedExchangeLastSuccessfulSyncDateTime, columnType:mssql.DateTime2 })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedComplianceGracePeriodExpirationDateTime", updateValue:this.AzureManagedObjects[i].azureManagedComplianceGracePeriodExpirationDateTime, columnType:mssql.DateTime2 })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedManagementCertificateExpirationDateTime", updateValue:this.AzureManagedObjects[i].azureManagedManagementCertificateExpirationDateTime, columnType:mssql.DateTime2 })
      //   // boolean
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedIsEASActivated", updateValue:this.AzureManagedObjects[i].azureManagedIsEASActivated, columnType:mssql.Bit })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedIsAzureADRegistered", updateValue:this.AzureManagedObjects[i].azureManagedIsAzureADRegistered, columnType:mssql.Bit })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedIsSupervised", updateValue:this.AzureManagedObjects[i].azureManagedIsSupervised, columnType:mssql.Bit })
      //   upAzureManagedDevice.UpdatePackageItems.push({idValue: DeviceAzureManagedID, updateColumn: "azureManagedIsEncrypted", updateValue:this.AzureManagedObjects[i].azureManagedIsEncrypted, columnType:mssql.Bit })

      // }
      // this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'executing ..')
      // await this._db.performUpdates(upDevice, true)
      // await this._db.performUpdates(upAzureManagedDevice, true)
      // this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, '.. done')

    } catch(err) {
      this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err);
    } finally {
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