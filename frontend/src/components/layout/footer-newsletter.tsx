"use client";

export function FooterNewsletter() {
  return (
    <form
      className="flex"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder="Seu e-mail"
        className="flex-1 bg-white/10 border border-white/20 rounded-l-lg px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/40"
      />
      <button
        type="submit"
        className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 rounded-r-lg transition-colors"
      >
        Enviar
      </button>
    </form>
  );
}
