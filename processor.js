"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const riff_1 = require("./riff");
class Processor {
    constructor() { }
    encode(wavBuffer, trackName) {
        return new Promise((resolve, reject) => {
            let riff = riff_1.Riff.from(wavBuffer);
            for (let chunk of riff.subChunks) {
                if (chunk instanceof riff_1.iXML) {
                    return resolve(null);
                }
            }
            let iXMLChunk = riff_1.iXML.fromTrackName(trackName);
            riff.appendChunk(iXMLChunk);
            let wbuffer = Buffer.alloc(riff.chunkLength);
            riff.write(wbuffer);
            return resolve(wbuffer);
        });
    }
    append(filePath, trackName, outPath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'binary', (err, content) => {
                if (err) {
                    return reject(err);
                }
                let buffer = Buffer.from(content, 'binary');
                this.encode(buffer, trackName).then((wbuffer) => {
                    if (!wbuffer) {
                        return resolve(null);
                    }
                    fs.writeFile(outPath, wbuffer, 'binary', (err) => {
                        if (err) {
                            return reject(err);
                        }
                        return resolve(outPath);
                    });
                });
            });
        });
    }
}
exports.default = Processor;
