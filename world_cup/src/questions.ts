export type ButtonKey = 'A' | 'B' | 'X' | 'Y';

export type Question = {
  prompt: string;
  answers: Record<ButtonKey, string>;
  correct: ButtonKey;
};

export const WORLD_CUP_QUESTIONS: Question[] = [
  {
    prompt: 'What sport is played in the World Cup?',
    answers: {
      A: 'Baseball',
      B: 'Tennis',
      X: 'Soccer',
      Y: 'Basketball',
    },
    correct: 'X',
  },
  {
    prompt: 'How many players are on one team on the soccer field?',
    answers: {
      A: '9',
      B: '10',
      X: '11',
      Y: '12',
    },
    correct: 'X',
  },
  {
    prompt: 'How often does the World Cup happen?',
    answers: {
      A: 'Every year',
      B: 'Every 2 years',
      X: 'Every 3 years',
      Y: 'Every 4 years',
    },
    correct: 'Y',
  },
  {
    prompt: 'Who is the only player that can touch the ball with their hands?',
    answers: {
      A: 'The coach',
      B: 'The referee',
      X: 'The goalkeeper',
      Y: 'The captain',
    },
    correct: 'X',
  },
  {
    prompt: 'What does the referee blow to stop the game?',
    answers: {
      A: 'A whistle',
      B: 'A trumpet',
      X: 'A drum',
      Y: 'A flute',
    },
    correct: 'A',
  },
  {
    prompt: 'What happens if a player gets a red card?',
    answers: {
      A: 'They get a point',
      B: 'They leave the game',
      X: 'They say sorry',
      Y: 'They change shoes',
    },
    correct: 'B',
  },
  {
    prompt: 'What country does Lionel Messi play for?',
    answers: {
      A: 'Brazil',
      B: 'Spain',
      X: 'Argentina',
      Y: 'France',
    },
    correct: 'X',
  },
  {
    prompt: 'What shape is a soccer ball?',
    answers: {
      A: 'Square',
      B: 'Triangle',
      X: 'Round',
      Y: 'Oval',
    },
    correct: 'X',
  },
  {
    prompt: 'What color is the jersey of the Mexico National Team?',
    answers: {
      A: 'Blue',
      B: 'Red',
      X: 'Green',
      Y: 'White',
    },
    correct: 'X',
  },
  {
    prompt: 'What is a "goal"?',
    answers: {
      A: 'When a player sleeps',
      B: 'When the ball goes in the net',
      X: 'When a player runs fast',
      Y: 'When the game stops',
    },
    correct: 'B',
  },
  {
    prompt: 'What does a yellow card mean?',
    answers: {
      A: 'Good job',
      B: 'A warning',
      X: 'Game over',
      Y: 'Free goal',
    },
    correct: 'B',
  },
  {
    prompt: 'What language do players from Brazil speak?',
    answers: {
      A: 'Spanish',
      B: 'Portuguese',
      X: 'English',
      Y: 'French',
    },
    correct: 'B',
  },
  {
    prompt: 'How long is a normal soccer match?',
    answers: {
      A: '60 minutes',
      B: '90 minutes',
      X: '100 minutes',
      Y: '120 minutes',
    },
    correct: 'B',
  },
  {
    prompt: 'What do players wear on their feet?',
    answers: {
      A: 'Sandals',
      B: 'Cleats',
      X: 'Slippers',
      Y: 'Heels',
    },
    correct: 'B',
  },
  {
    prompt: 'Who is the famous player from Portugal with the number 7?',
    answers: {
      A: 'Messi',
      B: 'Neymar',
      X: 'Ronaldo',
      Y: 'Mbappe',
    },
    correct: 'X',
  },
  {
    prompt: 'Where is the World Cup trophy kept when a team wins?',
    answers: {
      A: 'They give it back',
      B: 'They take it home',
      X: 'They throw it away',
      Y: 'They hide it',
    },
    correct: 'B',
  },
  {
    prompt: 'What is a "Penalty Kick"?',
    answers: {
      A: 'A free shot at the goal',
      B: 'A type of dance',
      X: 'A red card',
      Y: 'When the game starts',
    },
    correct: 'A',
  },
  {
    prompt: 'What part of the body can players NOT use?',
    answers: {
      A: 'Head',
      B: 'Chest',
      X: 'Hands and Arms',
      Y: 'Feet',
    },
    correct: 'X',
  },
  {
    prompt: 'What do the fans shout when their team scores?',
    answers: {
      A: 'Stop!',
      B: 'Goal!',
      X: 'Foul!',
      Y: 'Hello!',
    },
    correct: 'B',
  },
  {
    prompt: 'Which country won the World Cup in 2022?',
    answers: {
      A: 'France',
      B: 'Argentina',
      X: 'Brazil',
      Y: 'Mexico',
    },
    correct: 'B',
  },
  {
    prompt: 'What does "VAR" help the referee with?',
    answers: {
      A: 'Selling tickets',
      B: 'Watching video replays',
      X: 'Washing uniforms',
      Y: 'Singing songs',
    },
    correct: 'B',
  },
  {
    prompt: 'How many halves are in a soccer match?',
    answers: {
      A: '1',
      B: '2',
      X: '3',
      Y: '4',
    },
    correct: 'B',
  },
  {
    prompt: 'Who wears a different color jersey on the field?',
    answers: {
      A: 'The coach',
      B: 'The goalkeeper',
      X: 'The fastest player',
      Y: 'The fans',
    },
    correct: 'B',
  },
  {
    prompt: 'What is a "foul" in soccer?',
    answers: {
      A: 'A great pass',
      B: 'A rule broken by a player',
      X: 'A type of kick',
      Y: 'A new ball',
    },
    correct: 'B',
  },
  {
    prompt: 'What color are the cards the referee uses?',
    answers: {
      A: 'Blue and White',
      B: 'Red and Yellow',
      X: 'Black and White',
      Y: 'Green and Orange',
    },
    correct: 'B',
  },
  {
    prompt: 'Which country has won the most World Cups?',
    answers: {
      A: 'Germany',
      B: 'Italy',
      X: 'Brazil',
      Y: 'Argentina',
    },
    correct: 'X',
  },
  {
    prompt: 'What is "Extra Time"?',
    answers: {
      A: 'More time to eat',
      B: 'Added time at the end of the game',
      X: 'Time to change shoes',
      Y: 'When the game starts early',
    },
    correct: 'B',
  },
  {
    prompt: 'What part of the foot is best for passing the ball?',
    answers: {
      A: 'The inside',
      B: 'The heel',
      X: 'The toes',
      Y: 'The ankle',
    },
    correct: 'A',
  },
  {
    prompt: 'Who tries to stop the ball from going in the net?',
    answers: {
      A: 'The Striker',
      B: 'The Referee',
      X: 'The Goalkeeper',
      Y: 'The Coach',
    },
    correct: 'X',
  },
  {
    prompt: 'What happens when a game is tied in a final match?',
    answers: {
      A: 'Both teams win',
      B: 'They play a penalty shootout',
      X: 'The referee decides the winner',
      Y: 'They stop playing',
    },
    correct: 'B',
  },
  {
    prompt: 'What do we call a player who scores a lot of goals?',
    answers: {
      A: 'A defender',
      B: 'A striker',
      X: 'A goalkeeper',
      Y: 'A referee',
    },
    correct: 'B',
  },
  {
    prompt: 'Where was the 2014 World Cup played?',
    answers: {
      A: 'Brazil',
      B: 'Russia',
      X: 'Qatar',
      Y: 'South Africa',
    },
    correct: 'A',
  },
  {
    prompt: 'What is a "corner kick"?',
    answers: {
      A: 'A kick from the corner of the field',
      B: 'A kick in the middle of the field',
      X: 'A kick from the goalkeeper',
      Y: 'A penalty kick',
    },
    correct: 'A',
  },
  {
    prompt: 'What do players trade after a World Cup match?',
    answers: {
      A: 'Shoes',
      B: 'Socks',
      X: 'Jerseys',
      Y: 'Water bottles',
    },
    correct: 'X',
  },
  {
    prompt: 'What does a coach do?',
    answers: {
      A: 'Plays on the field',
      B: 'Sells tickets',
      X: 'Teaches and leads the team',
      Y: 'Washes the ball',
    },
    correct: 'X',
  },
  {
    prompt: 'How many times has Mexico won the World Cup?',
    answers: {
      A: '0',
      B: '1',
      X: '2',
      Y: '3',
    },
    correct: 'A',
  },
  {
    prompt: 'Who is known as "Pelé"?',
    answers: {
      A: 'A famous referee',
      B: 'A famous Brazilian player',
      X: 'A famous coach',
      Y: 'A famous goalkeeper',
    },
    correct: 'B',
  },
  {
    prompt: 'What is "offside"?',
    answers: {
      A: 'A goal',
      B: 'When a player is too far forward',
      X: 'When a player leaves the field',
      Y: 'When the game is over',
    },
    correct: 'B',
  },
  {
    prompt: 'What is a "hat-trick"?',
    answers: {
      A: 'When a player wears a hat',
      B: 'When a player scores 3 goals in one game',
      X: 'When the goalkeeper catches the ball',
      Y: 'When a fan runs on the field',
    },
    correct: 'B',
  },
  {
    prompt: 'What do players do during halftime?',
    answers: {
      A: 'Go home',
      B: 'Rest and talk to the coach',
      X: 'Play another sport',
      Y: 'Eat a big dinner',
    },
    correct: 'B',
  },
  {
    prompt: 'What color card means you have to leave the game?',
    answers: {
      A: 'Green',
      B: 'Yellow',
      X: 'Red',
      Y: 'Blue',
    },
    correct: 'X',
  },
  {
    prompt: 'What is it called when a player passes the ball to help score a goal?',
    answers: {
      A: 'An assist',
      B: 'A save',
      X: 'A foul',
      Y: 'A tackle',
    },
    correct: 'A',
  },
  {
    prompt: 'Which continent has never won a World Cup?',
    answers: {
      A: 'Europe',
      B: 'South America',
      X: 'Africa',
      Y: 'All of the above',
    },
    correct: 'X',
  },
  {
    prompt: 'What is the "Golden Boot" award?',
    answers: {
      A: 'Award for the best goalkeeper',
      B: 'Award for the most goals scored',
      X: 'Award for the best coach',
      Y: 'Award for the loudest fans',
    },
    correct: 'B',
  },
  {
    prompt: 'How many main referees are on the field during the game?',
    answers: {
      A: '1',
      B: '2',
      X: '3',
      Y: '4',
    },
    correct: 'A',
  },
  {
    prompt: 'What is a "clean sheet"?',
    answers: {
      A: 'A new uniform',
      B: 'When a team allows zero goals',
      X: 'When the field is perfectly green',
      Y: 'A fresh towel for the players',
    },
    correct: 'B',
  },
  {
    prompt: 'What do fans sometimes do to make noise?',
    answers: {
      A: 'Sleep',
      B: 'Read books',
      X: 'Blow horns or sing',
      Y: 'Turn off the lights',
    },
    correct: 'X',
  },
  {
    prompt: 'What happens if a player gets two yellow cards in one game?',
    answers: {
      A: 'They get a red card',
      B: 'They get a green card',
      X: 'They get a point',
      Y: 'Nothing happens',
    },
    correct: 'A',
  },
  {
    prompt: 'Where is the 2026 World Cup going to be played?',
    answers: {
      A: 'Brazil',
      B: 'USA, Mexico, and Canada',
      X: 'France',
      Y: 'Japan',
    },
    correct: 'B',
  },
  {
    prompt: 'What do you call the team that plays against your team?',
    answers: {
      A: 'The opponent',
      B: 'The referee',
      X: 'The coach',
      Y: 'The fans',
    },
    correct: 'A',
  }
];

export const ENGLISH_TRIVIA_QUESTIONS: Question[] = [
  {
    prompt: 'She ___ a student in the 5th grade.',
    answers: {
      A: 'am',
      B: 'is',
      X: 'are',
      Y: 'be',
    },
    correct: 'B',
  },
  {
    prompt: 'What color do you get when you mix blue and yellow?',
    answers: {
      A: 'Green',
      B: 'Red',
      X: 'Purple',
      Y: 'Black',
    },
    correct: 'A',
  },
  {
    prompt: 'I ___ an apple every morning.',
    answers: {
      A: 'eats',
      B: 'eating',
      X: 'eat',
      Y: 'is eat',
    },
    correct: 'X',
  },
  {
    prompt: 'Which animal is very tall and has a long neck?',
    answers: {
      A: 'Dog',
      B: 'Giraffe',
      X: 'Elephant',
      Y: 'Monkey',
    },
    correct: 'B',
  },
  {
    prompt: 'They ___ playing a fun game right now.',
    answers: {
      A: 'is',
      B: 'are',
      X: 'am',
      Y: 'do',
    },
    correct: 'B',
  },
  {
    prompt: 'What is the capital city of Mexico?',
    answers: {
      A: 'Cancun',
      B: 'Monterrey',
      X: 'Mexico City',
      Y: 'Guadalajara',
    },
    correct: 'X',
  },
  {
    prompt: 'Choose the correct plural: One child, two ___.',
    answers: {
      A: 'childs',
      B: 'children',
      X: 'childrens',
      Y: 'childes',
    },
    correct: 'B',
  },
  {
    prompt: 'Which planet do we live on?',
    answers: {
      A: 'Mars',
      B: 'Venus',
      X: 'Earth',
      Y: 'Jupiter',
    },
    correct: 'X',
  },
  {
    prompt: 'My dog ___ to run in the park.',
    answers: {
      A: 'likes',
      B: 'like',
      X: 'liking',
      Y: 'is like',
    },
    correct: 'A',
  },
  {
    prompt: 'Which animal says "moo" and gives us milk?',
    answers: {
      A: 'Pig',
      B: 'Horse',
      X: 'Sheep',
      Y: 'Cow',
    },
    correct: 'Y',
  },
  {
    prompt: 'He ___ not want to clean his room.',
    answers: {
      A: 'do',
      B: 'is',
      X: 'does',
      Y: 'has',
    },
    correct: 'X',
  },
  {
    prompt: 'How many days are in one week?',
    answers: {
      A: '5',
      B: '6',
      X: '7',
      Y: '8',
    },
    correct: 'X',
  },
  {
    prompt: 'The cat is hiding ___ the table.',
    answers: {
      A: 'under',
      B: 'up',
      X: 'to',
      Y: 'for',
    },
    correct: 'A',
  },
  {
    prompt: 'Which month comes after October?',
    answers: {
      A: 'September',
      B: 'November',
      X: 'December',
      Y: 'August',
    },
    correct: 'B',
  },
  {
    prompt: 'I have two ___. One for each foot.',
    answers: {
      A: 'shoe',
      B: 'shoes',
      X: 'shoos',
      Y: 'shooes',
    },
    correct: 'B',
  },
  {
    prompt: 'What is the opposite of "hot"?',
    answers: {
      A: 'Warm',
      B: 'Cold',
      X: 'Big',
      Y: 'Fast',
    },
    correct: 'B',
  },
  {
    prompt: 'What ___ your name?',
    answers: {
      A: 'are',
      B: 'is',
      X: 'am',
      Y: 'does',
    },
    correct: 'B',
  },
  {
    prompt: 'Which of these is a fruit?',
    answers: {
      A: 'Carrot',
      B: 'Potato',
      X: 'Apple',
      Y: 'Chicken',
    },
    correct: 'X',
  },
  {
    prompt: 'We ___ to school by bus every day.',
    answers: {
      A: 'go',
      B: 'goes',
      X: 'going',
      Y: 'is go',
    },
    correct: 'A',
  },
  {
    prompt: 'How many hours are in one day?',
    answers: {
      A: '12',
      B: '20',
      X: '24',
      Y: '60',
    },
    correct: 'X',
  },
  {
    prompt: '___ you like to play video games?',
    answers: {
      A: 'Are',
      B: 'Do',
      X: 'Does',
      Y: 'Is',
    },
    correct: 'B',
  },
  {
    prompt: 'Which season is very cold and has snow in some places?',
    answers: {
      A: 'Summer',
      B: 'Spring',
      X: 'Winter',
      Y: 'Autumn',
    },
    correct: 'X',
  },
  {
    prompt: 'Look at ___ big bird in the sky!',
    answers: {
      A: 'this',
      B: 'that',
      X: 'these',
      Y: 'those',
    },
    correct: 'B',
  },
  {
    prompt: 'What is the biggest ocean in the world?',
    answers: {
      A: 'Atlantic Ocean',
      B: 'Indian Ocean',
      X: 'Pacific Ocean',
      Y: 'Arctic Ocean',
    },
    correct: 'X',
  },
  {
    prompt: 'My mom ___ cooking dinner in the kitchen.',
    answers: {
      A: 'am',
      B: 'is',
      X: 'are',
      Y: 'be',
    },
    correct: 'B',
  },
  {
    prompt: 'Which insect makes honey?',
    answers: {
      A: 'Spider',
      B: 'Ant',
      X: 'Fly',
      Y: 'Bee',
    },
    correct: 'Y',
  },
  {
    prompt: 'Can you ___ me the pencil, please?',
    answers: {
      A: 'pass',
      B: 'passes',
      X: 'passing',
      Y: 'is pass',
    },
    correct: 'A',
  },
  {
    prompt: 'What do we use to see things?',
    answers: {
      A: 'Ears',
      B: 'Nose',
      X: 'Eyes',
      Y: 'Mouth',
    },
    correct: 'X',
  },
  {
    prompt: 'She has a brother. ___ name is Tom.',
    answers: {
      A: 'His',
      B: 'Her',
      X: 'My',
      Y: 'Their',
    },
    correct: 'A',
  },
  {
    prompt: 'What do you use an umbrella for?',
    answers: {
      A: 'To eat',
      B: 'To stay dry',
      X: 'To drive',
      Y: 'To sleep',
    },
    correct: 'B',
  },
  {
    prompt: 'They are my friends. I like ___ very much.',
    answers: {
      A: 'they',
      B: 'them',
      X: 'their',
      Y: 'theirs',
    },
    correct: 'B',
  },
  {
    prompt: 'Which direction is the opposite of North?',
    answers: {
      A: 'East',
      B: 'West',
      X: 'South',
      Y: 'Up',
    },
    correct: 'X',
  },
  {
    prompt: 'Choose the correct word: There is ___ milk in the fridge.',
    answers: {
      A: 'some',
      B: 'any',
      X: 'a',
      Y: 'an',
    },
    correct: 'A',
  },
  {
    prompt: 'Which animal is the "King of the Jungle"?',
    answers: {
      A: 'Bear',
      B: 'Tiger',
      X: 'Lion',
      Y: 'Monkey',
    },
    correct: 'X',
  },
  {
    prompt: 'The book is ___ the desk.',
    answers: {
      A: 'in',
      B: 'on',
      X: 'at',
      Y: 'with',
    },
    correct: 'B',
  },
  {
    prompt: 'Which vehicle travels in the air?',
    answers: {
      A: 'Car',
      B: 'Train',
      X: 'Boat',
      Y: 'Airplane',
    },
    correct: 'Y',
  },
  {
    prompt: 'I ___ got a new bicycle.',
    answers: {
      A: 'has',
      B: 'have',
      X: 'am',
      Y: 'is',
    },
    correct: 'B',
  },
  {
    prompt: 'What do we breathe?',
    answers: {
      A: 'Water',
      B: 'Fire',
      X: 'Air',
      Y: 'Dirt',
    },
    correct: 'X',
  },
  {
    prompt: 'There are five ___ in the room.',
    answers: {
      A: 'person',
      B: 'peoples',
      X: 'people',
      Y: 'persons',
    },
    correct: 'X',
  },
  {
    prompt: 'What is the fastest land animal?',
    answers: {
      A: 'Horse',
      B: 'Cheetah',
      X: 'Lion',
      Y: 'Dog',
    },
    correct: 'B',
  },
  {
    prompt: 'Please turn ___ the light. It is dark.',
    answers: {
      A: 'on',
      B: 'off',
      X: 'up',
      Y: 'down',
    },
    correct: 'A',
  },
  {
    prompt: 'Which of these is a vegetable?',
    answers: {
      A: 'Banana',
      B: 'Strawberry',
      X: 'Broccoli',
      Y: 'Orange',
    },
    correct: 'X',
  },
  {
    prompt: 'She is wearing a beautiful pink ___.',
    answers: {
      A: 'dress',
      B: 'pants',
      X: 'shoes',
      Y: 'glasses',
    },
    correct: 'A',
  },
  {
    prompt: 'What gives us light and heat during the day?',
    answers: {
      A: 'The Moon',
      B: 'The Stars',
      X: 'The Sun',
      Y: 'The Clouds',
    },
    correct: 'X',
  },
  {
    prompt: '___ is your favorite teacher?',
    answers: {
      A: 'Who',
      B: 'What',
      X: 'When',
      Y: 'Where',
    },
    correct: 'A',
  },
  {
    prompt: 'Which shape has three sides?',
    answers: {
      A: 'Circle',
      B: 'Square',
      X: 'Rectangle',
      Y: 'Triangle',
    },
    correct: 'Y',
  },
  {
    prompt: 'I want ___ go to the park.',
    answers: {
      A: 'to',
      B: 'too',
      X: 'two',
      Y: 'at',
    },
    correct: 'A',
  },
  {
    prompt: 'Which room do you sleep in?',
    answers: {
      A: 'Kitchen',
      B: 'Bathroom',
      X: 'Bedroom',
      Y: 'Living Room',
    },
    correct: 'X',
  },
  {
    prompt: 'He ___ always very happy.',
    answers: {
      A: 'are',
      B: 'is',
      X: 'am',
      Y: 'be',
    },
    correct: 'B',
  },
  {
    prompt: 'What is the color of an emerald?',
    answers: {
      A: 'Blue',
      B: 'Red',
      X: 'Yellow',
      Y: 'Green',
    },
    correct: 'Y',
  },
  {
    prompt: 'We ___ eating dinner at 7 PM.',
    answers: {
      A: 'will',
      B: 'are',
      X: 'do',
      Y: 'am',
    },
    correct: 'B',
  },
  {
    prompt: 'Which animal lives in the water and has fins?',
    answers: {
      A: 'Bird',
      B: 'Cat',
      X: 'Fish',
      Y: 'Dog',
    },
    correct: 'X',
  },
  {
    prompt: 'My sister is older ___ me.',
    answers: {
      A: 'then',
      B: 'that',
      X: 'than',
      Y: 'this',
    },
    correct: 'X',
  },
  {
    prompt: 'What do we use to cut paper?',
    answers: {
      A: 'Pencil',
      B: 'Scissors',
      X: 'Eraser',
      Y: 'Glue',
    },
    correct: 'B',
  },
  {
    prompt: 'The dog is sleeping ___ the bed.',
    answers: {
      A: 'on',
      B: 'at',
      X: 'to',
      Y: 'with',
    },
    correct: 'A',
  },
  {
    prompt: 'What are the colors of the Mexican flag?',
    answers: {
      A: 'Red, White, and Blue',
      B: 'Green, White, and Red',
      X: 'Yellow, Blue, and Red',
      Y: 'Black, Red, and Yellow',
    },
    correct: 'B',
  },
  {
    prompt: '___ is your birthday?',
    answers: {
      A: 'Where',
      B: 'Who',
      X: 'When',
      Y: 'What',
    },
    correct: 'X',
  },
  {
    prompt: 'What do we call water when it gets very hot?',
    answers: {
      A: 'Ice',
      B: 'Snow',
      X: 'Steam',
      Y: 'Rain',
    },
    correct: 'X',
  },
  {
    prompt: 'I don’t have ___ money in my pocket.',
    answers: {
      A: 'some',
      B: 'any',
      X: 'many',
      Y: 'a',
    },
    correct: 'B',
  },
  {
    prompt: 'Which fruit is yellow and curved?',
    answers: {
      A: 'Apple',
      B: 'Orange',
      X: 'Banana',
      Y: 'Grape',
    },
    correct: 'X',
  },
  {
    prompt: 'Can you swim? Yes, I ___.',
    answers: {
      A: 'do',
      B: 'am',
      X: 'can',
      Y: 'will',
    },
    correct: 'X',
  },
  {
    prompt: 'What freezes and turns into ice?',
    answers: {
      A: 'Juice',
      B: 'Milk',
      X: 'Water',
      Y: 'Soda',
    },
    correct: 'X',
  },
  {
    prompt: 'He is the ___ student in the class.',
    answers: {
      A: 'tall',
      B: 'taller',
      X: 'tallest',
      Y: 'more tall',
    },
    correct: 'X',
  },
  {
    prompt: 'What do we call the baby of a dog?',
    answers: {
      A: 'Kitten',
      B: 'Puppy',
      X: 'Cub',
      Y: 'Calf',
    },
    correct: 'B',
  },
  {
    prompt: '___ are you crying?',
    answers: {
      A: 'Why',
      B: 'Who',
      X: 'Where',
      Y: 'What',
    },
    correct: 'A',
  },
  {
    prompt: 'Which shape is perfectly round?',
    answers: {
      A: 'Square',
      B: 'Triangle',
      X: 'Rectangle',
      Y: 'Circle',
    },
    correct: 'Y',
  },
  {
    prompt: 'The birds ___ flying in the sky.',
    answers: {
      A: 'is',
      B: 'am',
      X: 'are',
      Y: 'be',
    },
    correct: 'X',
  },
  {
    prompt: 'What sweet food is made from cocoa beans?',
    answers: {
      A: 'Bread',
      B: 'Candy',
      X: 'Chocolate',
      Y: 'Ice cream',
    },
    correct: 'X',
  },
  {
    prompt: 'She ___ breakfast at 7:00 AM every day.',
    answers: {
      A: 'has',
      B: 'have',
      X: 'having',
      Y: 'is have',
    },
    correct: 'A',
  },
  {
    prompt: 'What is the opposite of "fast"?',
    answers: {
      A: 'Quick',
      B: 'Slow',
      X: 'Heavy',
      Y: 'Loud',
    },
    correct: 'B',
  },
  {
    prompt: 'I am going to the store ___ buy milk.',
    answers: {
      A: 'for',
      B: 'to',
      X: 'at',
      Y: 'in',
    },
    correct: 'B',
  },
  {
    prompt: 'What do you use to brush your teeth?',
    answers: {
      A: 'A hairbrush',
      B: 'A toothbrush',
      X: 'A sponge',
      Y: 'A towel',
    },
    correct: 'B',
  },
  {
    prompt: 'We ___ having a great time at the party right now.',
    answers: {
      A: 'have',
      B: 'having',
      X: 'are',
      Y: 'is',
    },
    correct: 'X',
  },
  {
    prompt: 'Which country is shaped like a boot and loves soccer?',
    answers: {
      A: 'Spain',
      B: 'France',
      X: 'Italy',
      Y: 'England',
    },
    correct: 'X',
  },
  {
    prompt: 'Please write your name ___ the paper.',
    answers: {
      A: 'on',
      B: 'in',
      X: 'at',
      Y: 'under',
    },
    correct: 'A',
  },
  {
    prompt: 'Which animal hops and has a pouch?',
    answers: {
      A: 'Rabbit',
      B: 'Frog',
      X: 'Kangaroo',
      Y: 'Monkey',
    },
    correct: 'X',
  },
  {
    prompt: 'My brother ___ like to eat vegetables.',
    answers: {
      A: 'don\'t',
      B: 'doesn\'t',
      X: 'isn\'t',
      Y: 'aren\'t',
    },
    correct: 'B',
  },
  {
    prompt: 'What do we call the days Saturday and Sunday?',
    answers: {
      A: 'School days',
      B: 'The weekend',
      X: 'The month',
      Y: 'The year',
    },
    correct: 'B',
  },
  {
    prompt: '___ you open the window, please?',
    answers: {
      A: 'Are',
      B: 'Do',
      X: 'Can',
      Y: 'Is',
    },
    correct: 'X',
  },
  {
    prompt: 'Which of these is a hot drink?',
    answers: {
      A: 'Ice water',
      B: 'Lemonade',
      X: 'Coffee',
      Y: 'Soda',
    },
    correct: 'X',
  },
  {
    prompt: 'The apples are ___ the basket.',
    answers: {
      A: 'in',
      B: 'on',
      X: 'next',
      Y: 'under',
    },
    correct: 'A',
  },
  {
    prompt: 'Which bird can fly?',
    answers: {
      A: 'Penguin',
      B: 'Ostrich',
      X: 'Eagle',
      Y: 'Kiwi',
    },
    correct: 'X',
  },
  {
    prompt: 'I always ___ my hands before I eat.',
    answers: {
      A: 'wash',
      B: 'washes',
      X: 'washing',
      Y: 'is wash',
    },
    correct: 'A',
  },
  {
    prompt: 'What is the opposite of "big"?',
    answers: {
      A: 'Large',
      B: 'Tall',
      X: 'Small',
      Y: 'Heavy',
    },
    correct: 'X',
  },
  {
    prompt: 'They are ___ a book together.',
    answers: {
      A: 'read',
      B: 'reading',
      X: 'reads',
      Y: 'is read',
    },
    correct: 'B',
  },
  {
    prompt: 'What month is Halloween in?',
    answers: {
      A: 'September',
      B: 'October',
      X: 'November',
      Y: 'December',
    },
    correct: 'B',
  },
  {
    prompt: 'The pen is ___ to the pencil.',
    answers: {
      A: 'next',
      B: 'in',
      X: 'under',
      Y: 'on',
    },
    correct: 'A',
  },
  {
    prompt: 'What do you wear on your hands when it is cold?',
    answers: {
      A: 'Socks',
      B: 'Boots',
      X: 'Gloves',
      Y: 'Hats',
    },
    correct: 'X',
  },
  {
    prompt: 'She ___ very happy today.',
    answers: {
      A: 'are',
      B: 'is',
      X: 'am',
      Y: 'be',
    },
    correct: 'B',
  },
  {
    prompt: 'Which object is used to tell time?',
    answers: {
      A: 'A ruler',
      B: 'A compass',
      X: 'A clock',
      Y: 'A thermometer',
    },
    correct: 'X',
  },
  {
    prompt: '___ your hands are dirty, wash them.',
    answers: {
      A: 'If',
      B: 'And',
      X: 'But',
      Y: 'Or',
    },
    correct: 'A',
  },
  {
    prompt: 'What is the color of a strawberry?',
    answers: {
      A: 'Blue',
      B: 'Yellow',
      X: 'Red',
      Y: 'Green',
    },
    correct: 'X',
  },
  {
    prompt: 'I like ___ play football with my friends.',
    answers: {
      A: 'to',
      B: 'two',
      X: 'too',
      Y: 'at',
    },
    correct: 'A',
  },
  {
    prompt: 'Which room do you take a shower in?',
    answers: {
      A: 'Kitchen',
      B: 'Living room',
      X: 'Bathroom',
      Y: 'Bedroom',
    },
    correct: 'X',
  },
  {
    prompt: 'The cats ___ playing in the garden.',
    answers: {
      A: 'is',
      B: 'are',
      X: 'am',
      Y: 'be',
    },
    correct: 'B',
  },
  {
    prompt: 'What do we use to listen to music?',
    answers: {
      A: 'Eyes',
      B: 'Nose',
      X: 'Mouth',
      Y: 'Ears',
    },
    correct: 'Y',
  },
  {
    prompt: 'He ___ English every morning.',
    answers: {
      A: 'study',
      B: 'studies',
      X: 'studying',
      Y: 'is study',
    },
    correct: 'B',
  },
  {
    prompt: 'What animal loves to eat cheese in cartoons?',
    answers: {
      A: 'Dog',
      B: 'Cat',
      X: 'Mouse',
      Y: 'Bird',
    },
    correct: 'X',
  },
  {
    prompt: '___ are you going? To the store.',
    answers: {
      A: 'Who',
      B: 'What',
      X: 'Where',
      Y: 'When',
    },
    correct: 'X',
  },
  {
    prompt: 'Which season comes after Winter?',
    answers: {
      A: 'Summer',
      B: 'Autumn',
      X: 'Spring',
      Y: 'Fall',
    },
    correct: 'X',
  }
];
