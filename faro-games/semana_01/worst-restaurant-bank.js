export const avatars=['🦖','👾','🐙','🐲','🦈','🤖','🦄','🦍','🐸','🦝','🦜','🦀','🐡','🛸','🍕'];
export const GAME_ROUNDS=12;
export const missionPools={
 support:[
  {level:'A1 · Food',title:'Burger Mix-Up',order:"I'd like a hamburger and water, please.",mistake:'Okay! One pizza and orange juice.',answer:'Excuse me, I asked for a hamburger and water.'},
  {level:'A1 · Food',title:'Taco Trouble',order:"I'd like two tacos and lemonade, please.",mistake:'Great! Three sandwiches and milk.',answer:'Sorry, I ordered two tacos and lemonade.'},
  {level:'A1 · Lunch',title:'Soup Surprise',order:"I'd like tomato soup and bread, please.",mistake:'Here is your salad and cookie.',answer:'I ordered tomato soup and bread, not salad and a cookie.'},
  {level:'A1 · Numbers',title:'Wrong Table',order:'A table for two, please.',mistake:'Of course. A table for four.',answer:'We need a table for two, not four.'},
  {level:'A1 · Numbers',title:'One, Not Two',order:"I'd like one hot dog and a soda, please.",mistake:'Here are two hamburgers and water.',answer:'I asked for one hot dog and a soda.'},
  {level:'A1 · Food',title:'Chicken Switch',order:"I'd like chicken and rice, please.",mistake:'Here is your fish and fries.',answer:'I ordered chicken and rice, not fish and fries.'},
  {level:'A1 · Dessert',title:'Cold Dessert',order:"I'd like ice cream, please.",mistake:'Here is your chocolate cake.',answer:'I asked for ice cream, not chocolate cake.'},
  {level:'A1 · Drinks',title:'Juice Mix-Up',order:"Orange juice, please.",mistake:'Here is your milk.',answer:'I ordered orange juice, not milk.'},
  {level:'A1 · Requests',title:'No Onions',order:"A salad without onions, please.",mistake:'Here is your salad with extra onions.',answer:'I asked for a salad without onions.'},
  {level:'A1 · Numbers',title:'Too Much Pizza',order:"One pizza, please.",mistake:'Here are your two pizzas.',answer:'I ordered one pizza, not two.'},
  {level:'A1 · Restaurant',title:'Bill or Menu?',order:'The bill, please.',mistake:'Of course. Here is the menu.',answer:'I asked for the bill, not the menu.'},
  {level:'A1 · Drinks',title:'No Ice',order:"Water without ice, please.",mistake:'Here is your water with extra ice.',answer:'I asked for water without ice.'},
  {level:'A1 · Food',title:'Wrong Sandwich',order:"A cheese sandwich, please.",mistake:'Here is your chicken sandwich.',answer:'I ordered a cheese sandwich, not a chicken sandwich.'},
  {level:'A1 · Numbers',title:'Three Waters',order:"Three waters, please.",mistake:'Here is one soda.',answer:'We ordered three waters, not one soda.'},
  {level:'A1 · Breakfast',title:'Breakfast Switch',order:"Eggs and toast, please.",mistake:'Here are your pancakes and bacon.',answer:'I ordered eggs and toast, not pancakes and bacon.'},
  {level:'A1 · Dessert',title:'Fruit, Please',order:"I'd like fruit, please.",mistake:'Here is your ice cream.',answer:'I asked for fruit, not ice cream.'}
 ],
 core:[
  {level:'A2 · Special request',title:'The Onion Attack',order:"Could I have a burger without onions, please?",mistake:'Here is your burger with extra onions.',answer:'I asked for no onions. Could you change it, please?'},
  {level:'A2 · Quantities',title:'Too Many Drinks',order:"We'd like two lemonades, please.",mistake:'Here is your five lemonades.',answer:'We ordered two lemonades, not five.',languageError:'Here is → Here are (five lemonades)'},
  {level:'A2 · Payment',title:'Cash or Card?',order:'Could we have the bill, please? We will pay by card.',mistake:'Here is your bill. You’ll be paying in cash, correct?',answer:"We're paying by card, not cash."},
  {level:'A2 · Seating',title:'Window Seat',order:'A table for four by the window, please.',mistake:'Your table for two is ready outside.',answer:'We asked for a table for four by the window.'},
  {level:'A2 · Main course',title:'Dinner Switch',order:"I'd like grilled chicken with salad, please.",mistake:'Here is your fried fish with fries.',answer:'I ordered grilled chicken with salad, not fish and fries.'},
  {level:'A2 · Dessert',title:'Wrong Flavor',order:"Could I have chocolate cake, please?",mistake:'Here is your vanilla ice cream.',answer:'I asked for chocolate cake, not vanilla ice cream.'},
  {level:'A2 · The bill',title:'Separate Checks',order:'Could we have separate checks, please?',mistake:'Certainly. Here is one check for everyone.',answer:'We asked for separate checks, not one check.'},
  {level:'A2 · Cooking',title:'Steak Mistake',order:"I'd like one medium steak, please.",mistake:'Your well-done steaks is ready.',answer:'I ordered one medium steak, not well-done.',languageError:'steaks is → steak is (one steak)'},
  {level:'A2 · Dietary needs',title:'Gluten-Free Mix-Up',order:"I'd like the gluten-free pasta, please.",mistake:'Here is your regular pasta.',answer:'I ordered the gluten-free pasta, not the regular pasta.'},
  {level:'A2 · Drinks',title:'Sparkling Water',order:"Could we have sparkling water, please?",mistake:'Here is your still water.',answer:'We asked for sparkling water, not still water.'},
  {level:'A2 · Special request',title:'Extra Cheese?',order:"A hamburger without cheese, please.",mistake:'Here is your hamburger with extra cheese.',answer:'I asked for a hamburger without cheese.'},
  {level:'A2 · Reservation',title:'Wrong Reservation',order:'We have a reservation for six at seven o’clock.',mistake:'There is four people for your eight o’clock reservation.',answer:'Our reservation is for six at seven o’clock.',languageError:'There is → There are (four people)'},
  {level:'A2 · Appetizer',title:'Starter Switch',order:"We'd like tomato soup as an appetizer.",mistake:'I will bring nachos as your appetizer.',answer:'We ordered tomato soup, not nachos.'},
  {level:'A2 · Takeaway',title:'To Go',order:"I'd like this order to go, please.",mistake:'Great. I will bring it to your table.',answer:'I asked for the order to go, not to eat here.'},
  {level:'A2 · Recommendation',title:'Too Spicy',order:'Could you recommend something mild?',mistake:'I recommend our hottest curry.',answer:'I asked for something mild, not something spicy.'},
  {level:'A2 · Drinks',title:'Coffee Correction',order:"One hot coffee with milk, please.",mistake:'Here are your cold coffees without milk.',answer:'I ordered one hot coffee with milk.',languageError:'Here are → Here is (one coffee)'}
 ],
 stretch:[
  {level:'B1 · Allergy',title:'Peanut Warning',order:'I have a peanut allergy. Does this dessert contain peanuts?',mistake:'Yes, the ingredients is almonds and peanuts. It is completely safe for you.',answer:'It is not safe because I am allergic to peanuts.',languageError:'ingredients is → ingredients are'},
  {level:'B1 · Substitution',title:'Sold Out',order:"If the grilled chicken is unavailable, I'd like the fish instead.",mistake:'The chicken is unavailable, so I brought you a hamburger.',answer:'I asked for fish if the chicken was unavailable.'},
  {level:'B1 · Bill',title:'Mystery Charge',order:'Could you bring the bill without adding dessert?',mistake:'Your bill includes two desserts and an extra service charge.',answer:'We did not order dessert. Could you check the bill, please?'},
  {level:'B1 · Reservation',title:'Birthday Table',order:'We reserved a quiet table for five inside.',mistake:'Your outdoor table for three is ready beside the speakers.',answer:'We reserved an indoor table for five in a quiet area.'},
  {level:'B1 · Dietary needs',title:'Vegetarian Order',order:"I'm vegetarian, so I'd like the mushroom pasta without meat.",mistake:'Here is your chicken pasta. The mushrooms is on top.',answer:'I ordered vegetarian mushroom pasta without meat.',languageError:'mushrooms is → mushrooms are'},
  {level:'B1 · Cooking',title:'Steak Temperature',order:"I'd like the steak medium rare with vegetables instead of fries.",mistake:'Here is your well-done steak with fries.',answer:'I ordered the steak medium rare with vegetables, not fries.'},
  {level:'B1 · Service',title:'Missing Side Dish',order:'We ordered two soups, a salad and garlic bread.',mistake:'Here are the two soups and a salad. The garlic bread are not included.',answer:'We also ordered garlic bread.',languageError:'bread are → bread is'},
  {level:'B1 · Payment',title:'Split the Bill',order:'Please split the bill equally between these two cards.',mistake:'I charged the entire bill to the first card.',answer:'We asked you to split the bill between both cards.'},
  {level:'B1 · Recommendation',title:'Mild Recommendation',order:'Could you recommend a mild dish without dairy?',mistake:'I recommend the spicy cheese pasta.',answer:'I need something mild and dairy-free.'},
  {level:'B1 · Timing',title:'Dessert Later',order:'Please bring the dessert after we finish the main course.',mistake:'Here are your desserts before the main course.',answer:'We asked for dessert after the main course.',languageError:'Here are your desserts → Here is your dessert (one dessert)'},
  {level:'B1 · Ingredients',title:'Hidden Seafood',order:'Does the soup contain seafood? I cannot eat shrimp.',mistake:'It contains shrimp, but the soup are safe for you.',answer:'It is not safe for me because it contains shrimp.',languageError:'soup are → soup is'},
  {level:'B1 · Reservation',title:'Name Mix-Up',order:'The reservation is under Rodríguez for eight thirty.',mistake:'I found a reservation under Ramírez for seven thirty.',answer:'The reservation is under Rodríguez for eight thirty.'},
  {level:'B1 · Special request',title:'Sauce on the Side',order:'Could I have the dressing on the side and no croutons?',mistake:'The dressing is mixed in, and I added extra croutons.',answer:'I asked for dressing on the side and no croutons.'},
  {level:'B1 · Complaint',title:'Cold Main Course',order:'Excuse me, this dish should be hot.',mistake:'The plates is cold, but the food is supposed to be cold too.',answer:'This dish should be served hot. Could you warm it up?',languageError:'plates is → plates are'},
  {level:'B1 · Takeaway',title:'Missing Takeaway Item',order:'Please pack two sandwiches and three bottles of water to go.',mistake:'Your bag has one sandwich and two bottles of water.',answer:'We ordered two sandwiches and three bottles of water.'},
  {level:'B1 · Bill',title:'Wrong Discount',order:'The menu says this meal includes a ten-percent discount.',mistake:'Your bill has no discount, and the prices is final.',answer:'The meal should include a ten-percent discount.',languageError:'prices is → prices are'}
 ]
};
