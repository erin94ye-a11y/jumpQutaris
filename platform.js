(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const renderedMarkup = new WeakMap();
  const html = (element, markup) => {
    if (renderedMarkup.get(element) === markup) return;
    element.innerHTML = markup;
    renderedMarkup.set(element,markup);
  };
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const finite = value => value !== null && value !== undefined && Number.isFinite(Number(value));
  const number = (value, digits = 2) => finite(value) ? Number(value).toLocaleString('en-US', {minimumFractionDigits:digits, maximumFractionDigits:digits}) : '—';
  const money = value => finite(value) ? '$' + number(value) : '—';
  const percent = value => finite(value) ? `${Number(value) > 0 ? '+' : ''}${number(value)}%` : '—';
  const tone = value => Number(value) > 0 ? 'positive' : Number(value) < 0 ? 'negative' : '';
  const titleCase = value => String(value || 'unknown').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const timestamp = value => value ? new Date(value).toLocaleString('en-US', {month:'short',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}) : '—';
  const clockTime = value => value ? new Date(value).toLocaleTimeString('en-US', {hour12:false}) : '—';
  const duration = value => {
    if (!finite(value)) return '—';
    const seconds = Math.max(0, Math.floor(Number(value) / 1000));
    return `${Math.floor(seconds / 3600).toString().padStart(2,'0')}:${Math.floor(seconds % 3600 / 60).toString().padStart(2,'0')}:${(seconds % 60).toString().padStart(2,'0')}`;
  };
  const defaults = {market:'Cryptocurrency',assets:['BTC-USD','ETH-USD'],timeframe:'5m',initialBalance:100000,positionSize:5,maxExposure:30,riskLevel:'Balanced',minConfidence:70,stopLoss:2,takeProfit:5,trailingStop:1,maxHoldingHours:24,allowShort:false,autoTrade:true};
  const defaultAssets = {stocks:['AAPL','MSFT','NVDA','TSLA','SPY','QQQ'],crypto:['BTC-USD','ETH-USD','SOL-USD']};
  const views = {
    dashboard:['Dashboard','Your Qutara session, market connections, and virtual performance at a glance.'],
    qutara:['Qutara','One AI quantitative engine. Your markets. Your risk parameters.'],
    'virtual-trading':['Virtual Trading','Follow the virtual positions and completed trades from your Qutara session.'],
    'market-data':['Market Data','Real market feeds. Visible sources. Clear connection status.'],
    leaderboard:['Leaderboard','Compare session performance only where verified records are available.'],
    reports:['Reports','A transparent record of your Qutara session and virtual trading results.']
  };
  let state = null;
  let currentView = 'qutara';
  let dirty = false;
  let configLoaded = false;
  let displayedConfig = '';
  let busy = false;
  let stateLoading = false;
  let stateConnected = false;
  let stateReceivedAt = 0;
  let chartTimeframe = '5m';
  let chartMarket = null;
  let chartConnection = {status:'connecting',message:''};
  const marketCache = new Map();
  let chartRequest = 0;
  let chartLoading = false;
  let lastMarketFetch = 0;
  let lastMarketKey = '';
  let currentLedger = 'signals';
  let messageTimer;
  let selectedAssets = new Set(defaults.assets);

  const assetSymbol = asset => typeof asset === 'string' ? asset : asset.symbol;
  const assets = () => state?.assets || defaultAssets;
  const session = () => state?.session || null;
  const records = key => Array.isArray(session()?.[key]) ? session()[key] : [];
  const sorted = items => [...items].sort((a,b) => new Date(b.createdAt || b.closedAt || b.openedAt) - new Date(a.createdAt || a.closedAt || a.openedAt));
  const statusClass = value => /^(connected|online|ready|live|running)$/i.test(value || '') ? 'connected' : /error|offline|disconnected|unavailable|missing|not.configured/i.test(value || '') ? 'offline' : 'pending';
  const marketLabel = value => value || '—';
  const empty = (heading, detail) => `<div class="empty-state"><span class="empty-rule" aria-hidden="true"></span><h3>${escape(heading)}</h3><p>${escape(detail)}</p></div>`;
  const table = (headings, rows) => `<div class="table-scroll"><table><thead><tr>${headings.map(h => `<th scope="col">${escape(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
  const cell = (value, className = '') => `<td${className ? ` class="${className}"` : ''}>${escape(value)}</td>`;
  const actionBadge = action => `<span class="action-badge ${escape(String(action || '').toLowerCase())}">${escape(action || 'HOLD')}</span>`;

  function message(text, isError = false) {
    const el = $('#app-message');
    el.textContent = text;
    el.classList.toggle('error', isError);
    el.hidden = false;
    clearTimeout(messageTimer);
    if (!isError) messageTimer = setTimeout(() => { el.hidden = true; }, 7000);
  }

  async function api(path, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);
    try {
      const response = await fetch(path, {cache:'no-store', ...options, headers:{'Content-Type':'application/json',...options.headers}, signal:controller.signal});
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || `Request failed (${response.status}).`);
      return body;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('The connection timed out. Please try again.');
      throw error;
    } finally { clearTimeout(timeout); }
  }

  function navigate(path, push = false) {
    const name = path.replace(/^\/+|\/+$/g,'') || 'dashboard';
    currentView = views[name] ? name : 'dashboard';
    if (push) history.pushState({},'',`/${currentView}`);
    $$('.view').forEach(el => { el.hidden = el.dataset.view !== currentView; });
    $$('.primary-nav a').forEach(el => el.pathname === `/${currentView}` ? el.setAttribute('aria-current','page') : el.removeAttribute('aria-current'));
    $('#page-title').textContent = views[currentView][0];
    $('#page-description').textContent = views[currentView][1];
    document.title = `${views[currentView][0]} | Qutaris`;
    if (currentView === 'qutara') loadMarket();
    if (push) window.scrollTo({top:0,behavior:'instant'});
  }

  function renderAssets() {
    const market = $('#market').value;
    const available = market === 'Stocks + Crypto' ? [...assets().stocks,...assets().crypto] : market === 'U.S. Stocks' ? assets().stocks : assets().crypto;
    $('#asset-options').innerHTML = available.map(asset => {
      const symbol = assetSymbol(asset);
      return `<label class="asset-option"><input type="checkbox" name="assets" value="${escape(symbol)}" ${selectedAssets.has(symbol) ? 'checked' : ''}><span>${escape(symbol)}</span></label>`;
    }).join('');
  }

  function fillConfig(config) {
    Object.entries({...defaults,...config}).forEach(([key,value]) => {
      if (key === 'assets') return;
      const field = $(`#${key}`);
      if (!field) return;
      if (field.type === 'checkbox') field.checked = !!value;
      else field.value = value;
    });
    selectedAssets = new Set(config.assets || defaults.assets);
    renderAssets();
    dirty = false;
    displayedConfig = JSON.stringify(config);
    $('#save-config').textContent = 'Parameters saved';
  }

  function readConfig() {
    const config = {};
    Object.keys(defaults).forEach(key => {
      if (key === 'assets') config.assets = $$('input[name=assets]:checked').map(input => input.value);
      else {
        const field = $(`#${key}`);
        config[key] = field.type === 'checkbox' ? field.checked : field.type === 'number' ? Number(field.value) : field.value;
      }
    });
    if (!config.assets.length) throw new Error('Select at least one asset for Qutara to analyze.');
    return config;
  }

  function updateControls() {
    const status = session()?.status || 'idle';
    const locked = status === 'running' || status === 'paused';
    const positionsRetained = records('positions').length > 0;
    $('#config-fields').disabled = busy || locked || positionsRetained;
    $('#initialBalance').disabled = !!session()?.startedAt;
    $('#initialBalance').title = session()?.startedAt ? 'Initial virtual balance is fixed after this session first starts.' : '';
    $('#save-config').disabled = busy || locked || positionsRetained || !stateConnected;
    $('#start-engine').disabled = busy || locked || !stateConnected;
    $('#pause-engine').disabled = busy || !locked || !stateConnected;
    $('#pause-engine').textContent = status === 'paused' ? 'Resume Qutara' : 'Pause Qutara';
    $('#stop-engine').disabled = busy || !locked || !stateConnected;
    $('#download-report').disabled = !session();
    $('#control-note').textContent = !stateConnected ? 'Session connection required. Retrying automatically.' : positionsRetained ? 'Parameters stay locked while virtual positions are open.' : locked ? 'Stop Qutara to change the session parameters.' : 'Parameters are locked while Qutara is running or paused.';
  }

  function acceptState(result) {
    state = result;
    stateConnected = true;
    stateReceivedAt = Date.now();
    if (!configLoaded && session()?.config) {
      fillConfig(session().config);
      configLoaded = true;
      chartTimeframe = session().config.timeframe || '5m';
      $('#chart-asset').value = session().config.assets?.[0] || 'BTC-USD';
      updateTimeframeButtons();
    } else if (!dirty && session()?.config && displayedConfig !== JSON.stringify(session().config)) {
      fillConfig(session().config);
    }
    render();
  }

  async function pollState() {
    if (stateLoading || document.hidden) return;
    stateLoading = true;
    try { acceptState(await api('/api/qutara/state')); }
    catch (error) {
      stateConnected = false;
      $('#header-status').textContent = 'Connection unavailable';
      $('#header-status-dot').className = 'status-dot offline';
      $('#metrics-dot').className = 'status-dot offline';
      $('#last-synced').textContent = stateReceivedAt ? `Connection lost · Last sync ${clockTime(stateReceivedAt)}` : 'Session connection unavailable';
      renderMetrics();
      updateControls();
      if (!state) {
        $('#dashboard-status').textContent = 'Disconnected';
        $('#dashboard-session-note').textContent = 'The session service is unavailable. Reconnecting automatically.';
      }
    } finally { stateLoading = false; }
  }

  async function saveConfig(showMessage = true) {
    if (!$('#config-form').reportValidity()) return false;
    const config = readConfig();
    acceptState(await api('/api/qutara/config', {method:'PUT',body:JSON.stringify(config)}));
    fillConfig(session().config);
    chartTimeframe = config.timeframe;
    $('#chart-asset').value = config.assets[0];
    updateTimeframeButtons();
    loadMarket(true);
    if (showMessage) message('Qutara parameters saved. Your virtual session is ready.');
    return true;
  }

  async function control(action) {
    if (busy) return;
    if (action === 'start' && dirty && !$('#config-form').reportValidity()) return;
    busy = true;
    updateControls();
    try {
      if (action === 'start' && dirty && !(await saveConfig(false))) return;
      acceptState(await api('/api/qutara/control', {method:'POST',body:JSON.stringify({action})}));
      message({start:'Qutara started. All resulting orders and positions are virtual.',pause:'Qutara paused. New analysis and virtual orders are paused.',resume:'Qutara resumed.',stop:'Qutara stopped. Session records remain available for review.'}[action]);
    } catch (error) { message(error.message,true); }
    finally { busy = false; updateControls(); }
  }

  function metricData() {
    const m = state?.metrics || {};
    const status = session()?.status;
    return [
      {label:'Qutara Status',value:stateConnected ? titleCase(status || 'idle') : 'Disconnected',status:true},
      {label:'Virtual Balance',value:money(m.virtualBalance)},
      {label:'Virtual Return',value:percent(m.virtualReturn),tone:tone(m.virtualReturn)},
      {label:'Open Positions',value:finite(m.openPositions) ? number(m.openPositions,0) : '—'},
      {label:'Completed Trades',value:finite(m.completedTrades) ? number(m.completedTrades,0) : '—'},
      {label:'Measured Accuracy',value:finite(m.measuredAccuracy) ? number(m.measuredAccuracy) + '%' : '—',note:finite(m.measuredAccuracy) ? 'Profitable / completed trades' : 'No completed trades',help:'Profitable completed virtual trades divided by all completed virtual trades. This is not AI predictive accuracy.'},
      {label:'Maximum Virtual Drawdown',value:finite(m.maximumVirtualDrawdown) ? number(m.maximumVirtualDrawdown) + '%' : '—',compact:true},
      {label:'Current Risk Level',value:m.currentRiskLevel || session()?.config?.riskLevel || '—',compact:true},
      {label:'Remaining Trial Time',value:duration(m.remainingTrialMs),compact:true,id:'remaining-trial'},
      {label:'Qutara Runtime',value:duration(m.runtimeMs),compact:true,id:'qutara-runtime'}
    ];
  }

  function renderMetrics() {
    const data = metricData();
    $('#session-metrics').innerHTML = data.map(m => `<div class="metric-row${m.compact ? ' compact' : ''}"${m.help ? ` title="${escape(m.help)}"` : ''}><dt>${escape(m.label)}</dt><dd${m.id ? ` id="${m.id}"` : ''} class="${m.status ? 'status-value' : ''} ${m.tone || ''}">${m.status ? `<span class="status-dot ${stateConnected ? escape(session()?.status || 'idle') : 'offline'}"></span>` : ''}${escape(m.value)}</dd>${m.note ? `<span class="metric-note">${escape(m.note)}</span>` : ''}</div>`).join('');
    const groups = [
      ['#dashboard-metrics',[data[1],data[2],data[3],data[5]]],
      ['#trading-metrics',[data[1],data[2],data[3],data[4]]],
      ['#report-metrics',[data[2],data[5],data[4],data[6]]]
    ];
    groups.forEach(([selector,metrics]) => { $(selector).innerHTML = metrics.map(m => `<div class="summary-item"><span>${escape(m.label)}</span><strong class="${m.tone || ''}">${escape(m.value)}</strong><small>${escape(m.note || 'Current virtual session')}</small></div>`).join(''); });
  }

  function connectionItems() {
    return [['crypto','Cryptocurrency feed'],['stocks','U.S. stock feed'],['ai','Qutara AI connection']].map(([key,label]) => ({key,label,...(state?.connections?.[key] || {status:'connecting',message:'Waiting for connection status.'})}));
  }

  function renderConnections() {
    const items = connectionItems();
    const markup = items.map(c => `<div class="connection-row"><h3>${escape(c.label)}</h3><span class="connection-state"><span class="status-dot ${statusClass(c.status)}"></span>${escape(titleCase(c.status))}</span><p>${escape(c.message || 'No additional connection details.')}</p></div>`).join('');
    html($('#dashboard-connections'),markup);
    html($('#market-connections'),markup);
    $('#connection-summary').innerHTML = items.map(c => `<div class="mini-connection"><span>${escape({crypto:'Crypto',stocks:'Stocks',ai:'Qutara AI'}[c.key])}</span><span title="${escape(c.message)}"><span class="status-dot ${statusClass(c.status)}"></span>${escape(titleCase(c.status))}</span></div>`).join('');
  }

  function positionsTable() {
    const positions = records('positions');
    if (!positions.length) return empty('No open virtual positions','Positions appear after Qutara opens a virtual trade. Your virtual capital remains available until then.');
    return table(['Asset','Side','Quantity','Entry price','Current price','Virtual P&L'],positions.map(p => `<tr>${cell(p.symbol,'symbol')}<td>${actionBadge(titleCase(p.side))}</td>${cell(number(p.quantity,6),'mono')}${cell(money(p.entryPrice),'mono')}${cell(money(p.currentPrice),'mono')}${cell(money(p.pnl),`mono ${tone(p.pnl)}`)}</tr>`));
  }

  function tradesTable() {
    const trades = sorted(records('trades'));
    if (!trades.length) return empty('No completed virtual trades','A completed trade is a closed virtual position. Its realized result will appear here with entry and exit prices.');
    return table(['Closed at','Asset','Side','Quantity','Entry','Exit','Virtual P&L'],trades.map(t => `<tr>${cell(timestamp(t.closedAt),'timestamp')}${cell(t.symbol,'symbol')}${cell(titleCase(t.side))}${cell(number(t.quantity,6),'mono')}${cell(money(t.entryPrice),'mono')}${cell(money(t.exitPrice),'mono')}${cell(money(t.pnl),`mono ${tone(t.pnl)}`)}</tr>`));
  }

  function renderJudgment() {
    let decision = session()?.latestJudgment;
    if (typeof decision === 'string') {
      const latestDecision = sorted(records('decisions'))[0];
      decision = latestDecision?.reason && decision.includes(latestDecision.reason) ? latestDecision : {reason:decision};
    }
    if (!decision || typeof decision !== 'object') decision = sorted(records('decisions'))[0];
    if (!decision) {
      $('#judgment-time').textContent = 'No decision yet';
      $('#latest-judgment').innerHTML = '<div class="judgment-idle" aria-hidden="true">Q</div><div><h3>Ready when you are</h3><p>Choose your markets and risk parameters, then start Qutara. Every decision will include its reasoning.</p></div>';
      return;
    }
    $('#judgment-time').textContent = decision.createdAt ? timestamp(decision.createdAt) : 'Session update';
    $('#latest-judgment').innerHTML = `${decision.action ? `<div>${actionBadge(decision.action)}</div>` : '<div class="judgment-idle" aria-hidden="true">Q</div>'}<div><h3>${decision.action ? `${escape(decision.symbol || 'Qutara')} · ${escape(titleCase(decision.action))}` : 'Qutara update'}</h3><p>${escape(decision.reason || 'No decision reason was returned.')}</p>${decision.action ? `<div class="judgment-meta"><span>AI confidence ${finite(decision.confidence) ? number(decision.confidence,0) + '%' : 'unavailable'}</span><span>Virtual session</span></div>` : ''}</div>`;
  }

  function ledgerRecords() {
    if (currentLedger === 'fills') return records('orders').filter(o => o.status === 'filled');
    return records(currentLedger);
  }

  function renderLedger() {
    ['signals','orders','fills','decisions','rejections'].forEach(key => { $(`[data-count="${key}"]`).textContent = key === 'fills' ? records('orders').filter(o=>o.status === 'filled').length : records(key).length; });
    const items = sorted(ledgerRecords());
    const messages = {
      signals:['No Qutara signals yet','Start Qutara to analyze your selected assets. BUY, SELL, and HOLD signals appear here with confidence and reasoning.'],
      orders:['No virtual orders yet','When auto-execution is enabled, signals that pass risk controls can create virtual orders.'],
      fills:['No virtual fills yet','Filled virtual orders appear here with their actual session quantity, reference price, and timestamp.'],
      decisions:['No AI decisions yet','Qutara will record why it chose to buy, sell, or hold. A connected AI service is required.'],
      rejections:['No risk rejections yet','Signals blocked by your exposure, confidence, or other risk rules will appear here with a reason.']
    };
    if (!items.length) { html($('#activity-panel'),empty(...messages[currentLedger])); return; }
    let markup;
    if (currentLedger === 'signals' || currentLedger === 'decisions') markup = table(['Timestamp','Asset','Action','AI confidence','Decision reason'],items.map(d => `<tr>${cell(timestamp(d.createdAt),'timestamp')}${cell(d.symbol,'symbol')}<td>${actionBadge(d.action)}</td>${cell(finite(d.confidence) ? number(d.confidence,0)+'%' : '—','mono')}${cell(d.reason,'reason')}</tr>`));
    else if (currentLedger === 'rejections') markup = table(['Timestamp','Asset','Risk rejection reason'],items.map(d => `<tr>${cell(timestamp(d.createdAt),'timestamp')}${cell(d.symbol,'symbol')}${cell(d.reason,'reason')}</tr>`));
    else markup = table(['Timestamp','Asset','Side','Virtual quantity','Virtual fill price','Status'],items.map(o => `<tr>${cell(timestamp(o.createdAt),'timestamp')}${cell(o.symbol,'symbol')}<td>${actionBadge(o.side)}</td>${cell(number(o.quantity,6),'mono')}${cell(money(o.price),'mono')}${cell(titleCase(o.status))}</tr>`));
    html($('#activity-panel'),markup);
  }

  function renderOtherViews() {
    const s = session();
    const m = state?.metrics || {};
    $('#dashboard-status').textContent = stateConnected ? titleCase(s?.status || 'idle') : 'Disconnected';
    $('#dashboard-session-note').textContent = s?.startedAt ? `Session started ${timestamp(s.startedAt)}. Review the console to follow Qutara's decisions.` : 'Configure your markets and start Qutara to begin a virtual session.';
    const activity = sorted([...records('decisions'),...records('rejections').map(r=>({...r,action:'BLOCKED'}))]).slice(0,5);
    $('#dashboard-activity').innerHTML = activity.length ? activity.map(a=>`<div class="activity-row">${actionBadge(a.action)}<div><h3>${escape(a.symbol || 'Qutara')}</h3><p>${escape(a.reason || 'Virtual session activity')}</p></div><time>${escape(clockTime(a.createdAt))}</time></div>`).join('') : empty('Your session activity starts here','Qutara decisions and risk rejections will appear after analysis begins.');
    const positions = positionsTable();
    html($('#console-positions'),positions);
    html($('#trading-positions'),positions);
    $('#position-count').textContent = `${records('positions').length} open`;
    $('#completed-count').textContent = `${records('trades').length} completed`;
    const trades = tradesTable();
    html($('#completed-trades'),trades);
    html($('#report-trades'),trades);
    const allAssets = [...assets().stocks.map(a=>({symbol:assetSymbol(a),kind:'U.S. Stocks'})),...assets().crypto.map(a=>({symbol:assetSymbol(a),kind:'Cryptocurrency'}))];
    html($('#market-table'),table(['Asset','Market','Last received price','Source','Market timestamp',''],allAssets.map(a=> {
      const savedMarket = s?.market?.[a.symbol];
      const cachedMarket = marketCache.get(a.symbol);
      const market = !savedMarket || Number(cachedMarket?.asOf) > Number(savedMarket.asOf) ? cachedMarket : savedMarket;
      const stale = market?.asOf && Date.now()-Number(market.asOf)>120000;
      return `<tr>${cell(a.symbol,'symbol')}${cell(a.kind)}${cell(money(market?.price),'mono')}${cell(market?.source || 'Awaiting data')}<td class="timestamp">${escape(timestamp(market?.asOf))}${stale ? '<small>Stale · Last received price</small>' : ''}</td><td><button type="button" class="text-button" data-open-market="${escape(a.symbol)}">Open chart ↗</button></td></tr>`;
    })));
    const details = [['Session ID',s?.id || '—'],['Session status',s ? titleCase(s.status) : 'Disconnected'],['Markets',marketLabel(s?.config?.market)],['Assets',s?.config?.assets?.join(', ') || '—'],['Timeframe',s?.config?.timeframe || '—'],['Risk level',s?.config?.riskLevel || '—'],['Created',timestamp(s?.createdAt)],['Started',timestamp(s?.startedAt)],['Initial virtual balance',money(s?.config?.initialBalance)],['Virtual cash',money(s?.virtualCash)]];
    $('#report-details').innerHTML = details.map(([label,value])=>`<div class="detail-row"><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`).join('');
    $('#leaderboard-table').innerHTML = s ? table(['Session','Status','Virtual return','Completed trades','Measured accuracy'],[`<tr>${cell('Your current Qutara session','symbol')}${cell(titleCase(s.status))}${cell(percent(m.virtualReturn),`mono ${tone(m.virtualReturn)}`)}${cell(number(m.completedTrades,0),'mono')}${cell(finite(m.measuredAccuracy) ? number(m.measuredAccuracy)+'%' : 'Unavailable','mono')}</tr>`]) : empty('No session connected','Connect to the session service to see your own virtual session metrics.');
  }

  function render() {
    const s = session();
    $('#header-status').textContent = stateConnected ? `Qutara ${s?.status || 'idle'}` : 'Disconnected';
    $('#header-status-dot').className = `status-dot ${stateConnected ? s?.status || '' : 'offline'}`;
    $('#metrics-dot').className = `status-dot ${stateConnected ? 'connected' : 'offline'}`;
    $('#session-id').textContent = s?.id ? `SESSION ${s.id.slice(-8)}` : 'SESSION —';
    $('#last-synced').textContent = stateReceivedAt ? `Last sync ${clockTime(stateReceivedAt)}` : 'Connecting to session';
    renderMetrics();
    renderConnections();
    renderJudgment();
    renderLedger();
    renderOtherViews();
    updateControls();
    const liveMarket = s?.market?.[$('#chart-asset').value];
    if (liveMarket && chartTimeframe === s.config.timeframe && (!chartMarket || Number(liveMarket.asOf) > Number(chartMarket.asOf))) {
      chartMarket = liveMarket;
      marketCache.set(liveMarket.symbol,liveMarket);
      chartConnection = {status:'connected',message:''};
      renderChart();
    } else if (chartMarket) {
      renderChartStatus();
    }
  }

  function updateTimeframeButtons() {
    $$('[data-timeframe]').forEach(b=> { const active = b.dataset.timeframe === chartTimeframe; b.classList.toggle('active',active); b.setAttribute('aria-pressed',String(active)); });
  }

  async function loadMarket(force = false) {
    if (currentView !== 'qutara' || document.hidden) return;
    const symbol = $('#chart-asset').value;
    const key = `${symbol}:${chartTimeframe}`;
    if (chartLoading && key === lastMarketKey) return;
    if (!force && key === lastMarketKey && Date.now() - lastMarketFetch < 25000) return;
    const id = ++chartRequest;
    if (key !== lastMarketKey) {
      chartMarket = null;
      chartConnection = {status:'connecting',message:''};
      renderChart();
    }
    chartLoading = true;
    chartConnection = {status:'loading',message:''};
    lastMarketKey = key;
    lastMarketFetch = Date.now();
    $('#chart-source').innerHTML = '<span class="status-dot pending"></span>Requesting market data';
    $('#retry-market').disabled = true;
    try {
      const market = await api(`/api/qutara/market?symbol=${encodeURIComponent(symbol)}&timeframe=${encodeURIComponent(chartTimeframe)}`);
      if (id !== chartRequest) return;
      chartMarket = market;
      chartConnection = {status:'connected',message:'',receivedAt:Date.now()};
      marketCache.set(symbol,market);
      renderChart();
      renderOtherViews();
    } catch (error) {
      if (id !== chartRequest) return;
      chartConnection = {status:'unavailable',message:error.message};
      if (!chartMarket?.candles?.length) {
        $('#chart-empty').hidden = false;
        $('#chart-empty-message').textContent = error.message;
      }
      renderChartStatus();
    } finally {
      if (id === chartRequest) { chartLoading = false; $('#retry-market').disabled = false; }
    }
  }

  function renderChartStatus() {
    const market = chartMarket;
    const kind = $('#chart-asset').value.includes('-') ? 'crypto' : 'stocks';
    const providerStatus = state?.connections?.[kind]?.status;
    const stale = market?.asOf && Date.now()-Number(market.asOf)>120000;
    let label, status;
    if (chartConnection.status === 'loading') { label='Requesting market data';status='pending'; }
    else if (chartConnection.status === 'unavailable' || /^(unavailable|disconnected|offline|error)$/.test(providerStatus || '')) {
      label=market?.candles?.length ? 'Feed unavailable · Last received data' : 'Market connection unavailable';status='offline';
    } else if (stale) { label=`Stale data · ${market.source || 'Market provider'}`;status='pending'; }
    else if (market?.candles?.length) { label=`${market.source || 'Market data provider'} · ${chartTimeframe}`;status='connected'; }
    else {label='Awaiting market data';status='pending';}
    $('#chart-source').innerHTML=`<span class="status-dot ${status}"></span>${escape(label)}`;
    $('#chart-source').title=chartConnection.message || (market?.asOf ? `Source timestamp: ${timestamp(market.asOf)}` : '');
  }

  function renderChart() {
    const market = chartMarket;
    const svg = $('#market-chart');
    const raw = Array.isArray(market?.candles) ? market.candles.filter(c=>[c.open,c.high,c.low,c.close].every(finite)).sort((a,b)=>Number(a.time)-Number(b.time)) : [];
    const width = Math.max(340,Math.floor($('#chart-container').clientWidth));
    const height = Math.max(300,Math.floor($('#chart-container').clientHeight));
    const left = 14, right = 76, top = 25, plotBottom = height-111, volumeTop = height-86, volumeBottom = height-43;
    const candles = raw.slice(-Math.min(80,Math.max(24,Math.floor((width-left-right)/8))));
    const plotWidth = width - left - right;
    svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
    const lines = Array.from({length:6},(_,i) => `<line x1="${left}" y1="${top + i*(plotBottom-top)/5}" x2="${width-right}" y2="${top + i*(plotBottom-top)/5}" stroke="#eff1f4" stroke-width="1"/>`).join('');
    if (!candles.length) {
      svg.innerHTML = lines;
      svg.setAttribute('aria-label','No verified market candles available for the selected asset.');
      $('#chart-empty').hidden = false;
      $('#chart-empty-message').textContent = 'Connecting to the selected market. Verified price candles will appear here when available.';
      $('#chart-price').textContent = '—';
      $('#chart-change').textContent = 'Awaiting market data';
      $('#chart-change').className = '';
      $('#chart-updated').textContent = 'No market timestamp';
      renderChartStatus();
      return;
    }
    $('#chart-empty').hidden = true;
    const low = Math.min(...candles.map(c=>Number(c.low))), high = Math.max(...candles.map(c=>Number(c.high)));
    const padding = (high-low || high*0.01 || 1)*0.14;
    const min = low-padding, max = high+padding;
    const y = p => top + (max-Number(p))/(max-min)*(plotBottom-top);
    const step = plotWidth/candles.length;
    const x = index => left+step*(index+.5);
    const candleWidth = Math.max(2,Math.min(10,step*.65));
    const maxVolume = Math.max(1,...candles.map(c=>Number(c.volume) || 0));
    const priceDigits = high < 10 ? 4 : 2;
    const labels = Array.from({length:6},(_,i)=> `<text x="${width-right+8}" y="${top+i*(plotBottom-top)/5+4}" fill="#838c98" font-family="Consolas,monospace" font-size="11">${escape(number(max-i*(max-min)/5,priceDigits))}</text>`).join('');
    const bars = candles.map((c,i)=> {
      const up = Number(c.close)>=Number(c.open), color = up ? '#37846e' : '#d26868';
      const volumeHeight = (Number(c.volume)||0)/maxVolume*(volumeBottom-volumeTop);
      return `<g><title>${escape(timestamp(c.time))} · O ${escape(number(c.open,priceDigits))} · H ${escape(number(c.high,priceDigits))} · L ${escape(number(c.low,priceDigits))} · C ${escape(number(c.close,priceDigits))} · Vol ${escape(number(c.volume,0))}</title><line x1="${x(i)}" y1="${y(c.high)}" x2="${x(i)}" y2="${y(c.low)}" stroke="${color}" stroke-width="1.2"/><rect x="${x(i)-candleWidth/2}" y="${Math.min(y(c.open),y(c.close))}" width="${candleWidth}" height="${Math.max(1,Math.abs(y(c.open)-y(c.close)))}" fill="${color}"/><rect x="${x(i)-candleWidth/2}" y="${volumeBottom-volumeHeight}" width="${candleWidth}" height="${volumeHeight}" fill="${color}" opacity=".22"/></g>`;
    }).join('');
    function movingAverage(period,color) {
      const offset = raw.length-candles.length;
      const points = [];
      candles.forEach((_,i)=> {const index = offset+i;if (index>=period-1) {const avg=raw.slice(index-period+1,index+1).reduce((sum,c)=>sum+Number(c.close),0)/period; points.push(`${x(i)},${y(avg)}`);}});
      return points.length ? `<polyline points="${points.join(' ')}" fill="none" stroke="${color}" stroke-width="1.5" clip-path="url(#plot-clip)"/>` : '';
    }
    const dateTicks = [...new Set(width<600 ? [0,Math.floor(candles.length*.5),candles.length-1] : [0,Math.floor(candles.length*.25),Math.floor(candles.length*.5),Math.floor(candles.length*.75),candles.length-1])].map(i=> {
      const date=new Date(Number(candles[i].time));
      const label=chartTimeframe==='1d' ? date.toLocaleDateString('en-US',{month:'short',day:'numeric'}) : date.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',hour12:false});
      return `<text x="${x(i)}" y="${height-15}" fill="#838c98" font-family="Consolas,monospace" font-size="11" text-anchor="${i===0?'start':i===candles.length-1?'end':'middle'}">${escape(label)}</text>`;
    }).join('');
    const orders = records('orders').filter(o=>o.symbol===market.symbol && new Date(o.createdAt).getTime()>=Number(candles[0].time) && new Date(o.createdAt).getTime()<=Number(candles.at(-1).time)+timeframeMs(chartTimeframe));
    const markers = orders.map(o=> {
      let nearest=0;const time=new Date(o.createdAt).getTime();candles.forEach((c,i)=> {if(Math.abs(Number(c.time)-time)<Math.abs(Number(candles[nearest].time)-time))nearest=i;});
      const buy=o.side==='BUY';const cy=buy?Math.min(plotBottom-11,y(candles[nearest].low)+17):Math.max(top+11,y(candles[nearest].high)-17);const cx=x(nearest);const color=buy?'#237a5e':'#c44646';
      return `<g><title>Qutara virtual ${escape(o.side)} · ${escape(number(o.quantity,6))} ${escape(o.symbol)} at ${escape(money(o.price))}</title><path d="${buy?`M${cx} ${cy-5}l-5 8h10Z`:`M${cx} ${cy+5}l-5-8h10Z`}" fill="${color}"/><text x="${cx}" y="${buy?cy+15:cy-10}" font-family="Consolas,monospace" font-size="10" text-anchor="middle" fill="${color}">${escape(o.side)}</text></g>`;
    }).join('');
    const last=candles.at(-1),lastPrice=finite(market.price)?Number(market.price):Number(last.close),lineY=y(lastPrice);
    const priceLine=lineY>=top&&lineY<=plotBottom?`<line x1="${left}" x2="${width-right}" y1="${lineY}" y2="${lineY}" stroke="#8996a6" stroke-dasharray="3 4" opacity=".4"/>`:'';
    svg.innerHTML=`<defs><clipPath id="plot-clip"><rect x="${left}" y="${top}" width="${plotWidth}" height="${plotBottom-top}"/></clipPath></defs>${lines}${labels}${priceLine}${bars}${movingAverage(20,'#687d9d')}${movingAverage(50,'#cfa15b')}${markers}<line x1="${left}" x2="${width-right}" y1="${volumeTop-12}" y2="${volumeTop-12}" stroke="#f0f2f4"/><text x="${width-right+8}" y="${volumeTop+5}" fill="#8b949f" font-family="Consolas,monospace" font-size="11">VOLUME</text>${dateTicks}`;
    svg.setAttribute('aria-label',`${market.symbol} ${chartTimeframe} candlestick chart, ${candles.length} real market candles, latest price ${money(lastPrice)}. SMA 20 and SMA 50 overlays, volume, and Qutara virtual order markers where available.`);
    $('#chart-price').textContent=money(lastPrice);
    const change=(lastPrice-Number(candles[0].open))/Number(candles[0].open)*100;
    $('#chart-change').textContent=`${percent(change)} · visible period`;
    $('#chart-change').className=tone(change);
    renderChartStatus();
    $('#chart-updated').textContent=`Market time ${timestamp(market.asOf || last.time)}`;
  }

  function timeframeMs(value) { return {'1m':60000,'5m':300000,'15m':900000,'1h':3600000,'1d':86400000}[value] || 300000; }

  async function downloadReport() {
    if (!session()) return;
    const button=$('#download-report');button.disabled=true;
    try {
      const response=await fetch('/api/qutara/report',{cache:'no-store'});
      if(!response.ok){const error=await response.json().catch(()=>({}));throw new Error(error.error || 'The session report could not be downloaded.');}
      const url=URL.createObjectURL(await response.blob());
      const link=document.createElement('a');link.href=url;link.download=`qutara-${String(session().id).replace(/[^a-z0-9-]/gi,'').slice(0,40)}-${new Date().toISOString().slice(0,10)}.csv`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
      message('Your full persisted Qutara virtual trade report has been downloaded.');
    } catch(error){message(error.message,true);}finally{button.disabled=!session();}
  }

  document.addEventListener('click',event=> {
    const route=event.target.closest('a[data-route]');
    if(route && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.button===0){event.preventDefault();navigate(route.pathname,true);return;}
    const market=event.target.closest('[data-open-market]');
    if(market){$('#chart-asset').value=market.dataset.openMarket;chartMarket=null;lastMarketKey='';navigate('/qutara',true);}
  });
  window.addEventListener('popstate',()=>navigate(location.pathname));
  $('#config-form').addEventListener('input',()=> {dirty=true;$('#save-config').textContent='Save parameters';});
  $('#market').addEventListener('change',()=> {selectedAssets=new Set($$('input[name=assets]:checked').map(input=>input.value));renderAssets();});
  $('#asset-options').addEventListener('change',()=> {selectedAssets=new Set($$('input[name=assets]:checked').map(input=>input.value));});
  $('#config-form').addEventListener('submit',async event=> {
    event.preventDefault();if(busy || !$('#config-form').reportValidity())return;busy=true;updateControls();
    try{await saveConfig();}catch(error){message(error.message,true);}finally{busy=false;updateControls();}
  });
  $('#start-engine').addEventListener('click',()=>control('start'));
  $('#pause-engine').addEventListener('click',()=>control(session()?.status==='paused'?'resume':'pause'));
  $('#stop-engine').addEventListener('click',()=>control('stop'));
  $('#chart-asset').addEventListener('change',()=>loadMarket(true));
  $$('[data-timeframe]').forEach(button=>button.addEventListener('click',()=> {chartTimeframe=button.dataset.timeframe;updateTimeframeButtons();loadMarket(true);}));
  $('#retry-market').addEventListener('click',()=>loadMarket(true));
  const ledgerTabs=$$('[data-ledger]');
  function selectLedger(button,focus=false){currentLedger=button.dataset.ledger;ledgerTabs.forEach(b=>{const active=b===button;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});$('#activity-panel').setAttribute('aria-labelledby',button.id);renderLedger();if(focus)button.focus();}
  ledgerTabs.forEach((button,index)=> {
    button.addEventListener('click',()=>selectLedger(button));
    button.addEventListener('keydown',event=> {let target;if(event.key==='ArrowRight')target=(index+1)%ledgerTabs.length;else if(event.key==='ArrowLeft')target=(index-1+ledgerTabs.length)%ledgerTabs.length;else if(event.key==='Home')target=0;else if(event.key==='End')target=ledgerTabs.length-1;if(target!==undefined){event.preventDefault();selectLedger(ledgerTabs[target],true);}});
  });
  try{$('#leaderboard-opt-in').checked=localStorage.getItem('qutara.localComparison')==='true';}catch{}
  $('#local-leaderboard').hidden=!$('#leaderboard-opt-in').checked;
  $('#leaderboard-opt-in').addEventListener('change',event=>{$('#local-leaderboard').hidden=!event.target.checked;try{localStorage.setItem('qutara.localComparison',String(event.target.checked));}catch{}});
  $('#download-report').addEventListener('click',downloadReport);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){pollState();loadMarket();}});
  const chartResizeObserver = new ResizeObserver(()=>{if(currentView==='qutara')renderChart();});
  chartResizeObserver.observe($('#chart-container'));
  setInterval(pollState,3000);
  setInterval(()=>loadMarket(),25000);
  setInterval(()=> {
    if(!stateConnected || !state?.metrics || document.hidden)return;
    const elapsed=Date.now()-stateReceivedAt;
    const running=session()?.status==='running';
    const remaining=$('#remaining-trial'),runtime=$('#qutara-runtime');
    if(remaining)remaining.textContent=duration(state.metrics.remainingTrialMs===null?null:Math.max(0,Number(state.metrics.remainingTrialMs)-(session()?.trialEndsAt?elapsed:0)));
    if(runtime)runtime.textContent=duration(Number(state.metrics.runtimeMs)+(running?elapsed:0));
  },1000);

  fillConfig(defaults);
  render();
  renderChart();
  navigate(location.pathname);
  pollState().then(()=>loadMarket());
})();
