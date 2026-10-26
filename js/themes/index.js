import { indianStreets } from './indian-streets.js';
import { mars } from './mars.js';

export const themes = Object.freeze({ [indianStreets.id]:indianStreets, [mars.id]:mars });
export function getTheme(id) { return Object.hasOwn(themes,id) ? themes[id] : indianStreets; }
