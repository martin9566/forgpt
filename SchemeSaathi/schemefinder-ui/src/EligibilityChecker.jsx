import { useEffect, useState } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { ELIGIBILITY_SCHEMES } from "../shared/eligibility-schemes.js";
import { apiRequest } from "./api.js";

export default function EligibilityChecker({ initialSchemeId = "", onClose }) {
  const [schemeId, setSchemeId] = useState(initialSchemeId);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const scheme = ELIGIBILITY_SCHEMES.find((item) => item.id === schemeId);

  useEffect(() => {
    setSchemeId(initialSchemeId);
  }, [initialSchemeId]);

  const selectScheme = (nextSchemeId) => {
    setSchemeId(nextSchemeId);
    setAnswers({});
    setResult(null);
    setMessage("");
  };

  const updateAnswer = (field, value) => {
    setAnswers((current) => ({ ...current, [field]: value }));
    setResult(null);
    setMessage("");
  };

  const toggleOption = (field, value) => {
    const current = Array.isArray(answers[field]) ? answers[field] : [];
    const exclusive = value === "none" || value === "unsure";
    const next = exclusive
      ? current.includes(value) ? [] : [value]
      : current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current.filter((item) => item !== "none" && item !== "unsure"), value];
    updateAnswer(field, next);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!scheme) {
      setMessage("Choose a scheme to continue.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setResult(null);
    try {
      const { data } = await apiRequest("/api/eligibility/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ schemeId, answers }),
      });
      setResult(data.result);
    } catch (error) {
      setMessage(error.message || "Unable to check eligibility right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="eligibility-section" aria-labelledby="eligibility-heading">
      <div className="eligibility-card">
        <div className="eligibility-card-heading">
          <div>
            <p className="home-eyebrow">Preliminary check</p>
            <h2 id="eligibility-heading">Check scheme eligibility</h2>
            <p>Answer a few questions about the person seeking support. Your answers are used for this check and are not saved.</p>
          </div>
          <button type="button" className="eligibility-close" onClick={onClose} aria-label="Close eligibility check">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <label className="eligibility-scheme-label" htmlFor="eligibility-scheme">Choose a scheme</label>
        <p className="eligibility-availability-note">
          Checks are preliminary and based on the source documents listed with each scheme. Some schemes also require official review, current notifications, or local service availability.
        </p>
        <div className="eligibility-select-wrap">
          <select
            id="eligibility-scheme"
            value={schemeId}
            onChange={(event) => selectScheme(event.target.value)}
          >
            <option value="">Select a scheme</option>
            {ELIGIBILITY_SCHEMES.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <ChevronDown size={17} aria-hidden="true" />
        </div>

        {scheme && (
          <>
            <p className="eligibility-summary">{scheme.summary}</p>
            <form className="eligibility-form" onSubmit={submit}>
              {scheme.questions.map((question) => {
                if (
                  question.requiredWhen &&
                  answers[question.requiredWhen.field] !== question.requiredWhen.value
                ) return null;

                if (question.type === "number") {
                  return (
                    <div className="eligibility-question" key={question.id}>
                      <label htmlFor={`eligibility-${question.id}`}>
                        <span>{question.label}</span>
                        {question.required && <span className="eligibility-required">Required</span>}
                      </label>
                      <input
                        id={`eligibility-${question.id}`}
                        type="number"
                        min={question.min}
                        max={question.max}
                        step="1"
                        value={answers[question.id] ?? ""}
                        onChange={(event) => updateAnswer(question.id, event.target.value)}
                        required={question.required || Boolean(question.requiredWhen)}
                        inputMode="numeric"
                      />
                      {question.help && <p className="eligibility-help">{question.help}</p>}
                    </div>
                  );
                }

                if (question.type === "radio") {
                  return (
                    <fieldset className="eligibility-question" key={question.id}>
                      <legend>
                        <span>{question.label}</span>
                        {question.required && <span className="eligibility-required">Required</span>}
                      </legend>
                      <div className="eligibility-options">
                        {question.options.map((option) => (
                          <label className="eligibility-choice" key={option.value}>
                            <input
                              type="radio"
                              name={`eligibility-${question.id}`}
                              value={option.value}
                              checked={answers[question.id] === option.value}
                              onChange={() => updateAnswer(question.id, option.value)}
                              required={question.required && !answers[question.id]}
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                      </div>
                      {question.help && <p className="eligibility-help">{question.help}</p>}
                    </fieldset>
                  );
                }

                return (
                  <fieldset className="eligibility-question" key={question.id}>
                    <legend>
                      <span>{question.label}</span>
                      {question.required && <span className="eligibility-required">Required</span>}
                    </legend>
                    <div className="eligibility-options eligibility-checkboxes">
                      {question.options.map((option) => (
                        <label className="eligibility-choice" key={option.value}>
                          <input
                            type="checkbox"
                            checked={(answers[question.id] || []).includes(option.value)}
                            onChange={() => toggleOption(question.id, option.value)}
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                    {question.help && <p className="eligibility-help">{question.help}</p>}
                  </fieldset>
                );
              })}

              {message && <p className="eligibility-error" role="alert">{message}</p>}
              <button className="eligibility-submit" type="submit" disabled={isSubmitting}>
                <Check size={17} aria-hidden="true" />
                {isSubmitting ? "Checking…" : "See preliminary result"}
              </button>
            </form>

            {result && (
              <div className={`eligibility-result eligibility-result-${result.decision}`} role="status" aria-live="polite">
                <h3>{result.label}</h3>
                <ul>
                  {result.reasons.map((reason, index) => <li key={`${index}-${reason}`}>{reason}</li>)}
                </ul>
                {result.sources?.length > 0 && (
                  <p className="eligibility-source">
                    Source: {result.sources.map((source) => `${source.document}, p. ${source.pages.join(", ")}`).join("; ")}
                  </p>
                )}
                <p className="eligibility-disclaimer">This is a preliminary criteria check, not an official decision. The responsible authority reviews each application and may use additional rules or current notifications.</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
