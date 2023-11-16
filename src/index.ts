// external imports
import { LogEngine } from 'whiskey-log'
import { DBEngine } from 'whiskey-sql'

import { verifyTables } from './initialization/verifyTables'

import { Sources } from './sources'
import { SourceType } from './sources/sourceType'

// collectors
import { ActiveDirectory } from './collectors/ActiveDirectory'
import { Azure } from './collectors/Azure'
import { Connectwise } from './collectors/Connectwise'
import { Crowdstrike } from './collectors/Crowdstrike'
import { PostProcessor } from './components/PostProcessor'


export class Collector {

    constructor(logStack:string[], sqlConfig:string, dbEncryptionKey:string, dbInitializationVector:string, logFrequency:number=1000, showDebug:boolean=false, logStackColumnWidth:number=48) {
        this.le = new LogEngine(logStack, showDebug, logStackColumnWidth);
        this.db = new DBEngine(this.le, sqlConfig)
        this.dbEncryptionKey=dbEncryptionKey
        this.dbInitializationVector=dbInitializationVector
    }
    //private _mongoURI:string=''
    private le:LogEngine
    private db:DBEngine
    private dbEncryptionKey:string
    private dbInitializationVector:string

    public async connectToDB() {
        await this.db.connect()
    }

    public async disconnectFromDB() {
        await this.db.disconnect()
    }

    public async initializeDatabase() {
        this.le.AddDelimiter("initializeDatabase")
        this.le.logStack.push('initializeDatabase');
        try {
            await verifyTables(this.le, this.db)
        } catch(err) {
            this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
            throw(err);
        } finally {
            this.le.logStack.pop()
        }
        return new Promise<void>((resolve) => {resolve()})
    }

    public async addDataSource(dataSourceName:string, dataSourceURI:string, sourceType:SourceType, dataSourceCredential:string, dataSourceAuthentication:string, dataSourceParameter?:string) {
        await Sources.addSource(this.le, this.db, this.dbEncryptionKey, this.dbInitializationVector, dataSourceName, dataSourceURI, dataSourceCredential, dataSourceAuthentication, dataSourceParameter)
    }

    public async getDataSources() {
        return await Sources.getSources(this.le, this.db)
    }

    public async fetchActiveDirectory(ldapURL:string, bindDN:string, pw:string, searchDN:string, isPaged:boolean=true, sizeLimit:number=500):Promise<void> {
        this.le.AddDelimiter("AD")
        this.le.logStack.push('AD');

        try {
            const ad = new ActiveDirectory(this.le, this.db, ldapURL, bindDN, pw, searchDN, isPaged, sizeLimit);
            await ad.fetch()
        } catch(err) {
            this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
            throw(err);
        } finally {
            this.le.logStack.pop()
        }
        
        return new Promise<void>((resolve) => {resolve()})
    }

    public async fetchAzureActiveDirectory(TENANT_ID:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<void> {
        this.le.AddDelimiter("AAD")
        this.le.logStack.push('AAD');
        
        try {
            const azure = new Azure(this.le, this.db, TENANT_ID, CLIENT_ID, CLIENT_SECRET);
            await azure.fetch()
        } catch(err) {
            this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
            throw(err);
        } finally {
            this.le.logStack.pop()
        }
        
        return new Promise<void>((resolve) => {resolve()})
    }

    public async fetchConnectwise(baseURL:string, clientId:string, userName:string, password:string):Promise<void> {
        this.le.AddDelimiter("Connectwise")
        this.le.logStack.push('Connectwise');
        
        try {
            const cw = new Connectwise(this.le, this.db, baseURL, clientId, userName, password);

            console.debug(cw)
            await cw.fetch()
        } catch(err) {
            this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
            throw(err);
        } finally {
            this.le.logStack.pop()
        }
        
        return new Promise<void>((resolve) => {resolve()})
    }
    
    public async fetchCrowdstrike(baseURL:string, clientId:string, clientSecret:string):Promise<void> {
        this.le.AddDelimiter("Crowdstrike")
        this.le.logStack.push('Crowdstrike');

        try {
            const cs = new Crowdstrike(this.le, this.db)
            await cs.fetch(baseURL, clientId, clientSecret)
            await cs.persist()
        } catch(err) {
            this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
            throw(err);
        }
        
        this.le.logStack.pop()
        return new Promise<void>((resolve) => {resolve()})
    }

    public async postProcessor() {
        this.le.AddDelimiter("postProcessor")
        this.le.logStack.push('postProcessor');

        try {
            const pp = new PostProcessor(this.le, this.db)
            await pp.updateDeviceDetails()
            await pp.updateEmployeeDetails()
        } catch(err) {
            this.le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
            throw(err);
        }
        
        this.le.logStack.pop()
        return new Promise<void>((resolve) => {resolve()})
    }


}