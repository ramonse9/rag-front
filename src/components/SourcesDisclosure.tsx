import type { RagSource } from "../types/rag";

interface SourcesDisclosureProps {
  sources: RagSource[];
}

export function SourcesDisclosure({ sources }: SourcesDisclosureProps) {
  return (
    <details className="group mt-6 border-t border-slate-200 pt-4">
      <summary className="w-fit cursor-pointer rounded text-sm font-semibold text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
        View sources ({sources.length})
      </summary>
      <div className="mt-4 space-y-3">
        {sources.length === 0 ? (
          <p className="text-sm text-slate-500">No source chunks were returned.</p>
        ) : (
          sources.map((source, index) => (
            <article
              key={`${source.filename}-${source.chunkIndex}-${index}`}
              className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <h4 className="break-words text-sm font-semibold text-slate-900">
                {source.filename}
              </h4>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>Chunk {source.chunkIndex}</span>
                <span title="Technical retrieval metadata; lower values generally indicate closer matches for distance-based retrieval.">
                  Retrieval distance: {source.distance.toFixed(4)}
                </span>
              </div>
              <p className="mt-3 overflow-wrap-anywhere whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {source.content}
              </p>
            </article>
          ))
        )}
      </div>
    </details>
  );
}
