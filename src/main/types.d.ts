export interface id3Message {
    title: string;
    album: string;
    artist: string;
    image: {
      mime: string;
      type: {
        id: number;
        name: string;
      };
      description?: string;
      imageBuffer: Uint8Array;
    };
    raw: {
      TIT2: string;
      TPE1: string;
      APIC: any;
      TALB: string;
      TXXX: {
        description: string;
        value: string;
      }[];
    };
    userDefinedText: [{
      description: 'song id';
      value: string;
    },{
      description: 'al id';
      value: string;
    },{
      description: 'ar ids';
      value: string;
    }];
    path:string
    time:number
    comment?:{
      language:string
      text:any
    }
  }