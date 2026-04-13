import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import ApiCall from "../../../config";
import { baseUrl } from "../../../config";
import {
  MdArrowBack,
  MdCheckCircle,
  MdPending,
  MdAssignment,
  MdLockOutline,
  MdCancel,
  MdAutoAwesome,
} from "react-icons/md";

// Shared type-config from teacher's AiTask
import { TASK_TYPES, OPTION_COLORS } from "../../teacher/ai-task/AiTask";
import { StudentContinueTextGame } from "../../teacher/ai-task/ContinueTextGame";

// ─── helpers ─────────────────────────────────────────────────────────────────

const getBadgeInfo = (type) =>
  TASK_TYPES.find((t) => t.key === type) || {
    label: type,
    icon: <MdAssignment className="h-4 w-4" />,
    badge: "bg-gray-100 text-gray-700",
  };

// ─── Student TEST card (interactive, lockable after submit) ───────────────────

const StudentTestCard = ({ index, question, selected, onSelect, locked }) => {
  const options = [
    { key: "A", value: question.optionA },
    { key: "B", value: question.optionB },
    { key: "C", value: question.optionC },
    { key: "D", value: question.optionD },
  ].filter((o) => o.value);

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
      <div className="mb-3 flex items-start gap-3">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
          {index}
        </span>
        <p className="font-medium leading-relaxed text-gray-800 dark:text-gray-100">
          {question.question}
        </p>
      </div>

      <div className="ml-10 mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map(({ key, value }) => {
          const isSelected = selected === key;
          const isCorrect = question.correctAnswer === key;

          let cls =
            "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-150 cursor-pointer select-none";

          if (!locked) {
            cls += isSelected
              ? " border-indigo-500 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-200 dark:border-indigo-400"
              : ` ${OPTION_COLORS[key] || "bg-gray-50 border-gray-200 text-gray-700"} hover:opacity-80`;
          } else {
            if (isCorrect) {
              cls +=
                " border-green-400 bg-green-50 text-green-800 dark:border-green-600 dark:bg-green-900/20 dark:text-green-300";
            } else if (isSelected && !isCorrect) {
              cls +=
                " border-red-400 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/20 dark:text-red-300";
            } else {
              cls +=
                " border-gray-200 bg-gray-50 text-gray-400 opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-500";
            }
          }

          return (
            <button
              key={key}
              disabled={locked}
              onClick={() => !locked && onSelect(key)}
              className={cls}
            >
              <span className="font-bold">{key}.</span>
              <span className="flex-1 text-left">{value}</span>
              {locked && isCorrect && (
                <MdCheckCircle className="ml-auto h-4 w-4 flex-shrink-0 text-green-600" />
              )}
              {locked && isSelected && !isCorrect && (
                <MdCancel className="ml-auto h-4 w-4 flex-shrink-0 text-red-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Student MATCHING game (lock-in all pairs, then reveal result) ───────────

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const StudentMatchingGame = ({ questions, onComplete }) => {
  const pairs = useMemo(
    () =>
      questions
        .filter((q) => q.left && q.right)
        .map((q, i) => ({ id: i, left: q.left, right: q.right })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questions.length]
  );

  const [leftItems] = useState(() => pairs.map((p) => ({ id: p.id, text: p.left })));
  const [rightItems] = useState(() =>
    shuffle(pairs.map((p) => ({ id: p.id, text: p.right })))
  );

  // tentativePairs: Map<leftId, rightId> — changeable until submit
  const [tentativePairs, setTentativePairs] = useState(new Map());
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [lines, setLines] = useState([]);

  const containerRef = useRef(null);
  const leftRefs = useRef({});
  const rightRefs = useRef({});

  const total = pairs.length;
  const pairedCount = tentativePairs.size;
  const correctCount = submitted
    ? [...tentativePairs.entries()].filter(([lId, rId]) => lId === rId).length
    : 0;

  // Draw lines whenever pairs change — tentative (indigo) or final (green/red)
  useEffect(() => {
    if (tentativePairs.size === 0) { setLines([]); return; }
    requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;
      const cRect = container.getBoundingClientRect();
      const newLines = [];
      tentativePairs.forEach((rightId, leftId) => {
        const leftEl = leftRefs.current[leftId];
        const rightEl = rightRefs.current[rightId];
        if (!leftEl || !rightEl) return;
        const lRect = leftEl.getBoundingClientRect();
        const rRect = rightEl.getBoundingClientRect();
        newLines.push({
          id: `${leftId}-${rightId}`,
          x1: lRect.right - cRect.left,
          y1: (lRect.top + lRect.bottom) / 2 - cRect.top,
          x2: rRect.left - cRect.left,
          y2: (rRect.top + rRect.bottom) / 2 - cRect.top,
          correct: leftId === rightId,
        });
      });
      setLines(newLines);
    });
  }, [submitted, tentativePairs]);

  // Notify parent on submit
  useEffect(() => {
    if (submitted) {
      onComplete?.(correctCount, total);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted]);

  const handleLeftClick = (id) => {
    if (submitted) return;
    // Toggle selection; re-clicking an already-paired left allows re-pairing
    setSelectedLeft((prev) => (prev === id ? null : id));
  };

  const handleRightClick = (id) => {
    if (submitted || selectedLeft === null) return;
    const newPairs = new Map(tentativePairs);
    const currentRight = newPairs.get(selectedLeft);
    // Clicking the same right that's already paired to this left → unpair
    if (currentRight === id) {
      newPairs.delete(selectedLeft);
      setTentativePairs(newPairs);
      setSelectedLeft(null);
      return;
    }
    // Remove any other left→id mapping so each right can only be used once
    for (const [lId, rId] of newPairs.entries()) {
      if (rId === id) newPairs.delete(lId);
    }
    newPairs.set(selectedLeft, id);
    setTentativePairs(newPairs);
    setSelectedLeft(null);
  };

  const handleSubmit = () => {
    setSelectedLeft(null);
    setSubmitted(true);
  };

  if (pairs.length === 0) return null;

  return (
    <div ref={containerRef} className="relative rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
      {/* SVG connection lines — indigo while tentative, green/red after submit */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" style={{ zIndex: 0 }}>
        <defs>
          <marker id="dot-green" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <circle cx="4" cy="4" r="3" fill="#22c55e" />
          </marker>
          <marker id="dot-red" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <circle cx="4" cy="4" r="3" fill="#ef4444" />
          </marker>
          <marker id="dot-indigo" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <circle cx="4" cy="4" r="3" fill="#6366f1" />
          </marker>
          <marker id="dot-indigo-start" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <circle cx="4" cy="4" r="3" fill="#6366f1" />
          </marker>
        </defs>
        {lines.map((line) => {
          const color = submitted
            ? line.correct ? "#22c55e" : "#ef4444"
            : "#6366f1";
          const markerId = submitted
            ? line.correct ? "dot-green" : "dot-red"
            : "dot-indigo";
          return (
            <line
              key={line.id}
              x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
              stroke={color}
              strokeWidth={submitted ? 2 : 2}
              strokeDasharray={submitted ? "6 3" : "0"}
              strokeLinecap="round"
              strokeOpacity={submitted ? 1 : 0.65}
              markerStart="url(#dot-indigo-start)"
              markerEnd={`url(#${markerId})`}
            />
          );
        })}
      </svg>

      {/* Header */}
      <div className="relative mb-4 flex items-center justify-between" style={{ zIndex: 1 }}>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {submitted
            ? "Natijalar ko'rsatilmoqda"
            : selectedLeft !== null
              ? "Endi o'ng tarafdagi mos juftni tanlang"
              : "Chap elementni bosing, keyin mosini tanlang"}
        </p>
        <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-sm font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
          {submitted ? `${correctCount}/${total}` : `${pairedCount}/${total}`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative mb-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700" style={{ zIndex: 1 }}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${submitted
              ? correctCount === total
                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                : "bg-gradient-to-r from-red-400 to-rose-500"
              : "bg-gradient-to-r from-indigo-500 to-purple-500"
            }`}
          style={{ width: total > 0 ? `${((submitted ? correctCount : pairedCount) / total) * 100}%` : "0%" }}
        />
      </div>

      {/* Result banner — shown only after submit */}
      {submitted && (
        <div
          className={`relative mb-4 flex items-center gap-2 rounded-xl px-4 py-3 ${correctCount === total
              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
            }`}
          style={{ zIndex: 1 }}
        >
          {correctCount === total
            ? <MdCheckCircle className="h-5 w-5 flex-shrink-0" />
            : <MdLockOutline className="h-5 w-5 flex-shrink-0" />}
          <span className="font-semibold">
            {correctCount === total
              ? "Barcha juftliklar to'g'ri! 🎉"
              : `${correctCount} ta to'g'ri, ${total - correctCount} ta noto'g'ri — xatolar qizil bilan.`}
          </span>
          <span className="ml-auto flex items-center gap-1 text-xs opacity-60">
            <MdLockOutline className="h-4 w-4" /> Yakunlandi
          </span>
        </div>
      )}

      {/* Column headers */}
      <div className="relative mb-1 grid" style={{ gridTemplateColumns: "1fr 72px 1fr", zIndex: 1 }}>
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-gray-400">Tushunchalar</p>
        <div />
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-gray-400">Ta'riflar</p>
      </div>

      {/* Rows */}
      <div className="relative flex flex-col gap-3" style={{ zIndex: 1 }}>
        {leftItems.map((leftItem, rowIdx) => {
          const rightItem = rightItems[rowIdx];
          const isLeftPaired = tentativePairs.has(leftItem.id);
          const isLeftCorrect = isLeftPaired && tentativePairs.get(leftItem.id) === leftItem.id;
          const rightPickedByLeftId = rightItem
            ? [...tentativePairs.entries()].find(([, rId]) => rId === rightItem.id)?.[0]
            : undefined;
          const isRightUsed = rightPickedByLeftId !== undefined;
          const isRightCorrect = rightPickedByLeftId !== undefined && rightPickedByLeftId === rightItem?.id;

          return (
            <div key={leftItem.id} className="grid items-stretch" style={{ gridTemplateColumns: "1fr 72px 1fr" }}>
              {/* Left button */}
              <button
                ref={(el) => { leftRefs.current[leftItem.id] = el; }}
                onClick={() => handleLeftClick(leftItem.id)}
                disabled={submitted}
                className={`flex h-full items-center rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${submitted && isLeftCorrect
                    ? "cursor-default border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300"
                    : submitted && isLeftPaired
                      ? "cursor-default border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300"
                      : submitted && !isLeftPaired
                        ? "cursor-default border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-500"
                        : isLeftPaired
                          ? selectedLeft === leftItem.id
                            ? "border-indigo-500 bg-indigo-50 text-indigo-800 shadow-md ring-2 ring-indigo-300 dark:border-indigo-400 dark:bg-indigo-900/30 dark:text-indigo-200"
                            : "border-purple-300 bg-purple-50 text-purple-800 hover:border-indigo-400 dark:border-purple-600 dark:bg-purple-900/20 dark:text-purple-300"
                          : selectedLeft === leftItem.id
                            ? "border-indigo-500 bg-indigo-50 text-indigo-800 shadow-md ring-2 ring-indigo-300 dark:border-indigo-400 dark:bg-indigo-900/30 dark:text-indigo-200"
                            : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:border-indigo-500"
                  }`}
              >
                <span className="flex items-center gap-2">
                  {submitted && isLeftCorrect && <MdCheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />}
                  {submitted && isLeftPaired && !isLeftCorrect && <MdCancel className="h-4 w-4 flex-shrink-0 text-red-500" />}
                  {leftItem.text}
                </span>
              </button>

              <div />

              {/* Right button */}
              {rightItem && (() => {
                const canClick = !submitted && selectedLeft !== null;
                return (
                  <button
                    ref={(el) => { rightRefs.current[rightItem.id] = el; }}
                    onClick={() => handleRightClick(rightItem.id)}
                    disabled={submitted || selectedLeft === null}
                    className={`flex h-full items-center rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${submitted && isRightCorrect
                        ? "cursor-default border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300"
                        : submitted && isRightUsed
                          ? "cursor-default border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300"
                          : submitted
                            ? "cursor-default border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-500"
                            : isRightUsed
                              ? canClick
                                ? "border-purple-300 bg-purple-50 text-purple-700 hover:border-green-400 hover:bg-green-50/50 dark:border-purple-600 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:border-green-500"
                                : "border-purple-200 bg-purple-50 text-purple-700 opacity-80 dark:border-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
                              : canClick
                                ? "border-gray-200 bg-white text-gray-700 hover:border-green-400 hover:bg-green-50/50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:border-green-500"
                                : "border-gray-200 bg-gray-50 text-gray-400 opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500"
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      {submitted && isRightCorrect && <MdCheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />}
                      {submitted && isRightUsed && !isRightCorrect && <MdCancel className="h-4 w-4 flex-shrink-0 text-red-500" />}
                      {rightItem.text}
                    </span>
                  </button>
                );
              })()}
            </div>
          );
        })}
      </div>

      {/* Submit button — only shown before finalizing */}
      {!submitted && (
        <div className="relative mt-5" style={{ zIndex: 1 }}>
          <button
            onClick={handleSubmit}
            disabled={pairedCount === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5 text-base font-bold text-white shadow-md hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-40 transition-all"
          >
            <MdCheckCircle className="h-5 w-5" />
            Yakunlash ({pairedCount}/{total} juft tanlangan)
          </button>
          {pairedCount > 0 && pairedCount < total && (
            <p className="mt-2 text-center text-xs text-amber-600 dark:text-amber-400">
              Hali {total - pairedCount} ta chap element juftlanmagan. Shunda ham yuborish mumkin.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Student CROSSWORD game (real grid, no reset) ─────────────────────────────

function buildCrosswordLayout(questions) {
  const GRID = 25;
  const center = Math.floor(GRID / 2);
  const cells = new Map();
  const placements = [];

  const get = (r, c) => cells.get(`${r},${c}`) ?? null;
  const set = (r, c, ch) => cells.set(`${r},${c}`, ch);
  const has = (r, c) => cells.has(`${r},${c}`);

  function canPlace(word, row, col, dir) {
    for (let i = 0; i < word.length; i++) {
      const r = dir === "across" ? row : row + i;
      const c = dir === "across" ? col + i : col;
      if (r < 0 || r >= GRID || c < 0 || c >= GRID) return false;
      const ex = get(r, c);
      if (ex !== null && ex !== word[i]) return false;
    }
    if (dir === "across") {
      if (has(row, col - 1) || has(row, col + word.length)) return false;
    } else {
      if (has(row - 1, col) || has(row + word.length, col)) return false;
    }
    for (let i = 0; i < word.length; i++) {
      const r = dir === "across" ? row : row + i;
      const c = dir === "across" ? col + i : col;
      if (get(r, c) === null) {
        if (dir === "across") {
          if (has(r - 1, c) || has(r + 1, c)) return false;
        } else {
          if (has(r, c - 1) || has(r, c + 1)) return false;
        }
      }
    }
    return true;
  }

  function doPlace(word, clue, row, col, dir) {
    for (let i = 0; i < word.length; i++) {
      const r = dir === "across" ? row : row + i;
      const c = dir === "across" ? col + i : col;
      set(r, c, word[i]);
    }
    placements.push({ word, clue, row, col, dir });
  }

  const words = questions
    .map((q) => ({
      word: (q.correctAnswer || "").toUpperCase().replace(/[^A-Z]/g, ""),
      clue: q.question || "",
    }))
    .filter((w) => w.word.length >= 2);

  if (words.length === 0)
    return {
      placements: [],
      cells,
      cellNumbers: new Map(),
      bounds: { minR: 0, maxR: 0, minC: 0, maxC: 0 },
    };

  doPlace(
    words[0].word,
    words[0].clue,
    center,
    center - Math.floor(words[0].word.length / 2),
    "across"
  );

  for (let wi = 1; wi < words.length; wi++) {
    const { word, clue } = words[wi];
    let placed = false;
    for (const pl of placements) {
      if (placed) break;
      const newDir = pl.dir === "across" ? "down" : "across";
      for (let li = 0; li < word.length && !placed; li++) {
        for (let pi = 0; pi < pl.word.length && !placed; pi++) {
          if (word[li] === pl.word[pi]) {
            const row =
              pl.dir === "across" ? pl.row - li : pl.row + pi;
            const col =
              pl.dir === "across" ? pl.col + pi : pl.col - li;
            if (canPlace(word, row, col, newDir)) {
              doPlace(word, clue, row, col, newDir);
              placed = true;
            }
          }
        }
      }
    }
  }

  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
  for (const key of cells.keys()) {
    const [r, c] = key.split(",").map(Number);
    minR = Math.min(minR, r);
    maxR = Math.max(maxR, r);
    minC = Math.min(minC, c);
    maxC = Math.max(maxC, c);
  }

  const sorted = [...placements].sort((a, b) =>
    a.row !== b.row ? a.row - b.row : a.col - b.col
  );
  const cellNumbers = new Map();
  let num = 1;
  for (const pl of sorted) {
    const key = `${pl.row},${pl.col}`;
    if (!cellNumbers.has(key)) cellNumbers.set(key, num++);
    pl.number = cellNumbers.get(key);
  }

  return { placements, cells, cellNumbers, bounds: { minR, maxR, minC, maxC } };
}

const StudentCrosswordGame = ({ questions, onComplete }) => {
  const layout = useMemo(() => buildCrosswordLayout(questions), [questions]);
  const { placements, cells, cellNumbers, bounds } = layout;
  const [userInput, setUserInput] = useState({});
  const [checked, setChecked] = useState(false);

  if (placements.length === 0) {
    return (
      <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
        <p className="text-sm text-gray-400">Krossvord yaratilmadi.</p>
      </div>
    );
  }

  const { minR, maxR, minC, maxC } = bounds;
  const numRows = maxR - minR + 1;
  const numCols = maxC - minC + 1;

  const handleInput = (r, c, val) => {
    if (checked) return;
    const letter = val.replace(/[^A-Za-z]/g, "").toUpperCase().slice(-1);
    setUserInput((prev) => ({ ...prev, [`${r},${c}`]: letter }));
  };

  const totalCells = cells.size;
  const correctCells = checked
    ? [...cells.entries()].filter(([k, v]) => userInput[k] === v).length
    : 0;
  const isComplete = checked && correctCells === totalCells;

  const across = placements
    .filter((p) => p.dir === "across")
    .sort((a, b) => a.number - b.number);
  const down = placements
    .filter((p) => p.dir === "down")
    .sort((a, b) => a.number - b.number);

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800 space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {placements.length} ta so'z
        </p>
        <div className="flex items-center gap-2">
          {checked && (
            <span
              className={`rounded-full px-3 py-0.5 text-sm font-bold ${isComplete
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                }`}
            >
              {correctCells}/{totalCells}
            </span>
          )}
          {checked ? (
            <span className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              <MdLockOutline className="h-4 w-4" /> Yakunlandi
            </span>
          ) : (
            <button
              onClick={() => {
                const correctCount = [...cells.entries()].filter(
                  ([k, v]) => userInput[k] === v
                ).length;
                onComplete?.(correctCount, cells.size);
                setChecked(true);
              }}
              className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
            >
              <MdCheckCircle className="h-4 w-4" /> Tekshirish
            </button>
          )}
        </div>
      </div>

      {/* Result banners */}
      {isComplete && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-green-700 dark:bg-green-900/20 dark:text-green-400">
          <MdCheckCircle className="h-5 w-5 flex-shrink-0" />
          <span className="font-semibold">Barcha so'zlar to'g'ri! 🎉</span>
        </div>
      )}
      {checked && !isComplete && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
          <MdLockOutline className="h-5 w-5 flex-shrink-0" />
          <span className="font-semibold">
            Tekshirildi. Noto'g'ri javoblar qizil bilan belgilangan.
          </span>
        </div>
      )}

      <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
        {/* Grid */}
        <div className="overflow-x-auto flex-shrink-0">
          <div
            className="inline-grid gap-0.5"
            style={{ gridTemplateColumns: `repeat(${numCols}, 40px)` }}
          >
            {Array.from({ length: numRows }, (_, ri) =>
              Array.from({ length: numCols }, (_, ci) => {
                const r = ri + minR;
                const c = ci + minC;
                const key = `${r},${c}`;
                const isActive = cells.has(key);
                const cellNum = cellNumbers.get(key);

                if (!isActive) {
                  return (
                    <div
                      key={key}
                      className="w-10 h-10 bg-gray-800 dark:bg-gray-950 rounded-sm"
                    />
                  );
                }

                const correctLetter = cells.get(key);
                const displayLetter = userInput[key] || "";
                const isCorrect = checked && displayLetter === correctLetter;
                const isWrong =
                  checked &&
                  displayLetter.length > 0 &&
                  displayLetter !== correctLetter;

                return (
                  <div key={key} className="relative w-10 h-10">
                    {cellNum && (
                      <span className="absolute top-0.5 left-1 text-[9px] font-bold text-gray-500 dark:text-gray-400 leading-none z-10 select-none">
                        {cellNum}
                      </span>
                    )}
                    <input
                      value={displayLetter}
                      readOnly={checked}
                      onChange={(e) => handleInput(r, c, e.target.value)}
                      className={`w-full h-full text-center text-sm font-bold uppercase border-2 rounded-sm focus:outline-none transition-colors pt-2 ${isCorrect
                          ? "bg-green-100 border-green-400 text-green-800 dark:bg-green-900/30 dark:border-green-600 dark:text-green-300"
                          : isWrong
                            ? "bg-red-100 border-red-400 text-red-800 dark:bg-red-900/30 dark:border-red-600 dark:text-red-300"
                            : checked
                              ? "bg-gray-50 border-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:border-gray-500 dark:text-gray-500"
                              : "bg-white border-gray-300 text-gray-900 hover:border-indigo-400 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-500 dark:text-white"
                        }`}
                    />
                  </div>
                );
              })
            ).flat()}
          </div>
        </div>

        {/* Clue lists */}
        <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
          {across.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                → Gorizontal
              </h4>
              <div className="space-y-1.5">
                {across.map((p) => (
                  <div key={`a-${p.number}`} className="flex gap-2 text-sm">
                    <span className="flex-shrink-0 font-bold text-indigo-600 dark:text-indigo-400 min-w-[20px]">
                      {p.number}.
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {p.clue}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {down.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                ↓ Vertikal
              </h4>
              <div className="space-y-1.5">
                {down.map((p) => (
                  <div key={`d-${p.number}`} className="flex gap-2 text-sm">
                    <span className="flex-shrink-0 font-bold text-purple-600 dark:text-purple-400 min-w-[20px]">
                      {p.number}.
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {p.clue}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Student TABLE game — drag-and-drop + click fallback ─────────────────────

const CHIP_PALETTE = [
  { bg: "#8b5cf6", ringRgb: "139,92,246" },   // violet
  { bg: "#3b82f6", ringRgb: "59,130,246" },    // blue
  { bg: "#10b981", ringRgb: "16,185,129" },    // emerald
  { bg: "#f59e0b", ringRgb: "245,158,11" },    // amber
  { bg: "#f43f5e", ringRgb: "244,63,94" },     // rose
  { bg: "#14b8a6", ringRgb: "20,184,166" },    // teal
  { bg: "#6366f1", ringRgb: "99,102,241" },    // indigo
  { bg: "#f97316", ringRgb: "249,115,22" },    // orange
];

const StudentTableGame = ({ tableData, onComplete }) => {
  const data = useMemo(() => {
    if (!tableData) return null;
    try { return typeof tableData === "string" ? JSON.parse(tableData) : tableData; }
    catch { return null; }
  }, [tableData]);

  // Fix: treat null, undefined, or whitespace-only cells as empty
  const emptyCells = useMemo(() => {
    if (!data) return [];
    const cells = [];
    (data.rows || []).forEach((row, ri) =>
      row.forEach((cell, ci) => {
        if (!cell || String(cell).trim() === "") cells.push({ ri, ci });
      })
    );
    return cells;
  }, [data]);

  const hasOptions = Boolean(data?.options?.length);

  // Assign a color from the palette per unique option text
  const colorMap = useMemo(() => {
    const map = {};
    (data?.options || []).forEach((opt, i) => { map[opt] = CHIP_PALETTE[i % CHIP_PALETTE.length]; });
    return map;
  }, [data?.options]);

  const [pool, setPool] = useState(() => {
    if (!data?.options?.length) return [];
    return shuffle([...data.options]).map((opt, i) => ({ id: `opt-${i}`, text: opt }));
  });
  const [placements, setPlacements] = useState({});
  const [selected, setSelected] = useState(null); // click-to-pick fallback
  const [textInputs, setTextInputs] = useState({});
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState({});
  const [dragOver, setDragOver] = useState(null); // cell key being hovered

  // Use refs to avoid stale closures in drag handlers
  const dragChipRef = useRef(null);
  const dragFromCellRef = useRef(null);

  if (!data?.columns) {
    return <div className="rounded-xl bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">Jadval ma'lumoti topilmadi</div>;
  }

  const { columns, rows, answers } = data;
  const total = emptyCells.length;
  const filledCount = hasOptions
    ? emptyCells.filter(({ ri, ci }) => placements[`${ri}-${ci}`]).length
    : emptyCells.filter(({ ri, ci }) => (textInputs[`${ri}-${ci}`] || "").trim()).length;
  const allFilled = filledCount === total && total > 0;

  // ─── HTML5 Drag-and-Drop handlers ────────────────────────────────────────

  const handlePoolDragStart = (e, chip) => {
    dragChipRef.current = chip;
    dragFromCellRef.current = null;
    e.dataTransfer.effectAllowed = "move";
    setSelected(null);
  };

  const handleCellChipDragStart = (e, chip, cellKey) => {
    dragChipRef.current = chip;
    dragFromCellRef.current = cellKey;
    e.dataTransfer.effectAllowed = "move";
    setSelected(null);
  };

  const handleCellDragOver = (e, key) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(key);
  };

  const handleCellDragLeave = () => setDragOver(null);

  const handleCellDrop = (e, ri, ci) => {
    e.preventDefault();
    setDragOver(null);
    const chip = dragChipRef.current;
    const fromCell = dragFromCellRef.current;
    if (!chip || checked) return;

    const key = `${ri}-${ci}`;
    if (fromCell === key) { dragChipRef.current = null; dragFromCellRef.current = null; return; }

    const existing = placements[key];
    const newP = { ...placements, [key]: { id: chip.id, text: chip.text } };
    if (fromCell) delete newP[fromCell]; // remove from source cell

    const newPool = pool.filter((c) => c.id !== chip.id);
    if (existing && existing.id !== chip.id) {
      // displaced chip: if came from pool originally, send back to pool; else free it
      if (!fromCell) newPool.push(existing); // existing chip came from pool → return to pool
      else newPool.push(existing); // always return displaced to pool
    }
    setPlacements(newP);
    setPool(newPool);
    dragChipRef.current = null;
    dragFromCellRef.current = null;
  };

  const handlePoolDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };

  const handlePoolDrop = (e) => {
    e.preventDefault();
    const chip = dragChipRef.current;
    const fromCell = dragFromCellRef.current;
    if (!chip || checked) return;

    if (fromCell) {
      // Return chip from cell to pool
      const newP = { ...placements };
      delete newP[fromCell];
      setPlacements(newP);
      if (!pool.find((c) => c.id === chip.id)) setPool((prev) => [...prev, chip]);
    }
    dragChipRef.current = null;
    dragFromCellRef.current = null;
    setDragOver(null);
  };

  const handleDragEnd = () => {
    dragChipRef.current = null;
    dragFromCellRef.current = null;
    setDragOver(null);
  };

  // ─── Click-to-pick (mobile / fallback) ───────────────────────────────────

  const handlePoolClick = (chip) => {
    if (checked) return;
    setSelected((prev) => (prev?.id === chip.id ? null : chip));
  };

  const handleCellClick = (ri, ci) => {
    const key = `${ri}-${ci}`;
    if (checked) return;
    if (!selected) {
      const chip = placements[key];
      if (!chip) return;
      const newP = { ...placements }; delete newP[key];
      setPlacements(newP);
      setPool((prev) => [...prev, chip]);
      setSelected(chip);
      return;
    }
    const existing = placements[key];
    const newP = { ...placements, [key]: { id: selected.id, text: selected.text } };
    const newPool = pool.filter((c) => c.id !== selected.id);
    if (existing && existing.id !== selected.id) newPool.push(existing);
    setPlacements(newP);
    setPool(newPool);
    setSelected(null);
  };

  // ─── Check ───────────────────────────────────────────────────────────────

  const handleCheck = () => {
    const res = {}; let correct = 0;
    emptyCells.forEach(({ ri, ci }) => {
      const key = `${ri}-${ci}`;
      const userVal = (hasOptions ? placements[key]?.text : textInputs[key] || "").trim().toLowerCase();
      const correctVal = (answers?.[ri]?.[ci] || "").trim().toLowerCase();
      const ok = userVal === correctVal;
      res[key] = ok;
      if (ok) correct++;
    });
    setResults(res);
    setChecked(true);
    onComplete(correct, total);
  };

  const correctCount = Object.values(results).filter(Boolean).length;
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return (
    <div className="space-y-5 rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-800">

      {/* Instruction banner */}
      {hasOptions && !checked && (
        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 dark:from-indigo-900/20 dark:to-purple-900/20">
          <span className="text-xl">🎯</span>
          <div>
            <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Variantlarni jadvalga tashlang</p>
            <p className="text-xs text-indigo-500 dark:text-indigo-400">Sichqoncha bilan torting (Drag & Drop) yoki bosib tanlang</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border-2 border-gray-100 dark:border-gray-700 shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-600 to-purple-600">
              {columns.map((col, i) => (
                <th key={i} className="px-4 py-3.5 text-left font-bold text-white tracking-wide">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className={`transition-colors ${ri % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-slate-50 dark:bg-gray-900/40"}`}
              >
                {row.map((cell, ci) => {
                  const key = `${ri}-${ci}`;
                  const isEmpty = !cell || String(cell).trim() === "";
                  const placed = placements[key];
                  const isHovered = dragOver === key;
                  const chipColor = placed ? (colorMap[placed.text] || CHIP_PALETTE[0]) : null;

                  return (
                    <td key={ci} className="border-b border-gray-100 px-3 py-2 dark:border-gray-700/50">
                      {isEmpty ? (
                        checked ? (
                          // ── Result view ──
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                              results[key]
                                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                                : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                            }`}>
                              {results[key] ? "✓" : "✗"}{" "}
                              {hasOptions ? (placed?.text || "—") : (textInputs[key] || "—")}
                            </span>
                            {!results[key] && (
                              <span className="text-xs text-gray-400">
                                → <strong className="text-emerald-600 dark:text-emerald-400">{answers?.[ri]?.[ci]}</strong>
                              </span>
                            )}
                          </div>
                        ) : hasOptions ? (
                          // ── Drop zone + click target ──
                          <div
                            onDragOver={(e) => handleCellDragOver(e, key)}
                            onDragLeave={handleCellDragLeave}
                            onDrop={(e) => handleCellDrop(e, ri, ci)}
                            onClick={() => handleCellClick(ri, ci)}
                            style={placed ? { backgroundColor: chipColor.bg } : undefined}
                          className={`min-h-[40px] min-w-[110px] cursor-pointer rounded-xl border-2 px-3 py-1.5 text-center text-sm font-semibold transition-all duration-150 ${
                              placed
                                ? "border-solid border-transparent text-white shadow-sm"
                                : isHovered
                                  ? "scale-105 border-indigo-400 bg-indigo-50 shadow-md dark:bg-indigo-900/20"
                                  : selected
                                    ? "border-dashed border-indigo-400 bg-indigo-50/60 dark:border-indigo-500 dark:bg-indigo-900/10"
                                    : "border-dashed border-gray-300 text-gray-300 hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-gray-600 dark:hover:border-indigo-600"
                            }`}
                          >
                            {placed ? (
                              <span
                                draggable
                                onDragStart={(e) => handleCellChipDragStart(e, placed, key)}
                                onDragEnd={handleDragEnd}
                                className="cursor-grab select-none active:cursor-grabbing"
                              >
                                {placed.text}
                              </span>
                            ) : (
                              <span className="pointer-events-none select-none text-xs opacity-60">— — —</span>
                            )}
                          </div>
                        ) : (
                          // ── Text input ──
                          <input
                            type="text"
                            value={textInputs[key] || ""}
                            onChange={(e) => setTextInputs((p) => ({ ...p, [key]: e.target.value }))}
                            className="w-full min-w-[90px] rounded-xl border-2 border-gray-200 px-3 py-1.5 text-sm focus:border-indigo-400 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            placeholder="..."
                          />
                        )
                      ) : (
                        <span className="font-medium text-gray-800 dark:text-gray-200">{cell}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Options pool */}
      {hasOptions && !checked && (
        <div
          onDragOver={handlePoolDragOver}
          onDrop={handlePoolDrop}
          className="rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-slate-100 p-4 dark:border-gray-700 dark:from-gray-900/60 dark:to-gray-800/60"
        >
          <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            🃏 Variantlar — {pool.length} ta qoldi
          </p>
          <div className="flex flex-wrap gap-2.5">
            {pool.map((chip) => {
              const color = colorMap[chip.text] || CHIP_PALETTE[0];
              const isSel = selected?.id === chip.id;
              return (
                <div
                  key={chip.id}
                  draggable
                  onDragStart={(e) => handlePoolDragStart(e, chip)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handlePoolClick(chip)}
                  style={{
                    backgroundColor: color.bg,
                    ...(isSel ? { boxShadow: `0 0 0 4px rgba(${color.ringRgb},0.45)` } : {}),
                  }}
                  className={`cursor-grab select-none rounded-2xl px-4 py-2.5 text-sm font-bold text-white shadow transition-all hover:opacity-90 active:cursor-grabbing active:scale-95 ${
                    isSel ? "scale-110 shadow-xl" : "hover:scale-105 hover:shadow-md"
                  }`}
                >
                  ⠿ {chip.text}
                </div>
              );
            })}
            {pool.length === 0 && (
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">✓ Barcha variantlar joylashtirildi!</p>
            )}
          </div>
          {selected && (
            <p className="mt-3 animate-pulse text-center text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              👆 &ldquo;{selected.text}&rdquo; tanlandi — bo'sh katakka bosing
            </p>
          )}
        </div>
      )}

      {/* Check button / Result banner */}
      {!checked ? (
        <button
          onClick={handleCheck}
          disabled={!allFilled}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4 text-lg font-bold text-white shadow-md hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <MdCheckCircle className="h-6 w-6" />
          Tekshirish ({filledCount}/{total} to'ldirildi)
        </button>
      ) : (
        <div className={`flex items-center justify-between rounded-2xl px-6 py-5 shadow-md ${
          pct === 100
            ? "bg-gradient-to-r from-green-500 to-emerald-600"
            : pct >= 50
              ? "bg-gradient-to-r from-amber-500 to-orange-500"
              : "bg-gradient-to-r from-red-500 to-rose-600"
        } text-white`}>
          <div>
            <p className="text-lg font-bold">
              {pct === 100 ? "🎉 Ajoyib! Hammasi to'g'ri!" : pct >= 50 ? "👍 Yaxshi harakat!" : "💪 Yana bir urinib ko'ring!"}
            </p>
            <p className="text-sm opacity-80">Jadval to'ldirildi • {pct}%</p>
          </div>
          <p className="text-4xl font-black">{correctCount}/{total}</p>
        </div>
      )}
    </div>
  );
};

// ─── Generic read-only card for ORAL / ESSAY / PRACTICAL / etc. ───────────────

const TextOnlyCard = ({ index, question }) => (
  <div className="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
    <div className="flex items-start gap-3">
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
        {index}
      </span>
      <p className="font-medium leading-relaxed text-gray-800 dark:text-gray-100">
        {question.question}
      </p>
    </div>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────

const StudentTaskDetail = () => {
  const { taskId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [task, setTask] = useState(location.state?.task || null);
  const [loading, setLoading] = useState(!location.state?.task);
  const [error, setError] = useState("");

  const studentId = localStorage.getItem("studentId");

  // TEST: one-attempt-only state
  // answers: { [questionId: string]: "A"|"B"|"C"|"D" }
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);       // { correct, total }
  const [feedback, setFeedback] = useState(null); // AI feedback string
  const [breakdown, setBreakdown] = useState([]); // per-question result
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [previousResult, setPreviousResult] = useState(null);
  const [saving, setSaving] = useState(false);

  // ── Check if student already completed this task (localStorage → backend) ────
  useEffect(() => {
    if (!taskId || !studentId) return;
    const stored = localStorage.getItem(
      `student_task_done_${studentId}_${taskId}`
    );
    if (stored) {
      try {
        const r = JSON.parse(stored);
        setAlreadyDone(true);
        setPreviousResult(r);
        if (r.correct !== undefined && r.total !== undefined) {
          setScore({ correct: r.correct, total: r.total });
          if (r.answers) setAnswers(r.answers);
          setSubmitted(true);
        }
      } catch { }
    } else {
      // Non-blocking backend check — failure just means student can still try
      ApiCall(
        `/api/v1/task/result/check/${taskId}/${studentId}`,
        "GET"
      )
        .then((res) => {
          if (res?.data) {
            const r = res.data;
            setAlreadyDone(true);
            setPreviousResult(r);
            if (r.correct !== undefined && r.total !== undefined) {
              setScore({ correct: r.correct, total: r.total });
              if (r.answers) setAnswers(r.answers);
              setSubmitted(true);
            }
            localStorage.setItem(
              `student_task_done_${studentId}_${taskId}`,
              JSON.stringify(r)
            );
          }
        })
        .catch(() => { });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, studentId]);

  useEffect(() => {
    if (task) return;
    const fetchTask = async () => {
      setLoading(true);
      try {
        const res = await ApiCall(`/api/v1/task/${taskId}`, "GET");
        setTask(res?.data || null);
      } catch (err) {
        console.error(err);
        setError("Vazifani yuklashda xato yuz berdi.");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId, task]);

  // ── Persist result (localStorage first, then backend) ─────────────────────
  const saveResult = async (type, correct, total, savedAnswers) => {
    if (!studentId || !taskId) return;
    const result = {
      taskId,
      studentId,
      type,
      correct,
      total,
      percent: total > 0 ? Math.round((correct / total) * 100) : 0,
      completedAt: new Date().toISOString(),
      ...(savedAnswers ? { answers: savedAnswers } : {}),
    };
    // Persist locally immediately so retake is blocked even if backend fails
    localStorage.setItem(
      `student_task_done_${studentId}_${taskId}`,
      JSON.stringify(result)
    );
    setAlreadyDone(true);
    setPreviousResult(result);
    // Send to backend in the background
    setSaving(true);
    try {
      await ApiCall("/api/v1/task/result", "POST", result);
    } catch (err) {
      console.error("Task result backend save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  // Called by MATCHING / CROSSWORD game components when student finishes
  const handleGameComplete = (correct, total) => {
    setScore({ correct, total });
    setSubmitted(true);
    saveResult(task?.type, correct, total);
  };

  const handleSubmit = async () => {
    const questions = task?.questions || [];
    // Build { questionId -> chosenOption } for backend
    const formattedAnswers = {};
    questions.forEach((q, i) => {
      const key = q.id ?? i;
      if (answers[key]) formattedAnswers[key] = answers[key];
    });

    setSaving(true);
    try {
      const res = await ApiCall("/api/v1/test/submit", "POST", {
        taskId: task.id,
        studentId,
        answers: formattedAnswers,
      });
      const data = res?.data || {};
      const { correct = 0, total = questions.length, feedback: fb, breakdown: bd = [] } = data;
      setScore({ correct, total });
      setFeedback(fb || null);
      setBreakdown(bd);
      setSubmitted(true);
      // Save to localStorage so future visits show it as done
      const meta = {
        taskId,
        studentId,
        correct,
        total,
        percent: total > 0 ? Math.round((correct / total) * 100) : 0,
        answers: formattedAnswers,
        completedAt: new Date().toISOString(),
      };
      localStorage.setItem(`student_task_done_${studentId}_${taskId}`, JSON.stringify(meta));
      setAlreadyDone(true);
      setPreviousResult(meta);
    } catch (err) {
      // Fallback: client-side scoring if backend unreachable
      let correct = 0;
      questions.forEach((q, i) => {
        if (answers[q.id ?? i] === q.correctAnswer) correct++;
      });
      setScore({ correct, total: questions.length });
      setSubmitted(true);
      await saveResult("TEST", correct, questions.length, formattedAnswers);
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="relative">
          <div className="h-20 w-20 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <MdAssignment className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-indigo-600" />
        </div>
        <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-200">
          Yuklanmoqda...
        </p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        <MdCancel className="h-5 w-5 flex-shrink-0" />
        {error || "Vazifa topilmadi."}
      </div>
    );
  }

  const questions = task.questions || [];
  const isTest = task.type === "TEST";
  const isMatching = task.type === "MATCHING";
  const isCrossword = task.type === "CROSSWORD";
  const isTable = task.type === "TABLE";
  const isContinueText = task.type === "CONTINUE_TEXT";
  const badgeInfo = getBadgeInfo(task.type);

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
      >
        <MdArrowBack className="h-5 w-5" />
        Orqaga
      </button>

      {/* Header card — same gradient style as AiTask */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shadow-lg">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <MdAssignment className="h-7 w-7" />
            </div>
            <div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeInfo.badge}`}
              >
                {badgeInfo.icon}
                {badgeInfo.label}
              </span>
              <h1 className="mt-1 text-2xl font-bold">{task.title}</h1>
            </div>
          </div>
          <div>
            {task.approved ? (
              <span className="flex items-center gap-1 rounded-full bg-green-500/30 px-2.5 py-0.5 text-xs font-semibold text-green-200">
                <MdCheckCircle className="h-3.5 w-3.5" /> Tasdiqlangan
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-200">
                <MdPending className="h-3.5 w-3.5" /> Tasdiq kutmoqda
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {task.teacherName && (
            <div>
              <p className="text-indigo-300">O'qituvchi</p>
              <p className="font-semibold text-white">{task.teacherName}</p>
            </div>
          )}
          {task.lessonName && (
            <div>
              <p className="text-indigo-300">Dars</p>
              <p className="font-semibold text-white">{task.lessonName}</p>
            </div>
          )}
          <div>
            <p className="text-indigo-300">Savollar</p>
            <p className="font-semibold text-white">{questions.length} ta</p>
          </div>
          {submitted && score !== null && (
            <div>
              <p className="text-indigo-300">Natija</p>
              <p className="font-semibold text-white">
                {score.correct}/{score.total}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Already completed notice */}
      {alreadyDone && previousResult && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-800/50 dark:bg-amber-900/20">
          <MdLockOutline className="h-6 w-6 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300">
              Siz bu vazifani allaqachon bajargansiz
            </p>
            {previousResult.completedAt && (
              <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-400">
                {new Date(previousResult.completedAt).toLocaleString("uz-UZ")}
                {previousResult.percent !== undefined
                  ? ` • ${previousResult.percent}% to'g'ri`
                  : ""}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Score banner — shown after any submission with a numeric result */}
      {submitted && score !== null && (
        <div
          className={`flex items-center justify-between rounded-2xl px-6 py-4 shadow-md ${score.correct === score.total
              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
              : score.correct >= score.total / 2
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                : "bg-gradient-to-r from-red-500 to-rose-600 text-white"
            }`}
        >
          <div>
            <p className="text-lg font-bold">
              {score.correct === score.total
                ? "🎉 Ajoyib! To'liq to'g'ri!"
                : score.correct >= score.total / 2
                  ? "👍 Yaxshi natija!"
                  : "💪 Ko'proq o'qish kerak!"}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm opacity-90">
              {score.correct}/{score.total} ta to'g'ri javob
              <span className="mx-1 opacity-50">•</span>
              <MdLockOutline className="h-3.5 w-3.5" /> Bir marta bajarildi
            </p>
          </div>
          <div className="text-4xl font-black">
            {Math.round((score.correct / score.total) * 100)}%
          </div>
        </div>
      )}

      {/* ── Question area ── */}
      {questions.length === 0 ? (
        <div className="flex items-center justify-center rounded-2xl bg-white py-12 shadow-sm dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            Savollar topilmadi
          </p>
        </div>
      ) : isMatching ? (
        alreadyDone ? null : (
          <StudentMatchingGame
            questions={questions}
            onComplete={handleGameComplete}
          />
        )
      ) : isCrossword ? (
        alreadyDone ? null : (
          <StudentCrosswordGame
            questions={questions}
            onComplete={handleGameComplete}
          />
        )
      ) : isTable ? (
        alreadyDone ? null : (
          <StudentTableGame
            tableData={questions[0]?.question}
            onComplete={handleGameComplete}
          />
        )
      ) : isContinueText ? (
        alreadyDone ? null : (
          <StudentContinueTextGame
            questions={questions}
            onComplete={handleGameComplete}
          />
        )
      ) : isTest ? (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <StudentTestCard
              key={q.id ?? i}
              index={i + 1}
              question={q}
              selected={answers[q.id ?? i]}
              onSelect={(key) =>
                !submitted && setAnswers((prev) => ({ ...prev, [q.id ?? i]: key }))
              }
              locked={submitted}
            />
          ))}

          {/* ONE-TIME submit — hidden after submission */}
          {!submitted && (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length === 0 || saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-700 px-6 py-4 font-semibold text-white shadow-md hover:from-green-400 hover:to-green-800 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Tekshirilmoqda...
                </>
              ) : (
                <>
                  <MdCheckCircle className="h-5 w-5" />
                  Tekshirish va yakunlash ({Object.keys(answers).length}/{questions.length})
                </>
              )}
            </button>
          )}

          {/* AI Feedback card */}
          {submitted && feedback && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-700 dark:bg-indigo-900/20">
              <div className="mb-2 flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                <MdAutoAwesome className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-bold">AI Tahlil</span>
              </div>
              <p className="text-sm leading-relaxed text-indigo-800 dark:text-indigo-200">{feedback}</p>
            </div>
          )}

          {/* Lock notice — shown after submission, no retry button */}
          {submitted && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
              <MdLockOutline className="h-4 w-4" />
              Test yakunlandi. Qayta urinib bo'lmaydi.
            </div>
          )}
        </div>
      ) : (
        // ORAL, ESSAY, PRACTICAL, DIAGRAM, TABLE, CONTINUE_TEXT, SELF
        <div className="space-y-3">
          {questions.map((q, i) => (
            <TextOnlyCard key={i} index={i + 1} question={q} />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentTaskDetail;
