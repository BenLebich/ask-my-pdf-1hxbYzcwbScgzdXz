import React, { useState } from "react";

const AskMyPdf: React.FC = () => {
  const [question, setQuestion] = useState<string>("");
  const [displayedAnswer, setDisplayedAnswer] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    try {
      event.preventDefault();
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
      typeInAnswer(data.answer);
    } catch (err) {
      typeInAnswer("An unexpected error has occured.");
    } finally {
      setLoading(false);
    }
  };

  const typeInAnswer = (text: string) => {
    let index = 0;
    setDisplayedAnswer(text[index]);

    const typeEffect = setInterval(() => {
      if (index < text.length - 1) {
        setDisplayedAnswer((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(typeEffect);
      }
    }, 20);
  };

  return (
    <div className="p-6 bg-white w-full max-w-md mx-auto rounded border border-gray-200 shadow">
      <div className="flex justify-between gap-4 flex-wrap"><h2 className="text-2xl font-bold mb-4">Ask My PDF</h2> <p>
        <a href="https://lebich.dev" target="_blank" className="font-medium">
          lebich.dev
        </a>
      </p></div>
      <p className="mb-4 text-gray-600">
        This is an experiment using AI to make a PDF's content more accessible. Current PDF:{" "}
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
      </form>

      {displayedAnswer && (
        <div className="bg-white p-4 border rounded">
          {displayedAnswer}
        </div>
      )}

     
    </div>
  );
};

export default AskMyPdf;
