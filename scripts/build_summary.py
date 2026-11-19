"""Reproduce all website statistics from the unchanged course CSV."""
import csv
import hashlib
import json
from collections import defaultdict
from datetime import date
from pathlib import Path
from statistics import median

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'data/college_town_home_sales.csv'
MIN_PRICE = 10_000
MAX_PRICE = 5_000_000


def percentile(values, fraction):
    ordered = sorted(values)
    position = (len(ordered) - 1) * fraction
    lower = int(position)
    upper = min(lower + 1, len(ordered) - 1)
    return ordered[lower] + (ordered[upper] - ordered[lower]) * (position - lower)


def summarize(records):
    included = [r for r in records if MIN_PRICE <= int(r['sale_price']) <= MAX_PRICE]
    print(f'Price filter: {len(records):,} -> {len(included):,} rows')
    prices = [int(r['sale_price']) for r in included]
    days = []
    per_sqft = []
    for row in included:
        if row['list_date'] and row['contract_date']:
            gap = (date.fromisoformat(row['contract_date']) - date.fromisoformat(row['list_date'])).days
            if gap >= 0:
                days.append(gap)
        if row['living_area_sqft'] and float(row['living_area_sqft']) > 0:
            per_sqft.append(int(row['sale_price']) / float(row['living_area_sqft']))
    dates = [r['sale_date'] for r in included if r['sale_date']]
    return {
        'source_count': len(records), 'sales': len(included),
        'excluded': len(records) - len(included),
        'cities': len({(r['city'], r['state']) for r in included}),
        'median_price': median(prices),
        'p25_price': percentile(prices, .25), 'p75_price': percentile(prices, .75),
        'median_dom': median(days) if days else None, 'dom_count': len(days),
        'median_per_sqft': median(per_sqft) if per_sqft else None, 'sqft_count': len(per_sqft),
        'date_min': min(dates), 'date_max': max(dates),
    }


def main():
    with SOURCE.open(newline='', encoding='utf-8-sig') as stream:
        rows = list(csv.DictReader(stream))
    assert len({r['listing_id'] for r in rows}) == len(rows)
    print(f'Loaded {len(rows):,} rows; identifier fields preserved as text.')
    cities = defaultdict(list)
    states = defaultdict(list)
    for row in rows:
        cities[(row['city'], row['state'])].append(row)
        states[row['state']].append(row)
    result = {
        'source_sha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
        'price_min': MIN_PRICE, 'price_max': MAX_PRICE,
        'all': summarize(rows),
        'states': {state: summarize(items) for state, items in sorted(states.items())},
        'cities': [dict(city=city, state=state, university=items[0]['university'], **summarize(items))
                   for (city, state), items in sorted(cities.items())],
    }
    assert sum(c['sales'] for c in result['cities']) == result['all']['sales']
    assert sum(c['excluded'] for c in result['cities']) == result['all']['excluded']
    target = ROOT / 'data/city_summary.json'
    target.write_text(json.dumps(result, indent=2, allow_nan=False) + '\n')
    print(f'Wrote {target.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
