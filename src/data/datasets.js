import sampleGraphqlData from "./sampleGraphqlData.json";

function cloneDataset(dataset) {
  return JSON.parse(JSON.stringify(dataset));
}

function buildComparisonDataset() {
  const dataset = cloneDataset(sampleGraphqlData);

  dataset.Patient[0].phone = null;
  dataset.Patient[2].birthDate = "1991-08-21";
  dataset.Patient[2].address = "Cedar Lane";
  dataset.Patient[4].name = "Sophia Miles";

  dataset.Observation[0].value = null;
  dataset.Observation[1].value = 38.1;
  dataset.Observation[2].issuedAt = "2026-02-12";
  dataset.Observation[3].status = "corrected";
  dataset.Observation[4].unit = "%";

  dataset.Medication[0].endDate = "2026-02-18";
  dataset.Medication[2].dosage = "10mg";
  dataset.Medication[3].route = "inhalation";
  dataset.Medication[3].startDate = "2026-02-27";
  dataset.Medication[4].medicationName = null;

  dataset.Encounter[0].reason = null;
  dataset.Encounter[2].endTime = "2026-01-21T15:00:00Z";
  dataset.Encounter[3].provider = "Dr. Hansen";
  dataset.Encounter[4].encounterType = "outpatient";
  dataset.Encounter[4].startTime = "2026-03-06T08:10:00Z";

  return dataset;
}

export const datasetLibrary = [
  {
    id: "clinical-cohort-a",
    label: "Clinical Cohort A",
    shortLabel: "Heatmap A",
    description:
      "Primary outpatient and inpatient snapshot across four GraphQL entities.",
    source: "Sample Dataset",
    data: sampleGraphqlData,
  },
  {
    id: "clinical-cohort-b",
    label: "Clinical Cohort B",
    shortLabel: "Heatmap B",
    description:
      "Follow-up cohort with a different completeness profile for side-by-side comparison.",
    source: "Sample Dataset",
    data: buildComparisonDataset(),
  },
];

export const datasetMap = Object.fromEntries(
  datasetLibrary.map((dataset) => [dataset.id, dataset]),
);

export function getComparisonDatasetId(activeDatasetId) {
  return (
    datasetLibrary.find((dataset) => dataset.id !== activeDatasetId)?.id ??
    activeDatasetId
  );
}
