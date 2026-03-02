# Travel Decision Companion

An interactive, AI-powered CLI application that helps users decide on their next travel destination using Fuzzy Logic, Adaptive Learning, and Dynamic AI Generation (Google Gemini).

## Features
- **Fuzzy Logic Engine:** Calculates the mathematical ("Manhattan Distance") difference between user preferences and destination features across a sliding 1-5 scale for 30 distinct categories.
- **Dynamic Questioning:** Asks 10 random, non-repeating preference questions out of a master pool of 30, keeping the quiz fresh every run.
- **Adaptive Learning Loop:** If a user disagrees with the final recommendation, the system asks for their preferred destination and permanently alters the internal CSV dataset weights so that the engine gets "smarter" based on mass user feedback.
- **Dynamic AI Fetching:** If a user requests a Country or State that is entirely missing from the local dataset, the system acts as an autonomous agent by calling the Google Gemini API to dynamically research, format, and permanently inject new destinations tailored to that location.

## Prerequisites
- **Node.js**: Ensure you have Node.js installed (v18+ recommended).
- **Gemini API Key**: To use the dynamic AI fetching feature, you need a Google Gemini API Key.

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Jithu-9847/decision_companion.git
   cd decision_companion
   ```

2. **Install dependencies:**
   The project uses `inquirer`, `csv-parser`, `csv-writer`, `chalk`, `ora`, and `@google/genai`.
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (this file is ignored by git for security) and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```
   *(Note: If you don't create this file, the CLI will safely prompt you to manually paste your key during runtime if it needs to fetch new destinations).*

## How to Run

To launch the interactive CLI companion, run:
```bash
node decision.js
```

### Example Walkthrough
1. The app will greet you and ask 4 mandatory questions (Country, State, Budget, Number of Traverlers).
   - *Try typing a country that isn't in the system yet (e.g., "Germany") to test the AI fetching!*
2. You will then be asked 10 random preference questions to rate on a 1-5 scale.
3. The engine computes the absolute distance between your answers and the destination, then adds budget/location penalties.
4. It outputs your **Recommended Destination** with an estimated budget based on your group size.
5. Answer the **Feedback Loop** prompt. (Try answering "No" and suggesting an alternative location to watch the CSV data learn and adapt!).

## Architecture & Development Logs
- See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for Mermaid diagrams of the system structure and data flow.
- See **[BUILD_PROCESS.md](./BUILD_PROCESS.md)** for details on the development evolution, refactoring, and AI integration steps.
- See **[RESEARCH_LOG.md](./RESEARCH_LOG.md)** for specific AI prompts and search queries used during development.
