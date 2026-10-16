import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const file = readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const match = file.match(/^const tracks = (\[[\s\S]*?\]);\s*const palettes/m);
assert.ok(match, 'Expected a top-level tracks catalog');
const catalog = vm.runInNewContext(match[1]);

const expectedIds = [
  'babydoll', 'without-me', 'normal-guy-2', 'sailor-song',
  'cant-tell-me-nothing', 'love-me-not', 'i-thought-i-saw-your-face', 'lonely'
];
test('all eight user-requested tracks appear in the correct order', () => {
  assert.deepEqual(Array.from(catalog.slice(0,8), t => t.id), expectedIds);
});
test('original six compositions are preserved', () => {
  for (const id of ['afterglow','greenline','paper-moon','soft-focus','tiny-hours','wide-awake']) {
    assert.ok(catalog.some(t => t.id === id), id + ' missing');
  }
});
test('every catalog record has unique ID and readable Strudel source', () => {
  const ids = catalog.map(t=>t.id);
  assert.equal(new Set(ids).size, ids.length);
  for(const track of catalog) {
    assert.ok(track.title && track.artist && track.codeUrl);
    const src=new URL('../'+track.codeUrl,import.meta.url);
    assert.ok(existsSync(src),track.codeUrl+' missing');
    const content=readFileSync(src,'utf8');
    assert.ok(content.includes('stack(')||content.includes('$:'),track.id+' has no pattern');
    assert.ok(!content.includes('.mp3'),track.id+' embeds commercial audio');
  }
});
test('inspired-by studies are not presented as original masters', () => {
  for (const track of catalog.slice(0,8)) {
    assert.match(track.title,/Study/);
    assert.match(track.artist,/reference/);
  }
});
