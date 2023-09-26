// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'

import { MongoClient } from 'mongodb'
import mongoose, { mongo } from "mongoose";
import { DeviceSchema } from '../models/Device'
import { OperatingSystem, OperatingSystemSchema } from '../models/OperatingSystem';
import { getUnifiedObject } from '../components/getUnifiedObject';

const _ActiveDeviceThresholdInDays:number=30

export namespace MongoDB {

  export class Persist {

    constructor(logEngine:LogEngine, mongoURI:string, mongoConnectionOptions:mongoose.ConnectOptions={}) {
      this._le=logEngine
      this._mongoURI=mongoURI;
      this._mongoConnectionOptions=mongoConnectionOptions;
    }
    private _le:LogEngine = new LogEngine([])
    private _mongoURI:string=""
    private _mongoConnectionOptions:mongoose.ConnectOptions={}
    
    
    public async persistDevices(deviceObjects:any[]):Promise<number> {
      this._le.logStack.push("persistDevices");
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `persisting ${deviceObjects.length} devices ..`)

      try {

        await mongoose.connect(this._mongoURI, this._mongoConnectionOptions)

        let executionArray:Promise<void>[] = []
        for(let i=0;i<deviceObjects.length; i++) {
          executionArray.push(this.getUpdateObject(deviceObjects[i]));
        }
        await Utilities.executePromisesWithProgress(this._le, executionArray)

        this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. persisted ${deviceObjects.length} devices.`)
      } catch(err) {
        this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, `${err}`)
        throw(err);
      } finally {
        this._le.logStack.pop()
      }

      return new Promise<number>((resolve) => {resolve(deviceObjects.length)})

    }

    private async getUpdateObject(incomingDeviceObject:any):Promise<void> {

      this._le.logStack.push("getUpdateObject");

      const immutableKeys:string[] = [
        'observedByActiveDirectory',
        'observedByAzureActiveDirectory',
        'observedByAzureMDM',
        'observedByConnectwise',
        'observedByCrowdstrike'
      ]

      const dateKeys:string[] = [
        'activeDirectoryWhenCreated',
        'activeDirectoryWhenChanged',
        'activeDirectoryLastLogon',
        'activeDirectoryPwdLastSet',
        'azureDeletedDateTime',
        'azureApproximateLastSignInDateTime',
        'azureComplianceExpirationDateTime',
        'azureCreatedDateTime',
        'azureOnPremisesLastSyncDateTime',
        'azureRegistrationDateTime',
        'azureManagedEnrolledDateTime',
        'azureManagedLastSyncDateTime',
        'azureManagedEASActivationDateTime',
        'azureManagedExchangeLastSuccessfulSyncDateTime',
        'azureManagedComplianceGracePeriodExpirationDateTime',
        'azureManagedManagementCertificateExpirationDateTime',
        'connectwiseFirstSeen',
        'connectwiseLastObserved',
        'crowdstrikeFirstSeenDateTime',
        'crowdstrikeLastSeenDateTime',
        'crowdstrikeModifiedDateTime',
      ]

      const unifiedDeviceObject:any = await getUnifiedObject(this._le, 'Device', 'deviceName', incomingDeviceObject.deviceName, incomingDeviceObject, immutableKeys);

      // calculate the operatingSystem value.
      const operatingSystemObject = await this.getOperatingSystemDetails(unifiedDeviceObject);
      // unifiedDeviceObject.deviceOperatingSystemVendor = operatingSystemObject.vendor
      // unifiedDeviceObject.deviceOperatingSystemPlatform = operatingSystemObject.platform
      // unifiedDeviceObject.deviceOperatingSystemClass = operatingSystemObject.class

      // calculate the last observed date.
      unifiedDeviceObject.deviceLastObserved = Utilities.getMaxDateFromObject(unifiedDeviceObject, dateKeys)

      let lastActiveThreshold:Date= new Date()
      lastActiveThreshold.setDate(lastActiveThreshold.getDate()-_ActiveDeviceThresholdInDays)

      unifiedDeviceObject.deviceIsActive = (unifiedDeviceObject.deviceLastObserved>lastActiveThreshold)

      await mongoose.model('Device').updateOne(
        { deviceName: unifiedDeviceObject.deviceName },
        {
          $set: unifiedDeviceObject
        },
        {
          new: true,
          upsert: true
        }
      );

      this._le.logStack.pop();
      return new Promise<void>((resolve) => {resolve()})

    }


    private isEqualDates(d1:Date, d2:Date):boolean {

      let output = false;

      try {
        output = (d1.getTime()===d2.getTime())

      } catch(err) {
        //Utilities.AddLogEntry(LogEngine.Severity.Error, 'isEqualDates', `${err}`)
        throw(err)
      }

      return output
    }

    private determineDeviceType(determinedOperatingSystem:string, existingDeviceObject:any, newDeviceObject:any):string {

      let output:any = 'UNKNOWN'
      this._le.logStack.push('determineDeviceType')

      try {

        if(determinedOperatingSystem.includes('server')) {
          output = "Server"
        }
        else if(Object.keys(existingDeviceObject).includes('azureDeviceCategory')) {
          if(existingDeviceObject.azureDeviceCategory==='Printer') {
            output = 'Printer'
          }
        }


        // get the azuredevicetype

      } catch(err) {
        //Utilities.AddLogEntry(LogEngine.Severity.Error, 'determineDeviceType', `${err}`)
        throw(err)
      }

      this._le.logStack.pop();

      return output

    }

    private getDeviceType(deviceObject:any) {
      
      const deviceTypeKeys:string[] = [
        'AzureProfileType',
      ]

    }

    

    private async getOperatingSystemDetails(deviceObject:any):Promise<void> {

      this._le.logStack.push('getOperatingSystemDetails');

      const deviceObjectKeys = Object.keys(deviceObject);

      const osPlatformKeys:string[] = [
        'activeDirectoryOperatingSystem',
        'azureOperatingSystem',
        'azureManagedOperatingSystem',
        'connectwiseOperatingSystem',
        'crowdstrikeOSBuild',
      ]

      const osVersionKeys:string[] = [
        'activeDirectoryOperatingSystemVersion',
        'azureOperatingSystemVersion',
        'azureManagedOperatingSystemVersion',
        'connectwiseOperatingSystemVersion',
        'crowdstrikeOSVersion'
      ]


      for(let i=0; i<osPlatformKeys.length; i++) {
        if(deviceObjectKeys.includes(osPlatformKeys[i]) && deviceObject[osPlatformKeys[i]]!==undefined && deviceObject[osPlatformKeys[i]]!=='') {
          const os = await new OperatingSystem({osLabel: deviceObject[osPlatformKeys[i]]});
          //os.saveOS()

        }
      }

      this._le.logStack.pop();
      return new Promise<void>((resolve) => {resolve()})

    }

    private async parseOperatingSystem(operaingSystemLabel:string) {

    }

  }

  export class CheckDB {

    constructor(logEngine:LogEngine) {
      this._le = logEngine
    }
    private _le = new LogEngine([])

    public async checkMongoDatabase(mongoAdminURI:string, mongoURI:string, db:string):Promise<boolean> {
      this._le.logStack.push('checkMongoDatabase');
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `verifying db: ${db}`)
      let output:boolean = false;
      
      try {

        const initClient = new MongoClient(mongoAdminURI);
        let initDB = initClient.db()
        const initAdmin = initDB.admin();
        const dbInfo = await initAdmin.listDatabases();

        const dbObject = dbInfo.databases.find(element => element.name==db)
        if(dbObject) {

          this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. found db ${db} (size is ${dbObject.sizeOnDisk}b)`)
          mongoose.connect(`${mongoURI}`)

          const assetDB = initClient.db(db)
          const admin = assetDB.admin()

          await this.verifyCollection(admin, "devices", DeviceSchema);
          await this.verifyCollection(admin, "operatingSystems", OperatingSystemSchema);

          return true;

        }
        else {
          throw(`.. db ${db} not found.`)  
        }

      } catch (err:any) {
        this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, err)
        throw(err)
      }

      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. check complete.`)
      this._le.logStack.pop()
      return new Promise<boolean>((resolve) => {resolve(output)})

    }

    private async verifyCollection(admin:mongoose.mongo.Admin, collectionName:string, collectionSchema:mongoose.Schema):Promise<boolean> {
      this._le.logStack.push('verifyCollection')
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `verifying collection ${collectionName} .. `)
      let output:boolean = false

      try {
        const collectionExists:boolean = await this.validateCollection(admin, collectionName)
        if(collectionExists) {
          this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. collection ${collectionName} ok. `)
        } else {
          this._le.AddLogEntry(LogEngine.Severity.Warning, LogEngine.Action.Note, `.. collection ${collectionName} does not exist`)
          await this.createCollection(collectionName, collectionSchema)
        }
      } catch (err:any) {
        this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, err)
        throw(err)
      }
      
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `collection verified`)
      this._le.logStack.pop()
      return new Promise<boolean>((resolve) => {resolve(output)})
    }

    private async validateCollection(admin:mongoose.mongo.Admin, collectionName:string):Promise<boolean> {
      this._le.logStack.push('validateCollection')
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `validating collection ${collectionName} .. `)
      let output:boolean = false

      try {
        const doc = await admin.validateCollection(collectionName)
        this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `.. collection ${collectionName} OK. (found ${doc} records)`)
        output=true
      } catch (err:any) {
        this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, err)
        throw(err)
      }
          
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `collection ${collectionName} verified. `)
      this._le.logStack.pop()
      return new Promise<boolean>((resolve) => {resolve(output)})
    }

    private async createCollection(collectionName:string, collectionSchema:mongoose.Schema) {
      this._le.logStack.push('createCollection')
      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Note, `creating collection ${collectionName} .. `)
      let output:boolean = false

      try {
        const mongoCollection:mongo.Collection = await mongoose.model(collectionName, collectionSchema).createCollection()
        output = true
      } catch (err:any) {
        this._le.AddLogEntry(LogEngine.Severity.Error, LogEngine.Action.Note, err)
        throw(err)
      }

      this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Success, `collection ${collectionName} created`)
      this._le.logStack.pop()
      return new Promise<boolean>((resolve) => {resolve(output)})
    }
  }

}