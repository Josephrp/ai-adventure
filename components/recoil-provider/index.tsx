"use client";
import { GameState } from "@/lib/game/schema/game_state";
import { ReactNode } from "react";
import { RecoilRoot, SetRecoilState, atom } from "recoil";

const localStorageEffect =
  (key: string) =>
  ({ setSelf, onSet }: { setSelf: any; onSet: any }) => {
    const savedValue = localStorage.getItem(key);
    if (savedValue != null) {
      setSelf(JSON.parse(savedValue));
    }

    onSet((newValue: any, _: any, isReset: any) => {
      isReset
        ? localStorage.removeItem(key)
        : localStorage.setItem(key, JSON.stringify(newValue));
    });
  };

export const recoilGameState = atom({
  key: "GameState",
  default: {} as GameState,
});

export const recoilBackgroundAudioState = atom({
  key: "BackgroundAudioState",
  default: localStorage.getItem("BackgroundAudioState") === "true",
  effects: [localStorageEffect("BackgroundAudioState")],
});

export const recoilBackgroundAudioUrlState = atom<string | undefined>({
  key: "BackgroundAudioUrl",
  default: undefined,
});

export const recoilNarrationAudioState = atom({
  key: "NarrationAudioState",
  default: localStorage.getItem("NarrationAudioState") === "true",
  effects: [localStorageEffect("NarrationAudioState")],
});

export const recoilNarrationAudioUrlState = atom<string | undefined>({
  key: "NarrationAudioUrl",
  default: undefined,
});

export const recoilNarrationBlockIdState = atom<string[]>({
  key: "NarrationBlockIds",
  default: [],
});

function initializeState(
  set: SetRecoilState,
  gameState: GameState,
  backgroundAudioState: boolean,
  narrationAudioState: boolean,
  backgroundAudioUrl?: string,
  narrationAudioUrl?: string,
  narrationBlockId?: string
) {
  set(recoilGameState, gameState);
  set(recoilNarrationAudioState, narrationAudioState);
  set(recoilBackgroundAudioState, backgroundAudioState);
  set(recoilBackgroundAudioUrlState, backgroundAudioUrl);
  set(recoilNarrationAudioUrlState, narrationAudioUrl);
  set(recoilNarrationBlockIdState, narrationBlockId);
}

function RecoilProvider({
  children,
  gameState,
  backgroundAudioState,
  narrationAudioState,
  backgroundAudioUrlState,
  narrationAudioUrlState,
  narrationBlockIdState,
}: {
  children: ReactNode;
  gameState: GameState;
  backgroundAudioState: boolean;
  narrationAudioState: boolean;
  backgroundAudioUrlState?: string;
  narrationAudioUrlState?: string;
  narrationBlockIdState?: string;
}) {
  return (
    <RecoilRoot
      initializeState={({ set }) =>
        initializeState(
          set,
          gameState,
          backgroundAudioState,
          narrationAudioState,
          backgroundAudioUrlState,
          narrationAudioUrlState,
          narrationBlockIdState
        )
      }
    >
      {children}
    </RecoilRoot>
  );
}

export default RecoilProvider;
