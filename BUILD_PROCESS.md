# Build Process

## How I Started

The development process began with researching how a decision-making companion system could effectively assist users in choosing between multiple options. The initial objective was to understand how structured computational models could replicate human decision-making behavior. To explore this idea, I first developed a Python-based prototype that utilized the concept of decision trees for automated decision support.

In the initial implementation, a static decision tree was manually constructed where each node represented a question presented to the user, and its child nodes represented possible responses. Based on the user’s selection, the system traversed through the tree sequentially until a leaf node was reached. The value stored in the leaf node was considered the final decision output. This approach successfully demonstrated guided decision flow; however, it lacked flexibility since every possible decision path had to be predefined in advance.

To introduce adaptability into the system, Gemini API integration was later added to dynamically generate decision trees based on user queries. While this significantly improved the system’s ability to handle diverse decision scenarios, it introduced serious performance limitations. Each time a user requested a decision, the system was required to generate and retrieve an entire decision tree structure through the API, resulting in increased latency and inefficient execution. Due to these scalability challenges, this approach was ultimately discontinued.

Following this evaluation, the system architecture was redesigned and the project was migrated from Python to JavaScript to better support interactive and real-time environments. During this redesign phase, the decision-making strategy shifted from rule-based trees to a probabilistic learning approach. The Random Forest algorithm was selected because of its efficiency, robustness, and capability to produce reliable outcomes through probability aggregation rather than rigid logical traversal.

The project was then restarted with a refined objective: to develop an interactive command-line **Travel Decision Companion** capable of understanding user preferences and recommending suitable travel destinations. The system was designed to interactively collect user preferences and compare them against a structured dataset (`destinations.json`) containing predefined travel locations. Each destination was modeled using approximately thirty detailed attributes—such as adventure level, relaxation potential, nightlife availability, cultural immersion, and nature focus—rated on a standardized scale from one to five. This structured scoring framework enabled nuanced mathematical comparison using fuzzy logic principles, allowing the system to generate more context-aware and human-like travel recommendations.

## Reason for using Fuzzy Logic
`Fuzzy logic is used in decision-making systems to handle uncertainty, ambiguity, and imprecise data, allowing computers to mimic human-like reasoning rather than relying on strict, binary (0 or 1) logic. It is highly effective for controlling complex, non-linear systems by using "if-then" rules to interpret vague inputs`

So i thing it will be good for my decision making companion

## How My Thinking Evolved
As development progressed, it became obvious that a completely static JSON dataset was too rigid and hard for a non-developer to maintain. I shifted my thinking in a few key areas:
1. **Data Management:** I migrated the data from JSON to a CSV format (`destinations.csv`) using the `csv-parser` and `csv-writer` libraries, which makes the dataset much easier to view and edit in spreadsheet software.
2. **Filtering Before Fuzzy Matching:** Instead of relying entirely on 30 random preference questions, I realized users usually have hard constraints. I added 4 "mandatory" upfront questions (Country, State, Budget, Persons) to heavily penalize or filter out completely irrelevant destinations *before* comparing preferences. 
3. **Adaptive Learning:** A decision engine is only as good as its data. I implemented a continuous learning loop where, if a user disagrees with a recommendation, they can input their preferred destination. The system then alters the weights of that destination in the CSV, pulling its features closer to the answers the user just provided.

## Alternative Approaches Considered
- **Decision Trees vs. Fuzzy Logic:** Initially, I considered a classic decision tree where each answer leads down a strict path ("Yes to Mountains -> Filter Out Beaches"). I rejected this because travel preferences are rarely binary. Someone might want *mostly* mountains but still value a small amount of beach access. Fuzzy logic (calculating the absolute distance between two arrays of 30 features) proved to be a much more accurate and forgiving method.
- **SQL Database vs. Flat File:** I considered using SQLite or a traditional database for data storage, but to keep the CLI tool lightweight, portable, and easily hackable, a flat CSV file was chosen as the persistence layer.

## Refactoring Decisions
- **Asynchronous Data Handling:** When transitioning to CSV, I had to refactor the synchronous JSON file reading (`fs.readFileSync`) into promise-based asynchronous streams using `fs.createReadStream().pipe(csv())`.
- **UI Enhancements:** The terminal output was initially dry text. I decided to refactor the display logic using `chalk` and `ora` to make the CLI feel like a premium, interactive application with colors and fake loading spinners.

## Mistakes and Corrections
- **Currency Oversight:** Early versions calculated the total budget and printed it out in USD with a static string. I later had to update the script to display Rupee (₹) symbols for currency clarity without disrupting the underlying math (since the cost values are relative).
- **The AI Location Penalty Bug:** The biggest mistake occurred when integrating Gemini AI. When a user inputted a generic query like "America", the AI returned specific locations like "New York City, USA". Because "America" was not strictly in the string "New York City, USA", the engine incorrectly slapped those newly generated destinations with a massive 50-point location mismatch penalty, causing them to be ignored. 
  - *Correction:* I patched the AI response parser to automatically append the user's exact search query string into the destination's name in parenthesis (e.g., "New York City, USA (America)"), ensuring it perfectly bypasses the engine's strict inclusion checks.

## What Changed During Development and Why
The most significant change was the introduction of **Dynamic AI Generation via Google Gemini**. 
Originally, if a user searched for a country not in the dataset, the engine would just fail gracefully or pick a highly penalized fallback. I completely altered the architecture mid-development to connect to the `@google/genai` API. Now, if a location is completely missing, the system detects it, pauses, prompts the user to use AI, and fetches 4 completely new destinations structured *exactly* to our 30-feature CSV schema on the fly, saving them permanently. This transitioned the app from a closed-loop quiz to an infinitely expanding expert system!
