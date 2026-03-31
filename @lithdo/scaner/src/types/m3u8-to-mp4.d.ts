declare module 'm3u8-to-mp4' {
  class M3U8ToMP4 {
    setInputFile(inputFile: string): M3U8ToMP4;
    setOutputFile(outputFile: string): M3U8ToMP4;
    start(): Promise<void>;
  }
  export = M3U8ToMP4;
}
