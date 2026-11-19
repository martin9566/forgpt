import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  HandCoins,
  HeartPulse,
  House,
  Leaf,
  LogOut,
  MapPin,
  Scale,
  Send,
  ShieldCheck,
  Sprout,
  UserRoundPen,
  UsersRound,
  X,
} from "lucide-react";
import { BENEFIT_CATEGORIES } from "../shared/profile-options.js";
import { ELIGIBILITY_SCHEMES } from "../shared/eligibility-schemes.js";
import { apiRequest } from "./api.js";
import EligibilityChecker from "./EligibilityChecker.jsx";

const categoryIcons = [
  BookOpen,
  BriefcaseBusiness,
  HandCoins,
  Sprout,
  House,
  HeartPulse,
  ShieldCheck,
  UsersRound,
  ArrowRight,
];

const homeBenefitCategories = [
  { value: "justice_welfare", label: "Justice and welfare" },
  ...BENEFIT_CATEGORIES,
];

export default function HomePage({ user, onEditProfile, onSignedOut }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [message, setMessage] = useState("");
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [isAsking, setIsAsking] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: user.name || "",
    email: user.email || "",
    message: "",
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactFeedback, setContactFeedback] = useState(null);
  const [isEligibilityOpen, setIsEligibilityOpen] = useState(false);
  const [isJusticeAssistantOpen, setIsJusticeAssistantOpen] = useState(false);
  const [assistantArea, setAssistantArea] = useState("Justice and welfare");
  const [eligibilitySchemeId, setEligibilitySchemeId] = useState("");
  const firstName = user.name.trim().split(/\s+/)[0];

  useEffect(() => {
    if (!isJusticeAssistantOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsJusticeAssistantOpen(false);
        setIsEligibilityOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isJusticeAssistantOpen]);

  const signOut = async () => {
    setIsSigningOut(true);
    setMessage("");

    try {
      await apiRequest("/api/auth/signout", { method: "POST" });
      onSignedOut();
    } catch (error) {
      setMessage(error.message || "Unable to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  const editProfile = () => {
    setIsProfileMenuOpen(false);
    onEditProfile();
  };

  const closeJusticeAssistant = () => {
    setIsJusticeAssistantOpen(false);
    setIsEligibilityOpen(false);
  };

  const submitContact = async (event) => {
    event.preventDefault();
    if (isSubmittingContact) return;

    setIsSubmittingContact(true);
    setContactFeedback(null);
    try {
      await apiRequest("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      setContactForm((current) => ({ ...current, message: "" }));
      setContactFeedback({ type: "success", text: "Thanks for reaching out. Your message has been submitted." });
    } catch (error) {
      setContactFeedback({ type: "error", text: error.message || "We couldn't submit your message. Please try again." });
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const askQuestion = async (event) => {
    event.preventDefault();
    const question = chatQuestion.trim();

    if (!question || isAsking) return;

    const asksForPersonalEligibility = /\b(am i|do i|can i|check my|my eligibility|do we qualify|do i qualify)\b/i.test(question);
    if (asksForPersonalEligibility) {
      const normalizedQuestion = question.toLowerCase();
      const schemeAliases = [
        ["nari-adalat", ["nari adalat"]],
        ["mission-vatsalya-foster-care", ["mission vatsalya", "foster care"]],
        ["free-legal-aid-uttarakhand", ["free legal aid", "legal aid"]],
        ["gaura-shakti", ["gaura shakti"]],
        ["protection-domestic-violence-haryana", ["domestic violence", "protection against domestic violence"]],
        ["sc-st-atrocity-assistance-puducherry", ["atrocity assistance", "sc/st prevention of atrocities"]],
        ["uttarakhand-women-victim-compensation", ["uttarakhand compensation", "women victim compensation"]],
        ["mp-police-internship", ["police internship", "mp police internship"]],
        ["goa-child-committee-grant", ["child committee grant", "goa village", "municipal child committee"]],
        ["mp-crime-victim-compensation", ["mp crime victim compensation", "madhya pradesh crime victim compensation"]],
      ];
      const schemeId = schemeAliases.find(([, aliases]) => aliases.some((alias) => normalizedQuestion.includes(alias)))?.[0] || "";
      const selectedSchemeId = ELIGIBILITY_SCHEMES.some((scheme) => scheme.id === schemeId) ? schemeId : "";
      setEligibilitySchemeId(selectedSchemeId);
      setIsEligibilityOpen(true);
      setChatQuestion("");
      return;
    }

    setChatQuestion("");
    setIsAsking(true);
    setChatMessages((current) => [...current, { role: "user", text: question }]);

    try {
      const { data } = await apiRequest("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question }),
      });
      setChatMessages((current) => [
        ...current,
        { role: "assistant", text: data.answer, sources: data.sources || [] },
      ]);
    } catch (error) {
      setChatMessages((current) => [
        ...current,
        { role: "assistant", text: error.message || "Unable to answer right now." },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <main className="home-shell" id="home">
      <header className="home-navbar">
        <a className="home-brand" href="#home" aria-label="SchemeSaathi home">
          <span className="brand-symbol" aria-hidden="true">S</span>
          <span>SchemeSaathi</span>
        </a>

        <nav className="home-nav-links" aria-label="Main navigation">
          <a href="#benefit-areas">Explore benefits</a>
          <a href="#about-us">About us</a>
          <a href="#contact-us">Contact us</a>
        </nav>

        <div className="home-profile-menu">
          <button
            type="button"
            className="home-profile-trigger"
            aria-expanded={isProfileMenuOpen}
            aria-haspopup="menu"
            onClick={() => setIsProfileMenuOpen((open) => !open)}
          >
            <span className="profile-avatar" aria-hidden="true">
              {firstName.charAt(0).toUpperCase()}
            </span>
            <span className="profile-trigger-name">{firstName}</span>
            <ChevronDown size={16} aria-hidden="true" />
          </button>

          {isProfileMenuOpen && (
            <div className="home-profile-dropdown" role="menu">
              <div className="dropdown-user">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>
              <button type="button" role="menuitem" onClick={editProfile}>
                <UserRoundPen size={16} aria-hidden="true" />
                Edit profile
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={signOut}
                disabled={isSigningOut}
              >
                <LogOut size={16} aria-hidden="true" />
                {isSigningOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          )}
        </div>
      </header>

      {message && <p className="home-message" role="alert">{message}</p>}

      <section className="home-hero" aria-labelledby="home-heading">
        <div className="hero-copy">
          <h1 id="home-heading">Government support, made easier to find.</h1>
          <p>
            Hello, {firstName}. Explore benefit areas and use your profile to
            make your search for relevant government schemes more focused.
          </p>
          <div className="hero-actions">
            <a className="hero-primary-link" href="#benefit-areas">
              Explore benefit areas <ArrowRight size={17} aria-hidden="true" />
            </a>
            <a className="hero-secondary-link" href="#about-us">
              About SchemeSaathi <ArrowDown size={15} aria-hidden="true" />
            </a>
          </div>
        </div>

        <span className="hero-orbit hero-orbit-one" aria-hidden="true" />
        <span className="hero-orbit hero-orbit-two" aria-hidden="true" />
        <span className="hero-spark hero-spark-one" aria-hidden="true" />
        <span className="hero-spark hero-spark-two" aria-hidden="true" />
      </section>

      <section className="home-categories" id="benefit-areas">
        <div className="section-heading">
          <div>
            <h2>What kind of support are you looking for?</h2>
          </div>
        </div>
        <div
          className="benefit-deck"
          role="region"
          aria-label="Benefit areas"
          tabIndex={0}
        >
          {homeBenefitCategories.map((category, index) => {
            const Icon = category.value === "justice_welfare"
              ? Scale
              : categoryIcons[index - 1];
            const iconStyleIndex = category.value === "justice_welfare" ? 0 : index - 1;
            const cardContent = (
              <>
                <img
                  className="benefit-card-image"
                  src={`/benefit-areas/${category.value}.svg`}
                  alt=""
                  aria-hidden="true"
                />
                <span className={`benefit-icon benefit-icon-${iconStyleIndex + 1}`}>
                  <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <h3>{category.label}</h3>
              </>
            );
            const opensAssistant = ["justice_welfare", "women_child_welfare"].includes(category.value);
            return opensAssistant ? (
              <button
                className="benefit-card benefit-card-action"
                key={category.value}
                type="button"
                onClick={() => {
                  setAssistantArea(category.label);
                  setIsJusticeAssistantOpen(true);
                }}
                aria-label={`Open the ${category.label} scheme assistant`}
              >
                {cardContent}
              </button>
            ) : (
              <article className="benefit-card" key={category.value}>
                {cardContent}
              </article>
            );
          })}
        </div>
      </section>

      <section className="home-about" id="about-us">
        <div className="about-overview">
          <div className="about-title-row">
            <div className="about-mark" aria-hidden="true"><Leaf size={23} /></div>
            <div>
              <p className="home-eyebrow">About SchemeSaathi</p>
              <h2>Government schemes can be hard to make sense of.</h2>
            </div>
          </div>
          <p className="about-summary">
            We built SchemeSaathi to make it easier to explore available
            support, ask questions about scheme documents, and check a few
            eligibility conditions where we have them.
          </p>
          <p className="about-summary about-summary-last">
            It is a small project, and it is still growing as we add more
            schemes and improve the information available.
          </p>
        </div>
        <aside className="about-note-card">
          <span className="about-note-icon"><ShieldCheck size={19} aria-hidden="true" /></span>
          <div>
            <h3>A useful starting point, not a final decision</h3>
            <p>
              Answers depend on the documents we have, and scheme rules can
              change. Eligibility checks are preliminary. Please confirm the
              latest details with the relevant government department before
              applying.
            </p>
          </div>
        </aside>
      </section>

      <section className="home-contact" id="contact-us" aria-labelledby="contact-heading">
        <div className="contact-intro">
          <p className="home-eyebrow">Contact us</p>
          <h2 id="contact-heading">Have a question or spotted something we should fix?</h2>
          <p>
            Send us a message. If you’re writing about a scheme, include its
            name so we can understand what you’re referring to.
          </p>
          <p className="contact-privacy-note">Please don’t include sensitive personal, financial, or case information.</p>
        </div>
        <form className="contact-form" onSubmit={submitContact}>
          <div className="contact-form-row">
            <label>
              <span>Your name</span>
              <input
                type="text"
                name="name"
                autoComplete="name"
                maxLength={100}
                required
                value={contactForm.name}
                onChange={(event) => setContactForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label>
              <span>Email address</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                maxLength={254}
                required
                value={contactForm.email}
                onChange={(event) => setContactForm((current) => ({ ...current, email: event.target.value }))}
              />
            </label>
          </div>
          <label className="contact-message-field">
            <span>Your message</span>
            <textarea
              name="message"
              rows={5}
              minLength={5}
              maxLength={2000}
              required
              value={contactForm.message}
              onChange={(event) => setContactForm((current) => ({ ...current, message: event.target.value }))}
              placeholder="How can we help?"
            />
          </label>
          {contactFeedback && (
            <p className={`contact-feedback contact-feedback-${contactFeedback.type}`} role={contactFeedback.type === "error" ? "alert" : "status"}>
              {contactFeedback.text}
            </p>
          )}
          <button className="contact-submit" type="submit" disabled={isSubmittingContact}>
            <span>{isSubmittingContact ? "Submitting…" : "Submit message"}</span>
            {!isSubmittingContact && <Send size={16} aria-hidden="true" />}
          </button>
        </form>
      </section>

      <div className="home-bottom-note">
        <MapPin size={14} aria-hidden="true" />
        Scheme information and eligibility can change. Always verify details
        through the relevant official government source.
      </div>

      <footer className="home-site-footer">
        <a className="home-brand" href="#home" aria-label="SchemeSaathi home">

        </a>
        <nav className="site-footer-links" aria-label="Footer navigation">
          <a href="#benefit-areas">Explore areas</a>
          <a href="#about-us">About us</a>
          <a href="#contact-us">Contact</a>
        </nav>
        <p>© {new Date().getFullYear()} SchemeSaathi</p>
      </footer>

      {isJusticeAssistantOpen && (
        <div
          className="assistant-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeJusticeAssistant();
          }}
        >
          <div
            className="assistant-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="justice-assistant-heading"
          >
            <div className="assistant-modal-heading">
              <div>
                <p className="home-eyebrow">{assistantArea}</p>
                <h2 id="justice-assistant-heading">Scheme assistant</h2>
              </div>
              <button
                type="button"
                className="eligibility-close"
                onClick={closeJusticeAssistant}
                aria-label="Close scheme assistant"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <section className="home-chat assistant-modal-chat" id="scheme-assistant" aria-labelledby="chat-heading">
              <div className="chat-heading">
                <h2 id="chat-heading">Get answers from scheme documents.</h2>
                <p>Ask about eligibility, benefits, or application steps. Answers include document and page references when available.</p>
                <button
                  className="eligibility-open-button"
                  type="button"
                  onClick={() => {
                    setEligibilitySchemeId("");
                    setIsEligibilityOpen(true);
                  }}
                >
                  <ShieldCheck size={16} aria-hidden="true" />
                  Check eligibility
                </button>
              </div>
              <div className="chat-panel">
                <div className="chat-messages" aria-live="polite" aria-relevant="additions">
                  {chatMessages.length === 0 && (
                    <p className="chat-empty">For example: “Who monitors foster care assistance?”</p>
                  )}
                  {chatMessages.map((item, index) => (
                    <article className={`chat-message chat-message-${item.role}`} key={`${item.role}-${index}`}>
                      <p>{item.text}</p>
                      {item.sources?.length > 0 && (
                        <ul className="chat-sources" aria-label="Sources">
                          {item.sources.map((source) => (
                            <li key={`${source.chunk_id}-${source.document}`}>
                              {source.document}{source.pages?.length ? ` · p. ${source.pages.join(", ")}` : ""}
                            </li>
                          ))}
                        </ul>
                      )}
                    </article>
                  ))}
                  {isAsking && <p className="chat-thinking" role="status">Checking the scheme documents…</p>}
                </div>
                <form className="chat-form" onSubmit={askQuestion}>
                  <label className="sr-only" htmlFor="scheme-question">Your question</label>
                  <input
                    id="scheme-question"
                    value={chatQuestion}
                    onChange={(event) => setChatQuestion(event.target.value)}
                    placeholder="Ask a question about a scheme"
                    maxLength={2000}
                    disabled={isAsking}
                  />
                  <button type="submit" aria-label="Send question" disabled={isAsking || !chatQuestion.trim()}>
                    <Send size={17} aria-hidden="true" />
                    <span>{isAsking ? "Working" : "Ask"}</span>
                  </button>
                </form>
                <p className="chat-note">Always confirm current requirements with the official scheme authority.</p>
              </div>
            </section>

            {isEligibilityOpen && (
              <EligibilityChecker
                initialSchemeId={eligibilitySchemeId}
                onClose={() => setIsEligibilityOpen(false)}
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
}
