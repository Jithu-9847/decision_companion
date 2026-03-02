# Travel Decision Companion

An interactive CLI application that helps users decide on their next travel destination using Fuzzy Logic, Adaptive Learning, and Dynamic AI Generation (Google Gemini).


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
4. **Gemini API Setup Guide**

This project uses **Google Gemini AI** to dynamically generate travel destinations when requested locations are not available in the dataset.


## Step 1: Create Gemini API Key

1. Open Google AI Studio:
   https://aistudio.google.com/app/apikey

2. Sign in using your Google account.

3. Click **Create API Key**.

4. Select **Create API key in new project**.

5. Copy the generated API key.

Example:
```
AIzaSyXXXXXXXXXXXXXXXXXXXX
```

⚠️ Keep your API key private.


## Step 2: Add API Key to Project

Create a file named `.env` in the project root directory.

Add the following:

```
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

Example:
```
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXX
```

## Alternative: Temporary API Key (For Evaluators)

If you are unable to create a Gemini API key, you may use the **temporary API key** provided along with the project submission email.

The API key is shared as an email attachment protected with the following password:

```
Task@2026_Pass
```

⚠️ Note:
- This key is provided **only for project evaluation purposes**.
- The key will be revoked after evaluation.
- Please do not redistribute or reuse the key.

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
