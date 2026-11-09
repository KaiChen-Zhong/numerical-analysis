import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ProgressState = {
  seen: Record<string, number>;
  mastered: Record<string, boolean>;
  mixupKnown: Record<string, boolean>;
  proofsDone: Record<string, boolean>;
  exercisesDone: Record<string, boolean>;
  aiMastered: Record<string, boolean>;
  movesDone: Record<string, boolean>;
  examsDone: Record<string, boolean>;
  lastChapterId: string | null;
  lastSectionId: string | null;
  lastAiLessonId: string | null;
  lastMoveId: string | null;
  markSeen: (chapterId: string, sectionId: string) => void;
  markAiSeen: (lessonId: string) => void;
  markMove: (id: string) => void;
  toggleMastered: (chapterId: string, sectionId: string) => void;
  setMastered: (chapterId: string, sectionId: string, value: boolean) => void;
  toggleAiMastered: (lessonId: string) => void;
  toggleMove: (id: string) => void;
  toggleExam: (id: string) => void;
  toggleMixup: (id: string) => void;
  toggleProof: (id: string) => void;
  toggleExercise: (id: string) => void;
  reset: () => void;
};

export function sectionKey(chapterId: string, sectionId: string) {
  return `${chapterId}:${sectionId}`;
}

const empty = {
  seen: {} as Record<string, number>,
  mastered: {} as Record<string, boolean>,
  mixupKnown: {} as Record<string, boolean>,
  proofsDone: {} as Record<string, boolean>,
  exercisesDone: {} as Record<string, boolean>,
  aiMastered: {} as Record<string, boolean>,
  movesDone: {} as Record<string, boolean>,
  examsDone: {} as Record<string, boolean>,
  lastChapterId: null as string | null,
  lastSectionId: null as string | null,
  lastAiLessonId: null as string | null,
  lastMoveId: null as string | null,
};

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      ...empty,
      markSeen: (chapterId, sectionId) =>
        set((s) => ({
          seen: { ...s.seen, [sectionKey(chapterId, sectionId)]: Date.now() },
          lastChapterId: chapterId,
          lastSectionId: sectionId,
        })),
      markAiSeen: (lessonId) =>
        set({ lastAiLessonId: lessonId }),
      markMove: (id) => set({ lastMoveId: id }),
      toggleMastered: (chapterId, sectionId) =>
        set((s) => {
          const k = sectionKey(chapterId, sectionId);
          return { mastered: { ...s.mastered, [k]: !s.mastered[k] } };
        }),
      setMastered: (chapterId, sectionId, value) =>
        set((s) => ({
          mastered: { ...s.mastered, [sectionKey(chapterId, sectionId)]: value },
        })),
      toggleAiMastered: (lessonId) =>
        set((s) => {
          const prev = s.aiMastered ?? {};
          return { aiMastered: { ...prev, [lessonId]: !prev[lessonId] } };
        }),
      toggleMove: (id) =>
        set((s) => {
          const prev = s.movesDone ?? {};
          return { movesDone: { ...prev, [id]: !prev[id] } };
        }),
      toggleExam: (id) =>
        set((s) => {
          const prev = s.examsDone ?? {};
          return { examsDone: { ...prev, [id]: !prev[id] } };
        }),
      toggleMixup: (id) =>
        set((s) => ({ mixupKnown: { ...s.mixupKnown, [id]: !s.mixupKnown[id] } })),
      toggleProof: (id) =>
        set((s) => ({ proofsDone: { ...s.proofsDone, [id]: !s.proofsDone[id] } })),
      toggleExercise: (id) =>
        set((s) => ({
          exercisesDone: { ...s.exercisesDone, [id]: !s.exercisesDone[id] },
        })),
      reset: () => set({ ...empty }),
    }),
    { name: "na-lecture-progress-v1", skipHydration: true },
  ),
);
