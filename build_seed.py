# Usage: python3 scripts/build_seed.py path/to/Budgeting_Anniv_GX_27TH.xlsx [app.js]
# Reads sheet "EDIT DISINI" (Divisi Acara, rows 3–79) and writes the built-in budget data
# into app.js between /*BUDGET_SEED_START*/ and /*BUDGET_SEED_END*/.
# After deploying, admins see "Data budget sheet terbaru tersedia → Terapkan" on the Finance page.
# Requires: pip install openpyxl
import openpyxl, json, re, sys, os, hashlib, datetime
src = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'app.js')
wv = openpyxl.load_workbook(src, data_only=True)['EDIT DISINI']
wf = openpyxl.load_workbook(src)['EDIT DISINI']
def v(r, c):  # c: column letter
    x = wv[f'{c}{r}'].value
    if isinstance(x, str): x = x.replace('⁠', '').strip()
    return x if x != '' else None
def num(x):
    return None if x is None else (int(x) if float(x).is_integer() else float(x))
def dp_fee(r):
    """Split DP Total formula like =A+2500 into (amount, fee)."""
    f = wf[f'N{r}'].value
    if isinstance(f, str) and f.startswith('='):
        parts = [float(p) for p in f[1:].split('+')]
        fee = sum(p for p in parts if p == 2500); amt = sum(p for p in parts if p != 2500)
        return num(amt), num(fee)
    return num(v(r, 'N')), None
def mask(s):
    if not s: return s
    s = re.sub(r'\b126 085135700431\b', '[no. VA disembunyikan — lihat sheet]', s)
    s = re.sub(r'\b1440000079001\b', '[no. rek. disembunyikan — lihat sheet]', s)
    return s
recs = []
def add(**k):
    base = dict(key=None, parent=None, sheetRow=None, item='', workstream='', qty=None, unit='', unitCost=None, estimated=None,
                invoice=None, dp=None, fee=None, paidAmount=None, paymentDeadline='', invoiceStatus='Unsubmitted',
                paymentStatus='Pending Payment', receipt='', invoiceRef='', notes='', kind='', task=None, source='confirmed', verifyNote='')
    base.update(k); recs.append(base); return base
def status(r):
    s = (v(r, 'L') or '').strip()
    if s == 'Full Paid': return 'Submitted', 'Full Paid'
    if s == 'DP Paid': return 'Submitted', 'DP Paid'
    if s == 'Submitted': return 'Submitted', 'Pending Payment'
    return 'Unsubmitted', 'Pending Payment'
def line(r, ws, task=None, parent=None, **extra):
    inv_s, pay_s = status(r) if parent is None else ('Unsubmitted', 'Pending Payment')
    d = dict(sheetRow=r, item=v(r, 'C'), workstream=ws, qty=num(v(r, 'D')), unit=v(r, 'E') or '', unitCost=num(v(r, 'F')),
             estimated=num(v(r, 'G')), notes=mask(v(r, 'I') if isinstance(v(r, 'I'), str) else '') or '', invoiceRef=(v(r, 'J') or '') if isinstance(v(r,'J'), str) else '',
             receipt=v(r, 'P') or '', invoiceStatus=inv_s, paymentStatus=pay_s, task=task, parent=parent)
    if parent is None:
        if v(r, 'M') is not None: d['invoice'] = num(v(r, 'M'))
        a, fee = dp_fee(r)
        if a is not None:
            if pay_s == 'DP Paid': d['dp'] = a
            else: d['paidAmount'] = a
            d['fee'] = fee
    d.update(extra); return add(**d)

T_CONNECT = 'Procurement · GX Connect (Kodak, print, frame, cash fund)'
# GX Connect — OJISAN invoice covers Kodak + printing (sheet INV Total row 3 = 7.920.000 + 2.100.000)
a, fee = dp_fee(3)
add(key='ojisan', sheetRow=3, item='OJISAN — Kodak + Soft/Hard Copy Printing', workstream='GX Connect', kind='vendor',
    invoice=num(v(3, 'M')), paidAmount=a, fee=fee, invoiceStatus='Submitted', paymentStatus='Full Paid', receipt=v(3, 'P'),
    invoiceRef=v(3, 'J'), notes=v(3, 'I'), task=T_CONNECT,
    verifyNote='INV Total baris 3 (10.020.000) = Kodak + Printing, jadi dicatat sebagai satu invoice vendor.')
line(3, 'GX Connect', parent='ojisan', notes='', invoiceRef='', receipt='')
line(4, 'GX Connect', parent='ojisan', receipt='')
line(5, 'GX Connect', task=T_CONNECT, notes='Kolom Pelunasan: Full Payment')
line(6, 'GX Connect', task=T_CONNECT, notes='Cash · Kolom Pelunasan: Full Payment', source='verify',
     verifyNote='Kolom Pelunasan "Full Payment" tapi Payment Status "Submitted" — konfirmasi sudah dibayar atau belum.')
line(7, 'GX Access Point', task='Paper wristbands', notes='', invoice=750000, source='verify',
     verifyNote='Invoice 750.000 diambil dari kolom Note (angka). Invoice gabungan "INV Gelang + Kartu Game".')
line(8, 'GX Game Pass', task='Procurement · GX Game Pass (card & stamp)', invoice=1187500,
     notes='Kartu Game: 1.187.500 · ' + mask(v(9, 'I')) + ' (status baris 9: Submitted)', source='verify',
     verifyNote='Invoice 1.187.500 diambil dari kolom Note. Invoice gabungan "INV Gelang + Kartu Game".')
line(10, 'GX Game Pass', task='Procurement · GX Game Pass (card & stamp)')
line(11, 'GX Got Talent', task='GX Got Talent · Budget Top 5 Team')
line(12, 'Activation', task='DIY tote bag design & package')
add(sheetRow=13, item='Sticker DTF', workstream='Activation', task='DTF sticker design', source='verify',
    verifyNote='Baris 13 hanya berisi "Sticker DTF:" di kolom Note, tanpa nominal.')
line(14, 'Activation', task='Vendor · Face Painting & Tarot Reader')
line(15, 'Activation', task='Vendor · Face Painting & Tarot Reader')
# Games — vendor invoices with line items
line(16, 'Games', key='bali', kind='vendor', item='Bali Games Rental', task='Bali Games rental coordination', notes='DP 50%')
for r in range(17, 26): line(r, 'Games', parent='bali')
line(26, 'Games', key='bumi', kind='vendor', item='BUMI Creative', task='BUMI Creative game equipment coordination', notes='DP 50%')
for r in range(27, 31): line(r, 'Games', parent='bumi')
line(31, 'Competition', task='Vendor · HYROX full service (Ultrafit)', paymentDeadline='2026-11-14')
for r in range(32, 36): line(r, 'Entertainment', task='Vendor · Entertainment (band, MC, DJ)')
line(36, 'Winners', task='Winners & Xtreme Award landscape foamboards')
for r in range(37, 50): line(r, 'Hadiah Lomba dan Team Building', task='Hadiah pemenang lomba & team building')
# Doorprize — one disbursement (8.880.000 to Marketing) covering all items
a, fee = dp_fee(51)
add(key='door', sheetRow=50, item='Doorprize — dana dicairkan ke rekening Marketing (belanja Shopee)', workstream='Doorprize', kind='vendor',
    invoice=num(v(51, 'M')), paidAmount=a, fee=fee, invoiceStatus='Submitted', paymentStatus='Full Paid', receipt=v(50, 'P'),
    notes=mask(v(51, 'I')), task='Doorprize procurement')
tier = ''
for r in range(51, 74):
    if v(r, 'D') is None and v(r, 'C'): tier = v(r, 'C'); continue
    line(r, 'Doorprize', parent='door', notes=(tier + (' · ' if tier else '')) + ('' if r != 51 else ''), invoiceRef='', receipt='',
         paymentStatus=status(r)[1] if v(r, 'L') else 'Pending Payment')
# Emergency Fund — allocation with spending lines from the Note column
add(key='emerg', sheetRow=74, item='Emergency Fund — Lain-lain', workstream='Emergency Fund', kind='allocation', qty=1, unit='Pack',
    unitCost=num(v(74, 'F')), estimated=num(v(74, 'G')), task='Alokasi Emergency Fund',
    notes='Alokasi dana; pemakaian dicatat sebagai baris di bawahnya.')
add(parent='emerg', sheetRow=74, item='Mobile Legends — Event Esport Service', workstream='Emergency Fund', invoice=5000000,
    invoiceStatus='Submitted', paymentStatus='Full Paid', invoiceRef=v(74, 'J'), receipt=v(74, 'P'), notes='Note sheet: Mobile Legend 5.000.000',
    source='verify', verifyNote='Nominal 5.000.000 dari kolom Note. Status Full Paid tapi transfer tidak tercatat di kolom DP Total sheet.')
add(parent='emerg', sheetRow=75, item='Acrylic A4 (Registrasi, Face Painting, DIY)', workstream='Emergency Fund', qty=3, unit='Pcs', invoice=156080,
    invoiceStatus='Submitted', invoiceRef=v(75, 'J'), notes=v(75, 'I'), source='verify', verifyNote='Nominal dari kolom Note.')
add(parent='emerg', sheetRow=76, item='Anniv Ceremony — Smoke Color Celebration', workstream='Emergency Fund', invoice=58500,
    invoiceStatus='Submitted', invoiceRef=v(76, 'J'), notes=v(76, 'I'), source='verify', verifyNote='Nominal dari kolom Note.')
add(parent='emerg', sheetRow=77, item='Anniv Ceremony — Air Honk', workstream='Emergency Fund', notes=v(77, 'I'),
    source='verify', verifyNote='Nominal belum ada di sheet.')
add(parent='emerg', sheetRow=78, item='Anniv Ceremony — Balon Tepuk', workstream='Emergency Fund', invoice=1350000, dp=675000,
    invoiceStatus='Submitted', invoiceRef=v(78, 'J'), notes=v(78, 'I'), source='verify',
    verifyNote='Invoice & DP 50% dari kolom Note. Status sheet "Submitted" → DP dianggap belum dibayar.')
add(parent='emerg', sheetRow=79, item='Sample Gelang dan Card', workstream='Emergency Fund', notes=v(79, 'I'),
    source='verify', verifyNote='Tanpa nominal & status di sheet.')
for r in recs:
    for k in ('notes', 'invoiceRef', 'receipt'):
        if r[k]: r[k] = r[k].strip()
items_json = json.dumps(recs, ensure_ascii=False, sort_keys=True)
meta = dict(sheet='EDIT DISINI', division='Acara', rows='3–79', snapshot=datetime.date.today().isoformat(),
            file=re.sub(r'^[0-9a-f]{8}-', '', os.path.basename(src)), hash=hashlib.sha1(items_json.encode()).hexdigest()[:12],
            sheetSubTotal=wv['I83'].value, sheetTransferred=wv['J83'].value, sheetRemaining=wv['K83'].value,
            url='https://docs.google.com/spreadsheets/d/1-6E2tecKu3eUOzAKM1xRfm7rfmjFb-ynQYEhlvz_K6w/edit')
payload = json.dumps(dict(meta=meta, items=recs), ensure_ascii=False)
code = open(out, encoding='utf-8').read()
pat = re.compile(r'/\*BUDGET_SEED_START\*/.*?/\*BUDGET_SEED_END\*/', re.S)
if not pat.search(code): sys.exit('Marker /*BUDGET_SEED_START*/ ... /*BUDGET_SEED_END*/ tidak ditemukan di ' + out)
code = pat.sub(lambda m: '/*BUDGET_SEED_START*/' + payload + '/*BUDGET_SEED_END*/', code, count=1)
open(out, 'w', encoding='utf-8').write(code)
print(len(recs), 'records', meta)
