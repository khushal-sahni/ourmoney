/**
 * Shared fictional geography for all synthetic scenarios.
 * Names are compound/administrative and are not real Indian districts.
 * Each scheme attaches different implementing bodies to the same places.
 */

export const GAZETTEER = {
  national: {
    id: 'india',
    shortName: 'Central release'
  },
  states: {
    kanak: {
      id: 'kanak',
      shortName: 'Kanak Pradesh',
      code: 'KANAK'
    },
    girikhand: {
      id: 'girikhand',
      shortName: 'Girikhand',
      code: 'GIRI'
    },
    meera: {
      id: 'meera',
      shortName: 'Meera Coast',
      code: 'MEERA'
    }
  },
  districts: {
    raital: {
      id: 'raital',
      shortName: 'Raital',
      stateId: 'kanak',
      code: 'RAI'
    },
    chandanpur: {
      id: 'chandanpur',
      shortName: 'Chandanpur Kalan',
      stateId: 'kanak',
      code: 'CHK'
    },
    morwa: {
      id: 'morwa',
      shortName: 'Morwa East',
      stateId: 'kanak',
      code: 'MOR'
    },
    patharwadi: {
      id: 'patharwadi',
      shortName: 'Patharwadi',
      stateId: 'girikhand',
      code: 'PAT'
    },
    sitabari: {
      id: 'sitabari',
      shortName: 'Sitabari',
      stateId: 'girikhand',
      code: 'SIT'
    },
    dhowli: {
      id: 'dhowli',
      shortName: 'Dhowli',
      stateId: 'meera',
      code: 'DHO'
    },
    nirmalbandh: {
      id: 'nirmalbandh',
      shortName: 'Nirmalbandh',
      stateId: 'meera',
      code: 'NIR'
    }
  },
  /** Dense drill-down branch under Raital. */
  blocks: {
    raitalSadar: {
      id: 'raital-sadar',
      shortName: 'Raital Sadar',
      districtId: 'raital',
      code: 'RSAD'
    },
    kharonda: {
      id: 'kharonda',
      shortName: 'Kharonda',
      districtId: 'raital',
      code: 'KHR'
    },
    uttarRaital: {
      id: 'uttar-raital',
      shortName: 'Uttar Raital',
      districtId: 'raital',
      code: 'URAI'
    }
  }
} as const;

/** 1 crore rupees expressed in paise. */
export const CRORE = 1_000_000_000;
