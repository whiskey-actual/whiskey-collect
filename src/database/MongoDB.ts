// imports
import { LogEngine } from 'whiskey-log';
import { Utilities } from 'whiskey-util'

import { MongoClient } from 'mongodb'
import mongoose, { mongo } from "mongoose";
import { DeviceSchema } from '../models/Device'
import { OperatingSystemSchema } from '../models/OperatingSystem';

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

      const unifiedDeviceObject:any = await this.getUnifiedObject('Device', 'deviceName', incomingDeviceObject.deviceName, incomingDeviceObject, immutableKeys);

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

    private async getUnifiedObject(modelName:string, identityKey:string, identityValue:string, incomingObject:any, immutableKeys:string[]):Promise<any> {

      this._le.logStack.push("compareAndUpdate");

      // first, get the existing object, if it exists.
      const existingRecord = await mongoose.model(modelName).findOne({[identityKey]: identityValue})

      let unifiedObject:any
      if(existingRecord) {
        unifiedObject=existingRecord._doc;
        const unifiedObjectKeys = Object.keys(unifiedObject)

        // now, iterate throught the incoming keys & compare to the already-existing object.
        let incomingObjectKeys = Object.keys(incomingObject);
        
        // iterate through the keys ..
        for(let i=0;i<incomingObjectKeys.length;i++) {

          const objectKey = incomingObjectKeys[i]

          // does this key already exist for the existing object?
          if(unifiedObjectKeys.includes(objectKey)) {

            // if the key is different, log it and update the value (but dont change immutable values)
            if(unifiedObject[objectKey]!==incomingObject[objectKey] && !immutableKeys.includes(objectKey)) {
              this._le.AddLogEntry(LogEngine.Severity.Debug, LogEngine.Action.Change, `${unifiedObject[identityKey]}.${objectKey}: ${unifiedObject[objectKey]} -> ${incomingObject[objectKey]}`)
              unifiedObject[objectKey] = incomingObject[objectKey]
            } else {
              this._le.AddLogEntry(LogEngine.Severity.Debug, LogEngine.Action.Success, `${unifiedObject[identityKey]}.${objectKey}: ${incomingObject[objectKey]}`)
            }
          } else {
            // is the key value undefined?
            if(unifiedObject[objectKey]!=undefined) {
              unifiedObject[objectKey] = incomingObject[objectKey];
              this._le.AddLogEntry(LogEngine.Severity.Debug, LogEngine.Action.Add, `${unifiedObject[identityKey]}.${objectKey}: ${unifiedObject[objectKey]}`)
            }
          }
        }
      } else {
        unifiedObject=incomingObject;
        this._le.AddLogEntry(LogEngine.Severity.Info, LogEngine.Action.Add, `${unifiedObject.deviceName}`)
      }

      this._le.logStack.pop();
      return new Promise<any>((resolve) => {resolve(unifiedObject)})

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
        'azureProfileType'
      ]

      const osVersionKeys:string[] = [
        'activeDirectoryOperatingSystemVersion',
        'azureOperatingSystemVersion',
        'azureManagedOperatingSystemVersion',
        'connectwiseOperatingSystemVersion',
        'crowdstrikeOSVersion'
      ]

      let existingGuess:any = {
        vendor: '',
        platform: '',
        class: ''
      }

      let existingGuessKeys:string[] = Object.keys(existingGuess);

      for(let i=0; i<osPlatformKeys.length; i++) {
        if(deviceObjectKeys.includes(osPlatformKeys[i]) && deviceObject[osPlatformKeys[i]]!==undefined && deviceObject[osPlatformKeys[i]]!=='') {

          await mongoose.model('OperatingSystem').updateOne(
            { osSourceLabel: deviceObject[osPlatformKeys[i]] },
            { },
            {
              new: true,
              upsert: true
            }
          );

          // let keyValue:string = deviceObject[osPlatformKeys[i]];

          // if(keyValue) {

          //   let newGuess = existingGuess;

          //   if(keyValue.match('/microsoft/i') || keyValue.match('/windows/i')) {
          //     newGuess.vendor = "Microsoft"
          //     newGuess.platform = "Windows"
          //   }

          //   //now remove the matches
          //   keyValue = keyValue.replace('microsoft', '');
          //   keyValue = keyValue.replace('windows', '')
          //   keyValue = keyValue.trim();

          //   if(keyValue.match('/server/i')) {
          //     newGuess.class = "Server"
          //   } else {
          //     newGuess.class = "End-user device"
          //   }

          //   keyValue = keyValue.replace('server','')

          //   for(let j=0; j<existingGuessKeys.length; j++) {

          //     // if the new value differs from the old value and the new value isn't undefined ..
          //     if(newGuess!==undefined && (newGuess[existingGuessKeys[j]]!=existingGuess[existingGuessKeys[j]] || existingGuess[existingGuessKeys[j]]===undefined)) {

          //       // if the old value was meaningful (ie, not undefined), then warn that the guess has changed.
          //       if(existingGuess[existingGuessKeys[j]]!=undefined) {
          //         this._le.AddLogEntry(LogEngine.Severity.Warning, LogEngine.Action.Change, `${existingGuessKeys[j]}: ${existingGuess[existingGuessKeys[j]]} -> ${newGuess[existingGuessKeys[j]]}`)
          //       }

          //       // update the guess value.
          //       existingGuess[existingGuessKeys[j]] = newGuess[existingGuessKeys[j]]
          //     }
          //   }
          // }
        }
      }

      this._le.logStack.pop();
      return new Promise<void>((resolve) => {resolve()})

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