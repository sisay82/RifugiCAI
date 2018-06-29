import * as path from 'path';

export const OUT_DIR = path.join(__dirname, '../../../dist');

export const MONTHS = [
    'gennaio',
    'febbraio',
    'marzo',
    'aprile',
    'maggio',
    'giugno',
    'luglio',
    'agosto',
    'settembre',
    'ottobre',
    'novembre',
    'dicembre'
];

export const CSV_FIELDS = {
    'name': 'Nome',
    'alias': 'Alias',
    'geoData.location.region': 'Regione'
}
