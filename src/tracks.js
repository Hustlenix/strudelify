// Curated starting catalog. These are original instrumental studies,
// not transcriptions and not the copyrighted recordings.
const sketch = ({ bpm, drums, bass, chords, lead, color }) => `// Strudelify listening sketch — editable live music
// This is not the original master recording or a verified transcription.
stack(
  s("${drums}").gain(.33),
  note("${bass}").s("sawtooth").lpf(410).gain(.24),
  note("${chords}").s("triangle").attack(.04).release(.45).gain(.17).room(.18),
  note("${lead}").s("${color}").decay(.27).sustain(0).gain(.15).room(.24)
).cpm(${bpm}/4)`;

export const TRACKS = [
  {
    id: 'babydoll', title: 'Babydoll', artist: 'Dominic Fike',
    genre: 'Indie / alternative', mood: 'Soft distortion, elastic groove',
    bpm: 83, emblem: '✳', colors: ['#7e9a75','#32493b'],
    code: sketch({bpm:83,drums:'bd ~ sd ~, hh*8',bass:'d2 ~ a2 d2 g2 ~ d2 g2',
      chords:'<[d3,fs3,a3] [g3,b3,d4] [b2,d3,fs3] [a2,cs3,e3]>',
      lead:'fs4 [e4 fs4] a4 [b4 a4]',color:'sine'})
  },
  {
    id: 'without-me', title: 'Without Me', artist: 'Eminem',
    genre: 'Hip-hop', mood: 'Bright synths, animated drums',
    bpm: 112, emblem: '↯', colors: ['#d6906f','#724038'],
    code: sketch({bpm:112,drums:'bd [~ bd] sd [~ bd], hh*8',
      bass:'d2 d2 [a1 d2] c2',chords:'<[d4,fs4,a4] [c4,e4,g4] [g3,b3,d4] [a3,cs4,e4]>',
      lead:'d5 [fs5 a5] g5 [e5 d5]',color:'square'})
  },
  {
    id:'normal-guy-2', title:'Everyday Normal Guy 2', artist:'Jon Lajoie',
    genre:'Comedy / hip-hop', mood:'Minimal piano and deadpan rhythm',
    bpm:90, emblem:'▦', colors:['#9889be','#41355d'],
    code: sketch({bpm:90,drums:'bd ~ [~ bd] ~, ~ sd ~ sd, hh*8',
      bass:'d2 ~ d2 a1',chords:'<[d4,f4,a4] [c4,e4,g4] [bb3,d4,f4] [a3,c4,e4]>',
      lead:'a4 ~ g4 [f4 e4]',color:'triangle'})
  },
  {
    id:'sailor-song', title:'Sailor Song', artist:'Gigi Perez',
    genre:'Indie folk', mood:'Intimate guitar-inspired harmonies',
    bpm:96, emblem:'✺', colors:['#769bb3','#304459'],
    code: sketch({bpm:96,drums:'bd ~ ~ ~, ~ ~ sd ~, hh*4',
      bass:'gs2 e2 b1 fs2',chords:'<[gs3,b3,ds4] [e3,gs3,b3] [b2,ds3,fs3] [fs3,as3,cs4]>',
      lead:'[gs4 b4] [ds5 cs5] [b4 gs4] [fs4 gs4]',color:'sine'})
  },
  {
    id:'cant-tell-me-nothing', title:"Can't Tell Me Nothing", artist:'Kanye West',
    genre:'Hip-hop', mood:'Wide minor chords, low-end weight',
    bpm:80, emblem:'◈', colors:['#bb9561','#674b2c'],
    code: sketch({bpm:80,drums:'bd ~ [~ bd] ~, ~ sd ~ sd, hh*8',
      bass:'c2 [c2 g1] bb1 [bb1 g1]',chords:'<[c4,eb4,g4] [bb3,d4,f4] [ab3,c4,eb4] [g3,b3,d4]>',
      lead:'g4 bb4 ab4 [eb4 d4]',color:'sawtooth'})
  },
  {
    id:'love-me-not', title:'Love Me Not', artist:'Ravyn Lenae',
    genre:'Alternative R&B', mood:'Airy electric keys and skipping bass',
    bpm:112, emblem:'❋', colors:['#c78bb6','#704e78'],
    code: sketch({bpm:112,drums:'bd [~ bd] ~ bd, ~ cp ~ cp, hh*8',
      bass:'g2 [~ b2] d2 [~ g2]',chords:'<[g3,b3,d4,fs4] [e3,g3,b3,d4] [c3,e3,g3,b3] [d3,fs3,a3,c4]>',
      lead:'b4 [a4 g4] d5 [b4 a4]',color:'sine'})
  },
  {
    id:'i-thought-i-saw-your-face', title:'I Thought I Saw Your Face Today', artist:'She & Him',
    genre:'Vintage pop', mood:'Piano-pop warmth and whistled textures',
    bpm:78, emblem:'✿', colors:['#c6ab72','#77603b'],
    code: sketch({bpm:78,drums:'bd ~ ~ ~, ~ sd ~ sd, hh*8',
      bass:'g2 d2 e2 c2',chords:'<[g3,b3,d4] [d3,fs3,a3] [e3,g3,b3] [c3,e3,g3]>',
      lead:'d5 [b4 d5] e5 [d5 b4]',color:'triangle'})
  },
  {
    id:'lonely', title:'Lonely', artist:'Akon',
    genre:'R&B', mood:'Melodic keys and slow backbeat',
    bpm:90, emblem:'☾', colors:['#82a7b1','#335461'],
    code: sketch({bpm:90,drums:'bd ~ bd ~, ~ sd ~ sd, hh*8',
      bass:'c2 g1 ab1 bb1',chords:'<[c4,eb4,g4] [ab3,c4,eb4] [bb3,d4,f4] [g3,b3,d4]>',
      lead:'g5 [eb5 c5] ab5 [g5 eb5]',color:'sine'})
  }
];

export const TRACK_BY_ID = Object.fromEntries(TRACKS.map(track => [track.id, track]));
