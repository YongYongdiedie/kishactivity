"""Usage: python3 tools/import_xlsx.py /path/to/reviewed.xlsx (standard library only)."""
import sys, json, zipfile, xml.etree.ElementTree as ET, re, hashlib, datetime
from pathlib import Path
NS={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
def convert(path):
    with zipfile.ZipFile(path) as z:
        ss=[''.join(t.itertext()) for t in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si',NS)] if 'xl/sharedStrings.xml' in z.namelist() else []
        wb=ET.fromstring(z.read('xl/workbook.xml'))
        sheet=next(s for s in wb.find('m:sheets',NS) if s.attrib['name'].strip()=='학생활동목록')
        rid=sheet.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']
        target=next(r.attrib['Target'] for r in ET.fromstring(z.read('xl/_rels/workbook.xml.rels')) if r.attrib['Id']==rid)
        target=target.lstrip('/') if target.startswith('/') else 'xl/'+target
        parsed=[]
        for row in ET.fromstring(z.read(target)).findall('m:sheetData/m:row',NS):
            vals={}
            for c in row:
                v=c.find('m:v',NS); val=v.text if v is not None else ''
                if c.attrib.get('t')=='s': val=ss[int(val)]
                elif c.attrib.get('t')=='inlineStr': val=''.join(c.find('m:is',NS).itertext())
                vals[re.sub(r'\d','',c.attrib['r'])]=val or ''
            parsed.append(vals)
    headers={v:k for k,v in parsed[0].items()}; required=['활동명','대범주','예상 진행시기','주분야','연관분야','활동방식']
    for h in required:
        if h not in headers: raise ValueError('필수 열 없음: '+h)
    records=[]; seen={}
    for r in parsed[1:]:
        get=lambda h:r.get(headers.get(h,''),'').strip()
        if not get('활동명'): continue
        schedule=get('예상 진행시기')
        if re.fullmatch(r'\d{5}(?:\.0)?',schedule):
            date=datetime.datetime(1899,12,30)+datetime.timedelta(days=float(schedule))
            schedule=f'{date.year}년 {date.month}월'
        identity=get('활동명')+'|'+get('주관부서'); seen[identity]=seen.get(identity,0)+1
        key=hashlib.sha256((identity+'|'+str(seen[identity])).encode()).hexdigest()[:16]
        split=lambda s:[x.strip() for x in s.split('/') if x.strip()]
        records.append(dict(id=key,name=get('활동명'),category=get('대범주'),subcategory=get('소범주'),track=get('계열구분'),department=get('주관부서'),pages=get('근거 쪽수(인쇄 페이지)'),schedule=schedule,primary=get('주분야') or '분야공통·주제미정',related=split(get('연관분야')),methods=split(get('활동방식')),note=get('분류메모')))
    return records
if __name__=='__main__':
    records=convert(sys.argv[1]); dest=Path(__file__).resolve().parents[1]/'data.js'
    dest.write_text('window.KISH_DATA = '+json.dumps(records,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
    print(f'{len(records)}개 활동 → {dest}')
