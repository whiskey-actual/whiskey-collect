// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'

import mssql, { IProcedureResult, IResult } from 'mssql'

export class DBEngine {

    constructor(logEngine:LogEngine, sqlConfig:any) {
        this._le = logEngine;
        this._sqlPool = new mssql.ConnectionPool(sqlConfig)
        this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `initialized; don't forget to call connect()!`)
        
    }
    private _sqlPool:mssql.ConnectionPool = new mssql.ConnectionPool('')
    private _le:LogEngine = new LogEngine([])

    public async connect() {
        this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `.. connecting to mssql ..`)
        await this._sqlPool.connect()
        this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. connected;`)
    }

    public async disconnect() {
        await this._sqlPool.close()
    }

    public async executeSql(sqlQuery:string, sqlRequest:mssql.Request, logFrequency:number=1000):Promise<mssql.IResult<any>> {
        this._le.logStack.push("executeSql");
        let output:mssql.IResult<any>

        try {

            this._le.AddLogEntry(LogEngine.Severity.Debug, LogEngine.Action.Note, `executing: ${sqlQuery}`)
            
            const r = this._sqlPool.request()
            r.parameters = sqlRequest.parameters
            r.verbose = true
            output = await r.query(sqlQuery)

        } catch(err) {
            this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err)
        } finally {
            this._le.logStack.pop()
        }

        return new Promise<IResult<any>>((resolve) => {resolve(output)})
    }

    public async executeSprocs(sprocName:string, sqlRequests:mssql.Request[], logFrequency:number=1000) {
        this._le.logStack.push("writeToSql");

        try {

            this._le.AddLogEntry(LogEngine.Severity.Debug, LogEngine.Action.Note, `executing ${sprocName} for ${sqlRequests.length} items .. `)

            let executionArray:Promise<void|IProcedureResult<any>>[] = []

            for(let i=0; i<sqlRequests.length; i++) {
                const r = this._sqlPool.request()
                try {
                    r.parameters = sqlRequests[i].parameters
                    r.verbose = true
                    executionArray.push(
                        r
                        .execute(sprocName)
                        .catch((reason:any) =>{
                            this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${reason}`)
                            console.debug(r)
                        })
                    )
                } catch(err) {
                    this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
                    console.debug(sqlRequests[i])
                }
                
            }

            await Utilities.executePromisesWithProgress(this._le, executionArray, logFrequency)

        } catch(err) {
            this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err)
        } finally {
            this._le.logStack.pop()
        }
    }

    public async getID(objectName:string, keyValue:string, keyField:string=''):Promise<number> {
        this._le.logStack.push("getID");
        this._le.AddLogEntry(LogEngine.Severity.Debug, LogEngine.Action.Success, `getting ID for \x1b[96m${objectName}\x1b[0m "\x1b[96m${keyValue}\x1b[0m".. `)
        let output:number=0

        try {

            const r = this._sqlPool.request()
            r.input('keyValue', mssql.VarChar(255), keyValue)
            const queryText:string = `SELECT ${objectName}ID FROM ${objectName} WHERE ${keyField ? keyField : objectName+'Description'}=@keyValue`

            const result:mssql.IResult<any> = await this.executeSql(queryText, r)
            if(result.recordset.length!==0) {
                output = result.recordset[0][objectName+'ID']
                this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `\x1b[96m${objectName}\x1b[0m: "\x1b[96m${keyValue}\x1b[0m" ID:\x1b[96m${output}\x1b[0m`)
            }
        } catch(err) {
            this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err)
        } finally {
            this._le.logStack.pop()
        }

        return new Promise<number>((resolve) => {resolve(output)})
    }

    public async getSingleValue(table:string, idColumn:string, idValue:number, queryColumn:string):Promise<any> {

        this._le.logStack.push("getSingleValue");
        this._le.AddLogEntry(LogEngine.Severity.Debug, LogEngine.Action.Note, `getting \x1b[96m${queryColumn}\x1b[0m from \x1b[96m${table}\x1b[0m where \x1b[96m${idColumn}\x1b[0m="\x1b[96m${idValue}\x1b[0m".. `)
        let output:any
        
        try {
            const r = this._sqlPool.request()
            r.input('idValue', mssql.Int, idValue)
            const query:string = `SELECT ${queryColumn} FROM ${table} WHERE ${idColumn}=@idValue`
            const result:mssql.IResult<any> = await this.executeSql(query, r)
            if(result.recordset.length===0) {
                throw(`${table}.${idColumn}=${idValue} not found.`)
            } else {
                output = result.recordset[0][queryColumn]
            }
        } catch(err) {
            this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err)
        } finally {
            this._le.logStack.pop()
        }

        return new Promise<any>((resolve) => {resolve(output)})
    
    }

    public async updateSingleValue(table:string, idColumn:string, idValue:number, updateColumn:string, updateValue:any, updateColumnType:mssql.ISqlType|mssql.ISqlTypeFactoryWithNoParams, changeDetection:boolean=false) {

        this._le.logStack.push("updateSingleValue");
        this._le.AddLogEntry(LogEngine.Severity.Debug, LogEngine.Action.Note, `updating \x1b[96m${table}\x1b[0m where \x1b[96m${idColumn}\x1b[0m="\x1b[96m${idValue}\x1b[0m".. `)
        let output:number=0

        try {

            let currentValue:any

            if(changeDetection) {
                currentValue = await this.getSingleValue(table, idColumn, idValue, updateColumn);
                if(currentValue!==updateValue) {
                    this._le.AddLogEntry(LogEngine.Severity.Warning, LogEngine.Action.Change, `\x1b[96m${table}\x1b[0m.\x1b[96m${updateColumn}\x1b[0m: "\x1b[96m${currentValue}\x1b[0m"->"\x1b[96m${updateValue}\x1b[0m".. `)
                    const r = this._sqlPool.request()
                    r.input('idValue', mssql.Bit, idValue)
                    r.input('updateValue', updateColumnType, updateValue)
                    const queryText:string = `UPDATE ${table} SET ${updateColumn}=@updateValue WHERE ${idColumn}=@idValue`
                    const result:mssql.IResult<any> = await this.executeSql(queryText, r)
                } else {
                    // no update needed
                    this._le.AddLogEntry(LogEngine.Severity.Debug, LogEngine.Action.Success, `\x1b[96m${table}\x1b[0m.\x1b[96m${updateColumn}\x1b[0m: "\x1b[96m${currentValue}\x1b[0m"="\x1b[96m${updateValue}\x1b[0m".. `)
                }
            }
        } catch(err) {
            this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err)
        } finally {
            this._le.logStack.pop()
        }

        return new Promise<number>((resolve) => {resolve(output)})

    }



}