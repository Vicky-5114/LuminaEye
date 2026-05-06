interface Props {
  width?: string;
  height?: string;
  rounded?: "sm" | "md" | "lg" | "full";
  className?: string;
}

export default function Skeleton({ width = "100%", height = "1rem", rounded = "md", className = "" }: Props) {
  const roundedClass = { sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg", full: "rounded-full" };
  return (
    <div
      className={`animate-shimmer ${roundedClass[rounded]} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
