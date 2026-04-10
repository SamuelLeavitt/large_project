interface LoadingStateProps {
  title: string;
  description?: string;
  minHeight?: string;
}

const loadingStateStyle = (minHeight: string): React.CSSProperties => ({
  minHeight,
  display: "grid",
  placeItems: "center",
  gap: "12px",
  textAlign: "center",
  color: "#4b5563",
});

const loadingSpinnerStyle: React.CSSProperties = {
  width: "34px",
  height: "34px",
  borderRadius: "999px",
  border: "3px solid #d2deea",
  borderTopColor: "#2b95e8",
  animation: "shared-loading-spin 0.8s linear infinite",
};

const LoadingState = ({
  title,
  description,
  minHeight = "300px",
}: LoadingStateProps) => {
  return (
    <div style={loadingStateStyle(minHeight)} aria-live="polite" aria-busy="true">
      <style>{`@keyframes shared-loading-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={loadingSpinnerStyle} />
      <div>
        <p style={{ margin: 0, fontWeight: 700 }}>{title}</p>
        {description ? <p style={{ margin: "4px 0 0 0" }}>{description}</p> : null}
      </div>
    </div>
  );
};

export default LoadingState;