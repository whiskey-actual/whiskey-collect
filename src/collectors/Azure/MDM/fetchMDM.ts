import { LogEngine } from "whiskey-log"
import { CleanedString, CleanedDate } from "whiskey-util"
import { Client } from "@microsoft/microsoft-graph-client"
import { getData } from "../getData"
import { AzureManagedDevice } from "./AzureManagedDevice"

export async function fetchMDM(le:LogEngine, graphClient:Client):Promise<AzureManagedDevice[]> {
    le.logStack.push("fetchMDM")

    let output:AzureManagedDevice[] = []

    try {

      le.AddLogEntry(LogEngine.EntryType.Info, `fetching managed devices ..`)

      const managedDevices = await getData(le, graphClient, '/deviceManagement/managedDevices')

      le.AddLogEntry(LogEngine.EntryType.Info, `.. received ${managedDevices.length} devices; creating objects ..`)

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

          output.push(amd)
        } catch (err) {
          le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          console.debug(managedDevices[i])
          throw(err)
        }
      }

      le.AddLogEntry(LogEngine.EntryType.Info, '.. objects created.')
    } catch(err) {
      le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
    } finally {
      le.logStack.pop()
    }
    
    return new Promise<AzureManagedDevice[]>((resolve) => {resolve(output)})

  }