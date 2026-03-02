# Research Log

## All AI Prompts Used
The only direct prompt embedded deep inside the codebase (`travelEngine.js`) to generate new CSV destinations using the `@google/genai` library was formulated as follows:

```javascript
`
I need 10 popular tourist destinations in ${targetState !== 'any' ? targetState : ''} ${targetCountry !== 'any' ? targetCountry : ''}.
Respond ONLY with a valid JSON array of objects. Do NOT use markdown code blocks like \`\`\`json. Just the raw JSON.
Each object must have exactly these keys:
- "name": string (e.g., "City Name, Country")
- "specialties": string (e.g., "Item1|Item2|Item3" - separated by pipes, no spaces around pipes)
- "budget_needed_min": number (in USD, reasonable minimum group budget)
- "budget_needed_max": number (in USD, reasonable maximum group budget)
And the following 30 feature keys with numerical values from 1.0 to 5.0 (decimals allowed, e.g. 3.5):
${questionsPool.map(q => `"${q.key}"`).join(', ')}.
Make the features realistic for the destination.
`;
```

## AI prompts used in developement stage
1) create a module to convert csv to json
2) create csv data set with some countries and there famous tourist places along with 30 features keys with numerical values from 1.0 to 5.0
3) make the cli more user friendly with chalk and ora
4) add a mantatory questions such as where do want ot travel enter country , then state also include an option any ,also ask what is your expected budget , how many person are you 

## Search Queries

1) different type of decision compamions are avaliable  
2) how akinator works  
3) the algorithm behind the Akinator game  
4) What is Fuzzy logic  
5) How Fuzzy logic works in akinator  
6) how to use fuzzy logic in javascript  
7) gemini api key  
8) the limit of gemini api  
9) gemini api intregration with node.js  
10) which type of data is easy to fetch json or csv in js  
11) which type of data is easy to fetch json or csv in js if the data is larger  
12) is it possible to make a decision companion using fuzzy logic  
13) how to make a decision companion using fuzzy logic  
14) how to make a decision companion using fuzzy logic in js  
15) how to read user input from the terminal in js  
16) is there any way to optimize the json file accessing if the data is larger  
17) which is good for the data storage json or csv  
18) json and csv in case of larger data like data set for ai  
19) how to make a cli more user friendly  
20) why fuzzy logic is used for decision making system


## References and Inspiration
- `Google Gemini node.js SDK` documentation: Supplied the API template.
- Fuzzy Set Theory: Influenced the overall mapping where travel features are soft numbers (1.0-5.0) rather than hard boolean requirements `true / false`.
- Machine Learning (Reinforcement Learning concepts): Influenced the Feedback engine that modifies the CSV weights backward after the destination is verified as a good / bad result if the it is bad then it will ask user to enter the place they would like to go based on the all provided inputs and scoring. 

## What was Accepted, Rejected and Modified
- **Accepted:** The core mechanism of AI-fetching. I accepted Gemini's structured raw JSON string outputs entirely because it effectively produced valid destination descriptions formatted precisely to the 30-feature schema.
- **Modified:** 
  1. I heavily modified the AI string parser in `travelEngine.js` because standard AI outputs often wrap JSON in markdown tags (e.g. ` ```json `), which crashes `JSON.parse()`. I manually stripped out those substrings before feeding the data loop.
  2. The AI's generated `name` property didn't strictly match the user's broad query (AI returned `"New York City, USA"` for the prompt `"America"`). I manually injected and modified the resulting name using javascript string methods `finalName += " (America)"` so the AI data would pass the strict mandatory constraint variables within our local rules engine.
  3. I changed the `JSON` dataset to `CSV` dataset. 
- **Rejected:** The AI initially offered to fill out "default" values (like 3.0) for every single dataset. I rejected this hard-coded approach during development, forcing the AI to compute independent 1.0-5.0 features based on its own actual internal LLM model knowledge instead of returning blank 3.0 templates.and also i rejected the idea of using external data because enternal database cause some how causes any type of error in the application due the data base connection or any other issue.

