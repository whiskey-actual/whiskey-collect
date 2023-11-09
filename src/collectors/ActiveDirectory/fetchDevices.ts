import { LogEngine } from "whiskey-log";
import { CleanedString } from "whiskey-util";
import { ldapTimestampToJS } from "whiskey-util";
import { ActiveDirectoryDevice } from "./ActiveDirectoryDevice";
import { Client } from 'ldapts'

export async function fetchDevices(le:LogEngine, searchDN:string, ldapClient:Client, isPaged:boolean=true, sizeLimit:number=500):Promise<ActiveDirectoryDevice[]> {
  le.logStack.push("fetchDevices")

  let output:ActiveDirectoryDevice[] = []
  try {
        le.AddLogEntry(LogEngine.EntryType.Info, '.. querying devices ..')
        const { searchEntries } = await ldapClient.search(searchDN,  {filter: '&(objectClass=computer)', paged: isPaged, sizeLimit: sizeLimit},);
        le.AddLogEntry(LogEngine.EntryType.Info, `.. found ${searchEntries.length} devices .. `)
        
        le.AddLogEntry(LogEngine.EntryType.Info, `.. creating objects ..`)
        for(let i=0; i<searchEntries.length; i++) {
          try {
            const add:ActiveDirectoryDevice = {
              deviceDN: searchEntries[i].dn.toString().trim(),
              deviceName: searchEntries[i].cn.toString().trim(),
              activeDirectoryOperatingSystem: CleanedString(searchEntries[i].operatingSystem),
              activeDirectoryOperatingSystemVersion: CleanedString(searchEntries[i].operatingSystemVersion),
              activeDirectoryDNSHostName: CleanedString(searchEntries[i].dNSHostName),
              activeDirectoryLogonCount: isNaN(Number(searchEntries[i].logonCount)) ? 0 : Number(searchEntries[i].logonCount),
              activeDirectoryWhenCreated: ldapTimestampToJS(searchEntries[i].whenCreated.toString()),
              activeDirectoryWhenChanged: searchEntries[i].whenChanged ? ldapTimestampToJS(searchEntries[i].whenChanged.toString()) : undefined,
              activeDirectoryLastLogon: searchEntries[i].lastLogon ? ldapTimestampToJS(searchEntries[i].lastLogon.toString()) : undefined,
              activeDirectoryPwdLastSet: searchEntries[i].pwdLastSet ? ldapTimestampToJS(searchEntries[i].pwdLastSet.toString()) : undefined,
              activeDirectoryLastLogonTimestamp: searchEntries[i].lastLogonTimestamp ? ldapTimestampToJS(searchEntries[i].lastLogonTimestamp.toString()) : undefined
            }
            output.push(add)
          } catch (err) {
            le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          }  
        }
        le.AddLogEntry(LogEngine.EntryType.Info, `.. ${output.length } objects created.`)
  } catch(err) {
    le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
    throw(err);
  } finally {
    le.logStack.pop()
  }

  return new Promise<ActiveDirectoryDevice[]>((resolve) => {resolve(output)})

}