"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Riff {
    constructor() {
        this.id = 'RIFF';
        this.format = 'WAVE';
        this.subChunks = [];
    }
    static isChunk(buffer) {
        if (buffer.length < 4) {
            return false;
        }
        const id = buffer.readUIntBE(0, 4);
        const idName = Buffer.from(id.toString(16), 'hex').toString();
        return idName == 'RIFF';
    }
    static from(buffer) {
        const chunk = new Riff();
        chunk.id = Buffer.from(buffer.readUIntBE(0, 4).toString(16), 'hex').toString();
        chunk.size = buffer.readUIntLE(4, 4);
        chunk.chunkLength = chunk.size + 8;
        chunk.format = Buffer.from(buffer.readUIntBE(8, 4).toString(16), 'hex').toString();
        let pos = 12;
        while (pos < chunk.chunkLength) {
            if (Fmt.isChunk(buffer.slice(pos))) {
                const sub = Fmt.from(buffer.slice(pos));
                chunk.subChunks.push(sub);
                pos += sub.chunkLength;
                continue;
            }
            else if (WavData.isChunk(buffer.slice(pos))) {
                const sub = WavData.from(buffer.slice(pos));
                chunk.subChunks.push(sub);
                pos += sub.chunkLength;
                continue;
            }
            else if (iXML.isChunk(buffer.slice(pos))) {
                const sub = iXML.from(buffer.slice(pos));
                chunk.subChunks.push(sub);
                pos += sub.chunkLength;
                continue;
            }
            else {
                break;
            }
        }
        return chunk;
    }
    appendChunk(chunk) {
        this.subChunks.push(chunk);
        this.size += chunk.chunkLength;
        this.chunkLength = this.size + 8;
    }
    write(buffer) {
        Buffer.from(this.id).copy(buffer, 0, 0, 4);
        buffer.writeUIntLE(this.size, 4, 4);
        Buffer.from(this.format).copy(buffer, 8, 0, 4);
        let offset = 12;
        for (let chunk of this.subChunks) {
            chunk.write(buffer.slice(offset));
            offset += chunk.chunkLength;
        }
    }
}
exports.Riff = Riff;
class Fmt {
    constructor() {
        this.chunkLength = 24;
        this.id = 'fmt ';
        this.size = 16;
        this.audioFormat = 1;
    }
    static isChunk(buffer) {
        if (buffer.length < 4) {
            return false;
        }
        const id = buffer.readUIntBE(0, 4);
        const idName = Buffer.from(id.toString(16), 'hex').toString();
        return idName == 'fmt ';
    }
    static from(buffer) {
        const chunk = new Fmt();
        chunk.id = Buffer.from(buffer.readUIntBE(0, 4).toString(16), 'hex').toString();
        chunk.size = buffer.readUIntLE(4, 4);
        chunk.audioFormat = buffer.readUIntLE(8, 2);
        chunk.numChannels = buffer.readUIntLE(10, 2);
        chunk.sampleRate = buffer.readUIntLE(12, 4);
        chunk.byteRate = buffer.readUIntLE(16, 4);
        chunk.blockAlign = buffer.readUIntLE(20, 2);
        chunk.bitsPerSample = buffer.readUIntLE(22, 2);
        return chunk;
    }
    write(buffer) {
        Buffer.from(this.id).copy(buffer, 0, 0, 4);
        buffer.writeUIntLE(this.size, 4, 4);
        buffer.writeUIntLE(this.audioFormat, 8, 2);
        buffer.writeUIntLE(this.numChannels, 10, 2);
        buffer.writeUIntLE(this.sampleRate, 12, 4);
        buffer.writeUIntLE(this.byteRate, 16, 4);
        buffer.writeUIntLE(this.blockAlign, 20, 2);
        buffer.writeUIntLE(this.bitsPerSample, 22, 2);
    }
}
exports.Fmt = Fmt;
class WavData {
    constructor() {
        this.id = 'data';
    }
    static isChunk(buffer) {
        if (buffer.length < 4) {
            return false;
        }
        const id = buffer.readUIntBE(0, 4);
        const idName = Buffer.from(id.toString(16), 'hex').toString();
        return idName == 'data';
    }
    static from(buffer) {
        const chunk = new WavData();
        chunk.id = Buffer.from(buffer.readUIntBE(0, 4).toString(16), 'hex').toString();
        chunk.size = buffer.readUIntLE(4, 4);
        chunk.chunkLength = chunk.size + 8;
        chunk.wavBuffer = buffer.slice(8, chunk.size + 8);
        return chunk;
    }
    write(buffer) {
        Buffer.from(this.id).copy(buffer, 0, 0, 4);
        buffer.writeUIntLE(this.size, 4, 4);
        this.wavBuffer.copy(buffer, 8, 0, this.size);
    }
}
class iXML {
    constructor() { }
    static isChunk(buffer) {
        if (buffer.length < 4) {
            return false;
        }
        const id = buffer.readUIntBE(0, 4);
        const idName = Buffer.from(id.toString(16), 'hex').toString();
        return idName == 'iXML';
    }
    static from(buffer) {
        const chunk = new iXML();
        chunk.id = Buffer.from(buffer.readUIntBE(0, 4).toString(16), 'hex').toString();
        chunk.size = buffer.readUIntLE(4, 4);
        chunk.chunkLength = chunk.size + 8;
        chunk.wavBuffer = buffer.slice(8, chunk.size + 8);
        return chunk;
    }
    static fromXml(xml) {
        let xmlBuffer = Buffer.from(xml);
        if (xmlBuffer.length % 2 == 1) {
            xmlBuffer = Buffer.concat([xmlBuffer, Buffer.from(' ')]);
        }
        const chunk = new iXML();
        chunk.id = 'iXML';
        chunk.size = xmlBuffer.length;
        chunk.chunkLength = chunk.size + 8;
        chunk.wavBuffer = xmlBuffer;
        return chunk;
    }
    static fromTrackName(trackName, trackCount) {
        const replacedTrackName = trackName
            .replace(/</, '&lt;')
            .replace(/>/, '&gt;')
            .replace(/&/, '&amp;');
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<BWFXML>
    <IXML_VERSION>1.27</IXML_VERSION>
    <TRACK_LIST>
        <TRACK_COUNT>${trackCount}</TRACK_COUNT>`;
        for (let i = 0; i < trackCount; i++) {
            let index = i + 1;
            xml += `<TRACK>
              <CHANNEL_INDEX>${index}</CHANNEL_INDEX>
              <INTERLEAVE_INDEX>${index}</INTERLEAVE_INDEX>
              <NAME>${replacedTrackName}</NAME>
          </TRACK>`;
        }
        xml += `</TRACK_LIST>
</BWFXML>`;
        return iXML.fromXml(xml);
    }
    write(buffer) {
        Buffer.from(this.id).copy(buffer, 0, 0, 4);
        buffer.writeUIntLE(this.size, 4, 4);
        this.wavBuffer.copy(buffer, 8, 0, this.size);
    }
}
exports.iXML = iXML;
