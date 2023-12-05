import { LogEngine } from "whiskey-log";
import { DBEngine } from "whiskey-sql";
import { RowUpdate } from "whiskey-sql/lib/components/RowUpdate";
import { ColumnValuePair } from "whiskey-sql/lib/components/columnValuePair";

import { Security } from '../security'

import mssql from 'mssql'
import { ColumnUpdate } from "whiskey-sql/lib/components/ColumnUpdate";
import { TableUpdate } from "whiskey-sql/lib/components/TableUpdate";

export async function addSource(le:LogEngine, db:DBEngine, encryptionKey:string, initializationVector:string, name:string, URI:string, credential:string, authentication:string, parameter?:string, port?:number) {
    
    le.logStack.push("addSource")
    
    try {
        credential = Security.encrypt(le, credential, encryptionKey, initializationVector)
        const SourceID:number = await db.getID('Source', [new ColumnValuePair('SourceDescription', name, mssql.VarChar(255))], true)
        const tu = new TableUpdate('Source', 'SourceID')
        const ru = new RowUpdate(SourceID)
        ru.updateName = name
        ru.ColumnUpdates.push(new ColumnUpdate("SourceURI", mssql.VarChar(255), URI))
        ru.ColumnUpdates.push(new ColumnUpdate("SourceCredential", mssql.VarChar(255), credential))
        ru.ColumnUpdates.push(new ColumnUpdate("SourceAuthentication", mssql.VarChar(255), authentication))
        ru.ColumnUpdates.push(new ColumnUpdate("SourceParameter", mssql.VarChar(255), parameter))
        ru.ColumnUpdates.push(new ColumnUpdate("SourcePort" , mssql.Int, port))
        tu.RowUpdates.push(ru)
        await db.PerformTableUpdates([tu])
    } catch(err) {
        le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
        throw(err);
    } finally {
        le.logStack.pop()
    }


}