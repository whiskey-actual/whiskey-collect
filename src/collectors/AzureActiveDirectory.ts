// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'

import axios from "axios";
import { Client, PageCollection, PageIterator, PageIteratorCallback } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'

import { ClientSecretCredential } from '@azure/identity'
import mssql from 'mssql'
import { DBEngine, ColumnValuePair, TableUpdate, RowUpdate, ColumnUpdate } from '../components/DBEngine';

export class AzureActiveDirectoryDevice {
  // mandatory
  public readonly deviceName:string=''
  public readonly azureDeviceId:string=''
  
  // strings
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

export class AzureActiveDirectoryUser {

  public readonly mail:string=''
  public readonly userPrincipalName:string=''
  public readonly id:string=''

  public readonly businessPhone:string|undefined=undefined // this is an array, but just take the first entry (for now) for simplicity
  public readonly displayName:string|undefined=undefined
  public readonly givenName:string|undefined=undefined
  public readonly jobTitle:string|undefined=undefined
  public readonly mobilePhone:string|undefined=undefined
  public readonly officeLocation:string|undefined=undefined
  public readonly surname:string|undefined=undefined
  public readonly accountEnabled:string|undefined=undefined
  //public readonly assignedLicenses:string|undefined=undefined
  public readonly assignedPlans:string|undefined=undefined
  public readonly city:string|undefined=undefined
  public readonly country:string|undefined=undefined
  
  public readonly creationType:string|undefined=undefined
  
  public readonly department:string|undefined=undefined
  public readonly employeeHireDate:string|undefined=undefined
  //public readonly employeeLeaveDateTime:string|undefined=undefined
  public readonly employeeId:string|undefined=undefined
  public readonly employeeOrgData:string|undefined=undefined
  public readonly employeeType:string|undefined=undefined
  //public readonly externalUserState:string|undefined=undefined
  //public readonly hireDate:string|undefined=undefined
  
  //public readonly licenseAssignmentStates:string|undefined=undefined
  //public readonly mailNickname:string|undefined=undefined
  public readonly onPremisesDistinguishedName:string|undefined=undefined
  public readonly onPremisesDomainName:string|undefined=undefined
  public readonly onPremisesSamAccountName:string|undefined=undefined
  public readonly onPremisesUserPrincipalName:string|undefined=undefined
  public readonly passwordPolicies:string|undefined=undefined
  //public readonly preferredName:string|undefined=undefined
  //public readonly signInActivity:string|undefined=undefined
  public readonly postalCode:string|undefined=undefined
  public readonly state:string|undefined=undefined
  public readonly streetAddress:string|undefined=undefined
  public readonly userType:string|undefined=undefined

  // datetime
  public readonly createdDateTime:Date|undefined=undefined
  public readonly deletedDateTime:Date|undefined=undefined
  public readonly lastPasswordChangeDateTime:Date|undefined=undefined

}

export class AzureManagedDevice {
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

export class AzureActiveDirectory {

  constructor(le:LogEngine, db:DBEngine, TENANT_ID:string, CLIENT_ID:string, CLIENT_SECRET:string) {
    this.le=le
    this.db=db

    // set up the graph client
    const credential = new ClientSecretCredential(TENANT_ID, CLIENT_ID, CLIENT_SECRET);
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {scopes: ['https://graph.microsoft.com/.default']})
    this.graphClient = Client.initWithMiddleware({authProvider: authProvider})

  }
  private le:LogEngine
  private db:DBEngine
  private graphClient:Client
  public readonly AzureActiveDirectoryDevices:AzureActiveDirectoryDevice[]=[]
  public readonly AzureActiveDirectoryUsers:AzureActiveDirectoryUser[]=[]
  public readonly AzureManagedDevices:AzureManagedDevice[]=[]


  public async getDevices():Promise<void> {
    this.le.logStack.push("devices")

    try {

      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `fetching devices ..`)

      const devices = await this.getData('/devices')

      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. received ${devices.length} devices; creating objects ..`)

      for(let i=0; i<devices.length; i++) {

        try {
          const aado:AzureActiveDirectoryDevice = {
            // mandatory
            deviceName: devices[i].displayName.toString().trim(),
            azureDeviceId: devices[i].deviceId.toString().trim(),
            
            // strings
            azureDeviceCategory: Utilities.CleanedString(devices[i].deviceCategory),
            azureDeviceMetadata: Utilities.CleanedString(devices[i].deviceMetadata),
            azureDeviceOwnership: Utilities.CleanedString(devices[i].deviceOwnership),
            azureDeviceVersion: Utilities.CleanedString(devices[i].deviceVersion),
            azureDomainName: Utilities.CleanedString(devices[i].domainName),
            azureEnrollmentProfileType: Utilities.CleanedString(devices[i].enrollmentProfileType),
            azureEnrollmentType: Utilities.CleanedString(devices[i].enrollmentType),
            azureExternalSourceName: Utilities.CleanedString(devices[i].externalSourceName),
            azureManagementType: Utilities.CleanedString(devices[i].managementType),
            azureManufacturer: Utilities.CleanedString(devices[i].manufacturer),
            azureMDMAppId: Utilities.CleanedString(devices[i].mdmAppId),
            azureModel: Utilities.CleanedString(devices[i].model),
            azureOperatingSystem: Utilities.CleanedString(devices[i].operaingSystem),
            azureOperatingSystemVersion: Utilities.CleanedString(devices[i].operatingSystemVersion),
            azureProfileType: Utilities.CleanedString(devices[i].profileType),
            azureSourceType: Utilities.CleanedString(devices[i].sourceType),
            azureTrustType: Utilities.CleanedString(devices[i].trustType),
            // dates
            azureDeletedDateTime: Utilities.CleanedDate(devices[i].deletedDateTime),
            azureApproximateLastSignInDateTime: Utilities.CleanedDate(devices[i].approximateLastSignInDateTime),
            azureComplianceExpirationDateTime: Utilities.CleanedDate(devices[i].complianceExpirationDateTime),
            azureCreatedDateTime: Utilities.CleanedDate(devices[i].createdDateTime),
            azureOnPremisesLastSyncDateTime: Utilities.CleanedDate(devices[i].onPremisesLastSyncDateTime),
            azureRegistrationDateTime: Utilities.CleanedDate(devices[i].registrationDateTime),
            // booleans
            azureOnPremisesSyncEnabled: devices[i].onPremisesSyncEnabled ? devices[i].onPremisesSyncEnabled : false,
            azureAccountEnabled: devices[i].accountEnabled ? devices[i].accountEnabled : false,
            azureIsCompliant: devices[i].isCompliant ? devices[i].isCompliant : false,
            azureIsManaged: devices[i].isManaged ? devices[i].isManaged : false,
            azureIsRooted: devices[i].isRooted ? devices[i].isRooted : false,
          }

          this.AzureActiveDirectoryDevices.push(aado)
        } catch (err) {
          this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
          throw(err)
        }
      }

      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, '.. objects created.')
    } catch(err) {
      this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
    } finally {
      this.le.logStack.pop()
    }
    
    return new Promise<void>((resolve) => {resolve()})

  }

  
  public async getUsers():Promise<void> {
    this.le.logStack.push("users")

    try {

      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `fetching users ..`)

      const fieldsToFetch = [
        'userPrincipalName',
        'azureID',
        'businessPhones',
        'displayName',
        'givenName',
        'jobTitle',
        'mail',
        'mobilePhone',
        'officeLocation',
        'surname',
        'accountEnabled',
        //'assignedLicenses',
        'assignedPlans',
        'city',
        'country',
        'createdDateTime',
        'creationType',
        'deletedDateTime',
        'department',
        'employeeHireDate',
        //'employeeLeaveDateTime',
        'employeeId',
        'employeeOrgData',
        'employeeType',
        //'externalUserState',
        //'hireDate',
        'id',
        'jobTitle',
        'lastPasswordChangeDateTime',
        // 'licenseAssignmentStates',
        // 'mailNickname',
        'onPremisesDistinguishedName',
        'onPremisesDomainName',
        'onPremisesSamAccountName',
        'onPremisesUserPrincipalName',
        'passwordPolicies',
        //'preferredName',
        'postalCode',
        'state',
        'streetAddress',
        'userType',
      ]


      const users = await this.getData('/users', fieldsToFetch)

      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. received ${users.length} devices; creating objects ..`)

      for(let i=0; i<1; i++) {

        try {

          console.debug(users[i])
          const aadu:AzureActiveDirectoryUser = {
            mail: users[i].mail.toString().trim(),
            userPrincipalName: users[i].userPrincipalName.toString().trim(),
            id: users[i].id.toString().trim(),
            businessPhone: users[i].businessPhones[0].toString.trim(), // need to parse this
            displayName: Utilities.CleanedString(users[i].displayName),
            givenName: Utilities.CleanedString(users[i].givenName),
            jobTitle: Utilities.CleanedString(users[i].jobTitle),
            mobilePhone: Utilities.CleanedString(users[i].mobilePhone),
            officeLocation: Utilities.CleanedString(users[i].officeLocation),
            surname: Utilities.CleanedString(users[i].surname),
            accountEnabled: Utilities.CleanedString(users[i].accountEnabled), // should bit boolean
            assignedPlans: Utilities.CleanedString(users[i].assignedPlans),
            city: Utilities.CleanedString(users[i].city),
            country: Utilities.CleanedString(users[i].country),
            creationType: Utilities.CleanedString(users[i].creationType),
            department: Utilities.CleanedString(users[i].department),
            employeeHireDate: Utilities.CleanedString(users[i].employeeHireDate),
            employeeId: Utilities.CleanedString(users[i].employeeId),
            employeeOrgData: Utilities.CleanedString(users[i].employeeOrgData),
            employeeType: Utilities.CleanedString(users[i].employeeType),
            onPremisesDistinguishedName: Utilities.CleanedString(users[i].onPremisesDistinguishedName),
            onPremisesDomainName: Utilities.CleanedString(users[i].onPremisesDomainName),
            onPremisesSamAccountName: Utilities.CleanedString(users[i].onPremisesSamAccountName),
            onPremisesUserPrincipalName: Utilities.CleanedString(users[i].onPremisesUserPrincipalName),
            passwordPolicies: Utilities.CleanedString(users[i].passwordPolicies),
            postalCode: Utilities.CleanedString(users[i].postalCode),
            state: Utilities.CleanedString(users[i].state),
            streetAddress: Utilities.CleanedString(users[i].streetAddress),
            userType: Utilities.CleanedString(users[i].userType),
            createdDateTime: Utilities.CleanedDate(users[i].createdDateTime),
            deletedDateTime: Utilities.CleanedDate(users[i].deletedDateTime),
            lastPasswordChangeDateTime: Utilities.CleanedDate(users[i].lastPasswordChangeDateTime),
          }

          this.AzureActiveDirectoryUsers.push(aadu)
        } catch (err) {
          this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
          throw(err)
        }
      }

      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, '.. objects created.')
    } catch(err) {
      this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
    } finally {
      this.le.logStack.pop()
    }
    
    return new Promise<void>((resolve) => {resolve()})

  }

  public async getManagedDevices():Promise<void> {
    this.le.logStack.push("managedDevices")

    try {

      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `fetching managed devices ..`)


      const managedDevices = await this.getData('/deviceManagement/managedDevices')

      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. received ${managedDevices.length} devices; creating objects ..`)

      for(let i=0; i<1; i++) {

        try {

          const amd:AzureManagedDevice = {
            observedByAzureMDM: true,
            deviceName: managedDevices[i].deviceName.toString().trim(),
            azureManagedId: managedDevices[i].id.toString().trim(),
            // strings
            azureManagedDeviceName: Utilities.CleanedString(managedDevices[i].azureManagedDeviceName),
            azureManagedUserId: Utilities.CleanedString(managedDevices[i].userId),
            azureManagedDeviceOwnerType: Utilities.CleanedString(managedDevices[i].managedDeviceOwnerType),
            azureManagedOperatingSystem: Utilities.CleanedString(managedDevices[i].operatingSystem),
            azureManagedComplianceState: Utilities.CleanedString(managedDevices[i].complianceState),
            azureManagedJailBroken: Utilities.CleanedString(managedDevices[i].jailBroken),
            azureManagedManagementAgent: Utilities.CleanedString(managedDevices[i].managementAgent),
            azureManagedOperatingSystemVersion: Utilities.CleanedString(managedDevices[i].osVersion),
            azureManagedEASDeviceID: Utilities.CleanedString(managedDevices[i].easDeviceId),
            azureManagedDeviceEnrollmentType: Utilities.CleanedString(managedDevices[i].deviceEnrollmentType),
            azureManagedActivationLockBypassCode: Utilities.CleanedString(managedDevices[i].activationLockBypassCode),
            azureManagedEmailAddress: Utilities.CleanedString(managedDevices[i].emailAddress),
            azureManagedAzureADDeviceID: Utilities.CleanedString(managedDevices[i].azureADDeviceID),
            azureManagedDeviceRegistrationState: Utilities.CleanedString(managedDevices[i].deviceRegistrationState),
            azureManagedDeviceCategoryDisplayName: Utilities.CleanedString(managedDevices[i].deviceCategoryDisplayName),
            azureManagedExchangeAccessState: Utilities.CleanedString(managedDevices[i].exchangeAccessState),
            azureManagedExchangeAccessStateReason: Utilities.CleanedString(managedDevices[i].accessStateReason),
            azureManagedRemoteAssistanceSessionUrl: Utilities.CleanedString(managedDevices[i].remoteAssistanceSessionUrl),
            azureManagedRemoteAssistanceErrorDetails: Utilities.CleanedString(managedDevices[i].remoteAssistanceErrorDetails),
            azureManagedUserPrincipalName: Utilities.CleanedString(managedDevices[i].userPrincipalName),
            azureManagedModel: Utilities.CleanedString(managedDevices[i].model),
            azureManagedManufacturer: Utilities.CleanedString(managedDevices[i].manufacturer),
            azureManagedIMEI: Utilities.CleanedString(managedDevices[i].imei),
            azureManagedSerialNumber: Utilities.CleanedString(managedDevices[i].serialNumber),
            azureManagedPhoneNumber: Utilities.CleanedString(managedDevices[i].phoneNumber),
            azureManagedAndroidSecurityPatchLevel: Utilities.CleanedString(managedDevices[i].securityPatchLevel),
            azureManagedUserDisplayName: Utilities.CleanedString(managedDevices[i].userDisplayName),
            azureManagedConfigurationManagerClientEnabledFeatures: Utilities.CleanedString(managedDevices[i].configurationManagerClientEnabledFeatures),
            azureManagedWiFiMACAddress: Utilities.CleanedString(managedDevices[i].wifiMacAddress),
            azureManagedDeviceHealthAttestationState: Utilities.CleanedString(managedDevices[i].deviceHealthAttestationState),
            azureManagedSubscriberCarrier: Utilities.CleanedString(managedDevices[i].subscriberCarrier),
            azureManagedMEID: Utilities.CleanedString(managedDevices[i].meid),
            azureManagedPartnerReportedThreatState: Utilities.CleanedString(managedDevices[i].partnerReportedThreatState),
            azureManagedRequireUserEnrollmentApproval: Utilities.CleanedString(managedDevices[i].requireUserEnrollmentApproval),
            azureManagedICCID: Utilities.CleanedString(managedDevices[i].iccid),
            azureManagedUDID: Utilities.CleanedString(managedDevices[i].udid),
            azureManagedNotes: Utilities.CleanedString(managedDevices[i].notes),
            azureManagedEthernetMacAddress: Utilities.CleanedString(managedDevices[i].ethernetMacAddress),
            // numbers
            azureManagedPhysicalMemoryInBytes: Number(Utilities.CleanedString(managedDevices[i].physicalMemoryInBytes)),
            azureManagedTotalStorageSpaceInBytes: Number(Utilities.CleanedString(managedDevices[i].totalStorageSpaceInBytes)),
            azureManagedFreeStorageSpaceInBytes: Number(Utilities.CleanedString(managedDevices[i].freeStorageSpaceInBytes)),
            // dates
            azureManagedEnrolledDateTime: Utilities.CleanedDate(managedDevices[i].enrolledDateTime),
            azureManagedLastSyncDateTime: Utilities.CleanedDate(managedDevices[i].lastSyncDateTime),
            azureManagedEASActivationDateTime: Utilities.CleanedDate(managedDevices[i].easActivationDateTime),
            azureManagedExchangeLastSuccessfulSyncDateTime: Utilities.CleanedDate(managedDevices[i].exchangeLastSuccessfulSyncDateTime),
            azureManagedComplianceGracePeriodExpirationDateTime: Utilities.CleanedDate(managedDevices[i].complianceGracePeriodExpirationDateTime),
            azureManagedManagementCertificateExpirationDateTime: Utilities.CleanedDate(managedDevices[i].managementCertificateExpirationDateTime),
            // boolean
            azureManagedIsEASActivated: managedDevices[i].easActivated,
            azureManagedIsAzureADRegistered: managedDevices[i].azureADRegistered,
            azureManagedIsSupervised: managedDevices[i].isSupervised,
            azureManagedIsEncrypted: managedDevices[i].isEncrypted
          }

          this.AzureManagedDevices.push(amd)
        } catch (err) {
          this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
          throw(err)
        }
      }

      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, '.. objects created.')
    } catch(err) {
      this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
    } finally {
      this.le.logStack.pop()
    }
    
    return new Promise<void>((resolve) => {resolve()})

  }
  


  public async persist() {
    this.le.logStack.push('persist')
    
    try {

      // AAD devices
      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'performing AAD device updates ..')
      for(let i=0; i<this.AzureActiveDirectoryDevices.length; i++) {
        try {

          let tuDevice:TableUpdate = new TableUpdate('Device', 'DeviceID')
          let tuAzureActiveDirectory:TableUpdate = new TableUpdate('DeviceAzureActiveDirectory', 'DeviceAzureActiveDirectoryID')
          
          const DeviceID:number = await this.db.getID("Device", [new ColumnValuePair("deviceName", this.AzureActiveDirectoryDevices[i].deviceName, mssql.VarChar(255))], true)
          const DeviceAzureActiveDirectoryID:number = await this.db.getID("DeviceAzureActiveDirectory", [new ColumnValuePair('AzureID', this.AzureActiveDirectoryDevices[i].azureDeviceId, mssql.VarChar(255))], true)

          // update the device table to add the corresponding DeviceAzureActiveDirectoryID ..
          let ruDevice = new RowUpdate(DeviceID)
          ruDevice.updateName=this.AzureActiveDirectoryDevices[i].deviceName
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureActiveDirectoryID", mssql.Int, DeviceAzureActiveDirectoryID))
          tuDevice.RowUpdates.push(ruDevice)

          // update the DeviceActiveDirectory table values ..
          let ruAzureActiveDirectory = new RowUpdate(DeviceAzureActiveDirectoryID)
          ruAzureActiveDirectory.updateName=this.AzureActiveDirectoryDevices[i].deviceName
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureDeviceCategory", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureDeviceCategory))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureDeviceMetadata", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureDeviceMetadata))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureDeviceOwnership", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureDeviceOwnership))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureDeviceVersion", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureDeviceVersion))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureDomainName", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureDomainName))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureEnrollmentProfileType", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureEnrollmentProfileType))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureEnrollmentType", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureEnrollmentType))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureExternalSourceName", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureExternalSourceName))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureManagementType", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureManagementType))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureManufacturer", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureManufacturer))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureMDMAppId", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureMDMAppId))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureModel", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureModel))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureOperatingSystem", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureOperatingSystem))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureOperatingSystemVersion", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureOperatingSystemVersion))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureProfileType", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureProfileType))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureSourceType", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureSourceType))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureTrustType", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureTrustType))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureDeletedDateTime", mssql.DateTime2, this.AzureActiveDirectoryDevices[i].azureDeletedDateTime))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureApproximateLastSignInDateTime", mssql.DateTime2, this.AzureActiveDirectoryDevices[i].azureApproximateLastSignInDateTime))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureComplianceExpirationDateTime", mssql.DateTime2, this.AzureActiveDirectoryDevices[i].azureComplianceExpirationDateTime))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureCreatedDateTime", mssql.DateTime2, this.AzureActiveDirectoryDevices[i].azureCreatedDateTime))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureOnPremisesLastSyncDateTime", mssql.DateTime2, this.AzureActiveDirectoryDevices[i].azureOnPremisesLastSyncDateTime))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureRegistrationDateTime", mssql.DateTime2, this.AzureActiveDirectoryDevices[i].azureRegistrationDateTime))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureOnPremisesSyncEnabled", mssql.Bit, this.AzureActiveDirectoryDevices[i].azureOnPremisesSyncEnabled))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureAccountEnabled", mssql.Bit, this.AzureActiveDirectoryDevices[i].azureAccountEnabled))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureIsCompliant", mssql.Bit, this.AzureActiveDirectoryDevices[i].azureIsCompliant))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureIsManaged", mssql.Bit, this.AzureActiveDirectoryDevices[i].azureIsManaged))
          ruAzureActiveDirectory.ColumnUpdates.push(new ColumnUpdate("azureIsRooted", mssql.Bit, this.AzureActiveDirectoryDevices[i].azureIsRooted))
          tuAzureActiveDirectory.RowUpdates.push(ruAzureActiveDirectory)

          await this.db.updateTable(tuDevice, true)
          await this.db.updateTable(tuAzureActiveDirectory, true)
          
        } catch(err) {
          this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
          console.debug(this.AzureActiveDirectoryDevices[i])
          throw(err);
        }
      }
      
      // AAD Users ..
      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'performing AAD user updates ..')
      for(let i=0; i<this.AzureActiveDirectoryUsers.length; i++) {
        try {

          // find (insert if missing) this employee email address
          let tuEmployee:TableUpdate = new TableUpdate('Employee', 'EmployeeID')    
          const EmployeeID:number = await this.db.getID("Employee", [new ColumnValuePair("employeeEmailAddress", this.AzureActiveDirectoryUsers[i].mail, mssql.VarChar(255))], true)

          // update the employee table
          let ruEmployee = new RowUpdate(EmployeeID)
          ruEmployee.updateName=this.AzureActiveDirectoryUsers[i].mail
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadUserPrincipalName", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].userPrincipalName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadId", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].id))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadBusinessPhone", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].businessPhone))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadBisplayName", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].displayName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadGivenName", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].givenName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadJobTitle", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].jobTitle))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadMobilePhone", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].mobilePhone))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadOfficeLocation", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].officeLocation))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadSurname", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].surname))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadAccountEnabled:", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].accountEnabled))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadAssignedPlans:", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].assignedPlans))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadCity:", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].city))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadCountry:", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].country))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadCreationType:", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].creationType))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadDepartment:", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].department))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadEmployeeHireDate:", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].employeeHireDate))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadEmployeeId:", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].employeeId))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadEmployeeOrgData:", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].employeeOrgData))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadEmployeeType:", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].employeeType))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadOnPremisesDistinguishedName:", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].onPremisesDistinguishedName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadOnPremisesDomainName:", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].onPremisesDomainName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadOnPremisesSamAccountName:", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].onPremisesSamAccountName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadOnPremisesUserPrincipalName:", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].onPremisesUserPrincipalName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadPasswordPolicies:", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].passwordPolicies))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadPostalCode:", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].postalCode))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadState:", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].state))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadStreetAddress:", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].streetAddress))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadUserType:", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].userType))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadCreatedDateTime", mssql.DateTime2, this.AzureActiveDirectoryUsers[i].createdDateTime))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadDeletedDateTime", mssql.DateTime2, this.AzureActiveDirectoryUsers[i].deletedDateTime))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aadLastPasswordChangeDateTime", mssql.DateTime2, this.AzureActiveDirectoryUsers[i].lastPasswordChangeDateTime))

          tuEmployee.RowUpdates.push(ruEmployee)

          await this.db.updateTable(tuEmployee, true)

        } catch(err) {
          this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
          console.debug(this.AzureActiveDirectoryUsers[i])
          throw(err);
        }

      }

      // AAD managed devices ..
      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'performing AAD managed device updates ..')
      for(let i=0; i<this.AzureManagedDevices.length; i++) {
        try {

          let tuDevice:TableUpdate = new TableUpdate('Device', 'DeviceID')
          let tuAzureManaged:TableUpdate = new TableUpdate('DeviceAzureManaged', 'DeviceAzureManagedID')
          
          const DeviceID:number = await this.db.getID("Device", [new ColumnValuePair("deviceName", this.AzureManagedDevices[i].deviceName, mssql.VarChar(255))], true)
          const DeviceAzureManagedID:number = await this.db.getID("DeviceAzureManaged", [new ColumnValuePair('AzureManagedID', this.AzureManagedDevices[i].azureManagedId, mssql.VarChar(255))], true)

          // update the device table to add the corresponding DeviceAzureActiveDirectoryID ..
          let ruDevice = new RowUpdate(DeviceID)
          ruDevice.updateName=this.AzureManagedDevices[i].deviceName
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureManagedID", mssql.Int, DeviceAzureManagedID))
          tuDevice.RowUpdates.push(ruDevice)
          await this.db.updateTable(tuDevice, true)
  
          // update the DeviceActiveDirectory table values ..
          let ruAzureManaged = new RowUpdate(DeviceAzureManagedID)
          ruAzureManaged.updateName=this.AzureManagedDevices[i].deviceName
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedDeviceName", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedDeviceName))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedUserId", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedUserId))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedDeviceOwnerType", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedDeviceOwnerType))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedOperatingSystem", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedOperatingSystem))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedComplianceState", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedComplianceState))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedJailBroken", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedJailBroken))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedManagementAgent", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedManagementAgent))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedOperatingSystemVersion", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedOperatingSystemVersion))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedEASDeviceID", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedEASDeviceID))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedDeviceEnrollmentType", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedDeviceEnrollmentType))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedActivationLockBypassCode", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedActivationLockBypassCode))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedEmailAddress", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedEmailAddress))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedAzureADDeviceID", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedAzureADDeviceID))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedDeviceRegistrationState", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedDeviceRegistrationState))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedDeviceCategoryDisplayName", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedDeviceCategoryDisplayName))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedExchangeAccessState", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedExchangeAccessState))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedExchangeAccessStateReason", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedExchangeAccessStateReason))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedRemoteAssistanceSessionUrl", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedRemoteAssistanceSessionUrl))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedRemoteAssistanceErrorDetails", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedRemoteAssistanceErrorDetails))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedUserPrincipalName", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedUserPrincipalName))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedModel", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedModel))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedManufacturer", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedManufacturer))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedIMEI", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedIMEI))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedSerialNumber", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedSerialNumber))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedPhoneNumber", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedPhoneNumber))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedAndroidSecurityPatchLevel", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedAndroidSecurityPatchLevel))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedUserDisplayName", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedUserDisplayName))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedConfigurationManagerClientEnabledFeatures", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedConfigurationManagerClientEnabledFeatures))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedWiFiMACAddress", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedWiFiMACAddress))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedDeviceHealthAttestationState", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedDeviceHealthAttestationState))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedSubscriberCarrier", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedSubscriberCarrier))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedMEID", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedMEID))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedPartnerReportedThreatState", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedPartnerReportedThreatState))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedRequireUserEnrollmentApproval", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedRequireUserEnrollmentApproval))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedICCID", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedICCID))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedUDID", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedUDID))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedNotes", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedNotes))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedEthernetMacAddress", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedEthernetMacAddress))
          // bigint
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedPhysicalMemoryInBytes", mssql.BigInt, this.AzureManagedDevices[i].azureManagedPhysicalMemoryInBytes))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedTotalStorageSpaceInBytes", mssql.BigInt, this.AzureManagedDevices[i].azureManagedTotalStorageSpaceInBytes))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedFreeStorageSpaceInBytes", mssql.BigInt, this.AzureManagedDevices[i].azureManagedFreeStorageSpaceInBytes))
          // datetime
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedEnrolledDateTime", mssql.DateTime2, this.AzureManagedDevices[i].azureManagedEnrolledDateTime))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedLastSyncDateTime", mssql.DateTime2, this.AzureManagedDevices[i].azureManagedLastSyncDateTime))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedEASActivationDateTime", mssql.DateTime2, this.AzureManagedDevices[i].azureManagedEASActivationDateTime))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedExchangeLastSuccessfulSyncDateTime", mssql.DateTime2, this.AzureManagedDevices[i].azureManagedExchangeLastSuccessfulSyncDateTime))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedComplianceGracePeriodExpirationDateTime", mssql.DateTime2, this.AzureManagedDevices[i].azureManagedComplianceGracePeriodExpirationDateTime))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedManagementCertificateExpirationDateTime", mssql.DateTime2, this.AzureManagedDevices[i].azureManagedManagementCertificateExpirationDateTime))
          // bit
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedIsEASActivated", mssql.Bit, this.AzureManagedDevices[i].azureManagedIsEASActivated))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedIsAzureADRegistered", mssql.Bit, this.AzureManagedDevices[i].azureManagedIsAzureADRegistered))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedIsSupervised", mssql.Bit, this.AzureManagedDevices[i].azureManagedIsSupervised))
          ruAzureManaged.ColumnUpdates.push(new ColumnUpdate("azureManagedIsEncrypted", mssql.Bit, this.AzureManagedDevices[i].azureManagedIsEncrypted))
          tuAzureManaged.RowUpdates.push(ruAzureManaged)

          await this.db.updateTable(tuAzureManaged, true)
        
        }  catch(err) {
          this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
          console.debug(this.AzureManagedDevices[i])
          throw(err);
        }

      }
    
    } catch(err) {
      this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err);
    } finally {
      this.le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, 'done')
      this.le.logStack.pop()
    }

  }

  
  private async getData(apiEndpoint:string, selectFields:string[]=[]):Promise<any> {
    this.le.logStack.push('getData')
    var output:any = []
   
    try {

      const gc = this.graphClient.api(apiEndpoint)
      if(selectFields.length>0) {
        gc.select(selectFields.join(","))
      }

      const callback:PageIteratorCallback = (item:any) => {
        //console.debug(item)
        output.push(item)
        return true;
      }

      const response:PageCollection = await gc.get()

      const pageIterator = new PageIterator(this.graphClient, response, callback)

      await pageIterator.iterate();
      
    } catch (err) {
      this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
      throw(err)
    } finally {
      this.le.logStack.pop()
    }
   
    return new Promise<any>((resolve) => {resolve(output)})

  }

}