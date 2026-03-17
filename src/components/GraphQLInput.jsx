function GraphQLInput({
  endpointUrl,
  isSampleMode,
  onEndpointUrlChange,
  onModeChange,
}) {
  const baseModeClass =
    "rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600";

  const selectedModeClass = "bg-rose-700 text-white shadow-md";
  const unselectedModeClass =
    "bg-white text-stone-600 ring-1 ring-stone-300 hover:bg-stone-50";

  return (
    <section className="rounded-3xl border border-stone-200/80 bg-white/75 p-5 shadow-panel backdrop-blur sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">GraphQL Source</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Enter a GraphQL endpoint and switch modes. Sample mode uses local
            records to calculate density.
          </p>
        </div>

        <div className="inline-flex rounded-full bg-stone-100 p-1">
          <button
            type="button"
            className={`${baseModeClass} ${
              isSampleMode ? selectedModeClass : unselectedModeClass
            }`}
            onClick={() => onModeChange(true)}
          >
            Sample Dataset Mode
          </button>
          <button
            type="button"
            className={`${baseModeClass} ${
              !isSampleMode ? selectedModeClass : unselectedModeClass
            }`}
            onClick={() => onModeChange(false)}
          >
            Endpoint Mode
          </button>
        </div>
      </div>

      <label
        htmlFor="graphql-endpoint"
        className="mt-5 block text-sm font-semibold text-slate-800"
      >
        GraphQL Endpoint URL
      </label>
      <input
        id="graphql-endpoint"
        type="url"
        value={endpointUrl}
        placeholder="https://api.example.com/graphql"
        onChange={(event) => onEndpointUrlChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-mono text-sm text-slate-700 outline-none transition focus:border-rose-600 focus:ring-2 focus:ring-rose-200"
      />

      <p className="mt-3 text-xs text-slate-500">
        {isSampleMode
          ? "Currently visualizing bundled sample data (Patient, Observation, Medication, Encounter)."
          : "Endpoint mode is active. The current visualization still uses local sample records for density preview."}
      </p>
    </section>
  );
}

export default GraphQLInput;
