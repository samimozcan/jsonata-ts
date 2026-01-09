import { z } from 'zod';

/** * Dakosy Validation Schema: FreierVerkehrAktVeredelUmwandlung
 * Strictly following types and rules from the provided specification[cite: 1, 696].
 */

// --- Helper Schemas for Dakosy Data Types ---
const an = (max: number) => z.string().max(max);

// Numeric types: n..X.Y (X=Total digits including decimal point, Y=Decimal places) [cite: 725, 726]
// Accepts both string and number inputs, coerces to string for validation
const n = (total: number, decimals: number) => {
  const integerPart = `\\d{1,${total - decimals}}`;
  const decimalPart = decimals > 0 ? `(\\.\\d{1,${decimals}})?` : '';
  const pattern = new RegExp(`^${integerPart}${decimalPart}$`);
  return z
    .union([z.string(), z.number()])
    .transform((val) => String(val))
    .refine((val) => pattern.test(val), `Numeric format n..${total}.${decimals} required`);
};

const dakosyDateTime = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'Format CCYY-MM-DDTHH:MM:SS required [cite: 6]');

const dakosyDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD required [cite: 182]');

const indicator = z.enum(['J', 'N', '1', '0', 'Y']);

const unionArrayOrSingle = <T extends z.ZodTypeAny>(schema: T, maxItems: number) => {
  return z.union([z.array(schema).max(maxItems), schema]);
};

export const DakosyZodSchema = z
  .object({
    FreierVerkehrAktVeredelUmwandlung: z.object({
      Transaktion: z.object({
        IOPartner: an(100), // Participant Code [cite: 4]
        IODivision1: an(10).nullish(),
        IODivision2: an(10).nullish(),
        IODivision3: an(10).nullish(),
        IOReferenz: an(35), // Transaction Identification [cite: 6]
        IODatumZeit: dakosyDateTime,
        Version: z
          .string()
          .regex(/^\d{3}$/)
          .nullish(), // n3 [cite: 7]
      }),
      EinzelAnmeldung: z.object({
        ObjektIdentifizierung: z.object({
          ObjektName: an(22), // Reference Number / LRN [cite: 11, 12]
          ObjektAlias: an(35).nullish(),
          AnmeldungArt: an(5).nullish(), // e.g., EZA-A [cite: 14, 17]
          BezugsnummerVorblendung: an(35).nullish(),
          UserVorblendung: an(10).nullish(),
          KopieVon: an(35).nullish(),
          ObjektAktion: z.enum(['CREATE', 'REPLACE', 'CHANGE', 'COMPLETE', 'SEND']).nullish(), // [cite: 25, 26]
          CompliancePruefung: z.enum(['ON', 'OFF']).nullish(),
          Bearbeiter: an(70), // Contact Person [cite: 30]
          AnfBemerkungStatusanzeige: an(17).nullish(),
          AbsenderSystemName: an(6).nullish(),
          ShipmentReferenz: an(35).nullish(),
        }),
        KopfDaten: z.object({
          AdressierteZollstelle: an(4).nullish(),
          AnmelderIstEmpfaenger: an(1).nullish(),
          VertretungsverhaeltnisCode: an(1), // Mandatory [cite: 42, 43]
          Vorsteuerabzug: an(1).nullish(),
          NameAnmeldenderBearbeiter: an(35), // Mandatory [cite: 47]
          TelefonnummerAnmeldenderBearbeiter: an(35), // Mandatory [cite: 48]
          StellungAnmeldenderBearbeiter: an(35), // Mandatory [cite: 49]
          EmailAdresseAnmeldenderBearbeiter: an(256).nullish(),
          FiskalvertretungKz: z.enum(['J', 'N', ' ']).nullish(),
          ZusammenfassendeMeldungKzStdKto: indicator.nullish(),
          ZusammenfassendeMeldungMelderkto: an(32).nullish(),
          IntrastatKzStdKto: indicator.nullish(),
          IntrastatMelderkto: an(32).nullish(),
          Ausstellungsort: an(35).nullish(), // Mandatory [cite: 64]
          ZollrechtlicherStatus: z.enum(['CO', 'EU', 'IM']).nullish(), // [cite: 65]
          GesamtRohMasse: n(10, 1).nullish(), // [cite: 71]
          VerfahrenBeantragtCode: an(2).nullish(), // [cite: 75]
          VerkehrszweigInland: an(1).nullish(),
          VerkehrszweigGrenze: an(1).nullish(),
          VersendungslandCode: an(2).nullish(), // [cite: 82]
          Bestimmungsbundesland: an(2).nullish(),
          Bestimmungsland: an(2).nullish(),
          KennzeichenNameBefoerderungsmittelAnkunft: an(30).nullish(),
          BefoerderungsmittelGrenzeStaatszugehoerigkeitCode: an(2).nullish(),
          BefoerderungsmittelGrenzeArt: an(2).nullish(),
          BefoerderungsmittelGrenze: an(17).nullish(),
          LieferbedingungCode: an(3).nullish(),
          LieferbedingungText: an(100).nullish(),
          LieferbedingungSchluessel: an(1).nullish(),
          LieferbedingungOrt: an(35).nullish(),
          VorpapierArtCode: an(6).nullish(),
          VorpapierNr: an(28).nullish(),
          ArtGeschaeftCode: an(2).nullish(),
          StatistikStatus: an(2).nullish(),
          Warenort: an(35).nullish(),
          Rechnungspreis: n(13, 2).nullish(),
          Rechnungswaehrung: an(3).nullish(),
          DV1Kz: an(1).nullish(),
          FruehereEntscheidungen: an(100).nullish(),
          Verbundenheit: an(1).nullish(),
          VerbundenheitEinzelheiten: an(100).nullish(),
          EinschraenkungenKz: an(1).nullish(),
          BedingungenLeistungenKz: an(1).nullish(),
          BedingungenLeistungenArt: an(100).nullish(),
          LizenzgebuehrenKz: an(1).nullish(),
          LizenzgebuehrenUmstand: an(100).nullish(),
          SpezielleVereinbarungKz: an(1).nullish(),
          SpezielleVereinbarungUmstand: an(100).nullish(),
          IATAAbflughafen: an(5).nullish(),

          // DV1 Cost Distribution Section [cite: 150, 151]
          DV1Kostenverteilung: unionArrayOrSingle(
            z.object({
              Kostenart: an(4).nullish(),
              Kosten: n(13, 2).nullish(),
              KostenWaehrung: an(3).nullish(),
              WechselkursArt: an(2).nullish(),
              Wechselkurs: n(18, 9).nullish(),
              WechselkursDatum: dakosyDate.nullish(),
              Verteilungsart: an(30).nullish(),
              Minimalbetrag: n(13, 2).nullish(),
              RabattProzent: n(7, 5).nullish(),
              SkontoProzent: n(7, 5).nullish(),
              Bemerkungen: an(30).nullish(),
            }),
            30
          ).nullish(),

          Unterlage: unionArrayOrSingle(
            z.object({
              Bereich: an(1).nullish(), // Document Division [cite: 177]
              Art: an(4).nullish(),
              Nummer: an(35).nullish(),
              DatumAusstellung: dakosyDate.nullish(),
            }),
            20
          ).nullish(),

          KzAutoBestaetigung: an(1).nullish(),
          AnschreibungDatum: dakosyDate.nullish(),
          VereinfachterBewilligungsantragKzAV: an(1).nullish(),
          Eingangszollstelle: an(8).nullish(),
          Zahlungsart: an(1).nullish(),

          Aufschub: unionArrayOrSingle(
            z.object({
              Aufschubart: an(2).nullish(),
              ArtAufschubantrag: an(1).nullish(),
              AufschubnehmerEORI: an(17).nullish(),
              KennbuchstabenAufschub: an(3).nullish(),
              KontoNr: an(6).nullish(),
              AufschubBIN: an(25).nullish(),
            }),
            5
          ).nullish(),

          SumABeendigungsAnteil: unionArrayOrSingle(
            z.object({
              SumARegistriernummer: an(21),
              SumAPosNr: z.string().regex(/^\d{1,4}$/),
              BeendigungsPackstueckzahl: z.string().regex(/^\d{1,5}$/),
              ArtIdentifikation: an(3).nullish(),
              VerwahrerEORI: an(17).nullish(),
              SpezifOrdnungsbegriffArt: an(3).nullish(),
              SpezifOrdnungsbegriff: an(44).nullish(),
            }),
            999
          ).nullish(),

          ContainerNr: unionArrayOrSingle(an(11), 9).nullish(),
          BeendigungsAnteilArtCode: an(10).nullish(),
          BewilligungsIDZLAVUV: an(35).nullish(),
          BezugsnummerBEAnteilZL: an(35).nullish(),

          Adressen: unionArrayOrSingle(
            z.object({
              AdressTyp: z.enum(['DT', 'UC', 'SE', 'BY', 'CN', 'CZ', 'CB', 'AA', 'AAP']), // [cite: 352]
              AdressCode: an(10).nullish(),
              TeilnehmerEORI: an(17).nullish(),
              TeilnehmerNLNR: z
                .string()
                .refine((val) => val === '' || /^\d{1,4}$/.test(val), 'Must be empty or 1-4 digits')
                .nullish(), // Subsidiary Number [cite: 356]
              NameFirma: an(120).nullish(),
              StrasseHausNr: an(35).nullish(),
              Ortsteil: an(35).nullish(),
              LandCode: an(3).nullish(),
              'PLZ-S': an(9).nullish(),
              'Ort-S': an(35).nullish(),
              FinanzamtIDAnmelder: an(4).nullish(),
              Bewilligungsnummer: an(35).nullish(),
            }),
            10
          ).nullish(),
        }),
        WarenPosition: unionArrayOrSingle(
          z.object({
            Positionsnummer: z
              .union([z.string(), z.number()])
              .transform((val) => String(val))
              .refine((val) => /^\d{1,5}$/.test(val), 'Must be 1-5 digits'), // seq5 [cite: 391]
            ArtikelNummer: an(35).nullish(),
            WarenNummerEZT: an(11), // Commodity Code [cite: 394]
            WarenNummerZusatzCode: unionArrayOrSingle(an(4), 10).nullish(),
            WarenBezeichnung: an(240), // Mandatory [cite: 399]
            AbgabensteuerungKz: an(2).nullish(),
            EUCode: unionArrayOrSingle(an(3), 99).nullish(),
            UrsprungslandCode: an(2).nullish(),
            Praeferenzursprungsland: an(4).nullish(),
            Rohmasse: n(10, 1).nullish(),
            Eigenmasse: n(10, 1), // Net Mass Measure [cite: 424]
            AHStatMenge: n(12, 3).nullish(),
            AHStatMengeMasseinheit: an(3).nullish(),
            AHStatMengeQualifier: an(1).nullish(),
            KostenEUSt: n(11, 2).nullish(),
            AHStatWert: n(9, 0).nullish(),
            PackstueckAnzahl: n(9, 0).nullish(),
            PackstueckArt: an(2).nullish(),
            PackstueckZeichen: an(70).nullish(),
            WarenMenge: unionArrayOrSingle(
              z.object({
                Menge: n(12, 3).nullish(),
                Masseinheit: an(3).nullish(),
                Qualifier: an(1).nullish(),
              }),
              5
            ).nullish(),
            BeguenstigungBeantragtCode: z
              .union([z.string(), z.number()])
              .transform((val) => String(val))
              .pipe(z.string().max(3))
              .nullish(),
            Kontingentnummer: unionArrayOrSingle(an(4), 2).nullish(),
            PositionsZusatz: an(100).nullish(),
            AHStatWertManuellKZ: an(1).nullish(),
            Zollwert: n(11, 2).nullish(), // [cite: 618]

            AbzugHinzurechnung: unionArrayOrSingle(
              z.object({
                ArtCode: an(3).nullish(),
                Betrag: n(11, 2).nullish(),
                Waehrung: an(3).nullish(),
                KursVereinbartKz: an(1).nullish(),
                KursDatum: dakosyDate.nullish(),
              }),
              12
            ).nullish(),
          }),
          999
        ), // [cite: 390]
      }),
    }),
  })
  .superRefine((data, ctx) => {
    const warenPositionen = data.FreierVerkehrAktVeredelUmwandlung.EinzelAnmeldung.WarenPosition;

    // Convert to array if single item
    const positionen = Array.isArray(warenPositionen)
      ? warenPositionen
      : warenPositionen
        ? [warenPositionen]
        : [];

    // Rule 1: Positionsnummer must start at 1 and be sequential (1, 2, 3, ...)
    positionen.forEach((pos, index) => {
      const expectedNumber = index + 1;
      const actualNumber = parseInt(String(pos.Positionsnummer), 10);
      if (actualNumber !== expectedNumber) {
        ctx.addIssue({
          code: 'custom',
          message: `Positionsnummer must be sequential starting from 1. Position ${index + 1} should have Positionsnummer=${expectedNumber}, but got ${actualNumber}`,
          path: [
            'FreierVerkehrAktVeredelUmwandlung',
            'EinzelAnmeldung',
            'WarenPosition',
            index,
            'Positionsnummer',
          ],
        });
      }
    });

    // Rule 2: At least one WarenPosition is required
    if (positionen.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'At least one WarenPosition is required',
        path: ['FreierVerkehrAktVeredelUmwandlung', 'EinzelAnmeldung', 'WarenPosition'],
      });
    }

    // Rule 3: Sum of Eigenmasse should not exceed GesamtRohMasse (if GesamtRohMasse is provided)
    const gesamtRohMasse =
      data.FreierVerkehrAktVeredelUmwandlung.EinzelAnmeldung.KopfDaten.GesamtRohMasse;
    if (gesamtRohMasse) {
      const totalEigenmasse = positionen.reduce((sum, pos) => {
        const eigenmasse = parseFloat(String(pos.Eigenmasse)) || 0;
        return sum + eigenmasse;
      }, 0);
      const gesamtRohMasseNum = parseFloat(String(gesamtRohMasse));
      if (totalEigenmasse > gesamtRohMasseNum) {
        ctx.addIssue({
          code: 'custom',
          message: `Sum of Eigenmasse (${totalEigenmasse}) exceeds GesamtRohMasse (${gesamtRohMasseNum})`,
          path: [
            'FreierVerkehrAktVeredelUmwandlung',
            'EinzelAnmeldung',
            'KopfDaten',
            'GesamtRohMasse',
          ],
        });
      }
    }

    // Rule 4: Validate required address types (CN = Consignee, CZ = Exporter are typically required)
    const adressen = data.FreierVerkehrAktVeredelUmwandlung.EinzelAnmeldung.KopfDaten.Adressen;
    if (adressen) {
      const adressenArray = Array.isArray(adressen) ? adressen : [adressen];
      const addressTypes = adressenArray.map((a) => a.AdressTyp);

      // CN (Consignee) is typically required
      if (!addressTypes.includes('CN')) {
        ctx.addIssue({
          code: 'custom',
          message: 'Address type CN (Consignee) is required',
          path: ['FreierVerkehrAktVeredelUmwandlung', 'EinzelAnmeldung', 'KopfDaten', 'Adressen'],
        });
      }
    }
  });

const data = {
  FreierVerkehrAktVeredelUmwandlung: {
    Transaktion: {
      Version: '004',
      IOPartner: 'VERA',
      IOReferenz: '4803/26000336/A04012026_205651',
      IODatumZeit: '2026-01-08T12:55:10.390Z',
      IODivision3: 'SUB',
    },
    EinzelAnmeldung: {
      KopfDaten: {
        Adressen: [
          {
            'Ort-S': 'Eichenzell',
            'PLZ-S': '36124',
            LandCode: 'DE',
            Ortsteil: '',
            AdressTyp: 'CN',
            NameFirma: 'LLS-Germany GbR',
            AdressCode: '1',
            StrasseHausNr: 'Eschengrund 7',
            TeilnehmerEORI: 'DE607826053493676',
            TeilnehmerNLNR: '0000',
          },
          {
            'Ort-S': 'Osmangazi/ Bursa',
            'PLZ-S': '16250',
            LandCode: 'TR',
            Ortsteil: '',
            AdressTyp: 'CZ',
            NameFirma: 'Narin Kacuk Hortum Oto Paz.San.ve Tic.',
            AdressCode: '1',
            StrasseHausNr: 'Kücükbalikli Mh. 6.Cd. No.69',
            TeilnehmerEORI: '',
            TeilnehmerNLNR: '',
          },
        ],
        VorpapierNr: '25TR160100084406M0',
        Zahlungsart: 'E',
        GesamtRohMasse: 3,
        Rechnungspreis: '13111.75',
        Vorsteuerabzug: 'J',
        Bestimmungsland: 'DE',
        StatistikStatus: null,
        ArtGeschaeftCode: '11',
        VorpapierArtCode: 'T1',
        Rechnungswaehrung: 'EUR',
        FiskalvertretungKz: 'N',
        LieferbedingungOrt: 'EICHENZELL',
        LieferbedingungCode: '0CPT',
        VerkehrszweigGrenze: '3',
        VerkehrszweigInland: null,
        VersendungslandCode: 'TR',
        AnmelderIstEmpfaenger: 'J',
        Bestimmungsbundesland: '06',
        ZollrechtlicherStatus: 'EU',
        VerfahrenBeantragtCode: '40',
        LieferbedingungSchluessel: '',
        NameAnmeldenderBearbeiter: 'Mathias Luxbauer',
        VertretungsverhaeltnisCode: '',
        BefoerderungsmittelGrenzeArt: '01',
        StellungAnmeldenderBearbeiter: 'Zolldeklarant/in',
        TelefonnummerAnmeldenderBearbeiter: '',
        KennzeichenNameBefoerderungsmittelAnkunft: '34FKE212',
        BefoerderungsmittelGrenzeStaatszugehoerigkeitCode: 'TR',
      },
      WarenPosition: {
        Zollwert: '13111.75',
        Unterlage: [
          {
            Art: 'N018',
            Nummer: 'L0729349',
            Bereich: '6',
            VorlageKz: '1',
            DatumAusstellung: '2025-12-19',
          },
          {
            Art: '7HHF',
            Nummer: 'CMR',
            Bereich: '4',
            VorlageKz: '1',
            DatumAusstellung: '2025-12-31',
          },
        ],
        AHStatWert: 140,
        Eigenmasse: 2.7,
        AHStatMenge: 500,
        PackstueckArt: 'PK',
        WarenNummerEZT: '73269098900',
        Positionsnummer: 1,
        PackstueckAnzahl: 1,
        WarenBezeichnung:
          'Andere Waren aus Eisen oder Stahl, a.n.g. / Handelsbezeichnung: TURBO-ROHR',
        PackstueckZeichen: 'OHNE',
        UrsprungslandCode: 'TR',
        AbzugHinzurechnung: {
          Betrag: 121.5,
          ArtCode: 'R',
          Waehrung: 'EUR',
          KursVereinbartKz: '0',
        },
        AHStatWertManuellKZ: 'N',
        AHStatMengeMasseinheit: 'NAR',
        BeguenstigungBeantragtCode: 400,
        VerfahrenscodeVorangegangenesVerfahren: '00',
      },
      ObjektIdentifizierung: {
        Bearbeiter: 'MATHIAS',
        ObjektName: '4803/2602206_TEST_1511',
        ObjektAlias: '4803/26000336/A04012026_205651',
        AnmeldungArt: 'EZA-D',
        ObjektAktion: 'CREATE',
        BezugsnummerVorblendung: 'AA_EZA_DE_IM4000',
      },
    },
  },
};

const parsed = DakosyZodSchema.safeParse(data);
if (!parsed.success) {
  console.dir(parsed.error.format(), { depth: null });
} else {
  console.log('Validation succeeded:', parsed.data);
}
