// external imports
import { LogEngine } from 'whiskey-log'

// components
import { DBEngine } from './components/DBEngine'

// collectors
import { ActiveDirectory } from './collectors/ActiveDirectory'
import { AzureActiveDirectory } from './collectors/AzureActiveDirectory'
import { Connectwise } from './collectors/Connectwise'
import { Crowdstrike } from './collectors/Crowdstrike'

export class Collector {

    constructor(logStack:string[], sqlConfig:string='', logFrequency:number=1000, showDebug:boolean=false, logStackColumnWidth:number=48) {
        this.le = new LogEngine(logStack, showDebug, logStackColumnWidth);
        this.db = new DBEngine(this.le, sqlConfig, logFrequency)
    }
    //private _mongoURI:string=''
    private le:LogEngine
    private db:DBEngine

    public async connectToDB() {
        await this.db.connect()
    }

    public async disconnectFromDB() {
        await this.db.disconnect()
    }

    // public async verifyMongoDB(mongoAdminURI:string, dbName:string):Promise<boolean> {
    //     const mongoCheck:MongoDB.CheckDB = new MongoDB.CheckDB(this.le);
    //     await mongoCheck.checkMongoDatabase(mongoAdminURI, this._mongoURI, dbName);
    //     return new Promise<boolean>((resolve) => {resolve(true)})
    // }

    // public async persistToMongoDB(deviceObjects:any):Promise<boolean> {
    //     const mongodb:MongoDB.Persist = new MongoDB.Persist(this.le, this._mongoURI)
    //     await mongodb.persistDevices(deviceObjects)
    //     return new Promise<boolean>((resolve) => {resolve(true)})
    // }

    public async fetchActiveDirectory(ldapURL:string, bindDN:string, pw:string, searchDN:string, isPaged:boolean=true, sizeLimit:number=500):Promise<void> {
        this.le.logStack.push('ActiveDirectory');
        this.le.AddDelimiter("INIT")

        try {
            const ad = new ActiveDirectory(this.le, this.db, ldapURL, bindDN, pw, searchDN, isPaged, sizeLimit);
            await ad.fetch()
            await ad.persist()
        } catch(err) {
            this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        } finally {
            this.le.logStack.pop()
        }
        
        return new Promise<void>((resolve) => {resolve()})
    }

    public async fetchAzureActiveDirectory(TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<void> {
        this.le.logStack.push('AzureActiveDirectory');
        this.le.AddDelimiter("INIT")

        try {
            const aad = new AzureActiveDirectory(this.le, this.db, TENANT_ID, AAD_ENDPOINT, GRAPH_ENDPOINT, CLIENT_ID, CLIENT_SECRET);
            await aad.getDevices()
            await aad.getUsers()
            await aad.getManagedDevices()
            await aad.persist()
        } catch(err) {
            this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        } finally {
            this.le.logStack.pop()
        }
        
        return new Promise<void>((resolve) => {resolve()})
    }

    // public async fetchAzureManaged(TENANT_ID:string, AAD_ENDPOINT:string, GRAPH_ENDPOINT:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<void> {
    //     this.le.logStack.push('AzureManaged');
    //     this.le.AddDelimiter("INIT")

    //     try {
    //         const am = new AzureManaged(this.le, this.db);
    //         await am.fetch(TENANT_ID, AAD_ENDPOINT, GRAPH_ENDPOINT, CLIENT_ID, CLIENT_SECRET)
    //         await am.persist()
    //     } catch(err) {
    //         this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
    //         throw(err);
    //     } finally {
    //         this.le.logStack.pop()
    //     }

    //     return new Promise<void>((resolve) => {resolve()})
    // }

    public async fetchConnectwise(baseURL:string, clientId:string, userName:string, password:string):Promise<void> {
        this.le.logStack.push('Connectwise');
        this.le.AddDelimiter("INIT")

        try {
            const cw = new Connectwise(this.le, this.db);
            await cw.fetch(baseURL, clientId, userName, password);
            await cw.persist()
        } catch(err) {
            this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        }
        
        this.le.logStack.pop()
        return new Promise<void>((resolve) => {resolve()})
    }
    
    public async fetchCrowdstrike(baseURL:string, clientId:string, clientSecret:string):Promise<void> {
        this.le.logStack.push('Crowdstrike');
        this.le.AddDelimiter("INIT")

        try {
            const cs = new Crowdstrike(this.le, this.db)
            await cs.fetch(baseURL, clientId, clientSecret)
            await cs.persist()
        } catch(err) {
            this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        }
        
        this.le.logStack.pop()
        return new Promise<void>((resolve) => {resolve()})
    }


}