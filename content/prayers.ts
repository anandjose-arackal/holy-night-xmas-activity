// DRAFT — every Malayalam prayer text needs review by a parish catechist against the approved version before launch.
// `seconds` is the speech one repetition needs before its bead fills: set after the first home test
// (a child need not say every word for the bead to fill).
import type { Lang } from "./missions.ts";

export type PrayerKey =
  | "amme_ashraya" | "daiva_sneham" | "eesho_love" | "daivame_karuna" | "athmave_nirayane"
  | "unni_eesho" | "jmj" | "thiruhrudayam" | "yauseppe"
  | "our_father" | "hail_mary" | "glory_be"
  | "salve_regina" | "st_michael" | "peace_francis" | "creed";

export type Prayer = {
  seconds: number;
  /** Big prayers are said once and pay a flat bonus; the rest pay per repetition. */
  big?: boolean;
  /** Each repetition shows the next line in turn (e.g. love, trust, praise, rejoice). */
  text: Record<Lang, string[]>;
};

export const PRAYERS: Record<PrayerKey, Prayer> = {
  amme_ashraya: { seconds: 1.6, text: { ml: ["എന്റെ അമ്മേ, എന്റെ ആശ്രയമേ."], en: ["My Mother, my refuge."] } },
  daiva_sneham: { seconds: 2.4, text: { ml: ["ദൈവ സ്നേഹത്താല്‍ ഞങ്ങളെ നിറക്കേണമേ."], en: ["Fill us with divine love."] } },
  eesho_love: {
    seconds: 2.4,
    text: {
      ml: [
        "എന്റെ ഈശോയെ, അങ്ങയെ ഞാന്‍ സ്നേഹിക്കുന്നു.",
        "എന്റെ ഈശോയെ, അങ്ങയില്‍ ഞാന്‍ ശരണപ്പെടുന്നു.",
        "എന്റെ ഈശോയെ, അങ്ങയെ ഞാന്‍ സ്തുതിക്കുന്നു.",
        "എന്റെ ഈശോയെ, അങ്ങയില്‍ ഞാന്‍ ആനന്ദിക്കുന്നു.",
      ],
      en: ["My Jesus, I love you.", "My Jesus, I trust in you.", "My Jesus, I praise you.", "My Jesus, I rejoice in you."],
    },
  },
  daivame_karuna: { seconds: 1.6, text: { ml: ["ദൈവമേ, കരുണയായിരിക്കേണമേ."], en: ["God, have mercy."] } },
  athmave_nirayane: { seconds: 1.6, text: { ml: ["പരിശുദ്ധാത്മാവേ എന്നിൽ നിറയേണമേ."], en: ["Holy Spirit, fill me."] } },
  unni_eesho: { seconds: 2.4, text: { ml: ["ഉണ്ണീശോയേ, എന്റെ ഹൃദയത്തിൽ വരേണമേ."], en: ["Child Jesus, come into my heart."] } },
  jmj: { seconds: 2.4, text: { ml: ["ഈശോ മറിയം യൗസേപ്പേ, ഞങ്ങളുടെ ആത്മാക്കളെ രക്ഷിക്കേണമേ."], en: ["Jesus, Mary and Joseph, save our souls."] } },
  thiruhrudayam: { seconds: 2.4, text: { ml: ["ഈശോയുടെ തിരുഹൃദയമേ, ഞങ്ങളുടെമേൽ കരുണയായിരിക്കേണമേ."], en: ["Sacred Heart of Jesus, have mercy on us."] } },
  yauseppe: { seconds: 2.4, text: { ml: ["വിശുദ്ധ യൗസേപ്പേ, ഞങ്ങൾക്കുവേണ്ടി പ്രാർത്ഥിക്കേണമേ."], en: ["Saint Joseph, pray for us."] } },
  our_father: {
    seconds: 12,
    text: {
      ml: ["സ്വര്‍ഗ്ഗസ്ഥനായ ഞങ്ങളുടെ പിതാവേ, അങ്ങയുടെ നാമം പൂജിതമാകണമേ. അങ്ങയുടെ രാജ്യം വരണമേ. അങ്ങയുടെ തിരുമനസ്സ് സ്വര്‍ഗ്ഗത്തിലെപ്പോലെ ഭൂമിയിലും ആകണമേ. അന്നന്നു വേണ്ട ആഹാരം ഇന്നു ഞങ്ങള്‍ക്കു തരണമേ. ഞങ്ങളോടു തെറ്റു ചെയ്യുന്നവരോടു ഞങ്ങള്‍ ക്ഷമിക്കുന്നതുപോലെ ഞങ്ങളുടെ തെറ്റുകള്‍ ഞങ്ങളോടും ക്ഷമിക്കണമേ. ഞങ്ങളെ പ്രലോഭനത്തില്‍ ഉള്‍പ്പെടുത്തരുതേ. തിന്മയില്‍ നിന്നു ഞങ്ങളെ രക്ഷിക്കണമേ. ആമേന്‍."],
      en: ["Our Father, who art in heaven, hallowed be thy name; thy kingdom come, thy will be done on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen."],
    },
  },
  hail_mary: {
    seconds: 10,
    text: {
      ml: ["നന്മ നിറഞ്ഞ മറിയമേ സ്വസ്തി! കര്‍ത്താവ് അങ്ങയോടുകൂടെ. സ്ത്രീകളില്‍ അങ്ങ് അനുഗ്രഹീതയാകുന്നു. അങ്ങയുടെ ഉദരത്തിന്‍ ഫലമായ ഈശോ അനുഗ്രഹീതനാകുന്നു. പരിശുദ്ധ മറിയമേ, തമ്പുരാന്റെ അമ്മേ, പാപികളായ ഞങ്ങള്‍ക്കുവേണ്ടി ഇപ്പോഴും ഞങ്ങളുടെ മരണസമയത്തും തമ്പുരാനോട് അപേക്ഷിക്കണമേ. ആമേന്‍."],
      en: ["Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen."],
    },
  },
  glory_be: {
    seconds: 4.8,
    text: {
      ml: ["പിതാവിനും പുത്രനും പരിശുദ്ധാത്മാവിനും സ്തുതി. ആദിയിലെപ്പോലെ ഇപ്പോഴും എപ്പോഴും എന്നേക്കും. ആമേന്‍."],
      en: ["Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and ever shall be, world without end. Amen."],
    },
  },
  salve_regina: {
    seconds: 22,
    big: true,
    text: {
      ml: ["പരിശുദ്ധ രാജ്ഞീ, കരുണയുടെ മാതാവേ, സ്വസ്തി! ഞങ്ങളുടെ ജീവനും മാധുര്യവും ശരണവുമേ, സ്വസ്തി! ഹവ്വായുടെ പുറംതള്ളപ്പെട്ട മക്കളായ ഞങ്ങള്‍ അങ്ങേ പക്കല്‍ നിലവിളിക്കുന്നു. കണ്ണുനീരിന്റെ ഈ താഴ്വരയില്‍ നിന്ന് വിങ്ങിക്കരഞ്ഞ് അങ്ങേ പക്കല്‍ ഞങ്ങള്‍ നെടുവീര്‍പ്പിടുന്നു. ആകയാല്‍ ഞങ്ങളുടെ മദ്ധ്യസ്ഥേ, അങ്ങയുടെ കരുണയുള്ള കണ്ണുകള്‍ ഞങ്ങളുടെ നേരെ തിരിക്കണമേ. ഈ പ്രവാസത്തിനുശേഷം അങ്ങയുടെ ഉദരത്തിന്റെ അനുഗ്രഹീത ഫലമായ ഈശോയെ ഞങ്ങള്‍ക്കു കാണിച്ചു തരണമേ. കരുണയും വാത്സല്യവും മാധുര്യവുമുള്ള കന്യകാമറിയമേ, ആമേന്‍."],
      en: ["Hail, holy Queen, Mother of mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve; to thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us; and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary. Amen."],
    },
  },
  st_michael: {
    seconds: 22,
    big: true,
    text: {
      ml: ["മുഖ്യദൂതനായ വിശുദ്ധ മിഖായേലേ, യുദ്ധത്തില്‍ ഞങ്ങളെ കാത്തുകൊള്ളണമേ. പിശാചിന്റെ ദുഷ്ടതയിലും കെണികളിലും നിന്ന് ഞങ്ങളെ സംരക്ഷിക്കണമേ. ദൈവം അവനെ ശാസിക്കട്ടെ എന്ന് ഞങ്ങള്‍ താഴ്മയോടെ പ്രാര്‍ത്ഥിക്കുന്നു. സ്വര്‍ഗ്ഗീയ സൈന്യങ്ങളുടെ പ്രഭുവേ, ആത്മാക്കളെ നശിപ്പിക്കാന്‍ ലോകത്തില്‍ ചുറ്റിനടക്കുന്ന സാത്താനെയും മറ്റു ദുഷ്ടാരൂപികളെയും ദൈവശക്തിയാല്‍ നരകത്തിലേക്കു തള്ളിക്കളയണമേ. ആമേന്‍."],
      en: ["Saint Michael the Archangel, defend us in battle. Be our protection against the wickedness and snares of the devil. May God rebuke him, we humbly pray; and do thou, O Prince of the heavenly host, by the power of God, cast into hell Satan and all the evil spirits who prowl about the world seeking the ruin of souls. Amen."],
    },
  },
  peace_francis: {
    seconds: 25,
    big: true,
    text: {
      ml: ["കര്‍ത്താവേ, എന്നെ അങ്ങയുടെ സമാധാനത്തിന്റെ ഉപകരണമാക്കണമേ. വിദ്വേഷമുള്ളിടത്ത് സ്നേഹവും, ദ്രോഹമുള്ളിടത്ത് ക്ഷമയും, സംശയമുള്ളിടത്ത് വിശ്വാസവും, നിരാശയുള്ളിടത്ത് പ്രത്യാശയും, അന്ധകാരമുള്ളിടത്ത് പ്രകാശവും, ദുഃഖമുള്ളിടത്ത് സന്തോഷവും ഞാന്‍ വിതയ്ക്കട്ടെ. ഓ ദിവ്യനാഥാ, ആശ്വസിപ്പിക്കപ്പെടുന്നതിനേക്കാള്‍ ആശ്വസിപ്പിക്കുവാനും, മനസ്സിലാക്കപ്പെടുന്നതിനേക്കാള്‍ മനസ്സിലാക്കുവാനും, സ്നേഹിക്കപ്പെടുന്നതിനേക്കാള്‍ സ്നേഹിക്കുവാനും എനിക്കു കൃപ തരണമേ. കാരണം, കൊടുക്കുമ്പോഴാണ് ഞങ്ങള്‍ സ്വീകരിക്കുന്നത്; ക്ഷമിക്കുമ്പോഴാണ് ഞങ്ങള്‍ ക്ഷമിക്കപ്പെടുന്നത്; മരിക്കുമ്പോഴാണ് ഞങ്ങള്‍ നിത്യജീവനിലേക്കു ജനിക്കുന്നത്. ആമേന്‍."],
      en: ["Lord, make me an instrument of your peace. Where there is hatred, let me sow love; where there is injury, pardon; where there is doubt, faith; where there is despair, hope; where there is darkness, light; and where there is sadness, joy. O divine Master, grant that I may not so much seek to be consoled as to console; to be understood as to understand; to be loved as to love. For it is in giving that we receive, it is in pardoning that we are pardoned, and it is in dying that we are born to eternal life. Amen."],
    },
  },
  creed: {
    seconds: 30,
    big: true,
    text: {
      ml: ["സര്‍വ്വശക്തനും പിതാവും ആകാശത്തിന്റെയും ഭൂമിയുടെയും സ്രഷ്ടാവുമായ ദൈവത്തില്‍ ഞാന്‍ വിശ്വസിക്കുന്നു. അവിടുത്തെ ഏകപുത്രനും ഞങ്ങളുടെ കര്‍ത്താവുമായ ഈശോമിശിഹായിലും ഞാന്‍ വിശ്വസിക്കുന്നു. ഈ പുത്രന്‍ പരിശുദ്ധാത്മാവാല്‍ ഗര്‍ഭസ്ഥനായി കന്യകാമറിയത്തില്‍ നിന്നു പിറന്നു. പന്തിയോസ് പീലാത്തോസിന്റെ കാലത്ത് പീഡകള്‍ സഹിച്ച്, കുരിശില്‍ തറയ്ക്കപ്പെട്ട്, മരിച്ച് അടക്കപ്പെട്ടു. പാതാളത്തില്‍ ഇറങ്ങി മരിച്ചവരുടെ ഇടയില്‍ നിന്നു മൂന്നാം നാള്‍ ഉയിര്‍ത്തു. സ്വര്‍ഗ്ഗത്തിലേക്ക് എഴുന്നള്ളി, സര്‍വ്വശക്തനായ പിതാവിന്റെ വലതുഭാഗത്ത് ഇരിക്കുന്നു. അവിടെ നിന്ന് ജീവിക്കുന്നവരെയും മരിച്ചവരെയും വിധിക്കുവാന്‍ വരുമെന്നും ഞാന്‍ വിശ്വസിക്കുന്നു. പരിശുദ്ധാത്മാവിലും ഞാന്‍ വിശ്വസിക്കുന്നു. വിശുദ്ധ കത്തോലിക്കാ സഭയിലും പുണ്യവാന്മാരുടെ ഐക്യത്തിലും പാപങ്ങളുടെ മോചനത്തിലും ശരീരത്തിന്റെ ഉയിര്‍പ്പിലും നിത്യമായ ജീവിതത്തിലും ഞാന്‍ വിശ്വസിക്കുന്നു. ആമേന്‍."],
      en: ["I believe in God, the Father almighty, Creator of heaven and earth, and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; he descended into hell; on the third day he rose again from the dead; he ascended into heaven, and is seated at the right hand of God the Father almighty; from there he will come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen."],
    },
  },
};

export type PrayerSet = { key: PrayerKey; count: number }[];

const s = (key: PrayerKey, count = 1): PrayerSet => [{ key, count }];

/** DRAFT schedule for review: one prayer a day, either a short prayer ×10/20/30 or one big prayer said once. */
export const DAY_PRAYERS: Record<number, PrayerSet> = {
  1: s("amme_ashraya", 20),
  2: s("salve_regina"),
  3: s("eesho_love", 20),
  4: s("our_father", 10),
  5: s("st_michael"),
  6: s("daivame_karuna", 20),
  7: s("hail_mary", 10),
  8: s("creed"),
  9: s("athmave_nirayane", 20),
  10: s("unni_eesho", 20),
  11: s("peace_francis"),
  12: s("jmj", 20),
  13: s("glory_be", 10),
  14: s("salve_regina"),
  15: s("thiruhrudayam", 20),
  16: s("yauseppe", 20),
  17: s("st_michael"),
  18: s("daiva_sneham", 30),
  19: s("our_father", 10),
  20: s("creed"),
  21: s("amme_ashraya", 30),
  22: s("hail_mary", 10),
  23: s("peace_francis"),
  24: s("unni_eesho", 30),
  25: s("salve_regina"),
  26: s("jmj", 20),
  27: s("unni_eesho", 30),
};
