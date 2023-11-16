import { AxiosInstance } from "axios";
import { LogEngine } from "whiskey-log";
import { CrowdstrikeDevice } from "./CrowdstrikeDevice";

import { getProgressMessage } from "whiskey-util";

import { fetchDevice } from "./fetchDevice";

export async function fetchDevices(le:LogEngine, axiosInstance:AxiosInstance):Promise<CrowdstrikeDevice[]> {
    le.logStack.push('fetch')

    let output:CrowdstrikeDevice[] = []

    try {


      const foundDevices = (await axiosInstance.get("/devices/queries/devices-scroll/v1?limit=5000")).data.resources;

      le.AddLogEntry(LogEngine.EntryType.Info, `.. found ${foundDevices.length} devices; fetching details ..`)

      const startDate = new Date()
      const logUpdateInterval:number=250

      for(let i=0; i<foundDevices.length; i++) {

        try {
            const deviceObject = await fetchDevice(le, axiosInstance, foundDevices[i])
            output.push(deviceObject)

            if(i>0 && i%logUpdateInterval===0) {
                le.AddLogEntry(LogEngine.EntryType.Info, getProgressMessage('', 'retrieved', i, foundDevices.length, startDate, new Date()))
            }

        } catch (err) {
          le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          throw(err)
        }
      }
  
      le.AddLogEntry(LogEngine.EntryType.Info, '.. objects created.')

    } catch(err) {
      le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
      throw(err)
    } finally {
      le.logStack.pop()
    }
    
    return new Promise<CrowdstrikeDevice[]>((resolve) => {resolve(output)})
  }