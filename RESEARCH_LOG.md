# Research Log

## All AI Prompts Used
The only direct prompt embedded deep inside the codebase (`travelEngine.js`) to generate new CSV destinations using the `@google/genai` library was formulated as follows:

```javascript
const promptText = `
I need 4 popular tourist destinations in ${targetState !== 'any' ? targetState : ''} ${targetCountry !== 'any' ? targetCountry : ''}.
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

## Search Queries
1)different type of decision compamions are avaliable
2)how akinator works
3)the algorithm behind the Akinator game
4)What is Fuzzy logic
5)How Fuzzy logic works in akinator
6)how to use fuzzy logic in javascript
7)gemini api key

1. "How to read CSV asynchronously in javascript Node.js streams" (to learn how `csv-parser` reads data incrementally instead of blocking)
2. "Math.abs javascript manhattan distance calculation for arrays" (to structure the fuzzy logic core distance formula correctly)
3. "@google/genai syntax for fetching text models" (to confirm the correct new syntax `ai.models.generateContent({ model: 'gemini-2.5-flash' })` against the generic `google/genai` npm package vs the older `@google/genai` legacy package)
4. "chalk dynamic formatting examples CLI" (to correctly inject formatting colors like `chalk.bold.magenta()`)

## References and Inspiration
- `inquirer.js` documentation: Influenced the interactive Prompts and UX structure.
- `Google Gemini node.js SDK` documentation: Supplied the API template.
- Fuzzy Set Theory: Influenced the overall mapping where travel features are soft numbers (1.0-5.0) rather than hard boolean requirements `true / false`.
- Machine Learning (Reinforcement Learning concepts): Influenced the Feedback engine that modifies the CSV weights backward after the destination is verified as a good / bad result. 

## What was Accepted, Rejected, or Modified from AI Outputs
- **Accepted:** The core mechanism of AI-fetching. We accepted Gemini's structured raw JSON string outputs entirely because it effectively produced valid and incredibly nuanced destination descriptions formatted precisely to our complex 30-feature schema.
- **Modified:** 
  1. I heavily modified the AI string parser in `travelEngine.js` because standard AI outputs often wrap JSON in markdown tags (e.g. ` ```json `), which crashes `JSON.parse()`. I manually stripped out those substrings before feeding the data loop.
  2. The AI's generated `name` property didn't strictly match the user's broad query (AI returned `"New York City, USA"` for the prompt `"America"`). I manually injected and modified the resulting name using javascript string methods `finalName += " (America)"` so the AI data would pass the strict mandatory constraint variables within our local rules engine. 
- **Rejected:** The AI initially offered to fill out "default" values (like 3.0) for every single dataset. I rejected this hard-coded approach during development, forcing the AI to compute independent 1.0-5.0 features based on its own actual internal LLM model knowledge instead of returning blank 3.0 templates.
