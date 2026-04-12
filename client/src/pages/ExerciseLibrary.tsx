import { useState, useEffect, useCallback } from "react";
import LoadingState from "../components/LoadingState";
import "../App.css"
import ExerciseDetailModal from "../components/ExerciseDetails";

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
  }, [search, category, level, equipment, page]);

  useEffect(() => { fetchExercises(); }, [fetchExercises]);

  return (
    <>
      <div className="workout-list">
        <h2 style={{ marginBottom: "24px" }}>Exercise Library</h2>

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
        </div>


        {!loading && (
          <div className="counter" style={{ display: "inline-block", cursor: "default" }}>
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

      {/* detail modal */}
      {selected && <ExerciseDetailModal exercise={selected} onClose={() => setSelected(null)} />}
    </>
  );
};

export default ExerciseLibrary;
