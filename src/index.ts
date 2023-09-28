// external imports
import { LogEngine } from 'whiskey-log'

// components
import { DBEngine } from './components/DBEngine'
import { MongoDB } from './database/MongoDB'

// collectors
import { ActiveDirectory } from './collectors/ActiveDirectory'
import { AzureActiveDirectory } from './collectors/AzureActiveDirectory'
import { AzureManaged } from './collectors/AzureManaged'
import { Connectwise } from './collectors/Connectwise'
import { Crowdstrike } from './collectors/Crowdstrike'
import { AzureManagedDevice, ConnectwiseDevice, CrowdstrikeDevice } from './models/Device'

export class Collector {

    constructor(logStack:string[], sqlConfig:string='', logFrequency:number=1000, showDebug:boolean=false, logStackColumnWidth:number=48) {
        this._le = new LogEngine(logStack, showDebug, logStackColumnWidth);
        this._db = new DBEngine(this._le, sqlConfig, logFrequency)
    }
    //private _mongoURI:string=''
    private _le:LogEngine
    private _db:DBEngine

    public async connectToDB() {
        await this._db.connect()
    }

    public async disconnectFromDB() {
        await this._db.disconnect()
    }

    // public async verifyMongoDB(mongoAdminURI:string, dbName:string):Promise<boolean> {
    //     const mongoCheck:MongoDB.CheckDB = new MongoDB.CheckDB(this._le);
    //     await mongoCheck.checkMongoDatabase(mongoAdminURI, this._mongoURI, dbName);
    //     return new Promise<boolean>((resolve) => {resolve(true)})
    // }

    // public async persistToMongoDB(deviceObjects:any):Promise<boolean> {
    //     const mongodb:MongoDB.Persist = new MongoDB.Persist(this._le, this._mongoURI)
    //     await mongodb.persistDevices(deviceObjects)
    //     return new Promise<boolean>((resolve) => {resolve(true)})
    // }

    public async fetchActiveDirectory(ldapURL:string, bindDN:string, pw:string, searchDN:string, isPaged:boolean=true, sizeLimit:number=500):Promise<void> {
        this._le.logStack.push('ActiveDirectory');

        try {
            const ad = new ActiveDirectory(this._le, this._db);
            await ad.fetch(ldapURL, bindDN, pw, searchDN, isPaged, sizeLimit)
            await ad.persist()
        } catch(err) {
            this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        } finally {
            this._le.logStack.pop()
        }
        
        return new Promise<void>((resolve) => {resolve()})
    }

    public async fetchAzureActiveDirectory(TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<void> {
        this._le.logStack.push('AzureActiveDirectory');

        try {
            const aad = new AzureActiveDirectory(this._le, this._db);
            await aad.fetch(TENANT_ID, AAD_ENDPOINT, GRAPH_ENDPOINT, CLIENT_ID, CLIENT_SECRET)
            await aad.persist()
        } catch(err) {
            this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        } finally {
            this._le.logStack.pop()
        }
        
        return new Promise<void>((resolve) => {resolve()})
    }

    public async fetchAzureManaged(TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<AzureManagedDevice[]> {
        this._le.logStack.push('AzureManaged');
        let output:AzureManagedDevice[]

        try {
            const am = new AzureManaged(this._le);
            output = await am.fetch(TENANT_ID, AAD_ENDPOINT, GRAPH_ENDPOINT, CLIENT_ID, CLIENT_SECRET)
        } catch(err) {
            this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        }
        
        this._le.logStack.pop()
        return new Promise<AzureManagedDevice[]>((resolve) => {resolve(output)})
    }

    public async fetchConnectwise(baseURL:string, clientId:string, userName:string, password:string):Promise<ConnectwiseDevice[]> {
        this._le.logStack.push('Connectwise');
        let output:ConnectwiseDevice[]

        try {
            const cw = new Connectwise(this._le);
            output = await cw.fetch(baseURL, clientId, userName, password);
        } catch(err) {
            this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        }
        
        this._le.logStack.pop()
        return new Promise<ConnectwiseDevice[]>((resolve) => {resolve(output)})
    }

    public async fetchCrowdstrike(baseURL:string, clientId:string, clientSecret:string):Promise<CrowdstrikeDevice[]> {
        this._le.logStack.push('Crowdstrike');
        let output:CrowdstrikeDevice[]

        try {
            const cs = new Crowdstrike(this._le)
            output = await cs.fetch(baseURL, clientId, clientSecret)
        } catch(err) {
            this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        }
        
        this._le.logStack.pop()
        return new Promise<CrowdstrikeDevice[]>((resolve) => {resolve(output)})
    }


}