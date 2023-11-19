import {DARK, LIGHT} from './consts';
export const getColorString = (color) => {
    if(color === 'DARK') return 'dark';
    if(color === 'LIGHT') return 'light';
};