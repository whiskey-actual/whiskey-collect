import { LogEngine } from "whiskey-log"

import { getMaxDateFromObject } from "whiskey-util"

import mssql from 'mssql'
import { DBEngine } from "whiskey-sql"
import { RowUpdate } from "whiskey-sql/lib/components/RowUpdate"
import { ColumnUpdate } from "whiskey-sql/lib/components/ColumnUpdate"
import { ColumnValuePair } from "whiskey-sql/lib/components/columnValuePair"
import { AzureManagedDevice } from "./AzureManagedDevice"

export async function persistMDM(le:LogEngine, db:DBEngine, devices:AzureManagedDevice[]) {
    le.logStack.push('persistMDM')
    
    try {

      // AAD managed devices ..
      le.AddLogEntry(LogEngine.EntryType.Info, 'performing AAD managed device updates ..')
      for(let i=0; i<devices.length; i++) {
        try {

          const mdmLastSeen = getMaxDateFromObject(devices[i], [
            'azureManagedEnrolledDateTime',
            'azureManagedLastSyncDateTime',
            'azureManagedEASActivationDateTime',
            'azureManagedExchangeLastSuccessfulSyncDateTime',
          ])

          const DeviceID:number = await db.getID("Device", [new ColumnValuePair("deviceName", devices[i].deviceName, mssql.VarChar(255))], true)
    
          // update the DeviceActiveDirectory table values ..
          let ruDevice = new RowUpdate(DeviceID)
          ruDevice.updateName=devices[i].deviceName
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMDeviceName", mssql.VarChar(255), devices[i].azureManagedDeviceName))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMUserId", mssql.VarChar(255), devices[i].azureManagedUserId))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMDeviceOwnerType", mssql.VarChar(255), devices[i].azureManagedDeviceOwnerType))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMComplianceState", mssql.VarChar(255), devices[i].azureManagedComplianceState))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMJailBroken", mssql.VarChar(255), devices[i].azureManagedJailBroken))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMManagementAgent", mssql.VarChar(255), devices[i].azureManagedManagementAgent))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMOperatingSystem", mssql.VarChar(255), devices[i].azureManagedOperatingSystem))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMOperatingSystemVersion", mssql.VarChar(255), devices[i].azureManagedOperatingSystemVersion))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMEASDeviceID", mssql.VarChar(255), devices[i].azureManagedEASDeviceID))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMDeviceEnrollmentType", mssql.VarChar(255), devices[i].azureManagedDeviceEnrollmentType))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMActivationLockBypassCode", mssql.VarChar(255), devices[i].azureManagedActivationLockBypassCode))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMEmailAddress", mssql.VarChar(255), devices[i].azureManagedEmailAddress))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMAzureADDeviceID", mssql.VarChar(255), devices[i].azureManagedAzureADDeviceID))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMDeviceRegistrationState", mssql.VarChar(255), devices[i].azureManagedDeviceRegistrationState))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMDeviceCategoryDisplayName", mssql.VarChar(255), devices[i].azureManagedDeviceCategoryDisplayName))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMExchangeAccessState", mssql.VarChar(255), devices[i].azureManagedExchangeAccessState))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMExchangeAccessStateReason", mssql.VarChar(255), devices[i].azureManagedExchangeAccessStateReason))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMRemoteAssistanceSessionUrl", mssql.VarChar(255), devices[i].azureManagedRemoteAssistanceSessionUrl))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMRemoteAssistanceErrorDetails", mssql.VarChar(255), devices[i].azureManagedRemoteAssistanceErrorDetails))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMUserPrincipalName", mssql.VarChar(255), devices[i].azureManagedUserPrincipalName))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMModel", mssql.VarChar(255), devices[i].azureManagedModel))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMManufacturer", mssql.VarChar(255), devices[i].azureManagedManufacturer))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMIMEI", mssql.VarChar(255), devices[i].azureManagedIMEI))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMSerialNumber", mssql.VarChar(255), devices[i].azureManagedSerialNumber))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMPhoneNumber", mssql.VarChar(255), devices[i].azureManagedPhoneNumber))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMAndroidSecurityPatchLevel", mssql.VarChar(255), devices[i].azureManagedAndroidSecurityPatchLevel))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMUserDisplayName", mssql.VarChar(255), devices[i].azureManagedUserDisplayName))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMConfigurationManagerClientEnabledFeatures", mssql.VarChar(255), devices[i].azureManagedConfigurationManagerClientEnabledFeatures))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMWiFiMACAddress", mssql.VarChar(255), devices[i].azureManagedWiFiMACAddress))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMDeviceHealthAttestationState", mssql.VarChar(255), devices[i].azureManagedDeviceHealthAttestationState))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMSubscriberCarrier", mssql.VarChar(255), devices[i].azureManagedSubscriberCarrier))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMMEID", mssql.VarChar(255), devices[i].azureManagedMEID))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMPartnerReportedThreatState", mssql.VarChar(255), devices[i].azureManagedPartnerReportedThreatState))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMRequireUserEnrollmentApproval", mssql.VarChar(255), devices[i].azureManagedRequireUserEnrollmentApproval))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMICCID", mssql.VarChar(255), devices[i].azureManagedICCID))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMUDID", mssql.VarChar(255), devices[i].azureManagedUDID))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMNotes", mssql.VarChar(255), devices[i].azureManagedNotes))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMEthernetMacAddress", mssql.VarChar(255), devices[i].azureManagedEthernetMacAddress))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMPhysicalMemoryInBytes", mssql.BigInt, devices[i].azureManagedPhysicalMemoryInBytes))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMTotalStorageSpaceInBytes", mssql.BigInt, devices[i].azureManagedTotalStorageSpaceInBytes))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMFreeStorageSpaceInBytes", mssql.BigInt, devices[i].azureManagedFreeStorageSpaceInBytes))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMEnrolledDateTime", mssql.DateTime2, devices[i].azureManagedEnrolledDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMLastSyncDateTime", mssql.DateTime2, devices[i].azureManagedLastSyncDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMEASActivationDateTime", mssql.DateTime2, devices[i].azureManagedEASActivationDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMExchangeLastSuccessfulSyncDateTime", mssql.DateTime2, devices[i].azureManagedExchangeLastSuccessfulSyncDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMComplianceGracePeriodExpirationDateTime", mssql.DateTime2, devices[i].azureManagedComplianceGracePeriodExpirationDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMManagementCertificateExpirationDateTime", mssql.DateTime2, devices[i].azureManagedManagementCertificateExpirationDateTime))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMLastSeen", mssql.DateTime2, mdmLastSeen))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMIsEASActivated", mssql.Bit, devices[i].azureManagedIsEASActivated))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMIsAzureADRegistered", mssql.Bit, devices[i].azureManagedIsAzureADRegistered))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMIsSupervised", mssql.Bit, devices[i].azureManagedIsSupervised))
          ruDevice.ColumnUpdates.push(new ColumnUpdate("DeviceAzureMDMIsEncrypted", mssql.Bit, devices[i].azureManagedIsEncrypted))
          await db.updateTable('Device', 'DeviceID', [ruDevice])
        
        }  catch(err) {
          le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          console.debug(devices[i])
          throw(err);
        }

      }
    
    } catch(err) {
      le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
      throw(err);
    } finally {
      le.AddLogEntry(LogEngine.EntryType.Info, 'done')
      le.logStack.pop()
    }

  }

  