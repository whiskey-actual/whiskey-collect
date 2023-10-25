// imports
import { LogEngine } from 'whiskey-log';
import { CleanedDate, CleanedString, getMaxDateFromObject, minimumJsonDate } from 'whiskey-util'

import { Client, PageCollection, PageIterator, PageIteratorCallback } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'

import { ClientSecretCredential } from '@azure/identity'
import mssql from 'mssql'
import { DBEngine, ColumnValuePair, TableUpdate, RowUpdate, ColumnUpdate } from 'whiskey-sql';

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

  public readonly id:string=''

  public readonly emailAddress:string|undefined=undefined
  public readonly mail:string|undefined=undefined
  public readonly userPrincipalName:string|undefined=undefined
  public readonly businessPhone:string|undefined=undefined // this is an array, but just take the first entry (for now) for simplicity
  public readonly displayName:string|undefined=undefined
  public readonly givenName:string|undefined=undefined
  public readonly jobTitle:string|undefined=undefined
  public readonly mobilePhone:string|undefined=undefined
  public readonly officeLocation:string|undefined=undefined
  public readonly surname:string|undefined=undefined
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

  // bit
  public readonly accountEnabled:boolean=false

  // datetime
  public readonly createdDateTime:Date|undefined=undefined
  public readonly deletedDateTime:Date|undefined=undefined
  public readonly lastPasswordChangeDateTime:Date|undefined=undefined

  public readonly services:UserService[] = []

}

export class UserService {
  public readonly serviceName?:string = ''
  public readonly servicePlanId?:string = ''
  public readonly assignedDateTime?:Date = minimumJsonDate
  public readonly serviceStatus?:string = ''
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

      this.le.AddLogEntry(LogEngine.EntryType.Info, `fetching devices ..`)

      const devices = await this.getData('/devices')

      this.le.AddLogEntry(LogEngine.EntryType.Info, `.. received ${devices.length} devices; creating objects ..`)

      for(let i=0; i<devices.length; i++) {

        try {
          const aado:AzureActiveDirectoryDevice = {
            // mandatory
            deviceName: devices[i].displayName.toString().trim(),
            azureDeviceId: devices[i].deviceId.toString().trim(),
            
            // strings
            azureDeviceCategory: CleanedString(devices[i].deviceCategory),
            azureDeviceMetadata: CleanedString(devices[i].deviceMetadata),
            azureDeviceOwnership: CleanedString(devices[i].deviceOwnership),
            azureDeviceVersion: CleanedString(devices[i].deviceVersion),
            azureDomainName: CleanedString(devices[i].domainName),
            azureEnrollmentProfileType: CleanedString(devices[i].enrollmentProfileType),
            azureEnrollmentType: CleanedString(devices[i].enrollmentType),
            azureExternalSourceName: CleanedString(devices[i].externalSourceName),
            azureManagementType: CleanedString(devices[i].managementType),
            azureManufacturer: CleanedString(devices[i].manufacturer),
            azureMDMAppId: CleanedString(devices[i].mdmAppId),
            azureModel: CleanedString(devices[i].model),
            azureOperatingSystem: CleanedString(devices[i].operaingSystem),
            azureOperatingSystemVersion: CleanedString(devices[i].operatingSystemVersion),
            azureProfileType: CleanedString(devices[i].profileType),
            azureSourceType: CleanedString(devices[i].sourceType),
            azureTrustType: CleanedString(devices[i].trustType),
            // dates
            azureDeletedDateTime: CleanedDate(devices[i].deletedDateTime),
            azureApproximateLastSignInDateTime: CleanedDate(devices[i].approximateLastSignInDateTime),
            azureComplianceExpirationDateTime: CleanedDate(devices[i].complianceExpirationDateTime),
            azureCreatedDateTime: CleanedDate(devices[i].createdDateTime),
            azureOnPremisesLastSyncDateTime: CleanedDate(devices[i].onPremisesLastSyncDateTime),
            azureRegistrationDateTime: CleanedDate(devices[i].registrationDateTime),
            // booleans
            azureOnPremisesSyncEnabled: devices[i].onPremisesSyncEnabled ? devices[i].onPremisesSyncEnabled : false,
            azureAccountEnabled: devices[i].accountEnabled ? devices[i].accountEnabled : false,
            azureIsCompliant: devices[i].isCompliant ? devices[i].isCompliant : false,
            azureIsManaged: devices[i].isManaged ? devices[i].isManaged : false,
            azureIsRooted: devices[i].isRooted ? devices[i].isRooted : false,
          }

          this.AzureActiveDirectoryDevices.push(aado)
        } catch (err) {
          this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          console.debug(devices[i])
          throw(err)
        }
      }

      this.le.AddLogEntry(LogEngine.EntryType.Info, '.. objects created.')
    } catch(err) {
      this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
    } finally {
      this.le.logStack.pop()
    }
    
    return new Promise<void>((resolve) => {resolve()})

  }
  
  public async getUsers():Promise<void> {
    this.le.logStack.push("users")

    try {

      this.le.AddLogEntry(LogEngine.EntryType.Info, `fetching users ..`)

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
        'assignedLicenses',
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

      this.le.AddLogEntry(LogEngine.EntryType.Info, `.. received ${users.length} devices; creating objects ..`)

      for(let i=0; i<users.length; i++) {
        try {

          // assignedLicenses
        // assignedPlans: CleanedString(users[i].assignedPlans),

        //console.debug(users[i].assignedPlans)

        let userServices:UserService[] = []
        for(let j=0; i<users[i].assignedPlans; j++) {
          const us:UserService = {
            serviceName: CleanedString(users[i].assignedLicenses[j].serviceName),
            servicePlanId: CleanedString(users[i].assignedLicenses[j].servicePlanId),
            assignedDateTime: CleanedDate(users[i].assignedLicenses[j].assignedDateTime),
            serviceStatus: CleanedString(users[i].assignedLicenses[j].capabilityStatus)
          }
          userServices.push(us);
        }

          const aadu:AzureActiveDirectoryUser = {
            emailAddress: users[i].mail ? users[i].mail.toString().trim() : users[i].userPrincipalName ? users[i].userPrincipalName.toString().trim() : users[i].onPremisesUserPrincipalName ? users[i].onPremisesUserPrincipalName.toString().trim() : undefined,
            mail: CleanedString(users[i].mail),
            userPrincipalName: CleanedString(users[i].userPrincipalName),
            id: users[i].id.toString().trim(),
            businessPhone: users[i].businessPhones.length ? users[i].businessPhones[0].toString().trim() : undefined, // need to parse this
            displayName: CleanedString(users[i].displayName),
            givenName: CleanedString(users[i].givenName),
            jobTitle: CleanedString(users[i].jobTitle),
            mobilePhone: CleanedString(users[i].mobilePhone),
            officeLocation: CleanedString(users[i].officeLocation),
            surname: CleanedString(users[i].surname),
            assignedPlans: CleanedString(users[i].assignedPlans),
            city: CleanedString(users[i].city),
            country: CleanedString(users[i].country),
            creationType: CleanedString(users[i].creationType),
            department: CleanedString(users[i].department),
            employeeHireDate: CleanedString(users[i].employeeHireDate),
            employeeId: CleanedString(users[i].employeeId),
            employeeOrgData: CleanedString(users[i].employeeOrgData),
            employeeType: CleanedString(users[i].employeeType),
            onPremisesDistinguishedName: CleanedString(users[i].onPremisesDistinguishedName),
            onPremisesDomainName: CleanedString(users[i].onPremisesDomainName),
            onPremisesSamAccountName: CleanedString(users[i].onPremisesSamAccountName),
            onPremisesUserPrincipalName: CleanedString(users[i].onPremisesUserPrincipalName),
            passwordPolicies: CleanedString(users[i].passwordPolicies),
            postalCode: CleanedString(users[i].postalCode),
            state: CleanedString(users[i].state),
            streetAddress: CleanedString(users[i].streetAddress),
            userType: CleanedString(users[i].userType),
            accountEnabled: users[i].accountEnabled, // should bit boolean
            createdDateTime: CleanedDate(users[i].createdDateTime),
            deletedDateTime: CleanedDate(users[i].deletedDateTime),
            lastPasswordChangeDateTime: CleanedDate(users[i].lastPasswordChangeDateTime),
            services: userServices
          }

          this.AzureActiveDirectoryUsers.push(aadu)
        } catch (err) {
          this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          console.debug(users[i])
          throw(err)
        }
      }

      this.le.AddLogEntry(LogEngine.EntryType.Info, '.. objects created.')
    } catch(err) {
      this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
    } finally {
      this.le.logStack.pop()
    }
    
    return new Promise<void>((resolve) => {resolve()})

  }

  public async getManagedDevices():Promise<void> {
    this.le.logStack.push("managedDevices")

    try {

      this.le.AddLogEntry(LogEngine.EntryType.Info, `fetching managed devices ..`)

      const managedDevices = await this.getData('/deviceManagement/managedDevices')

      this.le.AddLogEntry(LogEngine.EntryType.Info, `.. received ${managedDevices.length} devices; creating objects ..`)

      for(let i=0; i<managedDevices.length; i++) {

        try {

          const amd:AzureManagedDevice = {
            observedByAzureMDM: true,
            deviceName: managedDevices[i].deviceName.toString().trim(),
            azureManagedId: managedDevices[i].id.toString().trim(),
            // strings
            azureManagedDeviceName: CleanedString(managedDevices[i].azureManagedDeviceName),
            azureManagedUserId: CleanedString(managedDevices[i].userId),
            azureManagedDeviceOwnerType: CleanedString(managedDevices[i].managedDeviceOwnerType),
            azureManagedOperatingSystem: CleanedString(managedDevices[i].operatingSystem),
            azureManagedComplianceState: CleanedString(managedDevices[i].complianceState),
            azureManagedJailBroken: CleanedString(managedDevices[i].jailBroken),
            azureManagedManagementAgent: CleanedString(managedDevices[i].managementAgent),
            azureManagedOperatingSystemVersion: CleanedString(managedDevices[i].osVersion),
            azureManagedEASDeviceID: CleanedString(managedDevices[i].easDeviceId),
            azureManagedDeviceEnrollmentType: CleanedString(managedDevices[i].deviceEnrollmentType),
            azureManagedActivationLockBypassCode: CleanedString(managedDevices[i].activationLockBypassCode),
            azureManagedEmailAddress: CleanedString(managedDevices[i].emailAddress),
            azureManagedAzureADDeviceID: CleanedString(managedDevices[i].azureADDeviceID),
            azureManagedDeviceRegistrationState: CleanedString(managedDevices[i].deviceRegistrationState),
            azureManagedDeviceCategoryDisplayName: CleanedString(managedDevices[i].deviceCategoryDisplayName),
            azureManagedExchangeAccessState: CleanedString(managedDevices[i].exchangeAccessState),
            azureManagedExchangeAccessStateReason: CleanedString(managedDevices[i].accessStateReason),
            azureManagedRemoteAssistanceSessionUrl: CleanedString(managedDevices[i].remoteAssistanceSessionUrl),
            azureManagedRemoteAssistanceErrorDetails: CleanedString(managedDevices[i].remoteAssistanceErrorDetails),
            azureManagedUserPrincipalName: CleanedString(managedDevices[i].userPrincipalName),
            azureManagedModel: CleanedString(managedDevices[i].model),
            azureManagedManufacturer: CleanedString(managedDevices[i].manufacturer),
            azureManagedIMEI: CleanedString(managedDevices[i].imei),
            azureManagedSerialNumber: CleanedString(managedDevices[i].serialNumber),
            azureManagedPhoneNumber: CleanedString(managedDevices[i].phoneNumber),
            azureManagedAndroidSecurityPatchLevel: CleanedString(managedDevices[i].securityPatchLevel),
            azureManagedUserDisplayName: CleanedString(managedDevices[i].userDisplayName),
            azureManagedConfigurationManagerClientEnabledFeatures: CleanedString(managedDevices[i].configurationManagerClientEnabledFeatures),
            azureManagedWiFiMACAddress: CleanedString(managedDevices[i].wifiMacAddress),
            azureManagedDeviceHealthAttestationState: CleanedString(managedDevices[i].deviceHealthAttestationState),
            azureManagedSubscriberCarrier: CleanedString(managedDevices[i].subscriberCarrier),
            azureManagedMEID: CleanedString(managedDevices[i].meid),
            azureManagedPartnerReportedThreatState: CleanedString(managedDevices[i].partnerReportedThreatState),
            azureManagedRequireUserEnrollmentApproval: CleanedString(managedDevices[i].requireUserEnrollmentApproval),
            azureManagedICCID: CleanedString(managedDevices[i].iccid),
            azureManagedUDID: CleanedString(managedDevices[i].udid),
            azureManagedNotes: CleanedString(managedDevices[i].notes),
            azureManagedEthernetMacAddress: CleanedString(managedDevices[i].ethernetMacAddress),
            // numbers
            azureManagedPhysicalMemoryInBytes: Number(CleanedString(managedDevices[i].physicalMemoryInBytes)),
            azureManagedTotalStorageSpaceInBytes: Number(CleanedString(managedDevices[i].totalStorageSpaceInBytes)),
            azureManagedFreeStorageSpaceInBytes: Number(CleanedString(managedDevices[i].freeStorageSpaceInBytes)),
            // dates
            azureManagedEnrolledDateTime: CleanedDate(managedDevices[i].enrolledDateTime),
            azureManagedLastSyncDateTime: CleanedDate(managedDevices[i].lastSyncDateTime),
            azureManagedEASActivationDateTime: CleanedDate(managedDevices[i].easActivationDateTime),
            azureManagedExchangeLastSuccessfulSyncDateTime: CleanedDate(managedDevices[i].exchangeLastSuccessfulSyncDateTime),
            azureManagedComplianceGracePeriodExpirationDateTime: CleanedDate(managedDevices[i].complianceGracePeriodExpirationDateTime),
            azureManagedManagementCertificateExpirationDateTime: CleanedDate(managedDevices[i].managementCertificateExpirationDateTime),
            // boolean
            azureManagedIsEASActivated: managedDevices[i].easActivated ? managedDevices[i].easActivated : false,
            azureManagedIsAzureADRegistered: managedDevices[i].azureADRegistered ? managedDevices[i].azureADRegistered : false,
            azureManagedIsSupervised: managedDevices[i].isSupervised ? managedDevices[i].isSupervised : false,
            azureManagedIsEncrypted: managedDevices[i].isEncrypted ? managedDevices[i].isEncrypted : false
          }

          this.AzureManagedDevices.push(amd)
        } catch (err) {
          this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          console.debug(managedDevices[i])
          throw(err)
        }
      }

      this.le.AddLogEntry(LogEngine.EntryType.Info, '.. objects created.')
    } catch(err) {
      this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
    } finally {
      this.le.logStack.pop()
    }
    
    return new Promise<void>((resolve) => {resolve()})

  }

  public async persist() {
    this.le.logStack.push('persist')
    
    try {

      // AAD devices
      this.le.AddLogEntry(LogEngine.EntryType.Info, 'performing AAD device updates ..')
      for(let i=0; i<this.AzureActiveDirectoryDevices.length; i++) {
        try {

          const aadLastSeen = getMaxDateFromObject(this.AzureActiveDirectoryDevices[i], [
            'azureDeletedDateTime',
            'azureCreatedDateTime',
            'azureOnPremisesLastSyncDateTime',
            'azureRegistrationDateTime'
          ])

          let tuDevice:TableUpdate = new TableUpdate('Device', 'DeviceID')
          const DeviceID:number = await this.db.getID("Device", [new ColumnValuePair("deviceName", this.AzureActiveDirectoryDevices[i].deviceName, mssql.VarChar(255))], true)

          let ruDevice = new RowUpdate(DeviceID)
          ruDevice.updateName=this.AzureActiveDirectoryDevices[i].deviceName
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_DeviceCategory", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureDeviceCategory))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_DeviceMetadata", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureDeviceMetadata))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_DeviceOwnership", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureDeviceOwnership))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_DeviceVersion", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureDeviceVersion))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_DomainName", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureDomainName))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_EnrollmentProfileType", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureEnrollmentProfileType))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_EnrollmentType", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureEnrollmentType))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_ExternalSourceName", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureExternalSourceName))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_ManagementType", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureManagementType))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_Manufacturer", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureManufacturer))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_MDMAppId", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureMDMAppId))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_Model", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureModel))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_ProfileType", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureProfileType))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_SourceType", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureSourceType))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_TrustType", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureTrustType))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_OperatingSystem", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureOperatingSystem))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_OperatingSystemVersion", mssql.VarChar(255), this.AzureActiveDirectoryDevices[i].azureOperatingSystemVersion))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_DeletedDateTime", mssql.DateTime2, this.AzureActiveDirectoryDevices[i].azureDeletedDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_ApproximateLastSignInDateTime", mssql.DateTime2, this.AzureActiveDirectoryDevices[i].azureApproximateLastSignInDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_ComplianceExpirationDateTime", mssql.DateTime2, this.AzureActiveDirectoryDevices[i].azureComplianceExpirationDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_CreatedDateTime", mssql.DateTime2, this.AzureActiveDirectoryDevices[i].azureCreatedDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_OnPremisesLastSyncDateTime", mssql.DateTime2, this.AzureActiveDirectoryDevices[i].azureOnPremisesLastSyncDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_RegistrationDateTime", mssql.DateTime2, this.AzureActiveDirectoryDevices[i].azureRegistrationDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_LastSeen", mssql.DateTime2, aadLastSeen))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_OnPremisesSyncEnabled", mssql.Bit, this.AzureActiveDirectoryDevices[i].azureOnPremisesSyncEnabled))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_AccountEnabled", mssql.Bit, this.AzureActiveDirectoryDevices[i].azureAccountEnabled))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_IsCompliant", mssql.Bit, this.AzureActiveDirectoryDevices[i].azureIsCompliant))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_IsManaged", mssql.Bit, this.AzureActiveDirectoryDevices[i].azureIsManaged))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("aad_IsRooted", mssql.Bit, this.AzureActiveDirectoryDevices[i].azureIsRooted))
          tuDevice.RowUpdates.push(ruDevice)

          await this.db.updateTable(tuDevice, true)
          
        } catch(err) {
          this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          console.debug(this.AzureActiveDirectoryDevices[i])
          throw(err);
        }
      }
      
      // AAD Users ..
      this.le.AddLogEntry(LogEngine.EntryType.Info, 'performing AAD user updates ..')
      for(let i=0; i<this.AzureActiveDirectoryUsers.length; i++) {
        try {

          // find (insert if missing) this employee email address
          let tuEmployee:TableUpdate = new TableUpdate('Employee', 'EmployeeID')    

          let EmployeeID:number = 0
          let UpdateName:string|undefined = undefined
          // if we have an email address, try to find the id that way first (don't create the row, since we'll try a second match ..)
          if(this.AzureActiveDirectoryUsers[i].emailAddress) {
            EmployeeID = await this.db.getID("Employee", [new ColumnValuePair("EmployeeEmailAddress", this.AzureActiveDirectoryUsers[i].emailAddress, mssql.VarChar(255))], false)
            UpdateName = this.AzureActiveDirectoryUsers[i].emailAddress
          }  // otherwise, use the Id; if this doesnt exist, insert it.
          if(EmployeeID===0) {
            EmployeeID = await this.db.getID("Employee", [new ColumnValuePair("aad_Id", this.AzureActiveDirectoryUsers[i].id, mssql.VarChar(255))], true)
            UpdateName = this.AzureActiveDirectoryUsers[i].id
          }

          // update the employee table
          let ruEmployee = new RowUpdate(EmployeeID)
          ruEmployee.updateName = UpdateName ? UpdateName : 'unknown user'
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("EmployeeEmailAddress", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].emailAddress))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_UserPrincipalName", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].userPrincipalName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_Id", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].id))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_BusinessPhone", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].businessPhone))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_BisplayName", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].displayName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_GivenName", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].givenName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_JobTitle", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].jobTitle))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_MobilePhone", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].mobilePhone))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_OfficeLocation", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].officeLocation))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_Surname", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].surname))
          //ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_AssignedPlans", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].assignedPlans))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_City", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].city))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_Country", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].country))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_CreationType", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].creationType))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_Department", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].department))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_EmployeeHireDate", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].employeeHireDate))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_EmployeeId", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].employeeId))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_EmployeeOrgData", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].employeeOrgData))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_EmployeeType", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].employeeType))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_OnPremisesDistinguishedName", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].onPremisesDistinguishedName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_OnPremisesDomainName", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].onPremisesDomainName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_OnPremisesSamAccountName", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].onPremisesSamAccountName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_OnPremisesUserPrincipalName", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].onPremisesUserPrincipalName))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_PasswordPolicies", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].passwordPolicies))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_PostalCode", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].postalCode))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_State", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].state))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_StreetAddress", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].streetAddress))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_UserType", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].userType))
          // bit
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_AccountEnabled", mssql.Bit, this.AzureActiveDirectoryUsers[i].accountEnabled))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_Observed", mssql.Bit, true))
          // datetime
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_CreatedDateTime", mssql.DateTime2, this.AzureActiveDirectoryUsers[i].createdDateTime))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_DeletedDateTime", mssql.DateTime2, this.AzureActiveDirectoryUsers[i].deletedDateTime))
          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_LastPasswordChangeDateTime", mssql.DateTime2, this.AzureActiveDirectoryUsers[i].lastPasswordChangeDateTime))

          const aadLastSeen = getMaxDateFromObject(this.AzureActiveDirectoryUsers[i], [
            'createdDateTime',
            'deletedDateTime',
            'lastPasswordChangeDateTime',
          ])

          ruEmployee.ColumnUpdates.push(new ColumnUpdate("aad_LastSeen", mssql.DateTime2, aadLastSeen))
          tuEmployee.RowUpdates.push(ruEmployee)

          await this.db.updateTable(tuEmployee, true)

          // update licenses

          console.debug(this.AzureActiveDirectoryUsers[i].services);

          let tuLicenses:TableUpdate = new TableUpdate('License', 'LicenseID')
          let tuEmployeeLicense:TableUpdate = new TableUpdate('EmployeeLicense', 'EmployeeLicenseID')
          for(let j=0; j<this.AzureActiveDirectoryUsers[i].services.length; j++) {
            
            console.debug(this.AzureActiveDirectoryUsers[i].services[j])
            
            const LicenseID = await this.db.getID("License", [new ColumnValuePair("LicensePlanID", this.AzureActiveDirectoryUsers[i].services[j].servicePlanId, mssql.VarChar(255))], true)
            let ruLicense:RowUpdate = new RowUpdate(LicenseID)
            ruLicense.ColumnUpdates.push(new ColumnUpdate("LicenseDescription", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].services[j].serviceName))
            tuLicenses.RowUpdates.push(ruLicense)
            
            const EmployeeLicenseID = await this.db.getID("EmployeeLicense", [
              new ColumnValuePair("EmployeeID", EmployeeID, mssql.Int),
              new ColumnValuePair("LicenseID", LicenseID, mssql.Int)
            ], true)
            let ruEmployeeLicense:RowUpdate = new RowUpdate(EmployeeLicenseID)
            ruEmployeeLicense.ColumnUpdates.push(new ColumnUpdate("AssignmentDateTime", mssql.DateTime2, this.AzureActiveDirectoryUsers[i].services[j].assignedDateTime))
            ruEmployeeLicense.ColumnUpdates.push(new ColumnUpdate("AssignmentStatus", mssql.VarChar(255), this.AzureActiveDirectoryUsers[i].services[j].serviceStatus))
            tuEmployeeLicense.RowUpdates.push(ruEmployeeLicense)
          }
          await this.db.updateTable(tuLicenses, true)
          await this.db.updateTable(tuEmployeeLicense, true)

        } catch(err) {
          this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          console.debug(this.AzureActiveDirectoryUsers[i])
          throw(err);
        }

      }

      // AAD managed devices ..
      this.le.AddLogEntry(LogEngine.EntryType.Info, 'performing AAD managed device updates ..')
      for(let i=0; i<this.AzureManagedDevices.length; i++) {
        try {

          const mdmLastSeen = getMaxDateFromObject(this.AzureManagedDevices[i], [
            'azureManagedEnrolledDateTime',
            'azureManagedLastSyncDateTime',
            'azureManagedEASActivationDateTime',
            'azureManagedExchangeLastSuccessfulSyncDateTime',
          ])

          let tuDevice:TableUpdate = new TableUpdate('Device', 'DeviceID')  
          const DeviceID:number = await this.db.getID("Device", [new ColumnValuePair("deviceName", this.AzureManagedDevices[i].deviceName, mssql.VarChar(255))], true)
    
          // update the DeviceActiveDirectory table values ..
          let ruDevice = new RowUpdate(DeviceID)
          ruDevice.updateName=this.AzureManagedDevices[i].deviceName
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_DeviceName", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedDeviceName))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_UserId", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedUserId))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_DeviceOwnerType", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedDeviceOwnerType))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_ComplianceState", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedComplianceState))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_JailBroken", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedJailBroken))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_ManagementAgent", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedManagementAgent))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_OperatingSystem", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedOperatingSystem))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_OperatingSystemVersion", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedOperatingSystemVersion))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_EASDeviceID", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedEASDeviceID))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_DeviceEnrollmentType", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedDeviceEnrollmentType))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_ActivationLockBypassCode", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedActivationLockBypassCode))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_EmailAddress", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedEmailAddress))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_AzureADDeviceID", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedAzureADDeviceID))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_DeviceRegistrationState", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedDeviceRegistrationState))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_DeviceCategoryDisplayName", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedDeviceCategoryDisplayName))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_ExchangeAccessState", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedExchangeAccessState))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_ExchangeAccessStateReason", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedExchangeAccessStateReason))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_RemoteAssistanceSessionUrl", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedRemoteAssistanceSessionUrl))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_RemoteAssistanceErrorDetails", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedRemoteAssistanceErrorDetails))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_UserPrincipalName", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedUserPrincipalName))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_Model", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedModel))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_Manufacturer", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedManufacturer))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_IMEI", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedIMEI))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_SerialNumber", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedSerialNumber))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_PhoneNumber", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedPhoneNumber))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_AndroidSecurityPatchLevel", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedAndroidSecurityPatchLevel))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_UserDisplayName", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedUserDisplayName))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_ConfigurationManagerClientEnabledFeatures", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedConfigurationManagerClientEnabledFeatures))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_WiFiMACAddress", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedWiFiMACAddress))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_DeviceHealthAttestationState", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedDeviceHealthAttestationState))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_SubscriberCarrier", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedSubscriberCarrier))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_MEID", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedMEID))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_PartnerReportedThreatState", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedPartnerReportedThreatState))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_RequireUserEnrollmentApproval", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedRequireUserEnrollmentApproval))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_ICCID", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedICCID))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_UDID", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedUDID))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_Notes", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedNotes))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_EthernetMacAddress", mssql.VarChar(255), this.AzureManagedDevices[i].azureManagedEthernetMacAddress))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_PhysicalMemoryInBytes", mssql.BigInt, this.AzureManagedDevices[i].azureManagedPhysicalMemoryInBytes))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_TotalStorageSpaceInBytes", mssql.BigInt, this.AzureManagedDevices[i].azureManagedTotalStorageSpaceInBytes))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_FreeStorageSpaceInBytes", mssql.BigInt, this.AzureManagedDevices[i].azureManagedFreeStorageSpaceInBytes))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_EnrolledDateTime", mssql.DateTime2, this.AzureManagedDevices[i].azureManagedEnrolledDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_LastSyncDateTime", mssql.DateTime2, this.AzureManagedDevices[i].azureManagedLastSyncDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_EASActivationDateTime", mssql.DateTime2, this.AzureManagedDevices[i].azureManagedEASActivationDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_ExchangeLastSuccessfulSyncDateTime", mssql.DateTime2, this.AzureManagedDevices[i].azureManagedExchangeLastSuccessfulSyncDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_ComplianceGracePeriodExpirationDateTime", mssql.DateTime2, this.AzureManagedDevices[i].azureManagedComplianceGracePeriodExpirationDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_ManagementCertificateExpirationDateTime", mssql.DateTime2, this.AzureManagedDevices[i].azureManagedManagementCertificateExpirationDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_LastSeen", mssql.DateTime2, mdmLastSeen))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_IsEASActivated", mssql.Bit, this.AzureManagedDevices[i].azureManagedIsEASActivated))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_IsAzureADRegistered", mssql.Bit, this.AzureManagedDevices[i].azureManagedIsAzureADRegistered))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_IsSupervised", mssql.Bit, this.AzureManagedDevices[i].azureManagedIsSupervised))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("mdm_IsEncrypted", mssql.Bit, this.AzureManagedDevices[i].azureManagedIsEncrypted))
          tuDevice.RowUpdates.push(ruDevice)
          await this.db.updateTable(tuDevice, true)
        
        }  catch(err) {
          this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          console.debug(this.AzureManagedDevices[i])
          throw(err);
        }

      }
    
    } catch(err) {
      this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
      throw(err);
    } finally {
      this.le.AddLogEntry(LogEngine.EntryType.Info, 'done')
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
      this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
      throw(err)
    } finally {
      this.le.logStack.pop()
    }
   
    return new Promise<any>((resolve) => {resolve(output)})

  }

}