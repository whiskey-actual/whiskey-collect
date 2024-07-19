import { LogEngine } from "whiskey-log"

import { getMaxDateFromObject } from "whiskey-util"

import mssql from 'mssql'
import { DBEngine } from "whiskey-sql"
import { RowUpdate } from "whiskey-sql/lib/components/RowUpdate"
import { ColumnUpdate } from "whiskey-sql/lib/components/ColumnUpdate"
import { ColumnValuePair } from "whiskey-sql/lib/components/columnValuePair"
import { BitlockerKey } from "./BitlockerKey"
import { TableUpdate } from "whiskey-sql/lib/components/TableUpdate"

export async function BuildBitlockerUpdates(le:LogEngine, db:DBEngine, keys:BitlockerKey[]):Promise<TableUpdate[]> {
    le.logStack.push('BuildBitlockerUpdates')
    let output:TableUpdate[] = []

    try {

      const tu:TableUpdate = new TableUpdate('BitlockerKeys', 'BitlockerKeyID')

      // keys ..
      le.AddLogEntry(LogEngine.EntryType.Info, `.. building ${keys.length} updates for Bitlocker keys .. `)
      for(let i=0; i<keys.length; i++) {
        
        try {


          const BitlockerKeyID:number = await db.getID("BitlockerKeys", [new ColumnValuePair("BitlockerKeyId", keys[i].id, mssql.VarChar(255))], true)
    
          // update the DeviceActiveDirectory table values ..
          let ruBitlockerKey = new RowUpdate(BitlockerKeyID)
          ruBitlockerKey.updateName=(keys[i].id||"key update")
          ruBitlockerKey.ColumnUpdates.push(new ColumnUpdate("BitlockerKeyID", mssql.VarChar(255), keys[i].id))
          ruBitlockerKey.ColumnUpdates.push(new ColumnUpdate("DeviceID", mssql.VarChar(255), keys[i].deviceId))
          ruBitlockerKey.ColumnUpdates.push(new ColumnUpdate("BitlockerDeviceKey", mssql.VarChar(255), keys[i].key))
          tu.RowUpdates.push(ruBitlockerKey)
        } catch(err) {
          le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
          throw(err);
        }
      }

      output.push(tu)
    
    } catch(err) {
      le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
      throw(err);
    } finally {
      le.AddLogEntry(LogEngine.EntryType.Info, 'done')
      le.logStack.pop()
    }

    return new Promise<TableUpdate[]>((resolve) => {output})

  }

  