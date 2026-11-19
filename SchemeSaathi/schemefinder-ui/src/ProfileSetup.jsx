import { useEffect, useState } from "react";
import { ArrowRight, LogOut } from "lucide-react";
import {
  AGE_GROUPS,
  BENEFIT_CATEGORIES,
  CURRENT_STATUSES,
  INCOME_BANDS,
  SOCIAL_CATEGORIES,
  STATES_AND_TERRITORIES,
} from "../shared/profile-options.js";
import { apiRequest } from "./api.js";

const emptyProfile = {
  state: "",
  district: "",
  ageType: "age_group",
  ageGroup: "",
  dateOfBirth: "",
  category: "",
  currentStatus: "",
  incomeBand: "",
  benefitCategories: [],
};

function getProfileForm(profile) {
  if (!profile) return emptyProfile;

  return {
    state: profile.state,
    district: profile.district ?? "",
    ageType: profile.date_of_birth ? "date_of_birth" : "age_group",
    ageGroup: profile.age_group ?? "",
    dateOfBirth: profile.date_of_birth
      ? String(profile.date_of_birth).slice(0, 10)
      : "",
    category: profile.category ?? "",
    currentStatus: profile.current_status,
    incomeBand: profile.income_band,
    benefitCategories: profile.benefit_categories ?? [],
  };
}

function getOptionLabel(options, value) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export default function ProfileSetup({
  user,
  startEditing = false,
  onCompleted,
  onProfileSaved,
  onCancelEdit,
  onSignedOut,
}) {
  const [profile, setProfile] = useState(emptyProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [hasSavedProfile, setHasSavedProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(startEditing);
  const [showSavedPopup, setShowSavedPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const { data } = await apiRequest("/api/profile");

        if (active) {
          const loadedProfile = getProfileForm(data.profile);
          setProfile(loadedProfile);
          setHasSavedProfile(Boolean(data.profile?.category));
          if (data.profile?.category && !startEditing) {
            onCompleted();
          }
        }
      } catch (error) {
        if (active) {
          setMessage(error.message || "Unable to load your profile.");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [onCompleted, startEditing]);

  const finishProfileSetup = () => {
    setShowSavedPopup(false);
    onProfileSaved();
  };

  const update = (event) => {
    const { name, value } = event.target;
    setProfile((previous) => ({ ...previous, [name]: value }));
    setMessage("");
  };

  const toggleBenefit = (benefit) => {
    setProfile((previous) => ({
      ...previous,
      benefitCategories: previous.benefitCategories.includes(benefit)
        ? previous.benefitCategories.filter((item) => item !== benefit)
        : [...previous.benefitCategories, benefit],
    }));
    setMessage("");
  };

  const saveProfile = async (event) => {
    event.preventDefault();

    if (profile.benefitCategories.length === 0) {
      setMessageType("error");
      setMessage("Select at least one benefit area to personalize your recommendations.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const { data } = await apiRequest("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: profile.state,
          district: profile.district,
          ageGroup: profile.ageType === "age_group" ? profile.ageGroup : null,
          dateOfBirth:
            profile.ageType === "date_of_birth" ? profile.dateOfBirth : null,
          category: profile.category,
          currentStatus: profile.currentStatus,
          incomeBand: profile.incomeBand,
          benefitCategories: profile.benefitCategories,
        }),
      });
      const saved = getProfileForm(data.profile);
      setProfile(saved);
      setHasSavedProfile(true);
      setShowSavedPopup(true);
    } catch (error) {
      setMessageType("error");
      setMessage(error.message || "Unable to save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const signOut = async () => {
    setIsSigningOut(true);
    setMessage("");

    try {
      await apiRequest("/api/auth/signout", { method: "POST" });

      onSignedOut();
    } catch (error) {
      setMessageType("error");
      setMessage(error.message || "Unable to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <main className="profile-shell">
      <header className="profile-topbar">
        <a className="profile-brand" href="/" aria-label="SchemeSaathi home">
          SchemeSaathi
        </a>
        <div className="profile-account">
          <span>Hello, {user.name.trim().split(/\s+/)[0]}</span>
          <button
            type="button"
            className="signout-button"
            onClick={signOut}
            disabled={isSigningOut}
          >
            <LogOut size={16} aria-hidden="true" />
            {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </header>

      <section className="profile-card" aria-labelledby="profile-title">
        {message && (
          <p
            className={`profile-message ${messageType}`}
            role={messageType === "error" ? "alert" : "status"}
          >
            {message}
          </p>
        )}

        {isLoading ? (
          <div className="profile-loading" role="status">
            Loading your profile…
          </div>
        ) : hasSavedProfile && !isEditing ? (
          <div className="profile-home" aria-labelledby="profile-title">
            <div className="profile-intro">
              <p className="profile-eyebrow">Welcome back</p>
              <h1 id="profile-title">
                Your profile is all set, {user.name.trim().split(/\s+/)[0]}.
              </h1>
              <p className="profile-description">
                We’ve saved your details to help personalize scheme
                recommendations. You can update them whenever things change.
              </p>
            </div>

            <div className="saved-profile-details">
              <div className="saved-profile-item">
                <span>Location</span>
                <strong>
                  {profile.state}
                  {profile.district ? ` · ${profile.district}` : ""}
                </strong>
              </div>
              <div className="saved-profile-item">
                <span>Age</span>
                <strong>
                  {profile.ageType === "date_of_birth"
                    ? "Date of birth provided"
                    : getOptionLabel(AGE_GROUPS, profile.ageGroup)}
                </strong>
              </div>
              <div className="saved-profile-item">
                <span>Current status</span>
                <strong>{getOptionLabel(CURRENT_STATUSES, profile.currentStatus)}</strong>
              </div>
              <div className="saved-profile-item">
                <span>Category</span>
                <strong>{getOptionLabel(SOCIAL_CATEGORIES, profile.category)}</strong>
              </div>
              <div className="saved-profile-item">
                <span>Household income</span>
                <strong>{getOptionLabel(INCOME_BANDS, profile.incomeBand)}</strong>
              </div>
              <div className="saved-profile-item saved-benefits">
                <span>Benefits you’re interested in</span>
                <div className="saved-benefit-list">
                  {profile.benefitCategories.map((benefit) => (
                    <span className="saved-benefit-tag" key={benefit}>
                      {getOptionLabel(BENEFIT_CATEGORIES, benefit)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="profile-home-actions">
              <p>Your details stay private to your account.</p>
              <button
                className="primary-button"
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setMessage("");
                }}
              >
                EDIT PROFILE
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="profile-intro">
              <p className="profile-eyebrow">
                {hasSavedProfile ? "Your profile" : "Profile setup"}
              </p>
              <h1 id="profile-title">
                {hasSavedProfile
                  ? "Update your profile"
                  : "Tell us a little about yourself"}
              </h1>
              <p className="profile-description">
                A few details help us find schemes that are more relevant to you.
                You can change them later from your profile menu.
              </p>
              <p className="profile-privacy-note">
                Your profile details are only visible to you.
              </p>
            </div>

            <form className="profile-form" onSubmit={saveProfile}>
          <fieldset className="profile-section">
            <legend>
              Where do you live?
            </legend>
            <p className="section-help">
              Helps identify central and state-specific schemes.
            </p>
            <div className="profile-grid">
              <label className="profile-field">
                <span>State / Union Territory</span>
                <select
                  name="state"
                  value={profile.state}
                  onChange={update}
                  required
                  disabled={isLoading}
                >
                  <option value="">Select your state or territory</option>
                  {STATES_AND_TERRITORIES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </label>
              <label className="profile-field">
                <span>District <em>Optional</em></span>
                <input
                  name="district"
                  type="text"
                  maxLength={100}
                  placeholder="Enter your district"
                  value={profile.district}
                  onChange={update}
                  disabled={isLoading}
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="profile-section">
            <legend>
              What is your age group?
            </legend>
            <p className="section-help">
              Many schemes have age-based eligibility conditions.
            </p>
            <div className="choice-row age-choice">
              {[
                { value: "age_group", label: "Age group" },
                { value: "date_of_birth", label: "Date of birth" },
              ].map((option) => (
                <label className="choice-card" key={option.value}>
                  <input
                    type="radio"
                    name="ageType"
                    value={option.value}
                    checked={profile.ageType === option.value}
                    onChange={update}
                    disabled={isLoading}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {profile.ageType === "age_group" ? (
              <label className="profile-field compact-field">
                <span>Select your age group</span>
                <select
                  name="ageGroup"
                  value={profile.ageGroup}
                  onChange={update}
                  required
                  disabled={isLoading}
                >
                  <option value="">Select an age group</option>
                  {AGE_GROUPS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="profile-field compact-field">
                <span>Date of birth</span>
                <input
                  name="dateOfBirth"
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  value={profile.dateOfBirth}
                  onChange={update}
                  required
                  disabled={isLoading}
                />
              </label>
            )}
          </fieldset>

          <fieldset className="profile-section">
            <legend>
              Which category do you belong to?
            </legend>
            <p className="section-help">
              Some schemes are intended for specific categories. Choose the
              option that applies to you.
            </p>
            <label className="profile-field compact-field">
              <span>Category</span>
              <select
                name="category"
                value={profile.category}
                onChange={update}
                required
                disabled={isLoading}
              >
                <option value="">Select your category</option>
                {SOCIAL_CATEGORIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </fieldset>

          <fieldset className="profile-section">
            <legend>
              What best describes your current status?
            </legend>
            <p className="section-help">
              Useful for education, employment and livelihood schemes.
            </p>
            <label className="profile-field compact-field">
              <span>Current status</span>
              <select
                name="currentStatus"
                value={profile.currentStatus}
                onChange={update}
                required
                disabled={isLoading}
              >
                <option value="">Select your current status</option>
                {CURRENT_STATUSES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </fieldset>

          <fieldset className="profile-section">
            <legend>
              What is your approximate annual household income?
            </legend>
            <p className="section-help">
              An estimate is fine. These are suggested profile bands, not
              universal government eligibility thresholds.
            </p>
            <label className="profile-field compact-field">
              <span>Annual household income</span>
              <select
                name="incomeBand"
                value={profile.incomeBand}
                onChange={update}
                required
                disabled={isLoading}
              >
                <option value="">Select an approximate income band</option>
                {INCOME_BANDS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </fieldset>

          <fieldset className="profile-section">
            <legend>
              What benefits are you looking for?
            </legend>
            <p className="section-help">
              Select all that apply to personalize your recommendations.
            </p>
            <div className="benefit-grid">
              {BENEFIT_CATEGORIES.map((option) => (
                <label className="benefit-option" key={option.value}>
                  <input
                    type="checkbox"
                    checked={profile.benefitCategories.includes(option.value)}
                    onChange={() => toggleBenefit(option.value)}
                    disabled={isLoading}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="profile-actions">
            {hasSavedProfile ? (
              <button
                className="profile-cancel-button"
                type="button"
                onClick={onCancelEdit}
              >
                Cancel
              </button>
            ) : (
              <p>Fields marked optional can be left blank.</p>
            )}
            <button
              className="primary-button"
              type="submit"
              disabled={isLoading || isSaving}
            >
                {isLoading ? "Loading profile…" : isSaving ? "Saving…" : "Save profile"}
              {!isLoading && !isSaving && <ArrowRight size={16} />}
            </button>
          </div>
            </form>
          </>
        )}
      </section>

      {showSavedPopup && (
        <div
          className="profile-modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              finishProfileSetup();
            }
          }}
        >
          <section
            className="profile-success-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-success-title"
            aria-describedby="profile-success-description"
          >
            <div className="success-mark" aria-hidden="true">✓</div>
            <p className="profile-eyebrow">All set</p>
            <h2 id="profile-success-title">Your profile is saved</h2>
            <p id="profile-success-description">
              Thanks for sharing a little about yourself. We’ll use these
              details to help find government schemes that may suit your needs.
            </p>
            <button
              className="primary-button"
              type="button"
              autoFocus
              onClick={finishProfileSetup}
            >
              Continue to SchemeSaathi
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
