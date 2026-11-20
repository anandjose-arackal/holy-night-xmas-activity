// Bible quotes for the read step's fill-the-missing-word quiz: the Old Testament promises fulfilled at Christmas.
// Text: Douay-Rheims (public domain, Catholic). Psalm and 2 Samuel numbering follows modern Bibles (Douay numbers differ).
// DRAFT: check each quote against a printed Douay-Rheims before release.
// `blank` is the word the child fills in; it must appear in `text` exactly once.
// Days without an entry (and Malayalam, until a Malayalam text is added) quiz on the day's own verse instead.

export type QuizQuote = { ref: string; title: string; text: string; blank: string };

export const QUIZ: Partial<Record<number, QuizQuote>> = {
  5: { ref: "Numbers 24:17", title: "A star shall rise from Jacob", text: "A star shall rise out of Jacob and a sceptre shall spring up from Israel.", blank: "star" },
  6: { ref: "Deuteronomy 18:15", title: "A prophet like Moses", text: "The Lord thy God will raise up to thee a prophet of thy nation and of thy brethren like unto me: him thou shalt hear.", blank: "prophet" },
  7: { ref: "2 Samuel 7:16", title: "The everlasting throne of David", text: "And thy house shall be faithful, and thy kingdom for ever before thy face, and thy throne shall be firm for ever.", blank: "throne" },
  8: { ref: "Psalm 2:7", title: "The promised Son and King", text: "The Lord hath said to me: Thou art my son, this day have I begotten thee.", blank: "son" },
  9: { ref: "Psalm 72:10–11", title: "Kings bringing gifts", text: "The kings of the Arabians and of Saba shall bring gifts: and all kings of the earth shall adore him.", blank: "gifts" },
  10: { ref: "Psalm 89:3–4", title: "God's covenant with David", text: "I have made a covenant with my elect: I have sworn to David my servant: Thy seed will I settle for ever.", blank: "covenant" },
  11: { ref: "Isaiah 7:14", title: "The virgin shall conceive", text: "Behold a virgin shall conceive, and bear a son, and his name shall be called Emmanuel.", blank: "Emmanuel" },
  12: { ref: "Isaiah 9:2", title: "A great light in the darkness", text: "The people that walked in darkness, have seen a great light.", blank: "darkness" },
  13: { ref: "Isaiah 9:6", title: "A child is born — Prince of Peace", text: "For a child is born to us, and a son is given to us, and his name shall be called Wonderful, Counsellor, God the Mighty, the Prince of Peace.", blank: "Peace" },
  14: { ref: "Isaiah 11:1", title: "A shoot from the root of Jesse", text: "And there shall come forth a rod out of the root of Jesse, and a flower shall rise up out of his root.", blank: "flower" },
  15: { ref: "Isaiah 11:10", title: "Hope for all nations", text: "In that day the root of Jesse, who standeth for an ensign of the people, him the Gentiles shall beseech.", blank: "Gentiles" },
  16: { ref: "Isaiah 40:3", title: "Prepare the way of the Lord", text: "The voice of one crying in the desert: Prepare ye the way of the Lord, make straight in the wilderness the paths of our God.", blank: "desert" },
  17: { ref: "Isaiah 42:1", title: "The chosen servant of God", text: "Behold my servant, I will uphold him: my elect, my soul delighteth in him: I have given my spirit upon him.", blank: "servant" },
  18: { ref: "Isaiah 49:6", title: "Light to the nations", text: "I have given thee to be the light of the Gentiles, that thou mayst be my salvation even to the farthest part of the earth.", blank: "salvation" },
  19: { ref: "Isaiah 60:3", title: "Nations come to the light", text: "And the Gentiles shall walk in thy light, and kings in the brightness of thy rising.", blank: "brightness" },
  20: { ref: "Jeremiah 23:5", title: "The righteous King", text: "I will raise up to David a just branch: and a king shall reign, and shall be wise.", blank: "branch" },
  21: { ref: "Daniel 7:14", title: "The everlasting kingdom", text: "His power is an everlasting power that shall not be taken away: and his kingdom that shall not be destroyed.", blank: "kingdom" },
  22: { ref: "Micah 5:2", title: "The ruler born in Bethlehem", text: "And thou, Bethlehem Ephrata, art a little one among the thousands of Juda: out of thee shall he come forth unto me that is to be the ruler in Israel.", blank: "Bethlehem" },
  23: { ref: "Malachi 3:1", title: "The messenger prepares the way", text: "Behold I send my angel, and he shall prepare the way before my face.", blank: "angel" },
  24: { ref: "Luke 2:11", title: "The birth of Jesus Christ", text: "For, this day, is born to you a Saviour, who is Christ the Lord, in the city of David.", blank: "Saviour" },
};
