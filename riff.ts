interface Chunk {
  chunkLength: number;
  id: string;
  size: number;
  write(buffer: Buffer): void;
}

/**
 * RIFF
 */
export class Riff implements Chunk {
  chunkLength: number;
  id: string = 'RIFF';
  size: number;
  format: string = 'WAVE';
  subChunks: Chunk[] = [];

  constructor() {}
  static isChunk(buffer: Buffer) {
    if (buffer.length < 4) {
      return false;
    }
    const id = buffer.readUIntBE(0, 4);
    const idName = Buffer.from(id.toString(16), 'hex').toString();
    return idName == 'RIFF';
  }
  static from(buffer: Buffer) {
    const chunk = new Riff();
    // 1-4 Chunk ID "RIFF"
    chunk.id = Buffer.from(buffer.readUIntBE(0, 4).toString(16), 'hex').toString();
    // 5-8 Chunk Size
    chunk.size = buffer.readUIntLE(4, 4);
    chunk.chunkLength = chunk.size + 8;
    // 9-12  Format "WAVE"
    chunk.format = Buffer.from(buffer.readUIntBE(8, 4).toString(16), 'hex').toString();
    // 13-   SubChunks
    let pos = 12;
    while (pos < chunk.chunkLength) {
      if (Fmt.isChunk(buffer.slice(pos))) {
        const sub = Fmt.from(buffer.slice(pos));
        chunk.subChunks.push(sub);
        pos += sub.chunkLength;
        continue;
      } else if (WavData.isChunk(buffer.slice(pos))) {
        const sub = WavData.from(buffer.slice(pos));
        chunk.subChunks.push(sub);
        pos += sub.chunkLength;
        continue;
      } else if (iXML.isChunk(buffer.slice(pos))) {
        const sub = iXML.from(buffer.slice(pos));
        chunk.subChunks.push(sub);
        pos += sub.chunkLength;
        continue;
      } else {
        break;
      }
    }
    // return
    return chunk;
  }
  appendChunk(chunk: Chunk): void {
    this.subChunks.push(chunk);
    this.size += chunk.chunkLength;
    this.chunkLength = this.size + 8;
  }
  write(buffer: Buffer): void {
    // 1-4 Chunk ID "RIFF"
    Buffer.from(this.id).copy(buffer, 0, 0, 4);
    // 5-8 Chunk Size
    buffer.writeUIntLE(this.size, 4, 4);
    // 9-12  Format "WAVE"
    Buffer.from(this.format).copy(buffer, 8, 0, 4);
    // 13-   SubChunks
    let offset = 12;
    for (let chunk of this.subChunks) {
      chunk.write(buffer.slice(offset));
      offset += chunk.chunkLength;
    }
  }
}

/**
 * fmt Chunk
 */
export class Fmt implements Chunk {
  chunkLength: number = 24;
  id: string = 'fmt ';
  size: number = 16;
  audioFormat: number = 1;
  numChannels: number;
  sampleRate: number;
  byteRate: number;
  blockAlign: number;
  bitsPerSample: number;

  constructor() {}
  static isChunk(buffer: Buffer) {
    if (buffer.length < 4) {
      return false;
    }
    const id = buffer.readUIntBE(0, 4);
    const idName = Buffer.from(id.toString(16), 'hex').toString();
    return idName == 'fmt ';
  }
  static from(buffer: Buffer) {
    const chunk = new Fmt();
    // 1-4 Subchunk1 ID "fmt"
    chunk.id = Buffer.from(buffer.readUIntBE(0, 4).toString(16), 'hex').toString();
    // 5-8 Subchunk1 Size "16"
    chunk.size = buffer.readUIntLE(4, 4);
    // 9-10 Audio Format "1"
    chunk.audioFormat = buffer.readUIntLE(8, 2);
    // 11-12 Num Channels
    chunk.numChannels = buffer.readUIntLE(10, 2);
    // 13-16 Sample Rate
    chunk.sampleRate = buffer.readUIntLE(12, 4);
    // 17-20 Byte Rate
    chunk.byteRate = buffer.readUIntLE(16, 4);
    // 21-22 Block Align
    chunk.blockAlign = buffer.readUIntLE(20, 2);
    // 23-24 Bits Per Sample
    chunk.bitsPerSample = buffer.readUIntLE(22, 2);
    // return
    return chunk;
  }
  write(buffer: Buffer): void {
    // 1-4 Subchunk1 ID "fmt"
    Buffer.from(this.id).copy(buffer, 0, 0, 4);
    // 5-8 Subchunk1 Size "16"
    buffer.writeUIntLE(this.size, 4, 4);
    // 9-10 Audio Format "1"
    buffer.writeUIntLE(this.audioFormat, 8, 2);
    // 11-12 Num Channels
    buffer.writeUIntLE(this.numChannels, 10, 2);
    // 13-16 Sample Rate
    buffer.writeUIntLE(this.sampleRate, 12, 4);
    // 17-20 Byte Rate
    buffer.writeUIntLE(this.byteRate, 16, 4);
    // 21-22 Block Align
    buffer.writeUIntLE(this.blockAlign, 20, 2);
    // 23-24 Bits Per Sample
    buffer.writeUIntLE(this.bitsPerSample, 22, 2);
  }
}

/**
 * Wave Data Chunk
 */
class WavData implements Chunk {
  chunkLength: number;
  id: string = 'data';
  size: number;
  wavBuffer: Buffer;

  constructor() {}
  static isChunk(buffer: Buffer) {
    if (buffer.length < 4) {
      return false;
    }
    const id = buffer.readUIntBE(0, 4);
    const idName = Buffer.from(id.toString(16), 'hex').toString();
    return idName == 'data';
  }
  static from(buffer: Buffer) {
    const chunk = new WavData();
    // 1-4 Subchunk2 ID "data"
    chunk.id = Buffer.from(buffer.readUIntBE(0, 4).toString(16), 'hex').toString();
    // 5-8 Subchunk2 Size
    chunk.size = buffer.readUIntLE(4, 4);
    chunk.chunkLength = chunk.size + 8;
    // 9-  Subchunk2 data
    chunk.wavBuffer = buffer.slice(8, chunk.size + 8);
    // return
    return chunk;
  }
  write(buffer: Buffer): void {
    // 1-4 Subchunk2 ID "data"
    Buffer.from(this.id).copy(buffer, 0, 0, 4);
    // 5-8 Subchunk2 Size
    buffer.writeUIntLE(this.size, 4, 4);
    // 9-  Subchunk2 data
    this.wavBuffer.copy(buffer, 8, 0, this.size);
  }
}

/**
 * iXML Chunk
 */
export class iXML implements Chunk {
  chunkLength: number;
  id: string;
  size: number;
  wavBuffer: Buffer;

  constructor() {}
  static isChunk(buffer: Buffer) {
    if (buffer.length < 4) {
      return false;
    }
    const id = buffer.readUIntBE(0, 4);
    const idName = Buffer.from(id.toString(16), 'hex').toString();
    return idName == 'iXML';
  }
  static from(buffer: Buffer) {
    const chunk = new iXML();
    // 1-4 Subchunk3 ID "iXML"
    chunk.id = Buffer.from(buffer.readUIntBE(0, 4).toString(16), 'hex').toString();
    // 5-8 Subchunk3 Size
    chunk.size = buffer.readUIntLE(4, 4);
    chunk.chunkLength = chunk.size + 8;
    // 9-  Subchunk3 data
    chunk.wavBuffer = buffer.slice(8, chunk.size + 8);
    // return
    return chunk;
  }
  static fromXml(xml: string) {
    let xmlBuffer = Buffer.from(xml);
    if (xmlBuffer.length % 2 == 1) {
      xmlBuffer = Buffer.concat([xmlBuffer, Buffer.from(' ')]);
    }
    const chunk = new iXML();
    // 1-4 Subchunk3 ID "iXML"
    chunk.id = 'iXML';
    // 5-8 Subchunk3 Size
    chunk.size = xmlBuffer.length;
    chunk.chunkLength = chunk.size + 8;
    // 9-  Subchunk3 data
    chunk.wavBuffer = xmlBuffer;
    // return
    return chunk;
  }
  static fromTrackName(trackName: string, trackCount: number) {
    const replacedTrackName = trackName
      .replace(/</, '&lt;')
      .replace(/>/, '&gt;')
      .replace(/&/, '&amp;');
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<BWFXML>
    <IXML_VERSION>1.27</IXML_VERSION>
    <TRACK_LIST>
        <TRACK_COUNT>${trackCount}</TRACK_COUNT>`;
    for (let i = 0; i < trackCount; i++ ) {
      xml += `<TRACK>
              <CHANNEL_INDEX>${i}</CHANNEL_INDEX>
              <INTERLEAVE_INDEX>${i}</INTERLEAVE_INDEX>
              <NAME>${replacedTrackName}</NAME>
          </TRACK>`;
    }
    xml += `</TRACK_LIST>
</BWFXML>`;
    return iXML.fromXml(xml);
  }
  write(buffer: Buffer): void {
    // 1-4 Subchunk3 ID "iXML"
    Buffer.from(this.id).copy(buffer, 0, 0, 4);
    // 5-8 Subchunk3 Size
    buffer.writeUIntLE(this.size, 4, 4);
    // 9-  Subchunk3 data
    this.wavBuffer.copy(buffer, 8, 0, this.size);
  }
}
