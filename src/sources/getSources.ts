import { IRecordSet } from "mssql";
import { LogEngine } from "whiskey-log";
import { DBEngine } from "whiskey-sql";

export async function getSources(le:LogEngine, db:DBEngine):Promise<IRecordSet<any>> {
    le.logStack.push("getSources")
    let output:IRecordSet<any>
    try {
        output = await db.selectColumns("Source", ["SourceID", "SourceURI", "SourceCredential", "SourceAuthentication"], [])
    } catch(err) {
        le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
        throw(err);
    } finally {
        le.logStack.pop()
    }
    return new Promise<IRecordSet<any>>((resolve) => {resolve(output)})     
}