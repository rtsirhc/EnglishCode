export const VOCAB_LISTS = {
  '5th': [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 
    'August', 'September', 'October', 'November', 'December', 
    'xylophone', 'drums', 'flute', 'table tennis', 'golf', 'hockey', 
    'volleyball', 'the USA', 'the UK', 'Brazil', 'Italy', 'Mexico', 
    'Japan', 'Australia', 'city', 'town', 'the countryside', 'the suburbs', 
    'games console', 'headphone', 'laptop', 'calculator', 'cell phone', 
    'tablet', 'camera', 'watchband', 'thirty', 'forty', 'fifty', 
    'sixty-four', 'seventy-two', 'eighty-six', 'ninety-nine', 'one hundred', 
    'plus', 'minus', 'times', 'divided by', 'equals', 'get up', 
    'get dressed', 'go to school', 'play with friends', 'take a shower', 
    'go to bed', 'have breakfast', 'have lunch', 'have dinner', 
    'have a snack', 'clean the bedroom', 'make the bed', 'do the laundry', 
    'cook dinner', 'wash the dishes', 'fold clothes', 'vacuum the carpet', 
    'set the table', 'walk the dog', 'water the plants', 'cut the grass', 
    'take out the trash'
  ],
  '6th': [
    'mask', 'pin', 'autograph', 'key ring', 'model', 'bracelet', 
    'comic book', 'sticker', 'colorful', 'shiny', 'plain', 'printed', 
    'drive', 'find', 'study', 'teach', 'fix', 'dig', 'break', 'carry', 
    'shout', 'whisper', 'touch', 'share', 'hot air balloon', 'truck', 
    'bus', 'van', 'taxi', 'tram', 'scooter', 'motorcycle', 'expensive', 
    'cheap', 'crowded', 'comfortable', 'boring', 'exciting', 'steep', 
    'high', 'low', 'safe', 'dangerous', 'flat', 'score', 'child', 
    'children', 'woman', 'women', 'man', 'men', 'baby', 'babies', 'boy', 
    'girl', 'person', 'people', 'teenager', 'signpost', 'flag', 'fountain', 
    'bench', 'flour', 'chocolate chips', 'eggs', 'oil', 'vanilla', 
    'honey', 'nuts', 'sugar', 'bowl', 'plate', 'spoon', 'cup'
  ]
};

// Completely randomizes the list (no restriction)
export const getRandomizedList = (grade) => {
  const list = [...VOCAB_LISTS[grade]];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
};
