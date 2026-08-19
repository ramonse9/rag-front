# Ramon Guzman - AI Resume

A responsive React frontend with two evidence-based workflows: resume Q&A through Native RAG or LangChain, and job-description analysis through a LangGraph agent.

## Technology stack

- React and TypeScript
- Vite
- Tailwind CSS
- `react-markdown` for safe Markdown rendering (raw HTML is disabled)
- Vitest and React Testing Library

## Local setup

Requirements: Node.js 20.19 or newer and npm.

```bash
npm install
cp .env.example .env
npm run dev
```

The development server prints the local URL when it starts.

## Environment configuration

The frontend reads its backend URL exclusively from:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Do not add secrets to Vite environment variables because values prefixed with `VITE_` are included in the browser bundle. The URL is normalized by `src/config/env.ts`, so a trailing slash is optional.

The backend must allow requests from the frontend origin through its CORS configuration.

## Commands

```bash
npm run dev        # Start the development server
npm run typecheck  # Run strict TypeScript checks
npm run lint       # Run ESLint
npm test           # Run the component and behavior tests once
npm run build      # Type-check and create a production build
```

## Backend API contract

The application calls one of two endpoints relative to `VITE_API_BASE_URL`, based on the selected RAG engine:

- Native RAG: `POST /api/rag/ask`
- LangChain: `POST /api/rag/langchain/ask`

Both endpoints use the same request and response contract.

Request:

```json
{
  "question": "What experience does Ramon have with PostgreSQL?"
}
```

Response:

```json
{
  "question": "What experience does Ramon have with PostgreSQL?",
  "answer": "Markdown-formatted answer",
  "sources": [
    {
      "chunkIndex": 0,
      "distance": 0.5385,
      "filename": "Ramon_Guzman_Senior_FullStack_Developer.pdf",
      "content": "Retrieved resume chunk"
    }
  ]
}
```

Responses are validated at runtime before they reach the UI.

### Job Analysis Agent

The Job Analysis experience calls:

```text
POST /api/job-analysis/analyze
```

Request:

```json
{
  "jobDescription": "Full job description",
  "question": "How strong is my match for this position?"
}
```

The response includes the LangGraph answer, extracted requirements, retrieved evidence, and requirement-level evaluations. Raw retrieval chunks are validated but intentionally not rendered; concise supporting evidence is expandable within each evaluation.

## Current conversation behavior

Resume questions and job analyses are currently independent because the backend does not retain conversational context. Previous resume results remain visible only in the current browser session, and clearing history removes that in-memory state. Users should include all relevant context in every request.

## Development workflow

This frontend was developed with an AI-first workflow guided by human-defined architecture, requirements, review criteria, and validation. The workflow does not imply autonomous operation or decision-making by the deployed application.
