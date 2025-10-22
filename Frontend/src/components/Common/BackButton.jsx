import { useNavigate } from "react-router-dom";

export function BackButton({ label = "Volver", fallback = "/", className = "" }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`btn btn-ghost btn-sm md:btn-md gap-2 ${className}`.trim()}
    >
      ← {label}
    </button>
  );
}

