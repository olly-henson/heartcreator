"""Sharp laptop POV images for the Plan of action (2026-11-09).
Puts a screenshot on 'pov laptop.jpg' at 3x scale, adds optional purple highlight boxes (screenshot pixel coords),
then crops in so the screen fills the image. Usage: python -I tools/laptop_pov_hq.py SHOT.png OUT.jpg "x0,y0,x1,y1;..." [arrow_side]"""
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFilter
R='C:/Users/Olly/AI OS/heartattractor/'
src=open(R+'tools/pov_composite.py',encoding='utf-8').read(); ns={'__name__':'x'}; exec(src.split("phone, pq, pm, pn = base(")[0], ns)
shot, out = sys.argv[1], sys.argv[2]; boxes=[tuple(map(int,b.split(','))) for b in (sys.argv[3].split(';') if len(sys.argv)>3 and sys.argv[3] else [])]
K=3; P=(124,58,237)
bg,q,m,n=ns['base']('pov laptop'); bg=bg.resize((bg.width*K,bg.height*K),Image.LANCZOS); m=m.filter(ImageFilter.MinFilter(3)).resize(bg.size,Image.BILINEAR); q=[(x*K,y*K) for x,y in q]
(tlx,tly),(trx,try_),(brx,bry),(blx,bly)=q; qa=((trx-tlx)+(brx-blx))/((bly-tly)+(bry-try_))
sh=Image.open(shot).convert('RGB'); w,h=sh.size
H=max(h,int(w/qa)); W=int(H*qa); c0=Image.new('RGB',(W,H),sh.getpixel((2,h-2))); ox=(W-w)//2; c0.paste(sh,(ox,0))
S2=2; c0=c0.resize((W*S2,H*S2),Image.LANCZOS); d=ImageDraw.Draw(c0)
for (x0,y0,x1,y1) in boxes:
    bx=[(x0+ox)*S2,y0*S2,(x1+ox)*S2,y1*S2]
    d.rounded_rectangle(bx,radius=10*S2,outline='white',width=9*S2); d.rounded_rectangle(bx,radius=10*S2,outline=P,width=5*S2)
w,h=c0.size; cf=ns['coeffs'](q,[(0,0),(w,0),(w,h),(0,h)])
warped=c0.transform(bg.size,Image.PERSPECTIVE,cf,Image.BICUBIC); im=bg.copy(); im.paste(warped,(0,0),m)
a=np.asarray(im).astype(int); lim=np.maximum(a[...,0],a[...,2])+8; a[...,1]=np.where(a[...,1]>lim,lim,a[...,1]); im=Image.fromarray(a.clip(0,255).astype('uint8'))  # green despill
# curved purple arrow to each box (Olly 2026-11-09: "highlight and arrow them")
import math
fw=ns['coeffs']([(0,0),(w,0),(w,h),(0,h)], q)
def fwd(x,y):
    a1,b1,c1,d1,e1,f1,g1,h1=fw; den=g1*x+h1*y+1; return ((a1*x+b1*y+c1)/den,(d1*x+e1*y+f1)/den)
dd=ImageDraw.Draw(im); U=bg.width/900
for (x0,y0,x1,y1) in boxes:
    if len(sys.argv)>4 and sys.argv[4]=='top':
        tx,ty=fwd((x0+x1)/2*S2+ox*S2+60*S2,y0*S2); sx,sy=tx+110*U,ty-105*U; cx_,cy_=tx+100*U,ty-20*U
    else:
        tx,ty=fwd((x0+ox)*S2,(y0+y1)/2*S2); sx,sy=tx-115*U,ty-95*U; cx_,cy_=sx+8*U,ty-8*U
    pts=[((1-t)**2*sx+2*(1-t)*t*cx_+t*t*tx-6*U*t*t,(1-t)**2*sy+2*(1-t)*t*cy_+t*t*ty) for t in [i/40 for i in range(41)]]
    ang=math.atan2(pts[-1][1]-pts[-5][1],pts[-1][0]-pts[-5][0]); ex,ey=pts[-1]
    def head(L,aa=0.5): return [(ex+6*U*math.cos(ang),ey+6*U*math.sin(ang)),(ex-L*math.cos(ang-aa),ey-L*math.sin(ang-aa)),(ex-L*math.cos(ang+aa),ey-L*math.sin(ang+aa))]
    dd.line(pts,fill='white',width=int(12*U),joint='curve'); dd.polygon(head(28*U),fill='white')
    dd.line(pts,fill=P,width=int(6*U),joint='curve'); dd.polygon(head(19*U),fill=P)
xs=[p[0] for p in q]; ys=[p[1] for p in q]; pw=max(xs)-min(xs); ph=max(ys)-min(ys); cx=(max(xs)+min(xs))/2
cw=pw*1.85; chh=cw/1.333; top=min(ys)-ph*0.16
crop=im.crop((int(cx-cw/2),int(top),int(cx+cw/2),int(top+chh))); crop.thumbnail((1200,1200)); crop.save(out,quality=88)
