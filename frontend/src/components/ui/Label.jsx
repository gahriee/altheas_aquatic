export default function Label({ children, htmlFor, className = '', ...props }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-xs font-semibold uppercase tracking-widest text-sage-400 mb-2 ml-1 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
