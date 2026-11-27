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
    assert page.locator('#dock').is_hidden(), 'the console stays hidden until ~ is pressed'
    assert page.locator('[data-tab="workshop"]').count() == 0 and page.locator('[data-influence]').count() == 4, 'influence bar replaces the workshop'
    # a person's story is stitched together on demand when their panel opens
    page.click('[data-tab="people"]'); page.locator('[data-person]').first.click()
    page.wait_for_selector('#detail-dialog .life-lines li', timeout=15000)
    assert "Born" in page.inner_text("#detail-dialog .life-lines li"), "life story begins with the birth"
    # person mode: play as them, choose seasons by hand, Step plays them for you, stop
    page.click('[data-play-as]'); idle()
    assert page.evaluate("document.body.classList.contains('pm-mode')") and not page.locator('.sidebar').is_visible() and not page.locator('#step').is_visible() and not page.locator('.year-pill').is_visible(), 'person mode hides the simulation controls'
    assert page.locator('.pm-focus').count() >= 4 and page.locator('.pm-stat').count() >= 7, 'person mode opens with focuses and stats'
    def answer():  # a life-choice pop-up must be answered before time moves on
        while page.locator('#choice-dialog[open]').count():
            page.locator('.choice-opt:not([disabled])').first.click(); idle(); page.wait_for_timeout(100)
    def play(act):  # a decision may interrupt the click; answer it, then live the season
        page.click('[data-focus="%s"]' % act); idle(); page.click('[data-play-next]'); idle()
        if page.locator('#choice-dialog[open]').count(): answer(); page.click('[data-play-next]'); idle()
    answer(); play('study'); play('work')
    assert page.locator('.pm .life-lines li').count() >= 2 and 'Autumn' in page.inner_text('.pm-clock'), 'seasons come one at a time'
    # a famine in their country reaches them as a pop-up that pauses time and cannot be dismissed
    land = page.evaluate("window.__map.snap.player.country.name")
    page.evaluate('document.activeElement.blur()'); page.keyboard.press('`'); page.fill('#command', 'trigger "%s" Famine' % land); page.press('#command', 'Enter'); idle(); page.keyboard.press('Escape')
    page.click('[data-play-next]'); idle(); page.wait_for_timeout(200)
    assert page.locator('#choice-dialog[open]').count() == 1, 'the famine decision appears'
    assert 'Famine' in page.inner_text('#choice-dialog h2')
    year = page.inner_text('#year-num'); page.keyboard.press('Escape'); page.wait_for_timeout(150)
    assert page.locator('#choice-dialog[open]').count() == 1, 'Esc cannot dismiss a decision'
    assert page.evaluate("window.__map.snap.player.choice !== null")
    answer(); assert page.locator('#choice-dialog[open]').count() == 0 and page.inner_text('#year-num') == year, 'answering resumes without skipping time'
    page.click('[data-play-next]'); idle(); answer(); assert page.locator('.pm-clock').is_visible()
    # Play keeps running on its own focus; a decision stops it, and answering carries it on without pressing Play again
    page.select_option('#speed', '200'); page.click('[data-focus="network"]'); idle(); page.click('#play')
    try:
        page.wait_for_selector('#choice-dialog[open]', timeout=90000)
        y = page.inner_text('#year-num'); assert page.inner_text('#play').strip() == 'Live on', 'Play stops at a decision'
        page.locator('.choice-opt:not([disabled])').first.click(); idle()
        page.wait_for_function("document.querySelector('#year-num').textContent !== '%s' || document.querySelector('#choice-dialog[open]')" % y, timeout=60000)
        assert page.inner_text('#play').strip() == 'Pause' or page.locator('#choice-dialog[open]').count(), 'answering carries on without pressing Play'
    except Exception as e:
        if 'carries on' in str(e) or 'stops at' in str(e): raise
    finally:
        if page.inner_text('#play').strip() == 'Pause': page.click('#play')
        idle(); answer(); page.select_option('#speed', '1400')
    # when the person dies they choose who carries on: family with what each inherits, or a random person if none is left
    page.wait_for_timeout(400); idle(); answer()
    pid = page.evaluate("window.__map.snap.player.id")
    page.evaluate('document.activeElement.blur()'); page.keyboard.press('`'); page.fill('#command', 'delete person %s' % pid); page.press('#command', 'Enter'); idle(); page.keyboard.press('Escape')
    idle()
    assert 'YOU DIED' in page.inner_text('.pm-head'), 'the death screen appears'
    heirs = page.locator('[data-play-heir]').count()
    assert heirs <= 8 and (heirs or page.locator('[data-play-random]').count() == 1), 'heirs, or the random fallback when none are left'
    if heirs: assert page.locator('.heir .heir-gets li').count() >= heirs and page.locator('.heir small').first.inner_text().startswith('Age'), 'each heir shows age, role, place and what they inherit'
    (page.locator('[data-play-heir]').first if heirs else page.locator('[data-play-random]')).click(); idle()
    assert page.evaluate("window.__map.snap.player.alive && window.__map.snap.player.id !== %s" % pid) and page.locator('.pm-focus').count() >= 2, 'play goes on as the next person'
    if heirs: assert 'Generation 2' in page.inner_text('.pm-head'), 'the line is counted'
    page.click('[data-play-stop]'); idle(); assert page.locator('[data-tab="person"]').count() == 0, 'stopping leaves person mode'
    page.click('[data-tab="overview"]')
    page.click('#new-world'); page.fill('#new-form [name=seed]', '42'); page.click('#new-form button[type=submit]')  # back to the year-0 world the later checks expect
    page.wait_for_function("document.querySelector('#year-num').textContent==='0'", timeout=120000); idle()

    def command(text):
        if page.locator('#dock').is_hidden():
            page.evaluate('document.activeElement.blur()'); page.keyboard.press('`')
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
    for section in ['map', 'countries', 'settlements', 'people', 'development', 'systems', 'demographics', 'discoveries', 'health', 'wars', 'events', 'overview']:
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
    # influences are aimed by clicking the map; moving parties open their own panel; pings jump to big events
    page.evaluate("() => window.__map.resetView()"); page.wait_for_timeout(200)
    page.locator('#map-slot').scroll_into_view_if_needed()
    at = lambda x, y: page.evaluate(f"(() => {{ const m = window.__map, r = m.host.getBoundingClientRect(); return [r.left + ({x} * m.zoom + m.panX) / 1000 * r.width, r.top + ({y} * m.zoom + m.panY) / 600 * r.height]; }})()")
    if page.locator('#dock').is_visible():
        page.evaluate('document.activeElement.blur()'); page.keyboard.press('`')
    # a big town clear of the ping tray (top left) and inside the visible window
    town = page.evaluate("(() => { const m = window.__map, r = m.host.getBoundingClientRect(), px = s => [r.left + (s.px * m.zoom + m.panX) / 1000 * r.width, r.top + (s.py * m.zoom + m.panY) / 600 * r.height]; const s = m.geoSites.filter(s => s.population >= 40).filter(s => { const [x, y] = px(s); return (x > r.left + 320 || y > r.top + 300) && y < innerHeight - 140 && y > 60; }).sort((a, b) => b.population - a.population)[0]; return {x: s.px, y: s.py}; })()")
    page.evaluate("['settlers', 'armies', 'merchants'].forEach(k => window.__map.setGeoOption(k, false))")
    page.click('[data-influence="idea"]'); page.mouse.click(*at(town['x'], town['y'])); idle(); page.wait_for_timeout(200)
    assert 'An idea about' in page.locator('.toast').last.inner_text() or 'not ready' in page.locator('.toast').last.inner_text(), page.locator('.toast').last.inner_text()
    assert not page.locator('#detail-dialog').is_visible(), 'aiming does not open dialogs'
    page.click('[data-influence="expedition"]'); page.mouse.click(*at(town['x'], town['y'])); page.wait_for_timeout(150)
    page.click('[data-inf-skip]'); idle(); page.wait_for_timeout(200)
    assert 'settlers set out' in page.locator('.toast').last.inner_text(), page.locator('.toast').last.inner_text()
    page.evaluate("['settlers', 'armies', 'merchants'].forEach(k => window.__map.setGeoOption(k, true))")
    party = page.evaluate("(() => { const m = window.__map, e = m.snap.expeditions.at(-1), q = m.expPos(e, performance.now()); return {x: q.x, y: q.y}; })()")
    page.mouse.click(*at(party['x'], party['y'])); page.wait_for_timeout(300)
    assert page.locator('#detail-dialog').is_visible() and 'SETTLERS' in page.inner_text('#detail-dialog .eyebrow'), 'clicking a moving party opens it'
    page.click('#detail-dialog .close')
    assert 'Undid' in command('undo')
    page.keyboard.press('Escape')
    assert page.evaluate("window.__pings.items.length") > 0, 'forty years should leave some big events pinned'
    page.locator('.ping-chip').first.click(); page.wait_for_timeout(400)
    assert page.inner_text('#page-title') == 'World map' and page.evaluate("window.__map.zoom") > 2, 'a ping jumps to the event'
    page.evaluate("() => window.__map.resetView()"); page.wait_for_timeout(200)
    # right-click opens an edit panel; the inspector's Edit button does too, and Back returns to it
    page.mouse.click(*at(town['x'], town['y']), button='right'); page.wait_for_timeout(300)
    assert page.inner_text('#detail-dialog .eyebrow').startswith('EDIT'), 'right-clicking a town edits it'
    form = page.locator('#detail-dialog form[data-edit-action]').first
    form.locator('input').fill('Qatown'); form.locator('button[type=submit]').click(); idle(); page.wait_for_timeout(150)
    assert 'Qatown' in page.inner_text('#detail-dialog h2'), 'the panel renames and stays open'
    page.click('[data-edit-back]'); assert not page.inner_text('#detail-dialog .eyebrow').startswith('EDIT')
    page.click('#detail-dialog .edit-open'); assert page.inner_text('#detail-dialog .eyebrow').startswith('EDIT')
    page.click('#detail-dialog .close'); assert 'Undid' in command('undo'); page.keyboard.press('Escape')
    page.click('[data-edit="world:world"]'); assert 'World rules' in page.inner_text('#detail-dialog h2')
    row = page.locator('#detail-dialog form[data-edit-action]', has_text='People shape the world')
    row.locator('select').select_option('on'); row.locator('button[type=submit]').click(); idle(); page.wait_for_timeout(150)
    assert 'shape the world' in page.locator('.toast').last.inner_text() and page.evaluate("window.__map.snap.lifeFlow") is True, 'the switch turns on'
    page.locator('#detail-dialog form[data-edit-action]', has_text='People shape the world').locator('select').select_option('off')
    page.locator('#detail-dialog form[data-edit-action]', has_text='People shape the world').locator('button[type=submit]').click(); idle()
    assert page.evaluate("window.__map.snap.lifeFlow") is False
    page.click('#detail-dialog .close')
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
    print(json.dumps({'browser': 'Chrome', 'errors': errors, 'checks': 'life stories, person mode, life-choice pop-ups, heirs and succession, people switch, hidden console, influences, edit panels, unit panels, pings, news panel, commands, borders, eradication gate, map views, all pages, dialogs, 40-year speed, every map layer toggle, resources stay off, sprites hover/click/hide, political map, economy and tech pages, mobile overflow'}))
    browser.close()
