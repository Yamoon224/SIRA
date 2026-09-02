/**
 * Référentiels géographiques Afrique utilisés par les formulaires (créateur de
 * CV, portfolio, profil) : indicatifs téléphoniques et localisations pour
 * l'auto-complétion. Données statiques volontairement : ces listes ne bougent
 * pas et le formulaire doit rester utilisable hors-ligne.
 */

export interface PaysAfricain {
    /** Code ISO 3166-1 alpha-2, sert aussi à dériver le drapeau. */
    iso: string
    nom: string
    /** Indicatif international, préfixé par « + ». Unique dans la liste. */
    indicatif: string
}

/** Indicatif proposé par défaut (Côte d'Ivoire). */
export const INDICATIF_PAR_DEFAUT = "+225"

/** Les 54 États africains, triés par nom. */
export const PAYS_AFRICAINS: PaysAfricain[] = [
    { iso: "ZA", nom: "Afrique du Sud", indicatif: "+27" },
    { iso: "DZ", nom: "Algérie", indicatif: "+213" },
    { iso: "AO", nom: "Angola", indicatif: "+244" },
    { iso: "BJ", nom: "Bénin", indicatif: "+229" },
    { iso: "BW", nom: "Botswana", indicatif: "+267" },
    { iso: "BF", nom: "Burkina Faso", indicatif: "+226" },
    { iso: "BI", nom: "Burundi", indicatif: "+257" },
    { iso: "CM", nom: "Cameroun", indicatif: "+237" },
    { iso: "CV", nom: "Cap-Vert", indicatif: "+238" },
    { iso: "CF", nom: "Centrafrique", indicatif: "+236" },
    { iso: "KM", nom: "Comores", indicatif: "+269" },
    { iso: "CG", nom: "Congo-Brazzaville", indicatif: "+242" },
    { iso: "CD", nom: "Congo (RDC)", indicatif: "+243" },
    { iso: "CI", nom: "Côte d'Ivoire", indicatif: "+225" },
    { iso: "DJ", nom: "Djibouti", indicatif: "+253" },
    { iso: "EG", nom: "Égypte", indicatif: "+20" },
    { iso: "ER", nom: "Érythrée", indicatif: "+291" },
    { iso: "SZ", nom: "Eswatini", indicatif: "+268" },
    { iso: "ET", nom: "Éthiopie", indicatif: "+251" },
    { iso: "GA", nom: "Gabon", indicatif: "+241" },
    { iso: "GM", nom: "Gambie", indicatif: "+220" },
    { iso: "GH", nom: "Ghana", indicatif: "+233" },
    { iso: "GN", nom: "Guinée", indicatif: "+224" },
    { iso: "GW", nom: "Guinée-Bissau", indicatif: "+245" },
    { iso: "GQ", nom: "Guinée équatoriale", indicatif: "+240" },
    { iso: "KE", nom: "Kenya", indicatif: "+254" },
    { iso: "LS", nom: "Lesotho", indicatif: "+266" },
    { iso: "LR", nom: "Libéria", indicatif: "+231" },
    { iso: "LY", nom: "Libye", indicatif: "+218" },
    { iso: "MG", nom: "Madagascar", indicatif: "+261" },
    { iso: "MW", nom: "Malawi", indicatif: "+265" },
    { iso: "ML", nom: "Mali", indicatif: "+223" },
    { iso: "MA", nom: "Maroc", indicatif: "+212" },
    { iso: "MU", nom: "Maurice", indicatif: "+230" },
    { iso: "MR", nom: "Mauritanie", indicatif: "+222" },
    { iso: "MZ", nom: "Mozambique", indicatif: "+258" },
    { iso: "NA", nom: "Namibie", indicatif: "+264" },
    { iso: "NE", nom: "Niger", indicatif: "+227" },
    { iso: "NG", nom: "Nigéria", indicatif: "+234" },
    { iso: "UG", nom: "Ouganda", indicatif: "+256" },
    { iso: "RW", nom: "Rwanda", indicatif: "+250" },
    { iso: "ST", nom: "São Tomé-et-Príncipe", indicatif: "+239" },
    { iso: "SN", nom: "Sénégal", indicatif: "+221" },
    { iso: "SC", nom: "Seychelles", indicatif: "+248" },
    { iso: "SL", nom: "Sierra Leone", indicatif: "+232" },
    { iso: "SO", nom: "Somalie", indicatif: "+252" },
    { iso: "SD", nom: "Soudan", indicatif: "+249" },
    { iso: "SS", nom: "Soudan du Sud", indicatif: "+211" },
    { iso: "TZ", nom: "Tanzanie", indicatif: "+255" },
    { iso: "TD", nom: "Tchad", indicatif: "+235" },
    { iso: "TG", nom: "Togo", indicatif: "+228" },
    { iso: "TN", nom: "Tunisie", indicatif: "+216" },
    { iso: "ZM", nom: "Zambie", indicatif: "+260" },
    { iso: "ZW", nom: "Zimbabwe", indicatif: "+263" },
]

/** Pays présélectionné dans les sélecteurs d'indicatif. */
export const PAYS_PAR_DEFAUT: PaysAfricain =
    PAYS_AFRICAINS.find((p) => p.indicatif === INDICATIF_PAR_DEFAUT) ?? PAYS_AFRICAINS[0]

/** Emoji drapeau dérivé du code ISO (lettres → indicateurs régionaux). */
export function drapeau(iso: string): string {
    return String.fromCodePoint(...[...iso.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
}

/** Indicatifs triés du plus long au plus court, pour découper un numéro collé. */
const INDICATIFS_TRIES = [...PAYS_AFRICAINS]
    .map((p) => p.indicatif)
    .sort((a, b) => b.length - a.length)

/**
 * Sépare un numéro éventuellement saisi en un seul bloc (« +2250739… »,
 * héritage des anciens brouillons) en indicatif + numéro local.
 */
export function separerIndicatif(valeur: string): { indicatif: string | null; numero: string } {
    const compact = valeur.replace(/\s+/g, "")
    const trouve = INDICATIFS_TRIES.find((i) => compact.startsWith(i))
    // Le numéro local est renvoyé sans espaces : la saisie d'origine peut en
    // contenir au milieu de l'indicatif, on ne cherche pas à la reconstituer.
    return trouve ? { indicatif: trouve, numero: compact.slice(trouve.length) } : { indicatif: null, numero: valeur.trim() }
}

/** Villes proposées à l'auto-complétion, par pays. */
const VILLES_PAR_PAYS: Record<string, string[]> = {
    "Côte d'Ivoire": [
        "Abidjan", "Yamoussoukro", "Bouaké", "San-Pédro", "Korhogo", "Daloa", "Man",
        "Gagnoa", "Divo", "Abengourou", "Grand-Bassam", "Bingerville", "Anyama",
        "Soubré", "Séguéla", "Odienné", "Bondoukou",
    ],
    "Bénin": ["Cotonou", "Porto-Novo", "Abomey-Calavi", "Parakou", "Djougou", "Bohicon", "Natitingou"],
    "Sénégal": ["Dakar", "Thiès", "Touba", "Saint-Louis", "Ziguinchor", "Kaolack", "Mbour"],
    "Mali": ["Bamako", "Sikasso", "Ségou", "Mopti", "Kayes", "Gao"],
    "Burkina Faso": ["Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Banfora"],
    "Togo": ["Lomé", "Sokodé", "Kara", "Kpalimé"],
    "Niger": ["Niamey", "Zinder", "Maradi", "Agadez"],
    "Guinée": ["Conakry", "Kankan", "Nzérékoré", "Kindia"],
    "Guinée-Bissau": ["Bissau"],
    "Libéria": ["Monrovia"],
    "Sierra Leone": ["Freetown"],
    "Gambie": ["Banjul"],
    "Mauritanie": ["Nouakchott", "Nouadhibou"],
    "Cap-Vert": ["Praia", "Mindelo"],
    "Ghana": ["Accra", "Kumasi", "Takoradi", "Tamale"],
    "Nigéria": ["Lagos", "Abuja", "Kano", "Ibadan", "Port Harcourt", "Benin City"],
    "Cameroun": ["Douala", "Yaoundé", "Bafoussam", "Garoua", "Bamenda"],
    "Gabon": ["Libreville", "Port-Gentil"],
    "Congo-Brazzaville": ["Brazzaville", "Pointe-Noire"],
    "Congo (RDC)": ["Kinshasa", "Lubumbashi", "Goma", "Bukavu", "Kisangani"],
    "Centrafrique": ["Bangui"],
    "Tchad": ["N'Djaména"],
    "Guinée équatoriale": ["Malabo", "Bata"],
    "São Tomé-et-Príncipe": ["São Tomé"],
    "Angola": ["Luanda", "Huambo", "Benguela"],
    "Maroc": ["Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir"],
    "Algérie": ["Alger", "Oran", "Constantine", "Annaba"],
    "Tunisie": ["Tunis", "Sfax", "Sousse"],
    "Libye": ["Tripoli", "Benghazi"],
    "Égypte": ["Le Caire", "Alexandrie", "Gizeh"],
    "Soudan": ["Khartoum"],
    "Soudan du Sud": ["Djouba"],
    "Éthiopie": ["Addis-Abeba", "Dire Dawa"],
    "Érythrée": ["Asmara"],
    "Djibouti": ["Djibouti"],
    "Somalie": ["Mogadiscio", "Hargeisa"],
    "Kenya": ["Nairobi", "Mombasa", "Kisumu"],
    "Ouganda": ["Kampala", "Entebbe"],
    "Rwanda": ["Kigali"],
    "Burundi": ["Bujumbura", "Gitega"],
    "Tanzanie": ["Dar es Salaam", "Dodoma", "Arusha", "Zanzibar"],
    "Mozambique": ["Maputo", "Beira", "Nampula"],
    "Malawi": ["Lilongwe", "Blantyre"],
    "Zambie": ["Lusaka", "Kitwe", "Ndola"],
    "Zimbabwe": ["Harare", "Bulawayo"],
    "Botswana": ["Gaborone"],
    "Namibie": ["Windhoek", "Walvis Bay"],
    "Afrique du Sud": ["Johannesburg", "Le Cap", "Pretoria", "Durban", "Port Elizabeth"],
    "Lesotho": ["Maseru"],
    "Eswatini": ["Mbabane", "Manzini"],
    "Madagascar": ["Antananarivo", "Toamasina", "Antsirabe"],
    "Maurice": ["Port-Louis", "Curepipe"],
    "Seychelles": ["Victoria"],
    "Comores": ["Moroni"],
}

/**
 * Localisations au format « Ville, Pays ». La Côte d'Ivoire arrive en tête
 * (marché principal), le reste suit l'ordre alphabétique des pays.
 */
export const LOCALISATIONS: string[] = Object.entries(VILLES_PAR_PAYS).flatMap(([pays, villes]) =>
    villes.map((ville) => `${ville}, ${pays}`),
)
