// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'

import mssql, { IProcedureResult, query } from 'mssql'
import { SqlRequestCollection } from './SqlRequestCollection';

export class MicrosoftSql {

    constructor(logEngine:LogEngine, sqlConfig:any) {
        this._le = logEngine;
        this._sqlPool = new mssql.ConnectionPool(sqlConfig)
    }
    private _sqlPool:mssql.ConnectionPool = new mssql.ConnectionPool('')
    private _le:LogEngine = new LogEngine([])

    public async writeToSql(sqlRequestCollection:SqlRequestCollection, logFrequency:number=1000) {
        this._le.logStack.push("writeToSql");
        this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `initializing.. `)

        try {

            this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `.. connecting to mssql ..`)
            await this._sqlPool.connect()
            this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. connected; executing ${sqlRequestCollection.sprocName} for ${sqlRequestCollection.sqlRequests.length} items .. `)

            let executionArray:Promise<void|IProcedureResult<any>>[] = []

            for(let i=0; i<sqlRequestCollection.sqlRequests.length; i++) {
                const r = this._sqlPool.request()
                try {
                    r.parameters = sqlRequestCollection.sqlRequests[i].parameters
                    r.verbose = true
                    executionArray.push(
                        r
                        .execute(sqlRequestCollection.sprocName)
                        .catch((reason:any) =>{
                            this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${reason}`)
                            console.debug(r)
                        })
                    )
                    //await r.execute(sqlRequestCollection.sprocName)
                } catch(err) {
                    this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
                    console.debug(sqlRequestCollection.sqlRequests[i])
                }
                
            }
            //await Promise.all(executionArray);

            await Utilities.executePromisesWithProgress(this._le, executionArray, logFrequency)

        } catch(err) {
            this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err)
        } finally {
            this._sqlPool.close()
            this._le.logStack.pop()
        }
    }

    public async getID(objectName:string, keyValue:string, keyField:string=''):Promise<number> {
        this._le.logStack.push("getID");
        this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `initializing.. `)
        let output:number=0

        try {
            this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `.. connecting to mssql ..`)
            await this._sqlPool.connect()
            this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. connected; getting ID for ${objectName}.. `)

            const queryText:string = `SELECT ${objectName}ID FROM ${objectName} WHERE ${keyField ? keyField : objectName+'Description'} ="${keyValue}"`
            this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, queryText)

            
            const q = await this._sqlPool.query(`SELECT ${objectName}ID FROM ${objectName} WHERE ${keyField ? keyField : objectName+'Description'} ="${keyValue}"`)

            if(q.recordset.length!==0) {
                output = q.recordset[0][objectName+'ID']
            }
            this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `.. got ID: ${output}`)            
        } catch(err) {
            this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err)
        } finally {
            this._sqlPool.close()
            this._le.logStack.pop()
        }

        return new Promise<number>((resolve) => {resolve(output)})
    }

    

}