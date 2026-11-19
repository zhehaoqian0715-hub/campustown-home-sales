# Campus Comps

## What this site is for

Campus Comps helps readers compare historical completed home sales across US college towns. Select a state, sort cities by median price or sale count, and choose a city for its price range, listing-to-contract time and price per square foot. The default city detail is Champaign, Illinois.

## Live site

https://zhehaoqian0715-hub.github.io/campustown-home-sales/

## Data notes

The course dataset contains 35,442 completed-sale records. We retain sale prices from $10,000 through $5,000,000 inclusive, leaving 35,371 records and excluding 71. All figures use this price-filtered population. These are recorded sales collected in March 2026, with closing dates from March 2023 to March 2026, rather than current listings or a same-period index.

- Every row is retained by its unique listing ID. Repeated addresses are not deduplicated. ZIP codes, FIPS codes and parcel identifiers are read as text.
- Median sale price uses the individual retained sales, including for the all-state and state summaries. Overall medians are never averages of city medians.
- The middle 50% runs from the 25th to the 75th percentile, with linear interpolation.
- Days on market is contract date minus listing date. Only rows with both dates and a nonnegative duration contribute. Missing dates are not treated as zero. The valid sample count is shown in the city panel and summary metrics.
- Price per square foot is the median of each sale's price divided by its reported positive living area. Missing and zero living areas are excluded from this metric, with the count shown.
- Property-type labels are unreliable, so the site does not segment on them. It does not use the implausible lot sizes, bathroom counts, assessed values or tax amounts described in the source notes.
- Differences between cities may reflect sale dates and the mix of properties. Values were collected from a source and were not independently verified against county records.

The five supplied datasets are unchanged. The small derived file is `data/city_summary.json`, made with the Python standard library by `scripts/build_summary.py`. To reproduce it, run `python3 scripts/build_summary.py` from the repository root. The browser loads this derived file using a relative URL. The download button exports the current state's city summaries as CSV.

## Tools we used

OpenAI Codex for implementation and verification, Python's standard library for data summaries and independent SQLite checks, plain HTML/CSS/JavaScript for the website, Google Fonts for typography, and the template's GitHub Actions workflow for GitHub Pages. No server-side application or API keys are required. See `AGENT_LOG.md` for the collaboration record.

## Citation

College-town home sales dataset, version 1.0 (2026). University of Illinois-Deloitte Foundation Center for Business Emerging Technologies. Data collected March 2026.
