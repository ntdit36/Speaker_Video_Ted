const { YoutubeTranscript } = require('youtube-transcript');
const fs = require('fs');

const extra = [
  { youtubeId: '31y2Bq1RYQA', title: 'The art of conversation | BBC 6 Minute English', speaker: 'BBC Learning English', channel: 'BBC Learning English', accent: 'uk', category: 'Conversation Skills', views: '1.9M views', durationSeconds: 360 },
  { youtubeId: 'sZqdYTCWSEQ', title: "Connected Speech & Linking Words | Rachel's English", speaker: 'Rachel', channel: "Rachel's English", accent: 'us', category: 'Pronunciation Mastery', views: '3.4M views', durationSeconds: 580 },
  { youtubeId: '1-U7o9xjWQc', title: 'English in a Minute: Best of friends | VOA Learning English', speaker: 'VOA Learning English', channel: 'VOA Learning English', accent: 'us', category: 'Idioms & Vocabulary', views: '850K views', durationSeconds: 65 },
  { youtubeId: 'WR9_nsLyaEY', title: "Everyday Grammar: How to use What is like | VOA Learning English", speaker: 'VOA Learning English', channel: 'VOA Learning English', accent: 'us', category: 'Grammar in Context', views: '1.1M views', durationSeconds: 140 },
  { youtubeId: '9fn_n-Lj24o', title: 'Learn English with TV Series: Everyday Small Talk', speaker: 'TV Series Characters', channel: 'Learn English With TV Series', accent: 'us', category: 'TV Series & Natural Slang', views: '2.9M views', durationSeconds: 840 },
  { youtubeId: 'xym_wAWIhM0', title: 'Easy English: Everyday Conversations & Daily Life', speaker: 'Easy English', channel: 'Easy English', accent: 'us', category: 'Daily Life Conversations', views: '1.7M views', durationSeconds: 240 }
];

async function run() {
  const allTranscripts = JSON.parse(fs.readFileSync('src/data/multiChannelTranscripts.json', 'utf8'));
  const allCatalog = JSON.parse(fs.readFileSync('src/data/multiChannelCatalog.json', 'utf8'));

  for (const item of extra) {
    try {
      console.log('Fetching', item.title, item.youtubeId);
      const cues = await YoutubeTranscript.fetchTranscript(item.youtubeId);
      if (cues && cues.length > 0) {
        allTranscripts[item.youtubeId] = cues.map(c => ({
          start: Math.round((c.offset / 1000) * 10) / 10,
          end: Math.round(((c.offset + c.duration) / 1000) * 10) / 10,
          text: c.text.replace(/\n/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim()
        }));
        allCatalog.push(item);
        console.log('  -> Success! Got', cues.length, 'cues');
      }
    } catch (e) {
      console.log('  -> Error:', e.message);
    }
  }

  fs.writeFileSync('src/data/multiChannelTranscripts.json', JSON.stringify(allTranscripts, null, 2), 'utf8');
  fs.writeFileSync('src/data/multiChannelCatalog.json', JSON.stringify(allCatalog, null, 2), 'utf8');
  console.log('Updated multiChannelTranscripts.json and multiChannelCatalog.json with total videos:', allCatalog.length);
}
run();
