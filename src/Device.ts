import { model, Schema } from "mongoose";

export interface Device {
  deviceName: string;
}

export interface ActiveDirectoryDevice {
  // mandatory
  observedByActiveDirectory: boolean,
  deviceName: string,
  activeDirectoryDN: string,
  // strings
  activeDirectoryOperatingSystem: string|undefined,
  activeDirectoryOperatingSystemVersion: string|undefined,
  activeDirectoryDNSHostName: string|undefined,
  // numbers
  activeDirectoryLogonCount: Number,
  // dates
  activeDirectoryWhenCreated: Date|undefined,
  activeDirectoryWhenChanged: Date|undefined,
  activeDirectoryLastLogon: Date|undefined,
  activeDirectoryPwdLastSet: Date|undefined,
  activeDirectoryLastLogonTimestamp: Date|undefined
}

export interface AzureActiveDirectoryDevice {
  // mandatory
  observedByAzureActiveDirectory: boolean,
  deviceName: string,
  azureDeviceId: string;
  
  //strings
  azureDisplayName: string|undefined,
  azureId: string|undefined;
  azureDeviceCategory: string|undefined;
  azureDeviceMetadata: string|undefined;
  azureDeviceOwnership: string|undefined;
  azureDeviceVersion: string|undefined;
  azureDomainName: string|undefined;
  azureEnrollmentProfileType: string|undefined;
  azureEnrollmentType: string|undefined;
  azureExternalSourceName: string|undefined;
  azureManagementType: string|undefined;
  azureManufacturer: string|undefined;
  azureMDMAppId: string|undefined;
  azureModel: string|undefined;
  azureOperatingSystem: string|undefined;
  azureOperatingSystemVersion: string|undefined;
  azureProfileType: string|undefined;
  azureSourceType: string|undefined;
  azureTrustType: string|undefined;
  // dates
  azureDeletedDateTime: Date|undefined;
  azureApproximateLastSignInDateTime: Date|undefined;
  azureComplianceExpirationDateTime: Date|undefined;
  azureCreatedDateTime: Date|undefined;
  azureOnPremisesLastSyncDateTime: Date|undefined;
  azureRegistrationDateTime: Date|undefined;
  // booleans
  azureOnPremisesSyncEnabled: boolean;
  azureAccountEnabled: boolean;
  azureIsCompliant: boolean;
  azureIsManaged: boolean;
  azureIsRooted: boolean;
}

export interface AzureManagedDevice {

  // mandatory
  observedByAzureMDM: boolean;
  deviceName: string,
  azureManagedId: string;
  
  // strings
  azureManagedDeviceName: string|undefined;
  azureManagedUserId: string|undefined;
  azureManagedDeviceOwnerType: string|undefined;
  azureManagedOperatingSystem: string|undefined;
  azureManagedComplianceState: string|undefined;
  azureManagedJailBroken: string|undefined;
  azureManagedManagementAgent: string|undefined;
  azureManagedOperatingSystemVersion: string|undefined;
  azureManagedEASDeviceID: string|undefined;
  azureManagedDeviceEnrollmentType: string|undefined;
  azureManagedActivationLockBypassCode: string|undefined;
  azureManagedEmailAddress: string|undefined;
  azureManagedAzureADDeviceID: string|undefined;
  azureManagedDeviceRegistrationState: string|undefined;
  azureManagedDeviceCategoryDisplayName: string|undefined;
  azureManagedExchangeAccessState: string|undefined;
  azureManagedExchangeAccessStateReason: string|undefined;
  azureManagedRemoteAssistanceSessionUrl: string|undefined;
  azureManagedRemoteAssistanceErrorDetails: string|undefined;
  azureManagedUserPrincipalName: string|undefined;
  azureManagedModel: string|undefined;
  azureManagedManufacturer: string|undefined;
  azureManagedIMEI: string|undefined;
  azureManagedSerialNumber: string|undefined;
  azureManagedPhoneNumber: string|undefined;
  azureManagedAndroidSecurityPatchLevel: string|undefined;
  azureManagedUserDisplayName: string|undefined;
  azureManagedConfigurationManagerClientEnabedFeatures: string|undefined;
  azureManagedWiFiMACAddress: string|undefined;
  azureManagedDeviceHealthAttestationState: string|undefined;
  azureManagedSubscriberCarrier: string|undefined;
  azureManagedMEID: string|undefined;
  azureManagedTotalStorageSpaceInBytes: string|undefined;
  azureManagedFreeStorageSpaceInBytes: string|undefined;
  azureManagedPartnerReportedThreatState: string|undefined;
  azureManagedRequireUserEnrollmentApproval: string|undefined;
  azureManagedICCID: string|undefined;
  azureManagedUDID: string|undefined;
  azureManagedNotes: string|undefined;
  azureManagedEthernetMacAddress: string|undefined;
  azureManagedPhysicalMemoryInBytes: string|undefined;
  // dates
  azureManagedEnrolledDateTime: Date|undefined;
  azureManagedLastSyncDateTime: Date|undefined;
  azureManagedEASActivationDateTime: Date|undefined;
  azureManagedExchangeLastSuccessfulSyncDateTime: Date|undefined;
  azureManagedComplianceGracePeriodExpirationDateTime: Date|undefined;
  azureManagedManagementCertificateExpirationDateTime: Date|undefined;
  // azure managed - boolean
  azureManagedIsEASActivated: boolean;
  azureManagedIsAzureADRegistered: boolean;
  azureManagedIsSupervised: boolean;
  azureManagedIsEncrypted: boolean;

}

export interface ConnectwiseDevice {

  // strings
  deviceName: string,
  connectwiseId: string;
  connectwiseLocation: string;
  connectwiseClient: string;
  connectwiseOperatingSystem: string;
  connectwiseOperatingSystemVersion: string;
  connectwiseDomainName: string;
  connectwiseAgentVersion: string;
  connectwiseComment: string;
  connectwiseIpAddress: string;
  connectwiseMacAddress: string;
  connectwiseLastUserName: string;
  connectwiseType: string;
  connectwiseStatus: string;
  connectwiseSerialNumber: string;
  connectwiseBiosManufacturer: string;
  connectwiseModel: string;
  connectwiseDescription: string;
  // numbers
  connectwiseTotalMemory: Number;
  connectwiseFreeMemory: Number;
  //dates
  connectwiseLastObserved: Date;
  connectwiseFirstSeen: Date;
  connectwiseWindowsUpdateDate: Date;
  connectwiseAntivirusDefinitionDate: Date;
  // booleans
  observedByConnectwise: Boolean;

}

export interface CrowdstrikeDevice {
    // strings
    deviceName: string;
    crowdstrikeDeviceId: string;
    crowdstrikeCID: string;
    crowdstrikeAgentVersion: string;
    crowdstrikeBIOSManufacturer: string;
    crowdstrikeBIOSVersion: string;
    crowdstrikeExternalIP: string;
    crowdstrikeMACAddress: string;
    crowdstrikeLocalIP: string;
    crowdstrikeMachineDomain: string;
    crowdstrikeMajorVersion: string;
    crowdstrikeMinorVersion: string;
    crowdstrikeOSVersion: string;
    crowdstrikeOSBuild: string;
    crowdstrikePlatformName: string;
    crowdstrikeReducedFunctionalityMode: string;
    crowdstrikeProductTypeDesc: string;
    crowdstrikeProvisionStatus: string;
    crowdstrikeSerialNumber: string;
    crowdstrikeServicePackMajor: string;
    crowdstrikeServicePackMinor: string;
    crowdstrikeStatus: string;
    crowdstrikeSystemManufacturer: string;
    crowdstrikeSystemProductName: string;
    crowdstrikeKernelVersion: string;
    // crowdstrike - datetime
    crowdstrikeFirstSeenDateTime: Date;
    crowdstrikeLastSeenDateTime: Date;
    crowdstrikeModifiedDateTime: Date;
    // crowdstrike - boolean
    observedByCrowdstrike: boolean;
}

export const DeviceSchema = new Schema({
  deviceName: {type:String, required:true, index:true, id: true, unique: true},
  deviceFirstObserved: {type:Date, default:new Date()},
  deviceLastObserved: {type:Date, default:new Date(), required:true },
  deviceIsActive: {type:Boolean, default:false, required:true, index:true, },
  deviceOperatingSystem: {type:String, required:true, index:true, default: 'UNKNOWN'},
  deviceType: {type:String, required:true, index:true, default: 'UNKNOWN'},

  // active directory
  activeDirectoryDN: {type:String},
  activeDirectoryLogonCount: {type:Number, default:0},
  activeDirectoryOperatingSystem: {type:String},
  activeDirectoryOperatingSystemVersion: {type:String},
  activeDirectoryDNSHostName: {type:String},
  // active directory - dates
  activeDirectoryWhenCreated: {type:Date},
  activeDirectoryWhenChanged: {type:Date},
  activeDirectoryLastLogon: {type:Date},
  activeDirectoryPwdLastSet: {type:Date},
  activeDirectoryLastLogonTimestamp: {type:Date},

  // azure
  azureDisplayName: {type:String},
  azureId: {type:String},
  azureDeviceCategory: {type:String},
  azureDeviceId: {type:String},
  azureDeviceMetadata: {type:String},
  azureDeviceOwnership: {type:String},
  azureDeviceVersion: {type:String},
  azureDomainName: {type:String},
  azureEnrollmentProfileType: {type:String},
  azureEnrollmentType: {type:String},
  azureExternalSourceName: {type:String},
  azureManagementType: {type:String},
  azureManufacturer: {type:String},
  azureMDMAppId: {type:String},
  azureModel: {type:String},
  
  azureOperatingSystem: {type:String},
  azureOperatingSystemVersion: {type:String},
  azureProfileType: {type:String},
  azureSourceType: {type:String},
  azureTrustType: {type:String},
  // azure - dates
  azureDeletedDateTime: {type:Date},
  azureApproximateLastSignInDateTime: {type:Date},
  azureComplianceExpirationDateTime: {type:Date},
  azureCreatedDateTime: {type:Date},
  azureOnPremisesLastSyncDateTime: {type:Date},
  azureRegistrationDateTime: {type:Date},
  // azure - booleans
  azureOnPremisesSyncEnabled: {type:Boolean, default:false},
  azureAccountEnabled: {type:Boolean, default:false},
  azureIsCompliant: {type:Boolean, default:false},
  azureIsManaged: {type:Boolean, default:false},
  azureIsRooted: {type:Boolean, default:false},

  // azure managed
  azureManagedDeviceName: {type:String},
  azureManagedManagedDeviceName: {type:String},
  azureManagedId: {type:String},
  azureManagedUserId: {type:String},
  azureManagedManagedDeviceOwnerType: {type:String},
  azureManagedOperatingSystem: {type:String},
  azureManagedComplianceState: {type:String},
  azureManagedJailBroken: {type:String},
  azureManagedManagementAgent: {type:String},
  azureManagedOperatingSystemVersion: {type:String},
  azureManagedEASDeviceID: {type:String},
  azureManagedDeviceEnrollmentType: {type:String},
  azureManagedActivationLockBypassCode: {type:String},
  azureManagedEmailAddress: {type:String},
  azureManagedAzureADDeviceID: {type:String},
  azureManagedDeviceRegistrationState: {type:String},
  azureManagedDeviceCategoryDisplayName: {type:String},
  azureManagedExchangeAccessState: {type:String},
  azureManagedExchangeAccessStateReason: {type:String},
  azureManagedRemoteAssistanceSessionUrl: {type:String},
  azureManagedRemoteAssistanceErrorDetails: {type:String},
  azureManagedUserPrincipalName: {type:String},
  azureManagedModel: {type:String},
  azureManagedManufacturer: {type:String},
  azureManagedIMEI: {type:String},
  azureManagedSerialNumber: {type:String},
  azureManagedPhoneNumber: {type:String},
  azureManagedAndroidSecurityPatchLevel: {type:String},
  azureManagedUserDisplayName: {type:String},
  azureManagedConfigurationManagerClientEnabedFeatures: {type:String},
  azureManagedWiFiMACAddress: {type:String},
  azureManagedDeviceHealthAttestationState: {type:String},
  azureManagedSubscriberCarrier: {type:String},
  azureManagedMEID: {type:String},
  azureManagedTotalStorageSpaceInBytes: {type:String},
  azureManagedFreeStorageSpaceInBytes: {type:String},
  azureManagedPartnerReportedThreatState: {type:String},
  azureManagedRequireUserEnrollmentApproval: {type:String},
  azureManagedICCID: {type:String},
  azureManagedUDID: {type:String},
  azureManagedNotes: {type:String},
  azureManagedEthernetMacAddress: {type:String},
  azureManagedPhysicalMemoryInBytes: {type:String},
  // azure managed - dates
  azureManagedEnrolledDateTime: {type:Date},
  azureManagedLastSyncDateTime: {type:Date},
  azureManagedEASActivationDateTime: {type:Date},
  azureManagedExchangeLastSuccessfulSyncDateTime: {type:Date},
  azureManagedComplianceGracePeriodExpirationDateTime: {type:Date},
  azureManagedManagementCertificateExpirationDateTime: {type:Date},
  // azure managed - boolean
  observedByAzureMDM: {type:Boolean, default:false, required:true, index:true},
  azureManagedIsEASActivated: {type:Boolean, default:false},
  azureManagedIsAzureADRegistered: {type:Boolean, default:false},
  azureManagedIsSupervised: {type:Boolean, default:false},
  azureManagedIsEncrypted: {type:Boolean, default:false},


  // connectwise -- user device
  connectwiseId: {type:String},
  connectwiseLocation: {type:String},
  connectwiseClient: {type:String},
  connectwiseOperatingSystem: {type:String},
  connectwiseOperatingSystemVersion: {type:String},
  connectwiseDomainName: {type:String},
  connectwiseAgentVersion: {type:String},
  connectwiseComment: {type:String},
  connectwiseIpAddress: {type:String},
  connectwiseMacAddress: {type:String},
  connectwiseLastUserName: {type:String},
  connectwiseType: {type:String},
  connectwiseStatus: {type:String},
  connectwiseSerialNumber: {type:String},
  connectwiseBiosManufacturer: {type:String},
  connectwiseModel: {type:String},
  connectwiseDescription: {type:String},
  connectwiseTotalMemory: {type:Number, default:0},
  connectwiseFreeMemory: {type:Number, default:0},
  connectwiseLastObserved: {type:Date},
  connectwiseFirstSeen: {type:Date},
  connectwiseWindowsUpdateDate: {type:Date},
  connectwiseAntivirusDefinitionDate: {type:Date},
  observedByConnectwise: {type:Boolean, default:false, required:true, index:true},

  // crowdstrike
  crowdstrikeDeviceId: {type:String},
  crowdstrikeCID: {type:String},
  crowdstrikeAgentVersion: {type:String},
  crowdstrikeBIOSManufacturer: {type:String},
  crowdstrikeBIOSVersion: {type:String},
  crowdstrikeExternalIP: {type:String},
  crowdstrikeMACAddress: {type:String},
  crowdstrikeLocalIP: {type:String},
  crowdstrikeMachineDomain: {type:String},
  crowdstrikeMajorVersion: {type:String},
  crowdstrikeMinorVersion: {type:String},
  crowdstrikeOSVersion: {type:String},
  crowdstrikeOSBuild: {type:String},
  crowdstrikePlatformName: {type:String},
  crowdstrikeReducedFunctionalityMode: {type:String},
  crowdstrikeProductTypeDesc: {type:String},
  crowdstrikeProvisionStatus: {type:String},
  crowdstrikeSerialNumber: {type:String},
  crowdstrikeServicePackMajor: {type:String},
  crowdstrikeServicePackMinor: {type:String},
  crowdstrikeStatus: {type:String},
  crowdstrikeSystemManufacturer: {type:String},
  crowdstrikeSystemProductName: {type:String},
  crowdstrikeKernelVersion: {type:String},
  // crowdstrike - datetime
  crowdstrikeFirstSeenDateTime: {type:Date},
  crowdstrikeLastSeenDateTime: {type:Date},
  crowdstrikeModifiedDateTime: {type:Date},
  // crowdstrike - boolean
  observedByCrowdstrike: {type:Boolean, default: false, required:true, index:true},

}, {
  collection: 'devices',
  timestamps: true,
  autoCreate: true,
})


// Virtuals
// DeviceSchema.virtual("type").get(function(this: Device) {
//   //return this.deviceType
// })

// Methods
// DeviceSchema.methods.getOperatingSystem = function(this: Device) {
//   //return this.operatingSystem
// }

// Document middlewares
// DeviceSchema.pre<Device>("save", function(next) {

//   // prune objects
//   // if(!this.observedByActiveDirectory) {delete this.observedByActiveDirectory}
//   // if(!this.observedByAzure) {delete this.observedByAzure}
//   // if(!this.observedByAzureMDM) {delete this.observedByAzureMDM}
//   // if(!this.observedByCrowdstrike) {delete this.observedByCrowdstrike}

// });

export default model('Device', DeviceSchema)
