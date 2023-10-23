import React, { useState, useEffect } from "react";
import { updateSourceFile } from "typescript";

const AskMyPdf: React.FC = () => {
  const [question, setQuestion] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [displayedAnswer, setDisplayedAnswer] = useState<string>("");
  const [loading, setLoading] = useState(false);
  
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (question === "") return setAnswer("Please enter a question.")

    setLoading(true);
    try {
      const res = await fetch("/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
        }),
      });

      const data: { answer: string } = await res.json();
      if (data.answer) setAnswer(data.answer);
      else setAnswer("An unexpected error has occured.");
    } catch (err) {
      setAnswer("An unexpected error has occured.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let index = 0;
    setDisplayedAnswer(answer[index]);

    const typeEffect = setInterval(() => {
      if (index < answer.length - 1) {
        setDisplayedAnswer((prev) => prev + answer[index]);
        index++;
      } else {
        clearInterval(typeEffect);
      }
    }, 20);

    return () => clearInterval(typeEffect);
  }, [answer]);

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="p-6 bg-white  rounded border border-gray-200 shadow">
        <h2 className="text-2xl font-bold mb-4">Ask My PDF</h2>{" "}
        <p className="mb-4 text-gray-600">
          This is an experiment using AI to make a PDF's content more
          accessible. Current PDF:{" "}
          <a
            href="https://www.dec.ny.gov/docs/wildlife_pdf/trapedman.pdf"
            target="_blank"
            className="font-medium"
          >
            Trapping Furbearers: An Introduction to Responsible Trapping
          </a>
        </p>
        <form onSubmit={handleFormSubmit}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What is your question?"
            className="p-2 rounded w-full mb-4 border  focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
            rows={4}
          />
          <div className={"flex items-center gap-5 flex-wrap"}>
            <button
              type="submit"
              className="bg-black text-white p-2 px-4 rounded mb-4 flex gap-4 items-center"
            >
              Ask question{" "}
              {loading && (
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
            </button>
          </div>
        </form>
        {displayedAnswer && (
          <div className="bg-white p-4 border rounded">{displayedAnswer}</div>
        )}
      </div>
      <p className={"mt-4"}>
        <a href="https://lebich.dev" target="_blank" className="font-medium">
          lebich.dev
        </a>
      </p>
    </div>
  );
};

export default AskMyPdf;
