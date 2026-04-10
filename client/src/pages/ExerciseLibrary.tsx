import { useState, useEffect, useCallback } from "react";
import "../App.css"

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
    setLoading(false);
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
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="ex-lib-skeleton" />
              ))
            : exercises.map((ex) => (
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
      {selected && (
        <div className="ex-lib-overlay" onClick={() => setSelected(null)}>
          <div className="ex-lib-modal" onClick={(e) => e.stopPropagation()}>

            <div className="ex-lib-modal__header">
              <h3 className="ex-lib-modal__title">{selected.name}</h3>
              <button
                className="ex-lib-modal__close"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "4px" }}>
              {selected.level    && <span className="ex-lib-chip">{selected.level}</span>}
              {selected.category && <span className="ex-lib-chip">{selected.category}</span>}
              {selected.force    && <span className="ex-lib-chip">{selected.force}</span>}
              {selected.mechanic && <span className="ex-lib-chip">{selected.mechanic}</span>}
            </div>

            {/* information modal */}
            <div className="ex-lib-modal__info">
              <div>
                <p className="ex-lib-modal__info-label">Equipment</p>
                <p className="ex-lib-modal__info-value">{selected.equipment ?? "None"}</p>
              </div>
              <div>
                <p className="ex-lib-modal__info-label">Primary muscles</p>
                <p className="ex-lib-modal__info-value">
                  {selected.primaryMuscles.join(", ") || "—"}
                </p>
              </div>
              {selected.secondaryMuscles.length > 0 && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <p className="ex-lib-modal__info-label">Secondary muscles</p>
                  <p className="ex-lib-modal__info-value">
                    {selected.secondaryMuscles.join(", ")}
                  </p>
                </div>
              )}
            </div>

            {/* instructions */}
            {selected.instructions.length > 0 && (
              <>
                <p className="ex-lib-modal__steps-label">Instructions</p>
                <ol className="ex-lib-modal__steps">
                  {selected.instructions.map((step, i) => (
                    <li key={i} className="ex-lib-modal__step">
                      <span className="ex-lib-modal__step-num">{i + 1}</span>
                      <span className="ex-lib-modal__step-text">{step}</span>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ExerciseLibrary;
