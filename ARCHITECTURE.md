# Travel Decision Companion - Architecture & Data Flow

This document provides a high-level overview of the Travel Decision Companion application, its components, and the flow of data.

---

## 1. System Architecture

The application is built primarily with Node.js and relies on several key packages and a modular architecture.

```mermaid
graph TD
    subgraph "External Systems"
        gemini[Gemini AI API]
    end

    subgraph "User Interface (CLI)"
        cli([Command Line Interface])
        inquirer[inquirer]
        chalk[chalk]
        ora[ora]
    end

    subgraph "Application Core (travelEngine.js)"
        engine[Fuzzy Logic Decision Engine]
        ai_module[Dynamic Destination Generation]
        learning_module[Adaptive Learning Loop]
        penalties[Mandatory Condition Constraints]
    end

    subgraph "Data Persistence"
        csv_parser[csv-parser]
        csv_writer[csv-writer]
        dataset[(destinations.csv)]
    end

    %% Wiring
    cli <-->|Prompts & Inputs| inquirer
    cli <-->|Styled Output| chalk
    cli <-->|Animations| ora

    inquirer -->|User Preferences| engine
    engine <--> learning_module
    engine <--> penalties

    engine -->|Search / Match| ai_module
    ai_module <-->|API Calls| gemini

    engine <-->|Read Data| csv_parser
    csv_parser <--> dataset

    engine -->|Write Adjustments| csv_writer
    ai_module -->|Write New Destinations| csv_writer
    learning_module -->|Adjust Features & Save| csv_writer
    csv_writer <--> dataset
```

---

## 2. Data Flow Diagram

This diagram visualizes how the system processes user inputs, performs the fuzzy logic matching, generates new data dynamically using AI, and learns from user feedback.

```mermaid
stateDiagram-v2
    [*] --> StartCLI
    
    StartCLI --> LoadDestinations: Read "destinations.csv"
    
    LoadDestinations --> MandatoryPrompts: Ask (Country, State, Budget, Persons)
    
    MandatoryPrompts --> AI_Check
    
    state AI_Check {
        CheckLocation: Check if Country/State exist in current dataset
        CheckLocation --> Found: Yes
        CheckLocation --> Missing: No
        
        Missing --> AskGemini: Prompt User "Fetch via AI?"
        AskGemini --> CallGemini: Yes (Provide API Key)
        CallGemini --> GeminiAPI: Ask for 4 destinations formatted with 30 features
        GeminiAPI --> ReturnJSON: Raw JSON string response
        ReturnJSON --> SaveNewDestinations: Parse and Append to "destinations.csv"
        SaveNewDestinations --> Found
        
        AskGemini --> Found: No
    }
    
    Found --> Ask10Questions: Randomly select 10 preference questions (Scale 1-5)
    
    Ask10Questions --> FuzzyMatching
    
    state FuzzyMatching {
        CalculateDistance: Sum of absolute differences between User Answers & Dataset Features
        ApplyPenalties: Add +50 points if Country/State mismatch and proportional penalty if budget exceeded
        FindBest: Select Destination with the Lowest Distance Score
    }
    
    FuzzyMatching --> ShowRecommendation: Output Best Match & Computed Group Budget
    
    ShowRecommendation --> FeedbackLoop: "Is this a good decision? (Y/n)"
    
    state FeedbackLoop {
        GoodDecision: Yes
        BadDecision: No
        
        GoodDecision --> ApplyMinorUpdate: Pull chosen destination's features slightly (20%) towards User Answers
        
        BadDecision --> AskPreferred: "What is your preferred destination?"
        AskPreferred --> SearchPreferred: Check if preferred destination exists
        SearchPreferred --> CreateNew: Found? No (Create New Entry with Mid-level 3.0 stats)
        SearchPreferred --> ApplyMajorUpdate: Found? Yes
        CreateNew --> ApplyMajorUpdate: Pull preferred destination's features heavily (50%) towards User Answers
    }
    
    ApplyMinorUpdate --> WriteCSV: Save modifications to "destinations.csv"
    ApplyMajorUpdate --> WriteCSV: Save modifications to "destinations.csv"
    
    WriteCSV --> [*]: Exit CLI
```
