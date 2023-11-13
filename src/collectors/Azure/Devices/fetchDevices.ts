import { LogEngine } from "whiskey-log"
import { CleanedString, CleanedDate } from "whiskey-util"
import { AzureActiveDirectoryDevice } from "./AzureActiveDirectoryDevice"
import { getData } from "../getData"
import { Client } from "@microsoft/microsoft-graph-client"

export async function fetchDevices(le:LogEngine, graphClient:Client):Promise<AzureActiveDirectoryDevice[]> {
    le.logStack.push("fetchDevices")

    let output:AzureActiveDirectoryDevice[] = []

    try {

      le.AddLogEntry(LogEngine.EntryType.Info, `fetching devices ..`)

      const devices = await getData(le, graphClient, '/devices')

      le.AddLogEntry(LogEngine.EntryType.Info, `.. received ${devices.length} devices; creating objects ..`)

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

          output.push(aado)
        } catch (err) {
          le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          console.debug(devices[i])
          throw(err)
        }
      }

      le.AddLogEntry(LogEngine.EntryType.Info, '.. objects created.')
    } catch(err) {
      le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
    } finally {
      le.logStack.pop()
    }
    
    return new Promise<AzureActiveDirectoryDevice[]>((resolve) => {resolve(output)})

  }