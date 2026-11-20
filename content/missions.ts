// DRAFT — every entry needs theological and Malayalam review before launch.
// Scripture is given by reference only; no verse text is quoted.
// No mission may ever require Confession, Communion or Mass attendance.
// DRAFT — `verse`, `massPrayer` and `story` are new text and need the same review.
// `verse` is our own child-friendly paraphrase of `ref`, never a quoted translation.
// `massPrayer` must work at Mass or at home; it never implies Mass is required.

export type Lang = "en" | "ml";

type MissionText = {
  title: string;
  ref: string;
  reflection: string;
  task: string;
  prayer: string;
  verse: string;
  massPrayer: string;
  story: { title: string; body: string };
};

export type Mission = { day: number } & Record<Lang, MissionText>;

export const missions: Mission[] = [
  {
    day: 1,
    en: {
      title: "Stay Awake",
      ref: "Mark 13:33-37",
      reflection: "On this First Sunday of Advent, the season of waiting begins. Jesus is coming, so we get our hearts ready.",
      task: "Choose a small corner at home for prayer. With your family, place a candle or a picture of Jesus there.",
      prayer: "Jesus, wake up my heart. Help me wait for you with joy.",
      verse: "Jesus said: Keep watch and be ready, because you do not know when I will come. Be like servants waiting up for their master to come home, with hearts wide awake.",
      massPrayer: "Jesus, I am here with you today. Keep my heart awake and ready for you.",
      story: {
        title: "The Tree That Waits",
        body: "Long ago in Germany, people put on plays in church to tell Bible stories. On 24 December they remembered Adam and Eve, and they set up a 'paradise tree': an evergreen fir hung with red apples. It reminded everyone of the garden God made, and of Jesus, who comes to open paradise again. Later, families brought evergreen trees into their homes. They stay green all winter, even in the cold, like God's love that never fades. The tree in our village is still bare. Each day this Advent, as you read God's Word, you will hang a new ornament on it. By Christmas it will shine, just like a heart that has slowly been made ready for Jesus.",
      },
    },
    ml: {
      title: "ഉണർന്നിരിക്കുവിൻ",
      ref: "മർക്കോസ് 13:33-37",
      reflection: "ആഗമനകാലത്തിലെ ഒന്നാം ഞായറാഴ്ച, കാത്തിരിപ്പിന്റെ കാലം തുടങ്ങുന്നു. ഈശോ വരുന്നു; നമുക്ക് നമ്മുടെ ഹൃദയം ഒരുക്കാം.",
      task: "വീട്ടിൽ പ്രാർത്ഥനയ്ക്കായി ഒരു ചെറിയ ഇടം കണ്ടെത്തുക. കുടുംബത്തോടൊപ്പം അവിടെ ഒരു മെഴുകുതിരിയോ ഈശോയുടെ ചിത്രമോ വയ്ക്കുക.",
      prayer: "ഈശോയേ, എന്റെ ഹൃദയത്തെ ഉണർത്തണമേ. സന്തോഷത്തോടെ അങ്ങേക്കായി കാത്തിരിക്കാൻ എന്നെ സഹായിക്കണമേ.",
      verse: "ഈശോ പറഞ്ഞു: ജാഗ്രതയോടെ ഒരുങ്ങിയിരിക്കുക; ഞാൻ എപ്പോൾ വരുമെന്ന് നിങ്ങൾക്കറിയില്ല. യജമാനൻ വീട്ടിലെത്തുന്നതും കാത്തിരിക്കുന്ന വേലക്കാരെപ്പോലെ നിങ്ങളുടെ ഹൃദയം ഉണർന്നിരിക്കട്ടെ.",
      massPrayer: "ഈശോയേ, ഇന്ന് ഞാൻ അങ്ങയോടൊപ്പമാണ്. അങ്ങേക്കായി ഒരുങ്ങിയിരിക്കാൻ എന്റെ ഹൃദയത്തെ ഉണർത്തണമേ.",
      story: {
        title: "കാത്തിരിക്കുന്ന മരം",
        body: "പണ്ട് ജർമ്മനിയിൽ ബൈബിൾ കഥകൾ ദേവാലയത്തിൽ നാടകമായി അവതരിപ്പിക്കുമായിരുന്നു. ഡിസംബർ 24-ന് ആദാമിനെയും ഹവ്വായെയും ഓർക്കുന്ന ദിവസം, അവർ ഒരു 'പറുദീസാ മരം' ഒരുക്കി: ചുവന്ന ആപ്പിളുകൾ തൂക്കിയ ഒരു നിത്യഹരിത മരം. ദൈവം ഉണ്ടാക്കിയ തോട്ടത്തെയും, പറുദീസ വീണ്ടും തുറക്കാൻ വരുന്ന ഈശോയെയും അത് എല്ലാവരെയും ഓർമ്മിപ്പിച്ചു. പിന്നീട് കുടുംബങ്ങൾ ഇത്തരം മരങ്ങൾ വീടുകളിലേക്ക് കൊണ്ടുവന്നു. കൊടുംതണുപ്പിലും അവ പച്ചയായി നിൽക്കുന്നു; ഒരിക്കലും മങ്ങാത്ത ദൈവസ്നേഹം പോലെ. നമ്മുടെ ഗ്രാമത്തിലെ മരം ഇപ്പോൾ ഒഴിഞ്ഞുകിടക്കുകയാണ്. ഈ ആഗമനകാലത്ത് ഓരോ ദിവസവും ദൈവവചനം വായിക്കുമ്പോൾ നിങ്ങൾ അതിൽ ഒരു പുതിയ അലങ്കാരം തൂക്കും. ക്രിസ്മസ് ആകുമ്പോഴേക്കും അത് തിളങ്ങും; ഈശോയ്ക്കായി പതിയെ ഒരുങ്ങിയ ഒരു ഹൃദയം പോലെ.",
      },
    },
  },
  {
    day: 2,
    en: {
      title: "Prepare the Way",
      ref: "Isaiah 40:3-5",
      reflection: "The prophet asks us to make a straight road for the Lord. We start with the small things around us.",
      task: "Tidy your room or your study table today without being asked.",
      prayer: "Lord, clear away whatever keeps me far from you.",
      verse: "A voice calls out: Build a road for God across the wild desert! Fill in the holes and flatten the hills, and then everyone will see how great and glorious God is.",
      massPrayer: "Lord, as I listen to your Word today, smooth out the rough places in my heart.",
      story: {
        title: "The Dove and the Olive Leaf",
        body: "After the great flood, Noah's ark rested on a mountain, but the whole world was still under water. Noah sent out a dove to see if the land was dry. In the evening the dove flew back with a fresh olive leaf in its beak! Noah knew the waters were going down and that God was giving the world a new start. Ever since, the olive branch has been a sign of peace. Olive trees grow all over the hills around Bethlehem. They can live for hundreds of years, and their oil was used for food, medicine and lamps. Today our village gets its own olive tree. Let it remind you that God always keeps his promises, and that he is making a peaceful road to us.",
      },
    },
    ml: {
      title: "വഴി ഒരുക്കുവിൻ",
      ref: "ഏശയ്യാ 40:3-5",
      reflection: "കർത്താവിനായി വഴി നേരെയാക്കാൻ പ്രവാചകൻ നമ്മോട് പറയുന്നു. നമ്മുടെ ചുറ്റുമുള്ള ചെറിയ കാര്യങ്ങളിൽ നിന്ന് തുടങ്ങാം.",
      task: "ആരും പറയാതെ തന്നെ ഇന്ന് നിങ്ങളുടെ മുറിയോ പഠനമേശയോ വൃത്തിയാക്കുക.",
      prayer: "കർത്താവേ, അങ്ങിൽ നിന്ന് എന്നെ അകറ്റുന്നതെല്ലാം നീക്കിക്കളയണമേ.",
      verse: "ഒരു സ്വരം വിളിച്ചുപറയുന്നു: മരുഭൂമിയിൽ ദൈവത്തിനായി ഒരു പാത ഒരുക്കുവിൻ! കുഴികൾ നികത്തുക, കുന്നുകൾ നിരപ്പാക്കുക; അപ്പോൾ ദൈവത്തിന്റെ മഹത്വം എല്ലാവരും കാണും.",
      massPrayer: "കർത്താവേ, ഇന്ന് അങ്ങയുടെ വചനം കേൾക്കുമ്പോൾ എന്റെ ഹൃദയത്തിലെ പരുക്കൻ ഇടങ്ങൾ നിരപ്പാക്കണമേ.",
      story: {
        title: "പ്രാവും ഒലിവിലയും",
        body: "മഹാപ്രളയത്തിനുശേഷം നോഹയുടെ പെട്ടകം ഒരു മലമുകളിൽ ഉറച്ചു. പക്ഷേ ഭൂമി മുഴുവൻ അപ്പോഴും വെള്ളത്തിനടിയിലായിരുന്നു. കര ഉണങ്ങിയോ എന്നറിയാൻ നോഹ ഒരു പ്രാവിനെ പുറത്തേക്ക് വിട്ടു. വൈകുന്നേരം പ്രാവ് കൊക്കിൽ ഒരു പച്ച ഒലിവിലയുമായി തിരിച്ചുവന്നു! വെള്ളം ഇറങ്ങുന്നുവെന്നും ദൈവം ലോകത്തിന് പുതിയൊരു തുടക്കം നൽകുന്നുവെന്നും നോഹ മനസ്സിലാക്കി. അന്നുമുതൽ ഒലിവ് ചില്ല സമാധാനത്തിന്റെ അടയാളമാണ്. ബേത്‌ലെഹേമിനു ചുറ്റുമുള്ള കുന്നുകളിൽ ധാരാളം ഒലിവ് മരങ്ങളുണ്ട്. നൂറുകണക്കിന് വർഷം അവ ജീവിക്കും; അവയുടെ എണ്ണ ഭക്ഷണത്തിനും മരുന്നിനും വിളക്കുകൾക്കും ഉപയോഗിച്ചിരുന്നു. ഇന്ന് നമ്മുടെ ഗ്രാമത്തിനും ഒരു ഒലിവ് മരം കിട്ടുന്നു. ദൈവം എപ്പോഴും വാക്കു പാലിക്കുന്നവനാണെന്നും നമ്മിലേക്ക് സമാധാനത്തിന്റെ വഴി ഒരുക്കുന്നുവെന്നും അത് നിങ്ങളെ ഓർമ്മിപ്പിക്കട്ടെ.",
      },
    },
  },
  {
    day: 3,
    en: {
      title: "Room for Jesus",
      ref: "Luke 2:7",
      reflection: "There was no room in the inn, so Jesus was laid in a manger. We can make room for him by sharing.",
      task: "Share something you like — a toy, a snack or your time — with a brother, sister or friend.",
      prayer: "Jesus, there is room for you in my heart. Come and stay.",
      verse: "Mary gave birth to her firstborn son. She wrapped him up warmly and laid him in a feeding box for animals, because there was no space for them in the guest room.",
      massPrayer: "Jesus, as I come close to you today, make my heart a warm place for you to stay.",
      story: {
        title: "A Wheel of Candles",
        body: "About 180 years ago in Hamburg, Germany, a pastor named Johann Wichern ran a home for poor boys. Every December the boys kept asking, 'How many days until Christmas?' So Wichern took an old cartwheel and put candles on it: a small one for each weekday and a big one for each Sunday. Every evening they lit one more candle, and the room grew brighter as Christmas came closer. Later people made the wreath from evergreen branches, with just four candles, one for each Sunday of Advent. In many Catholic churches three candles are purple, for prayer and getting ready, and one is rose, for the Sunday of joy. The circle has no end, like God's love. Each new flame says: Jesus, the Light, is almost here!",
      },
    },
    ml: {
      title: "ഈശോയ്ക്ക് ഒരിടം",
      ref: "ലൂക്കാ 2:7",
      reflection: "സത്രത്തിൽ സ്ഥലമില്ലാതിരുന്നതിനാൽ ഈശോയെ പുൽത്തൊട്ടിയിൽ കിടത്തി. പങ്കുവയ്ക്കുമ്പോൾ നാം ഈശോയ്ക്ക് ഇടം നൽകുന്നു.",
      task: "നിങ്ങൾക്ക് ഇഷ്ടമുള്ള എന്തെങ്കിലും — കളിപ്പാട്ടമോ പലഹാരമോ സമയമോ — സഹോദരങ്ങളോടോ കൂട്ടുകാരോടോ പങ്കുവയ്ക്കുക.",
      prayer: "ഈശോയേ, എന്റെ ഹൃദയത്തിൽ അങ്ങേക്ക് ഇടമുണ്ട്. വന്ന് വസിക്കണമേ.",
      verse: "മറിയം തന്റെ ആദ്യജാതനായ മകനെ പ്രസവിച്ചു. അവൾ അവനെ തുണികളിൽ ചൂടോടെ പൊതിഞ്ഞ്, മൃഗങ്ങൾക്ക് തീറ്റ കൊടുക്കുന്ന ഒരു തൊട്ടിയിൽ കിടത്തി; കാരണം അതിഥിമുറിയിൽ അവർക്ക് ഇടമുണ്ടായിരുന്നില്ല.",
      massPrayer: "ഈശോയേ, ഇന്ന് ഞാൻ അങ്ങയുടെ അടുത്ത് വരുമ്പോൾ, എന്റെ ഹൃദയം അങ്ങേക്ക് വസിക്കാൻ ചൂടുള്ള ഒരിടമാക്കണമേ.",
      story: {
        title: "തിരികളുടെ ചക്രം",
        body: "ഏകദേശം 180 വർഷം മുമ്പ് ജർമ്മനിയിലെ ഹാംബുർഗിൽ യോഹാൻ വിഹേൺ എന്ന ഒരു പാസ്റ്റർ പാവപ്പെട്ട ആൺകുട്ടികൾക്കായി ഒരു ഭവനം നടത്തിയിരുന്നു. ഓരോ ഡിസംബറിലും കുട്ടികൾ ചോദിക്കും: 'ക്രിസ്മസിന് ഇനി എത്ര ദിവസം?' അതിനാൽ അദ്ദേഹം ഒരു പഴയ വണ്ടിച്ചക്രം എടുത്ത് അതിൽ മെഴുകുതിരികൾ വച്ചു: സാധാരണ ദിവസങ്ങൾക്ക് ചെറിയവയും ഞായറാഴ്ചകൾക്ക് വലിയവയും. ഓരോ സന്ധ്യയ്ക്കും ഒരു തിരി കൂടി കത്തിച്ചു; ക്രിസ്മസ് അടുക്കുന്തോറും മുറി കൂടുതൽ പ്രകാശിച്ചു. പിന്നീട് ആളുകൾ പച്ചിലക്കമ്പുകൾ കൊണ്ട് റീത്ത് ഉണ്ടാക്കി, ആഗമനകാലത്തിലെ നാല് ഞായറാഴ്ചകൾക്കായി നാല് തിരികൾ മാത്രം വച്ചു. പല കത്തോലിക്കാ ദേവാലയങ്ങളിലും മൂന്ന് തിരികൾ പ്രാർത്ഥനയുടെയും ഒരുക്കത്തിന്റെയും നിറമായ വയലറ്റും, ഒന്ന് സന്തോഷത്തിന്റെ ഞായറാഴ്ചയ്ക്കുള്ള റോസും ആണ്. വൃത്തത്തിന് അവസാനമില്ല, ദൈവസ്നേഹം പോലെ. ഓരോ പുതിയ ജ്വാലയും പറയുന്നു: പ്രകാശമായ ഈശോ ഇതാ അടുത്തെത്തി!",
      },
    },
  },
  {
    day: 4,
    en: {
      title: "Small Things, Great Love",
      ref: "Matthew 25:40",
      reflection: "Hay is plain, yet it made a soft bed for the King. Small acts done with love are precious to Jesus.",
      task: "Help with one job at home today: wash dishes, sweep, or water the plants.",
      prayer: "Jesus, teach me to do little things with great love.",
      verse: "Jesus said that whenever we are kind to the least important or neediest person, it is just as if we were being kind to him.",
      massPrayer: "Jesus, I offer you all my little acts of love today. Make them part of your great love.",
      story: {
        title: "Pepita's Gift",
        body: "There is an old story from Mexico about a poor girl named Pepita. On Christmas Eve everyone was bringing gifts to the Baby Jesus in the village church, but Pepita had nothing to give. Walking sadly, she picked a handful of green weeds from the roadside. 'Even a small gift, given with love, pleases Jesus,' her cousin told her. So Pepita laid the plain weeds by the crib. Suddenly, the story says, the leaves blazed bright red, like stars! People called them 'Flowers of the Holy Night'. Today we know this bush as the poinsettia, and it blooms at Christmas in many places, including Kerala gardens. Our village now has a warm fire, glowing red like Pepita's flowers. It reminds us that no gift of love is too small for Jesus.",
      },
    },
    ml: {
      title: "ചെറിയ കാര്യങ്ങൾ, വലിയ സ്നേഹം",
      ref: "മത്തായി 25:40",
      reflection: "വൈക്കോൽ നിസ്സാരമാണ്; എങ്കിലും അത് രാജാവിന് മൃദുവായ കിടക്കയായി. സ്നേഹത്തോടെ ചെയ്യുന്ന ചെറിയ പ്രവൃത്തികൾ ഈശോയ്ക്ക് വിലപ്പെട്ടതാണ്.",
      task: "ഇന്ന് വീട്ടിലെ ഒരു ജോലിയിൽ സഹായിക്കുക: പാത്രം കഴുകുക, തൂത്തുവാരുക, അല്ലെങ്കിൽ ചെടികൾക്ക് വെള്ളമൊഴിക്കുക.",
      prayer: "ഈശോയേ, ചെറിയ കാര്യങ്ങൾ വലിയ സ്നേഹത്തോടെ ചെയ്യാൻ എന്നെ പഠിപ്പിക്കണമേ.",
      verse: "ഏറ്റവും ചെറിയവരോടോ ആവശ്യത്തിലിരിക്കുന്നവരോടോ നാം കാണിക്കുന്ന ഓരോ നന്മയും തന്നോട് തന്നെ കാണിക്കുന്നതുപോലെയാണെന്ന് ഈശോ പറഞ്ഞു.",
      massPrayer: "ഈശോയേ, ഇന്നത്തെ എന്റെ ചെറിയ സ്നേഹപ്രവൃത്തികളെല്ലാം ഞാൻ അങ്ങേക്ക് സമർപ്പിക്കുന്നു. അവയെ അങ്ങയുടെ വലിയ സ്നേഹത്തിന്റെ ഭാഗമാക്കണമേ.",
      story: {
        title: "പെപ്പീത്തയുടെ സമ്മാനം",
        body: "മെക്സിക്കോയിൽ പെപ്പീത്ത എന്ന ഒരു പാവപ്പെട്ട പെൺകുട്ടിയെക്കുറിച്ച് ഒരു പഴയ കഥയുണ്ട്. ക്രിസ്മസ് രാത്രി ഗ്രാമത്തിലെ ദേവാലയത്തിൽ എല്ലാവരും ഉണ്ണീശോയ്ക്ക് സമ്മാനങ്ങൾ കൊണ്ടുവരികയായിരുന്നു. പക്ഷേ പെപ്പീത്തയുടെ കൈയിൽ ഒന്നുമുണ്ടായിരുന്നില്ല. സങ്കടത്തോടെ നടക്കുമ്പോൾ അവൾ വഴിയരികിൽ നിന്ന് കുറച്ച് പച്ചക്കളകൾ പറിച്ചെടുത്തു. 'സ്നേഹത്തോടെ നൽകുന്ന ചെറിയ സമ്മാനവും ഈശോയ്ക്ക് ഇഷ്ടമാണ്,' അവളുടെ ബന്ധുവായ ഒരു കുട്ടി പറഞ്ഞു. അങ്ങനെ പെപ്പീത്ത ആ സാധാരണ ഇലകൾ പുൽക്കൂടിനരികിൽ വച്ചു. പെട്ടെന്ന് ആ ഇലകൾ നക്ഷത്രങ്ങൾ പോലെ കടുംചുവപ്പായി തിളങ്ങി എന്നാണ് കഥ! ആളുകൾ അവയെ 'വിശുദ്ധ രാത്രിയുടെ പൂക്കൾ' എന്ന് വിളിച്ചു. ഇന്ന് നാം ഈ ചെടിയെ പോയിൻസെറ്റിയ എന്ന് വിളിക്കുന്നു; കേരളത്തിലെ തോട്ടങ്ങളിലും ക്രിസ്മസ് കാലത്ത് അത് പൂക്കുന്നു. നമ്മുടെ ഗ്രാമത്തിൽ ഇപ്പോൾ പെപ്പിറ്റയുടെ പൂക്കൾ പോലെ ചുവന്നു തിളങ്ങുന്ന ഒരു തീയുണ്ട്. സ്നേഹത്തോടെ നൽകുന്ന ഒരു സമ്മാനവും ഈശോയ്ക്ക് ചെറുതല്ലെന്ന് അത് നമ്മെ ഓർമ്മിപ്പിക്കുന്നു.",
      },
    },
  },
  {
    day: 5,
    en: {
      title: "Living Water",
      ref: "John 4:13-14",
      reflection: "Jesus gives water that never runs dry. Many children still walk far to find clean water.",
      task: "Offer a glass of water to someone at home, and say a prayer for people who have no clean water.",
      prayer: "Lord, you are the living water. Fill me and let me share your goodness.",
      verse: "Jesus told a woman at a well: Anyone who drinks this water will be thirsty again. But the water I give turns into a spring inside a person, bubbling up with life that lasts forever.",
      massPrayer: "Lord Jesus, fill me with your living water, so that I can share your love with everyone I meet.",
      story: {
        title: "The Bell That Calls Us to Pray",
        body: "Long before clocks and phones, church bells told people when it was time to pray. Many places still ring a bell three times a day: at six in the morning, at noon and at six in the evening. This is the Angelus bell. When it rings, people stop what they are doing to remember the day the angel Gabriel brought Mary the news that she would be the mother of Jesus. In Kerala, many families still pause at the evening bell and pray 'The Angel of the Lord' together. On Christmas night, bells ring out loud and joyful to say: Jesus is born! Today a bell hangs in our village. Each time you hear one, let it be a little call: stop, listen, and say hello to God.",
      },
    },
    ml: {
      title: "ജീവജലം",
      ref: "യോഹന്നാൻ 4:13-14",
      reflection: "ഒരിക്കലും വറ്റാത്ത ജലമാണ് ഈശോ നൽകുന്നത്. ശുദ്ധജലത്തിനായി ഇന്നും പല കുട്ടികളും ദൂരം നടക്കുന്നു.",
      task: "വീട്ടിലുള്ള ഒരാൾക്ക് ഒരു ഗ്ലാസ് വെള്ളം നൽകുക. ശുദ്ധജലം ഇല്ലാത്തവർക്കായി ഒരു പ്രാർത്ഥന ചൊല്ലുക.",
      prayer: "കർത്താവേ, അങ്ങാണ് ജീവജലം. എന്നെ നിറയ്ക്കണമേ; അങ്ങയുടെ നന്മ പങ്കുവയ്ക്കാൻ എന്നെ സഹായിക്കണമേ.",
      verse: "കിണറ്റിനരികിൽ വച്ച് ഈശോ ഒരു സ്ത്രീയോട് പറഞ്ഞു: ഈ വെള്ളം കുടിക്കുന്നവർക്ക് വീണ്ടും ദാഹിക്കും. എന്നാൽ ഞാൻ നൽകുന്ന ജലം ഒരാളുടെ ഉള്ളിൽ ഒരു ഉറവയായി മാറും; എന്നും നിലനിൽക്കുന്ന ജീവനിലേക്ക് അത് പൊങ്ങിയൊഴുകും.",
      massPrayer: "കർത്താവായ ഈശോയേ, അങ്ങയുടെ ജീവജലം കൊണ്ട് എന്നെ നിറയ്ക്കണമേ; ഞാൻ കാണുന്ന എല്ലാവരോടും അങ്ങയുടെ സ്നേഹം പങ്കുവയ്ക്കാൻ.",
      story: {
        title: "പ്രാർത്ഥനയിലേക്ക് വിളിക്കുന്ന മണി",
        body: "ഘടികാരങ്ങളും ഫോണുകളും വരുന്നതിന് വളരെ മുമ്പ്, പ്രാർത്ഥനയുടെ സമയം ആളുകളെ അറിയിച്ചിരുന്നത് പള്ളിമണികളാണ്. ഇന്നും പല സ്ഥലങ്ങളിലും ദിവസവും മൂന്ന് പ്രാവശ്യം മണി മുഴങ്ങുന്നു: രാവിലെ ആറിനും ഉച്ചയ്ക്ക് പന്ത്രണ്ടിനും വൈകുന്നേരം ആറിനും. ഇതാണ് ത്രിസന്ധ്യാ ജപത്തിന്റെ മണി. അത് മുഴങ്ങുമ്പോൾ, ഈശോയുടെ അമ്മയാകുമെന്ന സദ്വാർത്ത ഗബ്രിയേൽ മാലാഖ മറിയത്തെ അറിയിച്ച ദിവസം ഓർക്കാൻ ആളുകൾ ജോലി നിർത്തുന്നു. കേരളത്തിൽ പല കുടുംബങ്ങളും ഇന്നും സന്ധ്യാമണി കേൾക്കുമ്പോൾ ഒരുമിച്ചിരുന്ന് 'കർത്താവിന്റെ മാലാഖ' ചൊല്ലുന്നു. ക്രിസ്മസ് രാത്രി മണികൾ ഉച്ചത്തിലും സന്തോഷത്തോടെയും മുഴങ്ങി പറയുന്നു: ഈശോ പിറന്നു! ഇന്ന് നമ്മുടെ ഗ്രാമത്തിൽ ഒരു മണി തൂങ്ങുന്നു. ഓരോ തവണ മണി കേൾക്കുമ്പോഴും അത് ഒരു ചെറിയ വിളിയാകട്ടെ: നിൽക്കുക, കേൾക്കുക, ദൈവത്തോട് ഒരു വാക്ക് പറയുക.",
      },
    },
  },
  {
    day: 6,
    en: {
      title: "A Secret Gift",
      ref: "Matthew 6:3-4",
      reflection: "Saint Nicholas helped people quietly, without looking for thanks. God sees what is done in secret.",
      task: "Do one kind thing in secret today. Do not tell anyone it was you.",
      prayer: "Saint Nicholas, pray for me, that I may give with a happy heart.",
      verse: "When you help someone, do it quietly, without showing off. Keep it so secret that it is as if one hand does not know what the other is doing. Your Father in heaven sees what is hidden, and he will reward you.",
      massPrayer: "Father, you see every quiet gift. Help me give with a happy heart, without needing anyone to thank me.",
      story: {
        title: "The Lilies of the Field",
        body: "One day Jesus sat on a hillside with a big crowd. Many of them worried about food and clothes. Jesus pointed to the wild lilies growing in the grass. 'Look at them,' he said. 'They don't work or sew, yet even King Solomon in all his fine robes was not dressed as beautifully. If God takes such care of flowers, he will surely take care of you.' Because the lily is so white and pure, Christian artists often painted the angel Gabriel holding a lily when he visited Mary. Saint Joseph is often shown with one too. Today white lilies bloom in our village. When you see them, remember: you are precious to God, and he is looking after you.",
      },
    },
    ml: {
      title: "രഹസ്യ സമ്മാനം",
      ref: "മത്തായി 6:3-4",
      reflection: "വിശുദ്ധ നിക്കോളാസ് നന്ദി പ്രതീക്ഷിക്കാതെ രഹസ്യമായി ആളുകളെ സഹായിച്ചു. രഹസ്യത്തിൽ ചെയ്യുന്നത് ദൈവം കാണുന്നു.",
      task: "ഇന്ന് ആരും അറിയാതെ ഒരു നല്ല കാര്യം ചെയ്യുക. അത് നിങ്ങളാണെന്ന് ആരോടും പറയരുത്.",
      prayer: "വിശുദ്ധ നിക്കോളാസേ, സന്തോഷമുള്ള ഹൃദയത്തോടെ നൽകാൻ എനിക്കുവേണ്ടി പ്രാർത്ഥിക്കണമേ.",
      verse: "നിങ്ങൾ ആരെയെങ്കിലും സഹായിക്കുമ്പോൾ, ആരെയും കാണിക്കാതെ നിശ്ശബ്ദമായി ചെയ്യുക; ഒരു കൈ ചെയ്യുന്നത് മറ്റേ കൈ അറിയാത്തതുപോലെ. രഹസ്യത്തിൽ ചെയ്യുന്നത് സ്വർഗ്ഗസ്ഥനായ പിതാവ് കാണുന്നു; അവിടുന്ന് നിങ്ങൾക്ക് പ്രതിഫലം നൽകും.",
      massPrayer: "പിതാവേ, നിശ്ശബ്ദമായി നൽകുന്ന ഓരോ സമ്മാനവും അങ്ങ് കാണുന്നു. ആരുടെയും നന്ദി പ്രതീക്ഷിക്കാതെ സന്തോഷത്തോടെ നൽകാൻ എന്നെ സഹായിക്കണമേ.",
      story: {
        title: "വയലിലെ ലില്ലികൾ",
        body: "ഒരു ദിവസം ഈശോ ഒരു വലിയ ജനക്കൂട്ടത്തോടൊപ്പം ഒരു കുന്നിൻചെരുവിൽ ഇരിക്കുകയായിരുന്നു. ഭക്ഷണത്തെയും വസ്ത്രത്തെയും കുറിച്ച് പലരും ആകുലരായിരുന്നു. പുല്ലിനിടയിൽ വളരുന്ന കാട്ടുലില്ലികളെ ഈശോ ചൂണ്ടിക്കാട്ടി. 'അവയെ നോക്കൂ,' അവിടുന്ന് പറഞ്ഞു. 'അവ അധ്വാനിക്കുന്നില്ല, തുന്നുന്നില്ല. എങ്കിലും വിലയേറിയ വസ്ത്രങ്ങൾ അണിഞ്ഞ സോളമൻ രാജാവുപോലും ഇത്ര മനോഹരമായി ഒരുങ്ങിയിരുന്നില്ല. പൂക്കളെ ദൈവം ഇത്രമാത്രം കരുതുന്നെങ്കിൽ, നിങ്ങളെ എത്രയധികം കരുതും!' ലില്ലിപ്പൂവ് വളരെ വെളുത്തതും നിർമ്മലവുമായതിനാൽ, മറിയത്തെ സന്ദർശിക്കുന്ന ഗബ്രിയേൽ മാലാഖയുടെ കൈയിൽ ചിത്രകാരന്മാർ പലപ്പോഴും ഒരു ലില്ലി വരച്ചു. വിശുദ്ധ യൗസേപ്പിനെയും പലപ്പോഴും ലില്ലിയുമായി ചിത്രീകരിക്കാറുണ്ട്. ഇന്ന് നമ്മുടെ ഗ്രാമത്തിൽ വെളുത്ത ലില്ലികൾ വിരിയുന്നു. അവയെ കാണുമ്പോൾ ഓർക്കുക: നിങ്ങൾ ദൈവത്തിന് വിലപ്പെട്ടവരാണ്; അവിടുന്ന് നിങ്ങളെ കരുതുന്നു.",
      },
    },
  },
  {
    day: 7,
    en: {
      title: "Peacemakers",
      ref: "Matthew 5:9",
      reflection: "The olive branch is a sign of peace. Jesus calls peacemakers the children of God.",
      task: "Say sorry to someone you have hurt, or forgive someone who hurt you.",
      prayer: "Prince of Peace, make me a peacemaker at home and at school.",
      verse: "Jesus said: Happy are the people who bring peace where there is fighting. God will call them his very own children.",
      massPrayer: "Prince of Peace, fill my heart with your peace today, and help me carry it home.",
      story: {
        title: "Water from Bethlehem's Well",
        body: "Long before Jesus was born, Bethlehem was the hometown of King David. Once, during a war, enemy soldiers camped right inside Bethlehem, and David was hiding in a cave nearby. It was hot, and David sighed, 'If only someone could bring me a drink from the well by Bethlehem's gate!' Three of his bravest friends heard him. They slipped past the enemy camp, drew water from the well and carried it all the way back. But when David saw what they had risked, he would not drink it. He poured the water out on the ground as a gift to God, because his friends' love was too precious. Today a clay water jar comes to our village. It reminds us how precious even a simple drink of water can be.",
      },
    },
    ml: {
      title: "സമാധാനം സ്ഥാപിക്കുന്നവർ",
      ref: "മത്തായി 5:9",
      reflection: "ഒലിവ് ചില്ല സമാധാനത്തിന്റെ അടയാളമാണ്. സമാധാനം സ്ഥാപിക്കുന്നവരെ ദൈവമക്കൾ എന്നാണ് ഈശോ വിളിക്കുന്നത്.",
      task: "നിങ്ങൾ വേദനിപ്പിച്ച ഒരാളോട് ക്ഷമ ചോദിക്കുക, അല്ലെങ്കിൽ നിങ്ങളെ വേദനിപ്പിച്ച ഒരാളോട് ക്ഷമിക്കുക.",
      prayer: "സമാധാനത്തിന്റെ രാജാവേ, വീട്ടിലും സ്കൂളിലും സമാധാനം പകരുന്നവനാകാൻ എന്നെ സഹായിക്കണമേ.",
      verse: "ഈശോ പറഞ്ഞു: കലഹമുള്ളിടത്ത് സമാധാനം കൊണ്ടുവരുന്നവർ ഭാഗ്യവാന്മാർ. ദൈവം അവരെ തന്റെ സ്വന്തം മക്കൾ എന്ന് വിളിക്കും.",
      massPrayer: "സമാധാനത്തിന്റെ രാജാവേ, ഇന്ന് അങ്ങയുടെ സമാധാനം എന്റെ ഹൃദയത്തിൽ നിറയ്ക്കണമേ; അത് വീട്ടിലേക്ക് കൊണ്ടുപോകാൻ എന്നെ സഹായിക്കണമേ.",
      story: {
        title: "ബേത്‌ലെഹേമിലെ കിണറ്റിലെ വെള്ളം",
        body: "ഈശോ ജനിക്കുന്നതിന് വളരെ മുമ്പ്, ബേത്‌ലെഹേം ദാവീദ് രാജാവിന്റെ സ്വന്തം നാടായിരുന്നു. ഒരിക്കൽ യുദ്ധകാലത്ത് ശത്രുസൈന്യം ബേത്‌ലെഹേമിനുള്ളിൽ തന്നെ പാളയമടിച്ചു; ദാവീദ് അടുത്തുള്ള ഒരു ഗുഹയിൽ ഒളിച്ചിരിക്കുകയായിരുന്നു. നല്ല ചൂടായിരുന്നു. ദാവീദ് നെടുവീർപ്പിട്ടു: 'ബേത്‌ലെഹേമിന്റെ പടിവാതിലിനരികിലുള്ള കിണറ്റിലെ വെള്ളം ആരെങ്കിലും എനിക്ക് കൊണ്ടുവന്നിരുന്നെങ്കിൽ!' അവന്റെ ഏറ്റവും ധീരരായ മൂന്ന് കൂട്ടുകാർ അത് കേട്ടു. ശത്രുപാളയം കടന്ന് അവർ കിണറ്റിൽ നിന്ന് വെള്ളം കോരി തിരികെ കൊണ്ടുവന്നു. പക്ഷേ അവർ എടുത്ത അപകടം കണ്ടപ്പോൾ ദാവീദ് അത് കുടിച്ചില്ല. കൂട്ടുകാരുടെ സ്നേഹം അത്രയും വിലപ്പെട്ടതായതിനാൽ, ദൈവത്തിനുള്ള കാഴ്ചയായി അവൻ ആ വെള്ളം നിലത്ത് ഒഴിച്ചു. ഇന്ന് ഒരു മൺകുടം നമ്മുടെ ഗ്രാമത്തിലെത്തുന്നു. ഒരു തുള്ളി വെള്ളം പോലും എത്ര വിലപ്പെട്ടതാണെന്ന് അത് നമ്മെ ഓർമ്മിപ്പിക്കുന്നു.",
      },
    },
  },
  {
    day: 8,
    en: {
      title: "Prepare the Way of the Lord",
      ref: "Mark 1:1-8",
      reflection: "On this Second Sunday of Advent, John the Baptist calls us to clear the way to our hearts for Jesus.",
      task: "Prepare the way: tidy one messy place, like your school bag, a shelf or your corner of the room, as a sign that you are making room for Jesus.",
      prayer: "Jesus, clear the path to my heart and come in.",
      verse: "John the Baptist lived in the desert and called out to the people: Turn back to God and get your hearts ready! Someone greater than me is coming. I baptise you with water, but he will baptise you with the Holy Spirit.",
      massPrayer: "Lord, as John the Baptist prepared your way, help me get my heart ready for you.",
      story: {
        title: "Ten Lamps in the Night",
        body: "Jesus once told a story about a wedding. Ten young women waited with oil lamps to welcome the bridegroom and walk with him to the feast. Five were wise and brought extra oil in little jars. Five forgot. The bridegroom was late, and as the night went on, everyone fell asleep. At midnight a shout rang out: 'He's coming!' The lamps had burned low. The wise ones filled theirs and went out to meet him, but the others had to rush off to buy oil, and they missed the start of the feast. Jesus told this story so that we would keep our hearts ready, full of love and prayer, like a lamp full of oil. Today an oil lantern glows in our village. Keep your heart's lamp burning for Jesus!",
      },
    },
    ml: {
      title: "കർത്താവിന്റെ വഴി ഒരുക്കുവിൻ",
      ref: "മർക്കോസ് 1:1-8",
      reflection: "ആഗമനകാലത്തിലെ രണ്ടാം ഞായറാഴ്ച, ഈശോയ്ക്കായി നമ്മുടെ ഹൃദയത്തിലേക്കുള്ള വഴി ഒരുക്കാൻ സ്നാപക യോഹന്നാൻ നമ്മെ വിളിക്കുന്നു.",
      task: "വഴി ഒരുക്കുക: നിന്റെ സ്കൂൾ ബാഗ്, ഒരു അലമാരത്തട്ട്, അല്ലെങ്കിൽ മുറിയിലെ നിന്റെ ഭാഗം പോലെ, അലങ്കോലമായ ഒരിടം വൃത്തിയാക്കുക. ഈശോയ്ക്ക് ഇടം ഒരുക്കുന്നതിന്റെ അടയാളമാകട്ടെ അത്.",
      prayer: "ഈശോയേ, എന്റെ ഹൃദയത്തിലേക്കുള്ള വഴി തെളിച്ച് അകത്തേക്ക് വരണമേ.",
      verse: "സ്നാപക യോഹന്നാൻ മരുഭൂമിയിൽ ജീവിച്ച് ജനങ്ങളോട് വിളിച്ചുപറഞ്ഞു: ദൈവത്തിലേക്ക് തിരിയുവിൻ, നിങ്ങളുടെ ഹൃദയം ഒരുക്കുവിൻ! എന്നെക്കാൾ വലിയവൻ വരുന്നു. ഞാൻ വെള്ളംകൊണ്ട് സ്നാനം നൽകുന്നു; അവൻ പരിശുദ്ധാത്മാവിനാൽ സ്നാനം നൽകും.",
      massPrayer: "കർത്താവേ, സ്നാപക യോഹന്നാൻ അങ്ങയുടെ വഴി ഒരുക്കിയതുപോലെ, എന്റെ ഹൃദയം അങ്ങേക്കായി ഒരുക്കാൻ എന്നെ സഹായിക്കണമേ.",
      story: {
        title: "രാത്രിയിലെ പത്ത് വിളക്കുകൾ",
        body: "ഒരിക്കൽ ഈശോ ഒരു വിവാഹത്തെക്കുറിച്ച് ഒരു കഥ പറഞ്ഞു. മണവാളനെ സ്വീകരിച്ച് വിരുന്നിലേക്ക് അവനോടൊപ്പം പോകാൻ പത്ത് കന്യകമാർ എണ്ണവിളക്കുകളുമായി കാത്തിരുന്നു. അവരിൽ അഞ്ചുപേർ വിവേകമതികളായിരുന്നു; അവർ ചെറിയ പാത്രങ്ങളിൽ കൂടുതൽ എണ്ണ കരുതി. മറ്റ് അഞ്ചുപേർ അത് മറന്നുപോയി. മണവാളൻ വരാൻ വൈകി; രാത്രി ഏറെയായപ്പോൾ എല്ലാവരും ഉറങ്ങിപ്പോയി. അർദ്ധരാത്രിയിൽ ഒരു വിളി കേട്ടു: 'ഇതാ, അവൻ വരുന്നു!' വിളക്കുകൾ കെടാറായിരുന്നു. വിവേകമതികൾ എണ്ണ നിറച്ച് അവനെ എതിരേൽക്കാൻ പോയി; മറ്റുള്ളവർക്ക് എണ്ണ വാങ്ങാൻ ഓടേണ്ടിവന്നു, വിരുന്നിന്റെ തുടക്കം അവർക്ക് നഷ്ടമായി. എണ്ണ നിറഞ്ഞ വിളക്കുപോലെ, സ്നേഹവും പ്രാർത്ഥനയും നിറഞ്ഞ ഹൃദയവുമായി നാം ഒരുങ്ങിയിരിക്കാനാണ് ഈശോ ഈ കഥ പറഞ്ഞത്. ഇന്ന് നമ്മുടെ ഗ്രാമത്തിൽ ഒരു എണ്ണവിളക്ക് തെളിയുന്നു. നിങ്ങളുടെ ഹൃദയവിളക്ക് ഈശോയ്ക്കായി കത്തിനിൽക്കട്ടെ!",
      },
    },
  },
  {
    day: 9,
    en: {
      title: "Welcome One Another",
      ref: "Romans 15:7",
      reflection: "Mary and Joseph knocked on many doors. When we welcome others, we welcome Christ.",
      task: "Greet or sit with someone who is often left alone, at school or in your neighbourhood.",
      prayer: "Jesus, open my door and my heart to everyone who feels left out.",
      verse: "Jesus opened his arms wide to you, so open your arms to one another too. When you do, God's glory shines.",
      massPrayer: "Jesus, you welcome everyone. Help me welcome others the way you welcome me.",
      story: {
        title: "A Straw for Every Kindness",
        body: "In France and other countries, there is a lovely Advent custom. Early in December, families set up an empty manger with a little pile of straw beside it. Each time a child does a kind or helpful deed, they may lay one piece of straw in the manger. Shared a toy? One straw. Helped clear the table? Another. Forgave a brother or sister? One more! Day by day the empty manger fills up, until by Christmas Eve it holds a soft, thick bed, ready for the Baby Jesus. In Poland, families also tuck a little hay under the tablecloth on Christmas Eve, to remember the stable. Today a bundle of hay comes to our village. Every good deed you do this Advent makes Jesus's bed a little softer.",
      },
    },
    ml: {
      title: "പരസ്പരം സ്വീകരിക്കുവിൻ",
      ref: "റോമാ 15:7",
      reflection: "മറിയവും യൗസേപ്പും പല വാതിലുകളിൽ മുട്ടി. മറ്റുള്ളവരെ സ്വീകരിക്കുമ്പോൾ നാം ക്രിസ്തുവിനെയാണ് സ്വീകരിക്കുന്നത്.",
      task: "സ്കൂളിലോ അയൽപക്കത്തോ പലപ്പോഴും ഒറ്റയ്ക്കാകുന്ന ഒരാളോട് സംസാരിക്കുക, അല്ലെങ്കിൽ അവരുടെ കൂടെ ഇരിക്കുക.",
      prayer: "ഈശോയേ, ഒറ്റപ്പെട്ടവർക്കായി എന്റെ വാതിലും ഹൃദയവും തുറക്കണമേ.",
      verse: "ക്രിസ്തു നിങ്ങളെ തുറന്ന കൈകളോടെ സ്വീകരിച്ചു; അതുപോലെ നിങ്ങളും പരസ്പരം സ്വീകരിക്കുവിൻ. അപ്പോൾ ദൈവത്തിന്റെ മഹത്വം പ്രകാശിക്കും.",
      massPrayer: "ഈശോയേ, അങ്ങ് എല്ലാവരെയും സ്വീകരിക്കുന്നു. അങ്ങ് എന്നെ സ്വീകരിക്കുന്നതുപോലെ മറ്റുള്ളവരെ സ്വീകരിക്കാൻ എന്നെ സഹായിക്കണമേ.",
      story: {
        title: "ഓരോ നന്മയ്ക്കും ഒരു വൈക്കോൽ",
        body: "ഫ്രാൻസിലും മറ്റ് പല നാടുകളിലും മനോഹരമായ ഒരു ആഗമനകാല പതിവുണ്ട്. ഡിസംബറിന്റെ തുടക്കത്തിൽ കുടുംബങ്ങൾ ഒഴിഞ്ഞ ഒരു പുൽത്തൊട്ടി ഒരുക്കി, അതിനരികിൽ കുറച്ച് വൈക്കോൽ വയ്ക്കും. ഒരു കുട്ടി ഓരോ നല്ല കാര്യം ചെയ്യുമ്പോഴും ഒരു വൈക്കോൽതുരുമ്പ് തൊട്ടിയിൽ ഇടാം. കളിപ്പാട്ടം പങ്കുവച്ചോ? ഒരു വൈക്കോൽ. മേശ വൃത്തിയാക്കാൻ സഹായിച്ചോ? ഒന്നുകൂടി. സഹോദരനോടോ സഹോദരിയോടോ ക്ഷമിച്ചോ? ഇനിയും ഒന്ന്! ദിവസം തോറും ഒഴിഞ്ഞ തൊട്ടി നിറയും; ക്രിസ്മസ് രാത്രിയാകുമ്പോഴേക്കും ഉണ്ണീശോയെ കിടത്താൻ മൃദുവായ ഒരു കിടക്ക തയ്യാറാകും. പോളണ്ടിൽ, കാലിത്തൊഴുത്തിനെ ഓർക്കാൻ ക്രിസ്മസ് രാത്രി മേശവിരിക്കടിയിൽ കുറച്ച് വൈക്കോൽ വയ്ക്കുന്ന പതിവുമുണ്ട്. ഇന്ന് ഒരു കെട്ട് വൈക്കോൽ നമ്മുടെ ഗ്രാമത്തിലെത്തുന്നു. ഈ ആഗമനകാലത്ത് നിങ്ങൾ ചെയ്യുന്ന ഓരോ നന്മയും ഈശോയുടെ കിടക്ക കുറച്ചുകൂടി മൃദുവാക്കുന്നു.",
      },
    },
  },
  {
    day: 10,
    en: {
      title: "The Good Shepherd",
      ref: "John 10:14-15",
      reflection: "Jesus knows each of his sheep by name. He looks for the one that is lost or hurting.",
      task: "Think of someone who is sick or sad. Pray for them by name, and if you can, visit or call them.",
      prayer: "Good Shepherd, hold close everyone who is sick or sad today.",
      verse: "Jesus said: I am a good shepherd who knows every one of my sheep, and they know me, the way my Father and I know each other. I love my sheep so much that I give my life for them.",
      massPrayer: "Good Shepherd, I am one of your sheep. Keep me close to you, and bring home anyone who is lost.",
      story: {
        title: "The First Christmas Crib",
        body: "In the year 1223, Saint Francis of Assisi wanted people to see how humbly Jesus came to us. In a cave near the little Italian town of Greccio, he set up a real manger filled with hay, and brought a real ox and donkey. On Christmas night, villagers came with torches and candles, singing. A priest celebrated Mass right there by the manger, and Francis spoke about the Child of Bethlehem with so much love that everyone's heart was warmed. From that night, the custom of the crib spread everywhere. In Kerala, families build a pulkoodu in December, with straw, bamboo, coloured paper and little figures, and the manger stays empty until Christmas night. Today a wooden manger comes to our village, waiting for its Baby.",
      },
    },
    ml: {
      title: "നല്ല ഇടയൻ",
      ref: "യോഹന്നാൻ 10:14-15",
      reflection: "ഈശോ തന്റെ ഓരോ ആടിനെയും പേരുചൊല്ലി അറിയുന്നു. നഷ്ടപ്പെട്ടതിനെയും വേദനിക്കുന്നതിനെയും അവിടുന്ന് തേടുന്നു.",
      task: "രോഗിയോ ദുഃഖിതനോ ആയ ഒരാളെ ഓർക്കുക. അവരുടെ പേരുചൊല്ലി പ്രാർത്ഥിക്കുക; കഴിയുമെങ്കിൽ അവരെ സന്ദർശിക്കുകയോ വിളിക്കുകയോ ചെയ്യുക.",
      prayer: "നല്ല ഇടയനേ, ഇന്ന് രോഗികളെയും ദുഃഖിതരെയും അങ്ങയോട് ചേർത്തുപിടിക്കണമേ.",
      verse: "ഈശോ പറഞ്ഞു: എന്റെ ഓരോ ആടിനെയും അറിയുന്ന നല്ല ഇടയനാണ് ഞാൻ; അവ എന്നെയും അറിയുന്നു, പിതാവും ഞാനും പരസ്പരം അറിയുന്നതുപോലെ. എന്റെ ആടുകളെ ഞാൻ അത്രയേറെ സ്നേഹിക്കുന്നു; അവയ്ക്കുവേണ്ടി ഞാൻ എന്റെ ജീവൻ നൽകുന്നു.",
      massPrayer: "നല്ല ഇടയനേ, ഞാൻ അങ്ങയുടെ ഒരു ആടാണ്. എന്നെ അങ്ങയോട് ചേർത്തുനിർത്തണമേ; വഴിതെറ്റിയവരെ തിരികെ കൊണ്ടുവരണമേ.",
      story: {
        title: "ആദ്യത്തെ പുൽക്കൂട്",
        body: "1223-ൽ, ഈശോ എത്ര എളിമയോടെയാണ് നമ്മിലേക്ക് വന്നതെന്ന് ആളുകൾ കാണണമെന്ന് അസ്സീസിയിലെ വിശുദ്ധ ഫ്രാൻസിസ് ആഗ്രഹിച്ചു. ഇറ്റലിയിലെ ഗ്രേച്ചിയോ എന്ന ചെറിയ പട്ടണത്തിനടുത്തുള്ള ഒരു ഗുഹയിൽ അദ്ദേഹം വൈക്കോൽ നിറച്ച ഒരു യഥാർത്ഥ പുൽത്തൊട്ടി ഒരുക്കി; ഒരു കാളയെയും കഴുതയെയും കൊണ്ടുവന്നു. ക്രിസ്മസ് രാത്രി ഗ്രാമവാസികൾ പന്തങ്ങളും മെഴുകുതിരികളുമായി പാട്ടുപാടി വന്നു. ആ പുൽത്തൊട്ടിക്കരികിൽ ഒരു വൈദികൻ വിശുദ്ധ കുർബാന അർപ്പിച്ചു. ബേത്‌ലെഹേമിലെ ഉണ്ണിയെക്കുറിച്ച് ഫ്രാൻസിസ് അത്ര സ്നേഹത്തോടെ സംസാരിച്ചു; എല്ലാവരുടെയും മനം കുളിർത്തു. ആ രാത്രി മുതൽ പുൽക്കൂട് ഒരുക്കുന്ന പതിവ് ലോകമെങ്ങും പരന്നു. കേരളത്തിൽ ഡിസംബറിൽ കുടുംബങ്ങൾ വൈക്കോലും മുളയും വർണ്ണക്കടലാസും ചെറിയ രൂപങ്ങളും കൊണ്ട് പുൽക്കൂട് ഒരുക്കുന്നു; ക്രിസ്മസ് രാത്രി വരെ പുൽത്തൊട്ടി ഒഴിഞ്ഞുകിടക്കും. ഇന്ന് ഒരു മരപ്പുൽത്തൊട്ടി നമ്മുടെ ഗ്രാമത്തിലെത്തുന്നു; തന്റെ ഉണ്ണിയെ കാത്ത്.",
      },
    },
  },
  {
    day: 11,
    en: {
      title: "Watching in the Night",
      ref: "Luke 2:8",
      reflection: "The shepherds were quiet and awake, so they heard the good news first. God often speaks in silence.",
      task: "Before bed, sit in silence for three minutes with no screen. Just tell God you are listening.",
      prayer: "Speak, Lord. Your servant is listening.",
      verse: "In the fields near Bethlehem, some shepherds were staying out all night, taking turns to watch over their sheep.",
      massPrayer: "Lord, quiet my heart, so that I can hear what you want to say to me today.",
      story: {
        title: "The Little Donkey's Long Road",
        body: "When the Roman emperor ordered everyone to be counted, Joseph had to travel to Bethlehem, the town of his ancestor David. Mary went with him, even though her baby was nearly due. Nazareth to Bethlehem is a long, hilly road, about 150 kilometres. The Bible does not say how they travelled, but for centuries Christians have pictured Mary riding a patient little donkey while Joseph walked beside her, holding the rope. Step by step, over stones and dusty hills, the donkey carried its precious load. Years later, Jesus himself rode a donkey into Jerusalem while crowds waved palm branches. Donkeys are not fast or proud, but they are strong and faithful. Today a donkey joins our village. God can do great things through humble helpers, just like you.",
      },
    },
    ml: {
      title: "രാത്രിയിലെ കാവൽ",
      ref: "ലൂക്കാ 2:8",
      reflection: "ആട്ടിടയന്മാർ നിശ്ശബ്ദരായി ഉണർന്നിരുന്നു; അതുകൊണ്ട് സദ്വാർത്ത ആദ്യം കേട്ടത് അവരാണ്. ദൈവം പലപ്പോഴും നിശ്ശബ്ദതയിൽ സംസാരിക്കുന്നു.",
      task: "ഉറങ്ങുന്നതിനു മുമ്പ് മൊബൈലോ ടിവിയോ ഇല്ലാതെ മൂന്ന് മിനിറ്റ് നിശ്ശബ്ദമായി ഇരിക്കുക. 'ഞാൻ കേൾക്കുന്നു' എന്ന് ദൈവത്തോട് പറയുക.",
      prayer: "കർത്താവേ, അരുളിച്ചെയ്താലും; അങ്ങയുടെ ദാസൻ കേൾക്കുന്നു.",
      verse: "ബേത്‌ലെഹേമിനടുത്തുള്ള വയലുകളിൽ ചില ആട്ടിടയന്മാർ രാത്രി മുഴുവൻ പുറത്ത് തങ്ങി, മാറിമാറി തങ്ങളുടെ ആടുകൾക്ക് കാവലിരുന്നു.",
      massPrayer: "കർത്താവേ, എന്റെ ഹൃദയത്തെ ശാന്തമാക്കണമേ; ഇന്ന് അങ്ങ് എന്നോട് പറയുന്നത് കേൾക്കാൻ.",
      story: {
        title: "കൊച്ചുകഴുതയുടെ നീണ്ട യാത്ര",
        body: "എല്ലാവരുടെയും പേര് എഴുതിച്ചേർക്കണമെന്ന് റോമൻ ചക്രവർത്തി കല്പിച്ചപ്പോൾ, തന്റെ പൂർവ്വികനായ ദാവീദിന്റെ പട്ടണമായ ബേത്‌ലെഹേമിലേക്ക് യൗസേപ്പിന് യാത്ര ചെയ്യേണ്ടിവന്നു. പ്രസവം അടുത്തിരുന്നിട്ടും മറിയവും കൂടെപ്പോയി. നസറത്തിൽ നിന്ന് ബേത്‌ലെഹേമിലേക്ക് ഏകദേശം 150 കിലോമീറ്റർ ദൂരമുള്ള, കുന്നുകൾ നിറഞ്ഞ നീണ്ട വഴിയാണ്. അവർ എങ്ങനെയാണ് യാത്ര ചെയ്തതെന്ന് ബൈബിൾ പറയുന്നില്ല. എന്നാൽ ക്ഷമയുള്ള ഒരു കൊച്ചുകഴുതയുടെ പുറത്ത് മറിയം ഇരിക്കുന്നതും, കയർ പിടിച്ച് യൗസേപ്പ് അരികിൽ നടക്കുന്നതുമായാണ് നൂറ്റാണ്ടുകളായി ക്രൈസ്തവർ ആ യാത്രയെ സങ്കല്പിക്കുന്നത്. കല്ലുകളും പൊടി നിറഞ്ഞ കുന്നുകളും താണ്ടി, ഓരോ ചുവടും വച്ച്, ആ കഴുത തന്റെ വിലയേറിയ ഭാരം ചുമന്നു. വർഷങ്ങൾക്കുശേഷം, ജനക്കൂട്ടം കുരുത്തോലകൾ വീശുമ്പോൾ ഈശോ തന്നെ ഒരു കഴുതപ്പുറത്ത് ജറുസലേമിലേക്ക് പ്രവേശിച്ചു. കഴുതകൾ വേഗമുള്ളവയോ അഹങ്കാരികളോ അല്ല; പക്ഷേ അവ ശക്തരും വിശ്വസ്തരുമാണ്. ഇന്ന് ഒരു കഴുത നമ്മുടെ ഗ്രാമത്തിൽ ചേരുന്നു. നിങ്ങളെപ്പോലെയുള്ള എളിയ സഹായികളിലൂടെ ദൈവത്തിന് വലിയ കാര്യങ്ങൾ ചെയ്യാനാകും.",
      },
    },
  },
  {
    day: 12,
    en: {
      title: "Share Your Bread",
      ref: "Isaiah 58:7",
      reflection: "Bethlehem means 'house of bread'. God asks us to share our bread with the hungry.",
      task: "With your family, set aside some food or a little pocket money for someone in need.",
      prayer: "Father, give us our daily bread, and teach us to share it.",
      verse: "God says: Share your food with the hungry, open your home to people who have nowhere to live, and give clothes to those who need them. And never turn your back on your own family.",
      massPrayer: "Jesus, Bread of Life, feed my heart today and teach me to share with others.",
      story: {
        title: "Why Is There an Ox in the Crib?",
        body: "Look at almost any Christmas crib and you will find an ox and a donkey beside the manger. But the Gospels never mention them! So where did they come from? Long before Jesus was born, the prophet Isaiah wrote that an ox knows its owner and a donkey knows where its master feeds it, but God's people had forgotten him. Early Christians read those words and thought of Bethlehem: the Lord of all was lying in a feeding trough, and humble animals were there to welcome him. So they began to show an ox and a donkey in their pictures of the Nativity, and Saint Francis brought real ones to his crib. Today an ox comes to our village. It reminds us to recognise Jesus and stay close to him.",
      },
    },
    ml: {
      title: "അപ്പം പങ്കുവയ്ക്കുക",
      ref: "ഏശയ്യാ 58:7",
      reflection: "ബേത്‌ലെഹേം എന്ന വാക്കിന് 'അപ്പത്തിന്റെ ഭവനം' എന്നാണ് അർത്ഥം. വിശക്കുന്നവരുമായി അപ്പം പങ്കുവയ്ക്കാൻ ദൈവം നമ്മോട് ആവശ്യപ്പെടുന്നു.",
      task: "കുടുംബത്തോടൊപ്പം, ആവശ്യത്തിലിരിക്കുന്ന ഒരാൾക്കായി കുറച്ച് ഭക്ഷണമോ ചെറിയൊരു തുകയോ മാറ്റിവയ്ക്കുക.",
      prayer: "പിതാവേ, അന്നന്നുവേണ്ട ആഹാരം ഞങ്ങൾക്ക് തരണമേ; അത് പങ്കുവയ്ക്കാൻ ഞങ്ങളെ പഠിപ്പിക്കണമേ.",
      verse: "ദൈവം പറയുന്നു: വിശക്കുന്നവരുമായി നിങ്ങളുടെ ഭക്ഷണം പങ്കുവയ്ക്കുക; താമസിക്കാൻ ഇടമില്ലാത്തവർക്ക് നിങ്ങളുടെ വീട് തുറന്നുകൊടുക്കുക; ആവശ്യമുള്ളവർക്ക് വസ്ത്രം നൽകുക. സ്വന്തം കുടുംബത്തിൽ നിന്ന് ഒരിക്കലും മുഖം തിരിക്കരുത്.",
      massPrayer: "ജീവന്റെ അപ്പമായ ഈശോയേ, ഇന്ന് എന്റെ ഹൃദയത്തെ പോഷിപ്പിക്കണമേ; മറ്റുള്ളവരുമായി പങ്കുവയ്ക്കാൻ എന്നെ പഠിപ്പിക്കണമേ.",
      story: {
        title: "പുൽക്കൂട്ടിൽ കാള എന്തിന്?",
        body: "ഏത് പുൽക്കൂട്ടിൽ നോക്കിയാലും പുൽത്തൊട്ടിയുടെ അരികിൽ ഒരു കാളയെയും കഴുതയെയും കാണാം. പക്ഷേ സുവിശേഷങ്ങൾ അവയെക്കുറിച്ച് ഒന്നും പറയുന്നില്ല! പിന്നെ അവ എവിടെ നിന്ന് വന്നു? ഈശോ ജനിക്കുന്നതിന് വളരെ മുമ്പ് ഏശയ്യാ പ്രവാചകൻ എഴുതി: കാള തന്റെ ഉടമയെ അറിയുന്നു, കഴുത തന്റെ യജമാനൻ തീറ്റ നൽകുന്ന ഇടം അറിയുന്നു; എന്നാൽ ദൈവജനം അവിടുത്തെ മറന്നുപോയി. ആദിമ ക്രൈസ്തവർ ആ വാക്കുകൾ വായിച്ചപ്പോൾ ബേത്‌ലെഹേമിനെ ഓർത്തു: എല്ലാറ്റിന്റെയും നാഥൻ ഒരു തീറ്റത്തൊട്ടിയിൽ കിടക്കുന്നു; എളിയ മൃഗങ്ങൾ അവിടുത്തെ സ്വീകരിക്കാൻ അവിടെയുണ്ട്. അങ്ങനെ തിരുപ്പിറവിയുടെ ചിത്രങ്ങളിൽ അവർ കാളയെയും കഴുതയെയും വരയ്ക്കാൻ തുടങ്ങി. വിശുദ്ധ ഫ്രാൻസിസ് തന്റെ പുൽക്കൂട്ടിലേക്ക് യഥാർത്ഥ മൃഗങ്ങളെ കൊണ്ടുവന്നു. ഇന്ന് ഒരു കാള നമ്മുടെ ഗ്രാമത്തിലെത്തുന്നു. ഈശോയെ തിരിച്ചറിഞ്ഞ് അവിടുത്തോട് ചേർന്നുനിൽക്കാൻ അത് നമ്മെ ഓർമ്മിപ്പിക്കുന്നു.",
      },
    },
  },
  {
    day: 13,
    en: {
      title: "Rejoice!",
      ref: "Philippians 4:4-5",
      reflection: "The Lord is near, so the Church tells us today: rejoice! Joy grows when it is shared.",
      task: "Make someone smile today. Sing a Christmas carol together with your family.",
      prayer: "Lord, fill my heart with your joy and let it spread to others.",
      verse: "Always be full of joy because of the Lord, and keep on being joyful! Let everyone see your gentle kindness, because the Lord is close to us.",
      massPrayer: "Lord, you are near. Fill me with your joy as I pray to you today.",
      story: {
        title: "The Shepherd Boy of Bethlehem",
        body: "A thousand years before Jesus, God sent the prophet Samuel to Bethlehem to find a new king among the sons of a man named Jesse. One by one, seven tall, strong sons stood before Samuel, but each time God said, 'Not this one.' Samuel asked, 'Do you have any more sons?' 'Only the youngest,' said Jesse. 'He is out in the fields looking after the sheep.' They sent for him, and in ran David, a shepherd boy with bright eyes. God said, 'This is the one.' People look at the outside, but God looks at the heart. Samuel anointed David with oil, and he grew up to be Israel's greatest king. Jesus was born in Bethlehem from David's family. Today a shepherd comes to our village.",
      },
    },
    ml: {
      title: "സന്തോഷിക്കുവിൻ!",
      ref: "ഫിലിപ്പി 4:4-5",
      reflection: "കർത്താവ് അടുത്തെത്തിയിരിക്കുന്നു; അതിനാൽ സന്തോഷിക്കുവിൻ എന്ന് സഭ ഇന്ന് നമ്മോട് പറയുന്നു. പങ്കുവയ്ക്കുമ്പോൾ സന്തോഷം വളരുന്നു.",
      task: "ഇന്ന് ഒരാളെ ചിരിപ്പിക്കുക. കുടുംബത്തോടൊപ്പം ഒരു ക്രിസ്മസ് ഗാനം പാടുക.",
      prayer: "കർത്താവേ, അങ്ങയുടെ സന്തോഷം കൊണ്ട് എന്റെ ഹൃദയം നിറയ്ക്കണമേ; അത് മറ്റുള്ളവരിലേക്കും പകരട്ടെ.",
      verse: "കർത്താവിൽ എപ്പോഴും സന്തോഷം നിറഞ്ഞവരായിരിക്കുക; സന്തോഷിച്ചുകൊണ്ടേയിരിക്കുക! നിങ്ങളുടെ സൗമ്യമായ നന്മ എല്ലാവരും കാണട്ടെ; കാരണം കർത്താവ് നമ്മുടെ അടുത്തുണ്ട്.",
      massPrayer: "കർത്താവേ, അങ്ങ് അടുത്തുണ്ട്. ഇന്ന് ഞാൻ അങ്ങയോട് പ്രാർത്ഥിക്കുമ്പോൾ അങ്ങയുടെ സന്തോഷം കൊണ്ട് എന്നെ നിറയ്ക്കണമേ.",
      story: {
        title: "ബേത്‌ലെഹേമിലെ ഇടയബാലൻ",
        body: "ഈശോയ്ക്ക് ആയിരം വർഷം മുമ്പ്, ജസ്സെ എന്നയാളുടെ മക്കളിൽ നിന്ന് ഒരു പുതിയ രാജാവിനെ കണ്ടെത്താൻ ദൈവം സാമുവേൽ പ്രവാചകനെ ബേത്‌ലെഹേമിലേക്ക് അയച്ചു. ഉയരവും കരുത്തുമുള്ള ഏഴു മക്കൾ ഒന്നൊന്നായി സാമുവേലിന്റെ മുന്നിൽ വന്നു. ഓരോ തവണയും ദൈവം പറഞ്ഞു: 'ഇവനല്ല.' സാമുവേൽ ചോദിച്ചു: 'വേറെ മക്കളുണ്ടോ?' ജസ്സെ പറഞ്ഞു: 'ഏറ്റവും ഇളയവൻ മാത്രം. അവൻ വയലിൽ ആടുകളെ മേയ്ക്കുകയാണ്.' അവർ ആളയച്ചു; തിളങ്ങുന്ന കണ്ണുകളുള്ള ദാവീദ് എന്ന ഇടയബാലൻ ഓടിവന്നു. ദൈവം പറഞ്ഞു: 'ഇവൻ തന്നെ.' മനുഷ്യർ പുറമേ കാണുന്നു; ദൈവമോ ഹൃദയം കാണുന്നു. സാമുവേൽ ദാവീദിനെ എണ്ണ ഒഴിച്ച് അഭിഷേകം ചെയ്തു; അവൻ ഇസ്രായേലിന്റെ ഏറ്റവും വലിയ രാജാവായി വളർന്നു. ദാവീദിന്റെ കുടുംബത്തിൽ നിന്നാണ് ഈശോ ബേത്‌ലെഹേമിൽ പിറന്നത്. ഇന്ന് ഒരു ആട്ടിടയൻ നമ്മുടെ ഗ്രാമത്തിലെത്തുന്നു.",
      },
    },
  },
  {
    day: 14,
    en: {
      title: "A Thankful Heart",
      ref: "Isaiah 1:3",
      reflection: "The ox knows its owner. Do we remember the One who gives us everything?",
      task: "Tell God three things you are thankful for. Then thank one person out loud.",
      prayer: "Thank you, Father, for my life, my family and this day.",
      verse: "Even an ox knows who it belongs to, and a donkey knows where its owner feeds it. But God's own people have forgotten the One who cares for them.",
      massPrayer: "Thank you, God, for every good gift you give me. I thank you with my whole heart.",
      story: {
        title: "Good News in the Night",
        body: "It was a dark, quiet night on the hills outside Bethlehem. The shepherds sat by their fire, keeping watch over their sheep. Suddenly a bright light shone all around them, and an angel of the Lord stood before them. The shepherds were terrified! But the angel said, 'Don't be afraid. I bring you the happiest news, for all people: tonight in David's town your Saviour has been born. You will find the baby wrapped in cloths, lying in a manger.' Then the whole sky filled with angels praising God. When they had gone, the shepherds said, 'Let's go and see!' They hurried to Bethlehem, found Mary, Joseph and the baby, and went home singing God's praises. Today a second shepherd joins our village.",
      },
    },
    ml: {
      title: "നന്ദിയുള്ള ഹൃദയം",
      ref: "ഏശയ്യാ 1:3",
      reflection: "കാള അതിന്റെ ഉടമയെ അറിയുന്നു. എല്ലാം നൽകുന്നവനെ നാം ഓർക്കാറുണ്ടോ?",
      task: "നിങ്ങൾ നന്ദിയുള്ള മൂന്ന് കാര്യങ്ങൾ ദൈവത്തോട് പറയുക. പിന്നെ ഒരാളോട് നേരിട്ട് നന്ദി പറയുക.",
      prayer: "പിതാവേ, എന്റെ ജീവനും കുടുംബത്തിനും ഈ ദിവസത്തിനും നന്ദി.",
      verse: "കാളയ്ക്കുപോലും തന്റെ ഉടമ ആരാണെന്ന് അറിയാം; കഴുതയ്ക്ക് യജമാനൻ തീറ്റ നൽകുന്ന ഇടം അറിയാം. എന്നാൽ തങ്ങളെ കരുതുന്നവനെ ദൈവത്തിന്റെ സ്വന്തം ജനം മറന്നുപോയി.",
      massPrayer: "ദൈവമേ, അങ്ങ് എനിക്ക് നൽകുന്ന എല്ലാ നല്ല ദാനങ്ങൾക്കും നന്ദി. പൂർണ്ണഹൃദയത്തോടെ ഞാൻ അങ്ങേക്ക് നന്ദി പറയുന്നു.",
      story: {
        title: "രാത്രിയിലെ സദ്വാർത്ത",
        body: "ബേത്‌ലെഹേമിനു പുറത്തുള്ള കുന്നുകളിൽ ഇരുണ്ടതും ശാന്തവുമായ ഒരു രാത്രിയായിരുന്നു. ആട്ടിടയന്മാർ തീക്കരികിലിരുന്ന് ആടുകൾക്ക് കാവലിരുന്നു. പെട്ടെന്ന് ഒരു ഉജ്ജ്വല പ്രകാശം അവരുടെ ചുറ്റും പരന്നു; കർത്താവിന്റെ ഒരു മാലാഖ അവരുടെ മുന്നിൽ നിന്നു. ഇടയന്മാർ വല്ലാതെ ഭയന്നു! പക്ഷേ മാലാഖ പറഞ്ഞു: 'ഭയപ്പെടേണ്ട. എല്ലാവർക്കുമുള്ള ഏറ്റവും സന്തോഷകരമായ വാർത്ത ഞാൻ കൊണ്ടുവരുന്നു: ഇന്നു രാത്രി ദാവീദിന്റെ പട്ടണത്തിൽ നിങ്ങളുടെ രക്ഷകൻ പിറന്നിരിക്കുന്നു. തുണികളിൽ പൊതിഞ്ഞ് പുൽത്തൊട്ടിയിൽ കിടക്കുന്ന ശിശുവിനെ നിങ്ങൾ കാണും.' അപ്പോൾ ആകാശം മുഴുവൻ ദൈവത്തെ സ്തുതിക്കുന്ന മാലാഖമാരെക്കൊണ്ട് നിറഞ്ഞു. അവർ പോയപ്പോൾ ഇടയന്മാർ പറഞ്ഞു: 'വരൂ, നമുക്ക് പോയി കാണാം!' അവർ തിടുക്കത്തിൽ ബേത്‌ലെഹേമിലെത്തി, മറിയത്തെയും യൗസേപ്പിനെയും ശിശുവിനെയും കണ്ടു; ദൈവത്തെ സ്തുതിച്ചുകൊണ്ട് മടങ്ങി. ഇന്ന് രണ്ടാമതൊരു ആട്ടിടയൻ നമ്മുടെ ഗ്രാമത്തിൽ ചേരുന്നു.",
      },
    },
  },
  {
    day: 15,
    en: {
      title: "Rejoice! A Witness to the Light",
      ref: "John 1:6-8, 19-28",
      reflection: "This is Gaudete Sunday, the Sunday of joy. Like John, we can point others to Jesus, the Light.",
      task: "Carry something for someone today: shopping bags, schoolbooks or a bucket of water.",
      prayer: "Jesus, make me humble and ready to help.",
      verse: "God sent a man named John to tell everyone about the Light, so that all might believe. When people asked who he was, John said: I am not the Christ. I am the voice calling in the desert: make the way straight for the Lord!",
      massPrayer: "Jesus, I bring you everyone who is carrying a heavy load today. Help them, and show me how to help too.",
      story: {
        title: "Camels from the East",
        body: "Matthew's Gospel tells us that wise men came from the East, following a star, to find the newborn King. It does not say how they travelled. But hundreds of years earlier, the prophet Isaiah had looked ahead to a day when crowds of camels would come from far-off lands, carrying gold and frankincense to praise the Lord. So Christians have always pictured the wise men riding camels. Camels are perfect for long desert journeys: they can walk for days with little water, and their wide feet don't sink in the sand. Picture them swaying across the dunes by night, bells jingling, the star shining ahead. Today a camel comes to our village. Like the wise men, keep travelling toward Jesus, even when the road is long.",
      },
    },
    ml: {
      title: "സന്തോഷിക്കുവിൻ! പ്രകാശത്തിന് സാക്ഷി",
      ref: "യോഹന്നാൻ 1:6-8, 19-28",
      reflection: "ഇത് ഗൗദേത്തേ ഞായർ, സന്തോഷത്തിന്റെ ഞായറാഴ്ച. യോഹന്നാനെപ്പോലെ, പ്രകാശമായ ഈശോയിലേക്ക് നമുക്കും മറ്റുള്ളവരെ നയിക്കാം.",
      task: "ഇന്ന് ഒരാൾക്കുവേണ്ടി എന്തെങ്കിലും ചുമക്കുക: സാധനങ്ങളുടെ സഞ്ചി, പുസ്തകങ്ങൾ, അല്ലെങ്കിൽ ഒരു ബക്കറ്റ് വെള്ളം.",
      prayer: "ഈശോയേ, എന്നെ എളിമയുള്ളവനും സഹായിക്കാൻ സന്നദ്ധനും ആക്കണമേ.",
      verse: "എല്ലാവരും വിശ്വസിക്കാനായി പ്രകാശത്തെക്കുറിച്ച് സാക്ഷ്യം നൽകാൻ ദൈവം യോഹന്നാൻ എന്ന ഒരാളെ അയച്ചു. നീ ആരാണെന്ന് ആളുകൾ ചോദിച്ചപ്പോൾ യോഹന്നാൻ പറഞ്ഞു: ഞാൻ ക്രിസ്തുവല്ല. കർത്താവിന്റെ വഴി നേരെയാക്കുവിൻ എന്ന് മരുഭൂമിയിൽ വിളിച്ചുപറയുന്നവന്റെ സ്വരമാണ് ഞാൻ.",
      massPrayer: "ഈശോയേ, ഇന്ന് ഭാരം ചുമക്കുന്ന എല്ലാവരെയും ഞാൻ അങ്ങയുടെ മുന്നിൽ കൊണ്ടുവരുന്നു. അവരെ സഹായിക്കണമേ; എനിക്കും സഹായിക്കാൻ വഴി കാണിക്കണമേ.",
      story: {
        title: "കിഴക്കുനിന്നുള്ള ഒട്ടകങ്ങൾ",
        body: "കിഴക്കുനിന്ന് ജ്ഞാനികൾ ഒരു നക്ഷത്രത്തെ പിന്തുടർന്ന് പുതുതായി പിറന്ന രാജാവിനെ തേടി വന്നുവെന്ന് മത്തായിയുടെ സുവിശേഷം പറയുന്നു. അവർ എങ്ങനെ യാത്ര ചെയ്തുവെന്ന് പറയുന്നില്ല. എന്നാൽ നൂറുകണക്കിന് വർഷം മുമ്പ്, ദൂരദേശങ്ങളിൽ നിന്ന് ഒട്ടകക്കൂട്ടങ്ങൾ സ്വർണ്ണവും കുന്തിരിക്കവുമായി കർത്താവിനെ സ്തുതിക്കാൻ വരുന്ന ഒരു ദിവസം ഏശയ്യാ പ്രവാചകൻ മുൻകൂട്ടി കണ്ടു. അതിനാൽ ജ്ഞാനികൾ ഒട്ടകപ്പുറത്ത് യാത്ര ചെയ്യുന്നതായാണ് ക്രൈസ്തവർ എന്നും ചിത്രീകരിച്ചിട്ടുള്ളത്. നീണ്ട മരുഭൂമിയാത്രകൾക്ക് ഒട്ടകങ്ങൾ ഏറ്റവും യോജിച്ചതാണ്: കുറച്ച് വെള്ളം മാത്രം കുടിച്ച് ദിവസങ്ങളോളം അവയ്ക്ക് നടക്കാനാകും; അവയുടെ വീതിയുള്ള പാദങ്ങൾ മണലിൽ താഴില്ല. രാത്രിയിൽ മണിയൊച്ചയോടെ, മുന്നിൽ നക്ഷത്രം തിളങ്ങുമ്പോൾ, മണൽക്കുന്നുകൾക്കു മീതെ ആടിയാടി നീങ്ങുന്ന അവയെ സങ്കല്പിച്ചു നോക്കൂ. ഇന്ന് ഒരു ഒട്ടകം നമ്മുടെ ഗ്രാമത്തിലെത്തുന്നു. ജ്ഞാനികളെപ്പോലെ, വഴി നീണ്ടതാണെങ്കിലും ഈശോയുടെ അടുത്തേക്കുള്ള യാത്ര തുടരുക.",
      },
    },
  },
  {
    day: 16,
    en: {
      title: "Care for the Little Ones",
      ref: "Luke 15:4-6",
      reflection: "The shepherd carries the lamb on his shoulders. God cares most tenderly for the small and the weak.",
      task: "Help a younger child today: with homework, a game, or just by being patient.",
      prayer: "Lord, give me a gentle heart toward those smaller than me.",
      verse: "If a shepherd with a hundred sheep loses just one, he leaves the others and searches until he finds it. Then he joyfully carries it home on his shoulders and invites his friends to celebrate with him.",
      massPrayer: "Good Shepherd, when I am tired or lost, carry me on your shoulders.",
      story: {
        title: "King Melchior Asks the Way",
        body: "The Gospel does not tell us the wise men's names, or even how many there were. But because they brought three gifts, people came to think of three, and about 1,500 years ago they were already being called Melchior, Caspar and Balthazar. In an old mosaic in Ravenna, Italy, you can still see them hurrying toward Mary and the Child, with their names written above them. Melchior is usually shown as the oldest, with a long white beard, carrying gold. When the wise men reached Jerusalem, they went to King Herod's palace and asked, 'Where is the newborn King of the Jews? We saw his star rise.' Herod's teachers searched the Scriptures and answered: 'In Bethlehem.' Today King Melchior arrives in our village, still following the star.",
      },
    },
    ml: {
      title: "ചെറിയവരെ കരുതുക",
      ref: "ലൂക്കാ 15:4-6",
      reflection: "ഇടയൻ കുഞ്ഞാടിനെ തോളിലേറ്റുന്നു. ചെറിയവരെയും ബലഹീനരെയും ദൈവം ഏറ്റവും ആർദ്രതയോടെ കരുതുന്നു.",
      task: "ഇന്ന് നിങ്ങളെക്കാൾ ചെറിയ ഒരു കുട്ടിയെ സഹായിക്കുക: പഠനത്തിലോ കളിയിലോ, അല്ലെങ്കിൽ ക്ഷമയോടെ പെരുമാറിക്കൊണ്ട്.",
      prayer: "കർത്താവേ, എന്നെക്കാൾ ചെറിയവരോട് സൗമ്യമായ ഹൃദയം എനിക്ക് നൽകണമേ.",
      verse: "നൂറ് ആടുകളുള്ള ഒരു ഇടയന് ഒന്നിനെ നഷ്ടപ്പെട്ടാൽ, മറ്റുള്ളവയെ വിട്ട് അതിനെ കണ്ടെത്തുന്നതുവരെ അവൻ തേടിനടക്കും. പിന്നെ സന്തോഷത്തോടെ അതിനെ തോളിലേറ്റി വീട്ടിൽ കൊണ്ടുവന്ന്, തന്നോടൊപ്പം ആഘോഷിക്കാൻ കൂട്ടുകാരെ വിളിക്കും.",
      massPrayer: "നല്ല ഇടയനേ, ഞാൻ തളരുമ്പോഴും വഴിതെറ്റുമ്പോഴും എന്നെ അങ്ങയുടെ തോളിലേറ്റണമേ.",
      story: {
        title: "വഴി ചോദിക്കുന്ന മെൽക്കിയോർ രാജാവ്",
        body: "ജ്ഞാനികളുടെ പേരുകളോ അവർ എത്രപേരുണ്ടായിരുന്നുവെന്നോ സുവിശേഷം പറയുന്നില്ല. പക്ഷേ അവർ മൂന്ന് കാഴ്ചകൾ കൊണ്ടുവന്നതിനാൽ അവർ മൂന്നുപേരാണെന്ന് ആളുകൾ കരുതി. ഏകദേശം 1,500 വർഷം മുമ്പുതന്നെ അവരെ മെൽക്കിയോർ, കാസ്പർ, ബൽത്തസാർ എന്ന് വിളിച്ചുതുടങ്ങിയിരുന്നു. ഇറ്റലിയിലെ റവെന്നയിലുള്ള ഒരു പഴയ മൊസൈക്ക് ചിത്രത്തിൽ, മുകളിൽ പേരുകൾ എഴുതിയ നിലയിൽ, മറിയത്തിന്റെയും ഉണ്ണിയുടെയും അടുത്തേക്ക് തിടുക്കത്തിൽ പോകുന്ന അവരെ ഇന്നും കാണാം. മെൽക്കിയോറിനെ സാധാരണയായി നീണ്ട വെളുത്ത താടിയുള്ള, ഏറ്റവും പ്രായമുള്ളവനായി, സ്വർണ്ണവുമായി ചിത്രീകരിക്കുന്നു. ജ്ഞാനികൾ ജറുസലേമിലെത്തിയപ്പോൾ ഹേറോദേസ് രാജാവിന്റെ കൊട്ടാരത്തിൽ ചെന്ന് ചോദിച്ചു: 'പുതുതായി പിറന്ന യഹൂദരുടെ രാജാവ് എവിടെ? അവന്റെ നക്ഷത്രം ഉദിക്കുന്നത് ഞങ്ങൾ കണ്ടു.' ഹേറോദേസിന്റെ പണ്ഡിതന്മാർ തിരുവെഴുത്തുകൾ പരിശോധിച്ച് ഉത്തരം നൽകി: 'ബേത്‌ലെഹേമിൽ.' ഇന്ന് നക്ഷത്രത്തെ പിന്തുടർന്ന് മെൽക്കിയോർ രാജാവ് നമ്മുടെ ഗ്രാമത്തിലെത്തുന്നു.",
      },
    },
  },
  {
    day: 17,
    en: {
      title: "O Wisdom",
      ref: "Proverbs 9:1",
      reflection: "Wisdom has built her house. Jesus is the Wisdom of God, who comes to teach us the way.",
      task: "Read today's Scripture passage aloud with someone in your family and talk about one line you liked.",
      prayer: "O Wisdom, come and teach me the way of truth.",
      verse: "Wisdom is like a builder who makes a strong, beautiful house, held up by seven pillars, and then throws open the doors to welcome guests.",
      massPrayer: "Jesus, Wisdom of God, open my ears to your Word and my heart to your way.",
      story: {
        title: "Caspar and the Chalk on the Door",
        body: "Caspar is often pictured as the youngest of the three kings, sometimes without a beard, bringing a gift of frankincense. His name lives on in a happy custom. On the feast of the Epiphany in January, when the Church remembers the wise men's visit, many families around the world bless their homes. With blessed chalk, they write the numbers of the new year above the front door, with the letters C, M and B in between. The letters stand for Caspar, Melchior and Balthazar. They also stand for a Latin prayer that means 'May Christ bless this house.' In some countries children dress up as the three kings and go from house to house singing, a little like Kerala's carol groups. Today King Caspar arrives in our village.",
      },
    },
    ml: {
      title: "ഓ ജ്ഞാനമേ",
      ref: "സുഭാഷിതങ്ങൾ 9:1",
      reflection: "ജ്ഞാനം തന്റെ ഭവനം പണിതിരിക്കുന്നു. നമ്മെ വഴി പഠിപ്പിക്കാൻ വരുന്ന ദൈവത്തിന്റെ ജ്ഞാനമാണ് ഈശോ.",
      task: "ഇന്നത്തെ തിരുവചനഭാഗം കുടുംബത്തിലെ ഒരാളോടൊപ്പം ഉറക്കെ വായിക്കുക. നിങ്ങൾക്ക് ഇഷ്ടപ്പെട്ട ഒരു വാക്യത്തെക്കുറിച്ച് സംസാരിക്കുക.",
      prayer: "ഓ ജ്ഞാനമേ, വന്ന് സത്യത്തിന്റെ വഴി എന്നെ പഠിപ്പിക്കണമേ.",
      verse: "ഏഴ് തൂണുകളിൽ ഉറപ്പിച്ച് മനോഹരമായ ഒരു വീട് പണിത്, അതിഥികളെ സ്വാഗതം ചെയ്യാൻ വാതിലുകൾ തുറന്നിടുന്ന ഒരു ശില്പിയെപ്പോലെയാണ് ജ്ഞാനം.",
      massPrayer: "ദൈവത്തിന്റെ ജ്ഞാനമായ ഈശോയേ, അങ്ങയുടെ വചനത്തിനായി എന്റെ കാതുകളും അങ്ങയുടെ വഴിക്കായി എന്റെ ഹൃദയവും തുറക്കണമേ.",
      story: {
        title: "കാസ്പറും വാതിലിലെ ചോക്കെഴുത്തും",
        body: "മൂന്ന് രാജാക്കന്മാരിൽ ഏറ്റവും ഇളയവനായി, ചിലപ്പോൾ താടിയില്ലാതെ, കുന്തിരിക്കം കാഴ്ചയുമായി വരുന്നവനായാണ് കാസ്പറിനെ പലപ്പോഴും ചിത്രീകരിക്കുന്നത്. സന്തോഷകരമായ ഒരു പതിവിൽ അദ്ദേഹത്തിന്റെ പേര് ഇന്നും ജീവിക്കുന്നു. ജ്ഞാനികളുടെ സന്ദർശനം സഭ ഓർക്കുന്ന ജനുവരിയിലെ ദൈവപ്രത്യക്ഷീകരണ തിരുനാളിൽ, ലോകമെങ്ങുമുള്ള പല കുടുംബങ്ങളും തങ്ങളുടെ വീടുകൾ ആശീർവദിക്കുന്നു. വെഞ്ചരിച്ച ചോക്ക് കൊണ്ട് മുൻവാതിലിനു മുകളിൽ പുതുവർഷത്തിന്റെ അക്കങ്ങളും അവയ്ക്കിടയിൽ C, M, B എന്ന അക്ഷരങ്ങളും എഴുതുന്നു. ഈ അക്ഷരങ്ങൾ കാസ്പർ, മെൽക്കിയോർ, ബൽത്തസാർ എന്നിവരെ സൂചിപ്പിക്കുന്നു. 'ക്രിസ്തു ഈ ഭവനം ആശീർവദിക്കട്ടെ' എന്നർത്ഥമുള്ള ഒരു ലത്തീൻ പ്രാർത്ഥനയെയും അവ സൂചിപ്പിക്കുന്നു. ചില നാടുകളിൽ കുട്ടികൾ മൂന്ന് രാജാക്കന്മാരുടെ വേഷമണിഞ്ഞ് വീടുതോറും പാട്ടുപാടി പോകുന്നു; നമ്മുടെ കേരളത്തിലെ കരോൾ സംഘങ്ങളെപ്പോലെ. ഇന്ന് കാസ്പർ രാജാവ് നമ്മുടെ ഗ്രാമത്തിലെത്തുന്നു.",
      },
    },
  },
  {
    day: 18,
    en: {
      title: "O Lord of Israel",
      ref: "Exodus 3:1-6",
      reflection: "God spoke to Moses from a bush that burned but was not destroyed. The same Lord comes to save us.",
      task: "Light a candle or lamp with your family tonight and pray the Our Father together.",
      prayer: "O Lord, come with your strong arm and set us free.",
      verse: "Moses was looking after sheep near God's mountain when he saw a bush on fire that never burned up. God called his name from the bush and told him to take off his sandals, because he was standing on holy ground.",
      massPrayer: "Holy God, wherever I pray to you is holy ground. Help me come to you with wonder and love.",
      story: {
        title: "Balthazar Goes Home Another Way",
        body: "Balthazar is often pictured as a king from Africa, carrying a jar of myrrh. Together, the three kings remind us that Jesus came for people of every land and every colour. When the wise men finally found the Child with Mary, they were filled with joy. They knelt, worshipped him and gave their gifts. That night, God warned them in a dream not to go back to King Herod, who secretly wanted to harm the Child. So they obeyed, and set off for home by a different road. Meeting Jesus changed their path! It changes ours too: after we have been with him, we want to walk in a new and better way. Today King Balthazar arrives in our village, and all three kings are on their way to Jesus.",
      },
    },
    ml: {
      title: "ഓ ഇസ്രായേലിന്റെ നാഥാ",
      ref: "പുറപ്പാട് 3:1-6",
      reflection: "കത്തിയിട്ടും എരിഞ്ഞുതീരാത്ത മുൾപ്പടർപ്പിൽ നിന്ന് ദൈവം മോശയോട് സംസാരിച്ചു. അതേ കർത്താവ് നമ്മെ രക്ഷിക്കാൻ വരുന്നു.",
      task: "ഇന്ന് രാത്രി കുടുംബത്തോടൊപ്പം ഒരു മെഴുകുതിരിയോ വിളക്കോ തെളിച്ച് 'സ്വർഗ്ഗസ്ഥനായ പിതാവേ' ഒരുമിച്ച് ചൊല്ലുക.",
      prayer: "കർത്താവേ, അങ്ങയുടെ ശക്തമായ കരത്താൽ വന്ന് ഞങ്ങളെ സ്വതന്ത്രരാക്കണമേ.",
      verse: "ദൈവത്തിന്റെ മലയ്ക്കരികിൽ ആടുകളെ മേയ്ക്കുമ്പോൾ, കത്തിയിട്ടും എരിഞ്ഞുതീരാത്ത ഒരു മുൾപ്പടർപ്പ് മോശ കണ്ടു. ആ മുൾപ്പടർപ്പിൽ നിന്ന് ദൈവം അവനെ പേരുചൊല്ലി വിളിച്ചു; അവൻ നിൽക്കുന്നത് വിശുദ്ധമായ സ്ഥലത്താണെന്നും ചെരിപ്പ് അഴിച്ചുമാറ്റണമെന്നും പറഞ്ഞു.",
      massPrayer: "പരിശുദ്ധനായ ദൈവമേ, ഞാൻ അങ്ങയോട് പ്രാർത്ഥിക്കുന്ന ഇടമെല്ലാം വിശുദ്ധമാണ്. അത്ഭുതത്തോടും സ്നേഹത്തോടും കൂടി അങ്ങയുടെ അടുത്ത് വരാൻ എന്നെ സഹായിക്കണമേ.",
      story: {
        title: "മറ്റൊരു വഴിയേ മടങ്ങുന്ന ബൽത്തസാർ",
        body: "ആഫ്രിക്കയിൽ നിന്നുള്ള ഒരു രാജാവായി, മീറയുടെ പാത്രവുമായാണ് ബൽത്തസാറിനെ പലപ്പോഴും ചിത്രീകരിക്കുന്നത്. എല്ലാ നാടുകളിലെയും എല്ലാ നിറങ്ങളിലെയും മനുഷ്യർക്കായാണ് ഈശോ വന്നതെന്ന് മൂന്ന് രാജാക്കന്മാരും ഒരുമിച്ച് നമ്മെ ഓർമ്മിപ്പിക്കുന്നു. ഒടുവിൽ മറിയത്തോടൊപ്പം ശിശുവിനെ കണ്ടപ്പോൾ ജ്ഞാനികൾ സന്തോഷം കൊണ്ട് നിറഞ്ഞു. അവർ മുട്ടുകുത്തി അവിടുത്തെ ആരാധിച്ച് കാഴ്ചകൾ സമർപ്പിച്ചു. ആ രാത്രി, ശിശുവിനെ ഉപദ്രവിക്കാൻ രഹസ്യമായി ആഗ്രഹിച്ചിരുന്ന ഹേറോദേസിന്റെ അടുത്തേക്ക് മടങ്ങിപ്പോകരുതെന്ന് ദൈവം സ്വപ്നത്തിൽ അവർക്ക് മുന്നറിയിപ്പ് നൽകി. അവർ അനുസരിച്ചു; മറ്റൊരു വഴിയിലൂടെ നാട്ടിലേക്ക് മടങ്ങി. ഈശോയെ കണ്ടുമുട്ടിയത് അവരുടെ വഴി മാറ്റി! നമ്മുടെ വഴിയും അങ്ങനെ തന്നെ: ഈശോയോടൊപ്പം ആയിരുന്നശേഷം പുതിയതും നല്ലതുമായ ഒരു വഴിയിൽ നടക്കാൻ നാം ആഗ്രഹിക്കുന്നു. ഇന്ന് ബൽത്തസാർ രാജാവ് നമ്മുടെ ഗ്രാമത്തിലെത്തുന്നു; മൂന്ന് രാജാക്കന്മാരും ഇപ്പോൾ ഈശോയുടെ അടുത്തേക്കുള്ള യാത്രയിലാണ്.",
      },
    },
  },
  {
    day: 19,
    en: {
      title: "O Root of Jesse",
      ref: "Matthew 1:20-21",
      reflection: "An angel told Joseph, son of David, not to be afraid. Joseph listened and obeyed at once.",
      task: "Obey the first time you are asked today, without complaining.",
      prayer: "Saint Joseph, pray for me, that I may listen and obey with trust.",
      verse: "In a dream, an angel told Joseph not to be afraid to welcome Mary into his home as his wife, because her baby came from the Holy Spirit. Joseph was to name the boy Jesus, for he would save his people from their sins.",
      massPrayer: "Saint Joseph, help me trust God and do what is right, even when I feel afraid.",
      story: {
        title: "A Gift Fit for a King",
        body: "Gold is one of the most precious metals there is. It never rusts or loses its shine, and for thousands of years kings have worn golden crowns and sat on golden thrones. So when the wise men opened their treasure boxes before the little Child in Bethlehem, the gold was a way of saying: 'You are a King!' But Jesus is a very different kind of king. He was born in a stable, not a palace. He came to look after others, not to be waited on. He wore a crown of thorns, not gold, because he loves us so much. What gold can we give him? Our love, which is more precious to him than any treasure. Today a gift of gold shines in our village. Give Jesus the gold of your heart.",
      },
    },
    ml: {
      title: "ഓ ജസ്സെയുടെ വേരേ",
      ref: "മത്തായി 1:20-21",
      reflection: "ദാവീദിന്റെ പുത്രനായ യൗസേപ്പിനോട് ഭയപ്പെടേണ്ടാ എന്ന് മാലാഖ പറഞ്ഞു. യൗസേപ്പ് ഉടനെ കേട്ട് അനുസരിച്ചു.",
      task: "ഇന്ന് ആദ്യം പറയുമ്പോൾ തന്നെ, പരാതിയില്ലാതെ അനുസരിക്കുക.",
      prayer: "വിശുദ്ധ യൗസേപ്പിതാവേ, വിശ്വാസത്തോടെ കേട്ട് അനുസരിക്കാൻ എനിക്കുവേണ്ടി പ്രാർത്ഥിക്കണമേ.",
      verse: "സ്വപ്നത്തിൽ ഒരു മാലാഖ യൗസേപ്പിനോട് പറഞ്ഞു: മറിയത്തെ ഭാര്യയായി നിന്റെ വീട്ടിലേക്ക് സ്വീകരിക്കാൻ ഭയപ്പെടേണ്ട; അവളുടെ ശിശു പരിശുദ്ധാത്മാവിൽ നിന്നുള്ളതാണ്. അവന് ഈശോ എന്ന് പേരിടണം; കാരണം അവൻ തന്റെ ജനത്തെ പാപങ്ങളിൽ നിന്ന് രക്ഷിക്കും.",
      massPrayer: "വിശുദ്ധ യൗസേപ്പിതാവേ, ഭയം തോന്നുമ്പോഴും ദൈവത്തിൽ ആശ്രയിച്ച് ശരിയായത് ചെയ്യാൻ എന്നെ സഹായിക്കണമേ.",
      story: {
        title: "രാജാവിന് ചേർന്ന കാഴ്ച",
        body: "ഏറ്റവും വിലപിടിപ്പുള്ള ലോഹങ്ങളിൽ ഒന്നാണ് സ്വർണ്ണം. അത് ഒരിക്കലും തുരുമ്പിക്കുകയോ തിളക്കം നഷ്ടപ്പെടുകയോ ഇല്ല. ആയിരക്കണക്കിന് വർഷങ്ങളായി രാജാക്കന്മാർ സ്വർണ്ണക്കിരീടങ്ങൾ അണിഞ്ഞ് സ്വർണ്ണസിംഹാസനങ്ങളിൽ ഇരുന്നു. അതിനാൽ ബേത്‌ലെഹേമിലെ കൊച്ചുശിശുവിന്റെ മുന്നിൽ ജ്ഞാനികൾ നിക്ഷേപപ്പെട്ടികൾ തുറന്നപ്പോൾ, ആ സ്വർണ്ണം പറഞ്ഞു: 'അങ്ങ് രാജാവാണ്!' പക്ഷേ ഈശോ വളരെ വ്യത്യസ്തനായ ഒരു രാജാവാണ്. കൊട്ടാരത്തിലല്ല, കാലിത്തൊഴുത്തിലാണ് അവിടുന്ന് പിറന്നത്. മറ്റുള്ളവരാൽ ശുശ്രൂഷിക്കപ്പെടാനല്ല, മറ്റുള്ളവരെ കരുതാനാണ് അവിടുന്ന് വന്നത്. നമ്മെ അത്രയേറെ സ്നേഹിച്ചതിനാൽ സ്വർണ്ണക്കിരീടമല്ല, മുൾക്കിരീടമാണ് അവിടുന്ന് അണിഞ്ഞത്. നമുക്ക് അവിടുത്തേക്ക് എന്ത് സ്വർണ്ണം നൽകാനാകും? നമ്മുടെ സ്നേഹം; ഏത് നിധിയെക്കാളും അത് അവിടുത്തേക്ക് വിലപ്പെട്ടതാണ്. ഇന്ന് ഒരു സ്വർണ്ണക്കാഴ്ച നമ്മുടെ ഗ്രാമത്തിൽ തിളങ്ങുന്നു. നിങ്ങളുടെ ഹൃദയത്തിന്റെ സ്വർണ്ണം ഈശോയ്ക്ക് നൽകുക.",
      },
    },
  },
  {
    day: 20,
    en: {
      title: "O Key of David",
      ref: "Isaiah 22:22",
      reflection: "Jesus is the key that opens what no one can shut. He opens the gate to the Father's house.",
      task: "Open a door for someone, or invite someone who is left out to join your game.",
      prayer: "O Key of David, open my heart and lead me into your light.",
      verse: "God says he will place the key of David's house on the shoulder of the one he chooses. When he opens a door, nobody can shut it, and when he shuts it, nobody can open it.",
      massPrayer: "Jesus, Key of David, open my heart wide to you and to the people around me.",
      story: {
        title: "Prayers Rising Like Smoke",
        body: "Frankincense comes from small, twisted trees that grow in the dry lands of Arabia and Africa. Workers cut the bark, and a milky sap seeps out and hardens into pale, sweet-smelling drops. When those drops are placed on hot coals, they send up a cloud of fragrant smoke. In the Temple in Jerusalem, incense was burned every day, and a psalm asks God to let our prayer rise before him like incense. So when the wise men gave Jesus frankincense, they were saying: 'You are God!' In Kerala churches, on great feast days, the priest swings the censer and sweet smoke drifts up toward the altar. Today a gift of frankincense comes to our village. Let your prayers rise to God like that sweet smoke.",
      },
    },
    ml: {
      title: "ഓ ദാവീദിന്റെ താക്കോലേ",
      ref: "ഏശയ്യാ 22:22",
      reflection: "ആർക്കും അടയ്ക്കാനാവാത്തത് തുറക്കുന്ന താക്കോലാണ് ഈശോ. പിതാവിന്റെ ഭവനത്തിലേക്കുള്ള വാതിൽ അവിടുന്ന് തുറക്കുന്നു.",
      task: "ഒരാൾക്കുവേണ്ടി വാതിൽ തുറന്നുകൊടുക്കുക, അല്ലെങ്കിൽ ഒറ്റപ്പെട്ട ഒരാളെ നിങ്ങളുടെ കളിയിൽ ചേർക്കുക.",
      prayer: "ഓ ദാവീദിന്റെ താക്കോലേ, എന്റെ ഹൃദയം തുറന്ന് അങ്ങയുടെ പ്രകാശത്തിലേക്ക് എന്നെ നയിക്കണമേ.",
      verse: "ദാവീദിന്റെ ഭവനത്തിന്റെ താക്കോൽ താൻ തിരഞ്ഞെടുക്കുന്നവന്റെ തോളിൽ വയ്ക്കുമെന്ന് ദൈവം പറയുന്നു. അവൻ ഒരു വാതിൽ തുറന്നാൽ ആർക്കും അടയ്ക്കാനാവില്ല; അവൻ അടച്ചാൽ ആർക്കും തുറക്കാനുമാവില്ല.",
      massPrayer: "ദാവീദിന്റെ താക്കോലായ ഈശോയേ, അങ്ങേക്കും എന്റെ ചുറ്റുമുള്ളവർക്കുമായി എന്റെ ഹൃദയം വിശാലമായി തുറക്കണമേ.",
      story: {
        title: "പുകപോലെ ഉയരുന്ന പ്രാർത്ഥനകൾ",
        body: "അറേബ്യയിലെയും ആഫ്രിക്കയിലെയും വരണ്ട പ്രദേശങ്ങളിൽ വളരുന്ന ചെറിയ, വളഞ്ഞുപുളഞ്ഞ മരങ്ങളിൽ നിന്നാണ് കുന്തിരിക്കം ലഭിക്കുന്നത്. പണിക്കാർ മരത്തിന്റെ തൊലിയിൽ മുറിവുണ്ടാക്കുമ്പോൾ പാൽ പോലുള്ള ഒരു കറ ഒലിച്ചിറങ്ങി, സുഗന്ധമുള്ള ഇളംനിറത്തിലുള്ള തുള്ളികളായി ഉറയ്ക്കുന്നു. ആ തുള്ളികൾ ചൂടുള്ള കനലിൽ ഇടുമ്പോൾ സുഗന്ധമുള്ള പുക ഉയരുന്നു. ജറുസലേം ദേവാലയത്തിൽ എല്ലാ ദിവസവും ധൂപം അർപ്പിച്ചിരുന്നു. നമ്മുടെ പ്രാർത്ഥന ധൂപം പോലെ ദൈവസന്നിധിയിലേക്ക് ഉയരട്ടെ എന്ന് ഒരു സങ്കീർത്തനം അപേക്ഷിക്കുന്നു. അതിനാൽ ജ്ഞാനികൾ ഈശോയ്ക്ക് കുന്തിരിക്കം നൽകിയപ്പോൾ അവർ പറയുകയായിരുന്നു: 'അങ്ങ് ദൈവമാണ്!' കേരളത്തിലെ ദേവാലയങ്ങളിൽ വലിയ തിരുനാളുകളിൽ വൈദികൻ ധൂപക്കുറ്റി വീശുമ്പോൾ മധുരമുള്ള പുക അൾത്താരയിലേക്ക് ഉയരുന്നു. ഇന്ന് കുന്തിരിക്കത്തിന്റെ കാഴ്ച നമ്മുടെ ഗ്രാമത്തിലെത്തുന്നു. നിങ്ങളുടെ പ്രാർത്ഥനകൾ ആ സുഗന്ധപ്പുക പോലെ ദൈവത്തിലേക്ക് ഉയരട്ടെ.",
      },
    },
  },
  {
    day: 21,
    en: {
      title: "O Rising Dawn",
      ref: "Luke 1:78-79",
      reflection: "Jesus is the dawn that shines on those in darkness. Far away, wise men have set out to find him.",
      task: "Be a light today: say something kind and true to three different people.",
      prayer: "O Rising Dawn, shine on all who sit in darkness.",
      verse: "Because our God is so tender and kind, a new light is about to rise over us like the morning sun. It will shine on everyone sitting in darkness and guide our feet onto the road of peace.",
      massPrayer: "Jesus, morning light, shine in my heart and in every dark place in the world.",
      story: {
        title: "The Strange Gift of Myrrh",
        body: "Myrrh is a reddish-brown resin from a thorny little tree. It smells sweet but tastes bitter. In Bible times it was used as a perfume and a medicine, and also to care for the bodies of people who had died. Why would anyone give a gift like that to a baby? Christians have long seen myrrh as a sign of what Jesus would do: he would grow up and give his life for us on the cross. Years later, after Jesus died, Nicodemus brought myrrh and spices to care for his body. But the story did not end there! On Easter morning Jesus rose again. Today a gift of myrrh comes to our village. It reminds us that Jesus loves us so much that he gave everything for us.",
      },
    },
    ml: {
      title: "ഓ ഉദയസൂര്യാ",
      ref: "ലൂക്കാ 1:78-79",
      reflection: "ഇരുളിൽ കഴിയുന്നവരുടെമേൽ പ്രകാശിക്കുന്ന ഉദയമാണ് ഈശോ. ദൂരെ, ജ്ഞാനികൾ അവിടുത്തെ തേടി യാത്ര തിരിച്ചിരിക്കുന്നു.",
      task: "ഇന്ന് ഒരു പ്രകാശമാകുക: മൂന്ന് പേരോട് സത്യവും സ്നേഹവുമുള്ള ഒരു നല്ല വാക്ക് പറയുക.",
      prayer: "ഓ ഉദയസൂര്യാ, ഇരുളിൽ ഇരിക്കുന്ന എല്ലാവരുടെയുംമേൽ പ്രകാശിക്കണമേ.",
      verse: "നമ്മുടെ ദൈവം അത്രയേറെ ആർദ്രതയും കരുണയും ഉള്ളവനായതിനാൽ, പ്രഭാതസൂര്യനെപ്പോലെ ഒരു പുതിയ പ്രകാശം നമ്മുടെമേൽ ഉദിക്കാൻ പോകുന്നു. ഇരുളിൽ ഇരിക്കുന്ന എല്ലാവരുടെയുംമേൽ അത് പ്രകാശിക്കും; സമാധാനത്തിന്റെ വഴിയിലേക്ക് നമ്മുടെ കാലുകളെ നയിക്കും.",
      massPrayer: "പ്രഭാതവെളിച്ചമായ ഈശോയേ, എന്റെ ഹൃദയത്തിലും ലോകത്തിലെ എല്ലാ ഇരുണ്ട ഇടങ്ങളിലും പ്രകാശിക്കണമേ.",
      story: {
        title: "മീറ എന്ന വിചിത്ര സമ്മാനം",
        body: "മുള്ളുകളുള്ള ഒരു ചെറിയ മരത്തിൽ നിന്നുള്ള ചുവപ്പുകലർന്ന തവിട്ടുനിറമുള്ള കറയാണ് മീറ. അതിന് നല്ല സുഗന്ധമുണ്ട്, പക്ഷേ രുചി കയ്പ്പാണ്. ബൈബിൾ കാലത്ത് അത് സുഗന്ധദ്രവ്യമായും മരുന്നായും, മരിച്ചവരുടെ ശരീരം ഒരുക്കാനും ഉപയോഗിച്ചിരുന്നു. ഒരു കുഞ്ഞിന് ആരെങ്കിലും ഇങ്ങനെയൊരു സമ്മാനം നൽകുമോ? ഈശോ ചെയ്യാനിരുന്നതിന്റെ അടയാളമായാണ് ക്രൈസ്തവർ പണ്ടുമുതലേ മീറയെ കാണുന്നത്: അവിടുന്ന് വളർന്ന് കുരിശിൽ നമുക്കായി തന്റെ ജീവൻ നൽകും. വർഷങ്ങൾക്കുശേഷം ഈശോ മരിച്ചപ്പോൾ, നിക്കോദേമോസ് അവിടുത്തെ ശരീരം ഒരുക്കാൻ മീറയും സുഗന്ധദ്രവ്യങ്ങളും കൊണ്ടുവന്നു. പക്ഷേ കഥ അവിടെ അവസാനിച്ചില്ല! ഉയിർപ്പ് ഞായറാഴ്ച രാവിലെ ഈശോ ഉയിർത്തെഴുന്നേറ്റു. ഇന്ന് മീറയുടെ കാഴ്ച നമ്മുടെ ഗ്രാമത്തിലെത്തുന്നു. നമുക്കായി എല്ലാം നൽകാൻ മാത്രം ഈശോ നമ്മെ സ്നേഹിക്കുന്നുവെന്ന് അത് നമ്മെ ഓർമ്മിപ്പിക്കുന്നു.",
      },
    },
  },
  {
    day: 22,
    en: {
      title: "Mary's Yes",
      ref: "Luke 1:26-38",
      reflection: "On this Fourth Sunday of Advent, Christmas is very near. Like Mary, we say yes to God.",
      task: "Pray one Hail Mary slowly. Then say a cheerful yes the next time your parents ask for help.",
      prayer: "Mother Mary, help me say yes to God as you did.",
      verse: "God sent the angel Gabriel to a young woman named Mary in Nazareth. Gabriel told her that God loved her and that she would be the mother of a son named Jesus, the Son of God. Mary trusted God and said yes with all her heart.",
      massPrayer: "Mother Mary, stay beside me as I pray to your Son today.",
      story: {
        title: "A Star Over Every Home",
        body: "When the wise men left Jerusalem, the star they had seen rising went ahead of them until it stopped over the place where the Child was. How happy they were! Ever since, the star has been a sign of Christmas. In Kerala, in December, homes, churches and shops hang a nakshatram: a glowing paper star lantern with a light shining inside. Many families make their own from bamboo sticks and coloured paper. The stars glow in the dark like a message: Jesus is coming, and he is the light of the world. At night, carol groups walk from house to house with drums and a Christmas Papa, singing, and each home with a star welcomes them. Today the Star of Bethlehem shines over our village, showing the way to Jesus.",
      },
    },
    ml: {
      title: "മറിയത്തിന്റെ സമ്മതം",
      ref: "ലൂക്കാ 1:26-38",
      reflection: "ആഗമനകാലത്തിലെ നാലാം ഞായറാഴ്ച; ക്രിസ്മസ് വളരെ അടുത്തെത്തി. മറിയത്തെപ്പോലെ നമുക്കും ദൈവത്തോട് സമ്മതം പറയാം.",
      task: "'നന്മ നിറഞ്ഞ മറിയമേ' എന്ന പ്രാർത്ഥന സാവധാനം ചൊല്ലുക. മാതാപിതാക്കൾ അടുത്ത തവണ സഹായം ചോദിക്കുമ്പോൾ സന്തോഷത്തോടെ സമ്മതിക്കുക.",
      prayer: "പരിശുദ്ധ അമ്മേ, അമ്മയെപ്പോലെ ദൈവത്തോട് സമ്മതം പറയാൻ എന്നെ സഹായിക്കണമേ.",
      verse: "ദൈവം ഗബ്രിയേൽ മാലാഖയെ നസറത്തിലെ മറിയം എന്ന യുവതിയുടെ അടുത്തേക്ക് അയച്ചു. ദൈവം അവളെ സ്നേഹിക്കുന്നുവെന്നും ദൈവപുത്രനായ ഈശോയുടെ അമ്മയാകുമെന്നും മാലാഖ അവളോട് പറഞ്ഞു. മറിയം ദൈവത്തിൽ ആശ്രയിച്ച് പൂർണ്ണഹൃദയത്തോടെ സമ്മതം പറഞ്ഞു.",
      massPrayer: "പരിശുദ്ധ അമ്മേ, ഇന്ന് ഞാൻ അമ്മയുടെ മകനോട് പ്രാർത്ഥിക്കുമ്പോൾ എന്റെ അരികിൽ ഉണ്ടായിരിക്കണമേ.",
      story: {
        title: "ഓരോ വീടിനും മുകളിലെ നക്ഷത്രം",
        body: "ജ്ഞാനികൾ ജറുസലേമിൽ നിന്ന് പുറപ്പെട്ടപ്പോൾ, അവർ ഉദിച്ചുകണ്ട നക്ഷത്രം ശിശു ഉണ്ടായിരുന്ന സ്ഥലത്തിനു മുകളിൽ നിൽക്കുന്നതുവരെ അവർക്കു മുമ്പേ നീങ്ങി. അവർ എത്ര സന്തോഷിച്ചു! അന്നുമുതൽ നക്ഷത്രം ക്രിസ്മസിന്റെ അടയാളമാണ്. കേരളത്തിൽ ഡിസംബറിൽ വീടുകളിലും ദേവാലയങ്ങളിലും കടകളിലും നക്ഷത്രം തൂക്കുന്നു: ഉള്ളിൽ വെളിച്ചം തെളിയുന്ന, തിളങ്ങുന്ന കടലാസ് നക്ഷത്രവിളക്ക്. പല കുടുംബങ്ങളും മുളക്കമ്പുകളും വർണ്ണക്കടലാസും കൊണ്ട് സ്വന്തമായി നക്ഷത്രം ഉണ്ടാക്കുന്നു. ഇരുട്ടിൽ തിളങ്ങുന്ന ആ നക്ഷത്രങ്ങൾ ഒരു സന്ദേശം പോലെയാണ്: ഈശോ വരുന്നു; അവിടുന്നാണ് ലോകത്തിന്റെ പ്രകാശം. രാത്രിയിൽ കരോൾ സംഘങ്ങൾ ചെണ്ടയും ക്രിസ്മസ് പാപ്പയുമായി പാട്ടുപാടി വീടുതോറും പോകുന്നു; നക്ഷത്രം തൂക്കിയ ഓരോ വീടും അവരെ സ്വീകരിക്കുന്നു. ഇന്ന് ബേത്‌ലെഹേമിലെ നക്ഷത്രം നമ്മുടെ ഗ്രാമത്തിനു മുകളിൽ തിളങ്ങുന്നു; ഈശോയിലേക്കുള്ള വഴി കാണിച്ചുകൊണ്ട്.",
      },
    },
  },
  {
    day: 23,
    en: {
      title: "O Emmanuel",
      ref: "Matthew 1:22-23",
      reflection: "Emmanuel means 'God is with us'. He is with us at home, at school, and when we are afraid.",
      task: "Help prepare your family's crib or Christmas decorations, and pray together in front of it.",
      prayer: "O Emmanuel, come and stay with us always.",
      verse: "All this happened just as a prophet had promised long before: a young virgin would have a son, and people would call him Emmanuel, a name that means 'God is with us'.",
      massPrayer: "Emmanuel, God with us, thank you for being here with me right now.",
      story: {
        title: "Joseph, the Quiet Hero",
        body: "Joseph was a carpenter in Nazareth. He worked with wood, making doors, tables and ploughs. He was engaged to marry Mary. When he learned she was expecting a baby, he was worried and confused. He was a good man, so he quietly planned to step away without bringing her any shame. But one night an angel came to him in a dream and said, 'Don't be afraid to take Mary home. This child is from God.' When Joseph woke up, he did exactly what the angel said. Later he led Mary safely all the way to Bethlehem and searched for a place for her to rest. In the whole Gospel, Joseph never speaks a single word, yet he always listens and acts. Today Joseph comes to our village.",
      },
    },
    ml: {
      title: "ഓ എമ്മാനുവേൽ",
      ref: "മത്തായി 1:22-23",
      reflection: "എമ്മാനുവേൽ എന്നാൽ 'ദൈവം നമ്മോടുകൂടെ' എന്നാണ് അർത്ഥം. വീട്ടിലും സ്കൂളിലും നാം ഭയപ്പെടുമ്പോഴും അവിടുന്ന് നമ്മോടുകൂടെയുണ്ട്.",
      task: "വീട്ടിലെ പുൽക്കൂടോ ക്രിസ്മസ് അലങ്കാരങ്ങളോ ഒരുക്കാൻ സഹായിക്കുക. അതിനു മുന്നിൽ കുടുംബത്തോടൊപ്പം പ്രാർത്ഥിക്കുക.",
      prayer: "ഓ എമ്മാനുവേൽ, വന്ന് എന്നും ഞങ്ങളോടുകൂടെ വസിക്കണമേ.",
      verse: "വളരെ മുമ്പ് ഒരു പ്രവാചകൻ വാഗ്ദാനം ചെയ്തതുപോലെ തന്നെ ഇതെല്ലാം സംഭവിച്ചു: ഒരു കന്യക ഒരു പുത്രനെ പ്രസവിക്കും; ആളുകൾ അവനെ എമ്മാനുവേൽ എന്ന് വിളിക്കും. ആ പേരിന്റെ അർത്ഥം 'ദൈവം നമ്മോടുകൂടെ' എന്നാണ്.",
      massPrayer: "ദൈവം നമ്മോടുകൂടെ എന്നർത്ഥമുള്ള എമ്മാനുവേലേ, ഇപ്പോൾ ഇവിടെ എന്നോടൊപ്പം ആയിരിക്കുന്നതിന് നന്ദി.",
      story: {
        title: "നിശ്ശബ്ദനായ വീരൻ യൗസേപ്പ്",
        body: "നസറത്തിലെ ഒരു തച്ചനായിരുന്നു യൗസേപ്പ്. മരം കൊണ്ട് വാതിലുകളും മേശകളും കലപ്പകളും അവൻ ഉണ്ടാക്കി. മറിയവുമായി അവന്റെ വിവാഹം നിശ്ചയിച്ചിരുന്നു. അവൾ ഒരു കുഞ്ഞിനെ ഉദരത്തിൽ വഹിക്കുന്നുവെന്ന് അറിഞ്ഞപ്പോൾ അവൻ ആകുലനായി, ആശയക്കുഴപ്പത്തിലായി. നല്ലവനായ അവൻ, അവൾക്ക് ഒരു അപമാനവും വരുത്താതെ രഹസ്യമായി പിന്മാറാൻ തീരുമാനിച്ചു. പക്ഷേ ഒരു രാത്രി സ്വപ്നത്തിൽ ഒരു മാലാഖ അവന്റെ അടുത്തുവന്ന് പറഞ്ഞു: 'മറിയത്തെ നിന്റെ വീട്ടിലേക്ക് സ്വീകരിക്കാൻ ഭയപ്പെടേണ്ട. ഈ ശിശു ദൈവത്തിൽ നിന്നുള്ളതാണ്.' ഉണർന്നപ്പോൾ മാലാഖ പറഞ്ഞതുപോലെ തന്നെ യൗസേപ്പ് ചെയ്തു. പിന്നീട് ബേത്‌ലെഹേം വരെ മറിയത്തെ സുരക്ഷിതമായി കൊണ്ടുപോയി; അവൾക്ക് വിശ്രമിക്കാൻ ഒരിടം തേടി. സുവിശേഷത്തിൽ ഒരിടത്തും യൗസേപ്പ് ഒരു വാക്കുപോലും പറയുന്നില്ല; എങ്കിലും അവൻ എപ്പോഴും കേൾക്കുകയും പ്രവർത്തിക്കുകയും ചെയ്യുന്നു. ഇന്ന് യൗസേപ്പ് നമ്മുടെ ഗ്രാമത്തിലെത്തുന്നു.",
      },
    },
  },
  {
    day: 24,
    en: {
      title: "The Holy Night",
      ref: "Luke 2:1-7",
      reflection: "Tonight the long wait ends. In a poor stable, under a bright star, the Saviour is born.",
      task: "Read the Christmas story from Luke with your family tonight. Wish each person at home a blessed Christmas.",
      prayer: "Come, Lord Jesus. My heart is ready for you.",
      verse: "The emperor ordered everyone to be counted, so Joseph took Mary from Nazareth to Bethlehem, the town of King David. While they were there, Mary's baby was born. She wrapped him snugly and laid him in a manger, because there was no space for them in the guest room.",
      massPrayer: "Mother Mary, help me get my heart ready to welcome Jesus tonight.",
      story: {
        title: "Mary Sets Out",
        body: "After the angel Gabriel's visit, Mary did not sit still. She heard that her older relative Elizabeth was also expecting a baby, so she hurried over the hills to help her. When Mary walked in and greeted her, Elizabeth's baby leapt for joy inside her, and Elizabeth cried out that Mary was blessed among women. Mary's heart overflowed, and she sang a song of praise: God lifts up the humble and fills the hungry with good things. Months later, Mary set out again, this time on the long road to Bethlehem with Joseph. There, on the holy night, she wrapped her newborn son and laid him in the manger, and she kept all these things in her heart. Today Mary comes to our village, ready to welcome her Son.",
      },
    },
    ml: {
      title: "വിശുദ്ധ രാത്രി",
      ref: "ലൂക്കാ 2:1-7",
      reflection: "ഇന്ന് രാത്രി നീണ്ട കാത്തിരിപ്പ് അവസാനിക്കുന്നു. ഒരു എളിയ കാലിത്തൊഴുത്തിൽ, തിളങ്ങുന്ന നക്ഷത്രത്തിനു കീഴെ, രക്ഷകൻ പിറക്കുന്നു.",
      task: "ഇന്ന് രാത്രി കുടുംബത്തോടൊപ്പം ലൂക്കായുടെ സുവിശേഷത്തിൽ നിന്ന് ക്രിസ്മസ് വിവരണം വായിക്കുക. വീട്ടിലെ ഓരോരുത്തർക്കും ക്രിസ്മസ് ആശംസകൾ നേരുക.",
      prayer: "കർത്താവായ ഈശോയേ, വരണമേ. എന്റെ ഹൃദയം അങ്ങേക്കായി ഒരുങ്ങിയിരിക്കുന്നു.",
      verse: "എല്ലാവരുടെയും പേര് എഴുതിച്ചേർക്കാൻ ചക്രവർത്തി കല്പിച്ചു. അതിനാൽ യൗസേപ്പ് മറിയത്തെയും കൂട്ടി നസറത്തിൽ നിന്ന് ദാവീദ് രാജാവിന്റെ പട്ടണമായ ബേത്‌ലെഹേമിലേക്ക് പോയി. അവിടെയായിരിക്കുമ്പോൾ മറിയം തന്റെ ശിശുവിന് ജന്മം നൽകി. അതിഥിമുറിയിൽ ഇടമില്ലാതിരുന്നതിനാൽ അവൾ അവനെ തുണികളിൽ പൊതിഞ്ഞ് പുൽത്തൊട്ടിയിൽ കിടത്തി.",
      massPrayer: "പരിശുദ്ധ അമ്മേ, ഇന്നു രാത്രി ഈശോയെ സ്വീകരിക്കാൻ എന്റെ ഹൃദയം ഒരുക്കാൻ എന്നെ സഹായിക്കണമേ.",
      story: {
        title: "യാത്രയാകുന്ന മറിയം",
        body: "ഗബ്രിയേൽ മാലാഖയുടെ സന്ദർശനത്തിനുശേഷം മറിയം വെറുതെയിരുന്നില്ല. പ്രായമായ തന്റെ ബന്ധു എലിസബത്തും ഒരു കുഞ്ഞിനെ പ്രതീക്ഷിക്കുന്നുവെന്ന് കേട്ട്, അവളെ സഹായിക്കാൻ മറിയം തിടുക്കത്തിൽ മലമ്പ്രദേശത്തേക്ക് യാത്രയായി. മറിയം അകത്തുചെന്ന് അഭിവാദനം ചെയ്തപ്പോൾ എലിസബത്തിന്റെ ഉദരത്തിലെ ശിശു സന്തോഷത്താൽ കുതിച്ചുചാടി; സ്ത്രീകളിൽ അനുഗൃഹീതയാണ് മറിയം എന്ന് എലിസബത്ത് ഉറക്കെ പറഞ്ഞു. മറിയത്തിന്റെ ഹൃദയം നിറഞ്ഞുകവിഞ്ഞു; അവൾ ഒരു സ്തുതിഗീതം പാടി: ദൈവം എളിയവരെ ഉയർത്തുന്നു, വിശക്കുന്നവരെ നന്മകൾ കൊണ്ട് നിറയ്ക്കുന്നു. മാസങ്ങൾക്കുശേഷം മറിയം വീണ്ടും യാത്രയായി; ഇത്തവണ യൗസേപ്പിനോടൊപ്പം ബേത്‌ലെഹേമിലേക്കുള്ള നീണ്ട വഴിയിലൂടെ. അവിടെ, വിശുദ്ധ രാത്രിയിൽ, അവൾ തന്റെ നവജാത ശിശുവിനെ പൊതിഞ്ഞ് പുൽത്തൊട്ടിയിൽ കിടത്തി; ഇവയെല്ലാം ഹൃദയത്തിൽ സൂക്ഷിച്ചു. ഇന്ന് തന്റെ മകനെ സ്വീകരിക്കാൻ ഒരുങ്ങി മറിയം നമ്മുടെ ഗ്രാമത്തിലെത്തുന്നു.",
      },
    },
  },
  {
    day: 25,
    en: {
      title: "Glory to God!",
      ref: "Luke 2:10-14",
      reflection: "Today a Saviour is born for us: Christ the Lord. The angels sing, and we sing with them.",
      task: "Kneel before the crib and thank Jesus for coming. Share your Christmas joy with someone who is alone.",
      prayer: "Glory to God in the highest, and on earth peace to people of good will.",
      verse: "An angel told the shepherds: Don't be afraid! I have joyful news for everyone. Today in David's town your Saviour has been born, Christ the Lord. Then a huge crowd of angels appeared, praising God and singing of glory in heaven and peace on earth.",
      massPrayer: "Baby Jesus, welcome! Thank you for coming to be with us. I love you.",
      story: {
        title: "Jesus Is Born!",
        body: "On that first Christmas night, in a quiet stable in Bethlehem, God's own Son was born as a tiny baby. Mary held him close, Joseph kept watch, and the animals breathed warm air into the cold night. The King of heaven had no palace, no soldiers and no golden cradle, only a manger filled with hay and the love of his family. Shepherds came running to see him, and later wise men came from far away. In Kerala at Christmas, many children carefully lay the figure of the Baby Jesus in the family crib, while everyone sings and the star glows outside. Then comes the cake, the sharing, and wishing everyone a happy Christmas! Today Baby Jesus comes to our village. The village is complete, and the waiting is over: Jesus is here!",
      },
    },
    ml: {
      title: "ദൈവത്തിന് മഹത്വം!",
      ref: "ലൂക്കാ 2:10-14",
      reflection: "ഇന്ന് നമുക്കായി ഒരു രക്ഷകൻ പിറന്നിരിക്കുന്നു: കർത്താവായ ക്രിസ്തു. മാലാഖമാർ പാടുന്നു; നമുക്കും അവരോടൊപ്പം പാടാം.",
      task: "പുൽക്കൂടിനു മുന്നിൽ മുട്ടുകുത്തി, വന്നതിന് ഈശോയോട് നന്ദി പറയുക. ഒറ്റയ്ക്കായിരിക്കുന്ന ഒരാളുമായി ക്രിസ്മസ് സന്തോഷം പങ്കുവയ്ക്കുക.",
      prayer: "അത്യുന്നതങ്ങളിൽ ദൈവത്തിന് മഹത്വം; ഭൂമിയിൽ സന്മനസ്സുള്ളവർക്ക് സമാധാനം.",
      verse: "ഒരു മാലാഖ ആട്ടിടയന്മാരോട് പറഞ്ഞു: ഭയപ്പെടേണ്ട! എല്ലാവർക്കുമുള്ള സന്തോഷവാർത്ത ഞാൻ കൊണ്ടുവരുന്നു. ഇന്ന് ദാവീദിന്റെ പട്ടണത്തിൽ നിങ്ങളുടെ രക്ഷകൻ പിറന്നിരിക്കുന്നു; കർത്താവായ ക്രിസ്തു. ഉടനെ മാലാഖമാരുടെ ഒരു വലിയ കൂട്ടം പ്രത്യക്ഷപ്പെട്ട്, സ്വർഗ്ഗത്തിലെ മഹത്വത്തെയും ഭൂമിയിലെ സമാധാനത്തെയും കുറിച്ച് പാടി ദൈവത്തെ സ്തുതിച്ചു.",
      massPrayer: "ഉണ്ണീശോയേ, സ്വാഗതം! ഞങ്ങളോടൊപ്പം ആയിരിക്കാൻ വന്നതിന് നന്ദി. ഞാൻ അങ്ങയെ സ്നേഹിക്കുന്നു.",
      story: {
        title: "ഈശോ പിറന്നു!",
        body: "ആദ്യത്തെ ക്രിസ്മസ് രാത്രിയിൽ, ബേത്‌ലെഹേമിലെ ശാന്തമായ ഒരു കാലിത്തൊഴുത്തിൽ, ദൈവത്തിന്റെ സ്വന്തം പുത്രൻ ഒരു കൊച്ചുശിശുവായി പിറന്നു. മറിയം അവനെ ചേർത്തുപിടിച്ചു; യൗസേപ്പ് കാവലിരുന്നു; തണുത്ത രാത്രിയിൽ മൃഗങ്ങൾ ചൂടുള്ള ശ്വാസം പകർന്നു. സ്വർഗ്ഗത്തിന്റെ രാജാവിന് കൊട്ടാരമോ പടയാളികളോ സ്വർണ്ണത്തൊട്ടിലോ ഉണ്ടായിരുന്നില്ല; വൈക്കോൽ നിറച്ച ഒരു പുൽത്തൊട്ടിയും കുടുംബത്തിന്റെ സ്നേഹവും മാത്രം. ആട്ടിടയന്മാർ അവനെ കാണാൻ ഓടിവന്നു; പിന്നീട് ദൂരെനിന്ന് ജ്ഞാനികളും വന്നു. കേരളത്തിൽ ക്രിസ്മസിന് പല കുട്ടികളും ഉണ്ണീശോയുടെ രൂപം ശ്രദ്ധയോടെ വീട്ടിലെ പുൽക്കൂട്ടിൽ കിടത്തുന്നു; എല്ലാവരും പാട്ടുപാടുമ്പോൾ പുറത്ത് നക്ഷത്രം തിളങ്ങുന്നു. പിന്നെ കേക്കും പങ്കുവയ്ക്കലും എല്ലാവർക്കും ക്രിസ്മസ് ആശംസകളും! ഇന്ന് ഉണ്ണീശോ നമ്മുടെ ഗ്രാമത്തിലെത്തുന്നു. നമ്മുടെ ഗ്രാമം പൂർണ്ണമായി; കാത്തിരിപ്പും അവസാനിച്ചു: ഈശോ ഇതാ ഇവിടെ!",
      },
    },
  },
];
