import { NarrationPlayer } from "./narration-player";

import { useEffect, useState } from "react";

const Typewriter = ({ text, delay }: { text: string; delay: number }) => {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  // const scrollToBottom = () => {
  //   const container = document.getElementById("narrative-container");
  //   if (container && container.scrollTop < 0) {
  //     const sc = document.getElementById("scroll-end-div");
  //     sc?.scrollIntoView({ behavior: "instant" });
  //     console.log("scrolled");
  //   }
  // };

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prevText) => prevText + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);
        // scrollToBottom();
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return <span>{currentText}</span>;
};

export default Typewriter;

export const TextBlock = ({
  text,
  blockId,
  offerAudio,
  hideOutput,
  didComplete,
  useTypeEffect,
}: {
  text: string;
  blockId?: string;
  offerAudio?: boolean;
  hideOutput?: boolean;
  didComplete?: boolean;
  useTypeEffect?: boolean;
}) => {
  if (hideOutput) {
    return null;
  }

  return (
    <div className="group">
      <div
        data-blocktype="text-block"
        className="whitespace-pre-wrap text-normal hover:!bg-background group-hover:bg-sky-300/10 rounded-md"
      >
        {useTypeEffect ? (
          <>{didComplete && <Typewriter text={text} delay={25} />}</>
        ) : (
          <> {text} </>
        )}
      </div>
      {blockId && offerAudio && didComplete && (
        <div className="w-full flex items-center justify-center mt-2">
          <div className="w-full px-2">
            <div className="border-t border-foreground/20 w-full px-2" />
          </div>
          <NarrationPlayer blockId={blockId} />
          <div className="w-full px-2">
            <div className="border-t border-foreground/20 w-full px-2" />
          </div>
        </div>
      )}
    </div>
  );
};
