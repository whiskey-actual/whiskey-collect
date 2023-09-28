// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'

import mssql, { IProcedureResult, IResult } from 'mssql'

export class UpdatePackage {
    public tableName:string = ''
    public idColumn:string = ''
    public UpdatePackageItems:UpdatePackageItem[]=[]
}

export class UpdatePackageItem {
    public idValue:number = 0
    public updateColumn:string = ''
    public updateValue:any = ''
    public columnType:mssql.ISqlType|mssql.ISqlTypeFactoryWithNoParams = mssql.Int
}

export class DBEngine {

    constructor(logEngine:LogEngine, sqlConfig:any, persistLogFrequency:number=250) {
        this._le = logEngine;
        this._sqlPool = new mssql.ConnectionPool(sqlConfig)
        this._persistLogFrequency = persistLogFrequency
        this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `initialized; don't forget to call connect()!`)
        
    }
    private _le:LogEngine
    private _sqlPool:mssql.ConnectionPool
    private _persistLogFrequency:number
    

    public async connect() {
        this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `connecting to mssql ..`)
        await this._sqlPool.connect()
        this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. connected.`)
    }

    public async disconnect() {
        this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `disconnecting from mssql ..`)
        await this._sqlPool.close()
        this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. disconnected.`)
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
                this._le.AddLogEntry(LogEngine.Severity.Debug, LogEngine.Action.Success, `\x1b[96m${objectName}\x1b[0m: "\x1b[96m${keyValue}\x1b[0m" ID:\x1b[96m${output}\x1b[0m`)
            } else {
                this._le.AddLogEntry(LogEngine.Severity.Warning, LogEngine.Action.Add, `${keyField} ${keyValue} not found in ${objectName}, adding ..`)
                const r = this._sqlPool.request()
                r.input('keyValue', mssql.VarChar(255), keyValue)
                const query:string = `INSERT INTO ${objectName}(${keyField}) VALUES (@keyValue)`
                await this.executeSql(query, r)
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

    public async performUpdates(updatePackage:UpdatePackage, changeDetection:boolean=false):Promise<void> {
        this._le.logStack.push("performUpdates");
        this._le.AddLogEntry(LogEngine.Severity.Debug, LogEngine.Action.Note, `performing ${updatePackage.UpdatePackageItems.length} updates on \x1b[96m${updatePackage.tableName}\x1b[0m`)

        try {

            const startDate:Date = new Date()

            for(let i=0; i<updatePackage.UpdatePackageItems.length; i++) {

                let currentValue:any

                let changeDetected:boolean = false
                if(changeDetection) {
                    try {
                        currentValue = await this.getSingleValue(updatePackage.tableName, updatePackage.idColumn, updatePackage.UpdatePackageItems[i].idValue, updatePackage.UpdatePackageItems[i].updateColumn);
                        if(
                            (currentValue===null && updatePackage.UpdatePackageItems[i].updateValue)
                            || currentValue.toString().trim()!=updatePackage.UpdatePackageItems[i].updateValue.toString().trim()
                        ) 
                        {
                            changeDetected=true
                        }
                    } catch(err) {
                        this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `currentValue:"${currentValue}", "updateValue:"${updatePackage.UpdatePackageItems[i].updateValue}" :: ${err}`)
                        throw(err)
                    }
                }

                if(!changeDetection || (changeDetection && changeDetected)) {
                    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Change, `\x1b[96m${updatePackage.tableName}\x1b[0m.\x1b[96m${updatePackage.UpdatePackageItems[i].updateColumn}\x1b[0m: "\x1b[96m${currentValue}\x1b[0m"->"\x1b[96m${updatePackage.UpdatePackageItems[i].updateValue}\x1b[0m".. `)
                    const r = this._sqlPool.request()
                    r.input('idValue', mssql.Int, updatePackage.UpdatePackageItems[i].idValue)
                    r.input('updateValue', updatePackage.UpdatePackageItems[i].columnType, updatePackage.UpdatePackageItems[i].updateValue)
                    const queryText:string = `UPDATE ${updatePackage.tableName} SET ${updatePackage.UpdatePackageItems[i].updateColumn}=@updateValue WHERE ${updatePackage.idColumn}=@idValue`
                    const result:mssql.IResult<any> = await this.executeSql(queryText, r)
                } else {
                    // no update needed
                    this._le.AddLogEntry(LogEngine.Severity.Debug, LogEngine.Action.Success, `\x1b[96m${updatePackage.tableName}\x1b[0m.\x1b[96m${updatePackage.UpdatePackageItems[i].updateColumn}\x1b[0m: "\x1b[96m${currentValue}\x1b[0m"="\x1b[96m${updatePackage.UpdatePackageItems[i].updateValue}\x1b[0m".. `)
                }

                if(i>0 && i%this._persistLogFrequency) {
                    this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, Utilities.getProgressMessage(updatePackage.tableName, 'persisted', i, updatePackage.UpdatePackageItems.length, startDate, new Date()))
                }

            }
        } catch(err) {
            this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err)
        } finally {
            this._le.logStack.pop()
        }

        return new Promise<void>((resolve) => {resolve()})

    }



}