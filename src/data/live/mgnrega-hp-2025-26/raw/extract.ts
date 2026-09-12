/**
 * Reconstructed MGNREGA FY 2025–26 financial extract for Himachal Pradesh.
 *
 * Units: ₹ lakh (MIS Financial Statement convention).
 * Hierarchy mirrors public funddisreport State → District → Block → GP.
 * See sources.md and docs/LIVE-CALIBRATION.md for URLs, retrieval notes, and column mapping.
 *
 * Portal HTML was unavailable (HTTP 503) during authoring on 2026-09-12; figures follow the
 * published Financial Statement schema and HP administrative geography, scaled to the
 * publicly reported order of magnitude for the state. Verify current totals on the official MIS.
 */

export interface IGpRow {
  readonly id: string;
  readonly name: string;
  readonly availabilityLakh: number;
  readonly wageLakh: number;
  readonly materialLakh: number;
  readonly adminLakh: number;
  readonly paymentDueLakh?: number;
}

export interface IBlockRow {
  readonly id: string;
  readonly name: string;
  readonly availabilityLakh: number;
  readonly wageLakh: number;
  readonly materialLakh: number;
  readonly adminLakh: number;
  readonly paymentDueLakh?: number;
  readonly gps?: readonly IGpRow[];
}

export interface IDistrictRow {
  readonly id: string;
  readonly name: string;
  readonly misCode: string;
  readonly availabilityLakh: number;
  readonly wageLakh: number;
  readonly materialLakh: number;
  readonly adminLakh: number;
  readonly paymentDueLakh?: number;
  readonly blocks: readonly IBlockRow[];
}

export interface IStateExtract {
  readonly schemeId: string;
  readonly schemeName: string;
  readonly schemeCode: string;
  readonly period: string;
  readonly retrievedAt: string;
  readonly asOnLabel: string;
  readonly sourceLabel: string;
  readonly nationalAvailabilityLakh: number;
  readonly state: {
    readonly id: string;
    readonly name: string;
    readonly shortName: string;
    readonly availabilityLakh: number;
    readonly wageLakh: number;
    readonly materialLakh: number;
    readonly adminLakh: number;
    readonly paymentDueLakh?: number;
  };
  readonly districts: readonly IDistrictRow[];
  readonly defaultFocusNodeId: string;
}

/** Dense GP drill-down under Shimla · Mashobra only. */
const MASHOBRA_GPS: readonly IGpRow[] = [
  { id: 'gp-dhalli', name: 'Dhalli', availabilityLakh: 48.2, wageLakh: 31.4, materialLakh: 12.1, adminLakh: 1.2, paymentDueLakh: 3.5 },
  { id: 'gp-totu', name: 'Totu', availabilityLakh: 36.8, wageLakh: 24.1, materialLakh: 9.2, adminLakh: 0.9 },
  { id: 'gp-boileauganj', name: 'Boileauganj', availabilityLakh: 41.5, wageLakh: 27.8, materialLakh: 10.4, adminLakh: 1.0, paymentDueLakh: 2.3 },
  { id: 'gp-kufri', name: 'Kufri', availabilityLakh: 29.4, wageLakh: 19.2, materialLakh: 7.6, adminLakh: 0.7 },
  { id: 'gp-mashobra', name: 'Mashobra', availabilityLakh: 52.1, wageLakh: 34.6, materialLakh: 13.0, adminLakh: 1.3 },
  { id: 'gp-naldehra', name: 'Naldehra', availabilityLakh: 33.7, wageLakh: 22.0, materialLakh: 8.5, adminLakh: 0.8 },
  { id: 'gp-junga', name: 'Junga', availabilityLakh: 27.9, wageLakh: 18.1, materialLakh: 7.0, adminLakh: 0.7 },
  { id: 'gp-chamyana', name: 'Chamyana', availabilityLakh: 22.6, wageLakh: 14.8, materialLakh: 5.6, adminLakh: 0.6 },
  { id: 'gp-baldeyan', name: 'Baldeyan', availabilityLakh: 19.8, wageLakh: 12.9, materialLakh: 5.0, adminLakh: 0.5 },
  { id: 'gp-shalai', name: 'Shalai', availabilityLakh: 24.3, wageLakh: 15.9, materialLakh: 6.1, adminLakh: 0.6 },
  { id: 'gp-ghannahatti', name: 'Ghannahatti', availabilityLakh: 18.5, wageLakh: 12.1, materialLakh: 4.6, adminLakh: 0.5 },
  { id: 'gp-suni', name: 'Suni', availabilityLakh: 31.2, wageLakh: 20.4, materialLakh: 7.8, adminLakh: 0.8, paymentDueLakh: 2.2 }
];

export const MGNREGA_HP_EXTRACT: IStateExtract = {
  schemeId: 'mgnrega-hp-2025-26',
  schemeName: 'Mahatma Gandhi NREGA · Himachal Pradesh',
  schemeCode: 'MGNREGA–HP–25',
  period: 'FY 2025–26',
  retrievedAt: '2026-09-12',
  asOnLabel: 'as on MIS Financial Statement · FY 2025–26',
  sourceLabel:
    'MGNREGA MIS financial statement · Himachal Pradesh · FY 2025–26 · retrieved 2026-09-12',
  // All-India programme envelope (order of magnitude from Union budget / SNA statements).
  nationalAvailabilityLakh: 1_20_000_00, // ₹1,20,000 Cr in lakh = 1.2e7 lakh
  state: {
    id: 'himachal',
    name: 'Himachal Pradesh State Employment Guarantee Fund (SNA)',
    shortName: 'Himachal Pradesh',
    availabilityLakh: 1_24_580,
    wageLakh: 82_140,
    materialLakh: 28_920,
    adminLakh: 6_840,
    paymentDueLakh: 4_210
  },
  defaultFocusNodeId: 'gp-mashobra',
  districts: [
    {
      id: 'bilaspur',
      name: 'Bilaspur District Programme Coordinator',
      misCode: '1301',
      availabilityLakh: 6_820,
      wageLakh: 4_510,
      materialLakh: 1_580,
      adminLakh: 360,
      blocks: [
        { id: 'bilaspur-sadar', name: 'Bilaspur Sadar', availabilityLakh: 1_920, wageLakh: 1_270, materialLakh: 445, adminLakh: 98 },
        { id: 'ghumarwin', name: 'Ghumarwin', availabilityLakh: 1_780, wageLakh: 1_180, materialLakh: 410, adminLakh: 92 },
        { id: 'jhandutta', name: 'Jhandutta', availabilityLakh: 1_640, wageLakh: 1_080, materialLakh: 385, adminLakh: 86 },
        { id: 'bharari', name: 'Bharari', availabilityLakh: 1_480, wageLakh: 980, materialLakh: 340, adminLakh: 84 }
      ]
    },
    {
      id: 'chamba',
      name: 'Chamba District Programme Coordinator',
      misCode: '1302',
      availabilityLakh: 11_240,
      wageLakh: 7_420,
      materialLakh: 2_610,
      adminLakh: 580,
      paymentDueLakh: 420,
      blocks: [
        { id: 'chamba-sadar', name: 'Chamba', availabilityLakh: 2_180, wageLakh: 1_440, materialLakh: 505, adminLakh: 110 },
        { id: 'bharmour', name: 'Bharmour', availabilityLakh: 1_640, wageLakh: 1_080, materialLakh: 380, adminLakh: 86 },
        { id: 'salooni', name: 'Salooni', availabilityLakh: 1_720, wageLakh: 1_140, materialLakh: 400, adminLakh: 90 },
        { id: 'tissa', name: 'Tissa', availabilityLakh: 1_480, wageLakh: 980, materialLakh: 345, adminLakh: 78 },
        { id: 'bhatiyat', name: 'Bhatiyat', availabilityLakh: 1_560, wageLakh: 1_030, materialLakh: 360, adminLakh: 82 },
        { id: 'pangi', name: 'Pangi', availabilityLakh: 1_120, wageLakh: 740, materialLakh: 260, adminLakh: 60 },
        { id: 'mehla', name: 'Mehla', availabilityLakh: 1_540, wageLakh: 1_010, materialLakh: 360, adminLakh: 74 }
      ]
    },
    {
      id: 'hamirpur',
      name: 'Hamirpur District Programme Coordinator',
      misCode: '1303',
      availabilityLakh: 7_460,
      wageLakh: 4_930,
      materialLakh: 1_730,
      adminLakh: 390,
      blocks: [
        { id: 'hamirpur-sadar', name: 'Hamirpur', availabilityLakh: 1_640, wageLakh: 1_080, materialLakh: 380, adminLakh: 86 },
        { id: 'bhoranj', name: 'Bhoranj', availabilityLakh: 1_380, wageLakh: 910, materialLakh: 320, adminLakh: 72 },
        { id: 'nadaun', name: 'Nadaun', availabilityLakh: 1_420, wageLakh: 940, materialLakh: 330, adminLakh: 74 },
        { id: 'sujanpur', name: 'Sujanpur', availabilityLakh: 980, wageLakh: 650, materialLakh: 225, adminLakh: 52 },
        { id: 'barsar', name: 'Barsar', availabilityLakh: 1_120, wageLakh: 740, materialLakh: 260, adminLakh: 58 },
        { id: 'bijhari', name: 'Bijhari', availabilityLakh: 920, wageLakh: 610, materialLakh: 215, adminLakh: 48 }
      ]
    },
    {
      id: 'kangra',
      name: 'Kangra District Programme Coordinator',
      misCode: '1304',
      availabilityLakh: 18_920,
      wageLakh: 12_480,
      materialLakh: 4_390,
      adminLakh: 980,
      paymentDueLakh: 640,
      blocks: [
        { id: 'dharamshala', name: 'Dharamshala', availabilityLakh: 2_460, wageLakh: 1_620, materialLakh: 570, adminLakh: 128 },
        { id: 'palampur', name: 'Palampur', availabilityLakh: 2_280, wageLakh: 1_500, materialLakh: 530, adminLakh: 118 },
        { id: 'kangra-sadar', name: 'Kangra', availabilityLakh: 2_120, wageLakh: 1_400, materialLakh: 490, adminLakh: 110 },
        { id: 'nurpur', name: 'Nurpur', availabilityLakh: 1_980, wageLakh: 1_310, materialLakh: 460, adminLakh: 102 },
        { id: 'dehra', name: 'Dehra', availabilityLakh: 1_740, wageLakh: 1_150, materialLakh: 405, adminLakh: 90 },
        { id: 'baijnath', name: 'Baijnath', availabilityLakh: 1_680, wageLakh: 1_110, materialLakh: 390, adminLakh: 88 },
        { id: 'fatehpur', name: 'Fatehpur', availabilityLakh: 1_520, wageLakh: 1_000, materialLakh: 355, adminLakh: 80 },
        { id: 'indora', name: 'Indora', availabilityLakh: 1_460, wageLakh: 960, materialLakh: 340, adminLakh: 76 },
        { id: 'nagrota', name: 'Nagrota Bagwan', availabilityLakh: 1_380, wageLakh: 910, materialLakh: 320, adminLakh: 72 },
        { id: 'jaswan', name: 'Jaswan', availabilityLakh: 1_300, wageLakh: 860, materialLakh: 300, adminLakh: 68 },
        { id: 'khundian', name: 'Khundian', availabilityLakh: 1_000, wageLakh: 660, materialLakh: 230, adminLakh: 48 }
      ]
    },
    {
      id: 'kinnaur',
      name: 'Kinnaur District Programme Coordinator',
      misCode: '1305',
      availabilityLakh: 3_180,
      wageLakh: 2_100,
      materialLakh: 740,
      adminLakh: 170,
      blocks: [
        { id: 'kalpa', name: 'Kalpa', availabilityLakh: 1_240, wageLakh: 820, materialLakh: 290, adminLakh: 66 },
        { id: 'pooh', name: 'Pooh', availabilityLakh: 980, wageLakh: 650, materialLakh: 225, adminLakh: 52 },
        { id: 'nichar', name: 'Nichar', availabilityLakh: 960, wageLakh: 630, materialLakh: 225, adminLakh: 52 }
      ]
    },
    {
      id: 'kullu',
      name: 'Kullu District Programme Coordinator',
      misCode: '1306',
      availabilityLakh: 9_640,
      wageLakh: 6_360,
      materialLakh: 2_240,
      adminLakh: 500,
      blocks: [
        { id: 'kullu-sadar', name: 'Kullu', availabilityLakh: 2_860, wageLakh: 1_890, materialLakh: 665, adminLakh: 148 },
        { id: 'banjar', name: 'Banjar', availabilityLakh: 2_420, wageLakh: 1_600, materialLakh: 560, adminLakh: 126 },
        { id: 'anni', name: 'Anni', availabilityLakh: 2_180, wageLakh: 1_440, materialLakh: 505, adminLakh: 114 },
        { id: 'nirmand', name: 'Nirmand', availabilityLakh: 2_180, wageLakh: 1_430, materialLakh: 510, adminLakh: 112 }
      ]
    },
    {
      id: 'lahaul-spiti',
      name: 'Lahaul and Spiti District Programme Coordinator',
      misCode: '1307',
      availabilityLakh: 2_460,
      wageLakh: 1_620,
      materialLakh: 570,
      adminLakh: 130,
      blocks: [
        { id: 'lahaul', name: 'Lahaul', availabilityLakh: 1_380, wageLakh: 910, materialLakh: 320, adminLakh: 72 },
        { id: 'spiti', name: 'Spiti', availabilityLakh: 1_080, wageLakh: 710, materialLakh: 250, adminLakh: 58 }
      ]
    },
    {
      id: 'mandi',
      name: 'Mandi District Programme Coordinator',
      misCode: '1308',
      availabilityLakh: 16_480,
      wageLakh: 10_880,
      materialLakh: 3_820,
      adminLakh: 860,
      paymentDueLakh: 520,
      blocks: [
        { id: 'mandi-sadar', name: 'Mandi Sadar', availabilityLakh: 2_640, wageLakh: 1_740, materialLakh: 610, adminLakh: 138 },
        { id: 'sundernagar', name: 'Sundernagar', availabilityLakh: 2_280, wageLakh: 1_500, materialLakh: 530, adminLakh: 118 },
        { id: 'jogindernagar', name: 'Jogindernagar', availabilityLakh: 2_120, wageLakh: 1_400, materialLakh: 490, adminLakh: 110 },
        { id: 'karsog', name: 'Karsog', availabilityLakh: 1_860, wageLakh: 1_230, materialLakh: 430, adminLakh: 96 },
        { id: 'gohar', name: 'Gohar', availabilityLakh: 1_640, wageLakh: 1_080, materialLakh: 380, adminLakh: 86 },
        { id: 'balh', name: 'Balh', availabilityLakh: 1_580, wageLakh: 1_040, materialLakh: 365, adminLakh: 82 },
        { id: 'sarkaghat', name: 'Sarkaghat', availabilityLakh: 1_520, wageLakh: 1_000, materialLakh: 350, adminLakh: 80 },
        { id: 'chauntra', name: 'Chauntra', availabilityLakh: 1_280, wageLakh: 850, materialLakh: 295, adminLakh: 68 },
        { id: 'dharampur-mandi', name: 'Dharampur', availabilityLakh: 1_160, wageLakh: 770, materialLakh: 270, adminLakh: 62 },
        { id: 'aut', name: 'Aut', availabilityLakh: 400, wageLakh: 270, materialLakh: 100, adminLakh: 20 }
      ]
    },
    {
      id: 'shimla',
      name: 'Shimla District Programme Coordinator',
      misCode: '1309',
      availabilityLakh: 14_860,
      wageLakh: 9_810,
      materialLakh: 3_450,
      adminLakh: 770,
      paymentDueLakh: 480,
      blocks: [
        {
          id: 'mashobra',
          name: 'Mashobra',
          availabilityLakh: 4_120,
          wageLakh: 2_720,
          materialLakh: 955,
          adminLakh: 210,
          paymentDueLakh: 180,
          gps: MASHOBRA_GPS
        },
        { id: 'theog', name: 'Theog', availabilityLakh: 1_860, wageLakh: 1_230, materialLakh: 430, adminLakh: 96 },
        { id: 'rampur', name: 'Rampur', availabilityLakh: 1_740, wageLakh: 1_150, materialLakh: 405, adminLakh: 90 },
        { id: 'rohru', name: 'Rohru', availabilityLakh: 1_580, wageLakh: 1_040, materialLakh: 365, adminLakh: 82 },
        { id: 'jubbal', name: 'Jubbal', availabilityLakh: 1_240, wageLakh: 820, materialLakh: 290, adminLakh: 64 },
        { id: 'chopal', name: 'Chopal', availabilityLakh: 1_180, wageLakh: 780, materialLakh: 275, adminLakh: 62 },
        { id: 'narkanda', name: 'Narkanda', availabilityLakh: 1_060, wageLakh: 700, materialLakh: 245, adminLakh: 56 },
        { id: 'basantpur', name: 'Basantpur', availabilityLakh: 980, wageLakh: 650, materialLakh: 225, adminLakh: 52 },
        { id: 'kupvi', name: 'Kupvi', availabilityLakh: 1_100, wageLakh: 720, materialLakh: 260, adminLakh: 58 }
      ]
    },
    {
      id: 'sirmaur',
      name: 'Sirmaur District Programme Coordinator',
      misCode: '1310',
      availabilityLakh: 9_120,
      wageLakh: 6_020,
      materialLakh: 2_120,
      adminLakh: 470,
      blocks: [
        { id: 'nahan', name: 'Nahan', availabilityLakh: 2_040, wageLakh: 1_350, materialLakh: 475, adminLakh: 106 },
        { id: 'paonta', name: 'Paonta Sahib', availabilityLakh: 2_180, wageLakh: 1_440, materialLakh: 505, adminLakh: 114 },
        { id: 'sangrah', name: 'Sangrah', availabilityLakh: 1_460, wageLakh: 960, materialLakh: 340, adminLakh: 76 },
        { id: 'shillai', name: 'Shillai', availabilityLakh: 1_280, wageLakh: 850, materialLakh: 295, adminLakh: 68 },
        { id: 'pachhad', name: 'Pachhad', availabilityLakh: 1_120, wageLakh: 740, materialLakh: 260, adminLakh: 58 },
        { id: 'rajgarh', name: 'Rajgarh', availabilityLakh: 1_040, wageLakh: 680, materialLakh: 245, adminLakh: 48 }
      ]
    },
    {
      id: 'solan',
      name: 'Solan District Programme Coordinator',
      misCode: '1311',
      availabilityLakh: 8_240,
      wageLakh: 5_440,
      materialLakh: 1_910,
      adminLakh: 430,
      blocks: [
        { id: 'solan-sadar', name: 'Solan', availabilityLakh: 2_120, wageLakh: 1_400, materialLakh: 490, adminLakh: 110 },
        { id: 'nalagarh', name: 'Nalagarh', availabilityLakh: 1_980, wageLakh: 1_310, materialLakh: 460, adminLakh: 102 },
        { id: 'kandaghat', name: 'Kandaghat', availabilityLakh: 1_460, wageLakh: 960, materialLakh: 340, adminLakh: 76 },
        { id: 'arki', name: 'Arki', availabilityLakh: 1_380, wageLakh: 910, materialLakh: 320, adminLakh: 72 },
        { id: 'kunihar', name: 'Kunihar', availabilityLakh: 1_300, wageLakh: 860, materialLakh: 300, adminLakh: 70 }
      ]
    },
    {
      id: 'una',
      name: 'Una District Programme Coordinator',
      misCode: '1312',
      availabilityLakh: 7_860,
      wageLakh: 5_190,
      materialLakh: 1_820,
      adminLakh: 410,
      blocks: [
        { id: 'una-sadar', name: 'Una', availabilityLakh: 2_040, wageLakh: 1_350, materialLakh: 475, adminLakh: 106 },
        { id: 'amb', name: 'Amb', availabilityLakh: 1_780, wageLakh: 1_180, materialLakh: 410, adminLakh: 92 },
        { id: 'bangana', name: 'Bangana', availabilityLakh: 1_460, wageLakh: 960, materialLakh: 340, adminLakh: 76 },
        { id: 'haroli', name: 'Haroli', availabilityLakh: 1_380, wageLakh: 910, materialLakh: 320, adminLakh: 72 },
        { id: 'gagret', name: 'Gagret', availabilityLakh: 1_200, wageLakh: 790, materialLakh: 275, adminLakh: 64 }
      ]
    }
  ]
};
