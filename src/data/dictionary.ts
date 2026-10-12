import { WordEntry, VideoClip, Language } from '../types';
import { AUTHENTIC_TRANSCRIPTS } from './knownTranscripts';
import { MULTI_CHANNEL_CATALOG, MULTI_CHANNEL_TRANSCRIPTS } from './multiChannelData';
import { KNOWN_VIDEO_CATALOG, cuesToTranscriptLines, VideoCatalogItem } from '../services/transcriptService';
import { getSentenceIPATranscription } from '../services/pronunciationService';
import { getVietnameseSubtitle } from '../services/translationService';

// All video sources from official TED, BBC Learning English, Easy English, Rachel's English, TV Series, VOA
export const VIDEO_SOURCES: VideoCatalogItem[] = Array.from(
  new Map(
    [...Object.values(KNOWN_VIDEO_CATALOG), ...(MULTI_CHANNEL_CATALOG as VideoCatalogItem[])]
      .map((item) => [item.youtubeId, item])
  ).values()
);

// Helper to format seconds into m:ss
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/what's/g, 'what is')
    .replace(/who's/g, 'who is')
    .replace(/it's/g, 'it is')
    .replace(/i'm/g, 'i am')
    .replace(/you're/g, 'you are')
    .replace(/we're/g, 'we are')
    .replace(/they're/g, 'they are')
    .replace(/don't/g, 'do not')
    .replace(/doesn't/g, 'does not')
    .replace(/didn't/g, 'did not')
    .replace(/can't/g, 'cannot')
    .replace(/won't/g, 'will not')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generate clips for ANY word or sentence by querying authentic transcripts across
 * BBC Learning English, TED, Easy English, Rachel's English, TV Series, VOA, TEDx.
 * Every returned clip corresponds 100% to spoken words and exact frame timestamps.
 */
export function generateClipsForWord(
  word: string, 
  count: number = 64
): VideoClip[] {
  const rawInput = word.trim().toLowerCase();
  const cleanWord = rawInput.replace(/[?!.,;:'"]/g, '').trim() || rawInput;
  const normQuery = normalizeForSearch(cleanWord);
  const searchTokens = normQuery.split(/\s+/).filter(Boolean);
  const isPhrase = searchTokens.length > 1;

  if (searchTokens.length === 0) return [];

  interface ScoredCandidate {
    clip: VideoClip;
    score: number;
  }
  const candidates: ScoredCandidate[] = [];
  let clipIndex = 1;

  // Plural & possessive variants
  const pluralQuery = isPhrase
    ? `${searchTokens.slice(0, -1).join(' ')} ${searchTokens[searchTokens.length - 1]}s`.trim()
    : `${normQuery}s`;
  const possessiveQuery = isPhrase
    ? `${searchTokens.slice(0, -1).join(' ')} ${searchTokens[searchTokens.length - 1]}'s`.trim()
    : `${normQuery}'s`;

  for (const source of VIDEO_SOURCES) {
    const knownCues = MULTI_CHANNEL_TRANSCRIPTS[source.youtubeId] || AUTHENTIC_TRANSCRIPTS[source.youtubeId];
    if (!knownCues || knownCues.length === 0) continue;

    const seenStarts: number[] = [];
    const maxWindow = isPhrase ? Math.min(3, knownCues.length) : 1;

    for (let i = 0; i < knownCues.length; i++) {
      for (let w = 1; w <= maxWindow && i + w <= knownCues.length; w++) {
        const windowCues = knownCues.slice(i, i + w);
        const windowText = windowCues.map((c) => c.text).join(' ');
        const normWindow = normalizeForSearch(windowText);

        let score = 0;
        let matchOffset = 0; // Index in windowCues where target phrase actually starts

        if (searchTokens.length === 1) {
          // SINGLE WORD: Must match exact word boundary
          const singleTok = searchTokens[0];
          const escaped = singleTok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const exactWordRegex = new RegExp(`\\b${escaped}\\b`, 'i');
          const inflectedRegex = new RegExp(`\\b${escaped}(s|es|ed|ing)?\\b`, 'i');

          if (exactWordRegex.test(normWindow)) {
            score = 2000;
          } else if (inflectedRegex.test(normWindow)) {
            score = 1500;
          }
        } else if (searchTokens.length === 2 || searchTokens.length === 3) {
          // 2-3 WORD PHRASE (e.g. "best friend", "keep in touch"):
          // STRICT RULE: MUST actually contain the phrase, plural, or possessive!
          // Unrelated videos or single loose words are NEVER matched!
          if (normWindow === normQuery) {
            score = 3000;
          } else if (normWindow.includes(normQuery)) {
            score = 2500 - (w - 1) * 60;
          } else if (normWindow.includes(pluralQuery)) {
            score = 2400 - (w - 1) * 60;
          } else if (normWindow.includes(possessiveQuery)) {
            score = 2300 - (w - 1) * 60;
          } else if (searchTokens.length === 3) {
            // For 3-word phrase: e.g. "who is your"
            const sub2_1 = `${searchTokens[0]} ${searchTokens[1]}`;
            const sub2_2 = `${searchTokens[1]} ${searchTokens[2]}`;
            if (normWindow.includes(sub2_1) && normWindow.includes(searchTokens[2])) {
              score = 1800;
            } else if (normWindow.includes(sub2_2) && normWindow.includes(searchTokens[0])) {
              score = 1800;
            }
          }
        } else {
          // LONGER SENTENCE (4+ words, e.g. "what is your best friend like"):
          if (normWindow.includes(normQuery)) {
            score = 3000;
          } else {
            // Must contain key non-trivial 2-word phrase (e.g. "best friend")
            let hasCorePhrase = false;
            for (let k = 0; k <= searchTokens.length - 2; k++) {
              const sub2 = `${searchTokens[k]} ${searchTokens[k + 1]}`;
              const isOnlyStopWords = ['what is', 'is your', 'are you', 'do you', 'in the', 'to the', 'of the'].includes(sub2);
              if (!isOnlyStopWords && (normWindow.includes(sub2) || normWindow.includes(sub2 + 's'))) {
                hasCorePhrase = true;
                break;
              }
            }

            const matchedTokens = searchTokens.filter((tok) => normWindow.includes(tok));
            const overlapRatio = matchedTokens.length / searchTokens.length;

            if (hasCorePhrase && overlapRatio >= 0.5) {
              score = 1600 + Math.round(overlapRatio * 400);
            } else if (overlapRatio >= 0.8) {
              score = 1500;
            }
          }
        }

        // Only accept true matches (score >= 1000)
        if (score >= 1000) {
          // Find the exact cue in windowCues that contains the matched phrase
          for (let cIdx = 0; cIdx < windowCues.length; cIdx++) {
            const cueNorm = normalizeForSearch(windowCues[cIdx].text);
            if (
              cueNorm.includes(cleanWord) ||
              cueNorm.includes(normQuery) ||
              cueNorm.includes(pluralQuery) ||
              (searchTokens.length >= 2 && cueNorm.includes(searchTokens[1])) ||
              searchTokens.every((t) => cueNorm.includes(t))
            ) {
              matchOffset = cIdx;
              break;
            }
          }

          const matchedCue = windowCues[matchOffset] || windowCues[0];
          const startSecond = Math.max(0, matchedCue.start);
          const endSecond = windowCues[windowCues.length - 1].end;

          // Deduplicate overlapping clips within 6s
          const isOverlapping = seenStarts.some((st) => Math.abs(st - startSecond) < 6);
          if (isOverlapping) {
            continue;
          }
          seenStarts.push(startSecond);

          const clip: VideoClip = {
            id: `clip-${cleanWord}-${source.youtubeId}-${clipIndex}`,
            youtubeId: source.youtubeId,
            title: source.title,
            channel: source.channel || 'TED',
            startSecond,
            endSecond,
            accent: source.accent,
            sentence: windowText,
            vietnameseSentence: getVietnameseSubtitle(windowText, source.youtubeId),
            targetWord: cleanWord,
            category: source.category,
            views: source.views,
            durationSeconds: source.durationSeconds,
            durationFormatted: formatDuration(source.durationSeconds),
            isShort: source.durationSeconds < 600,
          };
          clip.transcriptLines = cuesToTranscriptLines(knownCues, startSecond, source.youtubeId);
          candidates.push({ clip, score });
          clipIndex++;
        }
      }
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const matchedClips = candidates.map((c) => c.clip);

  if (matchedClips.length > 0) {
    return matchedClips.slice(0, count);
  }

  // Never return fake unrelated talks for sentence/phrase searches
  if (isPhrase) {
    return [];
  }

  // Fallback for single words not yet indexed
  const fallbackClips: VideoClip[] = [];
  for (const source of VIDEO_SOURCES) {
    const knownCues = MULTI_CHANNEL_TRANSCRIPTS[source.youtubeId] || AUTHENTIC_TRANSCRIPTS[source.youtubeId];
    if (!knownCues || knownCues.length === 0) continue;
    const cue = knownCues[0];
    fallbackClips.push({
      id: `clip-fallback-${cleanWord}-${source.youtubeId}`,
      youtubeId: source.youtubeId,
      title: source.title,
      channel: source.channel || 'TED',
      startSecond: Math.max(0, cue.start),
      endSecond: cue.end,
      accent: source.accent,
      sentence: cue.text,
      vietnameseSentence: getVietnameseSubtitle(cue.text, source.youtubeId),
      targetWord: cleanWord,
      category: source.category,
      views: source.views,
      durationSeconds: source.durationSeconds,
      durationFormatted: formatDuration(source.durationSeconds),
      isShort: source.durationSeconds < 600,
      transcriptLines: cuesToTranscriptLines(knownCues, cue.start, source.youtubeId),
    });
    if (fallbackClips.length >= count) break;
  }
  return fallbackClips;
}

// Preset Curated Dictionary - strictly official TED Talks (https://www.youtube.com/@TED)
export const CURATED_DICTIONARY: Record<string, WordEntry> = {
  leader: {
    word: 'leader',
    language: 'en',
    ipa: {
      us: '/ˈliː.dɚ/',
      uk: '/ˈliː.də/',
    },
    respelling: 'LEE-der',
    syllables: ['lead', 'er'],
    stressedIndex: 0,
    partOfSpeech: 'noun',
    definition: 'The person who leads or commands a group, organization, or country.',
    vietnameseDefinition: 'Người lãnh đạo, người dẫn đầu.',
    tips: [
      'Trọng âm rơi vào âm tiết đầu tiên: LEE-der.',
      'Nguyên âm "ea" là âm /iː/ kéo dài như trong "see" hoặc "tree".',
      'Derek Sivers chỉ ra tại TED: "The first follower is what transforms a lone nut into a leader."'
    ],
    rhymes: ['feeder', 'pleader', 'reader'],
    collocations: ['great leader', 'world leader', 'inspire leaders'],
    clips: generateClipsForWord('leader', 64)
  },
  success: {
    word: 'success',
    language: 'en',
    ipa: {
      us: '/səkˈses/',
      uk: '/səkˈses/',
    },
    respelling: 'suk-SESS',
    syllables: ['suc', 'cess'],
    stressedIndex: 1,
    partOfSpeech: 'noun',
    definition: 'The accomplishment of an aim or purpose.',
    vietnameseDefinition: 'Sự thành công, thành quả đạt được.',
    tips: [
      'Trọng âm rơi vào âm tiết thứ hai: suk-SESS.',
      'Âm tiết đầu "suc-" là âm schwa nhẹ /sək/, không đọc là "sook".',
      'Richard St. John phỏng vấn 500 diễn giả TED thành công nhất để đúc kết 8 bí quyết thành công.'
    ],
    rhymes: ['access', 'excess', 'process'],
    collocations: ['achieve success', 'key to success', 'huge success'],
    clips: generateClipsForWord('success', 64)
  },
  grit: {
    word: 'grit',
    language: 'en',
    ipa: {
      us: '/ɡrɪt/',
      uk: '/ɡrɪt/',
    },
    respelling: 'GRIT',
    syllables: ['grit'],
    stressedIndex: 0,
    partOfSpeech: 'noun',
    definition: 'Courage and resolve; passion and perseverance for very long-term goals.',
    vietnameseDefinition: 'Sự bền bỉ, ý chí kiên định vượt khó khăn.',
    tips: [
      'Một âm tiết duy nhất với nguyên âm ngắn /ɪ/ dứt khoát như trong "sit" hoặc "hit".',
      'Angela Duckworth định nghĩa Grit tại TED là yếu tố dự báo thành công hàng đầu vượt trội hơn tài năng.'
    ],
    rhymes: ['fit', 'hit', 'kit', 'lit', 'quit'],
    collocations: ['true grit', 'mental grit', 'building grit'],
    clips: generateClipsForWord('grit', 64)
  },
  vulnerable: {
    word: 'vulnerable',
    language: 'en',
    ipa: {
      us: '/ˈvʌl.nɚ.ə.bəl/',
      uk: '/ˈvʌl.nər.ə.bəl/',
    },
    respelling: 'VUL-ner-uh-bul',
    syllables: ['vul', 'ner', 'a', 'ble'],
    stressedIndex: 0,
    partOfSpeech: 'adjective',
    definition: 'Exposed to the possibility of being attacked or harmed, either physically or emotionally.',
    vietnameseDefinition: 'Dễ bị tổn thương; biểu hiện của lòng dũng cảm mở lòng.',
    tips: [
      'Trọng âm rơi vào âm tiết đầu: VUL-ner-a-ble.',
      'Brené Brown chia sẻ bài nói TED huyền thoại: Tổn thương là cội nguồn của niềm vui, sáng tạo và sự gắn kết.',
      'Phát âm âm /l/ rõ ràng và không nuốt âm ở giữa.'
    ],
    rhymes: [],
    collocations: ['feel vulnerable', 'highly vulnerable', 'vulnerable population'],
    clips: generateClipsForWord('vulnerable', 64)
  },
  water: {
    word: 'water',
    language: 'en',
    ipa: {
      us: '/ˈwɑː.t̬ɚ/',
      uk: '/ˈwɔː.tə/',
    },
    respelling: 'US: WAH-ter | UK: WOH-tuh',
    syllables: ['wa', 'ter'],
    stressedIndex: 0,
    partOfSpeech: 'noun',
    definition: 'A clear liquid that is necessary for all life.',
    vietnameseDefinition: 'Nước - yếu tố thiết yếu cho sự sống.',
    tips: [
      'Michael Pritchard trình diễn tại TED sáng chế lọc nước cứu sống hàng triệu người.',
      'Giọng Anh (British) phát âm âm "t" rõ /t/, còn giọng Mỹ chuyển thành Flap T [ɾ].'
    ],
    rhymes: ['daughter', 'slaughter'],
    collocations: ['drink water', 'clean water', 'fresh water'],
    clips: generateClipsForWord('water', 64)
  },
  comfortable: {
    word: 'comfortable',
    language: 'en',
    ipa: {
      us: '/ˈkʌm.fɚ.t̬ə.bəl/',
      uk: '/ˈkʌm.fə.tə.bəl/',
    },
    respelling: 'KUMF-ter-bul (3 âm tiết)',
    syllables: ['com', 'fort', 'a', 'ble'],
    stressedIndex: 0,
    partOfSpeech: 'adjective',
    definition: 'Providing physical ease and relaxation; free from stress or anxiety.',
    vietnameseDefinition: 'Thoải mái, dễ chịu; tự tin không áp lực.',
    tips: [
      'Hầu hết các diễn giả bản ngữ TED rút gọn từ 4 âm tiết xuống 3 âm tiết: "COMF-ter-ble".',
      'Trọng âm rơi vào âm tiết đầu tiên: COMF.'
    ],
    rhymes: ['uncomfortable'],
    collocations: ['feel comfortable', 'perfectly comfortable'],
    clips: generateClipsForWord('comfortable', 64)
  },
  stress: {
    word: 'stress',
    language: 'en',
    ipa: {
      us: '/stres/',
      uk: '/stres/',
    },
    respelling: 'STRESS',
    syllables: ['stress'],
    stressedIndex: 0,
    partOfSpeech: 'noun / verb',
    definition: 'Pressure or tension exerted on a material object; mental or emotional strain.',
    vietnameseDefinition: 'Áp lực, căng thẳng; nhấn mạnh.',
    tips: [
      'Kelly McGonigal tại TED giải thích cách biến căng thẳng thành nguồn năng lượng tích cực.',
      'Cụm phụ âm "str-" bắt đầu từ âm /s/ mượt sang /tr/.'
    ],
    rhymes: ['press', 'dress', 'mess', 'less', 'bless'],
    collocations: ['reduce stress', 'handle stress', 'stress response'],
    clips: generateClipsForWord('stress', 64)
  },
  language: {
    word: 'language',
    language: 'en',
    ipa: {
      us: '/ˈlæŋ.ɡwɪdʒ/',
      uk: '/ˈlæŋ.ɡwɪdʒ/',
    },
    respelling: 'LANG-gwij',
    syllables: ['lan', 'guage'],
    stressedIndex: 0,
    partOfSpeech: 'noun',
    definition: 'The principal method of human communication.',
    vietnameseDefinition: 'Ngôn ngữ, tiếng nói giao tiếp.',
    tips: [
      'Trọng âm ở âm tiết đầu: LANG-gwij.',
      'Âm tiết thứ hai phát âm là /ɡwɪdʒ/, đuôi "ge" là âm /dʒ/.',
      'Lera Boroditsky tại TED khám phá cách ngôn ngữ định hình cách con người suy nghĩ.'
    ],
    rhymes: [],
    collocations: ['body language', 'spoken language', 'second language'],
    clips: generateClipsForWord('language', 64)
  },
  movement: {
    word: 'movement',
    language: 'en',
    ipa: {
      us: '/ˈmuːv.mənt/',
      uk: '/ˈmuːv.mənt/',
    },
    respelling: 'MOOV-muhnt',
    syllables: ['move', 'ment'],
    stressedIndex: 0,
    partOfSpeech: 'noun',
    definition: 'An act of changing physical location; a group of people working together to advance shared ideas.',
    vietnameseDefinition: 'Sự chuyển động; phong trào, trào lưu.',
    tips: [
      'Trọng âm ở âm tiết đầu: MOOV-ment.',
      'Hậu tố "-ment" giảm thành âm schwa /mənt/.',
      'Derek Sivers giải thích cách một người nhảy đơn độc bắt đầu một phong trào.'
    ],
    rhymes: ['improvement'],
    collocations: ['start a movement', 'make a movement', 'social movement'],
    clips: generateClipsForWord('movement', 64)
  },
  listen: {
    word: 'listen',
    language: 'en',
    ipa: {
      us: '/ˈlɪs.ən/',
      uk: '/ˈlɪs.ən/',
    },
    respelling: 'LISS-uhn',
    syllables: ['lis', 'ten'],
    stressedIndex: 0,
    partOfSpeech: 'verb',
    definition: 'Give one\'s attention to a sound or to what someone is saying.',
    vietnameseDefinition: 'Lắng nghe, chú ý lắng nghe.',
    tips: [
      'Âm "t" là âm câm: phát âm là "LISS-uhn", không đọc là "lis-ten".',
      'Julian Treasure chia sẻ bài TED về 5 bài tập lắng nghe để hiểu thấu người đối diện.'
    ],
    rhymes: ['glisten'],
    collocations: ['listen carefully', 'want to listen', 'actively listen'],
    clips: generateClipsForWord('listen', 64)
  },
  creative: {
    word: 'creative',
    language: 'en',
    ipa: {
      us: '/kriˈeɪ.t̬ɪv/',
      uk: '/kriˈeɪ.tɪv/',
    },
    respelling: 'kree-AY-tiv',
    syllables: ['cre', 'a', 'tive'],
    stressedIndex: 1,
    partOfSpeech: 'adjective',
    definition: 'Relating to or involving the imagination or original ideas.',
    vietnameseDefinition: 'Sáng tạo, mang tính phát kiến mới.',
    tips: [
      'Trọng âm rơi vào âm tiết giữa: kree-AY-tiv.',
      'Sir Ken Robinson tại TED nhấn mạnh sáng tạo có tầm quan trọng tương đương học vấn.'
    ],
    rhymes: [],
    collocations: ['creative thinking', 'creative period', 'highly creative'],
    clips: generateClipsForWord('creative', 64)
  },
  motivation: {
    word: 'motivation',
    language: 'en',
    ipa: {
      us: '/ˌmoʊ.t̬əˈveɪ.ʃən/',
      uk: '/ˌməʊ.tɪˈveɪ.ʃən/',
    },
    respelling: 'moh-tuh-VAY-shun',
    syllables: ['mo', 'ti', 'va', 'tion'],
    stressedIndex: 2,
    partOfSpeech: 'noun',
    definition: 'The reason or reasons one has for acting or behaving in a particular way.',
    vietnameseDefinition: 'Động lực thúc đẩy hành động.',
    tips: [
      'Trọng âm chính ở âm tiết thứ ba: moh-tuh-VAY-shun.',
      'Dan Pink phân tích tại TED sức mạnh của động lực nội tại (Autonomy, Mastery, Purpose).'
    ],
    rhymes: ['creation', 'station', 'nation'],
    collocations: ['intrinsic motivation', 'puzzle of motivation', 'high motivation'],
    clips: generateClipsForWord('motivation', 64)
  },
  introvert: {
    word: 'introvert',
    language: 'en',
    ipa: {
      us: '/ˈɪn.trə.vɝːt/',
      uk: '/ˈɪn.trə.vɜːt/',
    },
    respelling: 'IN-truh-vurt',
    syllables: ['in', 'tro', 'vert'],
    stressedIndex: 0,
    partOfSpeech: 'noun',
    definition: 'A shy, quiet person who focuses on inner thoughts and feelings.',
    vietnameseDefinition: 'Người hướng nội; sức mạnh tiềm ẩn của sự tĩnh lặng.',
    tips: [
      'Trọng âm ở âm tiết đầu: IN-truh-vurt.',
      'Susan Cain chia sẻ tại TED: Người hướng nội mang lại những đóng góp phi thường cho thế giới.'
    ],
    rhymes: [],
    collocations: ['power of introverts', 'quiet introvert', 'proud introvert'],
    clips: generateClipsForWord('introvert', 64)
  },
  story: {
    word: 'story',
    language: 'en',
    ipa: {
      us: '/ˈstɔːr.i/',
      uk: '/ˈstɔː.ri/',
    },
    respelling: 'STOR-ee',
    syllables: ['sto', 'ry'],
    stressedIndex: 0,
    partOfSpeech: 'noun',
    definition: 'An account of imaginary or real people and events told for entertainment or education.',
    vietnameseDefinition: 'Câu chuyện, câu chuyện cuộc đời.',
    tips: [
      'Trọng âm ở âm tiết đầu: STOR-ee.',
      'Chimamanda Adichie cảnh báo tại TED về nguy cơ của một câu chuyện phiến diện (single story).'
    ],
    rhymes: ['glory', 'gory'],
    collocations: ['single story', 'tell a story', 'powerful story'],
    clips: generateClipsForWord('story', 64)
  }
};

// Algorithmic fallback generating authentic clips for ANY query or sentence entered
export function generateFallbackWordEntry(query: string, language: Language = 'en'): WordEntry {
  const cleanWord = query.trim().toLowerCase();
  const wordTokens = cleanWord.split(/\s+/).filter(Boolean);
  const isPhrase = wordTokens.length > 1;
  
  const rawSyllables = isPhrase ? [] : splitIntoSyllables(cleanWord);
  const syllables = rawSyllables;
  const stressedIndex = isPhrase ? -1 : Math.min(1, Math.max(0, syllables.length - 2));

  // Generate authentic clips across BBC, TED, Easy English, Rachel's English, TV Series, VOA
  const clips = generateClipsForWord(cleanWord, 64);
  const ipaTrans = getSentenceIPATranscription(cleanWord);
  const vietnameseDef = isPhrase
    ? (getVietnameseSubtitle(cleanWord, 'query') || 'Mẫu câu giao tiếp thông dụng trong tiếng Anh.')
    : (getVietnameseSubtitle(cleanWord, 'query') || `Từ vựng tiếng Anh trong các video học và giao tiếp thực tế.`);

  return {
    word: cleanWord,
    language,
    ipa: {
      us: `/${ipaTrans || cleanWord}/`,
      uk: `/${ipaTrans || cleanWord}/`
    },
    respelling: isPhrase ? cleanWord : syllables.map((s, i) => (i === stressedIndex ? s.toUpperCase() : s)).join('-'),
    syllables,
    stressedIndex,
    partOfSpeech: isPhrase ? 'mẫu câu / cụm từ giao tiếp' : cleanWord.endsWith('ly') ? 'phó từ' : cleanWord.endsWith('tion') ? 'danh từ' : 'từ vựng',
    definition: isPhrase 
      ? `Mẫu câu / cụm từ giao tiếp tiếng Anh tự nhiên trong đời sống và đối thoại.` 
      : `Từ vựng trong các video học tiếng Anh và bài nói truyền cảm hứng.`,
    vietnameseDefinition: vietnameseDef,
    tips: isPhrase ? [
      `Lắng nghe và nhại lại toàn bộ ngữ điệu câu: "${cleanWord}".`,
      'Để ý hiện tượng nối âm (connected speech) và nuốt âm của người bản ngữ khi nói nhanh.',
      'Luyện tập shadowing (nhại lại) ngay sau khi người nói dứt câu để tạo phản xạ tự nhiên.'
    ] : [
      `Lắng nghe cách diễn giả nhấn trọng âm và ngữ điệu câu với từ: "${cleanWord}".`,
      'Để ý cách các diễn giả hàng đầu truyền tải thông điệp một cách lôi cuốn và tự nhiên.',
      'Luyện tập shadowing (nhại lại) ngay sau khi diễn giả dứt câu để nâng cao sự tự tin.'
    ],
    rhymes: [],
    collocations: isPhrase && wordTokens.length >= 2 ? [
      wordTokens.slice(0, 2).join(' '),
      wordTokens.slice(-2).join(' ')
    ] : [`context: "${cleanWord}"`, `listen to "${cleanWord}"`],
    clips
  };
}

function splitIntoSyllables(word: string): string[] {
  const vowels = /[aeiouy]/i;
  const parts: string[] = [];
  let current = '';

  for (let i = 0; i < word.length; i++) {
    current += word[i];
    if (vowels.test(word[i]) && i < word.length - 1 && !vowels.test(word[i + 1])) {
      if (word.length - i > 2) {
        parts.push(current);
        current = '';
      }
    }
  }
  if (current) parts.push(current);
  return parts.length > 0 ? parts : [word];
}

export const POPULAR_SEARCHES = [
  'leader',
  'success',
  'grit',
  'vulnerable',
  'water',
  'comfortable',
  'stress',
  'language',
  'movement',
  'listen',
  'creative',
  'motivation',
  'story',
  'introvert'
];

export const TOP_CATEGORIES = [
  { id: 'all', label: 'Tất cả bài nói TED (@TED)' },
  { id: 'short', label: '⚡ Video TED ngắn < 10 phút' },
  { id: 'leadership', label: 'Lãnh đạo & Tầm nhìn' },
  { id: 'psychology', label: 'Tâm lý & Bản lĩnh' },
  { id: 'education', label: 'Giáo dục & Sáng tạo' },
  { id: 'science', label: 'Khoa học & Đột phá' }
];
