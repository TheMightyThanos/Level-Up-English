import { RawQuestion } from './question-types';

export const section2Questions: RawQuestion[] = [
  // PART A (Structure - Fill in the blank) - Questions 1-15
  {
    id: 1,
    text: "After the funeral, the residents of the apartment building ______",
    options: [
      "sent faithfully flowers all weeks to the cemetery",
      "sent to the cemetery each week flowers faithfully",
      "sent flowers faithfully to the cemetery each week",
      "sent each week faithfully to the cemetery flowers"
    ],
    key: 2,
    explanation: 'Urutan kata yang benar adalah Subjek + Kata Kerja + Objek + Keterangan Cara (Adverb of Manner) + Keterangan Tempat + Keterangan Waktu ("sent flowers faithfully to the cemetery each week").'
  },
  {
    id: 2,
    text: "Because the first pair of pants did not fit properly, he asked for ______",
    options: ["another pants", "others pants", "the others ones", "another pair"],
    key: 3,
    explanation: 'Kata "another" harus diikuti oleh kata benda tunggal. "Pair" adalah bentuk tunggal yang tepat untuk merujuk pada sepasang celana.'
  },
  {
    id: 3,
    text: "The committee has met and ______",
    options: [
      "they have reached a decision",
      "it has formulated themselves some opinions",
      "its decision was reached at",
      "it has reached a decision"
    ],
    key: 3,
    explanation: 'Kata benda kolektif "Committee" dianggap tunggal jika bertindak sebagai satu kesatuan, sehingga kata ganti yang tepat adalah "it" dan kata kerja "has".'
  },
  {
    id: 4,
    text: "Alfred Adams has not ______",
    options: [
      "lived lonelynessly in times previous",
      "never before lived sole",
      "ever lived alone before",
      "before lived without the company of his friends"
    ],
    key: 2,
    explanation: 'Karena kalimat sudah mengandung "not", maka kita menggunakan "ever" (bukan "never") untuk menghindari pemborosan kata negatif (double negative).'
  },
  {
    id: 5,
    text: "John's score on the test is the highest in the class; ______",
    options: [
      "he should study last night",
      "he should have studied last night",
      "he must have studied last night",
      "he must had to study last night"
    ],
    key: 2,
    explanation: 'Modals "must have + V3" digunakan untuk membuat kesimpulan logis tentang aktivitas yang terjadi di masa lalu.'
  },
  {
    id: 6,
    text: "Henry will not be able to attend the meeting tonight because ______",
    options: [
      "he must to teach a class",
      "he will be teaching a class",
      "of he will teach a class",
      "he will have teaching a class"
    ],
    key: 1,
    explanation: 'Kalimat ini menggunakan Future Continuous Tense ("will be teaching") untuk menunjukkan aksi yang akan sedang berlangsung di masa depan.'
  },
  {
    id: 7,
    text: "Having been served lunch, ______",
    options: [
      "the problem was discussed by the members of the committee",
      "the committee members discussed the problem",
      "it was discussed by the committee members the problem",
      "a discussion of the problem was made by the members of the committee"
    ],
    key: 1,
    explanation: 'Dangling Participle. Subjek setelah tanda koma haruslah pihak yang "disajikan makan siang", yaitu "the committee members".'
  },
  {
    id: 8,
    text: "Florida has not yet ratified the amendment, and ______",
    options: [
      "several other states hasn't either",
      "neither has some of the others states",
      "some other states also have not either",
      "neither have several other states"
    ],
    key: 3,
    explanation: 'Untuk menyatakan kesetujuan negatif (negative agreement), polanya adalah "neither + auxiliary + subject" ("neither have several other states").'
  },
  {
    id: 9,
    text: "The chairman requested that ______",
    options: [
      "the members studied more carefully the problem",
      "the problem was more carefulnessly studied",
      "with more carefulness the problem could be studied",
      "the members study the problem more carefully"
    ],
    key: 3,
    explanation: 'Subjunctive Mood. Setelah kata kerja permintaan seperti "requested that", kata kerja selanjutnya harus dalam bentuk dasar (bare infinitive) tanpa "s/es" atau "ed" ("members study").'
  },
  {
    id: 10,
    text: "California relies heavily on income from fruit crops, and ______",
    options: ["Florida also", "Florida too", "Florida is as well", "so does Florida"],
    key: 3,
    explanation: 'Positive Agreement. Pola "so + auxiliary + subject" ("so does Florida") digunakan untuk menyatakan kesetujuan terhadap kalimat positif.'
  },
  {
    id: 11,
    text: "The professor said that ______",
    options: [
      "the students can turn over their reports on the Monday",
      "the reports on Monday could be received from the students by him",
      "the students could hand in their reports on Monday",
      "the students will on Monday the reports turn in"
    ],
    key: 2,
    explanation: 'Dalam reported speech, urutan kata kembali normal (tidak inversion).'
  },
  {
    id: 12,
    text: "This year will be difficult for this organization because ______",
    options: [
      "they have less money and volunteers than they had last year",
      "it has less money and fewer volunteers than it had last year",
      "the last year it did not have as few and little volunteers and money",
      "there are fewer money and volunteers that in the last year there were"
    ],
    key: 1,
    explanation: 'Less untuk uncountable (money), fewer untuk countable (volunteers).'
  },
  {
    id: 13,
    text: "The teachers have had some problems deciding ______",
    options: [
      "when to the students they shall return the final papers",
      "when are they going to return to the students the final papers",
      "when they should return the final papers to the students",
      "the time when the final papers they should return for the students"
    ],
    key: 2,
    explanation: 'Ini adalah noun clause (indirect question), jadi tidak memakai inversion.'
  },
  {
    id: 14,
    text: "She wanted to serve some coffee to her guests; however, ______",
    options: [
      "she hadn't many sugar",
      "there was not a great amount of the sugar",
      "she did not have much sugar",
      "she was lacking in amount of the sugar"
    ],
    key: 2,
    explanation: 'Sugar adalah uncountable, sehingga harus memakai much, bukan many.'
  },
  {
    id: 15,
    text: "There has not been a great response to the sale, ______",
    options: ["does there", "hasn't there", "hasn't it", "has there"],
    key: 3,
    explanation: 'Ini tag question. Pernyataan negatif → tag positif, dan subjeknya there.'
  },
  // PART B (Written Expression - Error Identification) - Questions 16-40
  {
    id: 16,
    text: 'The <u>main</u> office of the factory can be <u>found</u> <u>in Maple Street</u> in <u>New York City</u>.',
    options: ["main", "found", "in Maple Street", "New York City"],
    key: 2,
    explanation: 'Nama jalan memakai on, bukan in.'
  },
  {
    id: 17,
    text: 'Because there are <u>less</u> members present tonight <u>than</u> there <u>were</u> last night, we must wait until the next meeting <u>to vote</u>.',
    options: ["less", "than", "were", "to vote"],
    key: 0,
    explanation: 'Members countable → harus fewer, bukan less.'
  },
  {
    id: 18,
    text: 'David is particularly <u>fond of</u> cooking, and he <u>often cooks</u> <u>really</u> <u>delicious</u> meals.',
    options: ["fond of", "often cooks", "really", "delicious"],
    key: 3,
    explanation: 'Kesalahan modifier/word form. Posisi/pemakaian really tidak tepat dalam struktur kalimat.'
  },
  {
    id: 19,
    text: 'The progress made in space travel <u>for</u> <u>the early 1960s</u> <u>is</u> <u>remarkable</u>.',
    options: ["for", "is", "remarkable", "the early 1960s"],
    key: 3,
    explanation: 'Kesalahan struktur/verb form. Bagian D tidak sesuai dengan pola kalimat waktu dan membuat struktur tidak efektif.'
  },
  {
    id: 20,
    text: 'Sandra has <u>not rarely</u> missed <u>a play</u> or concert <u>since</u> she was seventeen years <u>old</u>.',
    options: ["not rarely", "a play", "since", "old"],
    key: 0,
    explanation: 'Double negative. Harusnya has rarely missed.'
  },
  {
    id: 21,
    text: 'The <u>governor</u> has not decided <u>how to deal</u> with the new <u>problems</u> <u>already</u>.',
    options: ["governor", "how to deal", "problems", "already"],
    key: 3,
    explanation: 'Adverb placement. Already salah posisi dalam kalimat.'
  },
  {
    id: 22,
    text: '<u>There was</u> <u>a</u> very interesting news <u>on the</u> radio this morning <u>about</u> the earthquake in Italy.',
    options: ["There was", "a", "on the", "about"],
    key: 1,
    explanation: 'News adalah uncountable noun, tidak boleh pakai a.'
  },
  {
    id: 23,
    text: 'The professor <u>had already given</u> the homework assignment when he <u>had remembered</u> that <u>Monday</u> <u>was</u> a holiday.',
    options: ["had already given", "had remembered", "Monday", "was"],
    key: 1,
    explanation: 'Tense consistency. Tidak perlu past perfect kedua → cukup remembered.'
  },
  {
    id: 24,
    text: 'Having been beaten <u>by</u> the police for striking an officer, the man <u>will cry out</u> <u>in pain</u>.',
    options: ["by", "officer", "will cry out", "in pain"],
    key: 3,
    explanation: 'Dangling/reduced clause + tense. Kejadian sudah terjadi → seharusnya past (cried out).'
  },
  {
    id: 25,
    text: 'This table is not sturdy <u>enough</u> to <u>support</u> a television, and that one probably <u>isn\'t</u> <u>neither</u>.',
    options: ["enough", "isn't", "neither", "support"],
    key: 3,
    explanation: 'Kalimat utama sudah negatif → harus pakai either, bukan neither.'
  },
  {
    id: 26,
    text: 'The bridge was <u>hitting</u> <u>by</u> a large ship during a sudden storm <u>last</u> <u>week</u>.',
    options: ["hitting", "by", "last", "week"],
    key: 0,
    explanation: 'Passive voice. Harusnya was hit by.'
  },
  {
    id: 27,
    text: 'The company representative <u>sold</u> <u>to the manager</u> a <u>sewing machine</u> for forty <u>dollars</u>.',
    options: ["sold", "to the manager", "sewing machine", "dollars"],
    key: 1,
    explanation: 'Pola benar: sell someone something, bukan sell to someone something.'
  },
  {
    id: 28,
    text: 'The taxi driver told the man to <u>don\'t allow</u> his disobedient son to <u>hang</u> <u>out</u> the <u>window</u>.',
    options: ["don't allow", "hang", "out", "window"],
    key: 2,
    explanation: 'Verb pattern. Setelah tell someone not to… bagian ini menjadi tidak tepat dalam konstruksi kalimat.'
  },
  {
    id: 29,
    text: 'These televisions are <u>quite</u> popular in Europe, but <u>those ones</u> <u>are</u> <u>not</u>.',
    options: ["quite", "those ones", "are", "not"],
    key: 2,
    explanation: 'Redundant pronoun. Cukup those.'
  },
  {
    id: 30,
    text: 'Harvey <u>seldom</u> pays his bills <u>on time</u>, and <u>his</u> brother does <u>too</u>.',
    options: ["seldom", "on time", "his", "too"],
    key: 3,
    explanation: 'Pernyataan bernuansa negatif (seldom) → harus either, bukan too.'
  },
  {
    id: 31,
    text: 'The price of crude oil <u>used to</u> be a great <u>deal</u> <u>lower</u> than now, <u>wasn\'t it</u>?',
    options: ["used to", "deal", "lower", "wasn't it"],
    key: 3,
    explanation: "Waktu now → present. Tag question harus isn't it."
  },
  {
    id: 32,
    text: 'When <u>the</u> university <u>formulates</u> new regulations, <u>it</u> must relay its decision to the students and <u>faculty</u>.',
    options: ["the", "formulates", "it", "faculty"],
    key: 0,
    explanation: 'Verb choice/form. Tidak sesuai dengan struktur institusional formal yang tepat dalam konteks ini.'
  },
  {
    id: 33,
    text: 'Jim was <u>upset</u> last night <u>because</u> he had to do <u>too</u> <u>many homeworks</u>.',
    options: ["upset", "because", "too", "many homeworks"],
    key: 3,
    explanation: 'Homework uncountable → too much homework.'
  },
  {
    id: 34,
    text: 'There <u>is</u> some scissors in the desk <u>drawer</u> in the bedroom <u>if</u> you need <u>them</u>.',
    options: ["is", "drawer", "if", "them"],
    key: 0,
    explanation: 'Benda berpasangan → a pair of scissors.'
  },
  {
    id: 35,
    text: 'The Board of Realtors <u>doesn\'t</u> have any <u>informations</u> about the <u>increase</u> in rent for this <u>area</u>.',
    options: ["doesn't", "informations", "increase", "area"],
    key: 0,
    explanation: 'Information uncountable → tidak boleh jamak.'
  },
  {
    id: 36,
    text: 'George is not <u>enough intelligent</u> to <u>pass</u> this economics <u>class</u> without <u>help</u>.',
    options: ["enough intelligent", "pass", "class", "help"],
    key: 0,
    explanation: 'Posisi enough salah → not intelligent enough.'
  },
  {
    id: 37,
    text: 'There were so <u>much</u> <u>people</u> trying to leave the burning building <u>that</u> the police had a great deal of trouble <u>controlling</u> them.',
    options: ["much", "people", "that", "controlling"],
    key: 1,
    explanation: 'People countable → so many people.'
  },
  {
    id: 38,
    text: 'John <u>lived</u> in New York <u>since</u> 1960 to 1975, but he is now <u>living</u> <u>in</u> Detroit.',
    options: ["lived", "since", "living", "in"],
    key: 1,
    explanation: 'Harusnya from 1960 to 1975, bukan since…to….karena since dipakai untuk konteks yang berlanjut sampai sekarang.'
  },
  {
    id: 39,
    text: 'The fire began <u>in</u> the <u>fifth</u> floor of the hotel, but it soon <u>spread</u> to adjacent <u>floors</u>.',
    options: ["in", "fifth", "spread", "floors"],
    key: 0,
    explanation: 'Untuk lantai → on the fifth floor.'
  },
  {
    id: 40,
    text: 'Mrs. Anderson bought <u>last week</u> a new sports car; <u>however</u>, she has <u>yet</u> to learn how to <u>operate</u> the manual gearshift.',
    options: ["last week", "however", "yet", "operate"],
    key: 0,
    explanation: 'Urutan benar: verb + object + time adverb.'
  }
];
