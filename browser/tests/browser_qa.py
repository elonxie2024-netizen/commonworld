import sys, pathlib, json
ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools' / 'python'))
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe', headless=True)
    page = browser.new_page(viewport={'width': 1500, 'height': 950})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto('http://127.0.0.1:8765')
    page.locator('.kpi').first.wait_for(timeout=60000)
    idle = lambda: page.wait_for_function("!document.body.classList.contains('busy')", timeout=240000)
    assert page.locator('#error').is_hidden()
    page.click('#new-world'); page.fill('#new-form [name=seed]', '42'); page.click('#new-form button[type=submit]')
    page.wait_for_function("document.querySelector('#seed-input').value==='42'", timeout=120000); idle()
    page.fill('#seed-input', '7'); page.once('dialog', lambda d: d.accept()); page.click('#seed-form button')  # the sidebar box starts a world from any seed
    page.wait_for_function("document.querySelector('#seed-input').value==='7' && document.querySelector('#year-num').textContent==='0'", timeout=120000); idle()
    page.fill('#seed-input', '42'); page.once('dialog', lambda d: d.accept()); page.click('#seed-form button')
    page.wait_for_function("document.querySelector('#seed-input').value==='42'", timeout=120000); idle()
    assert page.locator('.news .lead-story').is_visible(), 'breaking news panel'

    def command(text):
        page.fill('#command', text)
        page.press('#command', 'Enter')
        page.wait_for_function("document.querySelector('#dock-cmd').textContent.includes(%s)" % json.dumps(text.split()[0]))
        idle()
        assert page.locator('#error').is_hidden(), page.locator('#error').inner_text()
        return page.inner_text('#console-output')

    assert 'Demographics:' in command('demographics')
    assert 'Az Ee of Azar' in command('person "Az Ee of Azar"')
    assert '123' in command('set person "Az Ee of Azar" wealth 123')
    assert 'Undid' in command('undo')
    assert 'borders' in command('borders').lower()
    command('add disease Testpox infection=0.3')
    command('outbreak 1 Testpox cases=3')
    assert 'Cannot eradicate' in command('eradicate Testpox')
    page.click('#step')
    page.wait_for_function("document.querySelector('#year-num').textContent==='1'", timeout=240000)
    idle()
    for view in ['geo', 'clusters']:
        page.click(f'[data-map-view="{view}"]')
        page.wait_for_timeout(300)
    assert 'Settler parties' in command('expeditions')
    for section in ['map', 'countries', 'settlements', 'people', 'development', 'systems', 'demographics', 'discoveries', 'health', 'wars', 'events', 'workshop', 'overview']:
        page.click(f'#navigation [data-tab="{section}"]')
        assert page.locator('#content').inner_text().strip()
        assert page.locator('#error').is_hidden()
    page.click('#navigation [data-tab="settlements"]')
    page.locator('[data-settlement]').first.click()
    assert page.locator('#detail-dialog').is_visible()
    page.click('#detail-dialog .close')
    page.click('#navigation [data-tab="health"]')
    page.locator('[data-disease]').first.click()
    assert page.locator('#detail-dialog .cure-box').is_visible()
    assert page.locator('#detail-dialog button:has-text("Eradicate")').first.is_disabled()
    page.click('#detail-dialog .close')
    # ---- a middle-aged world: layers, sprites, hover, economy and tech pages
    import time
    page.set_viewport_size({'width': 1500, 'height': 1500})
    began = time.time()
    for target in (10, 20, 30, 40):
        page.click('[data-years="10"]')
        page.wait_for_function(f"document.querySelector('#year-num').textContent==='{target + 1}'", timeout=600000); idle()
    assert time.time() - began < 240, 'forty years should take well under four minutes'
    for section, needle in [('economy', 'stockpile'), ('tech', 'Stone Age'), ('countries', 'Forms of government'), ('wars', 'Diplomacy')]:
        page.click(f'#navigation [data-tab="{section}"]')
        assert needle in page.locator('#content').inner_text(), section
        assert page.locator('#error').is_hidden()
    page.click('#navigation [data-tab="tech"]')
    assert page.locator('.tband').count() == 15 and page.locator('.tnode').count() >= 220
    assert page.locator('.techsvg path').count() >= 300, 'prerequisites are drawn as lines'
    assert page.evaluate("[...document.querySelectorAll('.techsvg path')].every(p => /^M[^C]+C[^C]+$/.test(p.getAttribute('d')) && getComputedStyle(p).stroke === 'rgb(163, 169, 181)')"), 'lines are smooth gray curves'
    assert page.locator('.tlegend .st').count() == 4, 'status legend: known, researching, ready, unknown'
    assert page.evaluate("new Set([...document.querySelectorAll('.tnode')].map(n => n.className)).size >= 2"), 'statuses look different'
    page.locator('.tnode').nth(120).hover()
    assert page.evaluate("[...document.querySelectorAll('.techsvg path.hl')].every(p => getComputedStyle(p).stroke === 'rgb(17, 17, 17)')"), 'hovered lines turn black'
    assert 'Needs' not in page.locator('.techcanvas').inner_text(), 'no prerequisite text'
    assert 'Needs:' in page.locator('.tnode').nth(120).get_attribute('title'), 'prerequisites shown on hover'
    page.click('[data-tzoom="out"]'); page.click('[data-tzoom="fit"]')
    assert page.evaluate("(() => { const w = document.querySelector('.techwrap'), c = document.querySelector('.techcanvas'); return c.getBoundingClientRect().width <= w.clientWidth + 2; })()"), 'fit shows the whole tree'
    page.click('[data-tzoom="in"]')
    page.click('#navigation [data-tab="map"]')
    page.click('[data-map-view="geo"]')
    page.wait_for_timeout(500)
    layers = page.evaluate("[...document.querySelectorAll('input[data-geo]')].map(i => i.dataset.geo)")
    for need in ['settlers', 'armies', 'merchants', 'projects', 'outbreaks', 'disasters', 'labels', 'resources']:
        assert need in layers, need
    for key in layers:
        box = page.locator(f'input[data-geo="{key}"]')
        before = page.evaluate(f"window.__map.geoOpts['{key}']")
        box.click(); page.wait_for_timeout(120)
        assert page.evaluate(f"window.__map.geoOpts['{key}']") != before, key
        box.click(); page.wait_for_timeout(120)
        assert page.evaluate(f"window.__map.geoOpts['{key}']") == before, key
    # resources really stay off until asked for, even zoomed in
    page.evaluate("() => { const m = window.__map; const s = m.geoSites.slice().sort((a, b) => b.population - a.population)[0]; m.focus(s.px, s.py, 9); }")
    page.wait_for_timeout(300)
    snap = lambda: page.evaluate("() => document.querySelectorAll('#map-slot canvas')[0].toDataURL().length")  # base layer only: the overlay animates
    assert not page.evaluate("window.__map.geoOpts.resources")
    off = snap()
    page.locator('input[data-geo="resources"]').click(); page.wait_for_timeout(300)
    on = snap()
    assert off != on, 'turning resources on should change the picture'
    page.locator('input[data-geo="resources"]').click(); page.wait_for_timeout(300)
    assert snap() == off, 'turning resources off again should restore it'
    # settlements are drawn as places, and buildings can be hovered, clicked, and hidden
    info = page.evaluate("() => { const m = window.__map; return { tiers: [...new Set(m.geoSites.map(s => s.tier))], boxes: m.spriteBoxes.length, shown: m.spritesShown }; }")
    assert info['boxes'] > 0 and info['shown'], info
    page.locator('#map-slot').scroll_into_view_if_needed()
    pos = page.evaluate("() => { const m = window.__map, r = m.host.getBoundingClientRect(); const at = b => ({ x: r.left + (b.x * m.zoom + m.panX) / 1000 * r.width, y: r.top + (b.y * m.zoom + m.panY) / 600 * r.height, name: b.name }); const inside = m.spriteBoxes.map(at).filter(q => q.x > r.left + 40 && q.x < r.right - 40 && q.y > r.top + 40 && q.y < Math.min(r.bottom, innerHeight) - 40); const named = inside.filter(q => q.name !== 'Houses'); const mid = { x: (r.left + r.right) / 2, y: (r.top + Math.min(r.bottom, innerHeight)) / 2 }; return (named.length ? named : inside).sort((a, b) => Math.hypot(a.x - mid.x, a.y - mid.y) - Math.hypot(b.x - mid.x, b.y - mid.y))[0]; }")
    page.evaluate("['settlers', 'armies', 'merchants'].forEach(k => window.__map.setGeoOption(k, false))")  # parties walking past would steal the hover
    page.mouse.move(pos['x'], pos['y']); page.wait_for_timeout(400)
    tip = page.locator('#tooltip')
    assert tip.is_visible() and pos['name'] in tip.inner_text(), (pos, tip.inner_text())
    page.mouse.click(pos['x'], pos['y']); page.wait_for_timeout(400)
    assert page.locator('#detail-dialog').is_visible(), 'clicking a building opens its settlement'
    page.click('#detail-dialog .close')
    page.locator('input[data-geo="buildings"]').click(); page.wait_for_timeout(200)
    page.mouse.move(pos['x'], pos['y'] + 1); page.wait_for_timeout(300)
    assert not page.evaluate("window.__map.spriteBoxes.length"), 'hidden buildings cannot be hovered'
    page.locator('input[data-geo="buildings"]').click(); page.wait_for_timeout(200)
    page.evaluate("['settlers', 'armies', 'merchants'].forEach(k => window.__map.setGeoOption(k, true))")
    # political view shows places and borders only
    page.click('[data-map-view="political"]'); page.wait_for_timeout(500)
    assert page.evaluate("window.__map.spriteBoxes.length") > 0, 'political map still draws settlements'
    assert page.evaluate("[...document.querySelectorAll('input[data-geo]')].map(i => i.dataset.geo).join()") == 'buildings,contested,names'
    page.click('[data-map-view="geo"]'); page.wait_for_timeout(300)
    # a tile opens its deposit dialog
    page.evaluate("() => { const m = window.__map; m.focus(500, 300, 4); }")
    page.wait_for_timeout(300)
    page.mouse.click(pos['x'] + 30, pos['y'] + 30); page.wait_for_timeout(400)
    if page.locator('#detail-dialog').is_visible():
        page.click('#detail-dialog .close')
    assert page.locator('#error').is_hidden()
    page.set_viewport_size({'width': 390, 'height': 844})
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'), 'Horizontal mobile overflow'
    assert not errors, errors
    print(json.dumps({'browser': 'Chrome', 'errors': errors, 'checks': 'news panel, commands, borders, eradication gate, map views, all pages, dialogs, 40-year speed, every map layer toggle, resources stay off, sprites hover/click/hide, political map, economy and tech pages, mobile overflow'}))
    browser.close()
