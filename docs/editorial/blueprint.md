Editorial Blueprint v1.0
I don't want this to be a "writing guide."
I want it to feel like Apple's Human Interface Guidelines, but for engineering writing.
So here's the structure I propose.
________________________________________
Part I — Editorial Philosophy
Chapter 1 — Purpose of an EKOS Article
Why articles exist.
What they should accomplish.
Why readers should trust them.
________________________________________
Chapter 2 — The Reader Promise
Every article makes a promise.
When someone clicks an EKOS article, they should know exactly what they're getting.
________________________________________
Chapter 3 — What Makes an Article Worth Publishing
Not every idea deserves an article.
We'll define the criteria.
________________________________________
Part II — Reader Experience
This is where we define the experience.
Chapter 4 — Teaching Philosophy
How people actually learn engineering.
Examples:
•	Build intuition first
•	Then theory
•	Then implementation
•	Then production
________________________________________
Chapter 5 — Explaining Complex Systems
How to teach difficult topics.
Examples:
•	Analogies
•	Progressive disclosure
•	Layered explanations
•	Visual reasoning
________________________________________
Chapter 6 — Engineering Storytelling
Instead of
Here's Redis.
We begin with
Here's the bottleneck we encountered.
Then explain why Redis exists.
________________________________________
Part III — Writing Standards
This becomes your style guide.
________________________________________
Tone
Professional.
Friendly.
Engineering-first.
Never arrogant.
Never clickbait.
________________________________________
Voice
Confident.
Honest.
Evidence-based.
Curious.
________________________________________
Language
Prefer:
Simple words.
Precise explanations.
Short paragraphs.
Clear transitions.
________________________________________
Code Philosophy
Code should teach ideas.
Not show off.
Every snippet answers a question.
________________________________________
Diagram Philosophy
Every diagram must simplify understanding.
Never decorate.
Only explain.
________________________________________
Part IV — Article Anatomy
Probably one of the biggest chapters.
Every article follows a blueprint.
Something like
Title

↓

Problem

↓

Motivation

↓

Prerequisites

↓

Background

↓

Core Concepts

↓

Architecture

↓

Implementation

↓

Tradeoffs

↓

Production

↓

Lessons Learned

↓

Related Reading

↓

Next Steps
Every article instantly feels familiar.
________________________________________
Part V — Knowledge Standards
This is unique.
Every article must define:
Prerequisites
Related Concepts
Projects
Series
Future Reading
Knowledge Relationships
This keeps the graph healthy.
________________________________________
Part VI — Visual Standards
How diagrams work.
When to use
Architecture diagrams
Sequence diagrams
Flowcharts
Tables
Decision trees
Animations
Interactive demos
________________________________________
Part VII — Review Standards
Before publishing.
Technical review.
Editorial review.
Consistency review.
Knowledge review.
________________________________________
Part VIII — Publishing Standards
Metadata.
SEO.
Internal links.
Series navigation.
Accessibility.
Performance.
________________________________________
Part IX — Maintenance
How articles evolve.
Version history.
Technology updates.
Deprecation.
Revision schedule.
________________________________________
Part X — Appendix
Templates.
Checklists.
Examples.
Best practices.
Common mistakes.
________________________________________
But here's where I want to go beyond existing publications.
I want every EKOS article to satisfy The Four Layers of Understanding.
Layer 1

What is it?

↓

Layer 2

How does it work?

↓

Layer 3

Why was it designed this way?

↓

Layer 4

How does it behave in production?
Most blogs stop after Layer 2.
Great engineering publications reach Layer 4.
________________________________________
Another idea
I think every article should have a Decision Box.
Example:
Engineering Decision

Why did we choose PostgreSQL instead of MongoDB?

Decision

PostgreSQL

Why?

• ACID guarantees
• Strong relational model
• Better fit for our workload

Tradeoff

More rigid schema.

When NOT to use

Rapidly changing document structures.
This is something I rarely see in blogs, but it teaches engineering judgment rather than just implementation.
________________________________________
And one final addition
I want the Editorial Blueprint to open with a statement that every future article should live up to.
The EKOS Editorial Oath
We do not publish to increase the number of articles.
We publish to increase the quality of understanding.
Every article should help readers think more clearly, build more confidently, and make better engineering decisions.
If an article cannot achieve that, it should not be published.
________________________________________
This is where I think EKOS becomes truly distinctive
Most publications optimize for content output.
EKOS should optimize for knowledge quality.
That difference will influence every decision—from how you choose topics to how you review drafts and update articles years later.
I think this document deserves the same level of polish as the Microcosm PRD and EKOS PRD. Together, these three documents form a coherent foundation:
•	Microcosm PRD → defines the product.
•	EKOS PRD → defines the philosophy.
•	Editorial Blueprint → defines how philosophy becomes consistently excellent content.
Once those are complete, you'll have a complete operating system for building, documenting, and sharing engineering knowledge.

