import React, { useState, useMemo } from "react";
import { MdCheckCircle, MdCancel, MdLockOutline } from "react-icons/md";

// в”Ђв”Ђв”Ђ Teacher read-only preview в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

export const ContinueTextPreview = ({ questions = [] }) => {
  if (!questions.length) return null;
  return (
    <div className="space-y-3">
      {questions.map((q, i) => {
        const opts = [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean);
        return (
          <div key={i} className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
            <div className="mb-2 flex flex-wrap items-baseline gap-x-2">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                {i + 1}
              </span>
              <span className="font-medium text-gray-800 dark:text-gray-100">{q.question}</span>
              <span className="text-gray-400">в†’</span>
              <span className="rounded-lg bg-green-100 px-2.5 py-0.5 font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                {q.correctAnswer}
              </span>
            </div>
            {opts.length > 0 && (
              <div className="ml-8 flex flex-wrap gap-1.5">
                {opts.map((opt, k) => (
                  <span
                    key={k}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      opt === q.correctAnswer
                        ? "ring-1 ring-green-400 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {opt}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Student interactive game (pick-and-place style) ─────────────────────────

const shuffleArr = (arr) => [...arr].sort(() => Math.random() - 0.5);

export const StudentContinueTextGame = ({ questions = [], onComplete }) => {
  const questionsWithOpts = useMemo(
    () =>
      questions.map((q) => {
        const opts = [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean);
        return { ...q, _opts: opts };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questions.length]
  );

  // Global shuffled pool: all options across all questions with unique ids
  const initialPool = useMemo(() => {
    const all = [];
    questionsWithOpts.forEach((q, qi) =>
      q._opts.forEach((opt, oi) => all.push({ id: `${qi}-${oi}`, text: opt }))
    );
    return shuffleArr(all);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasOpts = questionsWithOpts.some((q) => q._opts.length > 0);

  const [pool, setPool]           = useState(initialPool);
  const [placements, setPlacements] = useState({}); // { qIdx: { id, text } }
  const [selected, setSelected]   = useState(null); // currently held chip
  const [textAnswers, setTextAnswers] = useState({});
  const [checked, setChecked]     = useState(false);
  const [results, setResults]     = useState({});

  const total = questionsWithOpts.length;
  const placedCount = Object.keys(placements).length;
  const fallbackCount = questionsWithOpts.filter((q, i) => !q._opts.length && (textAnswers[i] || "").trim()).length;
  const allAnswered = hasOpts ? placedCount === total : fallbackCount === total;

  // Pick chip from pool (toggle selection)
  const handlePickFromPool = (chip) => {
    if (checked) return;
    setSelected((prev) => (prev?.id === chip.id ? null : chip));
  };

  // Click on a sentence slot
  const handleSlotClick = (qi) => {
    if (checked) return;
    if (!selected) {
      // Pick up chip already placed here
      const chip = placements[qi];
      if (!chip) return;
      const newP = { ...placements };
      delete newP[qi];
      setPlacements(newP);
      setPool((prev) => [...prev, chip]);
      setSelected(chip);
      return;
    }
    // Place selected chip in this slot
    const existing = placements[qi];
    const newP = { ...placements, [qi]: { id: selected.id, text: selected.text } };
    const newPool = pool.filter((c) => c.id !== selected.id);
    if (existing && existing.id !== selected.id) newPool.push(existing);
    setPlacements(newP);
    setPool(newPool);
    setSelected(null);
  };

  const handleCheck = () => {
    let correct = 0;
    const res = {};
    questionsWithOpts.forEach((q, i) => {
      const answer = q._opts.length ? (placements[i]?.text || "") : (textAnswers[i] || "");
      const ok = answer.toLowerCase() === (q.correctAnswer || "").toLowerCase();
      res[i] = ok;
      if (ok) correct++;
    });
    setResults(res);
    setChecked(true);
    onComplete?.(correct, total);
  };

  const correctCount = Object.values(results).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Sentence rows with drop slots */}
      <div className="space-y-3">
        {questionsWithOpts.map((q, i) => {
          const placed = placements[i];
          const isOk = results[i];
          return (
            <div
              key={i}
              className={`rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800 ${
                checked ? (isOk ? "ring-2 ring-green-400" : "ring-2 ring-red-400") : ""
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                  {i + 1}
                </span>
                <span className="font-medium text-gray-800 dark:text-gray-100">{q.question}</span>

                {q._opts.length > 0 ? (
                  /* Drop zone button */
                  <button
                    onClick={() => handleSlotClick(i)}
                    disabled={checked}
                    className={`min-w-[130px] rounded-xl border-2 px-4 py-2 text-left text-sm font-medium transition-all ${
                      checked
                        ? isOk
                          ? "border-green-400 bg-green-50 text-green-700 dark:border-green-600 dark:bg-green-900/20 dark:text-green-300"
                          : "border-red-400 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/20 dark:text-red-300"
                        : placed
                        ? "border-indigo-400 bg-indigo-50 text-indigo-700 hover:opacity-80 dark:border-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300"
                        : selected
                        ? "animate-pulse border-dashed border-indigo-300 bg-indigo-50/50 text-indigo-400"
                        : "border-dashed border-gray-300 text-gray-400 hover:border-gray-400"
                    }`}
                  >
                    {placed ? (
                      <span className="flex items-center gap-1.5">
                        {checked && isOk && <MdCheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />}
                        {checked && !isOk && <MdCancel className="h-4 w-4 flex-shrink-0 text-red-500" />}
                        {placed.text}
                      </span>
                    ) : (
                      <span className="select-none opacity-50">_ _ _ _ _</span>
                    )}
                  </button>
                ) : !checked ? (
                  /* Fallback text input for old tasks without options */
                  <input
                    type="text"
                    value={textAnswers[i] || ""}
                    onChange={(e) => setTextAnswers((p) => ({ ...p, [i]: e.target.value }))}
                    className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Gapni davom ettiring..."
                  />
                ) : (
                  <span className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    isOk ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {textAnswers[i] || "—"}
                  </span>
                )}

                {checked && !isOk && (
                  <span className="text-xs text-gray-500">
                    → <span className="font-semibold text-green-600 dark:text-green-400">{q.correctAnswer}</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Options pool — shown only before checking, only if there are chips */}
      {hasOpts && !checked && (
        <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900/40">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Javoblar ({pool.length} ta)
          </p>
          {pool.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {pool.map((chip) => {
                const isSel = selected?.id === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => handlePickFromPool(chip)}
                    className={`rounded-2xl border-2 px-4 py-2.5 text-sm font-medium select-none transition-all ${
                      isSel
                        ? "scale-105 border-indigo-500 bg-indigo-100 text-indigo-800 shadow-lg ring-2 ring-indigo-200 dark:border-indigo-400 dark:bg-indigo-900/40 dark:text-indigo-100"
                        : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {chip.text}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-green-600 dark:text-green-400">Barcha javoblar joylashtirildi ✓</p>
          )}
          {selected && (
            <p className="mt-3 text-center text-sm font-medium text-indigo-500 dark:text-indigo-400">
              ☝️ "{selected.text}" → bo'sh joyga bosing
            </p>
          )}
        </div>
      )}

      {/* Submit / result banner */}
      {!checked ? (
        <button
          onClick={handleCheck}
          disabled={!allAnswered}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5 font-semibold text-white shadow-md hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MdCheckCircle className="h-5 w-5" />
          Tekshirish ({hasOpts ? placedCount : fallbackCount}/{total} joylashtirildi)
        </button>
      ) : (
        <div
          className={`flex items-center justify-between rounded-2xl px-6 py-4 shadow-md ${
            correctCount === total
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
              : correctCount >= total / 2
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
              : "bg-gradient-to-r from-red-500 to-rose-600 text-white"
          }`}
        >
          <div>
            <p className="text-lg font-bold">
              {correctCount === total
                ? "🎉 Ajoyib! Hammasi to'g'ri!"
                : correctCount >= total / 2
                ? "👍 Yaxshi natija!"
                : "💪 Ko'proq mashq qilish kerak!"}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-sm opacity-90">
              <MdLockOutline className="h-3.5 w-3.5" /> Bir marta bajarildi
            </p>
          </div>
          <p className="text-4xl font-black">{correctCount}/{total}</p>
        </div>
      )}
    </div>
  );
};

