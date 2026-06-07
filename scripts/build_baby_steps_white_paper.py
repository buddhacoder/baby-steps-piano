from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


OUTPUT = "output/pdf/baby-steps-pedagogy-white-paper-v0.2.pdf"
VERSION = "v0.2"


def page_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#687168"))
    canvas.drawString(0.72 * inch, 0.42 * inch, f"Baby Steps Pedagogy White Paper {VERSION}")
    canvas.drawRightString(7.78 * inch, 0.42 * inch, f"Page {doc.page}")
    canvas.restoreState()


def build_styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "Title",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=24,
            leading=29,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#1f2a24"),
            spaceAfter=10,
        ),
        "subtitle": ParagraphStyle(
            "Subtitle",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=11,
            leading=15,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#566058"),
            spaceAfter=16,
        ),
        "h1": ParagraphStyle(
            "Heading1",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=15,
            leading=18,
            textColor=colors.HexColor("#26342a"),
            spaceBefore=14,
            spaceAfter=7,
        ),
        "h2": ParagraphStyle(
            "Heading2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=11.6,
            leading=14,
            textColor=colors.HexColor("#36523d"),
            spaceBefore=10,
            spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=9.6,
            leading=13.6,
            textColor=colors.HexColor("#202820"),
            spaceAfter=6.5,
        ),
        "quote": ParagraphStyle(
            "Quote",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=10.5,
            leading=15.4,
            textColor=colors.HexColor("#233026"),
            leftIndent=8,
            rightIndent=8,
            spaceAfter=7,
        ),
        "small": ParagraphStyle(
            "Small",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=8.2,
            leading=11.1,
            textColor=colors.HexColor("#38433b"),
            spaceAfter=4,
        ),
        "cell": ParagraphStyle(
            "Cell",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=8.2,
            leading=10.7,
            textColor=colors.HexColor("#1f2a24"),
        ),
        "cell_bold": ParagraphStyle(
            "CellBold",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=8.3,
            leading=10.7,
            textColor=colors.HexColor("#1f2a24"),
        ),
        "ref": ParagraphStyle(
            "Reference",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=7.6,
            leading=9.5,
            textColor=colors.HexColor("#202820"),
            spaceAfter=4,
        ),
    }


def p(text, style):
    return Paragraph(text, style)


def callout(text, styles, bg="#f7f2e6", border="#d8c38a"):
    box = Table([[p(text, styles["quote"])]], colWidths=[6.75 * inch])
    box.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(bg)),
                ("BOX", (0, 0), (-1, -1), 0.7, colors.HexColor(border)),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return box


def model_table(styles):
    rows = [
        [p("Baby Step phase", styles["cell_bold"]), p("Instructional intent", styles["cell_bold"]), p("Example: A -> E/G# -> A", styles["cell_bold"])],
        [p("Touch", styles["cell"]), p("Give the learner one concrete physical entry point.", styles["cell"]), p("Place the left hand on A major.", styles["cell"])],
        [p("Move", styles["cell"]), p("Create one small musical change.", styles["cell"]), p("Move to E major in first inversion.", styles["cell"])],
        [p("Feel", styles["cell"]), p("Anchor attention in sound, body, and affect.", styles["cell"]), p("Notice home -> pull -> home.", styles["cell"])],
        [p("Notice", styles["cell"]), p("Reveal the key perceptual mechanism.", styles["cell"]), p("G# sits just below A and wants to rise.", styles["cell"])],
        [p("Name", styles["cell"]), p("Introduce theory as recognition, not prerequisite.", styles["cell"]), p("I -> V6 -> I.", styles["cell"])],
        [p("Transfer", styles["cell"]), p("Move the same idea to another context.", styles["cell"]), p("Try the same motion in C.", styles["cell"])],
    ]
    table = Table(rows, colWidths=[1.35 * inch, 2.8 * inch, 2.6 * inch], repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e5eee5")),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd6cb")),
                ("INNERGRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#dce3dc")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return table


def add_para(story, text, styles):
    story.append(p(text, styles["body"]))


def main():
    styles = build_styles()
    doc = BaseDocTemplate(
        OUTPUT,
        pagesize=letter,
        leftMargin=0.72 * inch,
        rightMargin=0.72 * inch,
        topMargin=0.65 * inch,
        bottomMargin=0.65 * inch,
        title="Baby Steps Pedagogy White Paper",
        author="Baby Steps",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=page_footer)])

    story = []

    story.extend(
        [
            Spacer(1, 0.72 * inch),
            p("Baby Steps", styles["title"]),
            p(
                "A Research-Informed Pedagogy for Embodied, ADHD-Aware Piano Learning",
                styles["subtitle"],
            ),
            callout(
                f"White paper {VERSION} | June 2026<br/>"
                "This paper defines the pedagogical hypothesis behind Baby Steps. "
                "It is a research-informed product and learning-design framework, "
                "not a clinical claim, medical intervention, or substitute for individualized instruction.",
                styles,
            ),
            Spacer(1, 0.22 * inch),
            p(
                "<b>Central claim.</b> Baby Steps teaches piano by turning larger musical "
                "concepts into tiny playable experiences. The learner first touches, hears, "
                "and feels a small musical movement. Only after that embodied contact does "
                "the system reveal the theoretical language that names what happened.",
                styles["body"],
            ),
            p(
                "<b>Pedagogical sequence:</b> movement -> feeling -> noticing -> naming -> theory reveal -> transfer -> musical use.",
                styles["quote"],
            ),
            p(
                "The model is designed for adult learners, including ADHD learners who may "
                "bring self-criticism, inconsistent practice histories, overwhelm, or difficulty "
                "returning after interruption. In Baby Steps, nervous-system safety is not "
                "cosmetic UX. It is an instructional design condition for sustained learning.",
                styles["body"],
            ),
        ]
    )

    story.append(PageBreak())

    story.append(p("1. Why Another Piano Pedagogy Is Needed", styles["h1"]))
    add_para(
        story,
        "Conventional piano instruction often begins with external structures: notation, "
        "terminology, technique rules, theoretical definitions, and assigned exercises. "
        "This sequence can produce excellent musicianship when the learner has enough "
        "working memory, emotional safety, continuity, and support to integrate the parts. "
        "It can also create a familiar adult-learner failure pattern: the learner receives "
        "too much abstraction before there is enough bodily contact to make the abstraction meaningful.",
        styles,
    )
    add_para(
        story,
        "The problem is not that theory is unnecessary. Theory is indispensable. The problem "
        "is timing. If a beginner is asked to process chord spelling, inversion labels, finger "
        "position, staff notation, harmonic function, and performance evaluation all at once, "
        "the lesson may become a cognitive-load event rather than a musical one. Cognitive "
        "load theory suggests that novices can be overwhelmed by too many interacting elements "
        "before meaningful schema formation begins [3]. Baby Steps responds by reducing the "
        "first unit of learning to one embodied musical action.",
        styles,
    )
    add_para(
        story,
        "This is especially relevant for adult ADHD learners. Adult ADHD is frequently associated "
        "with emotion dysregulation, self-esteem burden, and impairment across daily activities "
        "[5]. In music learning, these issues often appear as avoidance, harsh self-talk, "
        "inconsistent practice, and difficulty resuming after a missed day. A pedagogy that "
        "ignores affective safety may deliver accurate content while still undermining the "
        "learner's ability to return.",
        styles,
    )
    story.append(
        callout(
            "<b>Design question:</b> What would piano learning look like if the first obligation "
            "of each lesson were to protect contact - contact with sound, hand, curiosity, "
            "and the learner's willingness to try again?",
            styles,
            bg="#edf7f0",
            border="#9fcbaa",
        )
    )

    story.append(p("2. The Baby Step as the Unit of Learning", styles["h1"]))
    add_para(
        story,
        "A Baby Step is not a topic. It is not 'dominant harmony,' 'first inversion,' or "
        "'cadence theory.' A Baby Step is a small playable movement that contains one of "
        "those larger concepts in miniature. The learner encounters the concept as an "
        "experience before encountering it as a name.",
        styles,
    )
    add_para(
        story,
        "For example, a learner may place the left hand on A major, move to E major in first "
        "inversion, and return to A major. At the beginning, this is not presented as figured "
        "bass or dominant function. It is presented as a movement: home, pull, home. The "
        "learner feels the hand shift, hears the gravitational return, and notices that G# "
        "sits close to A. Only then does the system reveal the label: I -> V6 -> I. The "
        "theory arrives as recognition.",
        styles,
    )
    story.append(model_table(styles))
    story.append(Spacer(1, 8))
    add_para(
        story,
        "This sequencing is aligned with experiential learning theory, in which concrete "
        "experience precedes reflection, conceptualization, and experimentation [2]. It is "
        "also consistent with embodied music cognition, which treats musical meaning as "
        "connected to bodily action, gesture, and perception rather than abstract cognition "
        "alone [1].",
        styles,
    )

    story.append(p("3. Experience First, Language Second", styles["h1"]))
    add_para(
        story,
        "The phrase 'experience first, language second' is the central pedagogical rule. "
        "The app does not hide theory because theory is unimportant. It delays theory until "
        "the learner has a sensory hook. Once the learner has felt the motion, a term such "
        "as dominant, plagal, first inversion, voice-leading, or cadence has somewhere to land.",
        styles,
    )
    add_para(
        story,
        "This produces a different emotional relationship to theory. Instead of theory "
        "functioning as a gate - something the learner must understand before being allowed "
        "to play - theory becomes an explanation of something already encountered. The "
        "learner's internal response shifts from 'I do not understand this word' to 'that "
        "thing I just felt has a name.'",
        styles,
    )
    add_para(
        story,
        "This shift matters. Adult learners often carry histories of feeling late, behind, "
        "inconsistent, or musically inadequate. A theory-first lesson can inadvertently "
        "replay those histories. A movement-first lesson can create a small, real experience "
        "of competence before language enters the scene.",
        styles,
    )

    story.append(p("4. The Hallmark Path: Left-Hand Chord Freedom", styles["h1"]))
    add_para(
        story,
        "The first flagship path is Left-Hand Chord Freedom. Its premise is that many adult "
        "learners become musically freer when the left hand stops feeling like a source of "
        "panic and starts functioning as a harmonic anchor. The path does not begin with a "
        "complete theory map. It begins with home.",
        styles,
    )
    add_para(
        story,
        "The sequence is: Find Home -> Build Chords -> Shape Hands -> Move Smoothly -> Make Music. "
        "Find Home means locating the root and experiencing stability. Build Chords means "
        "turning that root into a triad or seventh chord. Shape Hands means converting the "
        "chord into root positions, inversions, shells, and grips that can be felt without "
        "visual dependence. Move Smoothly means choosing nearby shapes and guide-tone paths "
        "instead of jumping around the keyboard. Make Music means using the move inside a "
        "groove, loop, cadence, progression, or song-like outcome.",
        styles,
    )
    add_para(
        story,
        "This path also allows advanced concepts to appear early without overwhelming the "
        "learner. A beginner can feel I -> V6 -> I long before knowing what V6 means. A "
        "beginner can feel D -> A as an Amen-like plagal color before studying cadences. "
        "A beginner can play Bm7 -> E7 -> A as a satisfying motion before understanding "
        "the full grammar of ii-V-I. The concept is advanced; the action is small.",
        styles,
    )

    story.append(PageBreak())

    story.append(p("5. Nervous-System Safety Is Part of the Pedagogy", styles["h1"]))
    add_para(
        story,
        "Baby Steps treats nervous-system safety as a condition for learning, especially for "
        "adult ADHD learners who may have accumulated self-critical experiences around practice, "
        "inconsistency, or perceived failure. This does not make the app a clinical tool. It "
        "means the instructional design avoids unnecessary threat cues and supports the learner's "
        "ability to remain in contact with difficulty.",
        styles,
    )
    add_para(
        story,
        "Safety in this context means predictable next steps, low-shame retry language, "
        "optional simplification, preserved progress, and the absence of punitive streak logic. "
        "It means a messy attempt can still count as contact. It means a learner who returns "
        "after a week away is not greeted by failure, but by a recoverable thread.",
        styles,
    )
    add_para(
        story,
        "SAMHSA's trauma-informed framework emphasizes safety, trustworthiness, choice, "
        "collaboration, and empowerment [6]. Baby Steps adapts those principles to non-clinical "
        "learning design. The goal is not therapy. The goal is to keep the learner available "
        "for the next musical action.",
        styles,
    )
    story.append(
        callout(
            "<b>Nervous-system safety rule:</b> each Baby Step should be small enough to start, "
            "safe enough to repeat, forgiving enough to survive mistakes, and musical enough "
            "to invite return.",
            styles,
            bg="#eef4fb",
            border="#9fb9dc",
        )
    )
    add_para(
        story,
        "Self-determination theory provides another useful frame. Motivation is supported "
        "when autonomy, competence, and relatedness are protected [4]. Baby Steps operationalizes "
        "autonomy through choice doors and lab branches, competence through tiny winnable "
        "actions, and relatedness through coach continuity, saved lesson stacks, and a tone "
        "that treats practice attempts as information rather than moral evidence.",
        styles,
    )

    story.append(p("6. Practice, Repetition, and Mastery Without Shame", styles["h1"]))
    add_para(
        story,
        "The practice model distinguishes contact from mastery. A learner can touch an idea, "
        "repeat an idea, and use an idea without being forced into a binary pass/fail frame. "
        "The proposed states are Practiced, Confident, and Mastered. Practiced means the learner "
        "made contact. Confident means the learner repeated the move enough times to begin "
        "trusting it. Mastered means the learner used the move in a musical context or passed "
        "a readiness checkpoint.",
        styles,
    )
    add_para(
        story,
        "The current product hypothesis uses seven clean-ish repetitions as a suggested "
        "minimum before a checkpoint. Seven is not a medical claim or universal law. It is "
        "a design threshold: small enough for ADHD-friendly sessions, concrete enough to "
        "provide a finish line, and embodied enough to turn 'I get it' into 'my hand has "
        "actually done this.'",
        styles,
    )
    add_para(
        story,
        "Low-stakes retrieval and repeated attempts have support in learning research [7], "
        "while deliberate practice literature emphasizes targeted practice designed around "
        "improvement [8]. Baby Steps borrows the seriousness of practice without importing "
        "the shame of performance. Repetition is framed as return, not punishment.",
        styles,
    )

    story.append(p("7. Why This May Be Different", styles["h1"]))
    add_para(
        story,
        "Baby Steps is not novel because it uses short lessons. Short lessons are common. "
        "It is not novel because it values ear, body, or examples; good teachers have always "
        "done this in some form. The differentiation is the integrated system: embodied "
        "micro-movements, delayed theory reveal, ADHD-aware re-entry, nervous-system-safe "
        "practice states, and AI-supported lesson persistence in one product model.",
        styles,
    )
    add_para(
        story,
        "The founder-origin context is relevant. Clinical anesthesia trains attention to "
        "state, threshold, sequencing, safety, and response to feedback. Lived adult ADHD "
        "experience adds sensitivity to friction, novelty, re-entry, and self-critical loops. "
        "Baby Steps applies that combined lens to piano learning. The design question is not "
        "only 'What concept comes next?' It is also 'What state must the learner be in to "
        "remain available for the next small action?'",
        styles,
    )
    add_para(
        story,
        "The proposed IP statement is therefore simple: Baby Steps turns advanced musical "
        "ideas into tiny playable moves, reveals theory after the learner has felt the "
        "concept, and preserves the learner's thread so practice can continue without shame.",
        styles,
    )

    story.append(PageBreak())

    story.append(p("8. Product Implications", styles["h1"]))
    add_para(
        story,
        "A Baby Steps product should not look like a static course catalog. It should behave "
        "like a guided thinking lab. The app may recommend the next step, but the learner "
        "should retain a path back into exploration. A lab discovery can become a saved lesson. "
        "A coach artifact can become a full lesson. A repeated movement can become a mastery "
        "checkpoint. The app's memory layer matters because adult learners often lose momentum "
        "not from lack of interest, but from losing the thread.",
        styles,
    )
    add_para(
        story,
        "The first product path should therefore privilege continuity: the learner should see "
        "what they were touching, what they were beginning to understand, what move comes next, "
        "and how to make the next action smaller if needed. Cross-device account sync, lesson "
        "stack persistence, concept mastery, artifact attempts, and profile state are not merely "
        "technical conveniences. They are part of the pedagogy of return.",
        styles,
    )

    story.append(p("9. What Is Not Yet Proven", styles["h1"]))
    add_para(
        story,
        "This paper describes a pedagogical hypothesis. It does not prove that Baby Steps "
        "improves retention, practice adherence, transfer, self-efficacy, or musical skill "
        "relative to other approaches. Those claims require user testing and comparison data.",
        styles,
    )
    add_para(
        story,
        "The appropriate next research step is a small pilot. Useful measures include seven-day "
        "and thirty-day return rates, perceived overwhelm, willingness to retry, self-efficacy, "
        "accuracy of transfer to a second key, delayed recognition of the named concept, and "
        "qualitative reports of shame or safety during practice. A particularly useful comparison "
        "would test explanation-first lessons against movement-first delayed-reveal lessons.",
        styles,
    )

    story.append(p("10. Conclusion", styles["h1"]))
    add_para(
        story,
        "Baby Steps proposes that piano learning can begin with tiny playable truth. The learner "
        "does not need to understand the whole map before touching a meaningful part of it. "
        "A small movement can carry an advanced idea. A hand can feel harmonic gravity before "
        "the mind knows the term. A learner can experience competence before being asked to "
        "perform understanding.",
        styles,
    )
    add_para(
        story,
        "The model's promise lies in combining embodied music cognition, experiential learning, "
        "cognitive-load sensitivity, ADHD-aware re-entry, and nervous-system-safe design. It is "
        "a humane thesis: advanced musicianship can grow from small, safe, repeatable contacts "
        "with sound.",
        styles,
    )

    story.append(PageBreak())
    story.append(p("References", styles["h1"]))
    refs = [
        "[1] Leman, M. (2010). An embodied approach to music semantics. https://journals.sagepub.com/doi/pdf/10.1177/10298649100140S104",
        "[2] Kolb, D. A. Experiential learning cycle: concrete experience, reflective observation, abstract conceptualization, active experimentation. Overview: https://citt.ufl.edu/resources/the-learning-process/types-of-learners/kolbs-four-stages-of-learning/",
        "[3] Sweller, J.; van Gog, T.; Paas, F.; and colleagues. Cognitive load theory and worked examples. Educational Psychology Review. https://link.springer.com/article/10.1007/s10648-010-9145-4",
        "[4] Ryan, R. M., & Deci, E. L. (2000). Self-determination theory and the facilitation of intrinsic motivation, social development, and well-being. American Psychologist. https://pubmed.ncbi.nlm.nih.gov/11392867/",
        "[5] Beheshti, A. et al. (2023). Evidence of emotion dysregulation as a core symptom of adult ADHD: A systematic review. https://pmc.ncbi.nlm.nih.gov/articles/PMC9821724/",
        "[6] Substance Abuse and Mental Health Services Administration. Trauma-informed approaches and programs. https://www.samhsa.gov/mental-health/trauma-violence/trauma-informed-approaches-programs",
        "[7] Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. Psychological Science. https://pubmed.ncbi.nlm.nih.gov/16507066/",
        "[8] Ericsson, K. A.; Krampe, R. T.; Tesch-Romer, C. (1993). Deliberate practice and expert performance. Discussion and reviews: https://pmc.ncbi.nlm.nih.gov/articles/PMC6731745/",
    ]
    for ref in refs:
        story.append(p(ref, styles["ref"]))

    doc.build(story)
    print(OUTPUT)


if __name__ == "__main__":
    main()
