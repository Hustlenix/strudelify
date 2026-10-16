import test from 'node:test';
import assert from 'node:assert/strict';
import { TRACKS, TRACK_BY_ID } from '../src/tracks.js';

const originalOrder = [
  'babydoll','without-me','normal-guy-2','sailor-song',
  'cant-tell-me-nothing','love-me-not','i-thought-i-saw-your-face','lonely'
];
test('the original eight songs remain in user-specified order', () => {
  assert.deepEqual(TRACKS.map(t => t.id), originalOrder);
});
test('each catalog entry is uniquely addressable and has display metadata', () => {
  assert.equal(new Set(TRACKS.map(t => t.id)).size, 8);
  for (const track of TRACKS) {
    assert.equal(TRACK_BY_ID[track.id], track);
    for (const field of ['id','title','artist','genre','mood','emblem']) {
      assert.equal(typeof track[field], 'string', field + ' on ' + track.id);
      assert.ok(track[field].length > 0);
    }
    assert.equal(track.colors.length, 2);
    assert.ok(track.bpm >= 40 && track.bpm <= 200);
  }
});
test('Strudel sketches are independent patterns, not links to MP3 files', () => {
  for (const track of TRACKS) {
    assert.match(track.code,/stack\(/);
    assert.match(track.code,/\.cpm\(/);
    assert.match(track.code,/note\(/);
    assert.match(track.code,/s\(/);
    assert.ok(!/\.mp3|https?:\/\/.*audio/i.test(track.code));
  }
});
