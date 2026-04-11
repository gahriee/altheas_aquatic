export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div className="bg-coral-500/10 border border-coral-500/20 text-coral-500 px-5 py-3.5 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300" role="alert">
      <span className="block sm:inline font-medium text-sm">{message}</span>
    </div>
  );
}
