// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'

import mssql, { IProcedureResult } from 'mssql'
import { SqlRequestCollection } from './SqlRequestCollection';

export class MicrosoftSql {

    constructor(logEngine:LogEngine, sqlConfig:any, showDetails:boolean=false, showDebug:boolean=false) {
        this._sqlConfig = sqlConfig;
        this._showDetails=showDetails;
        this._showDebug=showDebug;
        this._le = logEngine;
    }
    private _showDetails:boolean=false;
    private _showDebug:boolean=false;
    private _sqlConfig:any=undefined
    private _le:LogEngine = new LogEngine([])

    public async writeToSql(sqlRequestCollection:SqlRequestCollection, logFrequency:number=1000) {
    this._le.logStack.push("writeToSql");
    this._le.AddLogEntry(LogEngine.Severity.Info, `initializing.. `)

    try {

        this._le.AddLogEntry(LogEngine.Severity.Info, `.. connecting to mssql @ ${this._sqlConfig.server} ..`)
        const sqlPool = await mssql.connect(this._sqlConfig)
        this._le.AddLogEntry(LogEngine.Severity.Info, `.. connected; executing ${sqlRequestCollection.sprocName} for ${sqlRequestCollection.sqlRequests.length} items .. `)

        let executionArray:Promise<void|IProcedureResult<any>>[] = []

        for(let i=0; i<sqlRequestCollection.sqlRequests.length; i++) {
            const r = sqlPool.request()
            try {
                r.parameters = sqlRequestCollection.sqlRequests[i].parameters
                r.verbose = true
                executionArray.push(
                    r
                    .execute(sqlRequestCollection.sprocName)
                    .catch((reason:any) =>{
                        this._le.AddLogEntry(LogEngine.Severity.Error, `${reason}`)
                        console.debug(r)
                    })
                )
                //await r.execute(sqlRequestCollection.sprocName)
            } catch(err) {
                this._le.AddLogEntry(LogEngine.Severity.Error, `${err}`)
                console.debug(sqlRequestCollection.sqlRequests[i])
            }
            
        }
        //await Promise.all(executionArray);

        await Utilities.executePromisesWithProgress(this._le, executionArray, logFrequency)

        
        sqlPool.close()
    } catch(err) {
        this._le.AddLogEntry(LogEngine.Severity.Error, `${err}`)
        throw(err)
    } finally {
       this._le.logStack.pop()
    }

     
    }

    

}