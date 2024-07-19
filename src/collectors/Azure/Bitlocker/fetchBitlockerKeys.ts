import { LogEngine } from "whiskey-log"
import { CleanedString, CleanedDate } from "whiskey-util"
import { Client } from "@microsoft/microsoft-graph-client"
import { callAPI } from "../callAPI"
import { BitlockerKey } from "./BitlockerKey"

export async function fetchBitlockerKeys(le:LogEngine, graphClient:Client):Promise<BitlockerKey[]> {
    le.logStack.push("fetchBitlockerKeys")

    let output:BitlockerKey[] = []

    try {

      le.AddLogEntry(LogEngine.EntryType.Info, `fetching bitlocker keys ..`)

      const keys = await callAPI(le, graphClient, '/informationProtection/bitlocker/recoveryKeys')

      le.AddLogEntry(LogEngine.EntryType.Info, `.. received ${keys.length} bitlocker keys; creating objects ..`)

      for(let i=0; i<keys.length; i++) {

        try {

          // get the key
          const key = await callAPI(le, graphClient, '/informationProtection/bitlocker/recoveryKeys/' + keys[i].id + '?$select=key')
          

          const bk:BitlockerKey = {
            id: CleanedString(keys[i].id),
            createdDateTime: CleanedDate(keys[i].createdDateTime),
            deviceId: CleanedString(keys[i].deviceId),
            volumeType: CleanedString(keys[i].volumeType),
            key: CleanedString(key.key)
          }
          output.push(bk)
        } catch (err) {
          le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          console.debug(keys[i])
          throw(err)
        }
      }

      le.AddLogEntry(LogEngine.EntryType.Info, '.. objects created.')
    } catch(err) {
      le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
    } finally {
      le.logStack.pop()
    }
    
    return new Promise<BitlockerKey[]>((resolve) => {resolve(output)})

  }