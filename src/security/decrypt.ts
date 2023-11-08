import * as crypto from 'crypto';
import { LogEngine } from 'whiskey-log';

export function decrypt(le:LogEngine, encryptedText:string, encryptionKey:string, initializationVector:string): string {

    le.logStack.push("decrypt")
    let output:string = ""

    try {

        // Convert the hex strings to Buffer objects
        const keyBuffer = Buffer.from(encryptionKey, 'hex');
        const ivBuffer = Buffer.from(initializationVector, 'hex');
        
        const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, ivBuffer);
        let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        output = decrypted
    } catch(err) {
        le.AddLogEntry(LogEngine.EntryType.Error, `${err}`)
        throw(err);
    } finally {
        le.logStack.pop()
    }

    return output

  }