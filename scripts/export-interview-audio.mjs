import {voiceCatalog,VOICE_PROFILES} from '../public/interview/voice-catalog.js';
process.stdout.write(JSON.stringify({version:1,profiles:VOICE_PROFILES,entries:voiceCatalog()}));
