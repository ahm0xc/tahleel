"use client";

export function OpenInAppButton({ code }: { code: string }) {
  function handleOpen() {
    window.location.href = `tahleel://invite/${code}`;
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-medium transition-colors"
    >
      Open in Tahleel
    </button>
  );
}
