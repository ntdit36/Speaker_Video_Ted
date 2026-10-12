// Comprehensive IPA Pronunciation & Phonetics Service for Vietnamese Learners
import { AUTHENTIC_IPA_LEXICON } from '../data/ipaLexicon';

export interface WordIPAMetadata {
  word: string;
  ipaUS: string;
  ipaUK: string;
  syllables: string[];
  stressedIndex: number;
  audioVoiceType?: string;
}

export interface MinimalPair {
  id: string;
  phonemePair: string; // e.g., "/θ/ vs /s/"
  description: string;
  vietnameseTip: string;
  words: {
    word1: string;
    ipa1: string;
    viMeaning1: string;
    word2: string;
    ipa2: string;
    viMeaning2: string;
  }[];
}

export interface SyllableStressDrill {
  id: string;
  category: string;
  ruleDescription: string;
  items: {
    word: string;
    partOfSpeech: string;
    syllables: string[];
    stressedIndex: number;
    ipa: string;
    viMeaning: string;
  }[];
}

// Curated high-detail lexicon with syllabification for common TED words
export const COMMON_IPA_LEXICON: Record<string, { us: string; uk: string; syllables: string[]; stressedIndex: number }> = {
  money: { us: '/ˈmʌn.i/', uk: '/ˈmʌn.i/', syllables: ['mon', 'ey'], stressedIndex: 0 },
  problem: { us: '/ˈprɑː.bləm/', uk: '/ˈprɒb.ləm/', syllables: ['prob', 'lem'], stressedIndex: 0 },
  leader: { us: '/ˈliː.dɚ/', uk: '/ˈliː.də/', syllables: ['lead', 'er'], stressedIndex: 0 },
  leadership: { us: '/ˈliː.dɚ.ʃɪp/', uk: '/ˈliː.də.ʃɪp/', syllables: ['lead', 'er', 'ship'], stressedIndex: 0 },
  movement: { us: '/ˈmuːv.mənt/', uk: '/ˈmuːv.mənt/', syllables: ['move', 'ment'], stressedIndex: 0 },
  vulnerable: { us: '/ˈvʌl.nɚ.ə.bəl/', uk: '/ˈvʌl.nər.ə.bəl/', syllables: ['vul', 'ner', 'a', 'ble'], stressedIndex: 0 },
  vulnerability: { us: '/ˌvʌl.nɚ.əˈbɪl.ə.t̬i/', uk: '/ˌvʌl.nər.əˈbɪl.ə.ti/', syllables: ['vul', 'ner', 'a', 'bil', 'i', 'ty'], stressedIndex: 4 },
  comfortable: { us: '/ˈkʌm.fɚ.t̬ə.bəl/', uk: '/ˈkʌm.fə.tə.bəl/', syllables: ['com', 'fort', 'a', 'ble'], stressedIndex: 0 },
  success: { us: '/səkˈses/', uk: '/səkˈses/', syllables: ['suc', 'cess'], stressedIndex: 1 },
  secret: { us: '/ˈsiː.krət/', uk: '/ˈsiː.krət/', syllables: ['se', 'cret'], stressedIndex: 0 },
  passion: { us: '/ˈpæʃ.ən/', uk: '/ˈpæʃ.ən/', syllables: ['pas', 'sion'], stressedIndex: 0 },
  grit: { us: '/ɡrɪt/', uk: '/ɡrɪt/', syllables: ['grit'], stressedIndex: 0 },
  perseverance: { us: '/ˌpɝː.səˈvɪr.əns/', uk: '/ˌpɜː.sɪˈvɪə.rəns/', syllables: ['per', 'se', 'ver', 'ance'], stressedIndex: 2 },
  creativity: { us: '/ˌkriː.eɪˈtɪv.ə.t̬i/', uk: '/ˌkriː.eɪˈtɪv.ə.ti/', syllables: ['cre', 'a', 'tiv', 'i', 'ty'], stressedIndex: 2 },
  procrastinate: { us: '/prəˈkræs.tə.neɪt/', uk: '/prəˈkræs.tɪ.neɪt/', syllables: ['pro', 'cras', 'ti', 'nate'], stressedIndex: 1 },
  procrastinator: { us: '/prəˈkræs.tə.neɪ.t̬ɚ/', uk: '/prəˈkræs.tɪ.neɪ.tə/', syllables: ['pro', 'cras', 'ti', 'na', 'tor'], stressedIndex: 1 },
  motivation: { us: '/ˌmoʊ.t̬əˈveɪ.ʃən/', uk: '/ˌməʊ.tɪˈveɪ.ʃən/', syllables: ['mo', 'ti', 'va', 'tion'], stressedIndex: 2 },
  happiness: { us: '/ˈhæp.i.nəs/', uk: '/ˈhæp.i.nəs/', syllables: ['hap', 'pi', 'ness'], stressedIndex: 0 },
  introvert: { us: '/ˈɪn.trə.vɝːt/', uk: '/ˈɪn.trə.vɜːt/', syllables: ['in', 'tro', 'vert'], stressedIndex: 0 },
  extrovert: { us: '/ˈek.strə.vɝːt/', uk: '/ˈek.strə.vɜːt/', syllables: ['ex', 'tro', 'vert'], stressedIndex: 0 },
  language: { us: '/ˈlæŋ.ɡwɪdʒ/', uk: '/ˈlæŋ.ɡwɪdʒ/', syllables: ['lan', 'guage'], stressedIndex: 0 },
  communication: { us: '/kəˌmjuː.nəˈkeɪ.ʃən/', uk: '/kəˌmjuː.nɪˈkeɪ.ʃən/', syllables: ['com', 'mu', 'ni', 'ca', 'tion'], stressedIndex: 3 },
  courage: { us: '/ˈkɝː.ɪdʒ/', uk: '/ˈkʌr.ɪdʒ/', syllables: ['cour', 'age'], stressedIndex: 0 },
  empathy: { us: '/ˈem.pə.θi/', uk: '/ˈem.pə.θi/', syllables: ['em', 'pa', 'thy'], stressedIndex: 0 },
  connection: { us: '/kəˈnek.ʃən/', uk: '/kəˈnek.ʃən/', syllables: ['con', 'nec', 'tion'], stressedIndex: 1 },
  water: { us: '/ˈwɑː.t̬ɚ/', uk: '/ˈwɔː.tə/', syllables: ['wa', 'ter'], stressedIndex: 0 },
  better: { us: '/ˈbet̬.ɚ/', uk: '/ˈbet.ə/', syllables: ['bet', 'ter'], stressedIndex: 0 },
  people: { us: '/ˈpiː.pəl/', uk: '/ˈpiː.pəl/', syllables: ['peo', 'ple'], stressedIndex: 0 },
  listen: { us: '/ˈlɪs.ən/', uk: '/ˈlɪs.ən/', syllables: ['lis', 'ten'], stressedIndex: 0 },
  speak: { us: '/spiːk/', uk: '/spiːk/', syllables: ['speak'], stressedIndex: 0 },
  action: { us: '/ˈæk.ʃən/', uk: '/ˈæk.ʃən/', syllables: ['ac', 'tion'], stressedIndex: 0 },
  future: { us: '/ˈfjuː.tʃɚ/', uk: '/ˈfjuː.tʃə/', syllables: ['fu', 'ture'], stressedIndex: 0 },
  power: { us: '/ˈpaʊ.ɚ/', uk: '/ˈpaʊ.ə/', syllables: ['pow', 'er'], stressedIndex: 0 },
  lesson: { us: '/ˈles.ən/', uk: '/ˈles.ən/', syllables: ['les', 'son'], stressedIndex: 0 },
  world: { us: '/wɝːld/', uk: '/wɜːld/', syllables: ['world'], stressedIndex: 0 },
  challenge: { us: '/ˈtʃæl.ɪndʒ/', uk: '/ˈtʃæl.ɪndʒ/', syllables: ['chal', 'lenge'], stressedIndex: 0 },
  opportunity: { us: '/ˌɑː.pɚˈtuː.nə.t̬i/', uk: '/ˌɒp.əˈtʃuː.nə.ti/', syllables: ['op', 'por', 'tu', 'ni', 'ty'], stressedIndex: 2 },
  experience: { us: '/ɪkˈspɪr.i.əns/', uk: '/ɪkˈspɪə.ri.əns/', syllables: ['ex', 'pe', 'ri', 'ence'], stressedIndex: 1 },
  important: { us: '/ɪmˈpɔːr.tənt/', uk: '/ɪmˈpɔː.tənt/', syllables: ['im', 'por', 'tant'], stressedIndex: 1 },
  different: { us: '/ˈdɪf.ɚ.ənt/', uk: '/ˈdɪf.ər.ənt/', syllables: ['dif', 'fer', 'ent'], stressedIndex: 0 },
  remember: { us: '/rɪˈmem.bɚ/', uk: '/rɪˈmem.bə/', syllables: ['re', 'mem', 'ber'], stressedIndex: 1 },
  understand: { us: '/ˌʌn.dɚˈstænd/', uk: '/ˌʌn.dəˈstænd/', syllables: ['un', 'der', 'stand'], stressedIndex: 2 },
  focus: { us: '/ˈfoʊ.kəs/', uk: '/ˈfəʊ.kəs/', syllables: ['fo', 'cus'], stressedIndex: 0 },
  create: { us: '/kriˈeɪt/', uk: '/kriˈeɪt/', syllables: ['cre', 'ate'], stressedIndex: 1 },
  change: { us: '/tʃeɪndʒ/', uk: '/tʃeɪndʒ/', syllables: ['change'], stressedIndex: 0 },
  curious: { us: '/ˈkjʊr.i.əs/', uk: '/ˈkjʊə.ri.əs/', syllables: ['cu', 'ri', 'ous'], stressedIndex: 0 },
  curiosity: { us: '/ˌkjʊr.iˈɑː.sə.t̬i/', uk: '/ˌkjʊə.riˈɒs.ə.ti/', syllables: ['cu', 'ri', 'os', 'i', 'ty'], stressedIndex: 2 },
  confidence: { us: '/ˈkɑːn.fə.dəns/', uk: '/ˈkɒn.fɪ.dəns/', syllables: ['con', 'fi', 'dence'], stressedIndex: 0 },
  journey: { us: '/ˈdʒɝː.ni/', uk: '/ˈdʒɜː.ni/', syllables: ['jour', 'ney'], stressedIndex: 0 },
  purpose: { us: '/ˈpɝː.pəs/', uk: '/ˈpɜː.pəs/', syllables: ['pur', 'pose'], stressedIndex: 0 },
  decision: { us: '/dɪˈsɪʒ.ən/', uk: '/dɪˈsɪʒ.ən/', syllables: ['de', 'ci', 'sion'], stressedIndex: 1 },
};

// Fluent connected speech weak forms
const WEAK_FORMS: Record<string, string> = {
  was: 'wəz',
  were: 'wər',
  a: 'ə',
  an: 'ən',
  the: 'ðə',
  to: 'tə',
  of: 'əv',
  and: 'ənd',
  for: 'fər',
  from: 'frəm',
  at: 'ət',
  that: 'ðət',
  but: 'bət',
  as: 'əz',
  can: 'kən',
  are: 'ɑːr',
  have: 'həv',
  had: 'həd',
  has: 'həz',
  us: 'əs',
  them: 'ðəm',
  some: 'səm',
};

// Common Contractions
const CONTRACTIONS_IPA: Record<string, string> = {
  "don't": "doʊnt",
  "didn't": "ˈdɪdənt",
  "can't": "kænt",
  "couldn't": "ˈkʊdənt",
  "won't": "woʊnt",
  "wouldn't": "ˈwʊdənt",
  "shouldn't": "ˈʃʊdənt",
  "isn't": "ˈɪzənt",
  "aren't": "ɑːrnt",
  "wasn't": "ˈwɑːzənt",
  "weren't": "wɜːrnt",
  "hasn't": "ˈhæzənt",
  "haven't": "ˈhævənt",
  "hadn't": "ˈhædənt",
  "it's": "ɪts",
  "that's": "ðæts",
  "there's": "ðerz",
  "here's": "hɪrz",
  "what's": "wɑːts",
  "who's": "huːz",
  "i'm": "aɪm",
  "you're": "jʊr",
  "we're": "wɪr",
  "they're": "ðer",
  "he's": "hiːz",
  "she's": "ʃiːz",
  "i've": "aɪv",
  "you've": "juːv",
  "we've": "wiːv",
  "they've": "ðeɪv",
  "i'll": "aɪl",
  "you'll": "juːl",
  "he'll": "hiːl",
  "she'll": "ʃiːl",
  "we'll": "wiːl",
  "they'll": "ðeɪl",
  "i'd": "aɪd",
  "you'd": "juːd",
  "he'd": "hiːd",
  "she'd": "ʃiːd",
  "we'd": "wiːd",
  "they'd": "ðeɪd",
  "let's": "lets",
};

// Minimal Pairs database designed specifically for Vietnamese learners
export const MINIMAL_PAIRS_DATABASE: MinimalPair[] = [
  {
    id: 'pair-th-s',
    phonemePair: '/θ/ vs /s/',
    description: 'Âm răng thổi (Voiceless dental fricative) vs âm xì (Voiceless alveolar fricative)',
    vietnameseTip: 'Người Việt hay phát âm /θ/ thành /s/ hoặc /t/. Với /θ/ (think), hãy đặt đầu lưỡi nhẹ giữa hai hàm răng rồi đẩy luồng hơi ra, không thụt lưỡi vào.',
    words: [
      { word1: 'think', ipa1: '/θɪŋk/', viMeaning1: 'suy nghĩ', word2: 'sink', ipa2: '/sɪŋk/', viMeaning2: 'chìm / bồn rửa' },
      { word1: 'thick', ipa1: '/θɪk/', viMeaning1: 'dày', word2: 'sick', ipa2: '/sɪk/', viMeaning2: 'bị ốm' },
      { word1: 'thing', ipa1: '/θɪŋ/', viMeaning1: 'sự vật', word2: 'sing', ipa2: '/sɪŋ/', viMeaning2: 'hát' },
      { word1: 'theme', ipa1: '/θiːm/', viMeaning1: 'chủ đề', word2: 'seem', ipa2: '/siːm/', viMeaning2: 'dường như' },
      { word1: 'thank', ipa1: '/θæŋk/', viMeaning1: 'cảm ơn', word2: 'sank', ipa2: '/sæŋk/', viMeaning2: 'đã chìm' },
    ],
  },
  {
    id: 'pair-i-short-long',
    phonemePair: '/iː/ vs /ɪ/',
    description: 'Âm i dài (căng khóe miệng) vs âm i ngắn (thả lỏng cơ miệng)',
    vietnameseTip: 'Với /iː/ (sheep), khóe miệng kéo ngang sang 2 bên như đang cười nhẹ. Với /ɪ/ (ship), miệng thả lỏng hoàn toàn, phát âm dứt khoát nửa i nửa ê.',
    words: [
      { word1: 'sheep', ipa1: '/ʃiːp/', viMeaning1: 'con cừu', word2: 'ship', ipa2: '/ʃɪp/', viMeaning2: 'con tàu' },
      { word1: 'seat', ipa1: '/siːt/', viMeaning1: 'chỗ ngồi', word2: 'sit', ipa2: '/sɪt/', viMeaning2: 'ngồi xuống' },
      { word1: 'sleep', ipa1: '/sliːp/', viMeaning1: 'ngủ', word2: 'slip', ipa2: '/slɪp/', viMeaning2: 'trượt ngã' },
      { word1: 'feel', ipa1: '/fiːl/', viMeaning1: 'cảm thấy', word2: 'fill', ipa2: '/fɪl/', viMeaning2: 'làm đầy' },
      { word1: 'leave', ipa1: '/liːv/', viMeaning1: 'rời khỏi', word2: 'live', ipa2: '/lɪv/', viMeaning2: 'sống' },
    ],
  },
  {
    id: 'pair-v-b',
    phonemePair: '/v/ vs /b/',
    description: 'Âm môi răng /v/ vs âm bật môi /b/',
    vietnameseTip: 'Người Việt (đặc biệt miền Nam) hay nhầm /v/ thành /d/ hoặc /b/. Hãy cắn nhẹ răng trên vào môi dưới và rung thanh quản để phát âm /v/.',
    words: [
      { word1: 'very', ipa1: '/ˈver.i/', viMeaning1: 'rất', word2: 'berry', ipa2: '/ˈber.i/', viMeaning2: 'quả mọng' },
      { word1: 'vest', ipa1: '/vest/', viMeaning1: 'áo ghi-lê', word2: 'best', ipa2: '/best/', viMeaning2: 'tốt nhất' },
      { word1: 'vote', ipa1: '/voʊt/', viMeaning1: 'bầu cử', word2: 'boat', ipa2: '/boʊt/', viMeaning2: 'thuyền' },
      { word1: 'vow', ipa1: '/vaʊ/', viMeaning1: 'lời thề', word2: 'bow', ipa2: '/baʊ/', viMeaning2: 'cúi chào' },
    ],
  },
  {
    id: 'pair-l-r',
    phonemePair: '/l/ vs /r/',
    description: 'Âm đầu lưỡi chạm nướu /l/ vs âm cuộn lưỡi /r/',
    vietnameseTip: 'Với âm /l/, đầu lưỡi ấn chắc vào nướu răng cửa hàm trên. Với /r/, cong nhẹ lưỡi về phía vòm họng và không để lưỡi chạm bất kỳ đâu.',
    words: [
      { word1: 'lead', ipa1: '/liːd/', viMeaning1: 'dẫn dắt', word2: 'read', ipa2: '/riːd/', viMeaning2: 'đọc sách' },
      { word1: 'light', ipa1: '/laɪt/', viMeaning1: 'ánh sáng', word2: 'right', ipa2: '/raɪt/', viMeaning2: 'đúng / bên phải' },
      { word1: 'lock', ipa1: '/lɑːk/', viMeaning1: 'khóa', word2: 'rock', ipa2: '/rɑːk/', viMeaning2: 'đá / nhạc rock' },
      { word1: 'play', ipa1: '/pleɪ/', viMeaning1: 'chơi', word2: 'pray', ipa2: '/preɪ/', viMeaning2: 'cầu nguyện' },
    ],
  },
  {
    id: 'pair-final-consonants',
    phonemePair: 'Final /-t/ vs /-d/ vs /-s/',
    description: 'Âm đuôi (Ending Sounds) cực kỳ quan trọng trong tiếng Anh',
    vietnameseTip: 'Tiếng Việt là ngôn ngữ đơn âm tiết không có bật âm đuôi. Trong tiếng Anh, việc nuốt âm đuôi khiến người bản xứ không hiểu được từ bạn nói.',
    words: [
      { word1: 'cat', ipa1: '/kæt/', viMeaning1: 'con mèo (bật -t)', word2: 'cap', ipa2: '/kæp/', viMeaning2: 'cái mũ (khép môi -p)' },
      { word1: 'need', ipa1: '/niːd/', viMeaning1: 'cần (-d rung)', word2: 'neat', ipa2: '/niːt/', viMeaning2: 'gọn gàng (-t bật hơi)' },
      { word1: 'rice', ipa1: '/raɪs/', viMeaning1: 'cơm/gạo (-s xì)', word2: 'ride', ipa2: '/raɪd/', viMeaning2: 'cưỡi xe (-d)' },
    ],
  },
];

// Syllable Stress drills (Word stress shifts)
export const SYLLABLE_STRESS_DRILLS: SyllableStressDrill[] = [
  {
    id: 'noun-verb-pairs',
    category: 'Danh từ (Nhấn âm 1) vs Động từ (Nhấn âm 2)',
    ruleDescription: 'Nhiều từ 2 âm tiết trong tiếng Anh: Danh từ trọng âm rơi vào âm tiết thứ nhất, Động từ trọng âm rơi vào âm tiết thứ hai.',
    items: [
      {
        word: 'present (n)',
        partOfSpeech: 'noun',
        syllables: ['PRE', 'sent'],
        stressedIndex: 0,
        ipa: '/ˈprez.ənt/',
        viMeaning: 'món quà / hiện tại',
      },
      {
        word: 'present (v)',
        partOfSpeech: 'verb',
        syllables: ['pre', 'SENT'],
        stressedIndex: 1,
        ipa: '/prɪˈzent/',
        viMeaning: 'thuyết trình, trao tặng',
      },
      {
        word: 'record (n)',
        partOfSpeech: 'noun',
        syllables: ['REC', 'ord'],
        stressedIndex: 0,
        ipa: '/ˈrek.ɚd/',
        viMeaning: 'kỷ lục / bản ghi âm',
      },
      {
        word: 'record (v)',
        partOfSpeech: 'verb',
        syllables: ['re', 'CORD'],
        stressedIndex: 1,
        ipa: '/rɪˈkɔːrd/',
        viMeaning: 'ghi lại, thu âm',
      },
      {
        word: 'progress (n)',
        partOfSpeech: 'noun',
        syllables: ['PRO', 'gress'],
        stressedIndex: 0,
        ipa: '/ˈprɑː.ɡres/',
        viMeaning: 'sự tiến bộ',
      },
      {
        word: 'progress (v)',
        partOfSpeech: 'verb',
        syllables: ['pro', 'GRESS'],
        stressedIndex: 1,
        ipa: '/prəˈɡres/',
        viMeaning: 'tiến triển, phát triển',
      },
    ],
  },
  {
    id: 'suffix-rules',
    category: 'Hậu tố quy định trọng âm (-tion, -ic, -ity)',
    ruleDescription: 'Từ có đuôi -tion, -sion luôn nhấn vào âm tiết ngay trước nó. Đuôi -ity nhấn vào âm tiết thứ 3 từ cuối lên.',
    items: [
      {
        word: 'motivation',
        partOfSpeech: 'noun',
        syllables: ['mo', 'ti', 'VA', 'tion'],
        stressedIndex: 2,
        ipa: '/ˌmoʊ.t̬əˈveɪ.ʃən/',
        viMeaning: 'động lực',
      },
      {
        word: 'creativity',
        partOfSpeech: 'noun',
        syllables: ['cre', 'a', 'TIV', 'i', 'ty'],
        stressedIndex: 2,
        ipa: '/ˌkriː.eɪˈtɪv.ə.t̬i/',
        viMeaning: 'tính sáng tạo',
      },
      {
        word: 'communication',
        partOfSpeech: 'noun',
        syllables: ['com', 'mu', 'ni', 'CA', 'tion'],
        stressedIndex: 3,
        ipa: '/kəˌmjuː.nəˈkeɪ.ʃən/',
        viMeaning: 'sự giao tiếp',
      },
    ],
  },
];

/**
 * Phonetic rule generator for any English word not found in dictionaries
 */
function ruleBasedIPA(word: string): string {
  if (!word) return '';
  let str = word.toLowerCase();

  // Common prefixes/suffixes phonetics
  str = str.replace(/tion/g, 'ʃən');
  str = str.replace(/sion/g, 'ʒən');
  str = str.replace(/ture/g, 'tʃər');
  str = str.replace(/ough/g, 'ɔː');
  str = str.replace(/ight/g, 'aɪt');
  str = str.replace(/ph/g, 'f');
  str = str.replace(/th/g, 'θ');
  str = str.replace(/sh/g, 'ʃ');
  str = str.replace(/ch/g, 'tʃ');
  str = str.replace(/ck/g, 'k');
  str = str.replace(/qu/g, 'kw');
  str = str.replace(/ee|ea/g, 'iː');
  str = str.replace(/oo/g, 'uː');
  str = str.replace(/ai|ay/g, 'eɪ');
  str = str.replace(/oa/g, 'oʊ');
  str = str.replace(/ar/g, 'ɑːr');
  str = str.replace(/er|ir|ur/g, 'ɜːr');
  str = str.replace(/or/g, 'ɔːr');
  str = str.replace(/ing$/g, 'ɪŋ');

  // Simple vowels
  str = str.replace(/a/g, 'æ');
  str = str.replace(/e/g, 'e');
  str = str.replace(/i/g, 'ɪ');
  str = str.replace(/o/g, 'ɒ');
  str = str.replace(/u/g, 'ʌ');

  return str;
}

/**
 * Get phonetic IPA metadata for any English word
 */
export function getWordIPAMetadata(word: string): WordIPAMetadata {
  const clean = word.toLowerCase().trim().replace(/[^a-z'-]/g, '');

  // 1. Direct hit in curated lexicon
  const foundCurated = COMMON_IPA_LEXICON[clean];
  if (foundCurated) {
    return {
      word: clean,
      ipaUS: foundCurated.us,
      ipaUK: foundCurated.uk,
      syllables: foundCurated.syllables,
      stressedIndex: foundCurated.stressedIndex,
    };
  }

  // 2. Direct hit in Authentic Oxford/Cambridge IPA Lexicon
  const foundAuth = AUTHENTIC_IPA_LEXICON[clean] || CONTRACTIONS_IPA[clean];
  if (foundAuth) {
    const rawIpa = foundAuth.replace(/\//g, '');
    const estSyllables = splitIntoSyllables(clean);
    // Find stressed syllable: where is ˈ located?
    let stressIdx = 0;
    if (rawIpa.includes('ˈ')) {
      const parts = rawIpa.split('ˈ');
      if (parts[0].length > 1 && estSyllables.length > 1) {
        stressIdx = Math.min(estSyllables.length - 1, 1);
      }
    }

    return {
      word: clean,
      ipaUS: `/${rawIpa}/`,
      ipaUK: `/${rawIpa}/`,
      syllables: estSyllables,
      stressedIndex: stressIdx,
    };
  }

  // 3. Fallback procedural phonetic estimation
  const estSyllables = splitIntoSyllables(clean);
  const phonetic = ruleBasedIPA(clean);
  const stressed = estSyllables.length > 1 ? 0 : 0;
  return {
    word: clean,
    ipaUS: `/${estSyllables.length > 1 ? 'ˈ' : ''}${phonetic}/`,
    ipaUK: `/${estSyllables.length > 1 ? 'ˈ' : ''}${phonetic}/`,
    syllables: estSyllables,
    stressedIndex: stressed,
  };
}

/**
 * Procedural phonetic transcription for whole sentences
 * Always returns authentic IPA symbols (Never raw English words)
 */
export function getSentenceIPATranscription(sentence: string): string {
  if (!sentence || !sentence.trim()) return '';

  const words = sentence.trim().split(/\s+/);
  return words
    .map((w) => {
      const clean = w.toLowerCase().replace(/[^a-z'-]/g, '');
      if (!clean) return '';

      // 1. Connected speech weak form check
      if (WEAK_FORMS[clean]) {
        return WEAK_FORMS[clean];
      }

      // 2. Contractions check
      if (CONTRACTIONS_IPA[clean]) {
        return CONTRACTIONS_IPA[clean];
      }

      // 3. Curated Lexicon
      if (COMMON_IPA_LEXICON[clean]) {
        return COMMON_IPA_LEXICON[clean].us.replace(/\//g, '').replace(/\./g, '');
      }

      // 4. Authentic 4,500+ Lexicon
      if (AUTHENTIC_IPA_LEXICON[clean]) {
        return AUTHENTIC_IPA_LEXICON[clean].replace(/\//g, '');
      }

      // 5. Check without apostrophe or hyphen
      const noPunct = clean.replace(/['-]/g, '');
      if (AUTHENTIC_IPA_LEXICON[noPunct]) {
        return AUTHENTIC_IPA_LEXICON[noPunct].replace(/\//g, '');
      }

      // 6. Morphological endings
      if (clean.endsWith('s') && clean.length > 2) {
        const stem = clean.slice(0, -1);
        if (AUTHENTIC_IPA_LEXICON[stem]) {
          return `${AUTHENTIC_IPA_LEXICON[stem]}z`;
        }
      }
      if (clean.endsWith('ed') && clean.length > 3) {
        const stem = clean.slice(0, -2);
        if (AUTHENTIC_IPA_LEXICON[stem]) {
          return `${AUTHENTIC_IPA_LEXICON[stem]}d`;
        }
      }
      if (clean.endsWith('ing') && clean.length > 4) {
        const stem = clean.slice(0, -3);
        if (AUTHENTIC_IPA_LEXICON[stem]) {
          return `${AUTHENTIC_IPA_LEXICON[stem]}ɪŋ`;
        }
      }

      // 7. Phonetic rule generation fallback (never return plain English letters)
      return ruleBasedIPA(clean);
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * Helper to split word into syllables
 */
function splitIntoSyllables(word: string): string[] {
  if (word.length <= 3) return [word];
  const vowels = 'aeiouy';
  const syllables: string[] = [];
  let current = '';

  for (let i = 0; i < word.length; i++) {
    current += word[i];
    if (vowels.includes(word[i]) && i < word.length - 1 && !vowels.includes(word[i + 1])) {
      if (current.length >= 2 && i < word.length - 2) {
        syllables.push(current);
        current = '';
      }
    }
  }
  if (current) {
    if (syllables.length > 0 && current.length <= 1) {
      syllables[syllables.length - 1] += current;
    } else {
      syllables.push(current);
    }
  }

  return syllables.length > 0 ? syllables : [word];
}

/**
 * Synthesize audio pronunciation via Web Speech Synthesis API
 */
export function speakWordWithVoice(text: string, accent: 'us' | 'uk' = 'us', speed = 1.0) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = accent === 'uk' ? 'en-GB' : 'en-US';
  utterance.rate = speed;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const targetVoice = voices.find((v) =>
    accent === 'uk'
      ? v.lang.includes('GB') || v.name.includes('UK')
      : v.lang.includes('US') || v.name.includes('United States')
  );
  if (targetVoice) {
    utterance.voice = targetVoice;
  }

  window.speechSynthesis.speak(utterance);
}
