// external imports
import { LogEngine } from 'whiskey-log'
import { DBEngine } from 'whiskey-sql'

// collectors
import { ActiveDirectory } from './collectors/ActiveDirectory'
import { AzureActiveDirectory } from './collectors/AzureActiveDirectory'
import { Connectwise } from './collectors/Connectwise'
import { Crowdstrike } from './collectors/Crowdstrike'
import { PostProcessor } from './components/PostProcessor'

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

    public async fetchActiveDirectory(ldapURL:string, bindDN:string, pw:string, searchDN:string, isPaged:boolean=true, sizeLimit:number=500):Promise<void> {
        this.le.AddDelimiter("ActiveDirectory")
        this.le.logStack.push('ActiveDirectory');

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

    public async fetchAzureActiveDirectory(TENANT_ID:string, CLIENT_ID:string, CLIENT_SECRET:string):Promise<void> {
        this.le.AddDelimiter("AzureActiveDirectory")
        this.le.logStack.push('AzureActiveDirectory');
        
        try {
            const aad = new AzureActiveDirectory(this.le, this.db, TENANT_ID, CLIENT_ID, CLIENT_SECRET);
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

    public async fetchConnectwise(baseURL:string, clientId:string, userName:string, password:string):Promise<void> {
        this.le.AddDelimiter("Connectwise")
        this.le.logStack.push('Connectwise');
        
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
        this.le.AddDelimiter("Crowdstrike")
        this.le.logStack.push('Crowdstrike');

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

    public async postProcessor() {
        this.le.AddDelimiter("postProcessor")
        this.le.logStack.push('postProcessor');

        try {
            const pp = new PostProcessor(this.le, this.db)
            await pp.updateDeviceDetails()
            await pp.updateUserDetails()
        } catch(err) {
            this.le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
            throw(err);
        }
        
        this.le.logStack.pop()
        return new Promise<void>((resolve) => {resolve()})
    }


}