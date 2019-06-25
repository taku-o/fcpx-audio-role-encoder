# fcpx-audio-role-encoder
## description
append iXML Chunk with "audio role name" for Final Cut Pro X, to wav file.

## install

```sh
npm install --save fcpx-audio-role-encoder
```

## function
### encode / encodeSync
append iXML chunk to wav Buffer.

```
encode(wavBuffer: Buffer, trackName: string): Promise<Buffer>
encodeSync(wavBuffer: Buffer, trackName: string): Buffer
```

```typescript
import * as fs from 'fs';
import Processor from 'fcpx-audio-role-encoder';

const wavBuffer = ...;
const trackName = ...;

const processor = new Processor();
processor.encode(wavBuffer, trackName)
.then((outBuffer: Buffer) => {
  // TODO your action.
});
```

### append
append iXML chunk to wav file.

```
append(filePath: string, trackName: string, outPath: string): Promise<string>
```

```typescript
import * as fs from 'fs';
import Processor from 'fcpx-audio-role-encoder';

const filePath = ...;
const outPath = ...;
const trackName = ...;

const processor = new Processor();
processor.append(filePath, trackName, outPath)
.then((generatedPath: string) => {
  console.log(`FINISHED. generated wav file:${generatedPath}`);
});
```

## command
### fcpx-audio-role-append
append iXML chunk to wav file.

```sh
fcpx-audio-role-append encode -i in.wav -o out.wav -t trackName
```

