// Vietnamese Bilingual Translation & Subtitle Service for Speaker Video TED
import preloadedTranslations from '../data/preloadedTranslations.json';

// In-memory cache for all translated sentences
const TRANSLATION_CACHE = new Map<string, string>();
const LOCAL_STORAGE_KEY = 'yg_translations_cache';

// Load preloaded authentic TED translations into memory
if (preloadedTranslations && typeof preloadedTranslations === 'object') {
  for (const [key, val] of Object.entries(preloadedTranslations)) {
    if (val && typeof val === 'string') {
      TRANSLATION_CACHE.set(key.toLowerCase().trim(), val.trim());
      TRANSLATION_CACHE.set(normalizeText(key), val.trim());
    }
  }
}

// Load previously cached translations from browser localStorage
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        for (const [k, v] of Object.entries(parsed)) {
          if (v && typeof v === 'string') {
            TRANSLATION_CACHE.set(k.toLowerCase().trim(), v.trim());
            TRANSLATION_CACHE.set(normalizeText(k), v.trim());
          }
        }
      }
    }
  } catch (e) {
    console.warn('[translationService] Could not parse local translation cache:', e);
  }
}

// Save memory cache back to localStorage periodically
function saveToLocalStorage(key: string, value: string) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    const store = saved ? JSON.parse(saved) : {};
    store[key.toLowerCase().trim()] = value.trim();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
  } catch {}
}

// Listeners for translation updates
type TranslationListener = () => void;
const listeners = new Set<TranslationListener>();

export function onTranslationUpdate(callback: TranslationListener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifyListeners() {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch {}
  });
}

// Curated authentic sentence translations for the 21 featured TED Talks
const CURATED_SENTENCE_TRANSLATIONS: Record<string, string> = {
  // Derek Sivers: How to start a movement (V74AxCqOTvg)
  "ladies and gentlemen at ted we talk a lot about leadership": "Thưa quý vị, tại TED chúng ta nói rất nhiều về khả năng lãnh đạo",
  "and how to make a movement": "và làm thế nào để tạo nên một phong trào.",
  "so lets watch a movement happen start to finish": "Vậy hãy cùng xem một phong trào diễn ra từ đầu đến cuối,",
  "in under three minutes": "trong vòng chưa đầy ba phút",
  "and dissect some lessons from it": "và rút ra một số bài học từ đó.",
  "first of course you know": "Đầu tiên, tất nhiên bạn biết đấy,",
  "a leader needs the guts to stand out and be ridiculed": "một người lãnh đạo cần sự can đảm để nổi bật và chấp nhận bị chế giễu.",
  "but what he's doing is so easy to follow": "nhưng những gì anh ấy làm lại rất dễ để làm theo.",
  "so here's his first follower with a crucial role": "Và đây là người đi theo đầu tiên với vai trò vô cùng quan trọng.",
  "he's going to show everyone else how to follow": "Anh ấy sẽ chỉ cho mọi người cách thức để tham gia cùng.",
  "now notice that the leader embraces him as an equal": "Hãy chú ý rằng người lãnh đạo đón nhận anh ấy như một người bình đẳng.",
  "now it's not about the leader anymore it's about them plural": "Giờ đây không còn là về riêng người lãnh đạo nữa, mà là về họ — số nhiều.",
  "now here he is calling to his friends": "Và đây, anh ấy đang gọi bạn bè của mình đến.",
  "now if you notice the first follower is actually an underestimated form of leadership": "Nếu bạn để ý, người đi theo đầu tiên thực ra là một hình thức lãnh đạo bị đánh giá thấp.",
  "it takes guts to stand out like that": "Cần rất nhiều dũng khí để nổi bật như vậy.",
  "the first follower is what transforms a lone nut into a leader": "Chính người đi theo đầu tiên đã biến một kẻ kỳ quặc đơn độc thành một nhà lãnh đạo.",

  // Matt Cutts: Try something new for 30 days (UNP03fDSj1U)
  "a few years ago i felt like i was stuck in a rut": "Vài năm trước, tôi cảm thấy như mình bị mắc kẹt trong lối mòn cuộc sống,",
  "so i decided to follow in the footsteps of the great american philosopher morgan spurlock": "nên tôi quyết định làm theo triết gia người Mỹ Morgan Spurlock,",
  "and try something new for 30 days": "và thử làm điều gì đó mới mẻ trong vòng 30 ngày.",
  "the idea is actually pretty simple": "Ý tưởng này thực ra khá đơn giản.",
  "think about something you've always wanted to add to your life": "Hãy nghĩ về điều gì đó bạn luôn muốn thêm vào cuộc sống của mình",
  "and try it for the next 30 days": "và thử thực hiện nó trong 30 ngày tới.",
  "it turns out 30 days is just about the right amount of time": "Hóa ra 30 ngày là khoảng thời gian vừa đủ",
  "to add a new habit or subtract a habit": "để rèn luyện một thói quen mới hoặc từ bỏ một thói quen cũ.",

  // Richard St. John: 8 secrets of success (d6wRkzCW5qI)
  "this is really a two-hour presentation i give to high school students": "Đây thực ra là bài thuyết trình kéo dài 2 tiếng tôi dành cho học sinh cấp 3,",
  "cut down to three minutes": "được rút gọn lại chỉ còn 3 phút.",
  "and it all started one day on a plane on my way to ted": "Và tất cả bắt đầu vào một ngày nọ trên máy bay khi tôi trên đường tới TED.",
  "the first thing is passion": "Điều đầu tiên chính là niềm đam mê.",
  "freeman thomas says i'm driven by my passion": "Freeman Thomas nói: 'Tôi được thúc đẩy bởi niềm đam mê của mình.'",
  "tedsters do it for love they don't do it for money": "Các diễn giả TED làm vì đam mê, họ không làm vì tiền.",
  "rupert murdoch said to me it's all hard work": "Rupert Murdoch từng nói với tôi: 'Tất cả đều là sự chăm chỉ.'",
  "nothing comes easily but i have a lot of fun": "Không có gì đến dễ dàng cả, nhưng tôi cảm thấy rất vui.",

  // Simon Sinek: How Great Leaders Inspire Action (qp0HIF3SfI4)
  "how do you explain when things don't go as we assume": "Làm thế nào bạn giải thích khi mọi chuyện không diễn ra như chúng ta dự tính?",
  "or better how do you explain when others are able to achieve things": "Hay nói đúng hơn: làm sao giải thích khi người khác đạt được những thành tựu",
  "that seem to defy all of the assumptions": "dường như thách thức mọi định kiến và giả định?",
  "people don't buy what you do they buy why you do it": "Mọi người không mua những gì bạn làm, họ mua lý do tại sao bạn làm điều đó.",
  "every single person every single organization on the planet knows what they do": "Mỗi một cá nhân, tổ chức trên hành tinh này đều biết mình làm gì.",
  "some know how they do it": "Một số người biết họ làm điều đó như thế nào.",
  "but very very few people or organizations know why they do what they do": "Nhưng rất ít người hay tổ chức biết rõ lý do tại sao họ làm điều họ làm.",
  "money was no problem": "Tiền không thành vấn đề.",
  "money was no problem.": "Tiền không thành vấn đề.",

  // Friendship & Daily Conversation (Easy English, BBC, TV Series, VOA)
  "my best friend": "Người bạn thân nhất của tôi.",
  "my best friends name is amina": "Tên của bạn thân tôi là Amina.",
  "she is very kind friendly and helpful": "Cô ấy rất tốt bụng, thân thiện và hay giúp đỡ.",
  "we have known each other since fifth grade": "Chúng tôi biết nhau từ hồi lớp năm.",
  "we have been best friends for a long time": "Chúng tôi đã là bạn thân của nhau trong một thời gian dài.",
  "we spend a lot of time together": "Chúng tôi dành rất nhiều thời gian bên nhau.",
  "i am very happy to have a best friend like amina": "Tôi rất hạnh phúc khi có người bạn thân như Amina.",
  "i hope we will always be best friends": "Tôi hy vọng chúng tôi sẽ mãi là bạn thân.",
  "hello my name is lily i have a best friend": "Xin chào, tôi tên là Lily. Tôi có một người bạn thân.",
  "her name is sarah shes kind and funny": "Tên bạn ấy là Sarah. Bạn ấy tốt bụng và hài hước.",
  "who is your best friend": "Ai là người bạn thân nhất của bạn?",
  "describe your best friend": "Hãy miêu tả về người bạn thân của bạn.",
  "what is your best friend like": "Người bạn thân của bạn là người như thế nào?",
  "today is all about friends": "Hôm nay chủ đề là về tình bạn bè.",
  "what makes a good friend in your opinion": "Theo bạn, điều gì tạo nên một người bạn tốt?",
  "i think a good friend is honest kind and trustworthy": "Tôi nghĩ một người bạn tốt là người trung thực, tốt bụng và đáng tin cậy.",
  "keep in touch with some of your friends": "Giữ liên lạc với một số người bạn của bạn.",
  "good friends make life happier and more meaningful": "Những người bạn tốt giúp cuộc sống hạnh phúc và ý nghĩa hơn.",
  "i always like to say some of my best friends are extroverts": "Tôi luôn thích nói rằng một số người bạn thân nhất của tôi là người hướng ngoại.",
};

// Rich bilingual glossary for common vocabulary & phrase patterns
export const VOCABULARY_GLOSSARY: Record<string, { vi: string; pos?: string }> = {
  leader: { vi: 'người lãnh đạo, người dẫn đường', pos: 'danh từ' },
  leadership: { vi: 'khả năng lãnh đạo, sự lãnh đạo', pos: 'danh từ' },
  movement: { vi: 'phong trào, cuộc vận động', pos: 'danh từ' },
  follower: { vi: 'người theo sau, người ủng hộ', pos: 'danh từ' },
  crucial: { vi: 'quan trọng mang tính quyết định', pos: 'tính từ' },
  ridiculed: { vi: 'bị chế giễu, bị trêu chọc', pos: 'tính từ/động từ' },
  embrace: { vi: 'đón nhận, ôm lấy', pos: 'động từ' },
  equal: { vi: 'bình đẳng, ngang hàng', pos: 'tính từ' },
  guts: { vi: 'sự can đảm, dũng khí', pos: 'danh từ' },
  habit: { vi: 'thói quen', pos: 'danh từ' },
  challenge: { vi: 'thử thách, thách thức', pos: 'danh từ' },
  passion: { vi: 'niềm đam mê cháy bỏng', pos: 'danh từ' },
  perseverance: { vi: 'sự kiên trì, bền bỉ', pos: 'danh từ' },
  grit: { vi: 'ý chí kiên cường, sự bền lòng', pos: 'danh từ' },
  success: { vi: 'thành công', pos: 'danh từ' },
  vulnerable: { vi: 'dễ bị tổn thương, mở lòng', pos: 'tính từ' },
  vulnerability: { vi: 'sự yếu lòng, tính dễ tổn thương', pos: 'danh từ' },
  procrastinate: { vi: 'trì hoãn, chần chừ', pos: 'động từ' },
  procrastinator: { vi: 'người hay trì hoãn', pos: 'danh từ' },
  creativity: { vi: 'tính sáng tạo, sức sáng tạo', pos: 'danh từ' },
  motivation: { vi: 'động lực thúc đẩy', pos: 'danh từ' },
  happiness: { vi: 'hạnh phúc, sự mãn nguyện', pos: 'danh từ' },
  authenticity: { vi: 'tính chân thật, sự xác thực', pos: 'danh từ' },
  integrity: { vi: 'sự chính trực, liêm chính', pos: 'danh từ' },
  empathy: { vi: 'sự thấu cảm, đồng cảm', pos: 'danh từ' },
  courage: { vi: 'lòng dũng cảm', pos: 'danh từ' },
  connection: { vi: 'sự kết nối, gắn kết', pos: 'danh từ' },
  comfortable: { vi: 'thoải mái, dễ chịu', pos: 'tính từ' },
  experience: { vi: 'kinh nghiệm, trải nghiệm', pos: 'danh từ' },
  opportunity: { vi: 'cơ hội, thời cơ', pos: 'danh từ' },
  decision: { vi: 'quyết định', pos: 'danh từ' },
  inspire: { vi: 'truyền cảm hứng', pos: 'động từ' },
  focus: { vi: 'tập trung, tiêu điểm', pos: 'động từ/danh từ' },
  stuck: { vi: 'bị mắc kẹt', pos: 'tính từ' },
  transform: { vi: 'chuyển đổi, biến đổi', pos: 'động từ' },
  valuable: { vi: 'có giá trị, quý giá', pos: 'tính từ' },
  curious: { vi: 'tò mò, hiếu kỳ', pos: 'tính từ' },
  purpose: { vi: 'mục đích, ý nghĩa sống', pos: 'danh từ' },
  problem: { vi: 'vấn đề, bài toán khó', pos: 'danh từ' },
  money: { vi: 'tiền bạc, tài chính', pos: 'danh từ' },
};

/**
 * Clean string for lookup
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// In-flight translation promises to prevent duplicate simultaneous fetches
const activeRequests = new Map<string, Promise<string>>();

/**
 * Translate a single sentence asynchronously with multi-tier fallback
 */
export async function translateSentence(sentence: string): Promise<string> {
  const trimmed = sentence.trim();
  if (!trimmed) return '';

  const clean = normalizeText(trimmed);
  const rawLower = trimmed.toLowerCase();

  // 1. Check in-memory cache
  if (TRANSLATION_CACHE.has(rawLower)) return TRANSLATION_CACHE.get(rawLower)!;
  if (TRANSLATION_CACHE.has(clean)) return TRANSLATION_CACHE.get(clean)!;
  if (CURATED_SENTENCE_TRANSLATIONS[clean]) return CURATED_SENTENCE_TRANSLATIONS[clean];

  // 2. Reuse active request if already fetching
  if (activeRequests.has(clean)) {
    return activeRequests.get(clean)!;
  }

  const fetchPromise = (async () => {
    let result = '';

    // Try 1: Local /api/translate endpoint
    try {
      const res = await fetch(`/api/translate?text=${encodeURIComponent(trimmed)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.translated) {
          result = data.translated.trim();
        }
      }
    } catch {}

    // Try 2: Direct Google Translate public client
    if (!result) {
      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(trimmed)}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && Array.isArray(data[0])) {
            result = data[0].map((item: any) => (item && item[0] ? item[0] : '')).join('').trim();
          }
        }
      } catch {}
    }

    // Try 3: MyMemory Translation API fallback
    if (!result) {
      try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=en|vi`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && data.responseData && data.responseData.translatedText) {
            result = data.responseData.translatedText.trim();
          }
        }
      } catch {}
    }

    if (result) {
      TRANSLATION_CACHE.set(rawLower, result);
      TRANSLATION_CACHE.set(clean, result);
      saveToLocalStorage(trimmed, result);
      notifyListeners();
      return result;
    }

    return '';
  })().finally(() => {
    activeRequests.delete(clean);
  });

  activeRequests.set(clean, fetchPromise);
  return fetchPromise;
}

/**
 * Batch-translate multiple transcript lines in the background
 */
export async function translateBatch(sentences: string[]): Promise<Record<string, string>> {
  const uncached: string[] = [];
  const results: Record<string, string> = {};

  for (const s of sentences) {
    const rawLower = s.toLowerCase().trim();
    const clean = normalizeText(s);
    if (TRANSLATION_CACHE.has(rawLower)) {
      results[s] = TRANSLATION_CACHE.get(rawLower)!;
    } else if (TRANSLATION_CACHE.has(clean)) {
      results[s] = TRANSLATION_CACHE.get(clean)!;
    } else if (CURATED_SENTENCE_TRANSLATIONS[clean]) {
      results[s] = CURATED_SENTENCE_TRANSLATIONS[clean];
    } else if (s.trim()) {
      uncached.push(s);
    }
  }

  if (uncached.length === 0) return results;

  // Process uncached in chunks of 20 lines
  const CHUNK_SIZE = 20;
  for (let i = 0; i < uncached.length; i += CHUNK_SIZE) {
    const chunk = uncached.slice(i, i + CHUNK_SIZE);
    const combined = chunk.join('\n');
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(combined)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const translatedCombined = data[0].map((item: any) => (item && item[0] ? item[0] : '')).join('');
        const splitLines = translatedCombined.split('\n');
        chunk.forEach((orig, idx) => {
          const vi = (splitLines[idx] || '').trim();
          if (vi) {
            results[orig] = vi;
            TRANSLATION_CACHE.set(orig.toLowerCase().trim(), vi);
            TRANSLATION_CACHE.set(normalizeText(orig), vi);
            saveToLocalStorage(orig, vi);
          }
        });
      }
    } catch (e) {
      // Fallback single line translation
      for (const single of chunk) {
        translateSentence(single).then((vi) => {
          if (vi) results[single] = vi;
        });
      }
    }
  }

  notifyListeners();
  return results;
}

/**
 * Get natural Vietnamese translation for any English sentence or subtitle cue
 * Synchronous instant lookup with background fetch trigger
 */
export function getVietnameseSubtitle(sentence: string, videoId?: string): string {
  if (!sentence || !sentence.trim()) return '';

  const trimmed = sentence.trim();
  const rawLower = trimmed.toLowerCase();
  const clean = normalizeText(trimmed);

  // 1. Direct hit in memory cache (preloaded, previously fetched, or user cached)
  if (TRANSLATION_CACHE.has(rawLower)) {
    return TRANSLATION_CACHE.get(rawLower)!;
  }
  if (TRANSLATION_CACHE.has(clean)) {
    return TRANSLATION_CACHE.get(clean)!;
  }

  // 2. Exact or partial match in curated sentence translations
  if (CURATED_SENTENCE_TRANSLATIONS[clean]) {
    return CURATED_SENTENCE_TRANSLATIONS[clean];
  }
  for (const [enKey, viVal] of Object.entries(CURATED_SENTENCE_TRANSLATIONS)) {
    if (clean === enKey || clean.includes(enKey) || enKey.includes(clean)) {
      return viVal;
    }
  }

  // 3. Trigger background async fetch immediately
  translateSentence(trimmed);

  // Return empty string while translation loads (never return raw English sentence!)
  return '';
}

/**
 * Look up word in vocabulary glossary
 */
export function lookupWordTranslation(word: string): { viDefinition: string; partOfSpeech?: string } | null {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  const entry = VOCABULARY_GLOSSARY[clean];
  if (entry) {
    return {
      viDefinition: entry.vi,
      partOfSpeech: entry.pos,
    };
  }

  // If word is in cache as a translation
  if (TRANSLATION_CACHE.has(clean)) {
    return {
      viDefinition: TRANSLATION_CACHE.get(clean)!,
      partOfSpeech: 'từ vựng',
    };
  }

  // Trigger background translation for unknown word
  translateSentence(word);

  return null;
}
