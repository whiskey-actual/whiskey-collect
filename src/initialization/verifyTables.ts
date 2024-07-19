import { LogEngine } from "whiskey-log"
import { Source } from './tables/Source';
import { Employee } from './tables/Employee';
import { License } from './tables/License';
import { EmployeeLicense } from './tables/EmployeeLicense';
import { Device } from './tables/Device';
import { DBEngine } from "whiskey-sql";
import { BitlockerKeys } from "./tables/BitlockerKeys";

export async function verifyTables(le:LogEngine, db:DBEngine):Promise<void> {
    le.logStack.push('verifyTables')

    try {
      await db.createTable('Source', Source())
      await db.createTable('Device', Device())
      await db.createTable('BitlockerKeys', BitlockerKeys())
      await db.createTable('Employee', Employee())
      await db.createTable('License', License())
      await db.createTable('EmployeeLicense', EmployeeLicense())
    } catch (ex) {
      le.AddLogEntry(LogEngine.EntryType.Error, `${ex}`)
      throw ex;
    } finally {
      //le.AddLogEntry(LogEngine.EntryType.Success, 'done.')
      le.logStack.pop()
    }
    
    return new Promise<void>((resolve) => {resolve()})

  }