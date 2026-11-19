'use strict';

const currency = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0});
const number = new Intl.NumberFormat('en-US', {maximumFractionDigits: 1});
const elements = Object.fromEntries(['state', 'sort', 'metrics', 'scope', 'bars', 'city-detail', 'table-body', 'download', 'coverage-note'].map(id => [id, document.getElementById(id)]));
let dataset;
let visibleCities = [];
let selectedCity = 'Champaign|IL';

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[character]));
}

function key(city) {
  return `${city.city}|${city.state}`;
}

function showCity(city) {
  selectedCity = key(city);
  for (const button of elements.bars.querySelectorAll('button')) {
    const selected = button.dataset.city === selectedCity;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  }
  elements['city-detail'].innerHTML = `
    <div class="eyebrow">CITY IN FOCUS</div><h3 id="city-title">${escapeHtml(city.city)}, ${escapeHtml(city.state)}</h3>
    <div class="campus">${escapeHtml(city.university)}</div>
    <div class="city-price">${currency.format(city.median_price)}</div><div class="hint">Median recorded sale price</div>
    <dl><div><dt>Sales included</dt><dd>${number.format(city.sales)}<small>${number.format(city.excluded)} excluded by the price rule</small></dd></div>
    <div><dt>Middle 50% of prices</dt><dd>${currency.format(city.p25_price)}–${currency.format(city.p75_price)}</dd></div>
    <div><dt>Median days on market</dt><dd>${city.median_dom === null ? 'Not available' : `${number.format(city.median_dom)} days`}<small>${number.format(city.dom_count)} of ${number.format(city.sales)} sales have valid listing-to-contract dates</small></dd></div>
    <div><dt>Median price per square foot</dt><dd>${city.median_per_sqft === null ? 'Not available' : currency.format(city.median_per_sqft)}<small>${number.format(city.sqft_count)} sales with reported, positive living area</small></dd></div></dl>
    <p class="hint">Recorded closing dates<br>${city.date_min} to ${city.date_max}</p>`;
}

function render() {
  const state = elements.state.value;
  const summary = state === 'all' ? dataset.all : dataset.states[state];
  visibleCities = dataset.cities.filter(city => state === 'all' || city.state === state);
  const sort = elements.sort.value;
  visibleCities.sort((a, b) => sort === 'name' ? a.city.localeCompare(b.city) : (sort === 'sales' ? b.sales - a.sales : b.median_price - a.median_price) || a.city.localeCompare(b.city));
  const metrics = [
    ['Median sale price', currency.format(summary.median_price), 'Across retained sales'],
    ['Sales included', number.format(summary.sales), 'After the price rule'],
    ['Cities represented', number.format(summary.cities), state === 'all' ? 'Across the dataset' : `In ${state}`],
    ['Median days on market', summary.median_dom === null ? 'Not available' : `${number.format(summary.median_dom)} days`, `${number.format(summary.dom_count)} sales with valid dates`],
  ];
  elements.metrics.innerHTML = metrics.map(([label, value, note]) => `<div class="metric"><span>${label}</span><strong>${value}</strong><small>${note}</small></div>`).join('');
  elements.scope.textContent = `${state === 'all' ? 'All states' : state} · ${number.format(summary.source_count)} source records · ${number.format(summary.excluded)} excluded by price · Recorded closings ${summary.date_min} to ${summary.date_max}`;
  const maximum = Math.max(...visibleCities.map(city => city.median_price));
  elements.bars.replaceChildren();
  for (const city of visibleCities) {
    const button = document.createElement('button');
    button.className = 'bar-row';
    button.type = 'button';
    button.dataset.city = key(city);
    button.setAttribute('aria-label', `${city.city}, ${city.state}, median sale price ${currency.format(city.median_price)}, ${city.sales} sales`);
    button.innerHTML = `<span class="bar-city">${escapeHtml(city.city)}<small>${escapeHtml(city.state)}</small></span><span class="track" aria-hidden="true"><span class="bar-fill" style="--bar:${city.median_price / maximum * 100}%"></span></span><span class="bar-price">${currency.format(city.median_price)}</span>`;
    button.addEventListener('click', () => showCity(city));
    elements.bars.append(button);
  }
  elements['table-body'].innerHTML = visibleCities.map(city => `<tr><td>${escapeHtml(city.city)}</td><td>${escapeHtml(city.state)}</td><td>${number.format(city.sales)}</td><td>${currency.format(city.median_price)}</td><td>${currency.format(city.p25_price)}–${currency.format(city.p75_price)}</td><td>${city.median_dom === null ? 'Not available' : `${number.format(city.median_dom)} days`}</td></tr>`).join('');
  showCity(visibleCities.find(city => key(city) === selectedCity) || visibleCities[0]);
}

function downloadSummary() {
  const columns = ['city', 'state', 'university', 'source_count', 'sales', 'excluded', 'median_price', 'p25_price', 'p75_price', 'median_dom', 'dom_count', 'median_per_sqft', 'sqft_count'];
  const quote = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [columns, ...visibleCities.map(city => columns.map(column => city[column]))].map(row => row.map(quote).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = `campus-comps-${elements.state.value}-city-summary.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function init() {
  try {
    const response = await fetch('data/city_summary.json');
    if (!response.ok) throw new Error(`Data request failed (${response.status})`);
    dataset = await response.json();
    for (const state of Object.keys(dataset.states)) {
      elements.state.add(new Option(state, state));
    }
    elements['coverage-note'].textContent = `${number.format(dataset.all.source_count)} completed-sale records cover ${number.format(dataset.cities.length)} cities. After applying the stated price rule, ${number.format(dataset.all.sales)} sales remain and ${number.format(dataset.all.excluded)} are excluded. Recorded closing dates among retained sales span ${dataset.all.date_min} to ${dataset.all.date_max}.`;
    elements.state.addEventListener('change', render);
    elements.sort.addEventListener('change', render);
    elements.download.addEventListener('click', downloadSummary);
    elements.download.disabled = false;
    render();
  } catch (error) {
    elements.metrics.replaceChildren();
    const message = document.createElement('p');
    message.className = 'error';
    message.textContent = 'Sales summaries could not load. Please reload the page or use the original CSV linked below.';
    elements.metrics.append(message);
    console.error(error);
  }
}

init();
