# Financial Model v2 — Notes for Next Iteration

**Date:** 2026-07-11
**Re:** Family Intelligence financial model (3-statement, base case, Sep-2026 start)
**Context:** The fundraising page and investor conversations will anchor on a
**$15M seed**. The current model raises $8.5M, so the model and the public ask
disagree by ~2x — an investor who sees both will read the $15M as unmodeled.
The next iteration should rebuild the seed round around $15M. Everything below
is in service of that.

First: the model is structurally excellent — the statements tie (Check row zero
every month), the MOQ/lead-time inventory engine with supplier advances and
customer deposits is real rigor, and excluding Phase 3 licensing revenue is the
right kind of conservatism. The notes below are about assumptions and round
architecture, not structure.

## 1. Re-size the seed to $15M

- Rebuild the Use of Funds tab for $15M. The strategic goal of the larger raise:
  **24+ months of runway past first ship** (i.e., through roughly month 36),
  so the Series A is raised on a year-plus of sales data instead of two months.
- Today, cash bottoms at ~$2.7M in month 14 and the plan *requires* a $22M
  Series A to close in month 15 — two months after first revenue. That is the
  single riskiest assumption in the model: a 6-month A delay bankrupts the base
  case. The $15M seed exists to remove that cliff; the new model should show
  the company surviving a Series A that arrives 12 months later than hoped.
- Re-time the Series A accordingly (likely month ~30+ from month 15) and revisit
  whether the Series B is needed in the base case at all — currently cash never
  drops below ~$18.5M before the B lands, which invites "why are you raising it?"
  Keeping it as an explicit war-chest/scenario option is fine; label it as such.

## 2. Reconcile the cap table to the $15M raise

The current cap table has $8.5M at $25M pre (25.4% to seed investors). At $15M,
one of these has to give:

- $15M at $25M pre → ~37.5% dilution — likely a non-starter for founders.
- $15M at ~$45M pre → ~25% dilution — conventional, but a $45M pre-money
  pre-revenue needs the deck/memo to justify it.
- Please model both, plus the sensitivity row in between, and flag the implied
  step-up to the Series A pre-money in each case (the existing 2.0–2.5x healthy
  step-up note is the right frame).
- Also confirm intent: SAFEs vs. priced round. The model assumes priced rounds
  throughout; investor feedback (Delana Tran) specifically asked which it is.

## 3. Add a tariff/duty line to unit COGS

Hardware is manufactured in Taipei/Shenzhen and lands in the US. There is no
tariff or duty line in the unit COGS build (freight-in is included; duties are
not visible). Please add an explicit tariff assumption per SKU — even a
placeholder rate we can flex (e.g., 0% / 10% / 25% scenario). At the current
$360 flagship COGS, a 10–25% duty is $36–90/unit and moves net hardware gross
margin from 52.5% to roughly 48–43%, so this materially changes the margin
story we tell publicly.

## 4. Pressure-test the assumptions that all lean optimistic

None of these are unreasonable alone; together they all lean the same way, and
the public page will quote their outputs. Please add sensitivity (or revise the
base) for:

- **Subscription churn: 1.5%/month** (66-month lifetime). What does 2.0–2.5%
  do to subscription LTV ($510 today) and blended LTV:CAC (2.7x today)? At
  2.5% churn + $300 CAC, LTV:CAC is ~2.0x — we should know which number we're
  defending.
- **Blended CAC: flat $250 for five years.** CAC nearly always rises as early
  adopters exhaust. Consider a ramp, or at minimum a sensitivity row.
- **Returns & warranty reserve: 3% of hardware revenue.** Low end for consumer
  hardware v1; 5% would be a more defensible base for a first-generation device.
- **Companion backup conversion: 95%.** Small dollar impact, but 95% of
  anything is a red flag in diligence — consider 75–85%.

## 5. Small items

- The "Subscriptions billed annually %" input is unused (set to "-"); either
  wire it up or remove it so diligence doesn't ask.
- Interest income at 3% on large idle balances is fine, but with the re-timed
  rounds those balances shrink — just confirm it flows through.
- Model start month (Sep-2026) drives every label; if the raise timing slips,
  remember the page no longer shows a date, but the model will — keep the
  "Last updated" discipline here instead.

## What we'll quote publicly (so you know what gets scrutiny)

After Hugh reviews v2, the fundraising page will cite: net hardware gross
margin, blended LTV:CAC, and the EBITDA-breakeven point (month + cumulative
devices). Those three outputs are the ones to make bulletproof. The $899 /
$9-month pricing and the ~110k-device scale framing are going up now.
