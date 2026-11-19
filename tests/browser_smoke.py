from pathlib import Path
from playwright.sync_api import sync_playwright
root=str(Path(__file__).resolve().parent.parent)
try:
 with sync_playwright() as playwright:
  browser=playwright.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1440,'height':1000},device_scale_factor=1)
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(open(root+'/index.html').read().replace('<link rel="stylesheet" href="/styles.css"/>','<style>'+open(root+'/styles.css').read()+'</style>').replace('<script src="/models.js"></script>', '<script>'+open(root+'/models.js').read()+'</script>').replace('<script src="/app.js"></script>', '<script>'+open(root+'/app.js').read()+'</script>'), wait_until='domcontentloaded')
  page.wait_for_timeout(400)
  print('title:',page.title(),'models:',page.locator('#countModels').inner_text(),'categories:',page.locator('#countCategories').inner_text())
  print('initial badge:',page.locator('#runBadge').inner_text())
  page.locator('#validateButton').click()
  print('validation:',page.locator('#validationScore').inner_text())
  print('validation issues:',page.locator('#validationOutput').inner_text()[:1600])
  methods=page.locator('#methodGrid .method')
  print('methods:',methods.count())
  for method in ['ODE / RK4','Monte Carlo','Lorenz attractor','Epidemic SIR','Quantum wave packet','Fourier spectrum','Root finder','Optimization']:
   page.get_by_role('button',name=method,exact=True).click()
   page.locator('#runButton').click()
   print(method,':',page.locator('#runBadge').inner_text(), 'error=',page.locator('#errorBox').inner_text() if page.locator('#errorBox').is_visible() else 'none')
  page.get_by_role('button',name='Function explorer',exact=True).click()
  page.locator('#runButton').click()
  page.locator('#saveButton').click()
  print('save click executed (localStorage may be unavailable on about:blank)')
  page.screenshot(path=str(Path(root)/'browser-smoke-preview.png'),full_page=True)
  print('errors:',errors)
  browser.close()
finally:
 pass
