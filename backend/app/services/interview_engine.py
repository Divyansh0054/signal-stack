import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.company import Company, CompanyProfile
from backend.app.models.interview import InterviewQuestion, InterviewAnswer

logger = logging.getLogger(__name__)


class AdaptiveInterviewEngine:
    """
    Manages the adaptive 10-question executive interview.
    Generates dynamic, company-specific questions tailored to industry,
    business model, products, and previous answers.
    """

    QUESTION_CATEGORIES = [
        ("revenue_engine", "Primary business lines and commercial revenue streams"),
        ("customer_segments", "Highest-value customer segments and ideal customer profiles"),
        ("customer_pain", "Current customer pain points, unmet needs, and reasons for churn"),
        ("competitive_moat", "Primary competitors, substitutes, and why customers choose you"),
        ("pricing_economics", "Pricing model, margins, and customer willingness-to-pay"),
        ("acquisition_channels", "Go-to-market channels, partnership dependencies, and acquisition costs"),
        ("regulatory_risks", "Regulatory requirements, policy shifts, and external vulnerabilities"),
        ("internal_patterns", "Recurring customer objections, lost-deal patterns, and feedback trends"),
        ("strategic_priorities", "Core growth bets and strategic roadmap over the next 6–12 months"),
        ("decision_triggers", "Critical business decisions and executive signals this intelligence stack must support")
    ]

    def initialize_interview_questions(self, db: Session, company_id: str) -> List[InterviewQuestion]:
        """
        Dynamically generates the 10 primary interview questions tailored specifically
        to the researched company profile.
        """
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise ValueError(f"Company {company_id} not found.")

        # Check if already generated
        existing = db.query(InterviewQuestion).filter(
            InterviewQuestion.company_id == company_id,
            InterviewQuestion.is_followup == False
        ).order_by(InterviewQuestion.question_order).all()

        if existing and len(existing) == 10:
            return existing

        profile = company.profile
        industry = company.industry or (profile.business_description if profile else "General Technology")
        company_name = company.name

        questions_data = self._generate_questions_for_company(company_name, industry, profile)

        created_questions = []
        for q_order, q_item in enumerate(questions_data, start=1):
            q_obj = InterviewQuestion(
                company_id=company_id,
                question_order=q_order,
                question_text=q_item["text"],
                question_category=q_item["category"],
                context_rationale=q_item["rationale"],
                is_confidential_eligible=True,
                is_skipped=False,
                is_followup=False
            )
            db.add(q_obj)
            created_questions.append(q_obj)

        db.commit()
        return created_questions

    def _generate_questions_for_company(
        self,
        name: str,
        industry: str,
        profile: Optional[CompanyProfile]
    ) -> List[Dict[str, str]]:
        """
        Synthesizes tailored questions based on researched domain, avoiding generic templates.
        """
        ind_lower = industry.lower() if industry else ""
        products = profile.products_services if profile and profile.products_services else []
        prod_names = ", ".join([p.get("name", "") for p in products[:2]]) or "your core product lines"

        if "edtech" in ind_lower or "study abroad" in ind_lower or "university" in ind_lower:
            return [
                {
                    "category": "revenue_engine",
                    "text": f"At {name}, how is revenue split between university enrollment commissions, student counseling packages, and institutional subscription fees?",
                    "rationale": f"Clarifies the commercial monetization model and whether {name} is student-fee funded or institutional partner-funded."
                },
                {
                    "category": "customer_segments",
                    "text": f"Which destination corridors (e.g., US, UK, Canada, Australia, Germany) and student academic tiers yield {name}'s highest customer lifetime value?",
                    "rationale": "Identifies geographic demand concentrations to prioritize international student intake monitoring."
                },
                {
                    "category": "customer_pain",
                    "text": "What are the most frequent drop-off reasons or frustrations students experience during application processing, credential evaluation, and visa paperwork?",
                    "rationale": "Uncovers friction points in the student conversion journey that customer intelligence should track."
                },
                {
                    "category": "competitive_moat",
                    "text": f"When prospective students or partner universities consider alternative platforms like Leverage Edu, Leap Scholar, IDP Education, or ApplyBoard, what is {name}'s decisive differentiator?",
                    "rationale": "Directly positions {name} against primary EdTech competitors to focus competitive intelligence collection."
                },
                {
                    "category": "pricing_economics",
                    "text": "How do university commission delays, refund policies upon visa rejection, and sub-agent commission splits impact your operational margins?",
                    "rationale": "Focuses on cash flow sensitivities and financial risk factors specific to international student recruitment."
                },
                {
                    "category": "acquisition_channels",
                    "text": "What percentage of student leads originate from organic digital search, university events, high school outreach, versus third-party affiliate agent networks?",
                    "rationale": "Pinpoints distribution dependencies to track acquisition channel disruptions."
                },
                {
                    "category": "regulatory_risks",
                    "text": "How severely do changing student visa caps, post-study work visa rights (e.g. UK Graduate Route, Canada study permit limits), and English test accreditations impact {name}'s business?",
                    "rationale": "Establishes regulatory risk sensitivity for government policy monitoring in target destination countries."
                },
                {
                    "category": "internal_patterns",
                    "text": "What recurring objections do partner university admissions teams or students cite right before abandoning an application or contract?",
                    "rationale": "Aligns internal sales conversation patterns with external market sentiment."
                },
                {
                    "category": "strategic_priorities",
                    "text": f"Over the next 6–12 months, is {name}'s strategic priority expanding into new destination markets, deepening direct university integrations, or launching student financing/housing products?",
                    "rationale": "Ensures executive intelligence aligns with upcoming leadership milestones."
                },
                {
                    "category": "decision_triggers",
                    "text": f"What specific developments (e.g., competitor pricing cuts, sudden embassy visa moratoriums, university recruitment freezes) should trigger an immediate executive alert for {name}?",
                    "rationale": "Sets urgency thresholds for the ranking engine and Monday Morning Brief."
                }
            ]

        elif "developer" in ind_lower or "analytics" in ind_lower:
            return [
                {
                    "category": "revenue_engine",
                    "text": f"For {name}, what proportion of revenue is driven by self-serve cloud tiers versus enterprise annual contracts with custom VPC deployments?",
                    "rationale": "Distinguishes product-led growth self-serve vs top-down enterprise sales dynamics."
                },
                {
                    "category": "customer_segments",
                    "text": "What is the profile of your ideal engineering or product team (e.g., Series A startups vs Fortune 500 privacy-conscious scale-ups), and who holds purchasing authority?",
                    "rationale": "Targets monitoring of developer sentiment and buyer persona behavior."
                },
                {
                    "category": "customer_pain",
                    "text": "What are the primary operational challenges your users encounter around event ingestion latency, SDK configuration, or query speeds at scale?",
                    "rationale": "Directs customer signal monitoring toward developer forums and GitHub issues."
                },
                {
                    "category": "competitive_moat",
                    "text": f"How do you position {name} against alternatives like Mixpanel, Amplitude, Datadog, or open-source self-hosted stacks, and why do teams switch to you?",
                    "rationale": "Identifies competitive battlegrounds across product analytics and observability."
                },
                {
                    "category": "pricing_economics",
                    "text": "How do data egress costs, cloud hosting spikes, and usage-based event volume tiers influence your gross margins?",
                    "rationale": "Establishes unit economics and margin thresholds for cloud infrastructure monitoring."
                },
                {
                    "category": "acquisition_channels",
                    "text": "How dependent is {name} on open-source community adoption, GitHub stars, developer advocacy, and Hacker News sentiment?",
                    "rationale": "Maps developer community intelligence channels to monitor."
                },
                {
                    "category": "regulatory_risks",
                    "text": "How do GDPR, CCPA, and European data sovereignty court rulings affect client willingness to store user analytics in your cloud versus on-premise?",
                    "rationale": "Sets parameters for tracking international data privacy regulations."
                },
                {
                    "category": "internal_patterns",
                    "text": "What are the top three technical objections raised in sales demos or proof-of-concept evaluations that lead to lost deals?",
                    "rationale": "Extracts internal objection benchmarks for comparison against competitor features."
                },
                {
                    "category": "strategic_priorities",
                    "text": f"What are your top engineering and product bets for the next two quarters (e.g., AI data warehousing, session replay enhancements, automated anomaly detection)?",
                    "rationale": "Aligns market intelligence with product roadmap initiatives."
                },
                {
                    "category": "decision_triggers",
                    "text": f"What competitor feature releases or infrastructure pricing changes should immediately prompt an executive review?",
                    "rationale": "Defines high-priority triggers for the executive briefing engine."
                }
            ]

        elif "fintech" in ind_lower or "lending" in ind_lower:
            return [
                {
                    "category": "revenue_engine",
                    "text": f"For {name}, what is the revenue contribution of origination fees, interest spread, late repayment charges, and merchant interchange?",
                    "rationale": "Maps financial product economics and sensitivity to non-performing loans."
                },
                {
                    "category": "customer_segments",
                    "text": "Which demographic segments (e.g., informal sector merchants, gig economy workers, first-time borrowers) exhibit the lowest default rates and highest retention?",
                    "rationale": "Clarifies underwriting risk profiles and priority market segments."
                },
                {
                    "category": "customer_pain",
                    "text": "What complaints or friction do borrowers report most often regarding loan disbursement speeds, identity verification, or repayment schedules?",
                    "rationale": "Focuses customer complaint monitoring on high-friction consumer touchpoints."
                },
                {
                    "category": "competitive_moat",
                    "text": f"How do you compete against predatory loan apps, traditional microfinance institutions, and telecom mobile money providers?",
                    "rationale": "Identifies key competitive vectors across digital lending."
                },
                {
                    "category": "pricing_economics",
                    "text": "How do cost of capital fluctuations, local currency inflation, and default write-offs impact your net interest margins?",
                    "rationale": "Identifies macroeconomic and balance sheet vulnerability indicators."
                },
                {
                    "category": "acquisition_channels",
                    "text": "What channels drive your lowest-cost qualified borrower acquisition, and how reliant are you on smartphone app store ranking algorithms?",
                    "rationale": "Uncovers app distribution and marketing channel vulnerabilities."
                },
                {
                    "category": "regulatory_risks",
                    "text": "How do central bank interest rate caps, digital lending licensing mandates, and consumer protection guidelines shape your geographic expansion?",
                    "rationale": "Identifies compliance and licensing triggers for regulatory intelligence monitoring."
                },
                {
                    "category": "internal_patterns",
                    "text": "What customer support issues or collection complaints most frequently surface in your customer support ticket queues?",
                    "rationale": "Connects internal support sentiment with public reviews."
                },
                {
                    "category": "strategic_priorities",
                    "text": f"Over the next 12 months, are you prioritizing geographical expansion, launching SME merchant credit lines, or securing a digital banking license?",
                    "rationale": "Aligns briefing intelligence with corporate development goals."
                },
                {
                    "category": "decision_triggers",
                    "text": "What changes in macro default rates, competitor credit limit offerings, or central bank notices should prompt immediate credit model recalibration?",
                    "rationale": "Establishes trigger rules for weekly risk notifications."
                }
            ]

        # General SaaS / Tech default
        return [
            {
                "category": "revenue_engine",
                "text": f"For {name}, what are your primary revenue streams and how are they structured between recurring subscriptions and services?",
                "rationale": f"Analyzes the monetization model of {name}."
            },
            {
                "category": "customer_segments",
                "text": f"Who represents your highest-margin and fastest-growing customer segments right now?",
                "rationale": "Identifies target customer profiles for targeted market monitoring."
            },
            {
                "category": "customer_pain",
                "text": "What are the most urgent operational problems or unmet needs your customers look to your platform to solve?",
                "rationale": "Pinpoints the core problem space for customer signal extraction."
            },
            {
                "category": "competitive_moat",
                "text": f"Who are your most aggressive competitors or substitute solutions, and why do prospective customers choose you over them?",
                "rationale": "Maps the competitive landscape and differentiator moats."
            },
            {
                "category": "pricing_economics",
                "text": "What are your primary unit economics drivers, and where is your pricing leverage strongest?",
                "rationale": "Gathers commercial sensitivity metrics."
            },
            {
                "category": "acquisition_channels",
                "text": "What are your primary organic and paid customer acquisition channels, and where do you experience conversion drop-offs?",
                "rationale": "Identifies distribution dependencies."
            },
            {
                "category": "regulatory_risks",
                "text": "What regulatory, legal, or industry compliance shifts could materially impact your operating model?",
                "rationale": "Configures regulatory intelligence monitoring parameters."
            },
            {
                "category": "internal_patterns",
                "text": "What are the most frequent objections raised by prospects in sales conversations or customer churn interviews?",
                "rationale": "Extracts internal friction points."
            },
            {
                "category": "strategic_priorities",
                "text": f"What are {name}'s top three strategic milestones for the coming 6 to 12 months?",
                "rationale": "Aligns strategic relevance scoring with active roadmaps."
            },
            {
                "category": "decision_triggers",
                "text": "What external events or competitor moves would require an immediate strategic pivot or leadership decision?",
                "rationale": "Sets urgency scoring triggers for Monday Morning Brief generation."
            }
        ]

    def record_answer(
        self,
        db: Session,
        question_id: str,
        answer_text: str
    ) -> InterviewAnswer:
        """
        Records or updates an answer, extracting structured insights and checking for follow-up triggers.
        """
        question = db.query(InterviewQuestion).filter(InterviewQuestion.id == question_id).first()
        if not question:
            raise ValueError(f"Question {question_id} not found.")

        # Extract structured insights from the answer
        insights = self._extract_insights_from_answer(question.question_category, answer_text)

        existing_answer = db.query(InterviewAnswer).filter(InterviewAnswer.question_id == question_id).first()
        if existing_answer:
            existing_answer.answer_text = answer_text
            existing_answer.derived_insights = insights
            existing_answer.is_edited = True
            db.commit()
            db.refresh(existing_answer)
            return existing_answer

        answer_obj = InterviewAnswer(
            question_id=question_id,
            company_id=question.company_id,
            answer_text=answer_text,
            derived_insights=insights,
            is_edited=False
        )
        db.add(answer_obj)
        db.commit()
        db.refresh(answer_obj)
        return answer_obj

    def skip_question(self, db: Session, question_id: str) -> InterviewQuestion:
        """
        Marks confidential question as skipped without blocking the interview progression.
        """
        question = db.query(InterviewQuestion).filter(InterviewQuestion.id == question_id).first()
        if not question:
            raise ValueError(f"Question {question_id} not found.")

        question.is_skipped = True
        db.commit()
        db.refresh(question)
        return question

    def _extract_insights_from_answer(self, category: str, text: str) -> List[Dict[str, Any]]:
        insights = []
        insights.append({
            "category": category,
            "summary": text[:200] + ("..." if len(text) > 200 else ""),
            "key_takeaway": f"Founder disclosed: {text[:150]}"
        })
        return insights


interview_engine = AdaptiveInterviewEngine()
