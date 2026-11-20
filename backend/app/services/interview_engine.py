import logging
import re
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.company import Company, CompanyProfile
from backend.app.models.interview import InterviewQuestion, InterviewAnswer

logger = logging.getLogger(__name__)


class AdaptiveInterviewEngine:
    """
    Manages the adaptive 10-question executive interview with follow-up generation.
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
        prod_names = ", ".join([p.get("name", "") for p in products[:2] if isinstance(p, dict)]) or f"{name} core platform"
        cust_segments = profile.customer_segments if profile and profile.customer_segments else []
        cust_names = ", ".join([c.get("segment", "") for c in cust_segments[:2] if isinstance(c, dict)]) or "target business customers"

        if "edtech" in ind_lower or "study abroad" in ind_lower or "university" in ind_lower or "meetuniversity" in name.lower():
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
                    "text": f"What specific developments (e.g., competitor commission rate increases, sudden embassy visa moratoriums, university recruitment freezes) should trigger an immediate executive alert for {name}?",
                    "rationale": "Sets urgency thresholds for the ranking engine and Monday Morning Brief."
                }
            ]

        elif "developer" in ind_lower or "analytics" in ind_lower or "posthog" in name.lower():
            return [
                {
                    "category": "revenue_engine",
                    "text": f"For {name}, what proportion of revenue is driven by self-serve cloud usage (events ingested) versus enterprise annual contracts with custom VPC deployments?",
                    "rationale": "Distinguishes product-led growth self-serve vs top-down enterprise sales dynamics."
                },
                {
                    "category": "customer_segments",
                    "text": f"What is the profile of your ideal engineering or product team within {cust_names}, and who holds primary purchasing authority?",
                    "rationale": "Targets monitoring of developer sentiment and buyer persona behavior."
                },
                {
                    "category": "customer_pain",
                    "text": f"What are the primary operational challenges your users encounter when deploying {prod_names} around event latency, SDK configuration, or query speeds?",
                    "rationale": "Directs customer signal monitoring toward developer forums and GitHub issues."
                },
                {
                    "category": "competitive_moat",
                    "text": f"How do you position {name} against alternatives like Mixpanel, Amplitude, Datadog, or open-source self-hosted stacks, and why do teams switch to you?",
                    "rationale": "Identifies competitive battlegrounds across product analytics and observability."
                },
                {
                    "category": "pricing_economics",
                    "text": "How do data egress costs, cloud infrastructure spikes, and usage-based event volume tiers influence your gross margins?",
                    "rationale": "Establishes unit economics and margin thresholds for cloud infrastructure monitoring."
                },
                {
                    "category": "acquisition_channels",
                    "text": f"How dependent is {name} on open-source community adoption, GitHub stars, developer advocacy, and technical engineering blog sentiment?",
                    "rationale": "Maps developer community intelligence channels to monitor."
                },
                {
                    "category": "regulatory_risks",
                    "text": "How do GDPR, CCPA, and European data sovereignty court rulings affect client willingness to store user analytics in your cloud versus on-premise?",
                    "rationale": "Sets parameters for tracking international data privacy regulations."
                },
                {
                    "category": "internal_patterns",
                    "text": "What are the top technical objections raised in sales demos or proof-of-concept evaluations that lead to lost enterprise deals?",
                    "rationale": "Extracts internal objection benchmarks for comparison against competitor features."
                },
                {
                    "category": "strategic_priorities",
                    "text": f"What are your top engineering bets for the next two quarters (e.g., automated anomaly detection, session replay enhancements, AI querying)?",
                    "rationale": "Aligns market intelligence with product roadmap initiatives."
                },
                {
                    "category": "decision_triggers",
                    "text": f"What competitor feature releases or infrastructure pricing changes should immediately prompt an executive review?",
                    "rationale": "Defines high-priority triggers for the executive briefing engine."
                }
            ]

        elif "fintech" in ind_lower or "lending" in ind_lower or "credit" in ind_lower or "tala" in name.lower():
            return [
                {
                    "category": "revenue_engine",
                    "text": f"For {name}, what is the revenue contribution of origination fees, interest spread, late repayment charges, and merchant interchange?",
                    "rationale": "Maps financial product economics and sensitivity to non-performing loans."
                },
                {
                    "category": "customer_segments",
                    "text": f"Which borrower demographics within {cust_names} exhibit the lowest default rates and highest repeat borrowing velocity?",
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
                    "text": "How do central bank interest rate caps, digital lending licensing mandates, and consumer protection guidelines shape your expansion?",
                    "rationale": "Identifies compliance and licensing triggers for regulatory intelligence monitoring."
                },
                {
                    "category": "internal_patterns",
                    "text": "What customer support issues or collection disputes most frequently surface in your customer support ticket queues?",
                    "rationale": "Connects internal support sentiment with public reviews."
                },
                {
                    "category": "strategic_priorities",
                    "text": f"Over the next 12 months, are you prioritizing geographical expansion, launching SME merchant credit lines, or securing banking licenses?",
                    "rationale": "Aligns briefing intelligence with corporate development goals."
                },
                {
                    "category": "decision_triggers",
                    "text": "What changes in macro default rates, competitor credit limit offerings, or central bank circulars should prompt immediate model recalibration?",
                    "rationale": "Establishes trigger rules for weekly risk notifications."
                }
            ]

        # Dynamic synthesis for ANY unseen company (Database, Infrastructure, SaaS, E-Commerce, Healthcare, etc.)
        return [
            {
                "category": "revenue_engine",
                "text": f"For {name}, how are your commercial revenue streams structured across {prod_names}, and what represents your highest-margin offering?",
                "rationale": f"Analyzes the commercial monetization model of {name} based on its extracted offerings."
            },
            {
                "category": "customer_segments",
                "text": f"Which specific buyer personas within {cust_names} represent your fastest-growing and highest-retention customer tier?",
                "rationale": f"Focuses customer intelligence on {name}'s ideal customer profile."
            },
            {
                "category": "customer_pain",
                "text": f"What are the most persistent operational pain points or technical barriers your customers face when adopting {prod_names}?",
                "rationale": "Identifies user friction and churn drivers for customer problem monitoring."
            },
            {
                "category": "competitive_moat",
                "text": f"When prospects evaluate alternatives in the {industry} sector, what is {name}'s decisive differentiator and moat?",
                "rationale": "Maps competitive positioning against market incumbents and substitute solutions."
            },
            {
                "category": "pricing_economics",
                "text": "What are your primary unit economics levers (e.g. hosting costs, customer acquisition payback, gross margins), and where is pricing sensitive?",
                "rationale": "Establishes financial sensitivity thresholds for competitive pricing alerts."
            },
            {
                "category": "acquisition_channels",
                "text": "What are your primary customer acquisition channels (e.g. self-serve inbound, developer word-of-mouth, direct sales), and where do conversion drop-offs occur?",
                "rationale": "Identifies marketing and distribution dependencies."
            },
            {
                "category": "regulatory_risks",
                "text": f"What regulatory, data compliance, or industry policy changes in your key markets could materially impact {name}'s operating model?",
                "rationale": "Configures regulatory intelligence parameters."
            },
            {
                "category": "internal_patterns",
                "text": "What are the most frequent objections raised by prospects in sales demos or proof-of-concept evaluations that lead to lost deals?",
                "rationale": "Extracts internal objection benchmarks for comparison against competitor features."
            },
            {
                "category": "strategic_priorities",
                "text": f"What are {name}'s top three strategic milestones and product bets for the coming 6 to 12 months?",
                "rationale": "Aligns strategic relevance scoring with active roadmaps."
            },
            {
                "category": "decision_triggers",
                "text": "What specific external moves (e.g., competitor price cuts, new API announcements, vendor lock-in changes) should trigger an immediate executive review?",
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
        Records or updates an answer, extracting structured insights and generating
        targeted follow-up questions when critical risks or friction are disclosed.
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
            answer_record = existing_answer
        else:
            answer_record = InterviewAnswer(
                question_id=question_id,
                company_id=question.company_id,
                answer_text=answer_text,
                derived_insights=insights,
                is_edited=False
            )
            db.add(answer_record)
            db.commit()
            db.refresh(answer_record)

        # ADAPTIVE CAPABILITY: Check if answer triggers an adaptive follow-up question
        self._check_and_create_followup(db, question, answer_text)

        return answer_record

    def _check_and_create_followup(
        self,
        db: Session,
        parent_question: InterviewQuestion,
        answer_text: str
    ):
        """
        Inspects answer text for critical signals (churn, pricing pressure, delay, competitor threat)
        and generates an adaptive follow-up question if not already created.
        """
        if parent_question.is_followup:
            return  # Do not cascade follow-ups infinitely

        # Check if follow-up already exists for this parent
        existing_followup = db.query(InterviewQuestion).filter(
            InterviewQuestion.parent_question_id == parent_question.id
        ).first()
        if existing_followup:
            return

        text_lower = answer_text.lower()
        company = db.query(Company).filter(Company.id == parent_question.company_id).first()
        c_name = company.name if company else "your company"

        followup_text = None
        rationale = None

        if any(w in text_lower for w in ["drop-off", "drop off", "churn", "friction", "abandon", "quit"]):
            followup_text = f"Follow-up on Customer Retention: You mentioned experiencing drop-offs or friction. What specific tactical interventions or product changes has {c_name} tested to minimize this drop-off, and what were the outcomes?"
            rationale = "Generated dynamically based on disclosed customer drop-off friction."
        elif any(w in text_lower for w in ["visa delay", "embassy", "moratorium", "permit cap", "refusal", "rejection"]):
            followup_text = f"Follow-up on Immigration & Visa Sensitivity: Given the vulnerability to processing delays and caps, how is {c_name} diversifying candidate pathways or hedging revenue across alternative jurisdictions?"
            rationale = "Generated dynamically based on disclosed regulatory/visa vulnerability."
        elif any(w in text_lower for w in ["commission delay", "working capital", "cash flow", "margin squeeze", "refund"]):
            followup_text = f"Follow-up on Unit Economics: How is {c_name} managing working capital buffer requirements and renegotiating terms with institutional partners to protect cash flow?"
            rationale = "Generated dynamically based on disclosed financial and margin sensitivities."
        elif any(w in text_lower for w in ["lost deal", "lost to", "chose", "competitor won", "undercut"]):
            followup_text = f"Follow-up on Competitive Displacement: When prospects evaluate competitors and choose them, what specific feature, SLA, or pricing term is cited as the primary reason for switching?"
            rationale = "Generated dynamically based on disclosed competitive lost-deal pattern."

        if followup_text:
            followup_q = InterviewQuestion(
                company_id=parent_question.company_id,
                question_order=parent_question.question_order,  # shares parent slot
                question_text=followup_text,
                question_category=f"{parent_question.question_category}_followup",
                context_rationale=rationale,
                is_confidential_eligible=True,
                is_skipped=False,
                is_followup=True,
                parent_question_id=parent_question.id
            )
            db.add(followup_q)
            db.commit()

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
            "key_takeaway": f"Executive disclosure: {text[:150]}"
        })
        return insights


interview_engine = AdaptiveInterviewEngine()
