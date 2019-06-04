import * as fs from 'fs';
import {Riff, Fmt, iXML} from './riff';

class Processor {
  constructor() {}

  /**
   * add iXML chunk to wav buffer.
   */
  encode(wavBuffer: Buffer, trackName: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      // parse wav file
      let riff = Riff.from(wavBuffer);

      // already has iXML chunk ?
      for (let chunk of riff.subChunks) {
        if (chunk instanceof iXML) {
          return resolve(null);
        }
      }

      // get numChannels
      let numChannels = 1;
      for (let chunk of riff.subChunks) {
        if (chunk instanceof Fmt) {
          numChannels = chunk.numChannels;
        }
      }

      // add iXML chunk
      let iXMLChunk = iXML.fromTrackName(trackName, numChannels);
      riff.appendChunk(iXMLChunk);

      // write file
      let wbuffer = Buffer.alloc(riff.chunkLength);
      riff.write(wbuffer);
      return resolve(wbuffer);
    });
  }
  encodeSync(wavBuffer: Buffer, trackName: string): Buffer {
    // parse wav file
    let riff = Riff.from(wavBuffer);

    // already has iXML chunk ?
    for (let chunk of riff.subChunks) {
      if (chunk instanceof iXML) {
        return null;
      }
    }

    // get numChannels
    let numChannels = 1;
    for (let chunk of riff.subChunks) {
      if (chunk instanceof Fmt) {
        numChannels = chunk.numChannels;
      }
    }

    // add iXML chunk
    let iXMLChunk = iXML.fromTrackName(trackName, numChannels);
    riff.appendChunk(iXMLChunk);

    // write file
    let wbuffer = Buffer.alloc(riff.chunkLength);
    riff.write(wbuffer);
    return wbuffer;
  }

  /**
   * append iXML chunk to wav file.
   */
  append(filePath: string, trackName: string, outPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'binary', (err, content) => {
        if (err) {
          return reject(err);
        }

        // parse wav file
        let buffer = Buffer.from(content, 'binary');

        // append ixml chunk
        this.encode(buffer, trackName).then((wbuffer: Buffer) => {
          if (!wbuffer) {
            return resolve(null);
          }

          // write file
          fs.writeFile(outPath, wbuffer, 'binary', (err) => {
            if (err) {
              return reject(err);
            }
            return resolve(outPath);
          });
        }); // encode
      }); // fs.readFile
    }); // Promise
  }
}

export default Processor;
