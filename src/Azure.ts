// imports
import le from './config/le';
import { LogEntryType } from 'whiskey-log';

import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'

import { ClientSecretCredential } from '@azure/identity'
import { CleanedDate, CleanedString } from 'whiskey-util';

import { PageIteratorCallback, PageCollection, PageIterator } from "@microsoft/microsoft-graph-client"

export class AzureCollector {

  constructor(TENANT_ID:string, CLIENT_ID:string, CLIENT_SECRET:string) {
    this.tenantId = TENANT_ID
    this.clientId = CLIENT_ID
    this.clientSecret = CLIENT_SECRET
  }
  private tenantId:string
  private clientId:string
  private clientSecret:string

  private async callAPI(apiEndpoint:string, selectFields:string[]=[]):Promise<any> {
    le.logStack.push('callAPI')
    var output:any = []
    
    try {

      le.AddLogEntry(LogEntryType.Info, '.. creating graph client ..')
      const credential = new ClientSecretCredential(this.tenantId, this.clientId, this.clientSecret);
      const authProvider = new TokenCredentialAuthenticationProvider(credential, {scopes: ['https://graph.microsoft.com/.default']})
      const graphClient = Client.initWithMiddleware({authProvider: authProvider})
      le.AddLogEntry(LogEntryType.Info, '.. graph client created.')

      le.AddLogEntry(LogEntryType.Info, `.. calling API endpoint ${apiEndpoint} ..`)

      const gc = graphClient.api(apiEndpoint)
      if(selectFields.length>0) {
        gc.select(selectFields.join(","))
      }

      const callback:PageIteratorCallback = (item:any) => {
        //console.debug(item)
        output.push(item)
        return true;
      }

      const response:PageCollection = await gc.get()

      const pageIterator = new PageIterator(graphClient, response, callback)

      await pageIterator.iterate();
      
    } catch (err) {
      le.AddLogEntry(LogEntryType.Error, `${err}`)
      throw(err)
    } finally {
      le.logStack.pop()
    }
    
    return new Promise<any>((resolve) => {resolve(output)})
  }

  public async fetchDevices(showDebugOutput:boolean=false):Promise<AzureActiveDirectoryDevice[]> {
    le.logStack.push("fetchDevices")

    let output:AzureActiveDirectoryDevice[] = []

    try {

      le.AddLogEntry(LogEntryType.Info, `fetching devices ..`)

      const devices = await this.callAPI('/devices')

      le.AddLogEntry(LogEntryType.Info, `.. received ${devices.length} devices; creating objects ..`)

      for(let i=0; i<devices.length; i++) {

        if(showDebugOutput) { console.debug(devices[i]) }

        try {
          const aado:AzureActiveDirectoryDevice = {
            // mandatory
            DeviceName: devices[i].displayName.toString().trim(),
            AzureDeviceId: devices[i].deviceId.toString().trim(),
            
            // strings
            AzureDeviceCategory: CleanedString(devices[i].deviceCategory),
            AzureDeviceMetadata: CleanedString(devices[i].deviceMetadata),
            AzureDeviceOwnership: CleanedString(devices[i].deviceOwnership),
            AzureDeviceVersion: CleanedString(devices[i].deviceVersion),
            AzureDomainName: CleanedString(devices[i].domainName),
            AzureEnrollmentProfileType: CleanedString(devices[i].enrollmentProfileType),
            AzureEnrollmentType: CleanedString(devices[i].enrollmentType),
            AzureExternalSourceName: CleanedString(devices[i].externalSourceName),
            AzureManagementType: CleanedString(devices[i].managementType),
            AzureManufacturer: CleanedString(devices[i].manufacturer),
            AzureMDMAppId: CleanedString(devices[i].mdmAppId),
            AzureModel: CleanedString(devices[i].model),
            AzureOperatingSystem: CleanedString(devices[i].operaingSystem),
            AzureOperatingSystemVersion: CleanedString(devices[i].operatingSystemVersion),
            AzureProfileType: CleanedString(devices[i].profileType),
            AzureSourceType: CleanedString(devices[i].sourceType),
            AzureTrustType: CleanedString(devices[i].trustType),
            // dates
            AzureDeletedDateTime: CleanedDate(devices[i].deletedDateTime),
            AzureApproximateLastSignInDateTime: CleanedDate(devices[i].approximateLastSignInDateTime),
            AzureComplianceExpirationDateTime: CleanedDate(devices[i].complianceExpirationDateTime),
            AzureCreatedDateTime: CleanedDate(devices[i].createdDateTime),
            AzureOnPremisesLastSyncDateTime: CleanedDate(devices[i].onPremisesLastSyncDateTime),
            AzureRegistrationDateTime: CleanedDate(devices[i].registrationDateTime),
            // booleans
            AzureOnPremisesSyncEnabled: devices[i].onPremisesSyncEnabled ? devices[i].onPremisesSyncEnabled : false,
            AzureAccountEnabled: devices[i].accountEnabled ? devices[i].accountEnabled : false,
            AzureIsCompliant: devices[i].isCompliant ? devices[i].isCompliant : false,
            AzureIsManaged: devices[i].isManaged ? devices[i].isManaged : false,
            AzureIsRooted: devices[i].isRooted ? devices[i].isRooted : false,
          }

          output.push(aado)
        } catch (err) {
          le.AddLogEntry(LogEntryType.Error, `${err}`)
          console.debug(devices[i])
          throw(err)
        }
      }

      le.AddLogEntry(LogEntryType.Info, '.. objects created.')
    } catch(err) {
      le.AddLogEntry(LogEntryType.Error, `${err}`)
    } finally {
      le.logStack.pop()
    }
    
    return new Promise<AzureActiveDirectoryDevice[]>((resolve) => {resolve(output)})

  }

  public async fetchEmployees(showDebugOutput:boolean=false):Promise<AzureActiveDirectoryEmployee[]> {
    le.logStack.push("fetchEmployees")

    let output:AzureActiveDirectoryEmployee[] = []
    try {

      le.AddLogEntry(LogEntryType.Info, `fetching employees ..`)

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
        'EmployeeHireDate',
        //'UserLeaveDateTime',
        'EmployeeId',
        'EmployeeOrgData',
        'EmployeeType',
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
        'signInActivity'
      ]


      const users = await this.callAPI('/users', fieldsToFetch)

      le.AddLogEntry(LogEntryType.Info, `.. received ${users.length} devices; creating objects ..`)

      for(let i=0; i<users.length; i++) {
        try {

          if(showDebugOutput) { console.debug(users[i]) }

          //assignedLicenses
          assignedPlans: CleanedString(users[i].assignedPlans)

          //console.debug(users[i].assignedPlans)

          let employeeServices:EmployeeService[] = []
          for(let j=0; j<users[i].assignedPlans.length; j++) {
            try {
              const es:EmployeeService = {
                serviceName: CleanedString(users[i].assignedPlans[j].service),
                servicePlanId: CleanedString(users[i].assignedPlans[j].servicePlanId),
                assignedDateTime: CleanedDate(users[i].assignedPlans[j].assignedDateTime),
                serviceStatus: CleanedString(users[i].assignedPlans[j].capabilityStatus)
              }
              employeeServices.push(es);
            } catch(err) {
              console.debug(users[i].assignedPlans)
              console.debug(users[i].assignedPlans[j])
              throw err;
            }
            
          }

          const aade:AzureActiveDirectoryEmployee = {
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
            EmployeeHireDate: CleanedString(users[i].EmployeeHireDate),
            EmployeeId: CleanedString(users[i].EmployeeId),
            EmployeeOrgData: CleanedString(users[i].EmployeeOrgData),
            EmployeeType: CleanedString(users[i].EmployeeType),
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
            services: employeeServices,
            lastSignInDateTime: users[i].signInActivity ? CleanedDate(users[i].signInActivity.lastSignInDateTime) : undefined
          }

          output.push(aade)
        } catch (err) {
          le.AddLogEntry(LogEntryType.Error, `${err}`)
          console.debug(users[i])
          throw(err)
        }
      }

      le.AddLogEntry(LogEntryType.Info, '.. objects created.')
    } catch(err) {
      le.AddLogEntry(LogEntryType.Error, `${err}`)
    } finally {
      le.logStack.pop()
    }
    
    return new Promise<AzureActiveDirectoryEmployee[]>((resolve) => {resolve(output)})

  }

public async fetchMDM(showDebugOutput:boolean=false):Promise<AzureManagedDevice[]> {
    le.logStack.push("fetchMDM")

    let output:AzureManagedDevice[] = []

    try {

      le.AddLogEntry(LogEntryType.Info, `fetching managed devices ..`)

      const managedDevices = await this.callAPI('/deviceManagement/managedDevices')

      le.AddLogEntry(LogEntryType.Info, `.. received ${managedDevices.length} devices; creating objects ..`)

      for(let i=0; i<managedDevices.length; i++) {

        if(showDebugOutput) { console.debug(managedDevices[i]) }

        try {

          const amd:AzureManagedDevice = {
            ObservedByAzureMDM: true,
            DeviceName: managedDevices[i].deviceName.toString().trim(),
            AzureManagedId: managedDevices[i].id.toString().trim(),
            // strings
            AzureManagedDeviceName: CleanedString(managedDevices[i].azureManagedDeviceName),
            AzureManagedUserId: CleanedString(managedDevices[i].userId),
            AzureManagedDeviceOwnerType: CleanedString(managedDevices[i].managedDeviceOwnerType),
            AzureManagedOperatingSystem: CleanedString(managedDevices[i].operatingSystem),
            AzureManagedComplianceState: CleanedString(managedDevices[i].complianceState),
            AzureManagedJailBroken: CleanedString(managedDevices[i].jailBroken),
            AzureManagedManagementAgent: CleanedString(managedDevices[i].managementAgent),
            AzureManagedOperatingSystemVersion: CleanedString(managedDevices[i].osVersion),
            AzureManagedEASDeviceID: CleanedString(managedDevices[i].easDeviceId),
            AzureManagedDeviceEnrollmentType: CleanedString(managedDevices[i].deviceEnrollmentType),
            AzureManagedActivationLockBypassCode: CleanedString(managedDevices[i].activationLockBypassCode),
            AzureManagedEmailAddress: CleanedString(managedDevices[i].emailAddress),
            AzureManagedAzureADDeviceID: CleanedString(managedDevices[i].azureADDeviceID),
            AzureManagedDeviceRegistrationState: CleanedString(managedDevices[i].deviceRegistrationState),
            AzureManagedDeviceCategoryDisplayName: CleanedString(managedDevices[i].deviceCategoryDisplayName),
            AzureManagedExchangeAccessState: CleanedString(managedDevices[i].exchangeAccessState),
            AzureManagedExchangeAccessStateReason: CleanedString(managedDevices[i].accessStateReason),
            AzureManagedRemoteAssistanceSessionUrl: CleanedString(managedDevices[i].remoteAssistanceSessionUrl),
            AzureManagedRemoteAssistanceErrorDetails: CleanedString(managedDevices[i].remoteAssistanceErrorDetails),
            AzureManagedUserPrincipalName: CleanedString(managedDevices[i].userPrincipalName),
            AzureManagedModel: CleanedString(managedDevices[i].model),
            AzureManagedManufacturer: CleanedString(managedDevices[i].manufacturer),
            AzureManagedIMEI: CleanedString(managedDevices[i].imei),
            AzureManagedSerialNumber: CleanedString(managedDevices[i].serialNumber),
            AzureManagedPhoneNumber: CleanedString(managedDevices[i].phoneNumber),
            AzureManagedAndroidSecurityPatchLevel: CleanedString(managedDevices[i].securityPatchLevel),
            AzureManagedUserDisplayName: CleanedString(managedDevices[i].userDisplayName),
            AzureManagedConfigurationManagerClientEnabledFeatures: CleanedString(managedDevices[i].configurationManagerClientEnabledFeatures),
            AzureManagedWiFiMACAddress: CleanedString(managedDevices[i].wifiMacAddress),
            AzureManagedDeviceHealthAttestationState: CleanedString(managedDevices[i].deviceHealthAttestationState),
            AzureManagedSubscriberCarrier: CleanedString(managedDevices[i].subscriberCarrier),
            AzureManagedMEID: CleanedString(managedDevices[i].meid),
            AzureManagedPartnerReportedThreatState: CleanedString(managedDevices[i].partnerReportedThreatState),
            AzureManagedRequireUserEnrollmentApproval: CleanedString(managedDevices[i].requireUserEnrollmentApproval),
            AzureManagedICCID: CleanedString(managedDevices[i].iccid),
            AzureManagedUDID: CleanedString(managedDevices[i].udid),
            AzureManagedNotes: CleanedString(managedDevices[i].notes),
            AzureManagedEthernetMacAddress: CleanedString(managedDevices[i].ethernetMacAddress),
            // numbers
            AzureManagedPhysicalMemoryInBytes: Number(CleanedString(managedDevices[i].physicalMemoryInBytes)),
            AzureManagedTotalStorageSpaceInBytes: Number(CleanedString(managedDevices[i].totalStorageSpaceInBytes)),
            AzureManagedFreeStorageSpaceInBytes: Number(CleanedString(managedDevices[i].freeStorageSpaceInBytes)),
            // dates
            AzureManagedEnrolledDateTime: CleanedDate(managedDevices[i].enrolledDateTime),
            AzureManagedLastSyncDateTime: CleanedDate(managedDevices[i].lastSyncDateTime),
            AzureManagedEASActivationDateTime: CleanedDate(managedDevices[i].easActivationDateTime),
            AzureManagedExchangeLastSuccessfulSyncDateTime: CleanedDate(managedDevices[i].exchangeLastSuccessfulSyncDateTime),
            AzureManagedComplianceGracePeriodExpirationDateTime: CleanedDate(managedDevices[i].complianceGracePeriodExpirationDateTime),
            AzureManagedManagementCertificateExpirationDateTime: CleanedDate(managedDevices[i].managementCertificateExpirationDateTime),
            // boolean
            AzureManagedIsEASActivated: managedDevices[i].easActivated ? managedDevices[i].easActivated : false,
            AzureManagedIsAzureADRegistered: managedDevices[i].azureADRegistered ? managedDevices[i].azureADRegistered : false,
            AzureManagedIsSupervised: managedDevices[i].isSupervised ? managedDevices[i].isSupervised : false,
            AzureManagedIsEncrypted: managedDevices[i].isEncrypted ? managedDevices[i].isEncrypted : false
          }

          output.push(amd)
        } catch (err) {
          le.AddLogEntry(LogEntryType.Error, `${err}`)
          console.debug(managedDevices[i])
          throw(err)
        }
      }

      le.AddLogEntry(LogEntryType.Info, '.. objects created.')
    } catch(err) {
      le.AddLogEntry(LogEntryType.Error, `${err}`)
    } finally {
      le.logStack.pop()
    }
    
    return new Promise<AzureManagedDevice[]>((resolve) => {resolve(output)})

  }

  

}

export class AzureActiveDirectoryDevice {
  // mandatory
  public readonly DeviceName:string=''
  public readonly AzureDeviceId:string=''
  
  // strings
  public readonly AzureDeviceCategory:string|undefined=undefined
  public readonly AzureDeviceMetadata:string|undefined=undefined
  public readonly AzureDeviceOwnership:string|undefined=undefined
  public readonly AzureDeviceVersion:string|undefined=undefined
  public readonly AzureDomainName:string|undefined=undefined
  public readonly AzureEnrollmentProfileType:string|undefined=undefined
  public readonly AzureEnrollmentType:string|undefined=undefined
  public readonly AzureExternalSourceName:string|undefined=undefined
  public readonly AzureManagementType:string|undefined=undefined
  public readonly AzureManufacturer:string|undefined=undefined
  public readonly AzureMDMAppId:string|undefined=undefined
  public readonly AzureModel:string|undefined=undefined
  public readonly AzureOperatingSystem:string|undefined=undefined
  public readonly AzureOperatingSystemVersion:string|undefined=undefined
  public readonly AzureProfileType:string|undefined=undefined
  public readonly AzureSourceType:string|undefined=undefined
  public readonly AzureTrustType:string|undefined=undefined
  // dates
  public readonly AzureDeletedDateTime:Date|undefined=undefined;
  public readonly AzureApproximateLastSignInDateTime:Date|undefined=undefined;
  public readonly AzureComplianceExpirationDateTime:Date|undefined=undefined;
  public readonly AzureCreatedDateTime:Date|undefined=undefined
  public readonly AzureOnPremisesLastSyncDateTime:Date|undefined=undefined
  public readonly AzureRegistrationDateTime:Date|undefined=undefined
  // booleans
  public readonly AzureOnPremisesSyncEnabled:boolean=false;
  public readonly AzureAccountEnabled:boolean=false;
  public readonly AzureIsCompliant:boolean=false;
  public readonly AzureIsManaged:boolean=false;
  public readonly AzureIsRooted:boolean=false;
}

export class AzureActiveDirectoryEmployee {

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
  public readonly EmployeeHireDate:string|undefined=undefined
  //public readonly UserLeaveDateTime:string|undefined=undefined
  public readonly EmployeeId:string|undefined=undefined
  public readonly EmployeeOrgData:string|undefined=undefined
  public readonly EmployeeType:string|undefined=undefined
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
  public readonly services:EmployeeService[]=[]

  // bit
  public readonly accountEnabled:boolean=false

  // datetime
  public readonly createdDateTime:Date|undefined=undefined
  public readonly deletedDateTime:Date|undefined=undefined
  public readonly lastPasswordChangeDateTime:Date|undefined=undefined
  public readonly lastSignInDateTime?:Date=undefined

}

export class EmployeeService {
  public readonly serviceName?:string = ''
  public readonly servicePlanId?:string = ''
  public readonly assignedDateTime?:Date
  public readonly serviceStatus?:string = ''
}

export class AzureManagedDevice {
  public readonly ObservedByAzureMDM:boolean = true
  public readonly DeviceName: string=''
  public readonly AzureManagedId: string=''
  // strings
  public readonly AzureManagedDeviceName:string|undefined=undefined
  public readonly AzureManagedUserId:string|undefined=undefined
  public readonly AzureManagedDeviceOwnerType:string|undefined=undefined
  public readonly AzureManagedOperatingSystem:string|undefined=undefined
  public readonly AzureManagedComplianceState:string|undefined=undefined
  public readonly AzureManagedJailBroken:string|undefined=undefined
  public readonly AzureManagedManagementAgent:string|undefined=undefined
  public readonly AzureManagedOperatingSystemVersion:string|undefined=undefined
  public readonly AzureManagedEASDeviceID:string|undefined=undefined
  public readonly AzureManagedDeviceEnrollmentType:string|undefined=undefined
  public readonly AzureManagedActivationLockBypassCode:string|undefined=undefined
  public readonly AzureManagedEmailAddress:string|undefined=undefined
  public readonly AzureManagedAzureADDeviceID:string|undefined=undefined
  public readonly AzureManagedDeviceRegistrationState:string|undefined=undefined
  public readonly AzureManagedDeviceCategoryDisplayName:string|undefined=undefined
  public readonly AzureManagedExchangeAccessState:string|undefined=undefined
  public readonly AzureManagedExchangeAccessStateReason:string|undefined=undefined
  public readonly AzureManagedRemoteAssistanceSessionUrl:string|undefined=undefined
  public readonly AzureManagedRemoteAssistanceErrorDetails:string|undefined=undefined
  public readonly AzureManagedUserPrincipalName:string|undefined=undefined
  public readonly AzureManagedModel:string|undefined=undefined
  public readonly AzureManagedManufacturer:string|undefined=undefined
  public readonly AzureManagedIMEI:string|undefined=undefined
  public readonly AzureManagedSerialNumber:string|undefined=undefined
  public readonly AzureManagedPhoneNumber:string|undefined=undefined
  public readonly AzureManagedAndroidSecurityPatchLevel:string|undefined=undefined
  public readonly AzureManagedUserDisplayName:string|undefined=undefined
  public readonly AzureManagedConfigurationManagerClientEnabledFeatures:string|undefined=undefined
  public readonly AzureManagedWiFiMACAddress:string|undefined=undefined
  public readonly AzureManagedDeviceHealthAttestationState:string|undefined=undefined
  public readonly AzureManagedSubscriberCarrier:string|undefined=undefined
  public readonly AzureManagedMEID:string|undefined=undefined
  public readonly AzureManagedPartnerReportedThreatState:string|undefined=undefined
  public readonly AzureManagedRequireUserEnrollmentApproval:string|undefined=undefined
  public readonly AzureManagedICCID:string|undefined=undefined
  public readonly AzureManagedUDID:string|undefined=undefined
  public readonly AzureManagedNotes:string|undefined=undefined
  public readonly AzureManagedEthernetMacAddress:string|undefined=undefined
  // numbers
  public readonly AzureManagedPhysicalMemoryInBytes:number|undefined=0
  public readonly AzureManagedTotalStorageSpaceInBytes:number|undefined=undefined
  public readonly AzureManagedFreeStorageSpaceInBytes:number|undefined=undefined
  // dates
  public readonly AzureManagedEnrolledDateTime:Date|undefined=undefined;
  public readonly AzureManagedLastSyncDateTime:Date|undefined=undefined;
  public readonly AzureManagedEASActivationDateTime:Date|undefined=undefined;
  public readonly AzureManagedExchangeLastSuccessfulSyncDateTime:Date|undefined=undefined;
  public readonly AzureManagedComplianceGracePeriodExpirationDateTime:Date|undefined=undefined;
  public readonly AzureManagedManagementCertificateExpirationDateTime:Date|undefined=undefined;
  // boolean
  public readonly AzureManagedIsEASActivated:boolean=false
  public readonly AzureManagedIsAzureADRegistered:boolean=false
  public readonly AzureManagedIsSupervised:boolean=false
  public readonly AzureManagedIsEncrypted:boolean=false
}