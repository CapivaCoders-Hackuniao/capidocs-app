import { Injectable } from '@angular/core';
import fleekStorage from '@fleekhq/fleek-storage-js'

@Injectable({
  providedIn: 'root'
})
export class FileHostingService {

  key = 'blcrwVJrF9/GEuGcTIJafA=='; //TODO: create specific user credentials
  secret = '2JfNEe2z/rFlToKM5+oBL2UhMSAXl2mqgyvmJb875OA=';  //TODO: create specific user credentials

  constructor() { }

  async hostDataUrl(key: string, dataUrl: string): Promise<string> {
    const file = this.dataURItoBlob(dataUrl);
    return await this.hostFile(key, file);
  }

  async hostFile(key: string, file: Blob): Promise<string> {
    const uploadedFile = await this.uploadToFleek(key, file);
    return uploadedFile.publicUrl;
  }

  private async uploadToFleek(key: string, file: Blob) {
    return await fleekStorage.upload({
      apiKey: this.key,
      apiSecret: this.secret,
      key: key,
      data: file,
    });
  }

  dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {type: mimeString});
  }
}
