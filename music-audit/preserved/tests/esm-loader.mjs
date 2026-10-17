// The published Kabelsalat packages expose ESM via `module`, while Node selects
// their browser IIFE via `main`. Select the shipped ESM; do not mock the runtime.
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const require=createRequire(import.meta.url);
export async function resolve(specifier,context,next){
 if(/^@kabelsalat\/(web|core|lib)$/.test(specifier))return {url:pathToFileURL(path.join(path.dirname(require.resolve(specifier)),'index.mjs')).href,shortCircuit:true};
 return next(specifier,context);
}
