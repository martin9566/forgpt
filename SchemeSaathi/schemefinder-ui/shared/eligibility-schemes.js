export const ELIGIBILITY_SCHEMES = [
  {
    id: "mission-vatsalya-foster-care",
    name: "Mission Vatsalya — Foster Care",
    summary: "Preliminary check for a child’s foster-care pathway and the caregiver’s financial-support condition.",
    document: "Mission_Vatsalya_Guidelines_existing.pdf",
    pages: [36, 37],
    questions: [
      {
        id: "childAge",
        type: "number",
        label: "How old is the child who may need foster care?",
        min: 0,
        max: 120,
        required: true,
        help: "Foster care under these criteria is for children under 18. After-care has separate criteria.",
      },
      {
        id: "childSituations",
        type: "checkbox-group",
        label: "Which situations apply to the child? Select all that apply.",
        required: true,
        options: [
          {
            value: "cci_over_two_years",
            label: "The child is 6–18, has lived in a Child Care Institution for over two years, and has not been declared legally free for adoption.",
          },
          {
            value: "parent_terminally_ill",
            label: "A parent is terminally ill and has requested help from the Committee or District Child Protection Unit.",
          },
          {
            value: "care_and_protection",
            label: "The child may be in need of care and protection under the Juvenile Justice Act (for example, without a home, trafficked, abused, exploited, or living/working on the street).",
          },
          { value: "none", label: "None of these apply." },
          { value: "unsure", label: "I’m not sure." },
        ],
      },
      {
        id: "seekingFinancialSupport",
        type: "radio",
        label: "Are you also checking the caregiver family’s eligibility for financial support?",
        required: true,
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No, only foster-care placement" },
          { value: "unsure", label: "I’m not sure" },
        ],
      },
      {
        id: "annualFamilyIncome",
        type: "number",
        label: "What is the caregiver family’s approximate annual income in rupees?",
        min: 0,
        requiredWhen: { field: "seekingFinancialSupport", value: "yes" },
        help: "The guideline states income below ₹8 lakh per year, or a later limit set by the Ministry. This answer is used only for this check and is not saved.",
      },
    ],
  },
  {
    id: "nari-adalat",
    name: "Nari Adalat — Grievance Support",
    summary: "Checks whether someone appears to fit the intended beneficiary group; local service availability is checked separately.",
    document: "Nari_Adalat_SOP_existing.pdf",
    pages: [3, 4],
    questions: [
      {
        id: "womanOrGirl",
        type: "radio",
        label: "Is the person seeking assistance a woman or girl?",
        required: true,
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "unsure", label: "I’m not sure" },
        ],
      },
      {
        id: "issueTypes",
        type: "checkbox-group",
        label: "What kind of assistance is needed? Select all that apply.",
        required: true,
        options: [
          { value: "harassment_violence", label: "Help with harassment or violence" },
          { value: "rights_entitlements", label: "A woman’s rights or entitlements are being denied or curtailed" },
          { value: "local_assistance", label: "Other help or guidance is needed from the local community" },
          { value: "none", label: "None of these apply" },
          { value: "unsure", label: "I’m not sure" },
        ],
      },
      {
        id: "localAvailability",
        type: "radio",
        label: "Do you know whether a Nari Adalat operates in the person’s Gram Panchayat?",
        required: true,
        options: [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
          { value: "unsure", label: "I’m not sure" },
        ],
        help: "Nari Adalat is organized at Gram Panchayat level. Availability can vary by locality.",
      },
    ],
  },
  {
    id: "free-legal-aid-uttarakhand",
    name: "Free Legal Aid — Uttarakhand",
    summary: "Preliminary check against the applicant and qualifying-category or income conditions in the Uttarakhand scheme summary.",
    document: "free legal aid act.pdf",
    pages: [1, 2],
    questions: [
      radioQuestion("resident", "Is the applicant a resident of Uttarakhand?"),
      {
        id: "qualifyingCategory", type: "checkbox-group", required: true,
        label: "Does any of the following describe the applicant? Select all that apply.",
        options: [
          { value: "scst", label: "Scheduled Caste or Scheduled Tribe" },
          { value: "trafficking_abuse_forced_labour", label: "Subjected to human trafficking, abuse, or forced labour" },
          { value: "woman_child", label: "Woman or child" },
          { value: "disability_mental_illness", label: "Person with a disability or mental illness" },
          { value: "disaster", label: "Affected by a natural calamity or disaster, caste violence/atrocity, or industrial disaster" },
          { value: "industrial_worker", label: "Worker employed in the industrial sector" },
          { value: "detained", label: "Detained in jail, prison, protection/juvenile home, psychiatric hospital, or nursing home" },
          { value: "ex_serviceman", label: "Ex-serviceman" },
          { value: "transgender", label: "Transgender person" },
          { value: "senior_citizen", label: "Senior citizen" },
          { value: "hiv_aids", label: "Person infected with HIV/AIDS" },
          { value: "none", label: "None of these apply" },
          { value: "unsure", label: "I’m not sure" },
        ],
      },
      { id: "annualIncome", type: "number", label: "What is the applicant’s annual income from all sources (₹)?", min: 0, required: true, help: "The source lists an income limit below ₹3,00,000 for applicants who do not qualify under one of the categories above." },
    ],
  },
  {
    id: "gaura-shakti",
    name: "Gaura Shakti Yojana — Uttarakhand",
    summary: "Checks the scheme summary’s stated target group for women’s safety assistance in Uttarakhand.",
    document: "Gaura Shakti yojana.pdf",
    pages: [2],
    questions: [radioQuestion("womanOrGirl", "Is the person seeking assistance a woman or girl?"), radioQuestion("resident", "Is she a resident of Uttarakhand?")],
  },
  {
    id: "protection-domestic-violence-haryana",
    name: "Protection Against Domestic Violence — Haryana",
    summary: "Checks the applicant and residence conditions stated in Haryana’s scheme summary.",
    document: "Protection against domestic violence.pdf",
    pages: [1],
    questions: [radioQuestion("female", "Is the applicant female?"), radioQuestion("resident", "Is the applicant a resident of Haryana?"), radioQuestion("domesticAbuse", "Is she seeking help for abuse within a domestic relationship?")],
  },
  {
    id: "sc-st-atrocity-assistance-puducherry",
    name: "Assistance under SC/ST Prevention of Atrocities Act — Puducherry",
    summary: "Checks the caste and atrocity conditions stated in the Puducherry scheme summary.",
    document: "assistance under sc_st prevention of atrocities act.pdf",
    pages: [1],
    questions: [radioQuestion("scheduledCaste", "Does the applicant belong to a Scheduled Caste?"), radioQuestion("atrocityAffected", "Has the applicant been affected by an atrocity?")],
  },
  {
    id: "uttarakhand-women-victim-compensation",
    name: "Compensation for Women Victims/Survivors — Uttarakhand",
    summary: "Checks the state residence, victim/dependent relationship, and listed crime or injury conditions.",
    document: "UK compensation scheme for women victims of sexual offences .pdf",
    pages: [1, 2],
    questions: [
      radioQuestion("resident", "Is the victim a resident of Uttarakhand?"),
      radioQuestion("womanOrDependent", "Is the victim a woman, or is the applicant her dependent?"),
      {
        id: "crimeTypes", type: "checkbox-group", required: true,
        label: "Does the case involve any of these circumstances? Select all that apply.",
        options: [
          { value: "listed_crime", label: "Gang rape, rape, or unnatural sexual assault" },
          { value: "pregnancy_fertility", label: "Pregnancy due to rape, abortion, or loss of fertility resulting from violence" },
          { value: "death_disability_injury", label: "Loss of life, disability, or physical or mental injury requiring rehabilitation" },
          { value: "burns_acid", label: "Burns or acid attack" },
          { value: "none", label: "None of these apply" },
          { value: "unsure", label: "I’m not sure" },
        ],
      },
    ],
  },
  {
    id: "mp-police-internship",
    name: "Police Internship Scheme — Madhya Pradesh",
    summary: "Checks the residence, age, enrolment, and course conditions listed for the internship. Selection also depends on merit and available places.",
    document: "MP Police internship scheme.pdf",
    pages: [2],
    questions: [
      radioQuestion("resident", "Is the applicant a resident of Madhya Pradesh?"),
      { id: "age", type: "number", label: "What is the applicant’s age (in years)?", min: 0, max: 120, required: true, help: "The scheme summary states 21–26 years as of May 1 of the application year." },
      radioQuestion("enrolled", "Is the applicant enrolled in a recognized educational institution?"),
      {
        id: "course", type: "radio", required: true,
        label: "Is the applicant pursuing one of the listed courses?",
        options: [
          { value: "yes", label: "Yes — integrated law, engineering, postgraduate/Master’s, MCA/BCA/PGDCA, CA/CS, police-related diploma, or police-related PhD/research" },
          { value: "no", label: "No" },
          { value: "unsure", label: "I’m not sure" },
        ],
      },
    ],
  },
  {
    id: "goa-child-committee-grant",
    name: "Goa Village & Municipal Child Committee Grants and Awards",
    summary: "Checks the local-body and committee conditions for this administrative grant; individual applicants are not the applicant group.",
    document: "Goa Village and municipal scheme.pdf",
    pages: [1, 2],
    questions: [
      radioQuestion("localBody", "Is the applicant a Panchayat or Municipal local body?"),
      radioQuestion("committeeEstablished", "Has it established a Village or Municipal Child Committee under Rule 7 of the Goa Children’s Homes Rules, 2004?"),
      radioQuestion("recentMeeting", "Has the Committee met at least once in the three months before applying?"),
      radioQuestion("childIssues", "Did the meeting discuss and resolve issues concerning children within the local body’s jurisdiction?"),
      radioQuestion("meetingSpace", "Has the local body provided space for Committee sittings on its premises?"),
    ],
  },
  {
    id: "mp-crime-victim-compensation",
    name: "Madhya Pradesh Crime Victim Compensation Scheme",
    summary: "Checks the basic victim, location, reporting/cooperation, income, and exclusion conditions in the scheme summary. The competent authority decides the claim.",
    document: "MP Crime victim compensation.pdf",
    pages: [4],
    questions: [
      radioQuestion("victimOrDependent", "Is the applicant a crime victim or a dependent of a victim who suffered injury or loss?"),
      radioQuestion("crimeInState", "Did the crime occur in Madhya Pradesh?"),
      radioQuestion("victimResident", "Does the victim reside in Madhya Pradesh? (Relevant to interim relief if the crime occurred outside the state.)"),
      radioQuestion("reported", "Was the crime reported without unreasonable delay?"),
      radioQuestion("cooperating", "Is the applicant cooperating with the investigation and rehabilitation process?"),
      { id: "annualIncome", type: "number", label: "What is the victim’s annual income from all sources (₹)?", min: 0, required: true, help: "If it exceeds ₹5,00,000, the summary says compensation is limited to 50% of the prescribed amount." },
      radioQuestion("motorVehicleClaim", "Is this a Motor Vehicles Act case where compensation is awarded by the Motor Accident Claims Tribunal?"),
      radioQuestion("selfCaused", "Was the applicant responsible for causing the injury to themselves?"),
    ],
  },
];

function radioQuestion(id, label) {
  return { id, type: "radio", label, required: true, options: [
    { value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "unsure", label: "I’m not sure" },
  ] };
}

export function evaluateEligibility(schemeId, answers) {
  const scheme = ELIGIBILITY_SCHEMES.find((item) => item.id === schemeId);
  if (!scheme) return null;

  if (schemeId === "mission-vatsalya-foster-care") {
    return assessFosterCare(answers, scheme);
  }
  const assessors = {
    "nari-adalat": assessNariAdalat,
    "free-legal-aid-uttarakhand": assessFreeLegalAid,
    "gaura-shakti": (a, s) => assessSimpleConditions(a, s, ["womanOrGirl", "resident"]),
    "protection-domestic-violence-haryana": (a, s) => assessSimpleConditions(a, s, ["female", "resident", "domesticAbuse"]),
    "sc-st-atrocity-assistance-puducherry": (a, s) => assessSimpleConditions(a, s, ["scheduledCaste", "atrocityAffected"]),
    "uttarakhand-women-victim-compensation": assessUttarakhandCompensation,
    "mp-police-internship": assessMpInternship,
    "goa-child-committee-grant": (a, s) => assessSimpleConditions(a, s, ["localBody", "committeeEstablished", "recentMeeting", "childIssues", "meetingSpace"]),
    "mp-crime-victim-compensation": assessMpCompensation,
  };
  return assessors[schemeId]?.(answers, scheme) || null;
}

function assessSimpleConditions(answers, scheme, fields) {
  if (fields.some((field) => !["yes", "no", "unsure"].includes(answers[field]))) {
    return invalidResult("Answer each required question to continue.");
  }
  if (fields.some((field) => answers[field] === "no")) {
    return result("does_not_match_criteria", ["At least one required condition listed in the source scheme summary was answered ‘No’."], scheme);
  }
  if (fields.some((field) => answers[field] === "unsure")) {
    return result("cannot_determine", ["At least one required condition is uncertain. Check the relevant documents and confirm with the scheme authority."], scheme);
  }
  return result("likely_eligible", ["The answers match the conditions listed in the source scheme summary. This preliminary check does not confirm registration, service availability, selection, or official approval."], scheme);
}

function assessFreeLegalAid(answers, scheme) {
  if (!['yes', 'no', 'unsure'].includes(answers.resident)) return invalidResult("Answer whether the applicant resides in Uttarakhand.");
  const categories = Array.isArray(answers.qualifyingCategory) ? answers.qualifyingCategory : [];
  const valid = ["scst", "trafficking_abuse_forced_labour", "woman_child", "disability_mental_illness", "disaster", "industrial_worker", "detained", "ex_serviceman", "transgender", "senior_citizen", "hiv_aids", "none", "unsure"];
  if (!categories.length || categories.some((v) => !valid.includes(v)) || (categories.includes("none") && categories.length > 1) || (categories.includes("unsure") && categories.length > 1)) return invalidResult("Select applicable categories, or choose ‘None’ or ‘I’m not sure’ by itself.");
  const income = Number(answers.annualIncome);
  if (answers.annualIncome === "" || answers.annualIncome == null || !Number.isFinite(income) || income < 0) return invalidResult("Enter the applicant’s annual income.");
  if (answers.resident === "no") return result("does_not_match_criteria", ["The scheme summary requires the applicant to be a resident of Uttarakhand."], scheme);
  if (answers.resident === "unsure" || categories.includes("unsure")) return result("cannot_determine", ["Residence or qualifying category is uncertain."], scheme);
  if (categories.includes("none") && income >= 300000) return result("does_not_match_criteria", ["The applicant selected no listed qualifying category, and the source income route is for annual income below ₹3,00,000."], scheme);
  if (categories.includes("none")) return result("likely_eligible", ["The annual income is below ₹3,00,000, matching the source’s income-based route."], scheme);
  return result("likely_eligible", ["The applicant’s residence and selected category match a group listed for free legal aid. The source states no income limit for those listed categories."], scheme);
}

function assessUttarakhandCompensation(answers, scheme) {
  if (!["yes", "no", "unsure"].includes(answers.resident) || !["yes", "no", "unsure"].includes(answers.womanOrDependent)) return invalidResult("Answer the residence and applicant relationship questions.");
  const types = Array.isArray(answers.crimeTypes) ? answers.crimeTypes : [];
  if (!types.length || types.some((v) => !["listed_crime", "pregnancy_fertility", "death_disability_injury", "burns_acid", "none", "unsure"].includes(v)) || (types.includes("none") && types.length > 1) || (types.includes("unsure") && types.length > 1)) return invalidResult("Select a listed circumstance, or choose ‘None’ or ‘I’m not sure’ by itself.");
  if (answers.resident === "no" || answers.womanOrDependent === "no" || types.includes("none")) return result("does_not_match_criteria", ["One or more answers do not meet the residence, woman/dependent, or listed crime/injury conditions in the source."], scheme);
  if (answers.resident === "unsure" || answers.womanOrDependent === "unsure" || types.includes("unsure")) return result("cannot_determine", ["The source conditions could not be confirmed from these answers."], scheme);
  return result("likely_eligible", ["The answers match the scheme summary’s listed target group and crime/injury conditions. The State or District Legal Services Authority investigates and decides the claim."], scheme);
}

function assessMpInternship(answers, scheme) {
  if (!["yes", "no", "unsure"].includes(answers.resident) || !["yes", "no", "unsure"].includes(answers.enrolled) || !["yes", "no", "unsure"].includes(answers.course)) return invalidResult("Answer all internship eligibility questions.");
  const age = Number(answers.age);
  if (answers.age === "" || answers.age == null || !Number.isInteger(age) || age < 0 || age > 120) return invalidResult("Enter the applicant’s age as a whole number.");
  if (answers.resident === "no" || answers.enrolled === "no" || answers.course === "no" || age < 21 || age > 26) return result("does_not_match_criteria", ["One or more answers fall outside the listed residence, enrolment, course, or 21–26 age conditions. Age is assessed as of May 1 of the application year."], scheme);
  if (answers.resident === "unsure" || answers.enrolled === "unsure" || answers.course === "unsure") return result("cannot_determine", ["At least one listed condition is uncertain."], scheme);
  return result("likely_eligible", ["The answers match the basic conditions listed in the source summary. The scheme also selects candidates based on academic merit and interest; verify the current application notice and its May 1 age reference."], scheme);
}

function assessMpCompensation(answers, scheme) {
  const fields = ["victimOrDependent", "crimeInState", "reported", "cooperating", "motorVehicleClaim", "selfCaused"];
  if (fields.some((field) => !["yes", "no", "unsure"].includes(answers[field]))) return invalidResult("Answer each required crime-compensation question.");
  if (!["yes", "no", "unsure"].includes(answers.victimResident)) return invalidResult("Answer whether the victim resides in Madhya Pradesh.");
  const income = Number(answers.annualIncome);
  if (answers.annualIncome === "" || answers.annualIncome == null || !Number.isFinite(income) || income < 0) return invalidResult("Enter the victim’s annual income.");
  if (answers.motorVehicleClaim === "yes" || answers.selfCaused === "yes" || answers.victimOrDependent === "no" || answers.reported === "no" || answers.cooperating === "no" || (answers.crimeInState === "no" && answers.victimResident === "no")) return result("does_not_match_criteria", ["At least one answer matches an exclusion or fails a basic condition listed in the Madhya Pradesh scheme summary."], scheme);
  if (fields.some((field) => answers[field] === "unsure")) return result("cannot_determine", ["At least one required condition or exclusion is uncertain; the District Legal Services Authority must verify the claim."], scheme);
  if (answers.crimeInState === "no" && answers.victimResident === "unsure") return result("cannot_determine", ["The victim’s Madhya Pradesh residence is unknown. The source describes interim relief for victims residing in Madhya Pradesh when the crime occurred outside the state."], scheme);
  const reasons = ["The answers match the basic victim/dependent, location, reporting, and cooperation conditions stated in the source summary."];
  if (answers.crimeInState === "no" && answers.victimResident === "yes") reasons.push("Because the crime occurred outside Madhya Pradesh, the source describes eligibility for interim relief for Madhya Pradesh residents; this does not establish eligibility for full compensation.");
  if (income > 500000) reasons.push("The stated income exceeds ₹5,00,000; the source summary says compensation is limited to 50% of the prescribed amount in that case.");
  else reasons.push("The stated income is within the ₹5,00,000 threshold listed in the source summary.");
  reasons.push("The competent authority verifies the facts and determines the claim and amount.");
  return result("likely_eligible", reasons, scheme);
}

function assessFosterCare(answers, scheme) {
  const age = Number(answers.childAge);
  const situations = Array.isArray(answers.childSituations)
    ? answers.childSituations
    : [];

  if (
    answers.childAge === undefined ||
    answers.childAge === null ||
    answers.childAge === "" ||
    !Number.isInteger(age) ||
    age < 0 ||
    age > 120
  ) {
    return invalidResult("Enter the child’s age as a whole number.");
  }
  if (!situations.length || situations.some((item) => ![
    "cci_over_two_years",
    "parent_terminally_ill",
    "care_and_protection",
    "none",
    "unsure",
  ].includes(item))) {
    return invalidResult("Select a child situation or choose ‘None’ or ‘I’m not sure.’");
  }
  if (situations.includes("none") && situations.length > 1) {
    return invalidResult("Choose ‘None’ by itself, or select the situations that apply.");
  }
  if (situations.includes("unsure") && situations.length > 1) {
    return invalidResult("Choose ‘I’m not sure’ by itself, or select the situations that apply.");
  }
  if (!["yes", "no", "unsure"].includes(answers.seekingFinancialSupport)) {
    return invalidResult("Tell us whether you are checking financial support too.");
  }
  if (answers.seekingFinancialSupport === "yes") {
    const income = Number(answers.annualFamilyIncome);
    if (
      answers.annualFamilyIncome === undefined ||
      answers.annualFamilyIncome === null ||
      answers.annualFamilyIncome === "" ||
      !Number.isFinite(income) ||
      income < 0
    ) {
      return invalidResult("Enter the caregiver family’s annual income in rupees.");
    }
  }

  const evidence = [];
  const ageIsChild = age < 18;
  if (!ageIsChild) {
    evidence.push("The child is 18 or older; the cited foster-care criteria apply to children under 18. Separate after-care criteria may be relevant.");
    return result("does_not_match_criteria", evidence, scheme);
  }

  const cciPathway = age >= 6 && age <= 18 && situations.includes("cci_over_two_years");
  const otherPathway = situations.includes("parent_terminally_ill") || situations.includes("care_and_protection");
  const uncertainPathway = situations.includes("unsure");
  const childMayMeetCriteria = cciPathway || otherPathway;

  if (situations.includes("none")) {
    evidence.push("The answers do not match the foster-care situations listed in the guideline.");
    return result("does_not_match_criteria", evidence, scheme);
  }
  if (!childMayMeetCriteria && uncertainPathway) {
    evidence.push("A District Child Protection Unit or Child Welfare Committee would need to assess the child’s circumstances.");
    return result("cannot_determine", evidence, scheme);
  }
  if (!childMayMeetCriteria) {
    evidence.push("The selected institution pathway applies to children aged 6–18 who have been in a Child Care Institution for over two years and are not declared legally free for adoption. The other listed situations were not selected.");
    return result("does_not_match_criteria", evidence, scheme);
  }

  evidence.push("The child’s age and selected circumstances appear to match at least one foster-care pathway described in the guideline.");
  if (answers.seekingFinancialSupport === "unsure") {
    evidence.push("It is not clear whether financial support is being requested. The guideline gives a separate income condition for caregiver financial support.");
    return result("likely_eligible", evidence, scheme);
  }
  if (answers.seekingFinancialSupport === "yes") {
    const income = Number(answers.annualFamilyIncome);
    if (income >= 800000) {
      evidence.push("The stated family income is ₹8 lakh or more. The guideline’s current listed financial-support condition is income below ₹8 lakh per year, or a later Ministry-prescribed limit. This affects the financial-support check, not the child’s possible foster-care placement.");
      return result("placement_may_match_support_not_match", evidence, scheme);
    }
    evidence.push("The stated family income is below ₹8 lakh per year, matching the guideline’s listed financial-support condition; the Ministry may revise the limit.");
  } else {
    evidence.push("No financial-support income check was requested.");
  }

  evidence.push("This is a preliminary match only. Foster-family assessment, the child’s willingness, Child Welfare Committee review, and District Magistrate approval are part of the official process.");
  return result("likely_eligible", evidence, scheme);
}

function assessNariAdalat(answers, scheme) {
  if (!["yes", "no", "unsure"].includes(answers.womanOrGirl)) {
    return invalidResult("Answer whether the person seeking help is a woman or girl.");
  }
  const issues = Array.isArray(answers.issueTypes) ? answers.issueTypes : [];
  if (!issues.length || issues.some((item) => ![
    "harassment_violence",
    "rights_entitlements",
    "local_assistance",
    "none",
    "unsure",
  ].includes(item))) {
    return invalidResult("Select an assistance need or choose ‘None’ or ‘I’m not sure.’");
  }
  if (issues.includes("none") && issues.length > 1) {
    return invalidResult("Choose ‘None’ by itself, or select the assistance needed.");
  }
  if (issues.includes("unsure") && issues.length > 1) {
    return invalidResult("Choose ‘I’m not sure’ by itself, or select the assistance needed.");
  }
  if (!["yes", "no", "unsure"].includes(answers.localAvailability)) {
    return invalidResult("Answer whether a Nari Adalat is known to operate locally.");
  }

  if (answers.womanOrGirl === "no") {
    return result("does_not_match_criteria", [
      "The guideline identifies women and girls who are aggrieved or need local assistance as its target beneficiaries.",
    ], scheme);
  }
  if (answers.womanOrGirl === "unsure" || issues.includes("unsure")) {
    return result("cannot_determine", [
      "The target-beneficiary description or the person’s assistance need is not clear from these answers.",
    ], scheme);
  }
  if (issues.includes("none")) {
    return result("does_not_match_criteria", [
      "The person may fit the intended group, but no current grievance or need for local assistance was selected.",
    ], scheme);
  }

  const evidence = [
    "The person appears to fit the guideline’s intended group: women and girls who are aggrieved or need assistance from their local community.",
  ];
  if (answers.localAvailability === "no") {
    evidence.push("You indicated there is no Nari Adalat in the Gram Panchayat. The person may fit the intended beneficiary group, but this local service channel appears unavailable there.");
    return result("likely_eligible_local_service_unavailable", evidence, scheme);
  }
  if (answers.localAvailability === "unsure") {
    evidence.push("Local availability is unconfirmed. The SOP describes implementation at Gram Panchayat level and notes that implementation began as a pilot; check with the Gram Panchayat or district Women’s Empowerment Hub.");
    return result("likely_eligible_local_availability_unconfirmed", evidence, scheme);
  }
  evidence.push("You indicated that a Nari Adalat operates in the Gram Panchayat. The forum uses mediation and reconciliation with mutual consent; it is not a court and does not have legal status.");
  return result("likely_eligible", evidence, scheme);
}

function invalidResult(message) {
  return { decision: "invalid_answers", label: "Please review your answers", reasons: [message], sources: [] };
}

function result(decision, reasons, scheme) {
  const labels = {
    likely_eligible: "Likely matches the listed criteria",
    does_not_match_criteria: "Does not match the listed criteria",
    cannot_determine: "Not enough information to determine",
    placement_may_match_support_not_match: "Placement may match; financial-support threshold does not",
    likely_eligible_local_service_unavailable: "Likely target beneficiary; local service unavailable",
    likely_eligible_local_availability_unconfirmed: "Likely target beneficiary; local availability unconfirmed",
  };
  return {
    decision,
    label: labels[decision],
    reasons,
    sources: [{ document: scheme.document, pages: scheme.pages }],
  };
}
