import { QuestionAnswer } from '../types';

export const CURATED_QA: Record<string, QuestionAnswer[]> = {
  'how are you': [
    {
      id: 'howareyou-qa-1',
      category: 'conversation',
      question: 'How do native speakers actually reply to "How are you?" in real life?',
      vietnameseQuestion: 'Người bản xứ thực tế trả lời câu "How are you?" như thế nào?',
      answer: 'Native speakers almost never say the textbook phrase "I am fine, thank you, and you?". Instead, they reply quickly and casually: "Good, thanks! How are you?", "Pretty good! How\'re you doing?", or "Not bad, you?". It is viewed more as a friendly greeting than an in-depth medical inquiry.',
      vietnameseAnswer: 'Người bản xứ hầu như không dùng câu sách giáo khoa cũ "I am fine, thank you, and you?". Họ thường trả lời ngắn gọn, vui vẻ: "Good, thanks! How are you?", "Pretty good!", hoặc "Not bad, you?". Trong văn hóa giao tiếp tiếng Anh, đây là lời chào xã giao chứ không phải cuộc hỏi thăm chi tiết về sức khỏe.'
    },
    {
      id: 'howareyou-qa-2',
      category: 'pronunciation',
      question: 'Why does "How are you?" sound like "How-er-you" in American English?',
      vietnameseQuestion: 'Tại sao trong tiếng Anh Mỹ, "How are you?" lại nghe như "How-er-you"?',
      answer: 'In connected rapid speech, the function word "are" undergoes reduction to a weak vowel sound /ɚ/. Instead of pronouncing full /ɑːr/, speakers link "how" seamlessly into "are", producing the smooth phonetic flow "HOW-er-yoo".',
      vietnameseAnswer: 'Trong văn nói lưu loát, từ ngữ pháp "are" bị giảm âm (weak form) thành /ɚ/. Người nói nối mượt từ "how" sang "are", tạo thành âm "HOW-er-yoo" liền mạch thay vì ngắt từng chữ.'
    },
    {
      id: 'howareyou-qa-3',
      category: 'conversation',
      question: 'What is the difference between "How are you?", "How\'s it going?", and "What\'s up?"',
      vietnameseQuestion: 'Sự khác biệt giữa "How are you?", "How\'s it going?", và "What\'s up?" là gì?',
      answer: '"How are you?" is versatile and suitable for all situations (formal or casual). "How\'s it going?" is friendly and casual among acquaintances and colleagues. "What\'s up?" is informal among friends and is often answered with "Not much!" or "Just working!".',
      vietnameseAnswer: '"How are you?" trang trọng vừa phải, dùng được trong mọi hoàn cảnh. "How\'s it going?" tự nhiên, thân thiện cho bạn bè và đồng nghiệp. Còn "What\'s up?" rất thân mật, câu trả lời chuẩn thường là "Not much!" hoặc "Nothing much!".'
    }
  ],
  water: [
    {
      id: 'water-qa-1',
      category: 'pronunciation',
      question: 'Why do Americans pronounce "water" as "wah-der"?',
      vietnameseQuestion: 'Tại sao người Mỹ lại phát âm "water" nghe như "wah-der"?',
      answer: 'In American English, when the letter "t" sits between two vowel sounds, it undergoes "flapping" [ɾ]. The tip of your tongue quickly taps the alveolar ridge behind your upper teeth, producing a voiced tap that sounds like a fast, soft "d". In contrast, British speakers pronounce a crisp, unvoiced [t].',
      vietnameseAnswer: 'Trong tiếng Anh Mỹ, âm "t" đứng giữa 2 nguyên âm trở thành âm "Flap T" (vỗ lưỡi nhẹ). Đầu lưỡi chạm nhanh vào nướu răng trên, tạo âm thanh giống chữ "d" nhẹ. Trong khi đó, người Anh giữ nguyên âm [t] bật hơi sắc nét (WOH-tuh).'
    },
    {
      id: 'water-qa-2',
      category: 'conversation',
      question: 'How do you ask for water politely in a restaurant?',
      vietnameseQuestion: 'Làm thế nào để gọi nước uống lịch sự trong nhà hàng?',
      answer: 'Native speakers typically ask: "Could I please get a glass of tap water?" or "May we have a bottle of sparkling water for the table, please?". If asked "Still or sparkling?", "Still" means regular uncarbonated water.',
      vietnameseAnswer: 'Người bản xứ thường nói: "Could I please get a glass of tap water?" (Cho tôi một ly nước lọc được không?) hoặc "May we have a bottle of sparkling water?". Nếu phục vụ hỏi "Still or sparkling?", "Still" là nước lọc thường, còn "Sparkling" là nước có ga.'
    },
    {
      id: 'water-qa-3',
      category: 'idiom',
      question: 'What does the idiom "water under the bridge" mean?',
      vietnameseQuestion: 'Thành ngữ "water under the bridge" có nghĩa là gì?',
      answer: 'It refers to past events or arguments that are over and cannot be changed, so people should forgive and move on. Example: "We had our disagreements last year, but that is all water under the bridge now."',
      vietnameseAnswer: 'Nghĩa là chuyện cũ đã qua, như "nước chảy qua cầu", không đáng để bận tâm hay giận hờn nữa. Ví dụ: "Năm ngoái chúng ta có tranh cãi, nhưng giờ đó là chuyện cũ bỏ qua rồi."'
    },
    {
      id: 'water-qa-4',
      category: 'grammar',
      question: 'Is "water" countable or uncountable?',
      vietnameseQuestion: '"Water" là danh từ đếm được hay không đếm được?',
      answer: '"Water" is an uncountable noun, so we say "some water" or "a glass of water", never "a water". However, "waters" (plural) exists in specific formal senses like "international waters" (vùng biển quốc tế) or "the mineral waters of Bath".',
      vietnameseAnswer: '"Water" là danh từ không đếm được, dùng "a bottle of water" hoặc "some water". Dạng số nhiều "waters" chỉ dùng trong trường hợp đặc biệt như "international waters" (vùng biển quốc tế) hoặc "coastal waters".'
    }
  ],
  pronounce: [
    {
      id: 'pronounce-qa-1',
      category: 'pronunciation',
      question: 'How do you pronounce "pronounce" vs "pronunciation"?',
      vietnameseQuestion: 'Phát âm từ "pronounce" khác với "pronunciation" như thế nào?',
      answer: 'This is one of the most common traps in English! In the verb "pro·NOUNCE" /prəˈnaʊns/, the vowel is the diphthong /aʊ/ (like in "noun" or "out"). But in the noun "pro·NUN·ci·a·tion" /prəˌnʌn.siˈeɪ.ʃən/, the syllable changes to "-nun-" with a short vowel /ʌ/ (like in "cup" or "sun"). Never say "pro-noun-ciation"!',
      vietnameseAnswer: 'Đây là cái bẫy phổ biến nhất! Động từ là "pro-NOUNCE" (/aʊ/ giống chữ "out"). Nhưng danh từ lại đổi thành "pro-NUN-ciation" (âm ngắn /ʌ/ giống "cup"). Tuyệt đối không đọc là "pro-noun-ciation"!'
    },
    {
      id: 'pronounce-qa-2',
      category: 'conversation',
      question: 'How do you ask a native speaker how to say a word?',
      vietnameseQuestion: 'Cách hỏi người bản xứ phát âm một từ chuẩn xác?',
      answer: 'You can say: "How do you pronounce this word?" or "Could you pronounce that for me again, please?" or "Is the stress on the first or second syllable?".',
      vietnameseAnswer: 'Bạn có thể hỏi: "How do you pronounce this word?" (Từ này phát âm như thế nào?) hoặc "Could you pronounce that for me again, please?" (Bạn phát âm lại giúp tôi được không?).'
    },
    {
      id: 'pronounce-qa-3',
      category: 'conversation',
      question: 'What is the best way to improve pronunciation using shadowing?',
      vietnameseQuestion: 'Phương pháp Shadowing giúp cải thiện phát âm tốt nhất ra sao?',
      answer: 'Listen to a short 5-10 second clip, pause immediately, and repeat the sentence mimicking the native speaker\'s mouth shape, rhythm, linking words, and tone. Do it 5 times until it feels effortless.',
      vietnameseAnswer: 'Nghe 1 đoạn ngắn 5-10 giây, dừng lại ngay và nói nhại lại đúng ngữ điệu, nhịp điệu và cách nối âm của người bản xứ. Lặp lại 5 lần cho đến khi thành phản xạ tự nhiên.'
    }
  ],
  comfortable: [
    {
      id: 'comfortable-qa-1',
      category: 'pronunciation',
      question: 'How many syllables are actually pronounced in "comfortable"?',
      vietnameseQuestion: 'Từ "comfortable" thực tế được phát âm mấy âm tiết?',
      answer: 'Although spelled with 4 syllables (com-fort-a-ble), almost all native English speakers compress it into 3 syllables: "COMF-ter-bul" /ˈkʌm.fɚ.t̬ə.bəl/ or /ˈkʌm.ftə.bəl/. The letters "or" and "t" swap places in spoken English.',
      vietnameseAnswer: 'Dù viết là 4 âm tiết (com-fort-a-ble), nhưng 99% người bản xứ nuốt âm còn 3 âm tiết: "COMF-ter-bul". Trọng âm rơi mạnh vào âm đầu tiên "COMF".'
    },
    {
      id: 'comfortable-qa-2',
      category: 'conversation',
      question: 'How do you ask someone if they are comfortable?',
      vietnameseQuestion: 'Cách hỏi ai đó có thấy thoải mái, dễ chịu không?',
      answer: 'Common expressions include: "Are you comfortable with this arrangement?", "Make yourself comfortable!" (Cứ tự nhiên như ở nhà), or "Is the room temperature comfortable for you?".',
      vietnameseAnswer: 'Các mẫu câu phổ biến: "Make yourself comfortable!" (Cứ tự nhiên như ở nhà nhé!), "Are you comfortable with this?" (Bạn có thấy thoải mái với điều này không?).'
    }
  ],
  schedule: [
    {
      id: 'schedule-qa-1',
      category: 'pronunciation',
      question: 'Why does "schedule" sound like "sked-jool" in US and "shed-yool" in UK?',
      vietnameseQuestion: 'Tại sao người Mỹ đọc "SKED-jool" còn người Anh đọc "SHED-yool"?',
      answer: 'The word comes from Old French "cedule" and Latin "schedula". American lexicographer Noah Webster promoted the hard "sk-" sound based on the Greek root. British English traditionally preserved the soft "sh-" sound borrowed from French, though younger British speakers increasingly use "sk-".',
      vietnameseAnswer: 'Từ này có gốc Latinh/Hy Lạp. Người Mỹ theo cải cách của Noah Webster đọc là "SKED-jool" (âm sk). Người Anh theo truyền thống tiếng Pháp đọc là "SHED-yool" (âm sh). Cả hai cách đều được chấp nhận toàn cầu.'
    },
    {
      id: 'schedule-qa-2',
      category: 'conversation',
      question: 'How do you ask to change a meeting schedule professionally?',
      vietnameseQuestion: 'Cách hỏi dời lịch họp một cách chuyên nghiệp?',
      answer: '"Could we possibly reschedule our meeting to tomorrow afternoon?" or "Would it be convenient for you to push our schedule back by thirty minutes?".',
      vietnameseAnswer: '"Could we possibly reschedule our meeting to tomorrow afternoon?" (Chúng ta có thể dời lịch họp sang chiều mai được không?) hoặc "I have a conflict in my schedule."'
    }
  ],
  entrepreneur: [
    {
      id: 'entrepreneur-qa-1',
      category: 'pronunciation',
      question: 'Where is the primary stress in "entrepreneur"?',
      vietnameseQuestion: 'Trọng âm chính của "entrepreneur" nằm ở đâu?',
      answer: 'The primary stress is on the very last syllable: en-tre-pre-NEUR /ˌɑːn.trə.prəˈnɝː/. The first syllable is nasalized "on" (/ɑːn/), not "en".',
      vietnameseAnswer: 'Trọng âm chính rơi vào âm tiết CUỐI CÙNG: en-tre-pre-NEUR. Âm đầu đọc là "ahn" (vay mượn từ tiếng Pháp), không đọc là "en".'
    },
    {
      id: 'entrepreneur-qa-2',
      category: 'conversation',
      question: 'What is the difference between a business owner and an entrepreneur?',
      vietnameseQuestion: 'Sự khác biệt giữa chủ doanh nghiệp và một "entrepreneur"?',
      answer: 'An entrepreneur typically focuses on innovation, scaling a new business model, and taking on higher calculated financial risks compared to managing a traditional local business.',
      vietnameseAnswer: 'Doanh nhân khởi nghiệp (entrepreneur) thường tập trung vào tính đổi mới sáng tạo, mô hình kinh doanh có thể mở rộng quy mô lớn và chấp nhận rủi ro cao hơn.'
    }
  ],
  worcestershire: [
    {
      id: 'worcestershire-qa-1',
      category: 'pronunciation',
      question: 'Why is "Worcestershire" impossible to pronounce phonetically?',
      vietnameseQuestion: 'Tại sao từ "Worcestershire" lại khó phát âm theo mặt chữ như vậy?',
      answer: 'English place names group syllables historically: it is divided as "Worces-ter-shire", not "Wor-ces-ter-shire". The first syllable is simply "WUSS" (rhyming with "puss" or "wood"). The whole word is just 3 quick syllables: WUSS-ter-sheer!',
      vietnameseAnswer: 'Quy tắc ngắt âm cổ của Anh: gom lại thành "Worces-ter-shire". Âm đầu chỉ đọc là "WUSS" (như "wood"). Cả từ chỉ có 3 âm tiết: "WUSS-ter-sheer". Tuyệt đối không đọc "War-chester-shire"!'
    }
  ],
  specifically: [
    {
      id: 'specifically-qa-1',
      category: 'pronunciation',
      question: 'How many syllables are in "specifically"?',
      vietnameseQuestion: 'Từ "specifically" có bao nhiêu âm tiết và nhấn trọng âm ở đâu?',
      answer: 'It has 5 syllables: spe-CIF-i-cal-ly /spəˈsɪf.ɪ.kli/ (often reduced to 4 syllables in fast speech: spe-CIF-ik-lee). The main stress is on the second syllable "-CIF-".',
      vietnameseAnswer: 'Có 5 âm tiết theo từ điển, nhưng khi nói nhanh người bản xứ nuốt còn 4 âm: "spe-CIF-ik-lee". Trọng âm rơi vào âm thứ hai "-CIF-".'
    },
    {
      id: 'specifically-qa-2',
      category: 'conversation',
      question: 'How do you use "specifically" to clarify a point in meetings?',
      vietnameseQuestion: 'Cách dùng "specifically" để làm rõ ý trong cuộc họp hoặc thuyết trình?',
      answer: '"Specifically, what metrics are we tracking this quarter?" or "I am referring specifically to the feedback from the mobile users."',
      vietnameseAnswer: 'Mẫu câu chuyên nghiệp: "Specifically, what metrics are we tracking?" (Cụ thể thì chúng ta đang theo dõi chỉ số nào?) hoặc "I am referring specifically to..." (Tôi muốn đề cập cụ thể đến...).'
    }
  ],
  definitely: [
    {
      id: 'definitely-qa-1',
      category: 'pronunciation',
      question: 'How do you pronounce "definitely" naturally without stumbling?',
      vietnameseQuestion: 'Cách phát âm "definitely" tự nhiên mà không bị vấp?',
      answer: 'Pronounce it as 4 quick syllables: DEF-in-it-lee /ˈdef.ən.ət.li/. Notice the stress is strongly on the first syllable "DEF", and the middle vowels reduce to schwas (/ə/). Do not pronounce "defi-NIGHT-ly"!',
      vietnameseAnswer: 'Nhấn mạnh vào âm đầu "DEF": "DEF-in-it-lee". Các âm giữa đọc lướt thành âm schwa nhẹ. Tuyệt đối không đọc nhầm thành "-night-ly".'
    },
    {
      id: 'definitely-qa-2',
      category: 'conversation',
      question: 'What are common ways to answer "Definitely!" in casual conversations?',
      vietnameseQuestion: 'Khi nào dùng "Definitely" để đồng tình trong hội thoại thường ngày?',
      answer: '"Definitely!" is an enthusiastic agreement equivalent to "100% yes!" or "Without a doubt!". Example: "Are you coming to the dinner tonight?" - "Definitely! Wouldn\'t miss it for the world."',
      vietnameseAnswer: '"Definitely!" dùng để đồng ý nhiệt tình (hoàn toàn chắc chắn 100%). Ví dụ: "Tối nay bạn đến ăn tối chứ?" - "Definitely! Chắc chắn rồi!".'
    }
  ],
  opportunity: [
    {
      id: 'opportunity-qa-1',
      category: 'pronunciation',
      question: 'How is "opportunity" pronounced in US vs UK English?',
      vietnameseQuestion: 'Cách phát âm "opportunity" trong tiếng Anh Mỹ khác tiếng Anh Anh thế nào?',
      answer: 'In US English, the "tu" is pronounced without a "y" glide: /ˌɑː.pɚˈtuː.nə.t̬i/ (ah-per-TOO-nuh-dee with Flap T). In British English, a "yod" glide is added: /ˌɒp.əˈtjuː.nə.ti/ (op-uh-TYOO-nuh-tee with a crisp T).',
      vietnameseAnswer: 'Người Mỹ đọc "ah-per-TOO-nuh-dee" (không có âm /j/ và biến T thành Flap T). Người Anh đọc "op-uh-TYOO-nuh-tee" (có âm /ju:/ và giữ T bật hơi rõ ràng).'
    },
    {
      id: 'opportunity-qa-2',
      category: 'conversation',
      question: 'How do you express gratitude for an opportunity in an email or interview?',
      vietnameseQuestion: 'Cách viết câu cảm ơn về một cơ hội trong thư xin việc hoặc phỏng vấn?',
      answer: '"Thank you so much for this incredible opportunity to contribute to your team." or "I really appreciate the opportunity to discuss my qualifications with you today."',
      vietnameseAnswer: '"Thank you for this opportunity to interview with your team." (Cảm ơn quý công ty đã cho tôi cơ hội phỏng vấn hôm nay).'
    }
  ]
};

// Algorithmic dynamic Q&A generator for any custom search query
export function generateQAForWord(word: string, language: string = 'en'): QuestionAnswer[] {
  const clean = word.trim().toLowerCase();
  
  if (CURATED_QA[clean]) {
    return CURATED_QA[clean];
  }

  const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);

  return [
    {
      id: `qa-${clean}-1`,
      category: 'pronunciation',
      question: `How do native speakers naturally pronounce "${clean}" in connected speech?`,
      vietnameseQuestion: `Người bản xứ phát âm từ "${clean}" như thế nào trong câu nói giao tiếp thực tế?`,
      answer: `When pronouncing "${clean}", pay attention to the primary stressed syllable. Native speakers link the ending sound of "${clean}" smoothly with the initial vowel of the following word, avoiding pauses between words.`,
      vietnameseAnswer: `Khi phát âm "${clean}", hãy chú ý nhấn đúng trọng âm chính. Người bản xứ thường nối âm cuối của "${clean}" với nguyên âm đầu của từ tiếp theo một cách mượt mà mà không khựng lại.`
    },
    {
      id: `qa-${clean}-2`,
      category: 'conversation',
      question: `Can you give an everyday conversational dialogue using "${clean}"?`,
      vietnameseQuestion: `Mẫu câu hỏi và trả lời đối thoại giao tiếp hàng ngày sử dụng "${clean}"?`,
      answer: `Q: "How do you usually handle ${clean} when working under tight deadlines?"\nA: "I prioritize the core requirements first, and then address ${clean} step-by-step with the team."`,
      vietnameseAnswer: `Hỏi: "How do you handle ${clean}?" (Bạn xử lý ${clean} như thế nào?)\nTrả lời: "I prioritize the key requirements first and address ${clean} step by step." (Tôi ưu tiên phần quan trọng trước rồi xử lý ${clean} từng bước một.)`
    },
    {
      id: `qa-${clean}-3`,
      category: 'grammar',
      question: `What are the most common collocations and phrases paired with "${clean}"?`,
      vietnameseQuestion: `Những cụm từ và từ đi kèm (collocations) phổ biến nhất với "${clean}" là gì?`,
      answer: `Depending on context, "${clean}" frequently pairs with verbs like "understand ${clean}", "focus on ${clean}", "develop ${clean}", or adjectives like "essential ${clean}", "primary ${clean}", "effective ${clean}".`,
      vietnameseAnswer: `Tùy vào ngữ cảnh, "${clean}" thường đi kèm với các động từ như "understand", "focus on", "practice" hoặc tính từ như "essential", "effective", "important".`
    },
    {
      id: `qa-${clean}-4`,
      category: 'conversation',
      question: `What common pronunciation mistake do English learners make with "${clean}"?`,
      vietnameseQuestion: `Người học thường mắc lỗi phát âm phổ biến nào nhất với từ "${clean}"?`,
      answer: `The two most common pitfalls are: 1) Placing the word stress on the wrong syllable, and 2) Pronouncing silent letters or failing to reduce unstressed vowels to the schwa /ə/ sound.`,
      vietnameseAnswer: `Hai lỗi phổ biến nhất: 1) Đặt sai trọng âm từ khiến người nghe khó nhận diện, và 2) Phát âm quá rõ các nguyên âm không nhấn thay vì lướt nhẹ thành âm schwa /ə/.`
    },
    {
      id: `qa-${clean}-5`,
      category: 'conversation',
      question: `How can I practice speaking "${clean}" with accurate rhythm and tone?`,
      vietnameseQuestion: `Làm sao để luyện phát âm "${clean}" với ngữ điệu chuẩn tự nhiên?`,
      answer: `Listen to the sentence in the YouTube clip above at 0.75x speed. Observe how the native speaker raises or lowers pitch on "${clean}", then replay the sentence to repeat aloud and match their melody.`,
      vietnameseAnswer: `Hãy chỉnh tốc độ phát xuống 0.75x để nghe rõ cao độ lên xuống của từ "${clean}", sau đó bật lặp lại câu để nói theo và bắt chước ngữ điệu chuẩn xác.`
    }
  ];
}
