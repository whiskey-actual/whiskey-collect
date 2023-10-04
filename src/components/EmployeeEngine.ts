import { LogEngine } from "whiskey-log"
import mssql from 'mssql'
import { DBEngine, ColumnValuePair } from "./DBEngine"


export class Employee {
    public EmailAddress:string|undefined = undefined
    public FullName:string|undefined = undefined
}

export class EmployeeEngine {

    constructor(le:LogEngine, db:DBEngine) {
        this._le=le
        this._db=db
      }
      private _le:LogEngine
      private _db:DBEngine

    public async persist(employee:Employee):Promise<void> {
        this._le.logStack.push("persist")

        try {

            let EmployeeID:number=0
            if(employee.EmailAddress && employee.EmailAddress!='') {
                EmployeeID = await this._db.getID('Employee', [
                    new ColumnValuePair('EmployeeEmailAddress', employee.EmailAddress, mssql.VarChar(255)) // unique
                ])
            }

        } catch(err) {
            this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        } finally {
            this._le.logStack.pop()
        }
        
    }

}