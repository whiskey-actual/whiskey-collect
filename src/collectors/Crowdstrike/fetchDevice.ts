import { AxiosInstance } from "axios";
import { LogEngine } from "whiskey-log";
import { CrowdstrikeDevice } from "./CrowdstrikeDevice";

import { CleanedString, CleanedDate } from "whiskey-util";

export async function fetchDevice(le:LogEngine, axiosInstance:AxiosInstance, deviceId:string):Promise<CrowdstrikeDevice> {
    le.logStack.push('fetchDevice')

    let output:CrowdstrikeDevice

    try {

          const response = await axiosInstance.get(`/devices/entities/devices/v1?ids=${deviceId}`)
          const deviceDetails = response.data.resources[0];
          
          output = {
            // mandatory
            observedByCrowdstrike: true,
            deviceName: deviceDetails.hostname.toString().trim(),
            crowdstrikeDeviceId: deviceDetails.device_id.toString().trim(),
            // strings
            crowdstrikeCID: CleanedString(deviceDetails.cid),
            crowdstrikeAgentVersion: CleanedString(deviceDetails.agent_version),
            crowdstrikeBIOSManufacturer: CleanedString(deviceDetails.bios_manufacturer),
            crowdstrikeBIOSVersion: CleanedString(deviceDetails.bios_version),
            crowdstrikeExternalIP: CleanedString(deviceDetails.external_ip),
            crowdstrikeMACAddress: CleanedString(deviceDetails.mac_address),
            crowdstrikeLocalIP: CleanedString(deviceDetails.local_ip),
            crowdstrikeMachineDomain: CleanedString(deviceDetails.machine_domain),
            crowdstrikeMajorVersion: CleanedString(deviceDetails.major_version),
            crowdstrikeMinorVersion: CleanedString(deviceDetails.minor_version),
            crowdstrikeOSBuild: CleanedString(deviceDetails.os_build),
            crowdstrikeOSVersion: CleanedString(deviceDetails.os_version),
            crowdstrikePlatformName: CleanedString(deviceDetails.platform_name),
            crowdstrikeReducedFunctionalityMode: CleanedString(deviceDetails.reduced_functionality_mode),
            crowdstrikeProductTypeDesc: CleanedString(deviceDetails.product_type_desc),
            crowdstrikeProvisionStatus: CleanedString(deviceDetails.provision_status),
            crowdstrikeSerialNumber: CleanedString(deviceDetails.serial_number),
            crowdstrikeServicePackMajor: CleanedString(deviceDetails.service_pack_major),
            crowdstrikeServicePackMinor: CleanedString(deviceDetails.service_pack_minor),
            crowdstrikeStatus: CleanedString(deviceDetails.status),
            crowdstrikeSystemManufacturer: CleanedString(deviceDetails.system_manufacturer),
            crowdstrikeSystemProductName: CleanedString(deviceDetails.system_product_name),
            crowdstrikeKernelVersion: CleanedString(deviceDetails.kernel_version),
            // datetimes
            crowdstrikeFirstSeenDateTime: CleanedDate(deviceDetails.first_seen),
            crowdstrikeLastSeenDateTime: CleanedDate(deviceDetails.last_seen),
            crowdstrikeModifiedDateTime: CleanedDate(deviceDetails.modified_timestamp)
          }

    } catch(err) {
      le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
      throw(err)
    } finally {
      le.logStack.pop()
    }
    
    return new Promise<CrowdstrikeDevice>((resolve) => {resolve(output)})
  }