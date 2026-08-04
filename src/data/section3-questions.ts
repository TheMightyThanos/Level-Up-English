import { RawPassage } from './question-types';

// EPT Reading Platform - 50 Parallel Constructed Reading Items
// Five passages, multiple-choice (A/B/C/D), 55-minute limit.
// Taxonomy strictly mapped to expert-validated Parallel Form.

export const section3Passages: RawPassage[] = [
  {
    title: 'The Bronze Age',
    text: `The Bronze Age was a period of history which began in approximately
3300 B.C. and lasted until 1200 B.C. Its name was
derived from the bronze implements and weapons that archaeologists later unearthed.
This period was divided into the Early, Middle, and Late Bronze Ages. During the
first period (3300 to 2100 B.C.), the first plow and the use of bronze
for tools and ornaments were developed. As a result of expanding trade
networks, which emerged about 500 years into the Early Bronze Age, communities
were forced to construct fortified walls, adopt writing systems, and develop new
crafts.

During the Middle Bronze Age (2100 to 1550
B.C.), people made
coarse pottery and the first horse-drawn chariots, took horses into
battle, and developed the spoked wheel, which was used until the eighth century B.C.

The Late Bronze Age (1550 to 1200 B.C.) saw humankind
domesticating horses for cavalry,
being more
sedentary than in previous eras, establishing palace economies, and creating diplomatic codes.`,
    questions: [
      { id: 1, text: "Into how many periods was the Bronze Age divided?", options: ["2","3","4","5"], key: 1, skill: "Explicit Detail (Scanning)", explanation: "The passage directly states: \"This period was divided into the Early, Middle, and Late Bronze Ages\" — three named sub-periods in total. Option A (2), C (4), and D (5) are all unsupported by the text." },
      { id: 2, text: "The word <span class='text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md'>\"derived\"</span> is closest in meaning to", options: ["originated","destroyed","hallucinated","discussed"], key: 0, skill: "Vocabulary in Context", explanation: "The sentence reads: \"Its name was derived from the bronze implements and weapons...\" The name came from (originated from) bronze tools. B (destroyed), C (hallucinated), and D (discussed) all contradict the sense of a name coming from a source." },
      { id: 3, text: "Which of the following was developed earliest?", options: ["Spoked wheel","Plow","Horse-drawn chariot","Coarse pottery"], key: 1, skill: "Detail — Chronological Sequence", explanation: "The plow was developed during the Early Bronze Age (3300–2100 B.C.), which is the oldest period mentioned. The spoked wheel (A), horse-drawn chariot (C), and coarse pottery (D) all belong to the Middle Bronze Age (2100–1550 B.C.), making B the earliest development." },
      { id: 4, text: "Which of the following developments is NOT related to the conditions of expanding", options: ["Domesticating horses","Adopting writing systems","Constructing fortified walls","Developing new crafts"], key: 0, skill: "Negative Detail (NOT)", explanation: "The passage lists three consequences of expanding trade networks: constructing fortified walls (C), adopting writing systems (B), and developing new crafts (D). Domesticating horses for cavalry (A) is a Late Bronze Age development with no connection to trade networks in the text." },
      { id: 5, text: "The word <span class='text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md'>\"coarse\"</span> is closest in meaning to", options: ["extravagant","complex","vulgar","primitive"], key: 3, skill: "Vocabulary in Context", explanation: "\"Coarse pottery\" refers to rough, rudimentary ware. \"Primitive\" (D) best captures this sense of being basic and unrefined. A (extravagant) and B (complex) are opposites of coarse. C (vulgar) is related to rudeness, not to material texture or craft quality." },
      { id: 6, text: "The author states that the Bronze Age was so named because", options: ["it was very durable like bronze","the tools and weapons were made of bronze","bronze was the only metal known","the people lived in bronze fortresses"], key: 1, skill: "Explicit Detail — Cause/Reason", explanation: "The passage states explicitly: \"Its name was derived from the bronze implements and weapons that archaeologists later unearthed.\" Options A, C, and D introduce ideas (durability, exclusivity of metal, bronze buildings) that are not mentioned anywhere in the text." },
      { id: 7, text: "The word <span class='text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md'>\"sedentary\"</span> is closest in meaning to", options: ["settled","wandering","primitive","inquisitive"], key: 0, skill: "Vocabulary in Context", explanation: "\"Sedentary\" describes a lifestyle of staying in one place. \"Settled\" (A) is the closest synonym. B (wandering) is the antonym. C (primitive) and D (inquisitive) are completely unrelated to the concept of movement or residence." },
      { id: 8, text: "With what subject is the passage mainly concerned?", options: ["The Late Bronze Age","The Early Bronze Age","The Bronze Age","Trade Networks"], key: 2, skill: "Main Idea / Topic", explanation: "The passage surveys all three sub-periods — Early, Middle, and Late — making the Bronze Age as a whole (C) the main subject. A and B are too narrow (only one sub-period). D (Trade Networks) is a supporting detail introduced only within the Early Bronze Age section." },
      { id: 9, text: "Which of the following best describes the Middle Bronze Age?", options: ["People were innovative.","People stayed indoors all the time.","People were warriors.","People were crude."], key: 0, skill: "Implied Detail / Inference", explanation: "The Middle Bronze Age saw the invention of horse-drawn chariots, the spoked wheel, and coarse pottery — a cluster of new developments. This pattern of invention implies people were innovative (A). B is not supported by the text. C (warriors) is a distractor; military activity is mentioned but is not the defining trait. D (crude) mischaracterizes the era." },
      { id: 10, text: "The word <span class='text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md'>\"eras\"</span> is closest in meaning to", options: ["families","periods","herds","tools"], key: 1, skill: "Vocabulary in Context", explanation: "\"Eras\" means distinct stretches of historical time, synonymous with \"periods\" (B). A (families), C (herds), and D (tools) are all semantically unrelated to time measurement." },
    ],
  },
  {
    title: 'Flash Freezing in Seafood Processing',
    text: `Flash freezing is an energy-saving technique for the seafood processing industry. It has
received significant attention in recent years when increased
pressure for energy conservation has
accentuated the need for more efficient methods of preserving the
marine catch. Storing an entire catch on crushed ice requires a
considerable amount of refrigerated space, since water and
inedible viscera are cooled along with the fillet. It is also necessary
to space the boxes adequately in the chilled hold for better air
movement and prevention of bacterial contamination, thus adding to the
volume requirements for
vessel freezers.

Conventional handling of fish involves holding the whole
catch on ice for 24 to 48 hours before filleting. Chilling in
the traditional fashion is also associated with a loss of catch
weight ranging from 3 percent to 5 percent due to drip
loss from the muscle tissue.

Early freezing, or flash freezing, of fillets prerigor followed by glaze coating
has several potential advantages. By freezing only the edible flesh
prerigor, refrigeration space and costs are minimized, processing labor is
decreased, and storage yields increased. Because flash freezing often
results in the toughening of texture, a more recent approach, flash
freezing following enzymatic relaxation, has been used to reduce the
necessary onset of rigor mortis.

Some researchers have found
this method beneficial in maintaining tender fillets, while others have
found that the texture also becomes tough after enzymatic relaxation.`,
    questions: [
      { id: 11, text: "The word <span class='text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md'>\"accentuated\"</span> is closest in meaning to", options: ["de-emphasized","speeded up","caused","highlighted"], key: 3, skill: "Vocabulary in Context", explanation: "\"Accentuated\" means made more prominent or noticeable — essentially \"highlighted\" (D). A (de-emphasized) is the direct antonym. B (speeded up) confuses accentuated with accelerated. C (caused) is related but too strong; accentuated implies bringing attention to an existing need, not creating it from nothing." },
      { id: 12, text: "All of the following are mentioned as drawbacks of the conventional method of fish", options: ["Storage space requirements","Energy waste","Loss of catch weight","Toughening of texture"], key: 3, skill: "Negative Detail (EXCEPT)", explanation: "The passage attributes storage space issues (A) and energy waste (B) to the conventional method (whole-catch ice storage), and also mentions 3–5% catch-weight loss (C) during conventional chilling. Toughening of texture (D) is specifically stated as a drawback of flash freezing — not of the conventional method." },
      { id: 13, text: "The word <span class='text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md'>\"pressure\"</span> is nearest in meaning to", options: ["urgency","weight","flavor","cooking texture"], key: 0, skill: "Vocabulary in Context", explanation: "In this context, \"pressure\" is used figuratively to mean a compelling force or demand — i.e., \"urgency\" (A). B (weight) is a physical meaning of pressure that does not fit the sentence. C (flavor) and D (cooking texture) are entirely unrelated distractors." },
      { id: 14, text: "Flash freezing is becoming very popular because", options: ["it causes fillets to be very tender","it helps conserve energy and is less expensive than conventional methods","seafood tastes better when frozen with the viscera intact","it reduces the weight of the catch"], key: 1, skill: "Explicit Detail — Cause/Reason", explanation: "The passage calls flash freezing \"an energy-saving technique\" and states that by freezing only the edible flesh, \"refrigeration space and costs are minimized.\" A is incorrect — texture toughening is actually a problem with flash freezing. C is false (viscera are inedible, not frozen). D is a distractor — weight reduction is a drawback of conventional chilling, not an advantage of flash freezing." },
      { id: 15, text: "The phrase <span class='text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md'>\"vessel freezers\"</span> is nearest in meaning to", options: ["a refrigerator on a ship","a method of filleting fish","enzymatic stimulation of seafood","early freezing"], key: 0, skill: "Vocabulary in Context (compound noun)", explanation: "\"Vessel\" means ship, and \"vessel freezers\" are therefore refrigeration units aboard a ship (A). The passage discusses volume requirements for these units in the context of on-board storage. B, C, and D describe processes, not storage equipment." },
      { id: 16, text: "The phrase <span class='text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md'>\"early freezing\"</span> is closest in meaning to", options: ["glaze coating","flash freezing","ice chilling","enzymatic relaxation"], key: 1, skill: "Vocabulary in Context (synonym phrase)", explanation: "The passage explicitly equates the two terms: \"Early freezing, or flash freezing...\" — the comma and \"or\" signal direct synonymy. A (glaze coating), C (ice chilling), and D (enzymatic relaxation) are related processes mentioned in the same paragraph but are distinct from early/flash freezing." },
      { id: 17, text: "The toughening of texture during flash freezing has been combatted by", options: ["following flash freezing with enzymatic relaxation","tenderizing the fillets","using enzymatic relaxation before flash freezing","freezing only the edible flesh prerigor"], key: 2, skill: "Explicit Detail — Process", explanation: "The passage reads: \"a more recent approach, flash freezing following enzymatic relaxation, has been used to reduce the necessary onset of rigor mortis.\" This means enzymatic relaxation comes first, then flash freezing — making C correct. A reverses the order. B (tenderizing) is not mentioned. D (freezing only edible flesh) is a separate advantage, not a solution to texture toughening." },
      { id: 18, text: "The word <span class='text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md'>\"marine\"</span> is nearest in meaning to", options: ["cold","frozen","sea","freshwater"], key: 2, skill: "Vocabulary in Context", explanation: "\"Marine\" is an adjective meaning \"of or relating to the sea.\" \"Marine catch\" therefore means sea catch — fish harvested from the ocean. A (cold) and B (frozen) describe temperature, not origin. D (freshwater) is the antonym in terms of water type." },
      { id: 19, text: "The word <span class='text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md'>\"this\"</span> refers to", options: ["flash freezing","flash freezing following enzymatic relaxation","rigor mortis","freezing edible flesh prerigor"], key: 1, skill: "Reference (pronoun)", explanation: "The pronoun \"this method\" in the final paragraph refers back to the most recently introduced technique in the preceding sentence: \"flash freezing following enzymatic relaxation.\" Pronoun reference rules point to the closest preceding noun phrase. A (flash freezing alone) and D ignore the crucial enzymatic relaxation component. C (rigor mortis) is a biological process, not a method." },
      { id: 20, text: "The word <span class='text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md'>\"catch\"</span> is closest in meaning to", options: ["processed fillet","harvest","freezer","viscera"], key: 1, skill: "Vocabulary in Context", explanation: "In fishing terminology, \"catch\" refers to the total quantity of fish taken from the water — equivalent to \"harvest\" (B). A (processed fillet) implies a finished product; the catch is unprocessed. C (freezer) is equipment. D (viscera) are the internal organs discarded from the catch." },
      { id: 21, text: "The word <span class='text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md'>\"considerable\"</span> is closest in meaning to", options: ["frigid","kind","lesser","substantial"], key: 3, skill: "Vocabulary in Context", explanation: "\"Considerable\" means notably large in amount. \"Substantial\" (D) is the closest synonym — both mean large and significant. A (frigid) means very cold. B (kind) refers to temperament. C (lesser) is the antonym — the passage indicates that a large, not small, amount of space is required." },
      { id: 22, text: "One reason it is recommended to fillet fish before refrigerating is that", options: ["it makes the fillets more tender","the viscera can be used for other purposes","it increases chilling time","it saves cooling space by not refrigerating parts that will be discarded"], key: 3, skill: "Explicit Detail — Reason", explanation: "The passage explains that conventional storage cools \"water and inedible viscera...along with the fillet,\" requiring extra space. Filleting first removes the inedible parts, so you only refrigerate what will be eaten — saving cooling space (D). A and B introduce ideas not found in the text. C is the opposite of the intended benefit." },
      { id: 23, text: "The word <span class='text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md'>\"inedible\"</span> is nearest in meaning to", options: ["unsaturated","uneatable","unhealthy","chillable"], key: 1, skill: "Vocabulary in Context", explanation: "\"Inedible\" literally means not fit to be eaten — the direct equivalent of \"uneatable\" (B). A (unsaturated) is a chemistry/nutrition term. C (unhealthy) implies edibility but with health risks. D (chillable) is a made-up distractor with no standard meaning." },
    ],
  },
  {
    title: 'The Suez Canal',
    text: `In 1869, after some ten years of problems with funding, labor
shortages, and politics, the Suez Canal was officially opened, finally
linking the Mediterranean and Red Seas by allowing ships to pass
through the one-hundred-mile canal zone instead of traveling some four thousand
miles around the Cape of Good Hope. It takes a ship approximately
fifteen hours to complete the trip through the canal and costs
an average of three hundred thousand dollars, one tenth of what it
would cost an average ship to round the Cape. More than seventeen
thousand ships pass through its
channels each year.

The French initiated the project but sold their rights to the British, who
actually consolidated the administration of the project. The latter will
control it until the middle of the twentieth century when Egypt takes over its duties.`,
    questions: [
      { id: 24, text: "Who currently controls the Suez Canal?", options: ["France","Britain","Egypt","The Cape Authority"], key: 1, skill: "Explicit Detail (Scanning)", explanation: "Within the passage's narrative timeframe (written before Egypt's mid-twentieth century takeover), the text reads: \"The latter will control it until the middle of the twentieth century when Egypt takes over its duties.\" \"The latter\" refers to the British. From the passage's perspective, Britain (B) is the current controller. A (France) sold its rights. C (Egypt) is stated as a future development. D is invented." },
      { id: 25, text: "The word <span class='text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md'>\"channels\"</span> is closest in meaning to", options: ["securities","latches","lakes","canal passageways"], key: 3, skill: "Vocabulary in Context", explanation: "\"Channels\" in a canal context refers to the navigable waterways through which ships travel — best captured by \"canal passageways\" (D). A (securities) is a financial term. B (latches) are fastening devices. C (lakes) are bodies of standing water, not directional passages." },
      { id: 26, text: "On the average, how much would it cost a ship to travel around the Cape of Good", options: ["$30,000","$300,000","$3,000,000","$30,000,000"], key: 2, skill: "Detail with Computation", explanation: "The passage states the canal costs \"three hundred thousand dollars, one tenth of what it would cost an average ship to round the Cape.\" Therefore: Cape cost = $300,000 × 10 = $3,000,000 (C). B ($300,000) is the canal cost, not the Cape cost. A and D result from misapplying the ratio." },
      { id: 27, text: "In what year was construction begun on the canal?", options: ["1859","1869","1956","1999"], key: 0, skill: "Detail with Computation (date)", explanation: "The passage says the canal was \"officially opened\" in 1869 \"after some ten years of problems.\" Subtracting ten years: 1869 − 10 = 1859 (A). B (1869) is the opening year, not the start of construction. C (1956) is historically the year of the Suez Crisis. D (1999) is entirely irrelevant." },
      { id: 28, text: "It can be inferred from this passage that", options: ["the canal is a costly project which should be reevaluated","despite all the problems involved, the project is beneficial","many captains prefer to sail around the Cape because it is less expensive","problems have made it necessary for three governments to control the canal over the years"], key: 1, skill: "Inference / Author's View", explanation: "The passage acknowledges problems (funding, labor, politics) but also highlights massive benefits: shorter travel, cost savings of 90%, and 17,000+ annual ship transits. These together support the inference that the project is beneficial despite its challenges (B). A and C directly contradict the passage's data. D misinterprets the governance transfer — it was political succession, not a problem requiring three controllers." },
      { id: 29, text: "The word <span class='text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md'>\"linking\"</span> is closest in meaning to", options: ["controlling","dispersing","detaching","joining"], key: 3, skill: "Vocabulary in Context", explanation: "\"Linking\" means connecting or joining two things. Here it describes the canal connecting the Mediterranean and Red Seas — synonymous with \"joining\" (D). A (controlling) implies authority, not connection. B (dispersing) means spreading apart. C (detaching) is the antonym." },
      { id: 30, text: "The word <span class='text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md'>\"initiated\"</span> is nearest in meaning to", options: ["purchased","launched","forfeited","forced"], key: 1, skill: "Vocabulary in Context", explanation: "\"Initiated\" means started or set in motion — synonymous with \"launched\" (B). A (purchased) confuses initiated with what the French eventually did (sold). C (forfeited) means to give up under compulsion. D (forced) implies coercion, which is not implied for the French's role in starting the project." },
      { id: 31, text: "All of the following are true EXCEPT", options: ["it costs so much to pass through the canal because very few ships use it","the British received the rights to the canal from the French","a ship can pass through the canal in only fifteen hours","passing through the canal saves thousands of miles of travel around the Cape"], key: 0, skill: "Negative Detail (EXCEPT)", explanation: "A is FALSE on two counts: (1) the canal is affordable — it costs only one-tenth of the Cape route; (2) over 17,000 ships use it per year — heavy traffic, not light. B is true (the French sold their rights to the British). C is true (fifteen hours transit). D is true (the Cape route is four thousand miles versus the canal's one hundred miles)." },
    ],
  },
  {
    title: 'The Pythian Games',
    text: `In 586 B.C., the first Pythian Games were held at the foot of
Mount Parnassus to honor the Greeks' god of music and prophecy,
Apollo. The fertile valleys for outdoor activities, the need for
cultural prestige, and their religious lifestyle caused the Greeks to create
competitive contests. Only the priests and aristocrats
could participate at first, but later the games were open to all free
Greek citizens who had paid tribute to the temple. The Greeks
emphasized artistic skill and physical excellence in their education of youth.
Therefore, contests in singing, lyre playing, choral dancing, foot racing,
wrestling, and chariot racing were held in individual cities,
and the winners competed every four years at Delphi. Winners were
greatly honored by having laurel wreaths placed on their heads
and having hymns composed about their
deeds.

Originally these contests were held as games of devotion, and any conflicts in progress were
halted to allow the games to take place. They also helped to strengthen
bonds among competitors and the different cities represented.

The Greeks attached so much importance to the games that they calculated time in
four-year cycles called "Pythiads," dating from 586 B.C. The contests coincided with
religious festivities and constituted an all-out effort on the part of the participants
to please the gods. Any who disobeyed the rules were dismissed and seriously
punished. These athletes brought shame not only to themselves, but also to
the cities they represented.`,
    questions: [
      { id: 32, text: "Which of the following is NOT true?", options: ["Winners placed laurel wreaths on their own heads.","The games were held in Greece every four years.","Conflicts were interrupted to participate in the games.","Hymns glorified the winners in song."], key: 0, skill: "Negative Detail (NOT)", explanation: "A is NOT true. The passage uses the passive construction: \"having laurel wreaths placed on their heads\" — indicating others honored the winners by placing the wreaths, not the winners themselves. B is true (four-year Pythiad cycles). C is true (\"any conflicts in progress were halted\"). D is true (\"having hymns composed about their deeds\")." },
      { id: 33, text: "The word <span class='text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md'>\"aristocrats\"</span> is closest in meaning to", options: ["nobility","brave warriors","intellectuals","muscular men"], key: 0, skill: "Vocabulary in Context", explanation: "\"Aristocrats\" refers to members of the highest social class — the hereditary ruling elite, synonymous with \"nobility\" (A). B (brave warriors) describes soldiers by courage, not class. C (intellectuals) describes thinkers. D (muscular men) describes physical build. Only A captures the class-based meaning." },
      { id: 34, text: "Why were the Pythian Games held?", options: ["To stop conflicts","To honor Apollo","To crown the best athletes","To compose hymns about the athletes"], key: 1, skill: "Explicit Detail — Purpose", explanation: "The opening sentence is explicit: \"the first Pythian Games were held...to honor the Greeks' god of music and prophecy, Apollo.\" A (stopping conflicts) was a by-product, not the purpose. C (crowning athletes) and D (composing hymns) were practices within the games, not their primary reason." },
      { id: 35, text: "Approximately how many years ago did these games originate?", options: ["800 years","1,200 years","2,000 years","2,600 years"], key: 3, skill: "Detail with Computation", explanation: "The games began in 586 B.C. Adding 586 + 2026 (current era) gives 2,612 years — closest to \"2,600 years\" (D). A (800), B (1,200), and C (2,000) all underestimate the span by centuries." },
      { id: 36, text: "What conclusion can we draw about the ancient Greeks?", options: ["They were pacifists.","They believed artistic and athletic events were important.","They were very simple.","They couldn't count, so they used \"Pythiads\" for dates."], key: 1, skill: "Inference / Conclusion", explanation: "The passage describes contests in singing, lyre playing, dancing, foot racing, wrestling, and chariot racing — and states the Greeks \"emphasized artistic skill and physical excellence in their education of youth.\" This strongly supports conclusion B. A (pacifists) is contradicted by mentions of conflicts. C (simple) is unsupported. D misrepresents the reason for Pythiads — they were used for timekeeping, not because Greeks could not count." },
      { id: 37, text: "What is the main idea of this passage?", options: ["Artistic and physical excellence was an integral part of the lives of ancient Greeks.","The Greeks severely punished those who did not participate in artistic programs.","The Greeks had always encouraged everyone to participate in the games.","The Greeks had the games coincide with religious festivities so that they could go back to conflict when the games were over."], key: 0, skill: "Main Idea", explanation: "The passage covers origins, eligibility, competitions (both artistic and athletic), honors, religious ties, and sanctions — all united by the theme of how arts and athletics defined Greek cultural life. A encapsulates this. B distorts the punishment detail. C is inaccurate (initially restricted to priests and aristocrats). D is a misreading — conflicts were halted for the games, not vice versa." },
      { id: 38, text: "The word <span class='text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md'>\"deeds\"</span> is closest in meaning to", options: ["accomplishments","ancestors","documents","property"], key: 0, skill: "Vocabulary in Context", explanation: "\"Deeds\" in this context means notable actions or achievements. \"Hymns composed about their deeds\" = hymns about their accomplishments (A). B (ancestors) refers to forebears. C and D are legal meanings of \"deed\" (legal document, property transfer) that are entirely out of context here." },
      { id: 39, text: "Which of the following was ultimately required of all athletes competing in the Pythian", options: ["They must have completed priestly service.","They had to attend special training sessions.","They had to be free Greek citizens who had paid tribute to the temple.","They had to be of aristocratic descent."], key: 2, skill: "Explicit Detail — Eligibility", explanation: "The passage states: \"later the games were open to all free Greek citizens who had paid tribute to the temple.\" This is the final, broadened eligibility requirement. A and D were early restrictions that were later removed. B (training sessions) is never mentioned in the passage." },
      { id: 40, text: "The word <span class='text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md'>\"halted\"</span> means most nearly the same as", options: ["encouraged","started","curtailed","fixed"], key: 2, skill: "Vocabulary in Context", explanation: "\"Halted\" means brought to a stop. \"Curtailed\" (C) means reduced or stopped, making it the closest option. A (encouraged) is the opposite. B (started) is the antonym. D (fixed) means repaired, which is unrelated. Among the choices, C best approximates \"stopped\" within the given options." },
      { id: 41, text: "What is a \"Pythiad\"?", options: ["The time it took to finish the games","The time between games","The time it took to finish a conflict","The time it took the athletes to train"], key: 1, skill: "Vocabulary in Context (concept)", explanation: "The passage states: \"they calculated time in four-year cycles called 'Pythiads.'\" Since the games were held every four years, a Pythiad represents the four-year interval between one set of games and the next (B). A confuses the Pythiad with the duration of the games themselves. C and D introduce time frames not found in the passage." },
    ],
  },
  {
    title: 'Hershey, Pennsylvania',
    text: `Hershey, Pennsylvania, owes a great deal of its growth and prosperity to
an American chocolate manufacturer named Milton Snavely Hershey. When the
financial Panic broke out in 1893, he was forced to
abandon his caramel venture, and he relocated his ambitions to central
Pennsylvania. Ten years later, supply problems in Lancaster caused him to
seek a better location along the dairy belt of the state. He bought
a forty-acre tract of farmland and made plans to set up his chocolate factory on the
site. This original sixteen-block stretch of land later
expanded to one thousand acres near Derry Township. This
newly developed area was called Hershey in his honor.
German, Italian, and Irish immigrants
flocked to the area as the demand for workers in the chocolate factory increased.
One quarter of the town's twelve thousand residents enjoyed the high-paying jobs there.
At the end of the 1910s, Samuel Hinkle, a chemist and product innovator, organized
a research division from Hershey and managed to get considerable support for his work.
Wartime ration teams were stationed there during World War I in 1917.
Much of the prosperity of this region is due to Hershey's chocolate factory
established more than one hundred years ago.`,
    questions: [
      { id: 42, text: "Where is Hershey located?", options: ["Lancaster County","New York","Central Pennsylvania","Derry, Ireland"], key: 2, skill: "Explicit Detail (Scanning)", explanation: "The passage states Hershey \"relocated his ambitions to central Pennsylvania\" and the town grew from land he purchased there. A (Lancaster County) is mentioned as a previous location with supply problems — not where Hershey is. B and D are not mentioned as the town's location." },
      { id: 43, text: "The word <span class='text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md'>\"abandon\"</span> means most nearly the same as", options: ["give up","return to","fight","disembody"], key: 0, skill: "Vocabulary in Context", explanation: "\"Abandon\" means to leave behind permanently or give up entirely. \"Give up\" (A) is the direct equivalent. B (return to) is the antonym. C (fight) and D (disembody) are unrelated to the act of forsaking a venture." },
      { id: 44, text: "The word <span class='text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md'>\"seek\"</span> is closest in meaning to", options: ["purchase","pursue","elude","develop"], key: 1, skill: "Vocabulary in Context", explanation: "\"Seek\" means to look for or try to obtain. \"Pursue\" (B) captures this active search — both words imply moving toward a goal. A (purchase) implies the act was completed and paid for, not just searched for. C (elude) means to avoid or escape. D (develop) means to build or improve." },
      { id: 45, text: "Why will people probably continue to remember Hershey's name?", options: ["He suffered a great deal.","An area was named in his honor.","He was an American revolutionary.","He was forced to abandon his early business."], key: 1, skill: "Inference", explanation: "The passage states: \"This newly developed area was called Hershey in his honor.\" A town bearing his name ensures lasting recognition (B). A and D describe hardships, not reasons for lasting fame. C (revolutionary) is not mentioned anywhere in the passage." },
      { id: 46, text: "The word <span class='text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md'>\"flocked\"</span> is closest in meaning to", options: ["came in large numbers","escaped hurriedly","increased rapidly","prospered greatly"], key: 0, skill: "Vocabulary in Context (idiom)", explanation: "\"Flocked\" means to gather or move in a crowd. \"Came in large numbers\" (A) is the most accurate paraphrase. B (escaped hurriedly) implies fleeing, the opposite movement. C (increased rapidly) describes growth of a quantity, not the movement of people. D (prospered greatly) describes economic wellbeing, not migration." },
      { id: 47, text: "In the early years, how many residents of Hershey worked in the chocolate factory?", options: ["3,000","6,000","9,000","12,000"], key: 0, skill: "Detail with Computation", explanation: "The passage states \"one quarter of the town's twelve thousand residents enjoyed the high-paying jobs there.\" One quarter of 12,000 = 3,000 (A). B (6,000) would be one-half. C (9,000) would be three-quarters. D (12,000) is the total population, not just the factory workers." },
      { id: 48, text: "What is the best title for this passage?", options: ["World War I and Central Pennsylvania","German Immigrants and the Chocolate Industry","Hershey's Contribution to Developing Part of the Central Pennsylvania Area","The Process of Chocolate Manufacturing"], key: 2, skill: "Main Idea / Best Title", explanation: "The passage closes with: \"Much of the prosperity of this region is due to Hershey's chocolate factory established more than one hundred years ago.\" This concluding sentence encapsulates the overarching theme of the entire text, which traces how Milton Hershey's industrial and biographical journey led to the region's ongoing development and prosperity (C). Options A and B are too narrow, and D misrepresents the biographical focus." },
      { id: 49, text: "The word <span class='text-violet-600 font-bold bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 px-1.5 py-0.5 rounded-md'>\"site\"</span> is closest in meaning to", options: ["location","view","vision","indebtedness"], key: 0, skill: "Vocabulary in Context", explanation: "\"Site\" means a specific physical place or spot. \"He made plans to set up his chocolate factory on the site\" means on the location (A) of the purchased farmland. B (view) relates to sightlines or opinions. C (vision) means a mental image or goal. D (indebtedness) is a financial term with no connection to place." },
      { id: 50, text: "Who was Samuel Hinkle?", options: ["A good friend of Hershey","One of the wartime ration officers","A chemist who organized a research division","A worker in the chocolate factory"], key: 2, skill: "Explicit Detail (Identity)", explanation: "The passage explicitly identifies him: \"Samuel Hinkle, a chemist and product innovator, organized a research division from Hershey.\" C matches this description exactly. A (friend), B (ration officer), and D (factory worker) are not supported by any statement in the text." },
    ],
  },
];
