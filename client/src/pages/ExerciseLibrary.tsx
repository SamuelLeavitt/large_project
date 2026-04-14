import { useState, useEffect, useCallback } from "react";
import LoadingState from "../components/LoadingState";
import "../App.css"
import ExerciseDetailModal from "../components/ExerciseDetails";
import MuscleMapFront from "../components/MuscleMapFront";
import MuscleMapBack from "../components/MuscleMapBack";

interface Exercise {
  _id: string;
  name: string;
  category: string;
  level: string;
  equipment: string | null;
  force: string | null;
  mechanic: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
}

const Cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const ExerciseLibrary = () => {
  const [exercises, setExercises]         = useState<Exercise[]>([]);
  const [totalPages, setTotalPages]       = useState(1);
  const [total, setTotal]                 = useState(0);
  const [page, setPage]                   = useState(1);
  const [search, setSearch]               = useState("");
  const [category, setCategory]           = useState("");
  const [level, setLevel]                 = useState("");
  const [equipment, setEquipment]         = useState("");
  const [muscle, setMuscle]               = useState("");
  const [showMap, setShowMap]             = useState(false);
  const [categories, setCategories]       = useState<string[]>([]);
  const [equipmentList, setEquipmentList] = useState<string[]>([]);
  const [levels, setLevels]               = useState<string[]>([]);
  const [loading, setLoading]             = useState(false);
  const [selected, setSelected]           = useState<Exercise | null>(null);

  useEffect(() => {
    fetch("/api/exercises/meta/filters")
      .then((r) => r.json())
      .then((data) => {
        setCategories(data.categories ?? []);
        setEquipmentList(data.equipment ?? []);
        setLevels(data.levels ?? []);
      });
  }, []);

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)    params.set("search", search);
      if (category)  params.set("category", category);
      if (level)     params.set("level", level);
      if (equipment) params.set("equipment", equipment);
      if (muscle)    params.set("muscle", muscle);
      params.set("page", String(page));
      params.set("limit", "20");

      const res  = await fetch(`/api/exercises?${params}`);
      const data = await res.json();
      setExercises(data.items ?? []);
      setTotal(data.pagination?.total ?? 0);
      setTotalPages(data.pagination?.pages ?? 1);
    } finally {
      setLoading(false);
    }
  }, [search, category, level, equipment, muscle, page]);

  useEffect(() => { fetchExercises(); }, [fetchExercises]);

  const handleZonePick = (zone: string) => {
    setMuscle(zone);
    setPage(1);
    setShowMap(false);
  };

  return (
    <>
      <div className="ex-lib-root">
        <h2 style={{ marginBottom: "24px" }}>  </h2>

        {/* filters */}
        <div className="ex-lib-filters">
          <input
            type="text"
            placeholder="Search exercises…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{Cap(c)}</option>)}
          </select>
          <select value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }}>
            <option value="">All levels</option>
            {levels.map((l) => <option key={l} value={l}>{Cap(l)}</option>)}
          </select>
          <select value={equipment} onChange={(e) => { setEquipment(e.target.value); setPage(1); }}>
            <option value="">All equipment</option>
            {equipmentList.map((e) => <option key={e} value={e}>{Cap(e)}</option>)}
          </select>
          {/* muscle map trigger */}
          <button
            className="ex-lib-page-btn"
            onClick={() => setShowMap(true)}
          >
            {muscle ? `Muscle: ${Cap(muscle)}` : "Find by Muscle"}
          </button>
          {muscle && (
            <button
              className="ex-lib-page-btn"
              onClick={() => { setMuscle(""); setPage(1); }}
            >
              Clear
            </button>
          )}
        </div>

        {!loading && (
          <div className="counter" style={{ cursor: "default" , justifySelf: "start"}}>
            {total.toLocaleString()} exercises
          </div>
        )}

        {/* exercise list */}
        <div className="ex-lib-list">
          {loading ? (
            <LoadingState
              title="Loading exercises"
              description="Fetching the current exercise library."
              minHeight="260px"
            />
          ) : exercises.map((ex) => (
                <button
                  key={ex._id}
                  className="ex-lib-row"
                  onClick={() => setSelected(ex)}
                >
                  <div className="ex-lib-row__body">
                    <div className="ex-lib-row__name">{ex.name}</div>
                    <div className="ex-lib-row__meta">
                      {[ex.primaryMuscles.slice(0, 2).join(", "), ex.equipment]
                        .filter(Boolean)
                        .join(" · ")}
                    </div>
                  </div>

                  <div className="ex-lib-chips">
                    {ex.level    && <span className="ex-lib-chip">{ex.level}</span>}
                    {ex.category && <span className="ex-lib-chip">{ex.category}</span>}
                  </div>

                  <svg
                    className="ex-lib-chevron"
                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                  >
                    <path
                      d="M6 3l5 5-5 5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ))}
        </div>

        {/* pagination */}
        {!loading && totalPages > 1 && (
          <div className="ex-lib-pagination">
            <button
              className="ex-lib-page-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span className="ex-lib-page-label">{page} / {totalPages}</span>
            <button
              className="ex-lib-page-btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* muscle map modal */}
      {showMap && (
        <div
          onClick={() => setShowMap(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "18px",
              padding: "24px",
              width: "min(650px, 90vw)",
              maxHeight: "85vh",
              overflowY: "auto",
              display: "grid",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>Choose a Muscle</h2>
              <button className="ex-lib-page-btn" onClick={() => setShowMap(false)}>Close</button>
            </div>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>
              Click a muscle to filter exercises.
            </p>
            <div style={{ display: "flex", flexDirection: "row", gap: "20px", justifyContent: "center", alignItems: "flex-start" }}>
              <MuscleMapFront onZoneClick={handleZonePick} />
              <MuscleMapBack onZoneClick={handleZonePick} />
            </div>
          </div>
        </div>
      )}

      {/* detail modal */}
      {selected && <ExerciseDetailModal exercise={selected} onClose={() => setSelected(null)} />}
    </>
  );
};

export default ExerciseLibrary;
