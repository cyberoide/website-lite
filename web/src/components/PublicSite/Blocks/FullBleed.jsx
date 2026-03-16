export function FullBleed({ children, className, style }) {
  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
      <div className={className} style={style}>
        {children}
      </div>
    </div>
  );
}
