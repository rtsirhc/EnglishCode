from pathlib import Path
import json,html
ROOT=Path(__file__).resolve().parents[1]
PALETTE={'mystery':('#182b43','#edbb75'),'science':('#143b35','#bce88a'),'show':('#38296a','#f3b9da'),'space':('#202f50','#c6c7ff'),'world':('#144f60','#9ae0c5'),'adventure':('#36503c','#e4dd96'),'auction':('#643744','#ffc18c'),'ocean':('#173b6b','#9bdce9'),'time':('#4a3e69','#dfc7f0'),'words':('#b44c32','#f9d58f'),'sport':('#245a42','#c8ec90'),'food':('#844531','#ffce88'),'health':('#245355','#c4ebe5'),'sound':('#514378','#edb2cd')}
for game in json.loads((ROOT/'catalog/games.json').read_text())['games']:
 bg,accent=PALETTE[game['theme']];theme=game['theme'];art=''
 if theme in ['mystery','adventure']:
  art='<path d="M110 72L288 57L298 216L120 230Z" fill="#fff" opacity=".92"/><path d="M131 101L245 90M135 120L257 109M139 140L227 132" stroke="'+bg+'" stroke-width="7" opacity=".3"/><circle cx="324" cy="163" r="48" fill="none" stroke="'+accent+'" stroke-width="15"/><path d="M359 198L400 239" stroke="'+accent+'" stroke-width="18" stroke-linecap="round"/><circle cx="324" cy="163" r="30" fill="#fff" opacity=".12"/>'
 elif theme in ['words','auction','show']:
  art=''.join(f'<g transform="translate({x} {y}) rotate({a} 40 45)"><rect width="80" height="90" rx="12" fill="{c}"/><text x="40" y="62" text-anchor="middle" font-family="Arial,sans-serif" font-size="50" font-weight="800" fill="{bg}">{letter}</text></g>' for x,y,a,c,letter in [(92,107,-14,accent,'A'),(206,63,7,'#ffffff','B'),(315,121,15,accent,'C')])
 elif theme=='sport':
  art='<rect x="78" y="55" width="344" height="190" rx="12" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="3"/><path d="M250 55V245M78 105H127V195H78M422 105H373V195H422" stroke="#fff" stroke-opacity=".45" fill="none" stroke-width="3"/><circle cx="250" cy="150" r="45" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="3"/><circle cx="275" cy="157" r="46" fill="'+accent+'"/><path d="M275 133L295 148L288 171H262L255 148Z" fill="'+bg+'"/>'
 elif theme in ['time','world']:
  art='<circle cx="250" cy="150" r="94" fill="'+accent+'"/>'
  if theme=='time':art+='<circle cx="250" cy="150" r="77" stroke="'+bg+'" stroke-opacity=".3" stroke-width="3" fill="none"/><path d="M250 91V150L295 176" stroke="'+bg+'" stroke-width="12" fill="none" stroke-linecap="round"/><circle cx="250" cy="150" r="9" fill="'+bg+'"/>'
  else:art+='<ellipse cx="250" cy="150" rx="45" ry="94" stroke="'+bg+'" stroke-width="3" fill="none"/><path d="M156 150H344M173 100H327M173 200H327" stroke="'+bg+'" stroke-width="3" opacity=".7"/>'
 elif theme in ['health','science']:
  art='<g transform="rotate(-16 250 150)"><rect x="139" y="78" width="222" height="148" rx="28" fill="'+accent+'"/><path d="M250 108V194M207 151H293" stroke="'+bg+'" stroke-width="22" stroke-linecap="round"/></g>'
 elif theme=='sound':
  art=''.join(f'<rect x="{125+i*34}" y="{150-h/2}" width="18" height="{h}" rx="9" fill="{accent}"/>' for i,h in enumerate([38,85,130,180,100,145,60,30]))
 elif theme=='food':
  art='<ellipse cx="250" cy="160" rx="116" ry="80" fill="'+accent+'"/><ellipse cx="250" cy="160" rx="84" ry="55" fill="none" stroke="'+bg+'" stroke-opacity=".3" stroke-width="3"/><path d="M110 82V222M91 84V124Q110 144 129 124V84M384 82V222M384 82Q351 133 384 149" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>'
 else:
  art='<path d="M250 55Q307 108 290 184L250 226L210 184Q193 108 250 55Z" fill="'+accent+'"/><circle cx="250" cy="135" r="26" fill="'+bg+'"/><path d="M210 162L175 210L214 201M290 162L325 210L286 201" fill="#fff"/><path d="M236 224L250 263L264 224" fill="'+accent+'"/>'
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300" role="img" aria-label="{html.escape(game["title"])} illustration"><rect width="500" height="300" fill="{bg}"/><circle cx="447" cy="20" r="130" fill="{accent}" opacity=".08"/><circle cx="20" cy="300" r="130" fill="{accent}" opacity=".08"/><path d="M32 40H47M39.5 32.5V47.5M449 247H464M456.5 239.5V254.5" stroke="{accent}" stroke-width="3"/>{art}</svg>'
 (ROOT/f'gallery/covers/{game["id"]}.svg').write_text(svg)
print('Created cover illustrations')
